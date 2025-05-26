import {
    Paper,
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow
} from '@mui/material';
import React from 'react';
import { FileUploadLogType } from '../../types/fileUpload';

const SpanningTable = ({ data, loading }: { data: FileUploadLogType[], loading: boolean}) => {
  const [rows, setRows] = React.useState<FileUploadLogType[]>([]);
  React.useEffect(() => {
    setRows(data);
  },[data])
  if(loading) return <div>Loading...</div>
  return ( 
    <TableContainer component={Paper} sx={{ width: "100%" }}>
      <Table stickyHeader sx={{ width: "100%" }} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={4}>
              Upload Receipt Log
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>File Name</TableCell>
            <TableCell>Reference ID</TableCell>
            <TableCell>Remarks</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableRow><TableCell colSpan={2}>No data</TableCell></TableRow>}
          {rows.length > 0 && rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.fileName}</TableCell>
              <TableCell>{row.referenceId}</TableCell>
              <TableCell>{row.remarks}</TableCell>
              <TableCell>{new Date(row.uploadedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SpanningTable