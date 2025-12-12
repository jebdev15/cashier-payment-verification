import {
    Home as HomeIcon,
    FileUpload as FileUploadIcon,
    History as HistoryIcon
} from '@mui/icons-material'

export const sideNav = [
    {
        path: "",
        label: "Home",
        abbreviation: "home",
        icon: HomeIcon,
        userType: ["Student"]
    },
    {
        path: "/upload-receipt",
        label: "Upload Receipt",
        abbreviation: "ur",
        icon: FileUploadIcon,
        userType: ["Student", "External", "Employee"]
    },
    {
        path: "/transaction-history",
        label: "Transaction History",
        abbreviation: "th",
        icon: HistoryIcon,
        userType: ["Student", "External", "Employee"]
    }
]