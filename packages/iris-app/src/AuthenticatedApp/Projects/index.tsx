import React from "react";

import { useProjects } from "@iris/store";
import { IProject } from "@iris/store/dist/project";

import Connections from "./Connections";
import Header from "./Header";
import Layout from "./Layout";
import Main from "./Main";

interface ProjectProps {
  projects: IProject[];
  connections: any[];
}

function ProjectsView({ projects, connections }: ProjectProps) {
  return (
    <Layout
      header={<Header />}
      left={<Connections connections={connections} />}
      main={<Main projects={projects} />}
    />
  );
}

function ProjectsController() {
  // const { connections, error: err2 } = useConnections();
  // console.log(connections);

  const { projects, connections } = useProjects();

  if (connections.data !== undefined && projects.data !== undefined) {
    return (
      <ProjectsView projects={projects.data} connections={connections.data} />
    );
  }

  if (connections.status === "error" && projects.status !== "error") {
    return <div>LOADING...</div>;
  }

  return <div>ERROR</div>;
}

export default ProjectsController;
