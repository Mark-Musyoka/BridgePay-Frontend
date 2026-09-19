import { NextResponse } from "next/server";
import { resendVerification, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

/**
 * Server-side proxy for POST /auth/resend-verification. Requires auth —
 * login isn't gated on verification, so the user can already be logged
 * in (with a valid httpOnly-cookie access token) when they need this.
 */
export async function POST() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    await resendVerification(token);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
