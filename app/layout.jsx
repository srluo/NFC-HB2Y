export const metadata = { title: "NFC 生日書" };

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body style={{ fontFamily: "system-ui, sans-serif", background:"#0b1020", color:"#fff" }}>
        {children}
      </body>
    </html>
  );
}