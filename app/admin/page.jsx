"use client";
import Papa from "papaparse";
import React, { useState } from "react";

export default function AdminPage() {
  const [rows, setRows] = useState([]);
  const [importing, setImporting] = useState(false);

  function handleCSV(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: ({ data }) => {
        const normalized = data.filter(Boolean).map(r => ({
          uid: (r.uid || "").trim(),
          tp: (r.tp || "HB").trim(),
          birthday: (r.birthday || "").trim(),
          points: parseInt(r.points || "0", 10) || 0
        })).filter(r=>r.uid);
        setRows(normalized);
      }
    });
  }

  async function importRows() {
    if (!rows.length) return alert("沒有可匯入的資料");
    setImporting(true);
    const res = await fetch("/api/import-cards", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ cards: rows })
    });
    const data = await res.json();
    setImporting(false);
    if (data?.success) alert(`匯入完成：${data.count} 筆`);
    else alert(data?.reason || "匯入失敗");
  }

  return (
    <div style={{maxWidth:1000,margin:"24px auto",padding:"0 12px"}}>
      <h1>🎂 生日書卡管理</h1>
      <input type="file" accept=".csv" onChange={handleCSV}/>
      <button onClick={importRows} disabled={importing} style={{marginLeft:12,padding:"8px 14px"}}>{importing?"匯入中…":"批次匯入"}</button>
      <table style={{width:"100%",marginTop:16,borderCollapse:"collapse"}}>
        <thead><tr><Th>UID</Th><Th>TP</Th><Th>生日(YYYYMMDD)</Th><Th>點數</Th></tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.uid}>
              <Td>{r.uid}</Td><Td>{r.tp}</Td><Td>{r.birthday}</Td><Td>{r.points}</Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={4} style={{textAlign:"center",opacity:.7}}>尚無資料</Td></tr>}
        </tbody>
      </table>
    </div>
  );
}
function Th({children}){return <th style={{borderBottom:"1px solid #334",textAlign:"left",padding:"8px"}}>{children}</th>}
function Td({children,...p}){return <td {...p} style={{borderBottom:"1px dashed #223",padding:"8px"}}>{children}</td>}