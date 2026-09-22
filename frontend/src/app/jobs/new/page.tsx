"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createJobPosting, ApiError } from "@/lib/api";

export default function NewJobPage() {
  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (accountType !== "company") {
      router.push("/mypage");
    }
  }, [loading, token, accountType, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrors([]);
    setSubmitting(true);
    try {
      await createJobPosting(token, { title, description });
      router.push("/jobs");
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : ["掲載に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !token || accountType !== "company") return null;

  return (
    <div>
      <h1 className="page-title">募集を掲載する</h1>
      <form onSubmit={handleSubmit}>
        <label>
          タイトル
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          詳細
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        {errors.length > 0 && (
          <div className="error-text">
            {errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
        )}
        <button type="submit" disabled={submitting}>
          掲載する
        </button>
      </form>
    </div>
  );
}
