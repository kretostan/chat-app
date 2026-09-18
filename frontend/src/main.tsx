import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

// src/app.tsx
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
