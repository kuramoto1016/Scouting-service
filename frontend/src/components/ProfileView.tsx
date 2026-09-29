import Link from "next/link";
import { Intern, ProfileSection } from "@/lib/api";
import {
  SCHOOL_TYPE_LABELS,
  SKILL_CATEGORY_LABELS,
  SKILL_LEVEL_LABELS,
  PORTFOLIO_CONTEXT_LABELS,
  SECTION_LABELS,
  formatGraduationYearMonth,
} from "@/lib/profile-labels";
import { jobSubcategoryLabel } from "@/lib/job-taxonomy";

function splitTags(value: string | null): string[] {
  return value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

function SectionHeader({
  title,
  editable,
  editHref,
}: {
  title: string;
  editable: boolean;
  editHref?: string;
}) {
  return (
    <div className="profile-section-header">
      <h2 className="profile-section-title">{title}</h2>
      {editable && editHref && (
        <Link href={editHref} className="profile-section-edit">
          編集
        </Link>
      )}
    </div>
  );
}

function EmptySection({ editable, editHref }: { editable: boolean; editHref?: string }) {
  if (!editable) {
    return (
      <div className="profile-section-empty">
        <p className="muted">未登録</p>
      </div>
    );
  }

  return (
    <div className="profile-section-empty">
      <p className="muted">未登録</p>
      <p className="muted" style={{ fontSize: "0.8rem" }}>
        追加すると企業の目に留まりやすくなります。
      </p>
      {editHref && (
        <Link href={editHref} className="btn-secondary" style={{ marginTop: "0.5rem" }}>
          追加する
        </Link>
      )}
    </div>
  );
}

export function ProfileView({
  intern,
  editable,
  editHrefFor,
}: {
  intern: Intern;
  editable: boolean;
  editHrefFor?: (section: ProfileSection) => string;
}) {
  const { basic_info, desired_conditions, skills, portfolio_items, highlights, self_pr, links } = intern;
  const missing = new Set(intern.missing_sections);
  const editHref = (section: ProfileSection) => editHrefFor?.(section);

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});

  return (
    <div className="profile-view">
      {/* 基本情報 */}
      <section className="profile-section">
        <SectionHeader
          title={SECTION_LABELS.basic_info}
          editable={editable}
          editHref={editHref("basic_info")}
        />
        {missing.has("basic_info") ? (
          <EmptySection editable={editable} editHref={editHref("basic_info")} />
        ) : (
          <div>
            {basic_info.school_type && <p className="muted">{SCHOOL_TYPE_LABELS[basic_info.school_type]}</p>}
            <p>
              {[basic_info.school_name, basic_info.department].filter(Boolean).join(" / ")}
            </p>
            {basic_info.graduation_year_month && (
              <p className="card-meta">{formatGraduationYearMonth(basic_info.graduation_year_month)}</p>
            )}
          </div>
        )}
      </section>

      {/* 希望条件 */}
      <section className="profile-section">
        <SectionHeader
          title={SECTION_LABELS.desired_conditions}
          editable={editable}
          editHref={editHref("desired_conditions")}
        />
        {missing.has("desired_conditions") ? (
          <EmptySection editable={editable} editHref={editHref("desired_conditions")} />
        ) : (
          <div>
            {desired_conditions.desired_roles.length > 0 && (
              <ol className="desired-roles-list">
                {desired_conditions.desired_roles
                  .slice()
                  .sort((a, b) => a.priority - b.priority)
                  .map((r) => (
                    <li key={r.job_subcategory}>
                      <span className="tag">{r.priority}位</span>{" "}
                      {jobSubcategoryLabel(r.job_category, r.job_subcategory)}
                    </li>
                  ))}
              </ol>
            )}
            {desired_conditions.desired_location && (
              <div className="tag-list" style={{ marginTop: "0.5rem" }}>
                {splitTags(desired_conditions.desired_location).map((loc) => (
                  <span key={loc} className="tag tag-outline">
                    {loc}
                  </span>
                ))}
              </div>
            )}
            {desired_conditions.job_hunting_axes && (
              <div className="tag-list" style={{ marginTop: "0.3rem" }}>
                {splitTags(desired_conditions.job_hunting_axes).map((axis) => (
                  <span key={axis} className="tag tag-axis">
                    {axis}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* スキル */}
      <section className="profile-section">
        <SectionHeader title={SECTION_LABELS.skills} editable={editable} editHref={editHref("skills")} />
        {missing.has("skills") ? (
          <EmptySection editable={editable} editHref={editHref("skills")} />
        ) : (
          <div>
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category} style={{ marginBottom: "0.6rem" }}>
                <p className="card-meta">{SKILL_CATEGORY_LABELS[category as keyof typeof SKILL_CATEGORY_LABELS]}</p>
                <div className="tag-list">
                  {categorySkills.map((skill) => (
                    <span key={skill.id} className="tag skill-badge">
                      {skill.name}
                      <span className="skill-level-badge">{SKILL_LEVEL_LABELS[skill.level]}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 制作物 */}
      <section className="profile-section">
        <SectionHeader
          title={SECTION_LABELS.portfolio_items}
          editable={editable}
          editHref={editHref("portfolio_items")}
        />
        {missing.has("portfolio_items") ? (
          <EmptySection editable={editable} editHref={editHref("portfolio_items")} />
        ) : (
          <div className="portfolio-item-list">
            {portfolio_items.map((item) => (
              <div key={item.id} className="card portfolio-item-card">
                <div className="card-title">{item.title}</div>
                {item.context && <div className="card-meta">{PORTFOLIO_CONTEXT_LABELS[item.context]}</div>}
                {item.summary && <p style={{ marginBottom: "0.5rem" }}>{item.summary}</p>}
                {item.tech_stack.length > 0 && (
                  <div className="tag-list" style={{ marginBottom: "0.5rem" }}>
                    {item.tech_stack.map((tech) => (
                      <span key={tech} className="tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {item.highlights && (
                  <p className="muted" style={{ marginBottom: "0.5rem" }}>
                    工夫した点: {item.highlights}
                  </p>
                )}
                <div style={{ display: "flex", gap: "1rem" }}>
                  {item.github_url && (
                    <a href={item.github_url} target="_blank" rel="noopener noreferrer" className="link-accent">
                      GitHub ↗
                    </a>
                  )}
                  {item.other_url && (
                    <a href={item.other_url} target="_blank" rel="noopener noreferrer" className="link-accent">
                      関連リンク ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 学生時代に力を入れたこと */}
      <section className="profile-section">
        <SectionHeader
          title={SECTION_LABELS.highlights}
          editable={editable}
          editHref={editHref("highlights")}
        />
        {missing.has("highlights") ? (
          <EmptySection editable={editable} editHref={editHref("highlights")} />
        ) : (
          <div className="portfolio-item-list">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="card portfolio-item-card">
                <div className="card-title">{highlight.title}</div>
                <p style={{ whiteSpace: "pre-wrap" }}>{highlight.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 自己PR・将来のキャリア */}
      <section className="profile-section">
        <SectionHeader title={SECTION_LABELS.self_pr} editable={editable} editHref={editHref("self_pr")} />
        {missing.has("self_pr") ? (
          <EmptySection editable={editable} editHref={editHref("self_pr")} />
        ) : (
          <div>
            {self_pr.bio && <p style={{ marginBottom: "0.5rem" }}>{self_pr.bio}</p>}
            {self_pr.career_goal && <p className="muted">{self_pr.career_goal}</p>}
          </div>
        )}
      </section>

      {/* リンク */}
      <section className="profile-section">
        <SectionHeader title={SECTION_LABELS.links} editable={editable} editHref={editHref("portfolio_items")} />
        {missing.has("links") ? (
          <EmptySection editable={editable} editHref={editHref("portfolio_items")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {links.map((link) => (
              <div key={link.portfolio_item_id}>
                {link.github_url && (
                  <a href={link.github_url} target="_blank" rel="noopener noreferrer" className="link-accent">
                    {link.title}（GitHub） ↗
                  </a>
                )}
                {link.other_url && (
                  <a href={link.other_url} target="_blank" rel="noopener noreferrer" className="link-accent">
                    {link.title} ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
