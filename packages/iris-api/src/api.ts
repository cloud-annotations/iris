import { keyInterface } from "swr";

import { fetcher } from "./fetcher";

interface Options {
  auth?: string;
  path?: { [key: string]: any };
  query?: { [key: string]: any };
}

interface Request {
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
        key: null,
        do: async () => {},
      };
    }

    const queryParams = new URLSearchParams(query);

    let url = this.host + filledEndpoint;
    let queryString = queryParams.toString();
    if (queryString !== "") {
      url += "?" + queryString;
    }

    return {
      key: [url, auth],
      do: async () => {
        return await fetcher(url, auth);
      },
    };
  }
}

export default API;
