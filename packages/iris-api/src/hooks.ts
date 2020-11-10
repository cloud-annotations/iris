import useSWR from "swr";

import API from "./api";
import { fetcher } from "./fetcher";

const appstaticAPI = new API();

export function useAuthentication() {
  const checkAuthentication = appstaticAPI.endpoint("/auth/status");
  const { error } = useSWR(checkAuthentication.key, fetcher);

  // NOTE: pretends to be logged out if it returns any kind of error.
  // const authenticated = error?.status !== 401;
  const authenticated = error?.status === undefined;
  return authenticated;
}

export function useMode() {
  const getMode = appstaticAPI.endpoint("/api/mode");
  const { data, mutate, error } = useSWR(getMode.key, fetcher);

  return {
    mode: data,
    error,
    mutate,
  };
}

export function useProjects() {
  const getProjects = appstaticAPI.endpoint("/api/projects");
  const { data, mutate, error } = useSWR<any[]>(getProjects.key, fetcher);

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
  const { data, mutate, error } = useSWR<any>(getProject.key, fetcher);

  return {
    project: data,
    error,
    mutate,
  };
}
