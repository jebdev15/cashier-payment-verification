import React from "react";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from "@mui/material";
import { axiosInstanceWithAuthorization } from "../../api/app";
import { useCookies } from "react-cookie";
import { theme } from "@/theme/theme";

function ccyFormat(num: number) {
  return `${num.toFixed(2)}`;
}

interface Row {
  id: number;
  student_account_id: number;
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
  const [studentAccountId, setStudentAccountId] = React.useState<number>(0);
  const [particulars, setParticulars] = React.useState<string>("TUITION AND MISCELLANEOUS FEES");
  const handleGenerateReferenceId = async () => {
    setLoading((prevState) => ({ ...prevState, grid: true }));
    try {
      const formData = new FormData();
      formData.append("student_account_id", studentAccountId.toString());
      formData.append("name_of_payor", data[0].fullName);
      formData.append("program_code", data[0].program_code);
      formData.append("year_level_roman", data[0].year_level_roman);
      formData.append("school_year", data[0].school_year.toString());
      formData.append("semester", data[0].semester);
      formData.append("amount", totalAmount.toString());
      formData.append("balance", balance.toString());
      formData.append("amount_paid", amountPaid.toString());
      formData.append("particulars", particulars);
      const { data: data2 } = await axiosInstanceWithAuthorization(accessToken).post(`/api/transactions/save-reference-id/Student`, formData);
      setReferenceId(data2.reference_id);
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
    const uniqueStudentAccountIds = Array.from(new Set(rows.map((row) => row.student_account_id)));
    setStudentAccountId(uniqueStudentAccountIds[0]);
    setTotalAmount(uniqueTotal[0].total);
    setBalance(uniqueBalance[0].balance);
    setAmountPaid(uniqueAmountPaid[0].amount_paid);
  }, [rows]);
  if (loadingSoaTable) return <div>Loading...</div>;
  if (rows.length === 0) return <div>No data</div>;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 3, bgcolor: "background.paper", borderRadius: 2, overflow: "hidden" }}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Table sx={{ width: "100%" }} size="small" aria-label="assessment table">
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                colSpan={4}
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: "semi-bold",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                  px: 4,
                  py: 3,
                }}
              >
                Assessment
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", pl: 4, pr: 2, py: 1.5 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold", pr: 4, pl: 2, py: 1.5 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell sx={{ pl: 4, pr: 2, textTransform: "Capitalize" }}>{item.item_title.toLowerCase()}</TableCell>
                <TableCell sx={{ pr: 4, pl: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.5 }}>
                    ₱<Typography fontFamily="monospace">{ccyFormat(Number(item.amount))}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter sx={{ borderTop: "4px double rgba(224, 224, 224, 1)" }}>
            <TableRow>
              <TableCell sx={{ color: "text.primary", fontWeight: "bold", pl: 4, pr: 2, py: 1.5, fontSize: "0.875rem", textTransform: "uppercase" }}>Total</TableCell>
              <TableCell sx={{ pl: 2, pr: 4, fontWeight: "bold", fontSize: "0.875rem" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ₱
                  <Typography fontFamily="monospace" fontWeight={"bold"} sx={{ color: "info.main" }}>
                    {ccyFormat(Number(totalAmount))}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "text.primary", fontWeight: "bold", pl: 4, pr: 2, py: 1.5, fontSize: "0.875rem", textTransform: "uppercase" }}>Balance</TableCell>
              <TableCell sx={{ pl: 2, pr: 4, fontWeight: "bold", fontSize: "0.875rem" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ₱
                  <Typography fontFamily="monospace" fontWeight={"bold"} sx={{ color: balance > 0 ? "error.main" : "success.main" }}>
                    {ccyFormat(Number(balance))}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "text.primary", fontWeight: "bold", pl: 4, pr: 2, py: 1.5, fontSize: "0.875rem", textTransform: "uppercase" }}>Amount Paid</TableCell>
              <TableCell sx={{ pl: 2, pr: 4, fontWeight: "bold", fontSize: "0.875rem" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ₱
                  <Typography fontFamily="monospace" fontWeight={"bold"} sx={{ color: "success.main" }}>
                    {ccyFormat(Number(amountPaid))}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {rows.length > 0 && (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
            <InputLabel id="particulars-select-label">Particulars</InputLabel>
            <Select
              labelId="particulars-select-label"
              id="particulars-select"
              value={particulars}
              label="Particulars"
              onChange={(e) => setParticulars(e.target.value)}
              sx={{
                borderRadius: 3,
              }}
              inputProps={{
                sx: {
                  whiteSpace: "normal !important",
                },
              }}
            >
              <MenuItem sx={{ whiteSpace: "normal !important" }} value={"TUITION AND MISCELLANEOUS FEES"}>
                Tuition and Miscellaneous Fees
              </MenuItem>
            </Select>
          </FormControl>
          <Button
            size="large"
            variant="contained"
            onClick={handleGenerateReferenceId}
            disabled={loadingGrid}
            sx={{
              borderRadius: 3,
              bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 75%, transparent)`,
              "&:hover": {
                bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 100%, transparent)`,
              },
            }}
          >
            {loadingGrid ? "Generating..." : "Generate Reference ID"}
          </Button>
        </Box>
      )}
      {referenceId && !loadingGrid && (
        <Paper
          elevation={0}
          sx={{
            padding: 3,
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Reference ID
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                color: "primary.main",
                letterSpacing: "0.5px",
              }}
            >
              {referenceId}
            </Typography>
          </Box>
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              "& .MuiAlert-message": {
                fontSize: "0.875rem",
              },
            }}
          >
            Please be informed that your reference ID will expire in 24 hours, after which you may generate a new one. Kindly copy the reference ID and paste it into the Reference ID field on the Upload Receipt page.
          </Alert>
        </Paper>
      )}
    </Box>
  );
};

export default React.memo(SpanningTable);
