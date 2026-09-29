"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchJobPostings, JobPosting, WorkStyle } from "@/lib/api";
import { JobPostingCard, JobPostingCardSkeleton } from "@/components/JobPostingCard";
import { JobPostingFilters, JobPostingFilterValues } from "@/components/JobPostingFilters";
import { upcomingGraduationYears } from "@/lib/job-posting-labels";

const SKELETON_COUNT = 6;

function graduationYearsFromJobs(jobs: JobPosting[]): number[] {
  return Array.from(new Set(jobs.map((job) => job.graduation_year).filter((year): year is number => year !== null))).sort(
    (a, b) => a - b
  );
}

function valuesFromSearchParams(params: URLSearchParams): JobPostingFilterValues {
  return {
    graduationYear: params.get("graduation_year") ?? "",
    workStyle: (params.get("work_style") as WorkStyle | null) ?? "",
    jobCategory: params.get("job_category") ?? "",
    jobSubcategory: params.get("job_subcategory") ?? "",
    location: params.get("location") ?? "",
  };
}

function parsePositiveIntegerParam(value: string | null): number | null | undefined {
  if (value === null) return undefined;
  if (!/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

// company_id represents where the visitor came from (e.g. a company's own
// dashboard) rather than a filter the user picks in the UI, so it is kept
// separate from JobPostingFilterValues but still carried through the URL.
function buildQueryString(values: JobPostingFilterValues, companyId: number | undefined): string {
  const params = new URLSearchParams();
  if (values.graduationYear) params.set("graduation_year", values.graduationYear);
  if (values.workStyle) params.set("work_style", values.workStyle);
  if (values.jobCategory) params.set("job_category", values.jobCategory);
  if (values.jobSubcategory) params.set("job_subcategory", values.jobSubcategory);
  if (values.location) params.set("location", values.location);
  if (companyId) params.set("company_id", String(companyId));
  return params.toString();
}

export default function JobsPage() {
  return (
    <Suspense fallback={<p className="muted">読み込み中...</p>}>
      <JobsPageContent />
    </Suspense>
  );
}

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filterValues = useMemo(() => valuesFromSearchParams(searchParams), [searchParams]);
  const companyIdParam = searchParams.get("company_id");
  const parsedCompanyId = useMemo(() => parsePositiveIntegerParam(companyIdParam), [companyIdParam]);
  const companyId = parsedCompanyId ?? undefined;
  const hasInvalidCompanyId = parsedCompanyId === null;

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [fetchedGraduationYearOptions, setFetchedGraduationYearOptions] = useState<number[]>([]);
  const graduationYearOptions = useMemo(() => {
    const selectedYear = filterValues.graduationYear ? Number(filterValues.graduationYear) : null;
    const fetchedOptions = hasInvalidCompanyId ? [] : fetchedGraduationYearOptions;
    const years = new Set([...upcomingGraduationYears(), ...fetchedOptions]);
    if (selectedYear !== null) years.add(selectedYear);
    return Array.from(years).sort((a, b) => a - b);
  }, [fetchedGraduationYearOptions, filterValues.graduationYear, hasInvalidCompanyId]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localLocationDraft, setLocalLocationDraft] = useState<string | null>(null);
  const locationInput = localLocationDraft ?? filterValues.location;

  const displayedFilterValues = useMemo(
    () => ({ ...filterValues, location: locationInput }),
    [filterValues, locationInput]
  );
  const displayedJobs = hasInvalidCompanyId ? [] : jobs;
  const displayedTotalCount = hasInvalidCompanyId ? 0 : totalCount;
  const displayedLoadingJobs = hasInvalidCompanyId ? false : loadingJobs;
  const displayedError = hasInvalidCompanyId ? "会社IDが不正です。" : error;

  const replaceFilters = useCallback(
    (next: JobPostingFilterValues) => {
      const qs = buildQueryString(next, companyId);
      router.replace(qs ? `/jobs?${qs}` : "/jobs");
    },
    [router, companyId]
  );

  const handleFilterChange = useCallback(
    (next: JobPostingFilterValues) => {
      if (next.location !== locationInput) {
        setLocalLocationDraft(next.location);
        return;
      }

      replaceFilters(next);
    },
    [locationInput, replaceFilters]
  );

  const handleReset = useCallback(() => {
    setLocalLocationDraft(null);
    const qs = companyId ? new URLSearchParams({ company_id: String(companyId) }).toString() : "";
    router.replace(qs ? `/jobs?${qs}` : "/jobs");
  }, [router, companyId]);

  useEffect(() => {
    if (localLocationDraft === null || localLocationDraft === filterValues.location) return;

    const draft = localLocationDraft;
    const timeoutId = window.setTimeout(() => {
      replaceFilters({ ...filterValues, location: draft });
      setLocalLocationDraft(null);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filterValues, localLocationDraft, replaceFilters]);

  useEffect(() => {
    let cancelled = false;

    if (hasInvalidCompanyId) return;

    fetchJobPostings({ companyId })
      .then((res) => {
        if (cancelled) return;
        setFetchedGraduationYearOptions(graduationYearsFromJobs(res.job_postings));
      })
      .catch(() => {
        if (cancelled) return;
        setFetchedGraduationYearOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [companyId, hasInvalidCompanyId]);

  useEffect(() => {
    let cancelled = false;

    if (hasInvalidCompanyId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- guarded by `cancelled` below
    setLoadingJobs(true);

    fetchJobPostings({
      graduationYear: filterValues.graduationYear || undefined,
      workStyle: filterValues.workStyle || undefined,
      jobCategory: filterValues.jobCategory || undefined,
      jobSubcategory: filterValues.jobSubcategory || undefined,
      location: filterValues.location || undefined,
      companyId,
    })
      .then((res) => {
        if (cancelled) return;
        setJobs(res.job_postings);
        setTotalCount(res.total_count);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setJobs([]);
        setTotalCount(0);
        setError("募集情報の取得に失敗しました。");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingJobs(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterValues, companyId, hasInvalidCompanyId]);

  return (
    <div>
      <h1 className="page-title">募集一覧</h1>
      <div className="jobs-layout">
        <JobPostingFilters
          values={displayedFilterValues}
          graduationYearOptions={graduationYearOptions}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
        <div className="jobs-results">
          {!displayedLoadingJobs && !displayedError && <p className="muted jobs-count">募集中の求人 {displayedTotalCount}件</p>}
          {displayedError && <p className="error-text">{displayedError}</p>}

          {displayedLoadingJobs && (
            <div className="jobs-grid">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <JobPostingCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!displayedLoadingJobs && !displayedError && displayedJobs.length === 0 && (
            <div className="jobs-empty">
              <p className="muted">条件に合致する求人が見つかりませんでした。</p>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                条件をリセット
              </button>
            </div>
          )}

          {!displayedLoadingJobs && displayedJobs.length > 0 && (
            <div className="jobs-grid">
              {displayedJobs.map((job) => (
                <JobPostingCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
