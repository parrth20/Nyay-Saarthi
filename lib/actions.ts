// lib/actions.ts
'use server' // <-- MUST BE THE VERY FIRST LINE

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  console.log("Attempting sign out...");
  const supabase = createClient()
  const { error } = await supabase.auth.signOut(); // Keep error handling simple for now
  if (error) {
      console.error("Sign out error:", error);
      // Handle error appropriately, maybe redirect to an error page or return an error state
      // For now, we'll still try to redirect
  } else {
      console.log("Sign out successful on server.");
  }
  // Revalidate and redirect regardless of minor errors for now
  // revalidatePath('/', 'layout'); // Revalidation might not be strictly necessary on sign out
  return redirect('/login'); // Redirect to login page
}