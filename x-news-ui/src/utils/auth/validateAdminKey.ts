import { NextResponse, NextRequest } from "next/server";

export function validateAdminKey(req: NextRequest): NextResponse | null {
  const adminKey = req.headers.get("admin-key");

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json(
      { error: "Unauthorized: Admin key is missing or invalid." },
      { status: 401 }
    );
  }

  return null;
}
