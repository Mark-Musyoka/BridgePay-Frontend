import { NextResponse } from "next/server";
import { linkMpesa, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

/** Server-side proxy for POST /payment-methods/mpesa. */
export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const method = await linkMpesa(body, token);
    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
