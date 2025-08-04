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
} from "@mui/material";

export type TransactionData = {
    id?: string;
    name_of_payor?: string;
    student_id?: string;
    reference_code?: string;
    amount?: number;
    balance?: number;
    amount_paid?: number;
    particulars?: string;
    purpose?: string;
    status?: string;
    created_at?: string;
    filePath?: string;
};

type Props = {
    open: boolean;
    data: TransactionData | null;
    onClose: () => void;
    onSave?: (updatedData: TransactionData) => void;
    editable?: boolean;
};

const TransactionModal: React.FC<Props> = ({
    open,
    data,
    onClose,
    onSave,
    editable = false,
}) => {
    const [formData, setFormData] = React.useState<TransactionData | null>(data);
    const [image, setImage] = React.useState<string | null>(null);
    React.useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev!, [name]: value }));
    };

    const handleSubmit = () => {
        if (formData && onSave) {
            onSave(formData);
        }
    };
    React.useEffect(() => {
        if (data) {
            const filePath = data?.filePath;
            const imageUrl = `${import.meta.env.VITE_API_URL}/${filePath}`;
            console.log(filePath, imageUrl)
            // Optional: only display image if it's .jpg, .jpeg, .png
            const validImage = /\.(jpg|jpeg|png)$/i.test(filePath);
            if (validImage) setImage(imageUrl);
        }
    }, [data]);
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {editable ? "Update Transaction" : "View Transaction"}
            </DialogTitle>
            <DialogContent dividers>
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
                            name="reference_code"
                            value={formData?.reference_code || ""}
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
                        <TextField
                            label="Status"
                            name="status"
                            value={formData?.status || ""}
                            onChange={handleChange}
                            fullWidth
                            disabled={!editable}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Created At"
                            value={formData?.created_at ? new Date(formData.created_at).toLocaleString() : ""}
                            fullWidth
                            disabled
                        />
                    </Grid>
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
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
                {editable && (
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Save
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default TransactionModal;