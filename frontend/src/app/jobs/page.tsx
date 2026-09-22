"use client";

import { useEffect, useState } from "react";
import { fetchJobPostings, JobPosting } from "@/lib/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    fetchJobPostings()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">募集一覧</h1>
      {loadingJobs && <p className="muted">読み込み中...</p>}
      {!loadingJobs && jobs.length === 0 && <p className="muted">現在募集はありません。</p>}
      {jobs.map((job) => (
        <div key={job.id} className="card">
          <div className="card-title">{job.title}</div>
          <div className="card-meta">{job.company.name}</div>
          <p>{job.description}</p>
        </div>
      ))}
    </div>
  );
}
