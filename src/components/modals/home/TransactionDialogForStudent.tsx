import React from "react";
import {
    Dialog, DialogTitle, DialogContent,
    Grid, Typography, IconButton,
    Divider, Box, Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TransactionDataType } from "@/pages/admin/Transactions/type";
import ReceiptViewerComponent from "@/components/ReceiptViewerComponent";

type Props = {
    open: boolean;
    data: TransactionDataType | null;
    onClose: () => void;
};

const TransactionDialogForStudent: React.FC<Props> = ({
    open,
    data,
    onClose,
}) => {
    const [image, setImage] = React.useState<string | null>(null);

    // 🔹 Load student fees if applicable
    React.useEffect(() => {
        if (data) {
            const filePath = data?.filePath;
            const imageUrl = `${import.meta.env.VITE_API_URL}/${filePath}`;
            // Optional: only display image if it's .jpg, .jpeg, .png
            const validImage = typeof filePath === "string" && /\.(jpg|jpeg|png)$/i.test(filePath);
            if (validImage) setImage(imageUrl);
        }
    }, [data]);

    /**
     * 🟢 HELPER FUNCTIONS
     */
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const DataRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
        <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
                {value || "N/A"}
            </Typography>
        </Box>
    );

    /**
     * 🟢 SECTION RENDERERS
     */
    const renderStudentForm = () => (
        <Grid container spacing={3}>
            {/* 1. Account Details */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Account Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <DataRow label="Student Account ID" value={data?.studentAccountId} />
                <DataRow label="Reference ID" value={data?.referenceId} />
                <DataRow label="Reference Number" value={data?.referenceNumber} />
                <DataRow label="Student ID" value={data?.studentId} />
                <DataRow label="Payor Name" value={data?.payor} />
                <DataRow label="Balance" value={data?.balance ? `₱${parseFloat(data.balance.toString()).toFixed(2)}` : undefined} />
                <DataRow label="Amount Paid" value={data?.amountPaid ? `₱${parseFloat(data.amountPaid.toString()).toFixed(2)}` : undefined} />
                <DataRow label="Total" value={data?.amount ? `₱${parseFloat(data.amount.toString()).toFixed(2)}` : undefined} />
                
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Status
                    </Typography>
                    <Chip 
                        label={data?.status?.toUpperCase() || "N/A"} 
                        color={getStatusColor(data?.status || '')}
                        size="small"
                        sx={{ mt: 0.5, fontWeight: 600 }}
                    />
                </Box>
            </Grid>

            {/* 2. Payment Details */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Payment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <DataRow label="Fund Cluster" value={data?.accountType || data?.selectedAccount} />
                <DataRow label="Particulars" value={data?.particulars} />
                <DataRow label="Remarks" value={data?.remarks} />
                <DataRow label="Details" value={data?.details} />
                <DataRow label="Amount" value={data?.amountToPay ? `₱${parseFloat(data.amountToPay.toString()).toFixed(2)}` : undefined} />
                <DataRow label="Tendered Amount" value={data?.amountTendered ? `₱${parseFloat(data.amountTendered.toString()).toFixed(2)}` : undefined} />
                
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Change
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="success.main">
                        ₱{((parseFloat(data?.amountTendered?.toString() || "0")) - (parseFloat(data?.amountToPay?.toString() || "0"))).toFixed(2)}
                    </Typography>
                </Box>
            </Grid>

            {/* 3. Distribution Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Distribution Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <DataRow 
                    label="Miscellaneous Fees" 
                    value={data?.distribution?.miscellaneous ? `₱${Number(data.distribution.miscellaneous).toFixed(2)}` : "₱0.00"} 
                />
                <DataRow 
                    label="Tuition" 
                    value={data?.distribution?.tuition ? `₱${Number(data.distribution.tuition).toFixed(2)}` : "₱0.00"} 
                />
                <DataRow 
                    label="Accounts Payable" 
                    value={data?.distribution?.accountsPayable ? `₱${Number(data.distribution.accountsPayable).toFixed(2)}` : "₱0.00"} 
                />
            </Grid>
        </Grid>
    );

    const renderContent = () => {
        return renderStudentForm();
    };

    const renderReceiptSection = () => (
        <ReceiptViewerComponent image={image || ""} />
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            {/* Header */}
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>View Transaction</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            {/* Receipt Preview */}
            <DialogContent>
                {/* Content */}
                {renderContent()}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold">Receipt Preview</Typography>
                {renderReceiptSection()}
            </DialogContent>
        </Dialog>
    );
};

export default React.memo(TransactionDialogForStudent);
