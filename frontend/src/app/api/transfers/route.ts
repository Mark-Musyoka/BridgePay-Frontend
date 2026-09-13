import { NextResponse } from "next/server";
import { createTransfer, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { TransferRequest } from "@/types";

export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body: TransferRequest = await request.json();
    const transaction = await createTransfer(body, token);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      // Surfaces the real backend distinctions: 400 insufficient
      // funds/self-transfer, 403 unverified sender, 404 recipient not
      // found — see PLAN.md's API contract notes on POST /transfers.
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
