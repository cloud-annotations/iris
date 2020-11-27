import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import useSWR from "swr";

import { endpoint, fetcher } from "@iris/api";

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
  const { data: mode, error } = useSWR(endpoint("/mode"), fetcher);

  if (mode && mode.singleDocument === false) {
    return <ProjectsMode />;
  }

  if (mode && mode.singleDocument === true) {
    return <SingleDocumentMode />;
  }

  if (error === undefined) {
    return "loading...";
  }

  return error;
}

export default Router;
