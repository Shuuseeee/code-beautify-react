"use client";

import StringCompare from "@/components/StringCompare";

export default function ComparePage() {
  return (
    <>
      <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full px-3 md:px-4 py-4 md:py-6 gap-3 md:gap-4 min-h-0">
        <StringCompare />
      </div>

      <footer className="py-5 text-center text-xs text-anthro-mid font-heading tracking-wide">
        Made with ♥ by Xingrui Zhou
      </footer>
    </>
  );
}
