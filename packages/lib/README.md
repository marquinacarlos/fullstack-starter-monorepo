# @repo/lib

Shared clients and schemas. Consumed as TypeScript source (no build step).

| File                    | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `src/api-url.ts`        | Reads `VITE_API_URL`; throws if it is missing (no localhost fallback)         |
| `src/axios.ts`          | Axios instance, `baseURL` = `VITE_API_URL` <!-- scaffold:line rest -->        |
| `src/graphql-client.ts` | `graphqlRequest()` fetch wrapper to `/graphql` <!-- scaffold:line graphql --> |
| `src/ws-client.ts`      | `connectWs()` helper to `/ws` <!-- scaffold:line websocket -->                |
| `src/schemas.ts`        | zod schemas for the API responses <!-- scaffold:line lib-schemas -->          |

Each client is independent: delete its file and its line in `index.ts` to drop it.
