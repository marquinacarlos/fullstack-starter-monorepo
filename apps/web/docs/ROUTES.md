# Routes

Router: `react-router-dom`, set in `src/App.tsx`.

| Path     | Component          | Notes                                              |
| -------- | ------------------ | -------------------------------------------------- |
| `/`      | `routes/Home.tsx`  | Shows the evidence panels                          |
| `/about` | `routes/About.tsx` | Static page, translated with the `about` namespace |

Both routes render inside `components/Layout.tsx`: header with nav links (lucide icons) and EN/ES buttons.
The header also has the theme toggle. <!-- scaffold:line dark-mode -->

## Add a route

1. Create `src/routes/MyPage.tsx`.
2. Add `<Route path="my-page" element={<MyPage />} />` inside the `Layout` route in `src/App.tsx`.
3. Add a `NavLink` in `Layout.tsx`, and a label in `common.json` (both languages).

<!-- scaffold:begin dark-mode -->

## Theme

`src/store/theme.ts` (zustand + `persist`) keeps the theme in localStorage and toggles the `.dark` class on `<html>`. It is not tied to a route, so it stays when you navigate.
<!-- scaffold:end dark-mode -->
