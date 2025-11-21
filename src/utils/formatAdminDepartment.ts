export const formatAdminDepartment = (deptId: number): string => {
    switch (deptId) {
        case 1:
            return "Cashier";
        case 2:
            return "Assessment";
        default:
            return "";
    }
};