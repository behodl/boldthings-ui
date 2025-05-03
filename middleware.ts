import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Special handling for nostr.json
  if (path === "/.well-known/nostr.json") {
    // Create a response with the correct JSON
    return new NextResponse(
      JSON.stringify({
        names: {
          mndwave: "2af00a5a89cab5c913ff461be86add21025ba6fe66dfd9d0e82b9488cb8d2f3d",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Access-Control-Allow-Origin": "*",
          "Vercel-CDN-Cache-Control": "no-cache",
          "Surrogate-Control": "no-store",
        },
      },
    )
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
