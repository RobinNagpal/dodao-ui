import { useAaveAprs } from "@/utils/getAaveAPR";
import { useSparkAprs } from "@/utils/getSparkAPR";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // const fetchSparkAprs = useSparkAprs();
  // const sparkAprs = await fetchSparkAprs();

  const fetchAaveAprs = useAaveAprs();
  const aaveAprs = await fetchAaveAprs();

  // const aprs = [...sparkAprs, ...aaveAprs];

  return NextResponse.json({
    // sparkAprs,
    aaveAprs,
  });
}
