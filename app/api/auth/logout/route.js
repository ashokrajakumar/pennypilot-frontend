
import { NextResponse } from "next/server";
import { sessionCookie } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const origin = request.headers.get("origin");

    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host");

    if (!origin || !host || new URL(origin).host !== host) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set(sessionCookie.name, "", {
      ...sessionCookie.options,
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
