"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useNetworkError, isNetworkError } from "@/contexts/NetworkErrorContext";

export default function Stats() {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("classicqueen")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        setData(data);
      } catch (err) {
        if (cancelled) return;
        if (isNetworkError(err)) {
          reportNetworkError();
          return;
        }
        console.error("Stats fetch failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, reportNetworkError]);

  // ...render
}