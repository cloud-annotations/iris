import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";

import NotFound from "./NotFound";
import Project from "./Project";
import Projects from "./Projects";

function Router() {
  return (
    <Switch>
      <Route path="/" exact>
        <Redirect to="/projects" />
      </Route>
      <Route path="/projects" exact>
        <Projects />
      </Route>
      <Route path="/projects/:id" exact>
        <Project />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Router;
