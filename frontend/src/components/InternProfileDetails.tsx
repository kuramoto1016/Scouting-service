import { Intern } from "@/lib/api";

export function InternProfileDetails({ intern }: { intern: Intern }) {
  const skillList = intern.skills
    ? intern.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div>
      {(intern.university || intern.faculty || intern.grade) && (
        <p className="muted" style={{ marginBottom: "0.4rem" }}>
          {[intern.university, intern.faculty, intern.grade].filter(Boolean).join(" / ")}
        </p>
      )}
      {intern.bio && <p style={{ marginBottom: "0.5rem" }}>{intern.bio}</p>}
      {skillList.length > 0 && (
        <div className="tag-list">
          {skillList.map((skill) => (
            <span key={skill} className="tag">
              {skill}
            </span>
          ))}
        </div>
      )}
      {(intern.desired_location || intern.desired_job_type) && (
        <p className="card-meta" style={{ marginTop: "0.5rem" }}>
          {intern.desired_job_type && `希望職種: ${intern.desired_job_type}`}
          {intern.desired_job_type && intern.desired_location && " / "}
          {intern.desired_location && `希望勤務地: ${intern.desired_location}`}
        </p>
      )}
    </div>
  );
}
