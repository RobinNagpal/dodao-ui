import { withErrorHandlingV1 } from "@/app/api/helpers/middlewares/withErrorHandling";
import { NextRequest, NextResponse } from "next/server";

async function postHandler(req: NextRequest) {
  const reqBody = await req.json();
  const { key } = reqBody;
  console.log(key);
  if (key != process.env.ADMIN_KEY) {
    console.log("Invalid key");
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }
  return NextResponse.json(key, { status: 200 });
}

export const POST = withErrorHandlingV1(postHandler);
