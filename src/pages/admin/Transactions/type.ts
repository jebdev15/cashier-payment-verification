export type TransactionDataType = {
    id?: string;
    student_account_id?: string;
    reference_id?: string;
    student_id?: string;
    name_of_payor?: string;
    email?: string;
    program_code?: string;
    year_level_roman?: string;
    school_year?: string;
    semester?: string;
    mode_of_payment?: string;
    amount?: number;
    balance?: number;
    amount_paid?: number;
    particulars?: string;
    purpose?: string;
    payment_id?: string;
    status?: string;
    expires_at?: Date;
    created_at?: Date;
    filePath?: string;
    userType?: string;
    checkedItems?: string[];
    entryMode?: string;
    details?: string;
    remarks?: string;
    amountToPay?: number;
    amountTendered?: number;
    selectedAccount?: string;
    miscellaneousFees?: any[];
};

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info" | undefined;
}