import React from "react";

import { useParams } from "react-router-dom";

import { useProject } from "src/state/appstatic/api";
import { Project } from "src/types";

interface ProjectProps {
  project: Project;
}

function ProjectsView({ project }: ProjectProps) {
  return <div>{project.name}</div>;
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
