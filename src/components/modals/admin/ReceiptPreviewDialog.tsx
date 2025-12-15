import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Box,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import { TransactionDataType } from "@/pages/admin/Transactions/type";

type Props = {
    open: boolean;
    onClose: () => void;
    data: TransactionDataType | null;
    eorNumber?: string;
    adminParticulars?: any[];
    campusName?: string;
    campusLocation?: string;
};

const ReceiptPreviewDialog: React.FC<Props> = ({
    open,
    onClose,
    data,
    eorNumber,
    adminParticulars = [],
    campusName = "University of Eastern Philippines",
    campusLocation = "University Town, Catarman, Northern Samar",
}) => {
    const printRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Official Receipt - ${eorNumber || data?.eorNumber || 'Preview'}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            color: #000;
                        }
                        .receipt-container {
                            max-width: 800px;
                            margin: 0 auto;
                            border: 2px solid #000;
                            padding: 20px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .header h1 {
                            margin: 5px 0;
                            font-size: 18px;
                            font-weight: bold;
                        }
                        .header p {
                            margin: 2px 0;
                            font-size: 12px;
                        }
                        .section-title {
                            font-weight: bold;
                            font-size: 14px;
                            margin-top: 15px;
                            margin-bottom: 10px;
                            border-bottom: 1px solid #000;
                            padding-bottom: 3px;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 5px 0;
                            font-size: 12px;
                        }
                        .info-label {
                            font-weight: bold;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 10px 0;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 8px;
                            text-align: left;
                            font-size: 11px;
                        }
                        th {
                            background-color: #f0f0f0;
                            font-weight: bold;
                        }
                        .total-row {
                            font-weight: bold;
                            background-color: #f9f9f9;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 10px;
                            text-align: center;
                            font-style: italic;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const formatCurrency = (value: number | string | undefined) => {
        const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
        return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date: string | Date | undefined) => {
        if (!date) return "N/A";
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getParticularsText = () => {
        if (adminParticulars && adminParticulars.length > 0) {
            return adminParticulars.map(p => p.particular_name || p.name || p).join(', ');
        }
        return data?.particulars || "N/A";
    };

    const numberToWords = (num: number): string => {
        if (num === 0) return "ZERO";
        
        const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
        const teens = ["TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
        const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
        
        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return "";
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
            return ones[Math.floor(n / 100)] + " HUNDRED" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "");
        };
        
        if (num < 1000) return convertLessThanThousand(num);
        if (num < 1000000) {
            return convertLessThanThousand(Math.floor(num / 1000)) + " THOUSAND" + 
                   (num % 1000 !== 0 ? " " + convertLessThanThousand(num % 1000) : "");
        }
        return convertLessThanThousand(Math.floor(num / 1000000)) + " MILLION" + 
               (num % 1000000 !== 0 ? " " + convertLessThanThousand(num % 1000000) : "");
    };

    const getAmountInWords = () => {
        const amount = typeof data?.amountTendered === 'string' 
            ? parseFloat(data.amountTendered) 
            : (data?.amountTendered || 0);
        
        const pesoPart = Math.floor(amount);
        const centavoPart = Math.round((amount - pesoPart) * 100);
        
        let words = numberToWords(pesoPart) + " PESOS";
        if (centavoPart > 0) {
            words += ` AND ${numberToWords(centavoPart)} CENTAVOS`;
        }
        return words + " ONLY";
    };

    const renderStudentReceipt = () => {
        const distribution = data?.distribution || { miscellaneous: 0, tuition: 0, totalPayable: 0, accountsPayable: 0 };
        const miscFees = data?.miscellaneousFees || [];

        return (
            <>
                <Box className="section-title">CUSTOMER DETAILS</Box>
                <Box className="info-row">
                    <span className="info-label">Student ID:</span>
                    <span>{data?.studentId || "N/A"}</span>
                </Box>
                <Box className="info-row">
                    <span className="info-label">Student Name:</span>
                    <span>{data?.payorName || "N/A"}</span>
                </Box>
                <Box className="info-row">
                    <span className="info-label">Email:</span>
                    <span>{data?.email || "N/A"}</span>
                </Box>
                <Box className="info-row">
                    <span className="info-label">Course & Year:</span>
                    <span>{data?.courseAndYearLevel || "N/A"}</span>
                </Box>
                <Box className="info-row">
                    <span className="info-label">Semester:</span>
                    <span>{data?.semester || "N/A"} {data?.schoolYear || ""}</span>
                </Box>

                <Box className="section-title">PAYMENT DETAILS</Box>
                <Box className="info-row">
                    <span className="info-label">Status:</span>
                    <span>Approved</span>
                </Box>
                <Box className="info-row">
                    <span className="info-label">Mode of Payment:</span>
                    <span>{data?.modeOfPayment || "N/A"}</span>
                </Box>
                <Box className="info-row">
                    <span className="info-label">Fund Cluster:</span>
                    <span>{data?.accountType || data?.selectedAccount || "N/A"}</span>
                </Box>
                <Box className="info-row">
                    <span className="info-label">Particulars:</span>
                    <span>{getParticularsText()}</span>
                </Box>
                <Box className="info-row">
                    <span className="info-label">Date & Time:</span>
                    <span>{formatDate(data?.createdAt)}</span>
                </Box>

                {miscFees.length > 0 && (
                    <>
                        <Box className="section-title">MISCELLANEOUS FEES BREAKDOWN</Box>
                        <Table>
                            <TableBody>
                                {miscFees.map((fee: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{fee.name || fee.item_title}</TableCell>
                                        <TableCell align="right">{formatCurrency(fee.amount || fee.price)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )}

                <Box sx={{ mt: 2 }}>
                    <Box className="info-row">
                        <span className="info-label">Tuition Fee:</span>
                        <span>{formatCurrency(distribution.tuition)}</span>
                    </Box>
                    <Box className="info-row total-row" sx={{ fontSize: '14px', fontWeight: 'bold', mt: 1 }}>
                        <span>Amount Received (Grand Total):</span>
                        <span>{formatCurrency(data?.amountTendered)}</span>
                    </Box>
                </Box>
            </>
        );
    };

    const renderEmployeeReceipt = () => (
        <>
            <Box className="section-title">CUSTOMER DETAILS</Box>
            <Box className="info-row">
                <span className="info-label">Name of Payor:</span>
                <span>{data?.payorName || "N/A"}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Email:</span>
                <span>{data?.email || "N/A"}</span>
            </Box>

            <Box className="section-title">PAYMENT DETAILS</Box>
            <Box className="info-row">
                <span className="info-label">Status:</span>
                <span>Approved</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Mode of Payment:</span>
                <span>{data?.modeOfPayment || "N/A"}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Fund Cluster:</span>
                <span>{data?.accountType || data?.selectedAccount || "N/A"}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Particulars:</span>
                <span>{getParticularsText()}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Details:</span>
                <span>{data?.details || "N/A"}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Date & Time:</span>
                <span>{formatDate(data?.createdAt)}</span>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Box className="info-row total-row" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                    <span>Amount Received (Grand Total):</span>
                    <span>{formatCurrency(data?.amountTendered)}</span>
                </Box>
            </Box>
        </>
    );

    const renderExternalReceipt = () => (
        <>
            <Box className="section-title">CUSTOMER DETAILS</Box>
            <Box className="info-row">
                <span className="info-label">Name of Institution/Agency:</span>
                <span>{data?.payorName || "N/A"}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Email:</span>
                <span>{data?.email || "N/A"}</span>
            </Box>

            <Box className="section-title">PAYMENT DETAILS</Box>
            <Box className="info-row">
                <span className="info-label">Status:</span>
                <span>Approved</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Mode of Payment:</span>
                <span>{data?.modeOfPayment || "N/A"}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Fund Cluster:</span>
                <span>{data?.accountType || data?.selectedAccount || "N/A"}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Particulars:</span>
                <span>{getParticularsText()}</span>
            </Box>
            <Box className="info-row">
                <span className="info-label">Date & Time:</span>
                <span>{formatDate(data?.createdAt)}</span>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Box className="info-row total-row" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                    <span>Amount Received (Grand Total):</span>
                    <span>{formatCurrency(data?.amountTendered)}</span>
                </Box>
            </Box>
        </>
    );

    const renderReceiptContent = () => {
        if (!data) return null;

        switch (data.userType) {
            case "Student":
                return renderStudentReceipt();
            case "Employee":
                return renderEmployeeReceipt();
            case "External":
                return renderExternalReceipt();
            default:
                return <Typography>Unknown user type</Typography>;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Official Receipt Preview</Typography>
                <Box>
                    <IconButton onClick={handlePrint} sx={{ mr: 1 }} title="Print Receipt">
                        <PrintIcon />
                    </IconButton>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Paper
                    ref={printRef}
                    elevation={3}
                    sx={{
                        p: 4,
                        border: '2px solid',
                        borderColor: 'divider',
                        backgroundColor: 'white',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {campusName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {campusLocation}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                            OFFICIAL RECEIPT
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            eOR Number: {eorNumber || data?.eorNumber || "Preview"}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Receipt Content */}
                    {renderReceiptContent()}

                    <Divider sx={{ my: 3 }} />

                    {/* Amount in Words */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold">
                            Amount in Words:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            {getAmountInWords()}
                        </Typography>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Thank you for your payment.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Note: This is a system-generated receipt and does not require a signature.
                        </Typography>
                    </Box>
                </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
                <Button onClick={handlePrint} variant="contained" startIcon={<PrintIcon />}>
                    Print Preview
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReceiptPreviewDialog;
