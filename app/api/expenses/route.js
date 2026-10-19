
import { NextResponse } from "next/server";

export async function GET(request) {
  // Authentication must be verified here before
  // allowing access to private financial data.
  return NextResponse.json(
    { message: "Authentication required" },
    { status: 401 }
  );
}
