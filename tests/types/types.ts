export interface Customer {
  firstName: string;
  lastName: string;
  postCode: string;
}

export interface Account {
  customerName: string;
  currency: string;
}

export interface Transaction {
  date: string;
  amount: string;
  type: string;
}

export interface DepositData {
  amount: string;
  description?: string;
}

export interface WithdrawData {
  amount: string;
  description?: string;
}

export interface ErrorMessage {
  [key: string]: string;
}