import { createBrowserRouter } from "react-router";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";

import HomeLayoutContextProvider from "../context/HomeLayoutContext";
import HomeLayout from "../pages/home/Layout";
import StatementOfAccount from "../pages/home/StatementOfAccount";
import UploadReceipt from "../pages/home/UploadReceipt";
import TransactionHistory from "../pages/home/TransactionHistory";

import AdminLogin from "../pages/admin/Login"
import AdminLayoutContextProvider from "../context/AdminLayoutContext";
import AdminLayout from "../pages/admin/Layout";
import Dashboard from "../pages/admin/Dashboard";
import ShowAccounts from "../pages/admin/Accounts/ShowAccounts";
import EditAccount from "../pages/admin/Accounts/EditAccount";
import ShowTransactions from "../pages/admin/Transactions/ShowTransactions";
import EditTransaction from "../pages/admin/Transactions/EditTransaction";

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
        ],
    },
    {
        path: "/sign-in",
        element: <AdminLogin />,
    },
    {
        path: "/admin",
        element: <AdminLayoutContextProvider>
                    <AdminLayout />
                </AdminLayoutContextProvider>,
        children: [
            {
                path: "dashboard",
                element: <Dashboard />,
            },
            {
                path: "accounts",
                element: <ShowAccounts />,
            },
            {
                path: "accounts/:id",
                element: <EditAccount />,
            },
            {
                path: "transactions",
                element: <ShowTransactions />,
            },
            {
                path: "transactions/:transactionId",
                element: <EditTransaction />,
            },
        ],
    },
]);