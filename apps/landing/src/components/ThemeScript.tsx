import { THEME_STORAGE_KEY } from "../store/theme";

// Runs in <head> before the first paint, so a visitor who chose dark mode (or whose system is
// dark) never sees a flash of the light theme. The page is static HTML: without this script
// the class would only be added after React loads.
const script = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
