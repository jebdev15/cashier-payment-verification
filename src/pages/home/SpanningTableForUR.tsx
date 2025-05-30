import { Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React from "react";
import { FileUploadLogType } from "../../types/fileUpload";
import { PanToolOutlined } from "@mui/icons-material";

const SpanningTable = ({ data, loading }: { data: FileUploadLogType[]; loading: boolean }) => {
  const [rows, setRows] = React.useState<FileUploadLogType[]>([]);
  React.useEffect(() => {
    setRows(data);
  }, [data]);
  if (loading) return <div>Loading...</div>;
  return (
    <Box sx={{ width: "100%", border: "solid 1px rgba(0,0,0,0.23)", borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader sx={{ width: "100%" }} aria-label="spanning table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={5}>
                Upload Receipt Log
              </TableCell>
            </TableRow>
            <TableRow sx={{ "& *": { whiteSpace: "nowrap" } }}>
              <TableCell>File Name</TableCell>
              <TableCell>Reference ID</TableCell>
              <TableCell>Mode of Payment</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>No data</TableCell>
              </TableRow>
            )}
            {rows.length > 0 &&
              rows.map((row, index) => (
                <TableRow key={index} sx={{ "& *": { whiteSpace: "nowrap" } }}>
                  <TableCell>{row.fileName}</TableCell>
                  <TableCell>{row.referenceId}</TableCell>
                  <TableCell>{row.mode_of_payment}</TableCell>
                  <TableCell>{row.remarks}</TableCell>
                  <TableCell>{new Date(row.uploadedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SpanningTable;
