import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
  return NextResponse.json(
    {
      names: {
        mndwave: "2af00a5a89cab5c913ff461be86add21025ba6fe66dfd9d0e82b9488cb8d2f3d",
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Vercel-CDN-Cache-Control": "no-cache",
        "Surrogate-Control": "no-store",
      },
    },
  )
}
