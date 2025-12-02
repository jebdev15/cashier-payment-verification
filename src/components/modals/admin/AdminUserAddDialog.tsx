import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Typography
} from "@mui/material";
import { useCookies } from "react-cookie";
import { axiosInstanceWithAuthorization } from "@/api/app";
import type { SysUserType } from "@/hooks/useSysUsersCache";
import { formatAccessLevel } from "@/utils/formatAccessLevel";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    sysUsers: SysUserType[];
    sysLoading?: boolean;
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

const AdminUserAddDialog: React.FC<Props> = ({ open, onClose, onSuccess, sysUsers, sysLoading = false }) => {
    const [{ accessToken }] = useCookies(["accessToken"]);

    const [selectedSysUserId, setSelectedSysUserId] = React.useState("");
    const [fullname, setFullname] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [accessLevel, setAccessLevel] = React.useState("");
    const [active, setActive] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (selectedSysUserId) {
            const picked = sysUsers.find(u => u.userId === selectedSysUserId);
            if (picked) {
                setFullname(picked.fullname);
                setEmail(picked.email);
            }
        }
    }, [selectedSysUserId, sysUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosInstanceWithAuthorization(accessToken).post("/api/admin-sys-users", {
                userId: selectedSysUserId,
                fullname,
                email,
                accessLevel,
                status: active ? 1 : 0
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert("Failed to add admin user");
        } finally {
            setSaving(false);
        }
    };
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add Admin User</DialogTitle>
            <DialogContent dividers>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2, mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>ACS User</InputLabel>
                        <Select
                            value={selectedSysUserId}
                            label="Sys User"
                            onChange={(e) => setSelectedSysUserId(e.target.value)}
                            disabled={sysLoading}
                        >
                            {sysUsers.map(u => (
                                <MenuItem key={u.userId} value={u.userId}>
                                    {u.fullname} ({u.email}) - {formatAccessLevel(u.accessLevel)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Full Name"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        fullWidth
                        required
                    />
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
                                <MenuItem selected={Number(accessLevel) === Number(level.accessLevel)} key={level.id} value={level.id}>{level.label}</MenuItem>
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

                    <Typography variant="caption" color="text.secondary">
                        Sys users cached: {sysUsers.length}
                    </Typography>

                    <DialogActions sx={{ px: 0 }}>
                        <Button onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={saving || !accessLevel || !selectedSysUserId}>
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AdminUserAddDialog;
