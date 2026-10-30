import { Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { About } from "./routes/About";
import { Home } from "./routes/Home";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}
