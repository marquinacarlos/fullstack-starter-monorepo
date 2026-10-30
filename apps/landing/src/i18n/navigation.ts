import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Locale-aware Link, usePathname and useRouter. Use these instead of next/link and next/navigation.
export const { Link, usePathname, useRouter } = createNavigation(routing);
