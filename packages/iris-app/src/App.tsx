import React, { Suspense, lazy } from "react";

import { useAuthentication } from "@iris/api";

// This will result in `<link rel="prefetch" href="login-modal-chunk.js">` being
// appended in the head of the page, which will instruct the browser to prefetch
// in idle time the `authenticated-app-chunk.js` file.
const AuthenticatedApp = React.lazy(
  () => import(/* webpackPrefetch: true */ "./site/AuthenticatedApp")
);
const UnauthenticatedApp = lazy(() => import("./site/UnauthenticatedApp"));

function App() {
  const authenticated = useAuthentication();
  return (
    <Suspense fallback={<div>loading...</div>}>
      {authenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </Suspense>
  );
}

export default App;
