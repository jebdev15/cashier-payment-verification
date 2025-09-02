import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Typography,
    Select,
    MenuItem,
    IconButton,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Divider,
    FormControl,
    InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { axiosInstance } from "@/api/app";
import { fees } from "@/pages/admin/Transactions/fees"; // Assuming fees is an array of fee objects
import { SnackbarState } from "@/pages/admin/Transactions/type";
import SnackbarProvider from "../Snackbar";

export type TransactionData = {
    id?: string;
    student_account_id?: string;
    name_of_payor?: string;
    student_id?: string;
    reference_id?: string;
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
};

type Props = {
    open: boolean;
    data: TransactionData | null;
    entryModes?: TransactionModalEntryModeType[];
    snackbar?: SnackbarState;
    onClose: () => void;
    onSave?: (updatedData: TransactionData, checkedItems?: string[], entryMode?: string, details?: string, remarks?: string, amountToPay?: number, amountTendered?: number, transactionStatus?: string) => void;
    editable?: boolean;
};

type TransactionModalEntryModeType = {
    entry_mode_id: number;
    entry_mode_title: string;
    entry_mode_desc: string;
    credit: string;
    debit: string;
}

const TransactionModal: React.FC<Props> = ({
    open,
    data,
    entryModes,
    snackbar,
    onClose,
    onSave,
    editable = false,
}) => {
    const [formData, setFormData] = React.useState<TransactionData | null>(data);
    const [image, setImage] = React.useState<string | null>(null);
    const [miscellaneousFees, setMiscellaneousFees] = React.useState<any[]>([]);
    const [miscellaneousFeesBalance, setMiscellaneousFeesBalance] = React.useState<string>("0.00");
    const [tuitionFee, setTuitionFee] = React.useState<string>("0.00");
    const [amountToPay, setAmountToPay] = React.useState<number>(0.00);
    const [amountTendered, setAmountTendered] = React.useState<number>(0.00);
    const [selectedAccount, setSelectedAccount] = React.useState('');
    const [filteredParticulars, setFilteredParticulars] = React.useState<string[]>([]);
    const [details, setDetails] = React.useState<string>('');
    const [remarks, setRemarks] = React.useState<string>('');
    const [entryMode, setEntryMode] = React.useState<string>('1');
    const [checkedItems, setCheckedItems] = React.useState<string[]>([]);
    const [transactionStatus, setTransactionStatus] = React.useState<string>(data?.status || 'pending');
    const handleCheckedItems = (
        event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => {
        const itemId = event.target.value;
        console.log({ itemId, checked });
        setCheckedItems((prev) => {
            if (checked) {
                // ✅ Add only if it doesn't exist
                return prev.includes(itemId.toString()) ? prev : [...prev, itemId.toString()];
            } else {
                // ❌ Remove when unchecked
                return prev.filter((id) => id !== itemId.toString());
            }
        });
    };

    // To default to checking all, you can initialize checkedItems with all item IDs
    // const allItemIds = miscellaneousFees.map((fee) => fee.id);
    // const [checkedItems, setCheckedItems] = React.useState<string[]>(allItemIds);
    React.useEffect(() => {
        setFormData(data);
        // setEntryMode(data?.entryMode || '');
    }, [data]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev!, [name]: value }));
    };

    const handleSubmit = () => {
        if (editable) {
            if (formData && onSave) {
                onSave(formData, checkedItems, entryMode, details, remarks, amountToPay, amountTendered, transactionStatus);
            }
        }
    };
    React.useEffect(() => {
        if (data) {
            const filePath = data?.filePath;
            const imageUrl = `${import.meta.env.VITE_API_URL}/${filePath}`;
            console.log(filePath, imageUrl)
            // Optional: only display image if it's .jpg, .jpeg, .png
            const validImage = typeof filePath === "string" && /\.(jpg|jpeg|png)$/i.test(filePath);
            if (validImage) setImage(imageUrl);
        }
    }, [data]);
    React.useEffect(() => {
        // Handle changes to checkedItems
        console.log("Checked items changed:", checkedItems);
    }, [checkedItems]);
    React.useEffect(() => {
        const fetchStudentMiscellaneousFees = async () => {
            try {
                const response = await axiosInstance.get(`/api/transactions/miscellaneous-fees/${data?.student_account_id}`);
                if (response.data) {
                    // Process the fees data as needed
                    console.log("Fees data:", response.data);

                    const implementMiscellaneousFeesId = response.data?.miscellaneous_fee.map((fee: any, index: number) => ({
                        ...fee,
                        id: ++index, // Ensure each fee has a unique id
                    }));
                    console.log({ implementMiscellaneousFeesId });
                    setMiscellaneousFees(implementMiscellaneousFeesId);

                    // Log the balances to the console
                    console.log("Balances:", response.data?.unpaid_miscellaneous_fees);
                    setMiscellaneousFeesBalance(response.data?.unpaid_miscellaneous_fees || "0.00");
                    setTuitionFee(response.data?.tuition_fee.total || "0.00");
                }
            } catch (error) {
                console.error("Error fetching fees:", error);
            }
        };
        fetchStudentMiscellaneousFees();
    }, [])
    React.useEffect(() => {
        if (selectedAccount) {
            const filtered = fees
                .filter((item) => item.categories.includes(selectedAccount))
                .map((item) => item.name);
            setFilteredParticulars(filtered);
        } else {
            setFilteredParticulars([]);
        }
    }, [selectedAccount]);
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            {/* Header with Close Button */}
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pr: 2,
                }}
            >
                <Typography variant="h6">
                    {editable ? "Update Transaction" : "View Transaction"}
                </Typography>
                <IconButton aria-label="close" onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {formData?.userType === "Student" && (

                    <Grid container spacing={3}>
                        {/* 1. Account Details */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Account Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <TextField
                                label="Student Account ID"
                                value={formData?.student_account_id || ""}
                                onChange={handleChange}
                                type="number"
                                fullWidth
                                margin="dense"
                                disabled
                            />
                            <TextField
                                label="Reference ID"
                                name="reference_id"
                                value={formData?.reference_id || ""}
                                onChange={handleChange}
                                fullWidth
                                margin="dense"
                                disabled
                            />
                            <TextField
                                label="Student ID"
                                value={formData?.student_id || ""}
                                fullWidth
                                margin="dense"
                                disabled
                            />
                            <TextField
                                label="Payor Name"
                                name="name_of_payor"
                                value={formData?.name_of_payor || ""}
                                onChange={handleChange}
                                fullWidth
                                margin="dense"
                                disabled
                            />
                            <TextField
                                label="Balance"
                                name="balance"
                                value={formData?.balance || ""}
                                onChange={handleChange}
                                fullWidth
                                margin="dense"
                                disabled
                            />
                            <TextField
                                label="Amount Paid"
                                name="amount_paid"
                                value={formData?.amount_paid || ""}
                                onChange={handleChange}
                                type="number"
                                fullWidth
                                margin="dense"
                                disabled
                            />
                            <TextField
                                label="Total"
                                name="amount"
                                value={formData?.amount || ""}
                                onChange={handleChange}
                                type="number"
                                fullWidth
                                margin="dense"
                                disabled
                            />
                            <FormControl fullWidth>
                                <InputLabel id="transactionStatus-select">Status</InputLabel>
                                <Select
                                    labelId="transactionStatus-select"
                                    value={transactionStatus}
                                    onChange={(e) => {
                                        setTransactionStatus(e.target.value);
                                    }}
                                    label="Status"
                                    margin="dense"
                                    disabled={!editable}
                                >
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="approved">Approve</MenuItem>
                                    <MenuItem value="rejected">Reject</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 2. Payment */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Payment
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="entryMode-select">Entry Mode</InputLabel>
                                <Select
                                    labelId="entryMode-select"
                                    value={entryMode}
                                    onChange={(e) => {
                                        setEntryMode(e.target.value);
                                    }}
                                    label="Entry Mode"
                                    margin="dense"
                                    disabled={!editable || transactionStatus !== 'approved'}
                                >
                                    {entryModes && entryModes.map((mode) => (
                                        <MenuItem key={mode.entry_mode_id} value={mode.entry_mode_id}>{mode.entry_mode_title}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="account-select">Account Type</InputLabel>
                                <Select
                                    labelId="account-select"
                                    value={selectedAccount}
                                    onChange={(e) => {
                                        setSelectedAccount(e.target.value);
                                    }}
                                    label="Account Type"
                                    margin="dense"
                                    disabled={!editable || transactionStatus !== 'approved'}
                                >
                                    <MenuItem value="REG">REG</MenuItem>
                                    <MenuItem value="IGP">IGP</MenuItem>
                                    <MenuItem value="GS">GS</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={!selectedAccount}>
                                <InputLabel id="particular-select">Particulars</InputLabel>
                                <Select
                                    labelId="particular-select"
                                    value={formData.particulars}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, particulars: e.target.value }))
                                    }
                                    label="Particulars"
                                    margin="dense"
                                    disabled={!editable || !selectedAccount || transactionStatus !== 'approved'}
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
                            <FormControl fullWidth  >
                                <TextField
                                    fullWidth
                                    type="text"
                                    name="remarks"
                                    label="Remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    margin="dense"
                                    disabled={!editable || transactionStatus !== 'approved'}
                                />
                            </FormControl>
                            <FormControl fullWidth  >
                                <TextField
                                    fullWidth
                                    type="text"
                                    name="details"
                                    label="Details"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    margin="dense"
                                    disabled={!editable || transactionStatus !== 'approved'}
                                />
                            </FormControl>
                            <TextField
                                label="Amount"
                                name="amount_to_pay"
                                placeholder="0.00"
                                value={amountToPay.toFixed(2)}
                                onChange={(e) => setAmountToPay(Number(e.target.value))}
                                type="number"
                                fullWidth
                                margin="dense"
                                disabled={!editable || transactionStatus !== 'approved'}
                            />
                            <TextField
                                label="Tendered Amount"
                                name="tendered_amount"
                                value={amountTendered ? amountTendered.toFixed(2) : "0.00"}
                                onChange={(e) => setAmountTendered(Number(e.target.value))}
                                fullWidth
                                margin="dense"
                                disabled={!editable || transactionStatus !== 'approved'}
                            />
                            <Typography variant="body2" color="textSecondary" mt={1}>
                                Change: {amountTendered > 0 ? (amountTendered - amountToPay).toFixed(2) : "0.00"}
                            </Typography>
                        </Grid>

                        {/* 3. Miscellaneous Fees */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Miscellaneous Fees
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {editable && <TableCell padding="checkbox"></TableCell>}
                                        <TableCell>Items</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Balance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {miscellaneousFees && miscellaneousFees.map((fee) => (
                                        <TableRow key={fee._id}>
                                            {editable && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        onChange={handleCheckedItems}
                                                        value={fee.nature_of_collection_id}
                                                        disabled={fee.balance <= 0 || transactionStatus !== 'approved'}
                                                        checked={!!checkedItems.includes(fee.nature_of_collection_id.toString())}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>{fee.item_title}</TableCell>
                                            <TableCell>{fee.amount}</TableCell>
                                            <TableCell>{fee.balance}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Grid>

                        {/* 4. Summary */}
                        <Grid size={12}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Summary
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                        Payable
                                    </Typography>
                                    <Typography>Miscellaneous: {miscellaneousFeesBalance}</Typography>
                                    <Typography>Tuition: {tuitionFee}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                        Distribution
                                    </Typography>
                                    <Typography>For Miscellaneous: 0.00</Typography>
                                    <Typography>For Tuition: 0.00</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                        Accounts Payable
                                    </Typography>
                                    <Typography>Amount: 0.00</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
                {formData?.userType === "External" && (
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <TextField
                                label="Payor Name"
                                name="name_of_payor"
                                value={formData?.name_of_payor || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={!editable}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Reference ID"
                                name="reference_id"
                                value={formData?.reference_id || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={!editable}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Amount"
                                name="amount"
                                value={formData?.amount || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={!editable}
                                type="number"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Balance"
                                name="balance"
                                value={formData?.balance || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={!editable}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Amount Paid"
                                name="amount_paid"
                                value={formData?.amount_paid || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={!editable}
                                type="number"
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                label="Particulars"
                                name="particulars"
                                value={formData?.particulars || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={!editable}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="purpose-select">Purpose</InputLabel>
                                <Select
                                    label="Status"
                                    name="status"
                                    value={formData?.status || ""}
                                    onChange={(e) => setFormData((prev) => ({ ...prev!, status: e.target.value }))}
                                    fullWidth
                                    disabled={!editable}
                                >
                                    {["pending", "approved", "rejected"].map((status) => <MenuItem key={status} selected={status === formData?.status} value={status}>{status}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Created At"
                                value={formData?.created_at ? new Date(formData.created_at).toLocaleString() : ""}
                                fullWidth
                                disabled
                            />
                        </Grid>
                    </Grid>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Receipt Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid size={12} sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, aspectRatio: "1/1", overflow: "hidden", border: "1px dashed rgba(0, 0, 0, 0.23)" }}>
                    {image ? (
                        <img
                            src={image}
                            alt="Preview"
                            height={400}
                            width="100%"
                            loading="lazy"
                            style={{
                                objectFit: "contain",
                                objectPosition: "center",
                                width: "100%",
                                height: "100%",
                                padding: "8px",
                            }}
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "text.secondary",
                            }}
                        >
                            Image Preview
                        </Typography>
                    )}
                </Grid>
            </DialogContent>
            {(editable && formData?.status === 'pending') && (
                <DialogActions>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            )}
            {/* {snackbar.open && (
                <SnackbarProvider
                    open={snackbar?.open}
                    message={snackbar?.message}
                    severity={snackbar?.severity}
                />
            )} */}

        </Dialog>
    );
};

export default React.memo(TransactionModal);
