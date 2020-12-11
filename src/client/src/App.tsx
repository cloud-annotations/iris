import globalHistory from 'globalHistory'
import React, { Suspense, lazy, useState, useEffect } from 'react'

import { checkLoginStatus } from './Utils'

// This will result in `<link rel="prefetch" href="login-modal-chunk.js">` being
// appended in the head of the page, which will instruct the browser to prefetch
// in idle time the `authenticated-app-chunk.js` file.
const AuthenticatedApp = React.lazy(
  () => import(/* webpackPrefetch: true */ './Routing')
)
const UnauthenticatedApp = lazy(() => import('./Home/Home'))

const useCookieCheck = (interval: number) => {
  const [attemptedPage, setAttemptedPage] = useState<string>()
  const [authenticated, setAuthenticated] = useState(false)
  useEffect(() => {
    const cookieCheck = () => {
      try {
        checkLoginStatus()
        setAuthenticated(true)
      } catch {
        if (globalHistory.location.pathname !== '/login') {
          setAttemptedPage(
            globalHistory.location.pathname + globalHistory.location.search
          )
          setAuthenticated(false)
        }
      }
    }
    cookieCheck()
    const id = setInterval(cookieCheck, interval)
    return () => clearInterval(id)
  }, [interval])

  return { attemptedPage, authenticated }
}

function App() {
  const { attemptedPage, authenticated } = useCookieCheck(10 * 1000)
  return (
    <Suspense fallback={<div>loading...</div>}>
      {authenticated ? (
        <AuthenticatedApp />
      ) : (
        <UnauthenticatedApp attemptedPage={attemptedPage} />
      )}
    </Suspense>
  )
}

export default App
