const baseUrl: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/** Minimal GraphQL client: a fetch wrapper that POSTs to {API}/graphql. */
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${baseUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error(`GraphQL HTTP ${response.status}`);
  }
  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (json.data === undefined) {
    throw new Error("GraphQL response has no data");
  }
  return json.data;
}
