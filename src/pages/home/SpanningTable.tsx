import React from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { axiosInstanceWithAuthorization } from '../../api/app';
import { useCookies } from 'react-cookie';

function ccyFormat(num: number) {
  return `${num.toFixed(2)}`;
}

interface Row {
  item_title: string;
  amount: string;
  total: string;
  balance: string;
}

const SpanningTable = ({ rows, loadingSoaTable, loadingGrid, setLoading }: { rows: Row[], loadingSoaTable: boolean, loadingGrid: boolean, setLoading: React.Dispatch<React.SetStateAction<{ soa: boolean; soaTable: boolean; grid: boolean; }>> }) => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [data, setData] = React.useState<Row[]>(rows);
  const [totalAmount, setTotalAmount] = React.useState<number>(0);
  const [balance, setBalance] = React.useState<number>(0);
  const [referenceId, setReferenceId] = React.useState<string>("");
  
  const handleTimeOut = () => {
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          const randomString = Math.random().toString(36).substring(9, 12); // temporary reference id
          resolve(`PVERIS-S-${randomString}`)
        }, 1000)
      })
    }
    const handleGenerateReferenceId = async () => {
      setLoading((prevState) => ({ ...prevState, grid: true }))
      try {
        const randomString = await handleTimeOut()
        const formData = new FormData()
        formData.append("reference_code", randomString)
        formData.append("amount", totalAmount.toString())
        formData.append("balance", balance.toString())
        const { data } = await axiosInstanceWithAuthorization(accessToken).post(`/api/transactions/save-reference-id`, formData)
        setReferenceId(data.reference_code)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading((prevState) => ({ ...prevState, grid: false }))
      }
    }
  React.useEffect(() => {
    if(rows.length === 0) return
    setData(rows)
    const uniqueTotal = Array.from(new Set(rows.map(row => row.total))).map(total => ({ ...rows.find(row => row.total === total), total: parseFloat(total) }));
    const uniqueBalance = Array.from(new Set(rows.map(row => row.balance))).map(balance => ({ ...rows.find(row => row.balance === balance), balance: parseFloat(balance) }));
    const formattedAmount = uniqueTotal[0].total
    const formattedBalance = uniqueBalance[0].balance
    setTotalAmount(formattedAmount);
    setBalance(formattedBalance);
  }, [rows])
  if (loadingSoaTable) return <div>Loading...</div>
  if (rows.length === 0) return <div>No data</div>
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <TableContainer component={Paper} sx={{ width: "100%", maxHeight: 800 }}>
        <Table sx={{ width: "100%", overflow: "clip", scrollbarGutter: "auto" }} aria-label="spanning table">
          <TableHead sx={{ position: 'sticky', top: 1, backgroundColor: 'background.paper', zIndex: 1 }}>
            <TableRow>
              <TableCell align="center" colSpan={4} sx={{ position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                Assessment
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.item_title}</TableCell>
                <TableCell>{ccyFormat(Number(item.amount))}</TableCell>
              </TableRow>
            ))}
            
          </TableBody>
          <TableFooter sx={{ position: 'sticky', bottom: 0 }}>
            <TableRow>
              <TableCell align="right" sx={{ backgroundColor: 'background.paper', zIndex: 1 }}>Total</TableCell>
              <TableCell sx={{ backgroundColor: 'background.paper', zIndex: 1 }}>{ccyFormat(Number(totalAmount))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="right" sx={{ backgroundColor: 'background.paper', zIndex: 1 }}>Balance</TableCell>
              <TableCell sx={{ backgroundColor: 'background.paper', zIndex: 1 }}>{ccyFormat(Number(balance))}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {rows.length > 0 && (
        <Button
          variant="contained"
          onClick={handleGenerateReferenceId}
          disabled={loadingGrid}
          sx={{ marginTop: 2 }}
        >
          {loadingGrid ? "Generating..." : "Generate Reference Id"}
        </Button>
      )}
      {(referenceId && (!loadingGrid)) && (
        <>
          <Typography variant="h6" color="initial">Reference ID: {referenceId}</Typography>
          <Alert severity="info">Please be informed that your reference ID will expire in 1 hour, after which you may generate a new one. Kindly copy the reference ID and paste it into the Reference ID field on the Upload Receipt page.</Alert>
        </>
      )}
    </Box>
  );
}

export default React.memo(SpanningTable)