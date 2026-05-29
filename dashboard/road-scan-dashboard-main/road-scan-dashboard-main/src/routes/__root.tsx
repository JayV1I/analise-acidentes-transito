import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { FilterProvider } from "../lib/filters";
import { Sidebar } from "../components/Sidebar";
import { FilterBar } from "../components/FilterBar";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RodoIntel BI — Acidentes Rodoviários no Brasil" },
      {
        name: "description",
        content:
          "Dashboard executivo de Business Intelligence para análise de acidentes rodoviários no Brasil.",
      },
      { name: "author", content: "RodoIntel" },
      {
        property: "og:title",
        content: "RodoIntel BI — Acidentes Rodoviários",
      },
      {
        property: "og:description",
        content:
          "Análise de padrões, fatores de risco e gravidade de acidentes rodoviários.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { property: "og:title", content: "RodoIntel BI — Acidentes Rodoviários no Brasil" },
      { name: "twitter:title", content: "RodoIntel BI — Acidentes Rodoviários no Brasil" },
      { name: "description", content: "A web-based Business Intelligence dashboard for analyzing Brazilian road accidents." },
      { property: "og:description", content: "A web-based Business Intelligence dashboard for analyzing Brazilian road accidents." },
      { name: "twitter:description", content: "A web-based Business Intelligence dashboard for analyzing Brazilian road accidents." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/58d2782e-ec64-49b1-b7d2-00ad14690d3b/id-preview-a2b44143--19bf08e0-a62e-4ed9-a701-f3747c12e746.lovable.app-1780076043680.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/58d2782e-ec64-49b1-b7d2-00ad14690d3b/id-preview-a2b44143--19bf08e0-a62e-4ed9-a701-f3747c12e746.lovable.app-1780076043680.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="mx-auto w-full max-w-[1500px] flex-1 space-y-5 p-4 md:p-6">
              <FilterBar />
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
          </div>
        </div>
      </FilterProvider>
    </QueryClientProvider>
  );
}
