import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button, Grid, Typography, Select, MenuItem, IconButton,
    Divider, FormControl, InputLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { fees } from "@/pages/admin/Transactions/fees";
import { SnackbarState, TransactionDataType } from "@/pages/admin/Transactions/type";
import ReceiptViewerComponent from "../ReceiptViewerComponent";

type Props = {
    open: boolean;
    data: TransactionDataType | null;
    entryModes?: TransactionModalEntryModeType[];
    snackbar?: SnackbarState;
    onClose: () => void;
    onSave?: (updatedData: TransactionDataType, checkedItems?: string[], entryMode?: string, details?: string, remarks?: string, amountToPay?: number, amountTendered?: number, selectedAccount?: string) => void;
    editable?: boolean;
};

type TransactionModalEntryModeType = {
    entry_mode_id: number;
    entry_mode_title: string;
    entry_mode_desc: string;
    credit: string;
    debit: string;
};

const TransactionDialogForExternal: React.FC<Props> = ({
    open,
    data,
    onClose,
    onSave,
    editable = false,
}) => {
    const [formData, setFormData] = React.useState<TransactionDataType | null>(data);
    const [image, setImage] = React.useState<string | null>(null);

    // 🔹 FORM STATES
    const [amountTendered, setAmountTendered] = React.useState<number>(0);
    const [remarks, setRemarks] = React.useState<string>("");
    const [details, setDetails] = React.useState<string>("");
    const [selectedAccount, setSelectedAccount] = React.useState("");
    const [filteredParticulars, setFilteredParticulars] = React.useState<string[]>([]);

    // 🔹 Handle text inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev!, [name]: value }));
    };

    // 🔹 Handle submit
    const handleSubmit = () => {
        if (editable && formData && onSave) {
            onSave({ ...formData, details, remarks, amountTendered, selectedAccount });
        }
    };

    // 🔹 Load receipt image preview
    React.useEffect(() => {
        if (data?.filePath) {
            const url = `${import.meta.env.VITE_API_URL}/${data.filePath}`;
            if (/\.(jpg|jpeg|png)$/i.test(data.filePath)) setImage(url);
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
            if (!editable && formData?.status === 'approved') {
                setSelectedAccount(formData.account_type || "");
                setRemarks(formData.remarks || "");
                setDetails(formData.details || "");
                setAmountTendered(parseFloat(formData.amount_tendered || "0"));
            }
        }
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
                <TextField
                    label="Name of Institution/Agency"
                    name="name_of_payor"
                    value={formData?.name_of_payor || ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editable}
                    margin="dense"
                />
                <TextField
                    label="Reference ID"
                    name="reference_id"
                    value={formData?.reference_id || ""}
                    onChange={handleChange}
                    fullWidth
                    disabled
                    margin="dense"
                />
                <TextField
                    label="Reference Number"
                    name="reference_number"
                    value={formData?.reference_number || ""}
                    onChange={handleChange}
                    fullWidth
                    disabled
                    margin="dense"
                />

                <TextField
                    label="eOR Number"
                    name="e_or"
                    value={formData?.e_or || ""}
                    fullWidth
                    disabled
                    margin="dense"
                />
                <TextField
                    label="Created At"
                    value={formData?.created_at ? new Date(formData.created_at).toLocaleString() : ""}
                    fullWidth
                    disabled
                    margin="dense"
                />

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
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Payment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {/* <FormControl fullWidth margin="dense">
                    <TextField
                        label="Mode of Payment"
                        type="text"
                        name="mode_of_payment"
                        value={formData?.mode_of_payment || ""}
                        fullWidth
                        disabled
                    />
                </FormControl> */}
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
                <FormControl fullWidth disabled={!selectedAccount} margin="dense">
                    <InputLabel id="particular-select">Particulars</InputLabel>
                    <Select
                        labelId="particular-select"
                        value={formData?.particulars}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, particulars: e.target.value }))
                        }
                        label="Particulars"
                        margin="dense"
                        disabled={!editable || !selectedAccount || formData?.status !== 'approved'}
                        inputProps={{
                            sx: {
                                whiteSpace: "normal !important",
                            },
                        }}
                    >
                        {filteredParticulars.map((name, index) => (
                            <MenuItem key={index} value={name} sx={{ whiteSpace: "normal !important" }}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* <FormControl fullWidth margin="dense" >
                    <TextField
                        label="Remarks"
                        type="text"
                        name="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={!editable || formData?.status !== 'approved'}
                        fullWidth
                    />
                </FormControl> */}
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
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(parseFloat(Number(e.target.value).toFixed(2)))}
                        fullWidth
                        disabled={!editable || formData?.status !== 'approved'}
                    />
                </FormControl>
            </Grid>
        </Grid>
    );

    const renderContent = () => {
        return renderExternalForm();
    };

    const renderReceiptSection = () => (
        <ReceiptViewerComponent image={image || ""} />
    )
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            {/* Header */}
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>{editable ? "Update Transaction" : "View Transaction"}</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            {/* Receipt Preview */}
            <DialogContent>
                {/* Content */}
                {renderContent()}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1">Receipt Preview</Typography>
                {renderReceiptSection()}
            </DialogContent>

            {/* Footer */}
            {editable && (
                <DialogActions>
                    <Button onClick={handleSubmit} variant="contained">Save</Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default React.memo(TransactionDialogForExternal);
