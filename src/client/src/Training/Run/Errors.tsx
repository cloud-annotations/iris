import React from 'react'

interface Props {
  failure: any
}

function Errors({ failure }: Props) {
  if (failure === undefined) {
    return null
  }

  return (
    <div>
      <div className="ca--header">Errors</div>
      <pre>{JSON.stringify(failure, null, 2)}</pre>
    </div>
  )
}

export default Errors
