import { Intern } from "@/lib/api";
import { jobSubcategoryLabel } from "@/lib/job-taxonomy";

function splitTags(value: string | null): string[] {
  return value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

const MAX_VISIBLE_SKILLS = 5;

export function InternSummary({ intern }: { intern: Intern }) {
  const { basic_info, desired_conditions, skills } = intern;
  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
  const extraSkillCount = skills.length - visibleSkills.length;

  return (
    <div>
      {(basic_info.school_name || basic_info.department) && (
        <p className="muted" style={{ marginBottom: "0.4rem" }}>
          {[basic_info.school_name, basic_info.department].filter(Boolean).join(" / ")}
        </p>
      )}
      {desired_conditions.desired_roles.length > 0 && (
        <p className="card-meta" style={{ marginBottom: "0.4rem" }}>
          希望職種:{" "}
          {desired_conditions.desired_roles
            .slice()
            .sort((a, b) => a.priority - b.priority)
            .map((r) => jobSubcategoryLabel(r.job_category, r.job_subcategory))
            .join(" / ")}
        </p>
      )}
      {visibleSkills.length > 0 && (
        <div className="tag-list">
          {visibleSkills.map((skill) => (
            <span key={skill.id} className="tag">
              {skill.name}
            </span>
          ))}
          {extraSkillCount > 0 && <span className="tag tag-outline">+{extraSkillCount}</span>}
        </div>
      )}
      {desired_conditions.desired_location && (
        <div className="tag-list" style={{ marginTop: "0.3rem" }}>
          {splitTags(desired_conditions.desired_location).map((loc) => (
            <span key={loc} className="tag tag-outline">
              {loc}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
