"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Intern, ProfileSection } from "@/lib/api";
import { SECTION_LABELS } from "@/lib/profile-labels";
import { BasicInfoForm } from "../sections/BasicInfoForm";
import { DesiredConditionsForm } from "../sections/DesiredConditionsForm";
import { SkillsForm } from "../sections/SkillsForm";
import { PortfolioItemsForm } from "../sections/PortfolioItemsForm";
import { SelfPrForm } from "../sections/SelfPrForm";

const VALID_SECTIONS: ProfileSection[] = [
  "basic_info",
  "desired_conditions",
  "skills",
  "portfolio_items",
  "self_pr",
];

export default function EditSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section as ProfileSection;

  const { token, accountType, account, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (accountType !== "intern") {
      router.push("/mypage");
    }
  }, [loading, token, accountType, router]);

  if (loading || !token || accountType !== "intern" || !account) return null;
  if (!VALID_SECTIONS.includes(section)) {
    return <p className="error-text">不明なセクションです</p>;
  }

  const intern = account as Intern;

  return (
    <div>
      <h1 className="page-title">{SECTION_LABELS[section]}を編集</h1>
      {section === "basic_info" && <BasicInfoForm intern={intern} />}
      {section === "desired_conditions" && <DesiredConditionsForm intern={intern} />}
      {section === "skills" && <SkillsForm intern={intern} />}
      {section === "portfolio_items" && <PortfolioItemsForm intern={intern} />}
      {section === "self_pr" && <SelfPrForm intern={intern} />}
    </div>
  );
}
