import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="hero">
        <h1 className="page-title">インターン生と企業をつなぐスカウトサービス</h1>
        <p className="muted" style={{ marginBottom: "1.5rem" }}>
          インターン生は登録してプロフィールを公開、企業はインターン生にメッセージを送ってスカウトできます。
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/signup/intern" className="btn-primary">
            インターン生として登録
          </Link>
          <Link href="/signup/company" className="btn-primary">
            企業として登録
          </Link>
          <Link href="/login">既にアカウントをお持ちの方はこちら</Link>
        </div>
      </div>
      <div>
        <Link href="/jobs">募集一覧を見る →</Link>
      </div>
    </div>
  );
}
