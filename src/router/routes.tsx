import { createBrowserRouter } from "react-router";
import HomeLayout from "../pages/home/Layout";
import StatementOfAccount from "../pages/home/StatementOfAccount";
import UploadReceipt from "../pages/home/UploadReceipt";
import PaymentHistory from "../pages/home/PaymentHistory";
export const routes = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            {
                index: true,
                element: <StatementOfAccount />,
            },
            {
                path: "/upload-receipt",
                element: <UploadReceipt />,
            },
            {
                path: "/payment-history",
                element: <PaymentHistory />,
            },
        ],
    },
]);