import { useEffect } from 'react'
import GoogleAnalytics from 'react-ga'

export const useGoogleAnalytics = page => {
  useEffect(() => {
    GoogleAnalytics.pageview(page)
  }, [page])
}
