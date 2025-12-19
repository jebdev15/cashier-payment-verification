import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem, Box
} from "@mui/material";
import { useCookies } from "react-cookie";
import { axiosInstanceWithAuthorization } from "@/api/app";
import type { SysUserType } from "@/hooks/useSysUsersCache";
import { AdminAccountDataType } from "@/pages/admin/Accounts/type";

type Props = {
  open: boolean;
  onClose: () => void;
  data: AdminAccountDataType | null;
  onSuccess: () => void;
  sysUsers: SysUserType[];
};

const accessLevels = [
    {
        id: 1,
        label: "Super Admin",
        accessLevel: 1
    },
    {
        id: 2,
        label: "Admin",
        accessLevel: 2
    },
    {
        id: 3,
        label: "Cashier Admin",
        accessLevel: 3
    },
    {
        id: 4,
        label: "Cashier User",
        accessLevel: 4
    },
    {
        id: 5,
        label: "Assessment Admin",
        accessLevel: 5
    },
    {
        id: 6,
        label: "Assessment User",
        accessLevel: 6
    }
];

const AdminUserEditDialog: React.FC<Props> = ({ open, onClose, data, onSuccess, sysUsers }) => {
  const [{ accessToken }] = useCookies(["accessToken"]);

  const [email, setEmail] = React.useState(data?.email || "");
  const [accessLevel, setAccessLevel] = React.useState(data?.accessLevel || "");
  const [active, setActive] = React.useState((data?.status ?? 1) === 1);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (data) {
      setEmail(data.email);
      setAccessLevel(data.accessLevel);
      setActive((data.status ?? 1) === 1);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await axiosInstanceWithAuthorization(accessToken).put(`/api/admin-sys-users/${data.userId}`, {
        email,
        accessLevel,
        status: active ? 1 : 0
      });
      onSuccess();
      onClose();
    } catch {
      alert("Failed to update admin user");
    } finally {
      setSaving(false);
    }
  };

  const matchedSys = data ? sysUsers.find(u => Number(u.userId) === data.userId) : null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Admin User</DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label="Sys User"
            value={matchedSys ? `${matchedSys.fullname} (${matchedSys.email})` : data?.userId || ""}
            fullWidth
            InputProps={{ readOnly: true }}
          />
          {/* <TextField
            label="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            fullWidth
            required
          /> */}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>Access Level</InputLabel>
            <Select
              value={accessLevel}
              label="Access Level"
              onChange={(e) => setAccessLevel(e.target.value)}
              required
            >
              {accessLevels.map(level => (
                <MenuItem selected={Number(level.accessLevel) === Number(accessLevel)} key={level.id} value={level.id}>{level.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={active ? "active" : "inactive"}
              label="Status"
              onChange={(e) => setActive(e.target.value === "active")}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserEditDialog;
