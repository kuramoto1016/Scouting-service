import { Intern } from "@/lib/api";

function splitTags(value: string | null): string[] {
  return value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

export function InternProfileDetails({ intern }: { intern: Intern }) {
  const skillList = splitTags(intern.skills);
  const jobTypeList = splitTags(intern.desired_job_type);
  const axisList = splitTags(intern.job_hunting_axes);

  return (
    <div>
      {(intern.university || intern.faculty || intern.grade) && (
        <p className="muted" style={{ marginBottom: "0.4rem" }}>
          {[intern.university, intern.faculty, intern.grade].filter(Boolean).join(" / ")}
        </p>
      )}
      {intern.bio && <p style={{ marginBottom: "0.5rem" }}>{intern.bio}</p>}
      {intern.career_goal && (
        <p className="muted" style={{ marginBottom: "0.5rem" }}>
          将来の目標: {intern.career_goal}
        </p>
      )}
      {skillList.length > 0 && (
        <div className="tag-list">
          {skillList.map((skill) => (
            <span key={skill} className="tag">
              {skill}
            </span>
          ))}
        </div>
      )}
      {jobTypeList.length > 0 && (
        <div className="tag-list" style={{ marginTop: "0.3rem" }}>
          {jobTypeList.map((jobType) => (
            <span key={jobType} className="tag tag-outline">
              {jobType}
            </span>
          ))}
        </div>
      )}
      {axisList.length > 0 && (
        <div className="tag-list" style={{ marginTop: "0.3rem" }}>
          {axisList.map((axis) => (
            <span key={axis} className="tag tag-axis">
              {axis}
            </span>
          ))}
        </div>
      )}
      {intern.desired_location && (
        <p className="card-meta" style={{ marginTop: "0.5rem" }}>
          希望勤務地: {intern.desired_location}
        </p>
      )}
      {intern.portfolio_url && (
        <p className="card-meta">
          <a href={intern.portfolio_url} target="_blank" rel="noopener noreferrer" className="link-accent">
            ポートフォリオを見る ↗
          </a>
        </p>
      )}
    </div>
  );
}
