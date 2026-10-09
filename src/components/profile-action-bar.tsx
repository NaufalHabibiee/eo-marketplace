"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Compact bar that slides in under the site header once the profile card scrolls out of view. */
export function ProfileActionBar({ watchId, children }: { watchId: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-16 z-30 hidden border-b border-line bg-surface/95 backdrop-blur-md transition-[transform,opacity] duration-300 lg:top-20 lg:block ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">{children}</div>
    </div>
  );
}
