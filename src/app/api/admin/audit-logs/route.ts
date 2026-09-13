import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(request.nextUrl.searchParams.get("page_size") ?? "20");
  const action = request.nextUrl.searchParams.get("action") ?? undefined;

  try {
    const data = await getAuditLogs(token, page, pageSize, action);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
