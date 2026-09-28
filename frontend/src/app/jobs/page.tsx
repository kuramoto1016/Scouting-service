"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchJobPostings, JobPosting, JobCategory, WorkStyle } from "@/lib/api";
import { JobPostingCard, JobPostingCardSkeleton } from "@/components/JobPostingCard";
import { JobPostingFilters, JobPostingFilterValues } from "@/components/JobPostingFilters";

const SKELETON_COUNT = 6;

function valuesFromSearchParams(params: URLSearchParams): JobPostingFilterValues {
  return {
    graduationYear: params.get("graduation_year") ?? "",
    workStyle: (params.get("work_style") as WorkStyle | null) ?? "",
    jobCategory: (params.get("job_category") as JobCategory | null) ?? "",
    location: params.get("location") ?? "",
  };
}

function buildQueryString(values: JobPostingFilterValues): string {
  const params = new URLSearchParams();
  if (values.graduationYear) params.set("graduation_year", values.graduationYear);
  if (values.workStyle) params.set("work_style", values.workStyle);
  if (values.jobCategory) params.set("job_category", values.jobCategory);
  if (values.location) params.set("location", values.location);
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

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationInputState, setLocationInputState] = useState({
    value: filterValues.location,
    urlLocation: filterValues.location,
  });
  const locationInput =
    locationInputState.urlLocation === filterValues.location ? locationInputState.value : filterValues.location;

  const displayedFilterValues = useMemo(
    () => ({ ...filterValues, location: locationInput }),
    [filterValues, locationInput]
  );

  const replaceFilters = useCallback(
    (next: JobPostingFilterValues) => {
      const qs = buildQueryString(next);
      router.replace(qs ? `/jobs?${qs}` : "/jobs");
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (next: JobPostingFilterValues) => {
      if (next.location !== locationInput) {
        setLocationInputState({ value: next.location, urlLocation: filterValues.location });
        return;
      }

      replaceFilters(next);
    },
    [filterValues.location, locationInput, replaceFilters]
  );

  const handleReset = useCallback(() => {
    setLocationInputState({ value: "", urlLocation: "" });
    router.replace("/jobs");
  }, [router]);

  useEffect(() => {
    if (locationInput === filterValues.location) return;

    const timeoutId = window.setTimeout(() => {
      replaceFilters({ ...filterValues, location: locationInput });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filterValues, locationInput, replaceFilters]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- guarded by `cancelled` below
    setLoadingJobs(true);
    fetchJobPostings({
      graduationYear: filterValues.graduationYear || undefined,
      workStyle: filterValues.workStyle || undefined,
      jobCategory: filterValues.jobCategory || undefined,
      location: filterValues.location || undefined,
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
  }, [filterValues]);

  return (
    <div>
      <h1 className="page-title">募集一覧</h1>
      <div className="jobs-layout">
        <JobPostingFilters values={displayedFilterValues} onChange={handleFilterChange} onReset={handleReset} />
        <div className="jobs-results">
          {!loadingJobs && !error && <p className="muted jobs-count">募集中の求人 {totalCount}件</p>}
          {error && <p className="error-text">{error}</p>}

          {loadingJobs && (
            <div className="jobs-grid">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <JobPostingCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loadingJobs && !error && jobs.length === 0 && (
            <div className="jobs-empty">
              <p className="muted">条件に合致する求人が見つかりませんでした。</p>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                条件をリセット
              </button>
            </div>
          )}

          {!loadingJobs && jobs.length > 0 && (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <JobPostingCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
