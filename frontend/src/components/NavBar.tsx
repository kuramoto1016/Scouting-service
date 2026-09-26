"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function NavBar() {
  const { token, accountType, account, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const brandHref = !loading && token ? (accountType === "company" ? "/interns" : "/jobs") : "/";

  return (
    <header className="navbar">
      <Link href={brandHref} className="navbar-brand">
        スカウトサービス
      </Link>
      <nav className="navbar-links">
        <Link href="/jobs">募集一覧</Link>
        {!loading && token && accountType === "company" && <Link href="/interns">インターン生一覧</Link>}
        {!loading && token && (
          <>
            <Link href="/mypage">マイページ</Link>
            <span className="navbar-account">{account?.name} さん</span>
            <button type="button" onClick={handleSignOut}>
              ログアウト
            </button>
          </>
        )}
        {!loading && !token && (
          <>
            <Link href="/login">ログイン</Link>
            <Link href="/signup/intern">インターン登録</Link>
            <Link href="/signup/company">企業登録</Link>
          </>
        )}
      </nav>
    </header>
  );
}
