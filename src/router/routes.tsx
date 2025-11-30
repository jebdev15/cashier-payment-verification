import React from "react";
import { createBrowserRouter } from "react-router";

const LandingPage = React.lazy(() => import("../pages/LandingPage"));
const Login = React.lazy(() => import("../pages/Login"));
const Register = React.lazy(() => import("../pages/Register"));

const RouteErrorElement = React.lazy(() => import("../components/errors/RouteErrorElement"));
const HomeLayoutContextProvider = React.lazy(() => import("../context/HomeLayoutContext"));
const HomeLayout = React.lazy(() => import("../pages/home/Layout"));
const StatementOfAccount = React.lazy(() => import("../pages/home/StatementOfAccount"));
const UploadReceipt = React.lazy(() => import("../pages/home/UploadReceipt"));
const ExternalHomePage = React.lazy(() => import("../pages/home/ExternalHomepage"));
const EmployeeHomePage = React.lazy(() => import("../pages/home/EmployeeHomepage"));
const TransactionHistory = React.lazy(() => import("../pages/home/TransactionHistory"));

const AdminLogin = React.lazy(() => import("../pages/admin/Login"));
const AdminLayoutContextProvider = React.lazy(() => import("../context/AdminLayoutContext"));
const AdminLayout = React.lazy(() => import("../pages/admin/Layout"));
const Dashboard = React.lazy(() => import("../pages/admin/Dashboard"));
const ShowAccounts = React.lazy(() => import("../pages/admin/Accounts/ShowAccounts"));
const EditAccount = React.lazy(() => import("../pages/admin/Accounts/EditAccount"));
const ShowAdminAccounts = React.lazy(() => import("../pages/admin/Accounts/AdminAccounts"));
// const EditAdminAccount = React.lazy(() => import("../pages/admin/Accounts/EditAdminAccount"));
const ShowTransactions = React.lazy(() => import("../pages/admin/Transactions/ShowTransactions"));
const AdminReportsPage = React.lazy(() => import("../pages/admin/Reports"));
const PrintReportRouter = React.lazy(() => import("../pages/admin/reports/PrintReportRouter"));
const AdminSettings = React.lazy(() => import("../pages/admin/Settings"));
const SystemLog = React.lazy(() => import("../pages/admin/SystemLog"));
export const routes = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
        errorElement: <div>404</div>,
        children: [
            {
                index: true,
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            }
        ],
    },
    {
        path: "/home",
        element: <HomeLayoutContextProvider>
            <HomeLayout />
        </HomeLayoutContextProvider>,
        errorElement: <RouteErrorElement />,
        children: [
            {
                index: true,
                element: <StatementOfAccount />,
            },
            {
                path: "upload-receipt",
                element: <UploadReceipt />,
            },
            {
                path: "transaction-history",
                element: <TransactionHistory />,
            },
            {
                path: "external",
                children: [
                    {
                        index: true,
                        element: <ExternalHomePage />,
                    },
                ]
            },
            {
                path: "employee",
                children: [
                    {
                        index: true,
                        element: <EmployeeHomePage />,
                    },
                ]
            }
        ],
    },
    {
        path: "/admin/sign-in",
        element: <AdminLogin />,
    },
    {
        path: "/admin",
        element: <AdminLayoutContextProvider>
            <AdminLayout />
        </AdminLayoutContextProvider>,
        errorElement: <RouteErrorElement />,
        children: [
            {
                path: "dashboard",
                element: <Dashboard />,
            },
            {
                path: "admin-users",
                errorElement: <RouteErrorElement />,
                children: [
                    {
                        index: true,
                        element: <ShowAdminAccounts />,
                    },
                ]
            },
            {
                path: "accounts",
                errorElement: <RouteErrorElement />,
                children: [
                    {
                        index: true,
                        element: <ShowAccounts />,
                    },
                    {
                        path: ":id",
                        element: <EditAccount />,
                    },
                ]
            },
            {
                path: "transactions",
                errorElement: <RouteErrorElement />,
                children: [
                    {
                        index: true,
                        element: <ShowTransactions />,
                    },
                ]
            },
            {
                path: "reports",
                errorElement: <RouteErrorElement />,
                children: [
                    {
                        index: true,
                        element: <AdminReportsPage />,
                    },
                    {
                        path: "print/:reportType",
                        element: <PrintReportRouter />,
                    }
                ]
            },
            {
                path: "system-log",
                errorElement: <RouteErrorElement />,
                children: [
                    {
                        index: true,
                        element: <SystemLog />,
                    },
                ]
            },
            {
                path: "settings",
                errorElement: <RouteErrorElement />,
                children: [
                    {
                        index: true,
                        element: <AdminSettings />,
                    },
                ]
            }
        ],
    },
]);