import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that need protection
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Routes that are public
const isPublicRoute = createRouteMatcher(["/widget"]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect if it's not a public route
  if (!isPublicRoute(req) && isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
