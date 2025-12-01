import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  // History as HistoryIcon,
  Repeat as TransactionsIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Article as ReportIcon,
  // Settings as SettingsIcon
} from "@mui/icons-material";

export const sideNav = [
  {
    path: "/dashboard",
    label: "Dashboard",
    abbreviation: "dash",
    icon: DashboardIcon,
  },
  {
    path: "/admin-users",
    label: "Admin Users",
    abbreviation: "au",
    icon: SupervisorAccountIcon,
  },
  {
    path: "/accounts",
    label: "User Accounts",
    abbreviation: "am",
    icon: PeopleIcon,
  },
  {
    path: "/transactions",
    label: "Transactions",
    abbreviation: "th",
    icon: TransactionsIcon,
  },
  {
    path: "/reports",
    label: "Reports",
    abbreviation: "rp",
    icon: ReportIcon,
  },
  // {
  //   path: "/system-log",
  //   label: "System Log",
  //   abbreviation: "sl",
  //   icon: HistoryIcon,
  // }
  // {
  //   path: "/settings",
  //   label: "Settings",
  //   abbreviation: "st",
  //   icon: SettingsIcon,
  // },
];
