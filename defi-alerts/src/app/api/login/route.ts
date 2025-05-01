import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  console.log("Received email:", email);
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Create the user if it doesn't exist or fetch existing
  const user = await prisma.user.upsert({
    where: { email },
    create: { email },
    update: {}, // no changes if already exists
  });

  // (In real life you'd send an email here)
  return NextResponse.json({ ok: true, userId: user.id });
}
