"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";

export function TimeAgo({ date }: { date: Date | string }) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    // Only execute on client inside useEffect, avoiding Next.js prerender checks
    setFormatted(timeAgo(date, Date.now()));
  }, [date]);

  if (!formatted) {
    return <span className="opacity-0">...</span>;
  }

  return <span>{formatted}</span>;
}
