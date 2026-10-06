"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export function useWallet(userId) {
  const supabase = createClient();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();
    setBalance(data?.balance ?? 0);
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Create wallet if missing (call once on dashboard load)
  const ensureWallet = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("wallets").select("user_id").eq("user_id", userId).maybeSingle();
    if (!data) {
      await supabase.from("wallets").insert({ user_id: userId, balance: 0 });
    }
  }, [userId, supabase]);

  return { balance, loading, fetchBalance, ensureWallet };
}