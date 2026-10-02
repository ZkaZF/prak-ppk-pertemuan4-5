export type TransactionTypeEnum = "income" | "expense";

export interface TransactionInput {
  type: TransactionTypeEnum;
  amount: number;
  category?: string;
  description?: string;
  date?: string; // ISO string, opsional (default: now)
}

export interface TransactionResponse {
  id: string;
  type: TransactionTypeEnum;
  amount: number;
  category: string | null;
  description: string | null;
  date: string;
  createdAt: string;
  userId: string;
}
