export interface Record {
  id: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  text: string;
  date: string;
  repeat?: boolean;
  frequency?: "none" | "daily" | "weekly" | "monthly";
}
