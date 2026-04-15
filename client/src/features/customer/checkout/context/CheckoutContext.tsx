"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import checkoutService from "../services/checkoutService";
import {
  CheckoutSession,
  CheckoutStep,
  PaymentMethodType,
  StepState,
} from "../types";

interface CheckoutContextValue {
  session: CheckoutSession | null;
  isLoading: boolean;
  error: string | null;
  orderPlaced: boolean;
  orderData: any | null;

  // Step management
  activeStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  steps: StepState[];
  goToStep: (step: CheckoutStep) => void;

  // Actions
  initSession: () => Promise<void>;
  selectAddress: (addressData: any) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  selectPaymentMethod: (method: PaymentMethodType) => Promise<void>;
  placeOrder: (paymentData?: any) => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

const STEP_ORDER: CheckoutStep[] = ["login", "address", "summary", "payment"];

const STEP_LABELS: Record<CheckoutStep, string> = {
  login: "LOGIN",
  address: "DELIVERY ADDRESS",
  summary: "ORDER SUMMARY",
  payment: "PAYMENT OPTIONS",
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<CheckoutStep>("login");
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);

  // Build step states for the accordion
  const steps: StepState[] = STEP_ORDER.map((step, index) => {
    const isCompleted = completedSteps.includes(step);
    let summary: string | undefined;

    if (isCompleted && session) {
      switch (step) {
        case "login":
          summary = `${session.user.firstName} ${session.user.lastName} — ${session.user.email}`;
          break;
        case "address":
          if (session.deliveryAddress) {
            const addr = session.deliveryAddress;
            summary = `${addr.fullName}, ${addr.addressLine1}, ${addr.city} - ${addr.pincode}`;
          }
          break;
        case "summary":
          summary = `${session.items.length} item(s)`;
          break;
      }
    }

    return {
      step,
      label: STEP_LABELS[step],
      number: index + 1,
      isActive: activeStep === step,
      isCompleted,
      summary,
    };
  });

  const goToStep = useCallback((step: CheckoutStep) => {
    setActiveStep(step);
  }, []);

  const markStepCompleted = useCallback(
    (step: CheckoutStep) => {
      setCompletedSteps((prev) => {
        if (prev.includes(step)) return prev;
        return [...prev, step];
      });
      // Auto-advance to next step
      const currentIndex = STEP_ORDER.indexOf(step);
      if (currentIndex < STEP_ORDER.length - 1) {
        setActiveStep(STEP_ORDER[currentIndex + 1]);
      }
    },
    []
  );

  // Initialize checkout session
  const initSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await checkoutService.createSession();
      if (response.success && response.data?.session) {
        const sess = response.data.session;
        setSession(sess);

        // Login step is auto-completed since user is authenticated
        setCompletedSteps(["login"]);

        // If session already has an address, mark address as complete
        if (sess.deliveryAddress?.fullName) {
          setCompletedSteps(["login", "address"]);
          setActiveStep("summary");
        } else {
          setActiveStep("address");
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select delivery address
  const selectAddress = useCallback(
    async (addressData: any) => {
      if (!session) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await checkoutService.setAddress(
          session._id,
          addressData
        );
        if (response.success && response.data?.session) {
          setSession(response.data.session);
          markStepCompleted("address");
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [session, markStepCompleted]
  );

  // Apply coupon
  const applyCoupon = useCallback(
    async (code: string) => {
      if (!session) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await checkoutService.applyCoupon(session._id, code);
        if (response.success && response.data?.session) {
          setSession(response.data.session);
          toast.success("Coupon applied!");
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  // Remove coupon
  const removeCoupon = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);

    try {
      const response = await checkoutService.removeCoupon(session._id);
      if (response.success && response.data?.session) {
        setSession(response.data.session);
        toast.success("Coupon removed");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Select payment method and continue to order summary
  const selectPaymentMethod = useCallback(
    async (method: PaymentMethodType) => {
      if (!session) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await checkoutService.initiatePayment(
          session._id,
          method
        );
        if (response.success && response.data?.session) {
          setSession(response.data.session);
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  // Place order (confirm payment)
  const placeOrder = useCallback(
    async (paymentData: any = {}) => {
      if (!session) return;
      setIsLoading(true);
      setError(null);

      try {
        let response;

        if (
          session.selectedPaymentMethod === "cod" ||
          paymentData.method === "cod"
        ) {
          response = await checkoutService.placeCODOrder(session._id);
        } else {
          response = await checkoutService.confirmPayment(
            session._id,
            paymentData
          );
        }

        if (response.success && response.data) {
          setOrderData(response.data.order);
          setOrderPlaced(true);
          markStepCompleted("summary");
          markStepCompleted("payment");
          toast.success("Order placed successfully!");
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [session, markStepCompleted]
  );

  return (
    <CheckoutContext.Provider
      value={{
        session,
        isLoading,
        error,
        orderPlaced,
        orderData,
        activeStep,
        completedSteps,
        steps,
        goToStep,
        initSession,
        selectAddress,
        applyCoupon,
        removeCoupon,
        selectPaymentMethod,
        placeOrder,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
