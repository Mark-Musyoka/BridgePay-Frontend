import { NextResponse } from "next/server";
import { unlinkPaymentMethod, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export async function DELETE(_request: Request, { params }: RouteContext<"/api/payment-methods/[id]">) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await unlinkPaymentMethod(id, token);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
