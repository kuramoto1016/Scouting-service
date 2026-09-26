"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchInterns, Intern } from "@/lib/api";
import { InternProfileDetails } from "@/components/InternProfileDetails";
import { SUGGESTED_SKILLS } from "@/components/SkillPicker";
import { SUGGESTED_JOB_TYPES } from "@/components/JobTypePicker";
import { SUGGESTED_LOCATIONS } from "@/components/LocationPicker";

export default function InternsListPage() {
  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loadingInterns, setLoadingInterns] = useState(true);

  const [keywordInput, setKeywordInput] = useState("");
  const [skill, setSkill] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

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

  useEffect(() => {
    if (!token || accountType !== "company") return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- guarded by `cancelled` below
    setLoadingInterns(true);
    fetchInterns(token, { keyword: appliedKeyword, skill, jobType, location })
      .then((data) => {
        if (cancelled) return;
        setInterns(data);
      })
      .catch(() => {
        if (cancelled) return;
        setInterns([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingInterns(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, accountType, appliedKeyword, skill, jobType, location]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppliedKeyword(keywordInput.trim());
  };

  const handleReset = () => {
    setKeywordInput("");
    setAppliedKeyword("");
    setSkill("");
    setJobType("");
    setLocation("");
  };

  if (loading || !token || accountType !== "company") return null;

  return (
    <div>
      <h1 className="page-title">インターン生一覧</h1>

      <form onSubmit={handleSearchSubmit} className="search-form">
        <label>
          キーワード
          <input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="名前・自己紹介・大学名など"
          />
        </label>
        <label>
          スキル
          <select value={skill} onChange={(e) => setSkill(e.target.value)}>
            <option value="">指定なし</option>
            {SUGGESTED_SKILLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          希望職種
          <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="">指定なし</option>
            {SUGGESTED_JOB_TYPES.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </label>
        <label>
          希望勤務地
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">指定なし</option>
            {SUGGESTED_LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit">検索</button>
          <button type="button" onClick={handleReset} className="btn-secondary">
            条件をクリア
          </button>
        </div>
      </form>

      {loadingInterns && <p className="muted">読み込み中...</p>}
      {!loadingInterns && interns.length === 0 && <p className="muted">該当するインターン生が見つかりませんでした。</p>}
      {interns.map((intern) => (
        <div key={intern.id} className="card">
          <Link href={`/interns/${intern.id}`} className="card-title card-title-link">
            {intern.name}
          </Link>
          <div className="card-meta">{intern.email}</div>
          <InternProfileDetails intern={intern} />
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href={`/interns/${intern.id}`}>プロフィールを見る</Link>
            <Link href={`/messages/intern/${intern.id}`}>メッセージを送る</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
