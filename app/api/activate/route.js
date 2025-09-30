import { kv } from "@/lib/kv";

export async function POST(req) {
  try {
    const { uid, name, birthday_detail, blood_type, hobbies } = await req.json();

    // ✅ 基本檢查
    if (!uid) {
      return Response.json(
        { status: "error", reason: "缺少 UID" },
        { status: 400 }
      );
    }

    const key = `card:${uid}`;

    // 🔍 檢查卡片是否存在
    const card = await kv.hgetall(key);
    if (!card) {
      return Response.json(
        { status: "error", reason: "卡片不存在" },
        { status: 404 }
      );
    }

    // 🔒 避免重複啟用
    if (card.status === "ACTIVATED") {
      return Response.json(
        { status: "error", reason: "卡片已啟用" },
        { status: 409 }
      );
    }

    // 📝 更新卡片資料
    const updated = {
      ...card,
      user_name: name || "",
      user_birthday_detail: birthday_detail || "",
      blood_type: blood_type || "",
      hobbies: hobbies || "",
      status: "ACTIVATED",
      points: 20, // 🎁 首次開卡送點數
      updated_at: new Date().toISOString(),
    };

    await kv.hset(key, updated);

    // ✅ 回傳啟用成功的訊息
    return Response.json({
      status: "activated",
      user: {
        uid,
        name: updated.user_name,
        birthday: updated.birthday, // 原始生日（購買時填入）
        birthday_detail: updated.user_birthday_detail, // 開卡時補充
        blood_type: updated.blood_type,
        hobbies: updated.hobbies,
      },
      points: updated.points,
    });
  } catch (err) {
    console.error("activate error:", err);
    return Response.json(
      { status: "error", reason: "伺服器錯誤" },
      { status: 500 }
    );
  }
}