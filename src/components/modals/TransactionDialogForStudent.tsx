import React from "react";
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
    const [formData, setFormData] = React.useState<TransactionDataType | null>(data);
    const [image, setImage] = React.useState<string | null>(null);

    // 🔹 FORM STATES
    const [amountToPay, setAmountToPay] = React.useState<number>(0);
    const [amountTendered, setAmountTendered] = React.useState<number>(0);
    const [remarks, setRemarks] = React.useState<string>("");
    const [details, setDetails] = React.useState<string>("");
    const [entryMode, setEntryMode] = React.useState<string>("1");
    const [selectedAccount, setSelectedAccount] = React.useState("");
    const [filteredParticulars, setFilteredParticulars] = React.useState<string[]>([]);
    const [checkedItems, setCheckedItems] = React.useState<string[]>([]);
    const [miscellaneousFees, setMiscellaneousFees] = React.useState<any[]>([]);
    const [tuitionFee, setTuitionFee] = React.useState<string>("0.00");
    const [miscellaneousFeesBalance, setMiscellaneousFeesBalance] = React.useState<string>("0.00");
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
        if (formData?.userType === "Student") {
            fetchStudentMiscellaneousFees();
        }
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
    React.useEffect(() => {
        if (!amountTendered) {
            setDistribution({ miscellaneous: 0, tuition: 0, totalPayable: 0, accountsPayable: 0 });
            return;
        }

        let remaining = amountTendered;
        let miscTotal = 0;
        let totalMiscBalance = 0;

        if (checkedItems.length > 0) {
            // ✅ If misc are checked, handle them
            for (const fee of miscellaneousFees) {
                if (checkedItems.includes(fee.nature_of_collection_id.toString())) {
                    totalMiscBalance += Number(fee.balance);
                }
            }

            for (const fee of miscellaneousFees) {
                if (checkedItems.includes(fee.nature_of_collection_id.toString())) {
                    const payAmount = Math.min(remaining, Number(fee.balance));
                    miscTotal += payAmount;
                    remaining -= payAmount;
                }
            }
        }

        // ✅ Always apply excess (or full tendered if no misc checked) to tuition
        const tuitionApplied = Math.min(remaining, Number(tuitionFee));
        remaining -= tuitionApplied;

        // ✅ Totals
        const totalPayable = (checkedItems.length > 0 ? totalMiscBalance : 0) + Number(tuitionFee);
        const accountsPayable = Math.max(totalPayable - amountTendered, 0);

        setDistribution({
            miscellaneous: miscTotal,
            tuition: tuitionApplied,
            totalPayable,
            accountsPayable,
        });

    }, [amountTendered, checkedItems, miscellaneousFees, tuitionFee]);

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
                    label="Reference Number"
                    name="reference_number"
                    value={formData?.reference_number || ""}
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
                        value={formData?.status || ""}
                        onChange={(e) => {
                            setFormData((prev) => ({ ...prev, status: e.target.value }));
                        }}
                        label="Status"
                        margin="dense"
                        disabled={!editable}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">{formData?.status === "approved" ? "Approved" : "Approve"}</MenuItem>
                        <MenuItem value="rejected">{formData?.status === "rejected" ? "Rejected" : "Reject"}</MenuItem>
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
                        disabled={!editable || formData?.status !== 'approved'}
                    >
                        {entryModes && entryModes.map((mode) => (
                            <MenuItem key={mode.entry_mode_id} value={mode.entry_mode_id}>{mode.entry_mode_title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
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
                <FormControl fullWidth disabled={!selectedAccount}>
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
                <FormControl fullWidth  >
                    <TextField
                        fullWidth
                        type="text"
                        name="remarks"
                        label="Remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        margin="dense"
                        disabled={!editable || formData?.status !== 'approved'}
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
                        disabled={!editable || formData?.status !== 'approved'}
                    />
                </FormControl>
                <TextField
                    label="Amount"
                    name="amount_to_pay"
                    placeholder="0.00"
                    value={amountToPay}
                    onChange={(e) => setAmountToPay(parseFloat(Number(e.target.value).toFixed(2)))}
                    type="number"
                    fullWidth
                    margin="dense"
                    disabled={!editable || formData?.status !== 'approved'}
                />
                <TextField
                    label="Tendered Amount"
                    name="tendered_amount"
                    placeholder="0.00"
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(parseFloat(Number(e.target.value).toFixed(2)))}
                    fullWidth
                    margin="dense"
                    disabled={!editable || formData?.status !== 'approved'}
                />
                <Typography variant="body2" color="textSecondary" mt={1}>
                    Change: {amountTendered > 0 ? (amountTendered - amountToPay).toFixed(2) : 0.00}
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
                                            disabled={fee.balance <= 0 || formData?.status !== 'approved'}
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
                            Balance
                        </Typography>
                        <Typography>Miscellaneous: {miscellaneousFeesBalance}</Typography>
                        <Typography>Tuition: {tuitionFee}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="body1" fontWeight="bold">
                            Distribution
                        </Typography>
                        <Typography>For Miscellaneous: {distribution.miscellaneous.toFixed(2)}</Typography>
                        <Typography>For Tuition: {distribution.tuition.toFixed(2)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="body1" fontWeight="bold">
                            Accounts Payable
                        </Typography>
                        <Typography>Accounts Payable: {distribution.accountsPayable.toFixed(2)}</Typography>
                        <Typography>Total Payable: {distribution.totalPayable.toFixed(2)}</Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );

    const renderContent = () => {
        if (!editable) return <Typography>No changes made</Typography>;
        if (cookie.accessToken.isAdministrator) {
            return renderStudentForm();
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
