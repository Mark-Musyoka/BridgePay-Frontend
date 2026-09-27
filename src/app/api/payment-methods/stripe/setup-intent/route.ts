import { NextResponse } from "next/server";
import { createStripeSetupIntent, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

/** Server-side proxy for POST /payment-methods/stripe/setup-intent. */
export async function POST() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await createStripeSetupIntent(token);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
