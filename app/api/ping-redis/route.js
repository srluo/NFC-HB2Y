import { kv } from "@/lib/kv";

export async function GET() {
  try {
    const pong = await kv.ping(); // Redis 的 ping 指令
    return Response.json({
      status: "ok",
      pong,
      redisUrl: process.env.UPSTASH_REDIS_REST_URL,
    });
  } catch (err) {
    return Response.json({
      status: "error",
      message: err.message,
      redisUrl: process.env.UPSTASH_REDIS_REST_URL || "not set",
    }, { status: 500 });
  }
}