"use client";
import React, { useEffect, useState } from "react";

function ActivateForm({ uid, onActivated }) {
  const [name, setName] = useState("");
  const [birthdayDetail, setBirthdayDetail] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        name,
        birthday_detail: birthdayDetail,
        blood_type: bloodType,
        hobbies
      })
    });
    const data = await res.json();
    setLoading(false);
    if (data.status === "activated") onActivated(data);
    else alert(data.reason || "啟用失敗");
  }

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:520,margin:"48px auto",background:"#0f1630",padding:24,borderRadius:12}}>
      <h2>開卡流程</h2>
      <p style={{opacity:.8}}>填寫資訊，完成啟用</p>
      <input placeholder="姓名" value={name} onChange={e=>setName(e.target.value)} required style={iStyle}/>
      <input placeholder="生日詳細 (YYYY-MM-DD HH:mm)" value={birthdayDetail} onChange={e=>setBirthdayDetail(e.target.value)} required style={iStyle}/>
      <input placeholder="血型 (A/B/O/AB)" value={bloodType} onChange={e=>setBloodType(e.target.value)} required style={iStyle}/>
      <textarea placeholder="喜好 (逗號分隔)" value={hobbies} onChange={e=>setHobbies(e.target.value)} required style={{...iStyle,height:96}}/>
      <button disabled={loading} style={bStyle}>{loading?"送出中…":"啟用卡片"}</button>
    </form>
  );
}

function BirthdayBookHome({ user, points }) {
  return (
    <div style={{maxWidth:860,margin:"40px auto",padding:"0 16px"}}>
      <h1>🎉 歡迎 {user?.name || "朋友"}！</h1>
      <p>生日：{user?.birthday}</p>
      {user?.birthday_detail && <p>詳細：{user.birthday_detail}</p>}
      {user?.blood_type && <p>血型：{user.blood_type}</p>}
      {user?.hobbies && <p>喜好：{user.hobbies}</p>}
      <h3 style={{marginTop:24}}>點數餘額：{points} 點</h3>
      <div style={{marginTop:12,display:"flex",gap:12}}>
        <UseService uid={user?.uid} action="ZIWEI_YEAR" cost={5} label="紫微流年 (-5)"/>
        <UseService uid={user?.uid} action="MBTI_TEST" cost={5} label="MBTI 測驗 (-5)"/>
      </div>
    </div>
  );
}

function UseService({ uid, action, cost, label }) {
  async function run() {
    const res = await fetch("/api/use-points", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ uid, action, cost })
    });
    const data = await res.json();
    if (data.status === "ok") alert(`${label} 成功！餘額：${data.points}`);
    else alert(data.reason || "扣點失敗");
  }
  return <button onClick={run} style={bStyle}>{label}</button>;
}

export default function Page() {
  const [status, setStatus] = useState("loading");
  const [uid, setUid] = useState(null);
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const d = sp.get("d");
    const uuid = sp.get("uuid");
    (async () => {
      const res = await fetch(`/api/verify?d=${d}&uuid=${uuid}`);
      const data = await res.json();
      if (data.status === "pending") {
        const parsedUid = uuid?.substring(0,16);
        setUid(parsedUid);
        setStatus("pending");
      } else if (data.status === "activated") {
        setUid(data.user.uid);
        setUser({...data.user, uid: data.user.uid || uuid?.substring(0,16)});
        setPoints(data.points || 0);
        setStatus("activated");
      } else {
        setStatus("error");
      }
    })().catch(()=>setStatus("error"));
  }, []);

  if (status === "loading") return <Center>載入中…</Center>;
  if (status === "error") return <Center>⚠️ 驗證失敗，請重新感應卡片</Center>;
  if (status === "pending") return <ActivateForm uid={uid} onActivated={(data)=>{ setUser({...data.user, uid}); setPoints(data.points); setStatus("activated"); }}/>;
  if (status === "activated") return <BirthdayBookHome user={user} points={points}/>;
  return null;
}

const iStyle = { width:"100%", padding:"12px 14px", margin:"8px 0", borderRadius:8, border:"1px solid #223", background:"#0b1226", color:"#fff" };
const bStyle = { padding:"10px 16px", background:"#4f46e5", color:"#fff", border:"none", borderRadius:8, cursor:"pointer" };
function Center({children}){ return <div style={{display:"grid",placeItems:"center",height:"60vh"}}>{children}</div> }