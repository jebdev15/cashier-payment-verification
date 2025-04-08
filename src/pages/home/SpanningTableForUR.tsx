import {
    Paper,
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow
} from '@mui/material';


function createRow(fileName: string, fileUploadedAt: Date) {
  return { fileName, fileUploadedAt };
}

interface Row {
  fileName: string;
  fileUploadedAt: number;
}

const rows = [
  createRow('Tuition_Fee.jpg', new Date()),
  createRow('Miscellaneous.jpeg', new Date()),
  createRow('Academic Fee.jpeg', new Date()),
  createRow('Athletic Fee.jpeg', new Date()),
  createRow('Dental Fee.jpeg', new Date()),
  createRow('ICT Development Fee.jpeg', new Date()),
];

const SpanningTable = () => {
  return (
    <TableContainer component={Paper} sx={{ maxWidth: 400 }}>
      <Table sx={{ maxWidth: 400 }} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={4}>
              Upload Receipt Log
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>File Name</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.fileName}</TableCell>
              <TableCell align="right">{new Date(row.fileUploadedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SpanningTable