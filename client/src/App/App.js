import React, { useEffect } from 'react'

import Collection from 'Collection'
import history from 'globalHistory'
import Localization from './Localization/Localization'
import endpointFinder from './endpointFinder'

const App = ({
  match: {
    params: { bucket }
  }
}) => {
  useEffect(() => {
    const asyncEffect = async () => {
      const endpoint = localStorage.getItem('loginUrl')
      try {
        const collection = await Collection.load(endpoint, bucket)
        console.log(JSON.stringify(collection))
      } catch (error) {
        console.error(error)
        if (error.message === 'Forbidden') {
          history.push('/login')
          return
        }
        await endpointFinder(bucket)
      }
    }
    asyncEffect()
  }, [bucket])
  return <Localization />
}

export default App
