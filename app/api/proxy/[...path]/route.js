
import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROUTES = {
  dashboard: ["GET"],
  reports: ["GET"],
  salaries: ["GET", "POST"],
  expenses: ["GET", "POST"],
  emis: ["GET", "POST"],
};

function isAllowed(parts, method) {
  if (parts.length === 1) {
    return ALLOWED_ROUTES[parts[0]]?.includes(method) ?? false;
  }

  if (parts.length === 2 && /^\d+$/.test(parts[1])) {
    if (parts[0] === "salaries") {
      return method === "DELETE";
    }

    if (parts[0] === "expenses" || parts[0] === "emis") {
      return ["PUT", "DELETE"].includes(method);
    }
  }

  if (
    parts.length === 3 &&
    parts[0] === "emis" &&
    /^\d+$/.test(parts[1]) &&
    parts[2] === "payments"
  ) {
    return method === "POST";
  }

  return false;
}

async function handler(request, context) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const method = request.method;
  const { path } = await context.params;

  if (!Array.isArray(path) || !isAllowed(path, method)) {
    return NextResponse.json(
      { success: false, message: "Route not allowed" },
      { status: 404 }
    );
  }

  // Prevent cross-origin requests from performing write actions.
  if (!["GET", "HEAD"].includes(method)) {
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;

    if (origin !== expectedOrigin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }
  }

  const baseURL = process.env.LARAVEL_API_URL;
  const apiKey = process.env.PENNYPILOT_API_KEY;

  if (!baseURL || !apiKey) {
    return NextResponse.json(
      { success: false, message: "API configuration missing" },
      { status: 500 }
    );
  }

  const url = new URL(
    `/api/${path.join("/")}`,
    baseURL.endsWith("/") ? baseURL : `${baseURL}/`
  );

  const incomingUrl = new URL(request.url);
  url.search = incomingUrl.search;

  try {
    const headers = {
      Accept: "application/json",
      "X-API-Key": apiKey,
    };

    const options = {
      method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(90000),
    };

    if (!["GET", "HEAD"].includes(method)) {
      const body = await request.text();

      if (body.length > 100000) {
        return NextResponse.json(
          { message: "Request too large" },
          { status: 413 }
        );
      }

      headers["Content-Type"] = "application/json";
      options.body = body;
    }

    const response = await fetch(url, options);
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export async function GET(request, context) {
  return handler(request, context);
}

export async function POST(request, context) {
  return handler(request, context);
}

export async function PUT(request, context) {
  return handler(request, context);
}

export async function DELETE(request, context) {
  return handler(request, context);
}
