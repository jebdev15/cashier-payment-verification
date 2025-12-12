export type TransactionDataType = {
    id?: string;
    studentAccountId?: string;
    referenceId?: string;
    referenceNumber?: string;
    eOr?: string;
    studentId?: string;
    payor?: string;
    email?: string;
    programCode?: string; // was program_code
    yearLevelRoman?: string; // was year_level_roman
    schoolYear?: string; // was school_year
    semester?: string;
    modeOfPayment?: string; // was mode_of_payment
    amount?: number;
    balance?: number;
    amountPaid?: number; // was amount_paid
    particulars?: string;
    purpose?: string;
    paymentId?: string; // was payment_id
    status?: string;
    expiresAt?: Date; // was expires_at
    createdAt?: Date; // was created_at
    filePath?: string;
    userType?: string;
    checkedItems?: string[];
    accountType?: string;
    details?: string;
    remarks?: string;
    // merged numeric and string variants into unions where duplicates existed
    amountToPay?: number | string; // merged amountToPay (number) and amount_to_pay (string)
    amountTendered?: number | string; // merged amountTendered (number) and amount_tendered (string)
    selectedAccount?: string;
    miscellaneousFees?: any[];
    distribution?: { miscellaneous: number; tuition: number; totalPayable: number; accountsPayable: number; };
    payorParticulars?: string | any[]; // Particulars selected by payor during upload
    adminParticulars?: number[]; // Particulars selected by admin during approval
    entryMode?: string;
};

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info" | undefined;
}