interface HttpError extends Error {
  status: number;
}

export async function fetcher(url: string, token?: string) {
  const options: { [key: string]: any } = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `bearer ${token}`;
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const error = new Error(res.statusText) as HttpError;
    error.status = res.status;
    throw error;
  }

  return await res.json();
}
