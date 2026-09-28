"use client";

import { useState } from "react";
import Link from "next/link";
import { Intern, ProfileSection } from "@/lib/api";
import { ProfileView } from "@/components/ProfileView";
import { ProfileSidebar } from "@/components/ProfileSidebar";

function editHrefFor(section: ProfileSection): string {
  return `/mypage/edit/${section}`;
}

export function StudentMyPage({ intern }: { intern: Intern }) {
  const [viewAsCompany, setViewAsCompany] = useState(false);

  return (
    <div>
      <div className="profile-view-toggle">
        <button
          type="button"
          className={!viewAsCompany ? "active" : ""}
          onClick={() => setViewAsCompany(false)}
        >
          自分の編集画面
        </button>
        <button type="button" className={viewAsCompany ? "active" : ""} onClick={() => setViewAsCompany(true)}>
          企業からの見え方
        </button>
      </div>

      <div className="profile-layout">
        <ProfileSidebar
          intern={intern}
          nav={
            <nav className="profile-nav">
              <Link href="/mypage">プロフィール</Link>
              <Link href="/mypage#conversations">受信したスカウト</Link>
              <Link href="/jobs">気になる募集</Link>
              <Link href="/mypage/edit/self_pr">設定</Link>
            </nav>
          }
        />
        <div className="profile-main">
          <ProfileView
            intern={intern}
            editable={!viewAsCompany}
            editHrefFor={editHrefFor}
          />
        </div>
      </div>
    </div>
  );
}
