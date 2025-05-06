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
}

const SpanningTable = ({ rows, loadingSoaTable, loadingGrid, setLoading }: { rows: Row[], loadingSoaTable: boolean, loadingGrid: boolean, setLoading: React.Dispatch<React.SetStateAction<{ soa: boolean; soaTable: boolean; grid: boolean; }>> }) => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [data, setData] = React.useState<Row[]>(rows);
  const [totalAmount, setTotalAmount] = React.useState<number>(0);
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
        const { data } = await axiosInstanceWithAuthorization(accessToken).post(`/api/transactions/save-reference-id`, formData)
        setReferenceId(data.reference_code)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading((prevState) => ({ ...prevState, grid: false }))
      }
    }
  React.useEffect(() => {
    const calculateTotalAmount = () => {
      return rows.reduce((acc, { amount }) => acc + Number(amount), 0);
    }
    const total = calculateTotalAmount();
    setTotalAmount(total);
    setData(rows)
  }, [rows])
  if (loadingSoaTable) return <div>Loading...</div>
  if (rows.length === 0) return <div>No data</div>
  return (
    <Box>
      <TableContainer component={Paper} sx={{ width: "100%", maxHeight: 400 }}>
        <Table sx={{ width: "100%", overflow: "scroll" }} aria-label="spanning table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={4} sx={{ position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                Assessment
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ position: 'sticky', top: 1, backgroundColor: 'background.paper', zIndex: 1 }}>Description</TableCell>
              <TableCell sx={{ position: 'sticky', top: 1, backgroundColor: 'background.paper', zIndex: 1 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.item_title}</TableCell>
                <TableCell>{ccyFormat(Number(item.amount))}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell align="right" sx={{ position: 'sticky', bottom: 0, backgroundColor: 'background.paper', zIndex: 1 }}>Total</TableCell>
              <TableCell sx={{ position: 'sticky', bottom: 0, backgroundColor: 'background.paper', zIndex: 1 }}>{ccyFormat(totalAmount)}</TableCell>
            </TableRow>
          </TableBody>
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
          <Typography variant="h6" color="initial">Reference Id: {referenceId}</Typography>
          <Alert severity="info">Please be informed that your reference ID will expire in 1 hour, after which you can generate a new one.</Alert>
        </>
      )}
    </Box>
  );
}

export default React.memo(SpanningTable)