import React from "react";
import {
    Dialog, DialogTitle, DialogContent,
    Grid, Typography, IconButton,
    Divider, Box, Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TransactionDataType } from "@/pages/admin/Transactions/type";
import SubmittedReceiptPreviewDialog from "@/components/modals/admin/SubmittedReceiptPreviewDialog";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";

interface Particular {
    id: number;
    fee: string;
}

type Props = {
    open: boolean;
    data: TransactionDataType | null;
    onClose: () => void;
};


const TransactionModal: React.FC<Props> = ({
    open,
    data,
    onClose,
}) => {
    const [cookie] = useCookies(["accessToken"]);
    const [image, setImage] = React.useState<string | null>(null);
    const [receiptPreviewOpen, setReceiptPreviewOpen] = React.useState(false);
    const [particularsText, setParticularsText] = React.useState<string>("");

    // 🔹 Load receipt image preview
    React.useEffect(() => {
        if (data?.filePath) {
            const url = `${import.meta.env.VITE_API_URL}/${data.filePath}`;
            if (/\.(jpg|jpeg|png)$/i.test(data.filePath)) setImage(url);
        }
    }, [data]);

    // 🔹 Fetch and format particulars
    React.useEffect(() => {
        const fetchParticulars = async () => {
            if (data?.adminParticularsText) {
                setParticularsText(data.adminParticularsText);
                return;
            }

            if (data?.particulars) {
                try {
                    const parsed = typeof data.particulars === 'string' 
                        ? JSON.parse(data.particulars) 
                        : data.particulars;
                    
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const response = await axiosInstanceWithAuthorization(cookie.accessToken).get<Particular[]>('/api/particulars');
                        if (response.data) {
                            const names = parsed
                                .map(id => response.data.find((p: Particular) => p.id === id)?.fee)
                                .filter(Boolean)
                                .join(', ');
                            setParticularsText(names || data.particulars);
                        } else {
                            setParticularsText(data.particulars);
                        }
                    } else {
                        setParticularsText(data.particulars);
                    }
                } catch {
                    setParticularsText(data.particulars);
                }
            }
        };

        fetchParticulars();
    }, [data, cookie.accessToken]);

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

    const renderEmployeeForm = () => (
        <Grid container spacing={3}>
            {/* 1. Account Details */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Account Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <DataRow label="Name of Employee" value={data?.payor} />
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
                
                <DataRow label="Fund Cluster" value={data?.fundCluster || data?.selectedAccount} />
                <DataRow label="Particulars" value={particularsText || "N/A"} />
                <DataRow label="Details" value={data?.details} />
                <DataRow 
                    label="Amount Received" 
                    value={data?.amountTendered ? `₱${parseFloat(data.amountTendered.toString()).toFixed(2)}` : undefined} 
                />
            </Grid>
        </Grid>
    );

    const renderContent = () => {
        return renderEmployeeForm();
    };

    return (
        <>
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            {/* Header */}
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography>View Transaction</Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {image && (
                        <Chip
                            icon={<VisibilityIcon />}
                            label="View Receipt"
                            color="primary"
                            size="small"
                            onClick={() => setReceiptPreviewOpen(true)}
                            sx={{ cursor: "pointer" }}
                        />
                    )}
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>

            {/* Content */}
            <DialogContent>
                {renderContent()}
            </DialogContent>
        </Dialog>

        {/* Receipt Preview Dialog */}
        <SubmittedReceiptPreviewDialog
            open={receiptPreviewOpen}
            onClose={() => setReceiptPreviewOpen(false)}
            imageUrl={image}
            title="Submitted Receipt - Employee"
            referenceId={data?.referenceId}
            referenceNumber={data?.referenceNumber}
        />
        </>
    );
};

export default React.memo(TransactionModal);
