export type TransactionDataType = {
  id: number;
  fullName: string;
  student_id: string | number;
  reference_id: string;
  payment_id: string;
  purpose: string;
  status: string;
  expires_at: Date;
  created_at: Date;
  userType: string;
};

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info" | undefined;
}