import { NextResponse } from "next/server";
import { sign } from "@/lib/sign"; // 你的 Mickey 驗證函式

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get("d");
  const uuid = searchParams.get("uuid");

  if (!d || !uuid) {
    return NextResponse.json({ status: "error", code: "MISSING_PARAMS" }, { status: 400 });
  }

  try {
    // 解析 uuid
    const uid = uuid.substring(0, 14);  // ← 注意這裡，你之前切 12 錯了
    const tp = uuid.substring(14, 16);
    const ts = uuid.substring(16, 24);
    const rlc = uuid.substring(24, 32);

    // 只接受 HB
    if (tp !== "HB") {
      return NextResponse.json({ status: "error", code: "INVALID_TP" }, { status: 400 });
    }

    // 驗證 RLC
    const expected = sign({ uid, ts }).substring(0, 8).toUpperCase();

    if (expected !== rlc.toUpperCase()) {
      return NextResponse.json({ status: "error", code: "INVALID_TOKEN" }, { status: 401 });
    }

    // ✅ 成功回傳統一格式
    return NextResponse.json({
      status: "ok",
      valid: true,
      uid,
      tp,
      ts,
      rlc,
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return NextResponse.json({ status: "error", code: "SERVER_ERROR" }, { status: 500 });
  }
}
