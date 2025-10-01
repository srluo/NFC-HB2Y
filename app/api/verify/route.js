import { apiError } from "@/lib/apiError";
import { sign } from "@/lib/sign.cjs";

export async function GET(req) {
  // 🔑 使用 nextUrl 取 query 參數
  const searchParams = req.nextUrl.searchParams;
  const d = searchParams.get("d");
  const uuid = searchParams.get("uuid");

  if (!d || !uuid) return apiError("MISSING_PARAMS", 400);

  const uid = uuid.substring(0, 12);
  const tp  = uuid.substring(12, 14);
  const ts  = uuid.substring(14, 22);
  const rlc = uuid.substring(22, 30);

  if (tp !== "HB") return apiError("INVALID_TP", 400);

  const expected = sign({ uid, ts });
  if (expected !== rlc.toUpperCase()) {
    return apiError("VERIFY_FAIL", 403);
  }

  return Response.json({
    status: "ok",
    debug: { uid, tp, ts, rlc, expected }
  });
}
