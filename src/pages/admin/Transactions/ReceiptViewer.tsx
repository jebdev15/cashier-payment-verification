import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { useParams } from 'react-router-dom'
import { axiosInstance } from '../../../api/app'
import { isAxiosError } from 'axios'
import { LazyImage } from '../../../components/LazyImage'

const ReceiptViewer = () => {
  const { id } = useParams<{ id: string }>()
  const [image, setImage] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchImage = async () => {
      setLoading(true)
      try {
        const { data } = await axiosInstance.get(`/api/upload/receipts/${id}`, { signal });
        setImage(data.image) // assuming `data.image` is a base64 or URL
      } catch (error) {
        if (signal.aborted) return
        if (isAxiosError(error)) {
          if (error.request) return alert(error.request.response["message"])
          if (error.response) return alert(error.response.data.message)
        }
        console.error("Error fetching receipt:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchImage()
    return () => controller.abort()
  }, [id])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">Receipt for Transaction ID: {id}</Typography>
      <Paper sx={{ mt: 2, p: 2, textAlign: 'center' }}>
        {loading ? (
          <Typography>Loading receipt...</Typography>
        ) : image ? (
          <LazyImage src={image} alt="Receipt" height={"100%"} width={"100%"} />
        ) : (
          <Typography>No receipt image found.</Typography>
        )}
      </Paper>
    </Box>
  )
}

export default React.memo(ReceiptViewer)