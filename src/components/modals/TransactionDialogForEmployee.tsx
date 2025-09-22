import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button, Grid, Typography, Select, MenuItem, IconButton,
    Checkbox, Table, TableBody, TableCell, TableHead, TableRow,
    Divider, FormControl, InputLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { axiosInstance } from "@/api/app";
import { fees } from "@/pages/admin/Transactions/fees";
import { SnackbarState, TransactionDataType } from "@/pages/admin/Transactions/type";
import { useCookies } from "react-cookie";
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

const TransactionModal: React.FC<Props> = ({
    open,
    data,
    entryModes,
    onClose,
    onSave,
    editable = false,
}) => {
    const [cookie] = useCookies(["accessToken"]);
    const [formData, setFormData] = useState<TransactionDataType | null>(data);
    const [image, setImage] = useState<string | null>(null);

    // 🔹 FORM STATES
    const [amountToPay, setAmountToPay] = useState<number>(0);
    const [amountTendered, setAmountTendered] = useState<number>(0);
    const [remarks, setRemarks] = useState<string>("");
    const [details, setDetails] = useState<string>("");
    const [entryMode, setEntryMode] = useState<string>("1");
    const [selectedAccount, setSelectedAccount] = useState("");
    const [filteredParticulars, setFilteredParticulars] = useState<string[]>([]);
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [miscellaneousFees, setMiscellaneousFees] = useState<any[]>([]);
    const [tuitionFee, setTuitionFee] = useState<string>("0.00");
    const [miscellaneousFeesBalance, setMiscellaneousFeesBalance] = useState<string>("0.00");
    const [distribution, setDistribution] = React.useState({
        miscellaneous: 0,
        tuition: 0,
        totalPayable: 0,
        accountsPayable: 0,
    });
    // 🔹 Handle checkbox toggle for misc fees
    const handleCheckedItems = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const itemId = event.target.value;
        setCheckedItems((prev) =>
            checked ? (prev.includes(itemId) ? prev : [...prev, itemId]) : prev.filter((id) => id !== itemId)
        );
    };

    // 🔹 Handle text inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev!, [name]: value }));
    };

    // 🔹 Handle submit
    const handleSubmit = () => {
        if (editable && formData && onSave) {
            onSave({ ...formData, checkedItems, entryMode, details, remarks, amountToPay, amountTendered, selectedAccount });
        }
    };

    // 🔹 Load student fees if applicable
    useEffect(() => {
        if (formData?.userType === "Student") {
            const fetchFees = async () => {
                try {
                    const { data: res } = await axiosInstance.get(`/api/transactions/miscellaneous-fees/${formData?.student_account_id}`);
                    setMiscellaneousFees(res?.miscellaneous_fee || []);
                    setMiscellaneousFeesBalance(res?.unpaid_miscellaneous_fees || "0.00");
                    setTuitionFee(res?.tuition_fee.total || "0.00");
                } catch (err) {
                    console.error("Error fetching fees", err);
                }
            };
            fetchFees();
        }
    }, [formData]);

    // 🔹 Load receipt image preview
    useEffect(() => {
        if (data?.filePath) {
            const url = `${import.meta.env.VITE_API_URL}/${data.filePath}`;
            if (/\.(jpg|jpeg|png)$/i.test(data.filePath)) setImage(url);
        }
    }, [data]);

    // 🔹 Update particulars when account changes
    useEffect(() => {
        if (selectedAccount) {
            const filtered = fees.filter((item) => item.categories.includes(selectedAccount)).map((i) => i.name);
            setFilteredParticulars(filtered);
        } else {
            setFilteredParticulars([]);
        }
    }, [selectedAccount]);

    /**
     * 🟢 SECTION RENDERERS
     */

    const renderEmployeeForm = () => (
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
                <FormControl fullWidth margin="dense">
                    <TextField
                        label="Mode of Payment"
                        type="text"
                        name="mode_of_payment"
                        value={formData?.mode_of_payment || ""}
                        fullWidth
                        disabled
                    />
                </FormControl>
                <FormControl fullWidth margin="dense">
                    <InputLabel id="account-select">Account Title</InputLabel>
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
                <FormControl fullWidth margin="dense" >
                    <TextField
                        label="Remarks"
                        type="text"
                        name="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={!editable || formData?.status !== 'approved'}
                        fullWidth
                    />
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
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(parseFloat(Number(e.target.value).toFixed(2)))}
                        fullWidth
                        disabled={!editable || formData?.status !== 'approved'}
                    />
                </FormControl>
            </Grid>
        </Grid>
    )
    const renderContent = () => {
        if (!editable) return <Typography>No changes made</Typography>;
        if (cookie.accessToken?.isAdministrator) {
            switch (formData?.userType) {
                case "Employee":
                    return renderEmployeeForm();
                default:
                    return <Typography color="error">Unknown user type</Typography>;
            }
        }
        return <Typography color="error">You do not have permission to edit this transaction.</Typography>;
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

            {/* Content */}
            <DialogContent dividers>{renderContent()}</DialogContent>

            {/* Receipt Preview */}
            <DialogContent>
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

export default React.memo(TransactionModal);
