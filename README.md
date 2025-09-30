# NFC 生日書 (43NT MVP)

- Next.js (App Router) on Vercel
- Vercel KV (Redis) 作為資料庫
- SIC43NT uuid: UID + TP + TS + RLC (TP=HB)

## 環境變數
在 Vercel 專案 Settings → Storage → KV 啟用後自帶：
- KV_URL
- KV_REST_API_URL
- KV_REST_API_TOKEN
- KV_REST_API_READ_ONLY_TOKEN

自訂：
- MICKEY_SECRET_KEY=你的密鑰

## 路由
- `/` 使用者入口，會讀 `?d=YYYYMMDD&uuid=...`
- `/admin` 管理頁（CSV 匯入空卡）
- `/api/verify` 驗證 uuid（⚠️ RLC 需換為 Mickey 1.0 驗證）
- `/api/activate` 開卡（寫個資、給 20 點）
- `/api/use-points` 扣點（寫交易紀錄）
- `/api/import-cards` 批次匯入空卡

## 本地開發
```bash
npm i
npm run dev
