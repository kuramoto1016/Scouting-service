"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Company, Conversation, JobPosting, fetchConversations, fetchJobPostings } from "@/lib/api";

const MAX_CONVERSATIONS = 3;
const MAX_JOB_POSTINGS = 5;

export function CompanyHome({ company, token }: { company: Company; token: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [totalJobPostingCount, setTotalJobPostingCount] = useState(0);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingJobPostings, setLoadingJobPostings] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchConversations(token)
      .then((data) => {
        if (cancelled) return;
        setConversations(data.slice(0, MAX_CONVERSATIONS));
      })
      .catch(() => {
        if (cancelled) return;
        setConversations([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingConversations(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    fetchJobPostings({ companyId: company.id, limit: MAX_JOB_POSTINGS })
      .then((res) => {
        if (cancelled) return;
        setJobPostings(res.job_postings);
        setTotalJobPostingCount(res.total_count);
      })
      .catch(() => {
        if (cancelled) return;
        setJobPostings([]);
        setTotalJobPostingCount(0);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingJobPostings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [company.id]);

  return (
    <div>
      <h1 className="page-title">ホーム</h1>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">{company.name}</div>
        <div className="card-meta">{company.email}</div>
        {company.description && <p style={{ marginTop: "0.5rem" }}>{company.description}</p>}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <Link href="/interns" className="btn-primary">
            インターン生一覧を見る
          </Link>
          <Link href="/jobs/new" className="btn-secondary">
            募集を掲載する
          </Link>
        </div>
      </div>

      <section className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">自社の求人（{totalJobPostingCount}件）</h2>
          <Link href={`/jobs?company_id=${company.id}`} className="profile-section-edit">
            すべて見る
          </Link>
        </div>
        {loadingJobPostings && <p className="muted">読み込み中...</p>}
        {!loadingJobPostings && jobPostings.length === 0 && (
          <div>
            <p className="muted" style={{ marginBottom: "0.5rem" }}>まだ求人を掲載していません。</p>
            <Link href="/jobs/new" className="btn-primary">
              募集を掲載する
            </Link>
          </div>
        )}
        {jobPostings.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="card" style={{ display: "block" }}>
            <div className="card-title">{job.title}</div>
            {job.deadline_soon && <span className="job-card-badge job-card-badge-static">締切間近</span>}
          </Link>
        ))}
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">最新のメッセージ</h2>
          <Link href="/messages" className="profile-section-edit">
            すべて見る
          </Link>
        </div>
        {loadingConversations && <p className="muted">読み込み中...</p>}
        {!loadingConversations && conversations.length === 0 && (
          <p className="muted">まだメッセージのやり取りがありません。</p>
        )}
        {conversations.map((c) => (
          <Link key={c.id} href={`/messages/${c.id}`} className="card" style={{ display: "block" }}>
            <div className="card-title">{c.title}</div>
            {c.latest_message && (
              <div className="card-meta">
                {c.latest_message.sender_name ? `${c.latest_message.sender_name}: ` : ""}
                {c.latest_message.deleted ? "（このメッセージは削除されました）" : c.latest_message.body}
              </div>
            )}
          </Link>
        ))}
      </section>
    </div>
  );
}
