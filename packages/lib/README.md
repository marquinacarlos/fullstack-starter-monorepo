# @repo/lib

Shared clients and schemas. Consumed as TypeScript source (no build step).

| File                    | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `src/api-url.ts`        | Reads `VITE_API_URL`; throws if it is missing (no localhost fallback) |
| `src/axios.ts`          | Axios instance, `baseURL` = `VITE_API_URL`                            |
| `src/graphql-client.ts` | `graphqlRequest()` fetch wrapper to `/graphql`                        |
| `src/ws-client.ts`      | `connectWs()` helper to `/ws`                                         |
| `src/schemas.ts`        | zod schemas: `HealthResponse`, `Item`                                 |

Each client is independent. If you drop GraphQL, delete `graphql-client.ts` and its line in `index.ts`.
