import { NextResponse } from "next/server";
import { getMe, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

/**
 * Server-side proxy for GET /users/me. Exists so client components can
 * hydrate the current user without ever touching the access token
 * directly — it lives in an httpOnly cookie by design, inaccessible to
 * client-side JS.
 */
export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await getMe(token);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
