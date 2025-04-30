import { useCompoundMarketsAprs } from "@/utils/getCompoundAPR";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fetchAprs = useCompoundMarketsAprs();
  const aprs = await fetchAprs();
  return NextResponse.json(aprs);
}
