import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";

import { useMode } from "@iris/api";

import NotFound from "./NotFound";
import Project from "./Project";
import Projects from "./Projects";

function ProjectsMode() {
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

function SingleDocumentMode() {
  return (
    <Switch>
      <Project />
    </Switch>
  );
}

function Router() {
  const { mode } = useMode();

  if (mode && mode.singleDocument === false) {
    return <ProjectsMode />;
  }

  return <SingleDocumentMode />;
}

export default Router;
