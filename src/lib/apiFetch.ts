const BASE = process.env.NODE_ENV === "production" ? "/projects/effluve" : "";

export const apiFetch = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(`${BASE}${path}`, init);
