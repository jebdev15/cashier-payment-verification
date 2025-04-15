import { createBrowserRouter } from "react-router";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";

import HomeLayout from "../pages/home/Layout";
import StatementOfAccount from "../pages/home/StatementOfAccount";
import UploadReceipt from "../pages/home/UploadReceipt";
import TransactionHistory from "../pages/home/TransactionHistory";

import AdminLayout from "../pages/admin/Layout";
import Dashboard from "../pages/admin/Dashboard";
import AccountManagement from "../pages/admin/AccountManagement";
import AdminTransactionHistory from "../pages/admin/TransactionHistory";

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
        element: <HomeLayout />,
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
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: "account-management",
                element: <AccountManagement />,
            },
            {
                path: "transaction-history",
                element: <AdminTransactionHistory />,
            },
        ],
    },
]);