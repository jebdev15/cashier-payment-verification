import React from 'react'
import { Box, Button, Paper,Typography } from '@mui/material'
import SpanningTable from './SpanningTable'

const StatementOfAccount = () => {
  const [referenceId, setReferenceId] = React.useState<string>("")
  const [loading, setLoading] = React.useState<boolean>(false)
  const handleTimeOut = () => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const randomString = Math.random().toString(36).substring(2, 12); // temporary reference id
        setReferenceId(randomString)
        resolve()
      }, 2000)
    })
  }
  const handleGenerateReferenceId = async () => {
    setLoading(true)
    try {
      await handleTimeOut()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Box sx={{ flexGrow: 1, paddingLeft: 5}}>
      <Typography variant="h4" color="initial">Statement of Account</Typography>
      <Paper sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, height: "100%", width: "100%" }}>
          <SpanningTable />
          <Button 
            variant="contained" 
            onClick={handleGenerateReferenceId} 
            disabled={loading}>
              { loading ? "Generating..." : "Generate Reference Id"}
          </Button>
          { (referenceId && (!loading)) && <Typography variant="h6" color="initial">Reference Id: {referenceId}</Typography> }
      </Paper>
    </Box>
  )
}

export default React.memo(StatementOfAccount)