export type CardCategory = "manufacturer" | "wholesaler" | "retailer" | "supplier" | "vvip";

export interface CardData {
  serial_number: number;
  company_name: string;
  owner_name: string;
  designation: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  phone_numbers: string[];
  email: string;
  website: string;
  category: CardCategory;
}
