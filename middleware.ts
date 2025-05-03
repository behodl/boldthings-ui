import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path exists in the app
  // This is a simplified check - in a real app you might want to check against your actual routes
  // For now, we'll just redirect any path that would result in a 404
  if (
    path !== "/" &&
    !path.startsWith("/_next") &&
    !path.startsWith("/api") &&
    !path.startsWith("/signature") &&
    !path.startsWith("/alt") &&
    !path.includes(".")
  ) {
    // Create a URL for the destination
    const url = request.nextUrl.clone()
    url.pathname = "/"

    // Return a redirect response
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure matcher to run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg (favicon files)
     * - images (public image files)
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|images).*)",
  ],
}
