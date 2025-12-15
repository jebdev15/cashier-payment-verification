import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button, Grid, Typography, Select, MenuItem, IconButton,
    Checkbox, Table, TableBody, TableCell, TableHead, TableRow,
    Divider, FormControl, InputLabel, Chip, Box, ListItemText,
    CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { axiosInstance } from "@/api/app";
import { fees } from "@/pages/admin/Transactions/fees";
import { SnackbarState, TransactionDataType } from "@/pages/admin/Transactions/type";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import { extractAccountItemTitle } from "@/utils/extractAccountItemTitle";
import ReceiptPreviewDialog from "./ReceiptPreviewDialog";
import SubmittedReceiptPreviewDialog from "./SubmittedReceiptPreviewDialog";

type Props = {
    open: boolean;
    data: TransactionDataType | null;
    entryModes?: TransactionModalEntryModeType[];
    snackbar?: SnackbarState;
    onClose: () => void;
    onSave?: (updatedData: TransactionDataType, checkedItems?: string[], entryMode?: string, details?: string, remarks?: string, amountToPay?: number, amountTendered?: number, selectedAccount?: string) => void;
    editable?: boolean;
    allParticulars?: any[];
    loading?: boolean;
};

type TransactionModalEntryModeType = {
    entry_mode_id: number;
    entry_mode_title: string;
    entry_mode_desc: string;
    credit: string;
    debit: string;
};

