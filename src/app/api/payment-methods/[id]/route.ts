import { NextResponse } from "next/server";
import { deletePaymentMethod, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

/** Server-side proxy for DELETE /payment-methods/{id}. */
export async function DELETE(_request: Request, { params }: RouteContext<"/api/payment-methods/[id]">) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deletePaymentMethod(id, token);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
