"use client";

import { useState } from "react";

export default function ActivateCard() {
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    bloodType: "",
    hobbies: "",
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.status === "activated" || data.status === "ok") {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-4">
          🎉 開卡啟動
        </h1>
        <p className="text-center text-gray-600 mb-6">
          請填寫以下資訊，完成開卡程序
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              生日（YYYY-MM-DD）
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">血型</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            >
              <option value="">選擇血型</option>
              <option value="A">A 型</option>
              <option value="B">B 型</option>
              <option value="O">O 型</option>
              <option value="AB">AB 型</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">喜好</label>
            <textarea
              name="hobbies"
              value={formData.hobbies}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              rows="3"
            />
          </div>

          {/* ✅ 修正後的 button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 mt-4 hover:bg-indigo-700"
          >
            {status === "loading" ? "送出中..." : "完成開卡"}
          </button>
        </form>

        {status === "success" && (
          <p className="text-green-600 text-center mt-4">
            ✅ 開卡成功！已回贈生日書首頁與 20 點。
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-center mt-4">⚠️ 開卡失敗，請重試。</p>
        )}
      </div>
    </div>
  );
}