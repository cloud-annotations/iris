import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import useSWR from "swr";

import { endpoint, fetcher } from "@iris/api";
import { fetchConnections, RootState } from "@iris/store";

import NotFound from "./NotFound";
import Project from "./Project";
import Projects from "./Projects";

function ProjectsMode() {
  const { data: connections, error } = useSWR(
    endpoint("/connections"),
    fetcher
  );
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch(fetchConnections());
  // }, [dispatch]);

  // const connections = useSelector(
  //   (state: RootState) => state.connections.connections
  // );

  // const status = useSelector((state: RootState) => state.connections.status);

  return (
    <Switch>
      <Route path="/" exact>
        {connections && !error ? (
          <Redirect to={`/c/${connections[0].id}`} />
        ) : null}
      </Route>
      <Route path="/c" exact>
        {connections && !error ? (
          <Redirect to={`/c/${connections[0].id}`} />
        ) : null}
      </Route>
      <Route path="/c/:id" exact>
        <Projects connections={connections} />
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
