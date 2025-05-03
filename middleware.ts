import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Special handling for nostr.json
  if (path === "/.well-known/nostr.json") {
    const response = NextResponse.next()

    // Add cache control headers
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Vercel-CDN-Cache-Control", "no-cache")
    response.headers.set("Surrogate-Control", "no-store")

    return response
  }

  // Original middleware logic for other paths
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

// Configure matcher to include .well-known paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg|images).*)", "/.well-known/nostr.json"],
}
