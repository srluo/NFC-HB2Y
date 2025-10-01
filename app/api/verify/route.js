import { kv } from "@/lib/kv";
import { apiError } from "@/lib/apiError";

function normalizeBirthday(b) {
  if (!b) return "";
  return b.replace(/-/g, ""); // 把 1965-04-04 變成 19650404
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get("d");
  const uuid = searchParams.get("uuid");

  if (!d || !uuid) {
    return apiError("MISSING_PARAMS", 400);
  }

  // 取 UID（例如 uuid=3949500194A474HB0000000028BC3B2B -> UID=3949500194A474）
  const uid = uuid.substring(0, 14);
  const key = `card:${uid}`;
  const card = await kv.hgetall(key);

  if (!card) {
    return apiError("CARD_NOT_FOUND", 404);
  }

  const dbBirthday = card.birthday || "";
  const dNorm = normalizeBirthday(d);
  const dbNorm = normalizeBirthday(dbBirthday);

  // Debug 輸出
  return Response.json({
    status: "debug",
    uid,
    fromUrl: d,
    fromDb: dbBirthday,
    normalized: {
      url: dNorm,
      db: dbNorm
    },
    match: dNorm === dbNorm
  });
}
