import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem, Box
} from "@mui/material";
import { useCookies } from "react-cookie";
import { axiosInstanceWithAuthorization } from "@/api/app";

type ExternalAccountData = {
  id: string;
  payorName: string;
  email: string;
  contactNo: string;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: ExternalAccountData | null;
  editable?: boolean;
  onSuccess?: () => void;
};

const ExternalAccountDialog: React.FC<Props> = ({ open, onClose, data, editable = false, onSuccess }) => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [formData, setFormData] = React.useState<ExternalAccountData | null>(data);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field: keyof ExternalAccountData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      await axiosInstanceWithAuthorization(accessToken).put(`/api/users/${formData.id}`, formData);
      onSuccess?.();
      onClose();
    } catch {
      alert("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editable ? "Edit" : "View"} External Account</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField label="Payor Name" value={formData.payorName} onChange={(e) => handleChange("payorName", e.target.value)} fullWidth InputProps={{ readOnly: !editable }} />
          <TextField label="Email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} fullWidth InputProps={{ readOnly: !editable }} />
          <TextField label="Contact No" value={formData.contactNo} onChange={(e) => handleChange("contactNo", e.target.value)} fullWidth InputProps={{ readOnly: !editable }} />
          {editable && (
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} label="Status" onChange={(e) => handleChange("status", e.target.value)}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          )}
          {!editable && <TextField label="Status" value={formData.status.toUpperCase()} InputProps={{ readOnly: true }} fullWidth />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Close</Button>
        {editable && (
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExternalAccountDialog;
