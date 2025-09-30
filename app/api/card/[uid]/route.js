import { kv } from "@/lib/kv";

export async function GET(req, { params }) {
  try {
    const { uid } = params;

    if (!uid) {
      return Response.json(
        { status: "error", reason: "缺少 UID" },
        { status: 400 }
      );
    }

    const key = `card:${uid}`;
    const card = await kv.hgetall(key);

    if (!card) {
      return Response.json(
        { status: "error", reason: "卡片不存在" },
        { status: 404 }
      );
    }

    return Response.json({
      status: "ok",
      card: {
        uid,
        status: card.status || "PENDING",
        name: card.user_name || "",
        birthday: card.birthday || "",
        birthday_detail: card.user_birthday_detail || "",
        blood_type: card.blood_type || "",
        hobbies: card.hobbies || "",
        points: Number(card.points) || 0,
        updated_at: card.updated_at || null,
      },
    });
  } catch (err) {
    console.error("card lookup error:", err);
    return Response.json(
      { status: "error", reason: "伺服器錯誤" },
      { status: 500 }
    );
  }
}