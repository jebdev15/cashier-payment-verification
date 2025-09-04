import React from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography, useMediaQuery } from "@mui/material";
import SpanningTable from "./SpanningTable";
import { useAxios } from "../../hooks/useAxios";

type StatementOfAccountDataType = {
  id: number;
  student_id: string;
  fullName: string;
  program_code: string;
  year_level_roman: string;
  school_year: number;
  semester: string;
  item_title: string;
  amount: string;
  total: string;
  balance: string;
};

const StatementOfAccount = () => {
  const isMediumScreen = useMediaQuery("(max-width: 900px)");
  const [statementOfAccountData, setStatementOfAccountData] = React.useState<StatementOfAccountDataType[]>([]);
  const [filteredData, setFilteredData] = React.useState<StatementOfAccountDataType[]>([]);
  const [dataToFilter, setDataToFilter] = React.useState<{ school_year: number; semester: string }>({ school_year: new Date().getFullYear(), semester: "" });
  const [schoolYears, setSchoolYears] = React.useState<number[]>([]);
  const [semesters, setSemesters] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<{
    soa: boolean;
    soaTable: boolean;
    grid: boolean;
  }>({
    soa: false,
    soaTable: false,
    grid: false,
  });
  const handleChange = (event: SelectChangeEvent<number | string>) => {
    setDataToFilter((prevData) => ({ ...prevData, [event.target.name]: event.target.value }));
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    return new Promise<void>((resolve) => {
      event.preventDefault();
      setLoading((prevState) => ({ ...prevState, soaTable: true }));
      const data = statementOfAccountData.filter(({ school_year, semester }: { school_year: number; semester: string }) => school_year === dataToFilter.school_year && semester === dataToFilter.semester);
      setFilteredData(data);
      setTimeout(() => {
        setLoading((prevState) => ({ ...prevState, soaTable: false }));
        resolve();
      }, 1000);
    });
  };
  const {
    data: soaData,
    loading: soaLoading,
    error: soaError,
  } = useAxios({
    url: "/api/soa/student-id",
    authorized: true,
  });
  React.useEffect(() => {
    if (soaData) {
      const filteredData = soaData.map((item: StatementOfAccountDataType) => ({
        ...item,
        amount: isNaN(parseFloat(item.amount)) ? 0 : parseFloat(item.amount),
        total: isNaN(parseFloat(item.total)) ? 0 : parseFloat(item.total),
        balance: isNaN(parseFloat(item.balance)) ? 0 : parseFloat(item.balance),
      }));

      setStatementOfAccountData(filteredData);
      const uniqueSchoolYear: number[] = Array.from(new Set(soaData.filter(({ school_year }: { school_year: number }) => Number(school_year)).map(({ school_year }: { school_year: number }) => Number(school_year))));
      setSchoolYears(uniqueSchoolYear);
      const uniqueSemesters: string[] = Array.from(new Set(soaData.filter(({ semester }: { semester: string }) => semester).map(({ semester }: { semester: string }) => semester)));
      setSemesters(uniqueSemesters);
    }
  }, [soaData]);
  if (soaLoading)
    return (
      <Typography variant="h4" color="initial">
        Loading...
      </Typography>
    );
  if (soaError)
    return (
      <Typography variant="h4" color="initial">
        {soaError}
      </Typography>
    );
  if (statementOfAccountData.length === 0)
    return (
      <Typography variant="body1" color="initial">
        No outstanding balance. There are no accounts available for payment.
      </Typography>
    );
  return (
    <Box sx={{ flexGrow: 1, height: "100%" }}>
      <Typography variant={isMediumScreen ? "h5" : "h4"} color="initial" sx={{ mb: 4 }}>
        Statement of Account
      </Typography>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 4, height: "100%", width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", lg: "30%" },
            minWidth: { xs: "100%", lg: "275px" },
          }}
          component={"form"}
          onSubmit={handleSubmit}
        >
          <FormControl fullWidth>
            <InputLabel id="select-school-year-label">School Year</InputLabel>
            <Select sx={{ borderRadius: 2 }} labelId="select-school-year-label" id="select-school-year" label="School Year" name="school_year" onChange={handleChange}>
              {schoolYears.length > 0 && schoolYears.map((item, index) => <MenuItem key={index} value={item}>{`${item} - ${item + 1}`}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="select-school-semester-label">Semester</InputLabel>
            <Select sx={{ borderRadius: 2 }} labelId="select-school-semester-label" id="select-school-semester" name="semester" label="Semester" onChange={handleChange}>
              {semesters.length > 0 &&
                semesters.map((item, index) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button sx={{ borderRadius: 2 }} fullWidth size="large" type="submit" variant="contained">
            FILTER
          </Button>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#f0f0f0",
            borderRadius: 4,
            padding: 2,
          }}
        >
          <SpanningTable rows={filteredData} loadingSoaTable={loading.soaTable} loadingGrid={loading.grid} setLoading={setLoading} />
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(StatementOfAccount);
