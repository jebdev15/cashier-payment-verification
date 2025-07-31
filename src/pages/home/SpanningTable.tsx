import React from "react";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { axiosInstanceWithAuthorization } from "../../api/app";
import { useCookies } from "react-cookie";

function ccyFormat(num: number) {
  return `${num.toFixed(2)}`;
}

interface Row {
  item_title: string;
  fullName: string;
  program_code: string;
  year_level_roman: string;
  school_year: number;
  semester: string;
  amount: string;
  total: string;
  balance: string;
  amount_paid: string;
}

const SpanningTable = ({ rows, loadingSoaTable, loadingGrid, setLoading }: { rows: Row[]; loadingSoaTable: boolean; loadingGrid: boolean; setLoading: React.Dispatch<React.SetStateAction<{ soa: boolean; soaTable: boolean; grid: boolean }>> }) => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [data, setData] = React.useState<Row[]>(rows);
  const [totalAmount, setTotalAmount] = React.useState<number>(0);
  const [balance, setBalance] = React.useState<number>(0);
  const [amountPaid, setAmountPaid] = React.useState<number>(0);
  const [referenceId, setReferenceId] = React.useState<string>("");
  const [particulars, setParticulars] = React.useState<string>("TUITION AND MISCELLANEOUS FEES");
  const handleGenerateReferenceId = async () => {
    setLoading((prevState) => ({ ...prevState, grid: true }));
    try {
      const formData = new FormData();
      formData.append("name_of_payor", data[0].fullName);
      formData.append("program_code", data[0].program_code);
      formData.append("year_level_roman", data[0].year_level_roman);
      formData.append("school_year", data[0].school_year.toString());
      formData.append("semester", data[0].semester);
      formData.append("amount", totalAmount.toString());
      formData.append("balance", balance.toString());
      formData.append("amount_paid", amountPaid.toString());
      formData.append("particulars", particulars);
      const { data: data2 } = await axiosInstanceWithAuthorization(accessToken).post(`/api/transactions/save-reference-id`, formData);
      setReferenceId(data2.reference_code);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prevState) => ({ ...prevState, grid: false }));
    }
  };
  React.useEffect(() => {
    if (rows.length === 0) return;
    setData(rows);
    console.log({ rows });
    const uniqueTotal = Array.from(new Set(rows.map((row) => row.total))).map((total) => ({ ...rows.find((row) => row.total === total), total: parseFloat(total) }));
    const uniqueBalance = Array.from(new Set(rows.map((row) => row.balance))).map((balance) => ({ ...rows.find((row) => row.balance === balance), balance: parseFloat(balance) }));
    const uniqueAmountPaid = Array.from(new Set(rows.map((row) => row.amount_paid))).map((amountPaid) => ({ ...rows.find((row) => row.amount_paid === amountPaid), amount_paid: parseFloat(amountPaid) }));
    setTotalAmount(uniqueTotal[0].total);
    setBalance(uniqueBalance[0].balance);
    setAmountPaid(uniqueAmountPaid[0].amount_paid);
  }, [rows]);
  if (loadingSoaTable) return <div>Loading...</div>;
  if (rows.length === 0) return <div>No data</div>;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}>
      <TableContainer component={Paper} sx={{ width: "100%" }}>
        <Table sx={{ width: "100%", overflow: "clip", scrollbarGutter: "auto" }} aria-label="spanning table">
          <TableHead sx={{ position: "sticky", top: 1, backgroundColor: "background.paper", zIndex: 1 }}>
            <TableRow>
              <TableCell align="center" colSpan={4} sx={{ position: "sticky", top: 0, backgroundColor: "background.paper", zIndex: 1 }}>
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
          <TableFooter sx={{ position: "sticky", bottom: 0 }}>
            <TableRow>
              <TableCell align="right" sx={{ backgroundColor: "background.paper", zIndex: 1 }}>
                Total
              </TableCell>
              <TableCell sx={{ backgroundColor: "background.paper", zIndex: 1 }}>{ccyFormat(Number(totalAmount))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="right" sx={{ backgroundColor: "background.paper", zIndex: 1 }}>
                Balance
              </TableCell>
              <TableCell sx={{ backgroundColor: "background.paper", zIndex: 1 }}>{ccyFormat(Number(balance))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="right" sx={{ backgroundColor: "background.paper", zIndex: 1 }}>
                Amount Paid
              </TableCell>
              <TableCell sx={{ backgroundColor: "background.paper", zIndex: 1 }}>{ccyFormat(Number(amountPaid))}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {rows.length > 0 && (
        <>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Particulars</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={particulars}
              label="Particulars"
              onChange={(e) => setParticulars(e.target.value)}
              inputProps={{
                sx: {
                  whiteSpace: "normal !important",
                },
              }}
            >
              <MenuItem sx={{ whiteSpace: "normal !important" }} value={"TUITION AND MISCELLANEOUS FEES"}>TUITION AND MISCELLANEOUS FEES</MenuItem>
            </Select>
          </FormControl>
          <Button size="large" variant="contained" onClick={handleGenerateReferenceId} disabled={loadingGrid} sx={{ borderRadius: 2 }}>
            {loadingGrid ? "Generating..." : "Generate Reference Id"}
          </Button>
        </>
      )}
      {referenceId && !loadingGrid && (
        <Box component={Paper} sx={{ padding: 2, bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h6" color="initial">
            Reference ID: {referenceId}
          </Typography>
          <Alert severity="info">Please be informed that your reference ID will expire in 1 hour, after which you may generate a new one. Kindly copy the reference ID and paste it into the Reference ID field on the Upload Receipt page.</Alert>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SpanningTable);
