"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signupCompany, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function CompanySignupPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const res = await signupCompany({ name, email, password, description });
      if (res.company) {
        signIn(res.token, "company", res.company);
        router.push("/mypage");
      }
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.errors);
      else setErrors(["登録に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">企業登録</h1>
      <form onSubmit={handleSubmit}>
        <label>
          企業名
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          パスワード（8文字以上）
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label>
          企業紹介
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {errors.length > 0 && (
          <div className="error-text">
            {errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
        )}
        <button type="submit" disabled={submitting}>
          登録する
        </button>
      </form>
    </div>
  );
}
