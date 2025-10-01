"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/errorMessages";

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const router = useRouter();

  const [name, setName] = useState("");
  const [birthdayDetail, setBirthdayDetail] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/card-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          name,
          birthday_detail: birthdayDetail,
          blood_type: bloodType,
          hobbies
        }),
      });

      const data = await res.json();
      if (data.status === "activated") {
        setSuccess("卡片啟用成功 ✅，剩餘點數：" + data.points);
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError(getErrorMessage(data.code, "zh"));
      }
    } catch (err) {
      setError("⚠️ 系統錯誤，請稍後再試");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">卡片啟用</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <form onSubmit={handleSubmit}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="姓名" className="border p-1 w-full mb-2" />
        <input value={birthdayDetail} onChange={e => setBirthdayDetail(e.target.value)} placeholder="詳細生日" className="border p-1 w-full mb-2" />
        <input value={bloodType} onChange={e => setBloodType(e.target.value)} placeholder="血型" className="border p-1 w-full mb-2" />
        <input value={hobbies} onChange={e => setHobbies(e.target.value)} placeholder="喜好" className="border p-1 w-full mb-2" />
        <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-2 mt-2">確認啟用</button>
      </form>
    </div>
  );
}
