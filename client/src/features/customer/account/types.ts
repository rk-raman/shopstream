// client/src/features/customer/account/types.ts

// client/src/features/customer/account/types/address.ts

/**
 * Address type as stored in the backend
 */
export type AddressType = "home" | "work" | "other";

/**
 * Geographic coordinates for location-based services
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Complete address interface matching the backend schema
 */
export interface Address {
  _id: string;
  type: AddressType;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  landmark?: string;
  isDefault: boolean;
  coordinates?: Coordinates;
  createdAt: string;
  updatedAt: string;
}

/**
 * Formatted address response from backend methods
 */
export interface FormattedAddress {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: AddressType;
  isDefault: boolean;
  coordinates?: Coordinates;
}

/**
 * Payload for creating a new address
 */
export interface CreateAddressPayload {
  type: AddressType;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  phone: string;
  landmark?: string;
  isDefault?: boolean;
  coordinates?: Coordinates;
}

/**
 * Payload for updating an existing address
 */
export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {
  _id: string;
}

/**
 * Address validation errors
 */
export interface AddressValidationError {
  field: keyof CreateAddressPayload;
  message: string;
}

/**
 * Address list response
 */
export interface AddressListResponse {
  addresses: Address[];
  defaultAddress?: Address;
}

/**
 * Address form data (for frontend forms)
 */
export interface AddressFormData {
  type: AddressType;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  landmark: string;
  isDefault: boolean;
}

/**
 * Address display props (for UI components)
 */
export interface AddressDisplayProps {
  address: Address | FormattedAddress;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  showActions?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "delivered" | "shipped" | "processing" | "cancelled";
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
}
