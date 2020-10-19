import React from "react";

import { useParams } from "react-router-dom";

import { useProject } from "src/state/project";

import Header from "./Header";
import Layout from "./Layout";
import Main from "./Main";

function ProjectsView() {
  return <Layout header={<Header />} main={<Main />} />;
}

function ProjectController() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useProject(id);

  if (data !== undefined) {
    return <ProjectsView />;
  }

  if (error === undefined) {
    return <div>LOADING...</div>;
  }

  return <div>ERROR</div>;
}

export default ProjectController;
