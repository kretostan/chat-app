import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { routeTree } from "../../routeTree.gen";

async function createTestRouter(initialPath = "/") {
  const history = createMemoryHistory({ initialEntries: [initialPath] });

  const router = createRouter({
    history,
    routeTree,
  });

  await router.load();

  return router;
}

async function renderPage(initialPath = "/") {
  const testRouter = await createTestRouter(initialPath);

  const result = render(
    <ThemeProvider>
      <RouterProvider router={testRouter} />
    </ThemeProvider>,
  );

  return { ...result, router: testRouter };
}

describe("Landing Page", () => {
  describe("Navigation", () => {
    test("Go in button navigates to /auth/login on click", async () => {
      const page = await renderPage();

      const goInButton = screen.getByRole("button", { name: "Sign in" });

      await userEvent.click(goInButton);

      expect(page.router.state.location.pathname).toBe("/auth/login");
    });
  });
});
