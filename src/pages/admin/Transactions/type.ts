export type TransactionDataType = {
    id?: string;
    studentAccountId?: string;
    reference_id?: string;
    reference_number?: string;
    e_or?: string;
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
    accountType?: string;
    details?: string;
    remarks?: string;
    amountToPay?: number;
    amountTendered?: number;
    amount_to_pay?: string;
    amount_tendered?: string;
    selectedAccount?: string;
    miscellaneousFees?: any[];
    distribution?: { miscellaneous: number; tuition: number; totalPayable: number; accountsPayable: number; };
};

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info" | undefined;
}

export type TransactionModalEntryModeType = {
    entry_mode_id: number;
    entry_mode_title: string;
    entry_mode_desc: string;
    credit: string;
    debit: string;
}