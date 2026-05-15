// Root landing page. For v1 (single jurisdiction) we redirect to Grovetown.
// Will become the coverage map / "find your town" search in v2.

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/ga/grovetown");
}
