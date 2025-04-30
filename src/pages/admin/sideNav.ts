import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    History as HistoryIcon
} from '@mui/icons-material';

export const sideNav = [
    {
        path: "",
        label: "Dashboard",
        abbreviation: "dash",
        icon: DashboardIcon
    },
    {
        path: "/account-management",
        label: "Accounts",
        abbreviation: "am",
        icon: PeopleIcon
    },
    {
        path: "/transaction-history",
        label: "Transactions",
        abbreviation: "th",
        icon: HistoryIcon
    },
]