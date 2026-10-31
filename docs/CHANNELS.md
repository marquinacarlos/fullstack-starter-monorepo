# Channels

The template includes three ways for a client to talk to the API. Each one is independent: it has its own folder in the API and, in each frontend, its own client and panel.

<!-- scaffold:begin rest -->

## REST

One URL per resource and one HTTP method per action. Simple, cacheable, easy to debug with curl. Good default.

- API folder: `apps/api/app/api/routes/`
- Endpoint: `/health`
- Demo items: `/api/items` <!-- scaffold:line items-rest -->
- Database status: `/health/databases` <!-- scaffold:line db-status -->
- Client: `@repo/lib` `axios.ts` <!-- scaffold:line lib -->
- Panel: `PanelREST.tsx` in each frontend <!-- scaffold:line frontends -->
- Test: `test_health.py`
- Test of the demo items: `test_items.py` <!-- scaffold:line items-rest -->

<!-- scaffold:end rest -->
<!-- scaffold:begin graphql -->

## GraphQL

One URL, the client chooses the fields in the query. Good when many clients need different shapes of the same data, or to avoid many round trips. More server complexity (schema, resolvers, N+1 risk).

- API folder: `apps/api/app/api/graphql/`
- Endpoint: `POST /graphql`
- Client: `@repo/lib` `graphql-client.ts` <!-- scaffold:line lib -->
- Panel: `PanelGraphQL.tsx` in each frontend <!-- scaffold:line frontends -->
- Test: `test_graphql.py`

<!-- scaffold:end graphql -->
<!-- scaffold:begin websocket -->

## WebSocket

One long-lived connection. The server can push data at any time. Use it only for real-time features (chat, live data). Every open socket costs server memory and needs reconnection logic.

- API folder: `apps/api/app/api/websocket/`
- Endpoint: `/ws`
- Client: `@repo/lib` `ws-client.ts` <!-- scaffold:line lib -->
- Panel: `PanelWebSocket.tsx` in each frontend <!-- scaffold:line frontends -->
- Test: none. Its proof is the live panel.

The WebSocket demo sends a counter every second and echoes what you send.

<!-- scaffold:end websocket -->
<!-- scaffold:begin template -->

## How to remove a channel

Use the decision matrix in [AI_CONTEXT.md](AI_CONTEXT.md#decision-matrix-if-you-do-not-use-x-remove-y), or run `pnpm scaffold`.

<!-- scaffold:end template -->

## Production advice

**Choose one or two channels.** Running several means several contracts to document, secure, version and test. A common choice: one channel for data.
Add a WebSocket only if you need live updates. <!-- scaffold:line websocket -->
Also remember this template has no authentication. Add it before exposing any channel.
