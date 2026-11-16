import { Suspense } from "react";
import HelpNow from "./HelpNow";
export const metadata = { title: "Get help now · Next Step" };
export default function Page() {
  return <Suspense><HelpNow /></Suspense>;
}
