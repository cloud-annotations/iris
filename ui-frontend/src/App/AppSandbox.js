import React from 'react'

import App from './App'

const AppSandbox = () => {
  const match = {
    params: { bucket: 'recyclenet' }
  }
  const location = {
    search: 'location=us'
  }
  return <App match={match} location={location} sandbox />
}

export default AppSandbox
