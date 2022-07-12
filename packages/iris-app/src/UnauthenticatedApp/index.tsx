import React from "react";

interface Props {
  error: Error;
}

function UnauthenticatedApp({ error }: Props) {
  return <div>{error.message}</div>;
}

export default UnauthenticatedApp;
