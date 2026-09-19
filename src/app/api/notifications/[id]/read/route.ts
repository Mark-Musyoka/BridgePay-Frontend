import { NextResponse } from "next/server";
import { markNotificationRead, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export async function POST(_request: Request, { params }: RouteContext<"/api/notifications/[id]/read">) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await markNotificationRead(id, token);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
