import { useState, useEffect, useCallback } from 'react'
import { isAxiosError, AxiosRequestConfig, Method } from 'axios'
import { useCookies } from 'react-cookie'
import { axiosInstance, axiosInstanceWithAuthorization } from '../api/app'

type UseAxiosOptions<TPayload = any> = {
  url: string
  method?: Method
  data?: TPayload
  config?: AxiosRequestConfig
  skip?: boolean
  authorized?: boolean
}

export function useAxios<TResponse = any, TPayload = any>({
  url,
  method = 'GET',
  data: payload,
  config = {},
  skip = false,
  authorized = false
}: UseAxiosOptions<TPayload>) {
  const [{ accessToken }] = useCookies(['accessToken'])
  const [data, setData] = useState<TResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [reloadTrigger, setReloadTrigger] = useState<number>(0)

  const refetch = useCallback(() => {
    setReloadTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (skip) return

    const controller = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      try {
        const client = authorized
          ? axiosInstanceWithAuthorization(accessToken)
          : axiosInstance

        const response = await client.request<TResponse>({
          url,
          method,
          data: payload,
          signal: controller.signal,
          ...config
        })

        setData(response.data)
        setError(null)
      } catch (err) {
        if (controller.signal.aborted) return
        if (isAxiosError(err)) {
          const message =
            err.response?.data?.message ||
            err.request?.response?.message ||
            'Unknown error'
          setError(message)
        } else {
          setError('An error occurred.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [url, method, JSON.stringify(payload), JSON.stringify(config), authorized, accessToken, reloadTrigger, skip])

  return { data, error, loading, refetch }
}