import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

const faqs = [
  {
    question: "How do I update my profile information?",
    answer:
      'Click the "Edit" button at the top right, make your changes, and click "Save" to update your information.',
  },
  {
    question: "Can I change my email address?",
    answer:
      "For security reasons, email addresses cannot be changed. If you need to use a different email, please contact our support team.",
  },
  {
    question: "What happens when I update my phone number?",
    answer:
      "Your phone number will be updated across all your orders and you'll receive all order-related notifications on your new number. You may need to verify the new number.",
  },
  {
    question: "Is my information secure?",
    answer:
      "Yes, we use industry-standard encryption to protect your personal information and never share it with third parties without your consent.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "You can delete your account from the Account Settings section. Please note that this action is permanent and cannot be undone. All your data including orders, addresses, and wishlist will be permanently deleted.",
  },
];

export default function FAQSection({
  title = "Frequently Asked Questions",
}: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
          >
            <button
              className="flex justify-between items-center w-full text-left"
              onClick={() => toggleFAQ(index)}
            >
              <h4 className="font-medium text-gray-900">{faq.question}</h4>
              <span className="text-gray-500 text-sm">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>

            {openIndex === index && (
              <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
