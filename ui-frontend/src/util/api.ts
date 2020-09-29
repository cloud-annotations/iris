import { keyInterface } from "swr";

interface Options {
  auth?: string;
  path?: { [key: string]: any };
  query?: { [key: string]: any };
}

class API {
  private host: string;

  constructor(host?: string) {
    this.host = host !== undefined ? "https://" + host : "";
  }

  endpoint(endpoint: string, options: Options = {}): keyInterface {
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
      return null;
    }

    const queryParams = new URLSearchParams(query);

    let url = this.host + filledEndpoint;
    let queryString = queryParams.toString();
    if (queryString !== "") {
      url += "?" + queryString;
    }

    if (auth) {
      return [url, auth];
    }

    return url;
  }
}

export default API;
