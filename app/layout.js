import "./globals.css";

export const metadata = {
  title: "3D Project",
  description: "Next.js + React + Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1000,
            background: "rgba(24,24,24,0.95)",
            borderBottom: "1px solid #333",
            padding: "0.5rem 0",
          }}
        >
          <nav className="flex justify-center items-center space-x-8 py-2">
            <a
              href="/r-32"
              className="text-lg font-semibold text-white hover:text-purple-400 transition"
            >
              R32
            </a>
            <a
              href="/r-33"
              className="text-lg font-semibold text-white hover:text-purple-400 transition"
            >
              R33
            </a>
            <a
              href="/r-34"
              className="text-lg font-semibold text-white hover:text-blue-400 transition"
            >
              R34
            </a>
          </nav>
        </header>
        <div style={{ paddingTop: "56px" }}>{children}</div>
      </body>
    </html>
  );
}
