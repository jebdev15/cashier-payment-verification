import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    History as HistoryIcon
} from '@mui/icons-material';

export const sideNav = [
    {
        path: "/admin",
        label: "Dashboard",
        abbreviation: "dash",
        icon: DashboardIcon
    },
    {
        path: "/admin/account-management",
        label: "Account Management",
        abbreviation: "am",
        icon: PeopleIcon
    },
    {
        path: "/admin/transaction-history",
        label: "Transaction History",
        abbreviation: "th",
        icon: HistoryIcon
    },
]