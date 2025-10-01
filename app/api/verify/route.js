import { apiError } from "@/lib/apiError";
import { sign } from "@/lib/sign.cjs";  // 你的 Mickey 簽章程式

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get("d");
  const uuid = searchParams.get("uuid");

  if (!d || !uuid) {
    return apiError("MISSING_PARAM", 400);
  }

  try {
    // === 切割 UUID ===
    // 例: 3949500194A474HB000006ECF1684933
    const uid = uuid.substring(0, 14);   // 14 hex chars (7 bytes UID)
    const tp  = uuid.substring(14, 16);  // TP code (HB)
    const ts  = uuid.substring(16, 24);  // 8 hex (4 bytes)
    const rlc = uuid.substring(24, 32);  // 8 hex (4 bytes)

    // === 檢查 TP ===
    if (tp !== "HB") {
      return apiError("INVALID_TP", 400);
    }

    // === 計算期望簽章 ===
    const expected = sign({ uid, ts });

    // === Debug log ===
    console.log("VERIFY DEBUG:", { uid, tp, ts, rlc, expected });

    if (expected.toUpperCase() !== rlc.toUpperCase()) {
      return apiError("INVALID_TOKEN", 401);
    }

    return Response.json({
      status: "ok",
      debug: { uid, tp, ts, rlc, expected }
    });

  } catch (err) {
    console.error("VERIFY ERROR", err);
    return apiError("SERVER_ERROR", 500);
  }
}
