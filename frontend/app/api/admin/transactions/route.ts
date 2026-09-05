import { NextRequest, NextResponse } from "next/server";
import { getAdminTransactions, ApiRequestError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(request.nextUrl.searchParams.get("page_size") ?? "20");
  const userEmail = request.nextUrl.searchParams.get("user_email") ?? undefined;

  try {
    const data = await getAdminTransactions(token, page, pageSize, userEmail);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      // 403 here means the logged-in user isn't an admin — the page
      // calling this should treat that as "redirect away", not a
      // generic error.
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "An unexpected error occurred" }, { status: 500 });
  }
}
