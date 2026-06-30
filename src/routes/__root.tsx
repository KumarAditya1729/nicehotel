import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BookingProvider } from "@/components/site/booking";
import { Toaster } from "@/components/ui/sonner";

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
      { title: "Nice Hotel And Restaurant — Luxury Stays in Mansa, Punjab" },
      { name: "description", content: "Nice Hotel And Restaurant offers luxury rooms, fine dining and elegant event venues in Mansa, Punjab. Experience premium hospitality." },
      { name: "author", content: "Nice Hotel And Restaurant" },
      { property: "og:title", content: "Nice Hotel And Restaurant — Luxury Stays in Mansa, Punjab" },
      { property: "og:description", content: "Nice Hotel And Restaurant offers luxury rooms, fine dining and elegant event venues in Mansa, Punjab. Experience premium hospitality." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Nice Hotel And Restaurant" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nice Hotel And Restaurant — Luxury Stays in Mansa, Punjab" },
      { name: "twitter:description", content: "Nice Hotel And Restaurant offers luxury rooms, fine dining and elegant event venues in Mansa, Punjab. Experience premium hospitality." },
      { name: "robots", content: "index, follow" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b55bbedf-cf74-435f-aa22-aa3bf59d3cc0/id-preview-f6b2f266--3c9f6921-e98b-43a2-9494-43b0e0a89b83.lovable.app-1782816871375.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b55bbedf-cf74-435f-aa22-aa3bf59d3cc0/id-preview-f6b2f266--3c9f6921-e98b-43a2-9494-43b0e0a89b83.lovable.app-1782816871375.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Hotel",
          name: "Nice Hotel And Restaurant",
          url: "https://www.nicehotelandrestaurant.online/",
          address: { "@type": "PostalAddress", streetAddress: "Near Chugli Ghar", addressLocality: "Mansa", addressRegion: "Punjab", postalCode: "151505", addressCountry: "IN" },
          telephone: "+91 9216400005",
          email: "nicehotelandrestaurant@gmail.com",
          priceRange: "₹₹",
          openingHours: "Mo-Su 00:00-23:59",
          sameAs: ["https://www.instagram.com/nice_hotel_and_resturant/?hl=en"],
          servesCuisine: ["Indian", "Punjabi", "Chinese", "Continental"],
          starRating: { "@type": "Rating", ratingValue: "5" },
        }),
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin") || pathname === "/auth" || pathname === "/reset-password";

  return (
    <QueryClientProvider client={queryClient}>
      <BookingProvider>
        {!isAdmin && <Header />}
        <main>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        {!isAdmin && <Footer />}
        <Toaster position="top-center" />
      </BookingProvider>
    </QueryClientProvider>
  );
}
