"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  useEffect(() => {
    const updatePayment = async () => {
      if (!sessionId) return;
      const supabase = createClient();
      await supabase
        .from("payments")
        .update({ payment_status: "success" })
        .eq("session_id", sessionId);
    };
    updatePayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-4">भुगतान सफल 🎉</h1>
      <p className="text-gray-700 mb-6">आपकी परामर्श बुकिंग सफल रही है।</p>
      <a
        href="/"
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        होम पर जाएं
      </a>
    </div>
  );
}
