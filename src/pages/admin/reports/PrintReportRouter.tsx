import React from "react";
import { useParams } from "react-router-dom";
import DailyCollectionReport from "./DailyCollectionReport";

const PrintReportRouter = () => {
  const { reportType } = useParams<{ reportType: string }>();

  switch (reportType) {
    case "daily-collection":
      return <DailyCollectionReport />;
    default:
      return <div>Report not found</div>;
  }
};

export default PrintReportRouter;
