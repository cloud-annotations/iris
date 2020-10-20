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
  const { loading, error } = useProject(id);

  if (loading) {
    return <div>LOADING...</div>;
  }

  if (error !== undefined) {
    return <div>ERROR</div>;
  }

  return <ProjectsView />;
}

export default ProjectController;
