import React from 'react';
import {
    Paper,
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow
} from '@mui/material';

function ccyFormat(num: number) {
  return `${num.toFixed(2)}`;
}

interface Row {
  item_title: string;
  amount: string;
}

const SpanningTable = ({ rows, loading }: { rows: Row[], loading: boolean }) => {
  const [data, setData] = React.useState<Row[]>(rows);
  const calculateTotalAmount = React.useMemo(() => {
     return rows.reduce((acc, { amount }) => acc + Number(amount), 0);
  },[rows])
  React.useEffect(() => {
    console.log({rows})
    setData(rows)    
  },[rows])
  if(loading) return <div>Loading...</div>
  if(rows.length === 0) return <div>No data</div>
  return (
    <TableContainer component={Paper} sx={{ maxWidth: 400, maxHeight: 400 }}>
      <Table sx={{ maxWidth: 400, overflow: "scroll" }} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={4} sx={{ position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
              Assessment
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ position: 'sticky', top: 1, backgroundColor: 'background.paper', zIndex: 1 }}>Description</TableCell>
            <TableCell align="right" sx={{ position: 'sticky', top: 1, backgroundColor: 'background.paper', zIndex: 1 }}>Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.item_title}</TableCell>
              <TableCell align="right">{ccyFormat(Number(item.amount))}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell align="right" sx={{ position: 'sticky', bottom: 0, backgroundColor: 'background.paper', zIndex: 1 }}>Total</TableCell>
            <TableCell align="right" sx={{ position: 'sticky', bottom: 0, backgroundColor: 'background.paper', zIndex: 1 }}>{ccyFormat(calculateTotalAmount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default React.memo(SpanningTable)