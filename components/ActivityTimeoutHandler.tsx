// components/ActivityTimeoutHandler.tsx
"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // Use client
import { signOut } from '@/lib/actions'; // Import your server action
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function ActivityTimeoutHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Track login state

  // Function to perform the logout
  const handleLogout = useCallback(async () => {
    console.log("Inactivity detected. Logging out...");
    toast.info("You have been logged out due to inactivity.");
    // Clear the timer definitively
    if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
    }
    await signOut(); // Call the server action
    // Server action handles redirect, but router.refresh() might be needed sometimes
    // router.refresh(); // Usually not needed if server action redirects properly
  }, []); // Removed router dependency as server action handles redirect

  // Function to reset the inactivity timer
  const resetTimer = useCallback(() => {
    // Only reset if the user is determined to be logged in
    if (isLoggedIn === false) return;

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    // Set a new timer
    timeoutId.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  }, [handleLogout, isLoggedIn]);

  // Check initial login state and set up listeners
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    // Check auth status on mount
    const checkAuthStatus = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
            setIsLoggedIn(!!session);
             if (session) {
                 console.log("User is logged in. Starting inactivity timer.");
                 resetTimer(); // Start timer only if logged in
             } else {
                 console.log("User is not logged in. Inactivity timer disabled.");
             }
        }
    };

    checkAuthStatus();

    // Listen for auth changes (login/logout in other tabs)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (isMounted) {
            const currentlyLoggedIn = !!session;
            setIsLoggedIn(currentlyLoggedIn);
            if (currentlyLoggedIn) {
                 console.log("Auth state changed: Logged in. Resetting timer.");
                 resetTimer();
            } else {
                 console.log("Auth state changed: Logged out. Clearing timer.");
                 if (timeoutId.current) {
                     clearTimeout(timeoutId.current);
                     timeoutId.current = null;
                 }
            }
        }
    });

    // --- Event listeners for activity ---
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => {
        // console.log('Activity detected, resetting timer...'); // Optional: Can be noisy
        resetTimer();
    };

    // Add listeners only if user is determined to be logged in initially or logs in later
    if (isLoggedIn) {
         console.log("Adding activity listeners.");
         events.forEach(event => window.addEventListener(event, handleActivity, { capture: true, passive: true }));
    }

    // Cleanup function
    return () => {
        isMounted = false;
        console.log("Cleaning up activity listeners and timer.");
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        events.forEach(event => window.removeEventListener(event, handleActivity, { capture: true }));
        authListener?.subscription.unsubscribe();
    };
    // Re-run effect if isLoggedIn state changes to add/remove listeners correctly
  }, [resetTimer, supabase, isLoggedIn]); // Added isLoggedIn dependency

  return <>{children}</>;
}