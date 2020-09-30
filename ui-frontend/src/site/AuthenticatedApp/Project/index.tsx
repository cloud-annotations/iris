import React from "react";

import { Project } from "cloud-annotations-types";
import { useParams } from "react-router-dom";

import { useProject } from "src/state/appstatic/api";

import Header from "./Header";
import Layout from "./Layout";

interface ProjectProps {
  project: Project;
}

function ProjectsView({ project }: ProjectProps) {
  return (
    <Layout
      header={<Header project={project} />}
      main={<div>{project.name}</div>}
    />
  );
}

function ProjectController() {
  const { id } = useParams<{ id: string }>();
  const { project, error } = useProject(id);

  if (project !== undefined) {
    return <ProjectsView project={project} />;
  }

  if (error === undefined) {
    return <div>LOADING...</div>;
  }

  return <div>ERROR</div>;
}

export default ProjectController;
