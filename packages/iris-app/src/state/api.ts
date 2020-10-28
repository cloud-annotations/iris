import useSWR from "swr";

import { Project } from "src/project";
import API from "src/util/api";

const appstaticAPI = new API();

export function useAuthentication() {
  const checkAuthentication = appstaticAPI.endpoint("/auth/status");
  const { error } = useSWR(checkAuthentication);

  // NOTE: pretends to be logged out if it returns any kind of error.
  // const authenticated = error?.status !== 401;
  const authenticated = error?.status === undefined;
  return authenticated;
}

export function useProjects() {
  const getProjects = appstaticAPI.endpoint("/api/projects");
  const { data, mutate, error } = useSWR<Project[]>(getProjects);

  return {
    projects: data,
    error,
    mutate,
  };
}

export function useProject(id: string) {
  const getProject = appstaticAPI.endpoint("/api/projects/:id", {
    path: { id },
  });
  const { data, mutate, error } = useSWR<Project>(getProject);

  return {
    project: data,
    error,
    mutate,
  };
}
