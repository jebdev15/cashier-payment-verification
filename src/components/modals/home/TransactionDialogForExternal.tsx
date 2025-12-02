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


const TransactionDialogForExternal: React.FC<Props> = ({
    open,
    data,
    onClose,
}) => {
    const [image, setImage] = React.useState<string | null>(null);

    // 🔹 Load receipt image preview
    React.useEffect(() => {
        if (data?.filePath) {
            const url = `${import.meta.env.VITE_API_URL}/${data.filePath}`;
            if (/\.(jpg|jpeg|png)$/i.test(data.filePath)) setImage(url);
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

    const renderExternalForm = () => (
        <Grid container spacing={3}>
            {/* 1. Account Details */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Account Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <DataRow label="Name of Institution/Agency" value={data?.payor} />
                <DataRow label="Reference ID" value={data?.referenceId} />
                <DataRow label="Reference Number" value={data?.referenceNumber} />
                <DataRow label="eOR Number" value={data?.eOr} />
                <DataRow 
                    label="Created At" 
                    value={data?.createdAt ? new Date(data.createdAt).toLocaleString() : undefined} 
                />
                
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
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Payment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <DataRow label="Fund Cluster" value={data?.accountType || data?.selectedAccount} />
                <DataRow label="Particulars" value={data?.particulars} />
                <DataRow label="Details" value={data?.details} />
                <DataRow 
                    label="Amount Received" 
                    value={data?.amountTendered ? `₱${parseFloat(data.amountTendered.toString()).toFixed(2)}` : undefined} 
                />
            </Grid>
        </Grid>
    );

    const renderContent = () => {
        return renderExternalForm();
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

export default React.memo(TransactionDialogForExternal);
