import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem, Box, Typography
} from "@mui/material";
import { useCookies } from "react-cookie";
import { axiosInstanceWithAuthorization } from "@/api/app";

type EmployeeAccountData = {
  id: string;
  userId: string;
  payor: string;
  idNumber: string;
  email: string;
  contactNo: string;
  designation: string;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: EmployeeAccountData | null;
  editable?: boolean;
  onSuccess?: () => void;
};

const EmployeeAccountDialog: React.FC<Props> = ({ open, onClose, data, editable = false, onSuccess }) => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [formData, setFormData] = React.useState<EmployeeAccountData | null>(data);
  const [saving, setSaving] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field: keyof EmployeeAccountData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setSaving(true);
    setConfirmOpen(false);
    try {
      if (formData.status === "rejected") {
        // Delete the account if rejected
        await axiosInstanceWithAuthorization(accessToken).delete(`/api/users/${formData.userId}`);
      } else {
        // Update the account if approved or pending
        await axiosInstanceWithAuthorization(accessToken).put(`/api/users/${formData.userId}`, formData);
      }
      onSuccess?.();
      onClose();
    } catch {
      alert(`Failed to update account`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  if (!formData) return null;

  const getConfirmMessage = () => {
    if (formData.status === "rejected") {
      return "Are you sure you want to reject and delete this account? This action cannot be undone.";
    } else if (formData.status === "approved") {
      return "Are you sure you want to approve this account?";
    }
    return "Are you sure you want to update this account?";
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{editable ? "Edit" : "View"} Employee Account</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Payor</Typography>
              <Typography variant="body1">{formData.payor}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">ID Number</Typography>
              <Typography variant="body1">{formData.idNumber}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body1">{formData.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Contact No</Typography>
              <Typography variant="body1">{formData.contactNo}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Designation</Typography>
              <Typography variant="body1">{formData.designation}</Typography>
            </Box>
            {editable ? (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} label="Status" onChange={(e) => handleChange("status", e.target.value)}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approve</MenuItem>
                  <MenuItem value="rejected">Reject</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Typography variant="body1">{formData.status.toUpperCase()}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Close</Button>
          {editable && (
            <Button variant="contained" onClick={handleSaveClick} disabled={saving || formData.status === "pending"}>
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>{getConfirmMessage()}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} disabled={saving}>Cancel</Button>
          <Button variant="contained" color={formData.status === "rejected" ? "error" : "primary"} onClick={handleSubmit} disabled={saving}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployeeAccountDialog;
