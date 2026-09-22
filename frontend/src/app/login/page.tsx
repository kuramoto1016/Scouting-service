"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, ApiError, AccountType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("intern");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const res = await login({ accountType, email, password });
      if (res.account && res.account_type) {
        signIn(res.token, res.account_type, res.account);
        router.push("/mypage");
      }
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.errors);
      else setErrors(["ログインに失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">ログイン</h1>
      <div className="account-type-toggle" style={{ maxWidth: 420 }}>
        <button
          type="button"
          className={accountType === "intern" ? "active" : ""}
          onClick={() => setAccountType("intern")}
        >
          インターン生
        </button>
        <button
          type="button"
          className={accountType === "company" ? "active" : ""}
          onClick={() => setAccountType("company")}
        >
          企業
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.length > 0 && (
          <div className="error-text">
            {errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
        )}
        <button type="submit" disabled={submitting}>
          ログイン
        </button>
      </form>
    </div>
  );
}