const TransactionDialogForStudent: React.FC<Props> = ({
    open,
    data,
    entryModes,
    onClose,
    onSave,
    editable = false,
    allParticulars = [],
    loading = false,
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
    const [adminParticulars, setAdminParticulars] = React.useState<number[]>([]);
    const [payorParticulars, setPayorParticulars] = React.useState<any[]>([]);
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [submittedReceiptPreviewOpen, setSubmittedReceiptPreviewOpen] = React.useState(false);
    // const [miscellaneousFeesBalance, setMiscellaneousFeesBalance] = React.useState<string>("0.00");
    const [distribution, setDistribution] = React.useState({
        miscellaneous: 0,
        tuition: 0,
        totalPayable: 0,
        accountsPayable: 0,
    });
    const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false);
    // 🔹 Handle checkbox toggle for misc fees
    const handleCheckedItems = (
        event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => {
        const itemId = event.target.value;
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
                .map(id => allParticulars.find(p => p.particular_id === id)?.item_title)
                .filter(Boolean)
                .join(', ');
            
            onSave({ 
                ...formData, 
                checkedItems, 
                miscellaneousFees, 
                entryMode, 
                details, 
                remarks, 
                amountToPay, 
                amountTendered, 
                selectedAccount, 
                distribution, 
                adminParticulars,
                adminParticularsText: adminParticularsNames
            });
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
            
            // Parse payor particulars
            if (data.payorParticulars) {
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
        }
    }, [data]);
    React.useEffect(() => {
        const fetchStudentMiscellaneousFees = async () => {
            try {
                const response = await axiosInstance.get(`/api/transactions/miscellaneous-fees/${data?.studentAccountId}`);
                if (response.data) {
                    // Process the fees data as needed
                    console.log("Fees data:", response.data);

                    // map server snake_case fields to camelCase aliases for local usage
                    const implementMiscellaneousFeesId = response.data?.miscellaneousFee?.map((fee: any, index: number) => ({
                        ...fee,
                        id: ++index,
                        // camelCase aliases (keep original keys too)
                        natureOfCollectionId: fee.natureOfCollectionId ?? fee.nature_of_collection_id,
                        itemTitle: fee.itemTitle ?? fee.item_title,
                        amount: fee.amount,
                        balance: fee.balance,
                    })) || [];

                    console.log({ implementMiscellaneousFeesId });
                    setMiscellaneousFees(implementMiscellaneousFeesId);

                    // Log the balances to the console
                    console.log("Balances:", response.data?.unpaidMiscellaneousFees);
                    setTuitionFee(response.data?.tuitionFee?.total || "0.00");
                }
            } catch (error) {
                console.error("Error fetching fees:", error);
            }
        };
        const updateFormDataIfApproved = () => {
            if (!editable && formData?.status === 'approved') {
                setSelectedAccount(formData.accountType || "");
                setDetails(formData.details || "");
                setRemarks(formData.remarks || "");
                setAmountTendered(parseFloat(formData.amountTendered || "0"));
            }
        }
        if (cookie?.accessToken) {
            const { isAdministrator } = jwtDecode<{ isAdministrator: boolean }>(cookie.accessToken);
            if (isAdministrator) {
                // If admin, not editable
                fetchStudentMiscellaneousFees();
                setIsAuthorized(true);
                return;
            }
        }

        updateFormDataIfApproved();
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
    // React.useEffect(() => {
    //     if (!amountTendered) {
    //         setDistribution({ miscellaneous: 0, tuition: 0, totalPayable: 0, accountsPayable: 0 });
    //         return;
    //     }

    //     let remaining = amountTendered;
    //     let miscTotal = 0;
    //     let totalMiscBalance = 0;

    //     if (checkedItems.length > 0) {
    //         // ✅ If misc are checked, handle them
    //         for (const fee of miscellaneousFees) {
    //             if (checkedItems.includes(fee.nature_of_collection_id.toString())) {
    //                 totalMiscBalance += Number(fee.balance);
    //             }
    //         }

    //         for (const fee of miscellaneousFees) {
    //             if (checkedItems.includes(fee.nature_of_collection_id.toString())) {
    //                 const payAmount = Math.min(remaining, Number(fee.balance));
    //                 miscTotal += payAmount;
    //                 remaining -= payAmount;
    //             }
    //         }
    //     }

    //     // ✅ Always apply excess (or full tendered if no misc checked) to tuition
    //     const tuitionApplied = Math.min(remaining, Number(tuitionFee));
    //     remaining -= tuitionApplied;

    //     // ✅ Totals
    //     const totalPayable = (checkedItems.length > 0 ? totalMiscBalance : 0) + Number(tuitionFee);
    //     const accountsPayable = Math.max(totalPayable - amountTendered, 0);

    //     setDistribution({
    //         miscellaneous: miscTotal,
    //         tuition: tuitionApplied,
    //         totalPayable,
    //         accountsPayable,
    //     });

    // }, [amountTendered, checkedItems, miscellaneousFees, tuitionFee]);
    React.useEffect(() => {
        // ✅ Reset when there's no tendered amount
        if (!amountTendered) {
            setDistribution({
                miscellaneous: 0,
                tuition: 0,
                totalPayable: 0,
                accountsPayable: 0,
            });
            return;
        }

        let remaining = amountTendered;

        // ✅ Step 1: Filter selected miscellaneous fees
        const selectedMiscFees = miscellaneousFees.filter((fee) => {
            const nid = fee.natureOfCollectionId;
            return checkedItems.includes(nid?.toString());
        });

        // ✅ Step 2: Compute total miscellaneous balance
        // const totalMiscBalance = selectedMiscFees.reduce(
        //     (sum, fee) => sum + Number(fee.balance),
        //     0
        // );

        // ✅ Step 3: Apply payment to miscellaneous first
        let miscPaid = 0;
        for (const fee of selectedMiscFees) {
            const balance = Number(fee.balance);
            const payAmount = Math.min(remaining, balance);
            miscPaid += payAmount;
            remaining -= payAmount;

            if (remaining <= 0) break;
        }

        // ✅ Step 4: Apply remaining to tuition
        const tuitionBalance = Number(tuitionFee);
        const tuitionPaid = Math.min(remaining, tuitionBalance);
        remaining -= tuitionPaid;

        // ✅ Step 5: Compute totals
        // const totalPayable = totalMiscBalance + tuitionBalance;
        // const accountsPayable = Math.max(amountTendered - amountToPay, 0);
        const accountsPayable = amountTendered - amountToPay;


        setDistribution({
            miscellaneous: miscPaid,
            tuition: tuitionPaid,
            totalPayable: 0,
            accountsPayable,
        });

    }, [amountTendered, checkedItems, miscellaneousFees, tuitionFee]);

    React.useEffect(() => {
        if (data) {
            setFormData({
                ...data,
                // canonicalize some keys to camelCase for local editing
                referenceId: data.referenceId,
                referenceNumber: data.referenceNumber,
                studentId: data.studentId,
                amountToPay: data.amountToPay,
                amountTendered: data.amountTendered,
            });
        }
        if (!editable && (formData?.status ?? data?.status) === 'approved') {
            const fd = formData ?? data;
            setSelectedAccount(fd?.accountType ?? "");
            setDetails(fd?.details ?? "");
            setRemarks(fd?.remarks ?? "");
            setAmountToPay(parseFloat((fd?.amountToPay ?? "0").toString()));
            setAmountTendered(parseFloat((fd?.amountTendered ?? "0").toString()));
            setDistribution((prev) => ({
                ...prev,
                tuition: Number(fd?.distribution?.tuition) || 0,
                miscellaneous: Number(fd?.distribution?.miscellaneous) || 0,
            }));
        }
    }, []);
    /**
     * 🟢 SECTION RENDERERS
     */
    const renderStudentForm = () => {
        return isAuthorized
            ? (
                < Grid container spacing={3} >
                    {/* 1. Account Details */}
                    < Grid size={{ xs: 12, md: 4 }
                    }>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Account Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary">Student Account ID</Typography>
                            <Typography variant="body1">{formData?.studentAccountId || "N/A"}</Typography>
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
                            <Typography variant="caption" color="textSecondary">Student ID</Typography>
                            <Typography variant="body1">{formData?.studentId || "N/A"}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary">Payor Name</Typography>
                            <Typography variant="body1">{formData?.payor || "N/A"}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary">Balance</Typography>
                            <Typography variant="body1" color="error.main">₱{Number(formData?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary">Amount Paid</Typography>
                            <Typography variant="body1" color="success.main">₱{Number(formData?.amountPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary">Total</Typography>
                            <Typography variant="body1" fontWeight="bold">₱{Number(formData?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        </Box>
                        
                    </Grid >

                    {/* 2. Payment */}
                    < Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Payment Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <FormControl fullWidth sx={{ mb: 2 }}>
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
                        {/* Display Payor's Selected Particulars */}
                        {payorParticulars && payorParticulars.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                    Particulars Selected by Payor:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {payorParticulars.map((particular, index) => {
                                        const particularName = typeof particular === 'object' && particular?.name 
                                            ? particular.name 
                                            : (allParticulars.find(p => p.particular_id === particular)?.item_title || extractAccountItemTitle(particular, allParticulars));
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
                        <FormControl fullWidth disabled={!selectedAccount}>
                            <InputLabel id="admin-particulars-select">Admin Particulars (Multiple Selection)</InputLabel>
                            <Select
                                labelId="admin-particulars-select"
                                multiple
                                value={adminParticulars}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setAdminParticulars(typeof value === 'string' ? [] : value);
                                }}
                                label="Admin Particulars (Multiple Selection)"
                                margin="dense"
                                disabled={!editable || !selectedAccount || formData?.status !== 'approved'}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const particular = allParticulars.find(p => p.particular_id === value);
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
                                        <MenuItem key={particular.particular_id} value={particular.particular_id}>
                                            <Checkbox checked={adminParticulars.indexOf(particular.particular_id) > -1} />
                                            <ListItemText 
                                                primary={particular.item_title} 
                                                sx={{ whiteSpace: "normal !important" }}
                                            />
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
                            name="amountToPay"
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
                            name="tenderedAmount"
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
                    </Grid >

                    {/* 3. Miscellaneous Fees */}
                    < Grid size={{ xs: 12, md: 4 }}>
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
                                                    value={fee.natureOfCollectionId?.toString()}
                                                    disabled={(fee.balance ?? 0) <= 0 || formData?.status !== 'approved'}
                                                    checked={!!checkedItems.includes((fee.natureOfCollectionId ?? "").toString())}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>{fee.itemTitle}</TableCell>
                                        <TableCell>{fee.amount}</TableCell>
                                        <TableCell>{fee.balance}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid >

                    {/* 4. Summary */}
                    < Grid size={12} >
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Summary
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            {/* <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="body1" fontWeight="bold">
                                    Balance
                                </Typography>
                                <Typography>Miscellaneous: {miscellaneousFeesBalance}</Typography>
                                <Typography>Tuition: {tuitionFee}</Typography>
                            </Grid> */}
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
                                <Typography>Amount: {distribution.accountsPayable.toFixed(2)}</Typography>
                                {/* <Typography>Total Payable: {distribution.totalPayable.toFixed(2)}</Typography> */}
                            </Grid>
                        </Grid>
                    </Grid >
                </Grid >
            )
            : (
                < Grid container spacing={3} >
                    {/* 1. Account Details */}
                    < Grid size={12}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Account Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TextField
                            label="Student Account ID"
                            value={formData?.studentAccountId || ""}
                            onChange={handleChange}
                            type="number"
                            fullWidth
                            margin="dense"
                            disabled
                        />
                        <TextField
                            label="Reference ID"
                            name="referenceId"
                            value={formData?.referenceId ?? ""}
                            onChange={handleChange}
                            fullWidth
                            margin="dense"
                            disabled
                        />
                        <TextField
                            label="Reference Number"
                            name="referenceNumber"
                            value={formData?.referenceNumber ?? ""}
                            onChange={handleChange}
                            fullWidth
                            margin="dense"
                            disabled
                        />
                        <TextField
                            label="Student ID"
                            name="studentId"
                            value={formData?.studentId ?? ""}
                            fullWidth
                            margin="dense"
                            disabled
                        />
                        <TextField
                            label="Payor Name"
                            name="payor"
                            value={formData?.payor || ""}
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
                            name="amountPaid"
                            value={formData?.amountPaid ?? ""}
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
                    </Grid >
                </Grid>
            )
    };

    const renderContent = () => {
        return renderStudentForm();
    };

    const getSelectedParticularsForPreview = () => {
        return adminParticulars
            .map(id => allParticulars.find(p => p.particular_id === id))
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
                title="Submitted Receipt - Student"
            />
        </>
    );
};

export default React.memo(TransactionDialogForStudent);
