import React, { useEffect } from "react";

import { Provider, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { ProjectState, store, load } from "@iris/store";

import Header from "./Header";
import Layout from "./Layout";
import Main from "./Main";

function ProjectsView() {
  return <Layout header={<Header />} main={<Main />} />;
}

function ProjectController() {
  const status = useSelector((project: ProjectState) => project.meta.status);

  switch (status) {
    case "idle":
    case "pending":
      return <div>LOADING...</div>;
    case "success":
      return <ProjectsView />;
    default:
      return <div>ERROR</div>;
  }
}

function Project() {
  const { connectionID, projectID } = useParams<{
    connectionID: string;
    projectID: string;
  }>();

  useEffect(() => {
    store.dispatch(load(projectID));
  }, [projectID]);

  return (
    <Provider store={store}>
      <ProjectController />
    </Provider>
  );
}

export default Project;
