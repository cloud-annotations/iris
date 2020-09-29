import { useRecoilValue, useRecoilState } from "recoil";
import useSWR from "swr";

import API from "src/util/api";

import { tokenState, installationState, repoState } from ".";
import { installations, repos } from "./mock";

const githubAPI = new API("api.github.com");

export function useInstallations() {
  const token = useRecoilValue(tokenState);
  const getInstallations = githubAPI.endpoint("/user/installations", {
    auth: token,
  });

  let { data, mutate, error } = useSWR(
    process.env.REACT_APP_MOCK === "true" ? null : getInstallations
  );
  if (process.env.REACT_APP_MOCK === "true") {
    data = installations;
    error = null;
  }

  const [installation, setInstallation] = useRecoilState(installationState);
  if (data && installation === undefined) {
    setInstallation(data.installations[0].id);
  }

  return {
    installations: data?.installations,
    mutate,
    error,
  };
}

export function useRepos() {
  const perPage = 15;

  const token = useRecoilValue(tokenState);
  const installationID = useRecoilValue(installationState);
  const page = useRecoilValue(repoState);

  const getRepos = githubAPI.endpoint("/user/installations/:id/repositories", {
    auth: token,
    path: { id: installationID },
    query: {
      per_page: perPage,
      page: page,
    },
  });

  let { data, mutate, error } = useSWR(
    process.env.REACT_APP_MOCK === "true" ? null : getRepos
  );
  if (process.env.REACT_APP_MOCK === "true") {
    data = repos;
    error = null;
  }

  return {
    repositories: data?.repositories,
    pages: Math.ceil(data?.total_count / perPage),
    mutate,
    error,
  };
}
