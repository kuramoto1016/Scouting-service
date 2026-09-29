"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Intern, Conversation, JobPosting, fetchConversations, fetchJobPostings } from "@/lib/api";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { JobPostingCard } from "@/components/JobPostingCard";
import { SECTION_LABELS } from "@/lib/profile-labels";

const MAX_CONVERSATIONS = 3;
const MAX_JOB_POSTINGS = 3;

// "links" is shown as part of the portfolio_items edit page, not its own route.
function editSectionPathFor(section: Intern["missing_sections"][number]): string {
  const path = section === "links" ? "portfolio_items" : section;
  return `/mypage/edit/${path}`;
}

export function StudentHome({ intern, token }: { intern: Intern; token: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
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
    fetchJobPostings({ limit: MAX_JOB_POSTINGS })
      .then((res) => {
        if (cancelled) return;
        setJobPostings(res.job_postings);
      })
      .catch(() => {
        if (cancelled) return;
        setJobPostings([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingJobPostings(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="page-title">ホーム</h1>
      <div className="profile-layout">
        <ProfileSidebar intern={intern} />
        <div className="profile-main">
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
                <div className="card-title">{c.company?.name ?? c.title}</div>
                {c.latest_message && (
                  <div className="card-meta">
                    {c.latest_message.sender_name ? `${c.latest_message.sender_name}: ` : ""}
                    {c.latest_message.body}
                  </div>
                )}
              </Link>
            ))}
          </section>

          <section className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">おすすめの募集</h2>
              <Link href="/jobs" className="profile-section-edit">
                すべて見る
              </Link>
            </div>
            {loadingJobPostings && <p className="muted">読み込み中...</p>}
            {!loadingJobPostings && jobPostings.length === 0 && (
              <p className="muted">現在募集中の求人がありません。</p>
            )}
            {jobPostings.length > 0 && (
              <div className="jobs-grid">
                {jobPostings.map((job) => (
                  <JobPostingCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </section>

          {intern.missing_sections.length > 0 && (
            <section className="profile-section">
              <h2 className="profile-section-title">プロフィールを充実させましょう</h2>
              <p className="muted" style={{ marginBottom: "0.5rem" }}>
                未入力の項目: {intern.missing_sections.map((s) => SECTION_LABELS[s]).join("、")}
              </p>
              <Link href={editSectionPathFor(intern.missing_sections[0])} className="btn-primary">
                入力する
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
