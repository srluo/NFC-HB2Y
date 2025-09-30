import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { sign } = require("@/lib/sign.cjs");

// 驗證 RLC (Rolling Code)
function verifyRLC(uid, tp, ts, rlc) {
  try {
    const expected = sign({ uid, ts });
    return expected.toLowerCase() === rlc.toLowerCase();
  } catch (e) {
    console.error("RLC 驗證失敗:", e);
    return false;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get("d");      // 生日日期
  const uuid = searchParams.get("uuid"); // SIC43NT 提供的 uuid

  if (!d || !uuid) {
    return Response.json(
      { status: "error", reason: "缺少必要參數" },
      { status: 400 }
    );
  }

  // 解析 uuid: [UID][TP][TS][RLC]
  try {
    const uid = uuid.slice(0, 14);       // 前14 hex = UID
    const tp = uuid.slice(14, 16);       // 2 hex = TP (ex: "HB")
    const ts = uuid.slice(16, 24);       // 8 hex = TS
    const rlc = uuid.slice(24);          // 其餘 = RLC

    if (tp !== "HB") {
      return Response.json(
        { status: "error", reason: "TP 錯誤 (需HB)" },
        { status: 403 }
      );
    }

    // 檢查 RLC
    if (!verifyRLC(uid, tp, ts, rlc)) {
      return Response.json(
        { status: "error", reason: "RLC 驗證失敗" },
        { status: 403 }
      );
    }

    // ✅ 通過驗證 → 回傳開卡流程頁
    return Response.json({
      status: "ok",
      step: "activate",
      uid,
      birthday: d,
      ts,
      message: "請填寫表單完成開卡"
    });
  } catch (err) {
    console.error("UUID 解析錯誤:", err);
    return Response.json(
      { status: "error", reason: "UUID 格式錯誤" },
      { status: 400 }
    );
  }
}