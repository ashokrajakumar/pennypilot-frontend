
import { NextResponse } from "next/server";

import {
  verifyPassword,
  createSessionToken,
  sessionCookie,
} from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (
      typeof password !== "string" ||
      !verifyPassword(password)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set(
      sessionCookie.name,
      token,
      sessionCookie.options
    );

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 400 }
    );
  }
}
