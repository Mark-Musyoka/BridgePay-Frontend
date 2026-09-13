import { NextResponse } from "next/server";
import { getAccount, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

/**
 * Server-side proxy for GET /accounts/me — same reasoning as
 * app/api/me/route.ts: keeps the access token server-side only.
 */
export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const account = await getAccount(token);
    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
