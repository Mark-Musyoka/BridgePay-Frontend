import { NextResponse } from "next/server";
import { login, ApiRequestError } from "@/lib/api";
import { setAuthCookies } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email || body.username;
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email and password are required" },
        { status: 400 },
      );
    }

    const tokens = await login({ username: email, password });
    await setAuthCookies(tokens.access_token, tokens.refresh_token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json(
        { detail: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { detail: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
