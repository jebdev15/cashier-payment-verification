import {
    AccountBalance as AccountBalanceIcon,
    FileUpload as FileUploadIcon,
    History as HistoryIcon
} from '@mui/icons-material'

export const sideNav = [
    {
        path: "",
        label: "Statement of Account",
        abbreviation: "sao",
        icon: AccountBalanceIcon,
    },
    {
        path: "/upload-receipt",
        label: "Upload Receipt",
        abbreviation: "ur",
        icon: FileUploadIcon
    },
    {
        path: "/upload-receipt/external",
        label: "Upload Receipt",
        abbreviation: "ur-ex",
        icon: FileUploadIcon
    },
    {
        path: "/transaction-history",
        label: "Transaction History",
        abbreviation: "th",
        icon: HistoryIcon
    }
]