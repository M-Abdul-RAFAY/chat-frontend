import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

// Routes that need protection
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Routes that are completely public and should not use Clerk at all
const isWidgetRoute = createRouteMatcher(["/widget(.*)", "/api/widget(.*)"]);

// Auth API routes that should only be accessible from authenticated contexts
const isAuthAPIRoute = createRouteMatcher(["/api/auth/(.*)"]);

// Additional check for public API routes that should be accessible from widget context
const isPublicAPIRoute = createRouteMatcher([
  "/api/widget(.*)",
  "/api/generate-ai-message",
  "/api/upload",
]);

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // For widget routes, bypass Clerk entirely to prevent iframe issues
  if (isWidgetRoute(req) || isPublicAPIRoute(req)) {
    return NextResponse.next();
  }

  // Block auth API routes if coming from a widget context (additional security)
  if (isAuthAPIRoute(req)) {
    const referer = req.headers.get("referer");
    if (referer && referer.includes("/widget")) {
      return NextResponse.json(
        { error: "Authentication APIs not available in widget context" },
        { status: 403 }
      );
    }
  }

  // For all other routes, use Clerk middleware
  const clerkHandler = clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  });

  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
