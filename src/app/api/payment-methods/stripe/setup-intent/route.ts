import { NextResponse } from "next/server";
import { startStripeCardLink, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export async function POST() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await startStripeCardLink(token);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
