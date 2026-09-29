"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchJobPosting, JobPosting, ApiError } from "@/lib/api";
import { WORK_STYLE_LABELS, formatDateRange } from "@/lib/job-posting-labels";
import { jobCategoryLabel, jobSubcategoryLabel, usesSkillTags } from "@/lib/job-taxonomy";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = Number(params.id);

  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchJobPosting(jobId)
      .then((data) => {
        if (cancelled) return;
        setJob(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.errors.join(", ") : "募集情報の取得に失敗しました");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (loading) return <p className="muted">読み込み中...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!job) return null;

  const dateRange = formatDateRange(job.starts_on, job.ends_on);
  const showSkillTags = usesSkillTags(job.job_category);

  return (
    <div>
      <Link href="/jobs" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← 募集一覧に戻る
      </Link>
      <div className="card">
        {job.deadline_soon && <span className="job-card-badge job-card-badge-static">締切間近</span>}
        <h1 className="page-title">{job.title}</h1>
        <div className="card-meta">{job.company.name}</div>

        <div className="tag-list" style={{ margin: "0.75rem 0" }}>
          {job.job_category && (
            <span className="tag">
              {jobCategoryLabel(job.job_category)}
              {job.job_subcategory && `／${jobSubcategoryLabel(job.job_category, job.job_subcategory)}`}
            </span>
          )}
          {job.work_style && <span className="tag tag-outline">{WORK_STYLE_LABELS[job.work_style]}</span>}
          {job.graduation_year && <span className="tag tag-outline">{job.graduation_year}年卒</span>}
        </div>

        {(dateRange || job.location) && (
          <p className="card-meta" style={{ marginBottom: "0.75rem" }}>
            {dateRange}
            {dateRange && job.location && "｜"}
            {job.location}
          </p>
        )}

        <p style={{ whiteSpace: "pre-wrap", marginBottom: "1rem" }}>{job.description}</p>

        {showSkillTags && job.skills.length > 0 && (
          <div className="tag-list">
            {job.skills.map((skill) => (
              <span key={skill} className="tag tag-axis">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
