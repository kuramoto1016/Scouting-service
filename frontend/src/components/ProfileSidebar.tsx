import { Intern } from "@/lib/api";
import { SECTION_LABELS } from "@/lib/profile-labels";

function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase();
}

export function ProfileSidebar({
  intern,
  nav,
}: {
  intern: Intern;
  nav?: React.ReactNode;
}) {
  const nextToFill = intern.missing_sections[0];

  return (
    <aside className="profile-sidebar">
      <div className="profile-avatar">{initials(intern.name)}</div>
      <h2 className="profile-sidebar-name">{intern.name}</h2>
      {intern.basic_info.school_name && <p className="muted">{intern.basic_info.school_name}</p>}

      <div className="profile-completion">
        <div className="profile-completion-bar">
          <div
            className="profile-completion-fill"
            style={{ width: `${intern.completion_percentage}%` }}
          />
        </div>
        <p className="card-meta">プロフィール完成度 {intern.completion_percentage}%</p>
      </div>

      {nextToFill && (
        <p className="profile-next-to-fill">
          次に埋めると良い項目: {SECTION_LABELS[nextToFill]}
        </p>
      )}

      {nav}
    </aside>
  );
}
