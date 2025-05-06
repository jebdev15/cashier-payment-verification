import React from 'react'
import { Alert, Box, Button, Divider, FormControl, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, SelectChangeEvent, Typography } from '@mui/material'
import SpanningTable from './SpanningTable'
import { useCookies } from 'react-cookie'
import { axiosInstanceWithAuthorization } from '../../api/app'
import { isAxiosError } from 'axios'

type StatementOfAccountDataType = {
  id: number,
  student_id: string,
  school_year: number,
  semester: string,
  item_title: string,
  amount: string
}

const StatementOfAccount = () => {
  const [{ accessToken }] = useCookies(["accessToken"])
  const [statementOfAccountData, setStatementOfAccountData] = React.useState<StatementOfAccountDataType[]>([])
  const [filteredData, setFilteredData] = React.useState<StatementOfAccountDataType[]>([])
  const [dataToFilter, setDataToFilter] = React.useState<{ school_year: number, semester: string }>({ school_year: new Date().getFullYear(), semester: "" })
  const [schoolYears, setSchoolYears] = React.useState<number[]>([])
  const [semesters, setSemesters] = React.useState<string[]>([])
  // const [referenceId, setReferenceId] = React.useState<string>("")
  const [loading, setLoading] = React.useState<{
    soa: boolean;
    soaTable: boolean;
    grid: boolean
  }>({
    soa: false,
    soaTable: false,
    grid: false
  })
  // const handleTimeOut = () => {
  //   return new Promise<string>((resolve) => {
  //     setTimeout(() => {
  //       const randomString = Math.random().toString(36).substring(9, 12); // temporary reference id
  //       resolve(`PVERIS-S-${randomString}`)
  //     }, 1000)
  //   })
  // }
  // const handleGenerateReferenceId = async () => {
  //   setLoading((prevState) => ({ ...prevState, grid: true }))
  //   try {
  //     const randomString = await handleTimeOut()
  //     const formData = new FormData()
  //     formData.append("reference_code", randomString)
  //     const { data } = await axiosInstanceWithAuthorization(accessToken).post(`/api/soa/save-reference-id`, formData)
  //     setReferenceId(data.reference_code)
  //   } catch (error) {
  //     console.error(error)
  //   } finally {
  //     setLoading((prevState) => ({ ...prevState, grid: false }))
  //   }
  // }
  const handleChange = (event: SelectChangeEvent<number | string>) => {
    setDataToFilter((prevData) => ({ ...prevData, [event.target.name]: event.target.value }))
  }
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    return new Promise<void>((resolve) => {
      event.preventDefault();
      setLoading((prevState) => ({ ...prevState, soaTable: true }))
      const data = statementOfAccountData.filter(({ school_year, semester }: { school_year: number, semester: string }) => school_year === dataToFilter.school_year && semester === dataToFilter.semester)
      setFilteredData(data)
      setTimeout(() => {
        setLoading((prevState) => ({ ...prevState, soaTable: false }))
        resolve()
      }, 1000)
    })
  }
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchStatementOfAccount = async () => {
      try {
        setLoading((prevState) => ({ ...prevState, soa: true }))
        const { data } = await axiosInstanceWithAuthorization(accessToken).get("/api/soa/student-id", { signal });
        const filteredData = data.filter((item: StatementOfAccountDataType) => parseFloat(item.amount))
        setStatementOfAccountData(filteredData)
        const uniqueSchoolYear: number[] = Array.from(new Set(data.filter(({ school_year }: { school_year: number }) => Number(school_year)).map(({ school_year }: { school_year: number }) => Number(school_year))))
        setSchoolYears(uniqueSchoolYear)
        const uniqueSemesters: string[] = Array.from(new Set(data.filter(({ semester }: { semester: string }) => semester).map(({ semester }: { semester: string }) => semester)))
        setSemesters(uniqueSemesters)
      } catch (error) {
        console.error({ error })
        if (signal.aborted) return;
        if (isAxiosError(error)) {
          if (error.request) return alert(error.request.response)
          if (error.response) return alert(error.response.data.message)
        }
        alert("Something went wrong")
      } finally {
        if (signal.aborted) setLoading((prevState) => ({ ...prevState, soa: false }))
      }
    }
    fetchStatementOfAccount()
    return () => controller.abort();
  }, [accessToken])
  if (loading.soa) return <Typography variant="h4" color="initial">Loading...</Typography>
  if (statementOfAccountData.length === 0) return <Typography variant="h4" color="initial">No data found</Typography>
  return (
    <Box sx={{ flexGrow: 1, paddingLeft: 5, height: "100%", overflow: "auto" }}>
      <Typography variant="h4" color="initial">Statement of Account</Typography>
      <Paper sx={{ display: "flex", flexDirection: { xs: "column", md: "row"}, gap: 2, height: "100%", width: "100%" }}>
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "center", 
            gap: 2, 
            padding: 5,
            width: { xs: "100%", md: "50%" }
          }} 
          component={"form"} 
          onSubmit={handleSubmit}
        >
          <FormControl fullWidth>
            <InputLabel id="select-school-year-label">School Year</InputLabel>
            <Select
              labelId="select-school-year-label"
              id="select-school-year"
              label="School Year"
              name="school_year"
              onChange={handleChange}
            >
              {schoolYears.length > 0 && schoolYears.map((item, index) => (
                <MenuItem key={index} value={item}>{`${item} - ${item + 1}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="select-school-semester-label">Semester</InputLabel>
            <Select
              labelId="select-school-semester-label"
              id="select-school-semester"
              name="semester"
              label="Semester"
              onChange={handleChange}
            >
              {semesters.length > 0 && semesters.map((item, index) => (
                <MenuItem key={index} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained">FILTER</Button>
        </Box>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <SpanningTable rows={filteredData} loadingSoaTable={loading.soaTable} loadingGrid={loading.grid} setLoading={setLoading} />
          {/* {filteredData.length > 0 && (
            <Button
              variant="contained"
              onClick={handleGenerateReferenceId}
              disabled={loading.grid}
              sx={{ marginTop: 2 }}
            >
              {loading.grid ? "Generating..." : "Generate Reference Id"}
            </Button>
          )}
          {(referenceId && (!loading.grid)) && (
            <>
              <Typography variant="h6" color="initial">Reference Id: {referenceId}</Typography>
              <Alert severity="info">Please be informed that your reference ID will expire in 1 hour, after which you can generate a new one.</Alert>
            </>
          )} */}
        </Box>
      </Paper>
    </Box>
  )
}

export default React.memo(StatementOfAccount)