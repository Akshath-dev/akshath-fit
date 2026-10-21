// DESIGN_PREVIEW_ONLY: separate local entry; absent from production build inputs.
import { createRoot } from "react-dom/client";
import { DashboardApp } from "../src/App";
import { createMemoryRepository } from "./memory-repository";
const params = new URLSearchParams(location.search),
  repository = createMemoryRepository({
    empty: params.get("state") === "empty",
    failSaves: params.get("failSave") === "1",
  });
createRoot(document.getElementById("root")!).render(
  <DashboardApp
    repository={repository}
    preview
    onSignOut={() => {
      location.href = "/";
    }}
  />,
);
