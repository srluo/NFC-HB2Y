"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";  // ⬅️ 關鍵，禁止靜態化

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid"); // ← 從網址帶進來的 UID
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    birthday_detail: "",
    blood_type: "",
    hobbies: ""
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/card-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, ...form }),
      });

      const data = await res.json();

      if (res.ok && data.status === "activated") {
        setStatus("success");
        setMessage(`卡片啟用成功 ✅，剩餘點數：${data.points}`);
        setTimeout(() => router.push("/"), 2000); // 2秒後回首頁
      } else {
        setStatus("error");
        setMessage(`⚠️ 啟用失敗：${data.code || data.reason}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("⚠️ 系統錯誤，請稍後再試");
    }
  };

  if (!uid) {
    return (
      <div className="p-4 text-center text-red-500">
        ❌ 缺少 UID，請先感應卡片
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">啟用生日書卡</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="姓名"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="birthday_detail"
          placeholder="詳細生日 (例如 1965-04-04)"
          value={form.birthday_detail}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="blood_type"
          placeholder="血型"
          value={form.blood_type}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="hobbies"
          placeholder="興趣嗜好"
          value={form.hobbies}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-indigo-600 text-white rounded-lg py-2 mt-4 hover:bg-indigo-700"
        >
          {status === "loading" ? "啟用中..." : "確認啟用"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 text-sm ${
            status === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
