import { kv } from "@/lib/kv";
import { apiError } from "@/lib/apiError";

// 簡單正規化：1965-04-04 -> 19650404
function normalizeBirthday(input) {
  if (!input) return "";
  return input.replace(/-/g, "").trim();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const d = searchParams.get("d");
    const uuid = searchParams.get("uuid");

    if (!d || !uuid) {
      return apiError("MISSING_PARAMS", 400);
    }

    // 取 UID (uuid 前 14 碼)
    const uid = uuid.substring(0, 14);
    const key = `card:${uid}`;

    // 讀取資料庫
    const card = await kv.hgetall(key);
    if (!card) {
      return apiError("CARD_NOT_FOUND", 404);
    }

    // 比對生日
    const dbBirthday = card?.birthday || "";
    const dNorm = normalizeBirthday(d);
    const dbNorm = normalizeBirthday(dbBirthday);

    return Response.json({
      status: "debug",
      uid,
      raw: { fromUrl: d, fromDb: dbBirthday },
      normalized: { url: dNorm, db: dbNorm },
      match: dNorm === dbNorm
    });
  } catch (err) {
    // 捕捉所有例外，輸出清楚的錯誤訊息
    return Response.json(
      {
        status: "error",
        message: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
