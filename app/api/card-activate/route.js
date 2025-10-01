import { kv } from "@/lib/kv";
import { apiError } from "@/lib/apiError";

export async function POST(req) {
  const { uid, name, birthday_detail, blood_type, hobbies } = await req.json();

  if (!uid) return apiError("MISSING_UID", 400);

  const key = `card:${uid}`;
  const card = await kv.hgetall(key);

  if (!card) return apiError("CARD_NOT_FOUND", 404);
  if (card.status === "ACTIVATED") return apiError("CARD_ALREADY_ACTIVATED", 409);

  const updated = {
    ...card,
    user_name: name || "",
    user_birthday_detail: birthday_detail || "",
    blood_type: blood_type || "",
    hobbies: hobbies || "",
    status: "ACTIVATED",
    points: 20,
    updated_at: new Date().toISOString()
  };
  await kv.hset(key, updated);

  return Response.json({
    status: "activated",
    user: {
      uid,
      name: updated.user_name,
      birthday: updated.birthday,
      birthday_detail: updated.user_birthday_detail,
      blood_type: updated.blood_type,
      hobbies: updated.hobbies
    },
    points: updated.points
  });
}
