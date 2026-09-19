import { NextResponse } from "next/server";
import { googleExchange, ApiRequestError } from "@/lib/api";
import { setAuthCookies } from "@/lib/auth";

/**
 * Server-side proxy for POST /auth/google/exchange. Exists for the same
 * reason /api/auth/login does: the response contains real access/refresh
 * tokens that need to become httpOnly cookies, which only server-side
 * code can set — even though the exchange call itself needs no auth
 * token to make.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body.code;

    if (!code) {
      return NextResponse.json({ detail: "Missing code" }, { status: 400 });
    }

    const tokens = await googleExchange({ code });
    await setAuthCookies(tokens.access_token, tokens.refresh_token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
