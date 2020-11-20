import { keyInterface } from "swr";

import { fetcher } from "./fetcher";

interface Options {
  auth?: string;
  path?: { [key: string]: any };
  query?: { [key: string]: any };
}

interface Request {
  uri: string;
  key: keyInterface;
  do: () => Promise<any>;
}

class API {
  private host: string;

  constructor(host?: string) {
    this.host = host !== undefined ? "https://" + host : "";
  }

  endpoint(endpoint: string, options: Options = {}): Request {
    const { path, query, auth } = options;

    let reject;
    const filledEndpoint = endpoint.replace(/\/:(\w+)/gi, (_match, group1) => {
      const replacement = `/${path?.[group1]}`;
      if (group1 === undefined) {
        reject = true;
      }
      return replacement;
    });

    if (reject === true) {
      return {
        uri: "",
        key: null,
        do: async () => {},
      };
    }

    // Strip undefined keys
    if (query) {
      Object.keys(query).forEach(
        (key) => query[key] === undefined && delete query[key]
      );
    }

    const queryParams = new URLSearchParams(query);

    let url = this.host + filledEndpoint;
    let queryString = queryParams.toString();
    if (queryString !== "") {
      url += "?" + queryString;
    }

    return {
      uri: url,
      key: [url, auth],
      do: async () => {
        return await fetcher(url, auth);
      },
    };
  }
}

export default API;
