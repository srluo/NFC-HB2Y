"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const d = searchParams.get("d");
  const uuid = searchParams.get("uuid");
  const router = useRouter();

  const [status, setStatus] = useState("loading"); // idle | loading | error | ok
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verify() {
      if (!d || !uuid) {
        setError("❌ 缺少必要參數");
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(`/api/verify?d=${d}&uuid=${uuid}`);
        const data = await res.json();
        console.log("VERIFY RESPONSE:", data);

        if (data.status === "ok") {
          setStatus("ok");
          setError(null);
          // ⏩ 自動跳轉到開卡頁
          router.push(`/activate?uid=${data.debug.uid}`);
        } else {
          setStatus("error");
          setError("⚠️ 驗證失敗，請重新感應卡片");
        }
      } catch (err) {
        setStatus("error");
        setError("⚠️ 系統錯誤，請稍後再試");
      }
    }

    verify();
  }, [d, uuid, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      {status === "loading" && <p>🔄 驗證中，請稍候…</p>}
      {status === "error" && <p className="text-red-500">{error}</p>}
    </div>
  );
}
