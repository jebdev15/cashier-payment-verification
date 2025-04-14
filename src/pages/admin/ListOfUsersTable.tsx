import {
    Paper,
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow
} from '@mui/material';

function createRow(name: string) {
  return { name };
}

const rows = [
  createRow('John Doe'),
  createRow('John Smith'),
  createRow('John Colins'),
  createRow('Taylor Smith'),
  createRow('Brian Smith'),
];

const ListOfUsersTable = () => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ overflow: "scroll" }} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={4}>
              List of Users
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell align="right">Email Address</TableCell>
            <TableCell align="right">Role</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">{`email${++index}@example.com`}</TableCell>
              <TableCell align="right">Student</TableCell>
              <TableCell align="right">Pending</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ListOfUsersTable