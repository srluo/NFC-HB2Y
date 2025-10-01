import { sign } from "@/lib/sign";
import { apiError } from "@/lib/apiError";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid");
    const d = searchParams.get("d");

    if (!uuid || !d) {
      return apiError("MISSING_PARAMS", 400);
    }

    // uuid 結構: uid(14) + TP(2) + TS(8) + RLC(8)
    const uid = uuid.substring(0, 14);
    const tp = uuid.substring(14, 16);
    const ts = uuid.substring(16, 24);
    const rlc = uuid.substring(24, 32);

    if (!uid || !tp || !ts || !rlc) {
      return apiError("INVALID_UUID", 400);
    }

    // ⚡ 計算簽章
    const expected = sign({ uid, ts });

    if (expected.toUpperCase() !== rlc.toUpperCase()) {
      return apiError("INVALID_TOKEN", 403);
    }

    return Response.json({
      status: "ok",
      debug: { uid, tp, ts, rlc, expected },
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return apiError("SERVER_ERROR", 500);
  }
}
