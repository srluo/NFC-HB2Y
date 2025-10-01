"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ⬅️ 關鍵：禁止 SSG，強制動態
export const dynamic = "force-dynamic";

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");  // ← 只會在瀏覽器生效
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    birthday_detail: "",
    blood_type: "",
    hobbies: ""
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/card-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, ...form }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(`error: ${data.code || data.reason}`);
      } else {
        setStatus(`✅ 卡片啟用成功！點數：${data.points}`);
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (err) {
      setStatus("error: network error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">啟用生日書卡</h1>
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
          placeholder="生日（詳細，如 1965-04-04）"
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
          {status === "loading" ? "啟用中..." : "啟用卡片"}
        </button>
      </form>

      {status !== "idle" && (
        <div className="mt-4 text-sm text-gray-700">{status}</div>
      )}
    </div>
  );
}
