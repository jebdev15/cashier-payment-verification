export const formatAccessLevel = (level: number): string => {
    switch (level) {
        case 1:
            return "SuperAdmin";
        case 2:
            return "Cashier Admin";
        case 3:
            return "Assessment Admin";
        case 4:
            return "Cashier User";
        case 5:
            return "Assessment User";
        default:
            return "User";
    }
};