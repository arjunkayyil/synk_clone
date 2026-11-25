"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";

export function TimeAgo({ date }: { date: Date | string }) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    setFormatted(timeAgo(date));
  }, [date]);

  if (!formatted) {
    return <span className="opacity-0">...</span>;
  }

  return <span>{formatted}</span>;
}
