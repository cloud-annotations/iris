import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import { endpoint, fetcher } from "@iris/api";
import { fetchConnections, RootState } from "@iris/store";
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

function ProjectsController({ connections }: { connections: any[] }) {
  const params = useParams<any>();

  const connection = connections?.find((c) => c.id === params.id);

  const { data: projects } = useSWR(
    connection
      ? endpoint("/projects", {
          query: {
            providerID: connection.providerID,
            connectionID: connection.id,
          },
        })
      : null,
    fetcher
  );
  // useFetchAction();
  // const { connections, error: err2 } = useConnections();
  // console.log(connections);

  // const { projects, connections } = useProjects();

  // if (connections.data !== undefined && projects.data !== undefined) {
  //   return (
  //     <ProjectsView projects={projects.data} connections={connections.data} />
  //   );
  // }

  // if (connections.status === "error" && projects.status !== "error") {
  //   return <div>LOADING...</div>;
  // }

  if (!connections) {
    return <div>LOADING...</div>;
  }

  return <ProjectsView projects={projects ?? []} connections={connections} />;
}

export default ProjectsController;
