import { NextResponse } from "next/server";
import { logout } from "@/lib/api";
import { getRefreshToken, clearAuthCookies } from "@/lib/auth";

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await logout({ refresh_token: refreshToken });
      } catch {
        // Ignore backend logout error, continue clearing local cookies
      }
    }
    await clearAuthCookies();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    await clearAuthCookies();
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
