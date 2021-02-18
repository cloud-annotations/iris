import React, { useEffect } from "react";

import { Provider, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { ProjectState, store, load } from "@iris/core";

import Header from "./components/Header";
import Main from "./components/Main";
import ObjectDetection from "./editors/ObjectDetection";
import Layout from "./Layout";

function ProjectsView() {
  return (
    <Layout
      header={<Header />}
      main={
        <Main>
          <ObjectDetection />
        </Main>
      }
    />
  );
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
