import { apiError } from "@/lib/apiError";
import { sign } from "@/lib/sign.cjs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get("d");      // 生日
  const uuid = searchParams.get("uuid"); // 卡片 UUID

  if (!d || !uuid) return apiError("MISSING_PARAMS", 400);

  // 解析 UUID
  const uid = uuid.substring(0, 12);      // 12 碼 UID
  const tp  = uuid.substring(12, 14);     // TP=HB
  const ts  = uuid.substring(14, 22);     // 8 碼 TS
  const rlc = uuid.substring(22, 30);     // 8 碼 RLC

  if (tp !== "HB") return apiError("INVALID_TP", 400);

  // 驗證 RLC
  const expected = sign({ uid, ts });  // 直接回傳 8 碼
  if (expected !== rlc.toUpperCase()) {
    return apiError("VERIFY_FAIL", 403);
  }

  return Response.json({
    status: "ok",
    debug: { uid, tp, ts, rlc, expected }
  });
}
