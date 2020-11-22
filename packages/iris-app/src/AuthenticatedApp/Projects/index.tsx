import React from "react";

import { useProjects } from "@iris/api";
import { IProject } from "@iris/store/dist/project";

import Connections from "./Connections";
import Header from "./Header";
import Layout from "./Layout";
import Main from "./Main";

interface ProjectProps {
  projects: IProject[];
}

function ProjectsView({ projects }: ProjectProps) {
  return (
    <Layout
      header={<Header />}
      left={<Connections />}
      main={<Main projects={projects} />}
    />
  );
}

function ProjectsController() {
  const { projects, error } = useProjects();

  if (projects !== undefined) {
    return <ProjectsView projects={projects} />;
  }

  if (error === undefined) {
    return <div>LOADING...</div>;
  }

  return <div>ERROR</div>;
}

export default ProjectsController;
