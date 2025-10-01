import { apiError } from "@/lib/apiError";
import pkg from "@/lib/sign.cjs"; // 用 CommonJS 匯入
const { sign } = pkg;

export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl;
    const d = searchParams.get("d");
    const uuid = searchParams.get("uuid");

    if (!d || !uuid) return apiError("MISSING_PARAMS", 400);

    // 簡單解析 uuid
    const uid = uuid.slice(0, 14);
    const tp = uuid.slice(14, 16);
    const ts = uuid.slice(16, 24);
    const rlc = uuid.slice(24);

    console.log("DEBUG:", { uid, tp, ts, rlc });

    // 驗證 TP
    if (tp !== "HB") return apiError("INVALID_TP", 400);

    // MICKEY 驗簽
    let signature;
    try {
      signature = sign({ uid, ts });
    } catch (err) {
      console.error("SIGN ERROR:", err);
      return apiError("SIGN_GENERATION_ERROR", 500);
    }

    if (signature.toLowerCase() !== rlc.toLowerCase()) {
      return apiError("INVALID_SIGNATURE", 401);
    }

    return Response.json({
      status: "ok",
      d,
      uid,
      ts,
      signature
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return apiError("SERVER_ERROR", 500);
  }
}
