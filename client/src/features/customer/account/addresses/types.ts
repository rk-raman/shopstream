export type AddressType = "home" | "work";

export interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
  alternatePhone?: string;
  addressType: AddressType;
  isDefault: boolean;
}
