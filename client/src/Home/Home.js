import React, { useEffect } from 'react'
import { checkLoginStatus } from 'Utils'

import history from 'globalHistory'

const useCheckIfLoggedIn = () => {
  useEffect(() => {
    try {
      checkLoginStatus()
      history.push('/')
    } catch (error) {
      console.log(error)
    }
  }, [])
}

const Home = () => {
  useCheckIfLoggedIn()
  return (
    <>
      <a href="/auth/login">Continue with IBM Cloud</a>
    </>
  )
}

export default Home
