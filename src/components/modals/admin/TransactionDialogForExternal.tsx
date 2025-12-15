import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button, Grid, Typography, Select, MenuItem, IconButton,
    Divider, FormControl, InputLabel, Chip, Box, ListItemText, Checkbox,
    CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { fees } from "@/pages/admin/Transactions/fees";
import { SnackbarState, TransactionDataType } from "@/pages/admin/Transactions/type";
import { extractAccountItemTitle } from "@/utils/extractAccountItemTitle";
import ReceiptPreviewDialog from "./ReceiptPreviewDialog";
import SubmittedReceiptPreviewDialog from "./SubmittedReceiptPreviewDialog";

type Props = {
    open: boolean;
    data: TransactionDataType | null;
    snackbar?: SnackbarState;
    onClose: () => void;
    onSave?: (updatedData: TransactionDataType, checkedItems?: string[], entryMode?: string, details?: string, remarks?: string, amountToPay?: number, amountTendered?: number, selectedAccount?: string) => void;
    editable?: boolean;
    allParticulars?: any[];
    loading?: boolean;
};


const TransactionDialogForExternal: React.FC<Props> = ({
    open,
    data,
    onClose,
    onSave,
    editable = false,
    allParticulars = [],
    loading = false,
}) => {
    const [formData, setFormData] = React.useState<TransactionDataType | null>(data);
    const [image, setImage] = React.useState<string | null>(null);

    // 🔹 FORM STATES
    const [amountTendered, setAmountTendered] = React.useState<number>(0);
    const [remarks, setRemarks] = React.useState<string>("");
    const [details, setDetails] = React.useState<string>("");
    const [selectedAccount, setSelectedAccount] = React.useState("");
    const [filteredParticulars, setFilteredParticulars] = React.useState<string[]>([]);
    const [adminParticulars, setAdminParticulars] = React.useState<number[]>([]);
    const [payorParticulars, setPayorParticulars] = React.useState<any[]>([]);
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [submittedReceiptPreviewOpen, setSubmittedReceiptPreviewOpen] = React.useState(false);

    // 🔹 Handle text inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev!, [name]: value }));
    };

    // 🔹 Handle submit
    const handleSubmit = () => {
        if (editable && formData && onSave) {
            // Get particular names from IDs
            const adminParticularsNames = adminParticulars
                .map(id => allParticulars.find(p => p.nature_of_collection_id === id)?.item_title)
                .filter(Boolean)
                .join(', ');
            
            onSave({ 
                ...formData, 
                details, 
                remarks, 
                amountTendered, 
                selectedAccount, 
                adminParticulars,
                adminParticularsText: adminParticularsNames
            });
        }
    };

    // 🔹 Load receipt image preview
    React.useEffect(() => {
        if (data?.filePath) {
            const url = `${import.meta.env.VITE_API_URL}/${data.filePath}`;
            if (/\.(jpg|jpeg|png)$/i.test(data.filePath)) setImage(url);
        }
        
        // Parse payor particulars
        if (data?.payorParticulars) {
            try {
                const parsed = typeof data.payorParticulars === 'string' 
                    ? JSON.parse(data.payorParticulars) 
                    : data.payorParticulars;
                setPayorParticulars(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error('Failed to parse payor particulars:', e);
                setPayorParticulars([]);
            }
        }
    }, [data]);

    // 🔹 Update particulars when account changes
    React.useEffect(() => {
        if (selectedAccount) {
            const filtered = fees.filter((item) => item.categories.includes(selectedAccount)).map((i) => i.name);
            setFilteredParticulars(filtered);
        } else {
            setFilteredParticulars([]);
        }
    }, [selectedAccount]);

    React.useEffect(() => {
        const updateAllTheDetailsIfApproved = () => {
            const fd = formData ?? data;
            if (!editable && (fd?.status ?? data?.status) === 'approved') {
                setSelectedAccount(fd.accountType ?? "");
                setRemarks(fd.remarks ?? "");
                setDetails(fd.details ?? "");
                setAmountTendered(parseFloat((fd.amountTendered ?? "0").toString()));
            }
        };
        updateAllTheDetailsIfApproved();
    }, []);
    /**
     * 🟢 SECTION RENDERERS
     */

    const renderExternalForm = () => (
        <Grid container spacing={2}>
            {/* 1. Account Details */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Account Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">Name of Institution/Agency</Typography>
                    <Typography variant="body1">{formData?.payor || "N/A"}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">Reference ID</Typography>
                    <Typography variant="body1" fontWeight="medium">{formData?.referenceId || "N/A"}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">Reference Number</Typography>
                    <Typography variant="body1" fontWeight="medium">{formData?.referenceNumber || "N/A"}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">eOR Number</Typography>
                    <Typography variant="body1" fontWeight="medium" color="primary">{formData?.eOr || "N/A"}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">Created At</Typography>
                    <Typography variant="body2">{formData?.createdAt ? new Date(formData.createdAt).toLocaleString() : "N/A"}</Typography>
                </Box>

                
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Payment Details
                </Typography>
                <FormControl fullWidth margin="dense">
                    <InputLabel htmlFor="purpose-select">Status</InputLabel>
                    <Select
                        label="Status"
                        name="status"
                        value={formData?.status || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev!, status: e.target.value }))}
                        fullWidth
                        disabled={!editable}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">{formData?.status === "approved" ? "Approved" : "Approve"}</MenuItem>
                        <MenuItem value="rejected">{formData?.status === "rejected" ? "Rejected" : "Reject"}</MenuItem>
                    </Select>
                </FormControl>
                <Divider sx={{ mb: 2 }} />
                <FormControl fullWidth margin="dense">
                    <TextField
                        label="Mode of Payment"
                        type="text"
                        name="modeOfPayment"
                        value={formData?.modeOfPayment || ""}
                        fullWidth
                        disabled
                    />
                </FormControl>
                <FormControl fullWidth margin="dense">
                    <InputLabel id="account-select">Fund Cluster</InputLabel>
                    <Select
                        labelId="account-select"
                        value={selectedAccount}
                        onChange={(e) => {
                            setSelectedAccount(e.target.value);
                        }}
                        label="Account Type"
                        margin="dense"
                        disabled={!editable || formData?.status !== 'approved'}
                    >
                        <MenuItem value="REG">REG</MenuItem>
                        <MenuItem value="IGP">IGP</MenuItem>
                        <MenuItem value="GS">GS</MenuItem>
                    </Select>
                </FormControl>
                {/* Display Payor's Selected Particulars */}
                {payorParticulars && payorParticulars.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                            Particulars Selected by Payor:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {payorParticulars.map((particular, index) => {
                                const particularName = typeof particular === 'object' && particular?.name 
                                    ? extractAccountItemTitle(particular.nature_of_collection_id, allParticulars) 
                                    : (allParticulars.find(p => p.nature_of_collection_id === particular)?.item_title || extractAccountItemTitle(particular, allParticulars));
                                return (
                                    <Chip 
                                        key={index} 
                                        label={particularName} 
                                        size="small" 
                                        color="info"
                                        variant="outlined"
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                )}
                
                {/* Admin Particulars Multi-Select */}
                <FormControl fullWidth disabled={!selectedAccount} margin="dense">
                    <InputLabel id="admin-particulars-select">Admin Particulars (Multiple Selection)</InputLabel>
                    <Select
                        labelId="admin-particulars-select"
                        multiple
                        value={adminParticulars}
                        onChange={(e) => {
                            const value = e.target.value;
                            setAdminParticulars(typeof value === 'string' ? [] : value as number[]);
                        }}
                        label="Admin Particulars (Multiple Selection)"
                        margin="dense"
                        disabled={!editable || !selectedAccount || formData?.status !== 'approved'}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => {
                                    const particular = allParticulars.find(p => p.nature_of_collection_id === value);
                                    return (
                                        <Chip 
                                            key={value} 
                                            label={particular?.item_title || extractAccountItemTitle(value, allParticulars)} 
                                            size="small" 
                                        />
                                    );
                                })}
                            </Box>
                        )}
                    >
                        {allParticulars
                            .filter(p => p.account_title === selectedAccount)
                            .map((particular) => (
                                <MenuItem key={particular.nature_of_collection_id} value={particular.nature_of_collection_id}>
                                    <Checkbox checked={adminParticulars.indexOf(particular.nature_of_collection_id) > -1} />
                                    <ListItemText 
                                        primary={particular.item_title} 
                                        sx={{ whiteSpace: "normal !important" }}
                                    />
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                    <TextField
                        label="Details"
                        type="text"
                        name="details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        disabled={!editable || formData?.status !== 'approved'}
                        fullWidth
                    />
                </FormControl>
                <FormControl fullWidth margin="dense">
                    <TextField
                        label="Amount Received"
                        name="amountTendered"
                        type="number"
                        value={amountTendered ?? parseFloat((formData?.amountTendered ?? "0").toString())}
                        onChange={(e) => setAmountTendered(parseFloat(Number(e.target.value).toFixed(2)))}
                        fullWidth
                        disabled={!editable || (formData?.status ?? data?.status) !== 'approved'}
                    />
                </FormControl>
            </Grid>
        </Grid>
    );

    const renderContent = () => {
        return renderExternalForm();
    };

    const getSelectedParticularsForPreview = () => {
        return adminParticulars
            .map(id => allParticulars.find(p => p.nature_of_collection_id === id))
            .filter(Boolean);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                {/* Header */}
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6">{editable ? "Update Transaction" : "View Transaction"}</Typography>
                        {image && (
                            <Chip 
                                icon={<VisibilityIcon />}
                                label="Receipt Submitted"
                                color="success"
                                size="small"
                                onClick={() => setSubmittedReceiptPreviewOpen(true)}
                                sx={{ cursor: 'pointer' }}
                            />
                        )}
                    </Box>
                    <Box>
                        {formData?.status === 'approved' && (
                            <IconButton 
                                onClick={() => setPreviewOpen(true)} 
                                color="primary"
                                title="Preview Official Receipt"
                                sx={{ mr: 1 }}
                            >
                                <VisibilityIcon />
                            </IconButton>
                        )}
                        <IconButton onClick={onClose}><CloseIcon /></IconButton>
                    </Box>
                </DialogTitle>

            <DialogContent>
                {renderContent()}
            </DialogContent>

            {/* Footer */}
            {editable && (
                <DialogActions>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? "Updating..." : "Save"}
                    </Button>
                </DialogActions>
            )}
        </Dialog>

        {/* Receipt Preview Dialog */}
        <ReceiptPreviewDialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            data={formData}
            eorNumber={formData?.eorNumber}
            adminParticulars={getSelectedParticularsForPreview()}
        />

        {/* Submitted Receipt Preview Dialog */}
        <SubmittedReceiptPreviewDialog
            open={submittedReceiptPreviewOpen}
            onClose={() => setSubmittedReceiptPreviewOpen(false)}
            imageUrl={image}
            referenceId={formData?.referenceId}
            title="Submitted Receipt - External"
        />
        </>
    );
};

export default React.memo(TransactionDialogForExternal);
