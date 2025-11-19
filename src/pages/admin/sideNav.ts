import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  Report as ReportIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Settings as SettingsIcon
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
    icon: HistoryIcon,
  },
  {
    path: "/reports",
    label: "Reports",
    abbreviation: "rp",
    icon: ReportIcon,
  },
  // {
  //   path: "/settings",
  //   label: "Settings",
  //   abbreviation: "st",
  //   icon: SettingsIcon,
  // },
];
