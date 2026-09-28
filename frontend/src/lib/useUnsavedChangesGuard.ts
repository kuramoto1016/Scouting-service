"use client";

import { useEffect, useRef } from "react";

/**
 * Warns before the browser tab is closed/reloaded while `isDirty` is true.
 * In-app navigation (Next.js router links, our own Cancel buttons) is guarded
 * separately by calling `confirmDiscard()` before navigating, since the App
 * Router has no built-in route-change interception hook.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return {
    confirmDiscard: () => !isDirtyRef.current || window.confirm("編集中の内容が保存されていません。破棄してもよろしいですか？"),
  };
}
