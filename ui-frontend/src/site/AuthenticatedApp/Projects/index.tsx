import React from "react";

import { Link } from "react-router-dom";

import { useProjects } from "src/state/appstatic/api";
import { Project } from "src/types";

interface ProjectProps {
  projects: Project[];
}

function ProjectsView({ projects }: ProjectProps) {
  return (
    <ul>
      {projects.map((project) => {
        return (
          <li>
            <Link to={`/projects/${project.id}`}>
              <span>{project.name}</span>
              <span>{project.id}</span>
              <span>{new Date(project.created).getFullYear()}</span>
            </Link>
          </li>
        );
      })}
    </ul>
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
