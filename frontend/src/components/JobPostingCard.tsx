import Link from "next/link";
import { JobPosting } from "@/lib/api";
import { WORK_STYLE_LABELS, jobCategoryGradient, jobCategoryIcon, formatDateRange } from "@/lib/job-posting-labels";
import { jobCategoryLabel, jobSubcategoryLabel } from "@/lib/job-taxonomy";

const MAX_VISIBLE_SKILLS = 3;

export function JobPostingCard({ job }: { job: JobPosting }) {
  const dateRange = formatDateRange(job.starts_on, job.ends_on);
  const metaParts = [
    job.graduation_year ? `${String(job.graduation_year).slice(2)}卒` : null,
    dateRange,
    job.work_style ? WORK_STYLE_LABELS[job.work_style] : null,
  ].filter(Boolean);

  const visibleSkills = job.skills.slice(0, MAX_VISIBLE_SKILLS);
  const extraSkillCount = job.skills.length - visibleSkills.length;

  return (
    <Link href={`/jobs/${job.id}`} className="job-card">
      {job.deadline_soon && <span className="job-card-badge">締切間近</span>}
      <div className="job-card-thumb" style={{ background: jobCategoryGradient(job.job_category) }}>
        <span className="job-card-thumb-icon">{jobCategoryIcon(job.job_category)}</span>
        {job.job_category && (
          <span className="job-card-thumb-label">
            {jobSubcategoryLabel(job.job_category, job.job_subcategory) ?? jobCategoryLabel(job.job_category)}
          </span>
        )}
      </div>
      <div className="job-card-body">
        <h3 className="job-card-title">{job.title}</h3>
        <div className="job-card-company">{job.company.name}</div>
        {metaParts.length > 0 && <div className="job-card-meta">{metaParts.join("｜")}</div>}
        {job.location && <div className="job-card-location">{job.location}</div>}
        {job.skills.length > 0 && (
          <div className="tag-list job-card-tags">
            {visibleSkills.map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))}
            {extraSkillCount > 0 && <span className="tag tag-outline">+{extraSkillCount}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

export function JobPostingCardSkeleton() {
  return (
    <div className="job-card job-card-skeleton">
      <div className="job-card-thumb skeleton-block" />
      <div className="job-card-body">
        <div className="skeleton-line skeleton-line-title" />
        <div className="skeleton-line skeleton-line-short" />
        <div className="skeleton-line skeleton-line-short" />
      </div>
    </div>
  );
}
