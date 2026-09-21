import { NextResponse } from "next/server";
import { createAirtelDeposit, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await createAirtelDeposit(body, token);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
