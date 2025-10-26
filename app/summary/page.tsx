// app/summary/page.tsx
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, AlertCircle, Sparkles, ArrowLeft, MessageSquare, Copy, Check, Languages, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // Import cn

const LOCALSTORAGE_CONTEXT_KEY = 'nyaySaarthi_chatContextFile';

// Main component logic extracted
function SummaryDisplay() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const docId = searchParams.get('docId'); // Keep using docId if needed for other potential logic
    const docName = searchParams.get('docName');

    const [contextFileName, setContextFileName] = useState<string | null>(null);
    const [summaryHindi, setSummaryHindi] = useState<string>('');
    const [summaryEnglish, setSummaryEnglish] = useState<string>(''); // Placeholder
    const [displayLanguage, setDisplayLanguage] = useState<'hindi' | 'english'>('hindi');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [retryDelay, setRetryDelay] = useState<number>(0); // State for retry delay timer

    // Read context file name from URL or localStorage
    useEffect(() => {
        let fileName: string | null = null;
        if (docName) {
            fileName = decodeURIComponent(docName);
            try { localStorage.setItem(LOCALSTORAGE_CONTEXT_KEY, fileName); }
            catch (e) { console.warn("localStorage not available."); }
        } else {
            try { fileName = localStorage.getItem(LOCALSTORAGE_CONTEXT_KEY); }
            catch (e) { console.warn("localStorage not available."); }
        }
        setContextFileName(fileName);
    }, [docName]);

     // Countdown timer effect for retry delay
     useEffect(() => {
        let timerId: NodeJS.Timeout | null = null;
        if (retryDelay > 0) {
            timerId = setInterval(() => {
                setRetryDelay((prev) => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [retryDelay]);


    // app/summary/page.tsx
const fetchSummary = useCallback(async (language: 'hindi' | 'english' = 'hindi') => {
    // ... (existing checks for contextFileName) ...

    setLoading(true);
    setError('');
    setSummaryHindi('');
    setSummaryEnglish('');
    setRetryDelay(0);

    console.log(`Fetching summary for: ${contextFileName} in ${language}`);

    let response: Response | null = null; // Store response for potential text reading

    try {
        response = await fetch('/api/summarize', { // Assign to outer scope variable
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docName: contextFileName }),
        });

        if (!response.ok) {
            let errorMsg = `Summary fetch failed (${response.status})`;
            let errorDetails = '';
            let isJsonError = false;

            // Try to parse error as JSON first
            try {
                const errorData = await response.json();
                errorDetails = errorData.error || errorData.details || JSON.stringify(errorData);
                isJsonError = true;
                // Handle specific API errors like rate limiting from JSON response
                if (response.status === 429) {
                     const retryAfterMatch = (errorDetails || '').match(/retry in (\d+)/i);
                     const delaySeconds = retryAfterMatch ? parseInt(retryAfterMatch[1], 10) : 60;
                     setRetryDelay(delaySeconds);
                     errorMsg = `API Rate Limit Exceeded. Please wait ${delaySeconds} seconds.`;
                } else {
                    errorMsg = errorDetails; // Use the error message from JSON
                }

            } catch (jsonError) {
                // If JSON parsing fails, read as text
                console.warn("Could not parse error response as JSON, reading as text.");
                try {
                    errorDetails = await response.text();
                    errorMsg = `Server returned non-JSON error (${response.status}): ${errorDetails.substring(0, 150)}...`;
                } catch (textError) {
                    console.error("Could not read error response as text:", textError);
                     errorMsg = `Summary fetch failed (${response.status}) and error response could not be read.`;
                }
            }
             console.error(`API Error (${response.status}): ${errorDetails}`); // Log details
             throw new Error(errorMsg); // Throw the constructed error message
        }

        // If response.ok is true, parse the successful JSON response
        const data = await response.json(); // This should succeed if res.ok is true

        setSummaryHindi(data.summary);
        setSummaryEnglish(`(English translation placeholder for: ${data.summary.substring(0, 50)}...)`);

    } catch (err: any) {
        // Catch errors from fetch itself OR from the !response.ok block OR from parsing success JSON
        console.error("Summary fetch/processing error:", err);
        setError(err.message || 'सारांश लाने में त्रुटि हुई।');
        setSummaryHindi('');
        setSummaryEnglish('');
    } finally {
        setLoading(false);
    }
}, [contextFileName]); // Keep dependencies minimal
    

    // Trigger initial fetch when contextFileName is set
    useEffect(() => {
        if (contextFileName !== null) {
            fetchSummary('hindi');
        } else if (!docName){ // If no docName in URL initially, set loading false earlier
             setLoading(false);
             setError('No document specified.');
        }
    }, [contextFileName, fetchSummary, docName]); // Added docName

    // --- Toggle Language ---
    const handleToggleLanguage = () => {
        const newLang = displayLanguage === 'hindi' ? 'english' : 'hindi';
        setDisplayLanguage(newLang);
        if (newLang === 'english' && !summaryEnglish && summaryHindi) {
            // Placeholder logic - replace with actual translation if needed
            setSummaryEnglish(`(English translation placeholder for: ${summaryHindi.substring(0, 50)}...)`);
        }
        setIsCopied(false);
    };

    // --- Copy Function ---
    const handleCopySummary = () => {
        const textToCopy = displayLanguage === 'hindi' ? summaryHindi : summaryEnglish;
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            toast.success(displayLanguage === 'hindi' ? "सारांश क्लिपबोर्ड पर कॉपी किया गया!" : "Summary copied to clipboard!");
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy summary: ', err);
            toast.error(displayLanguage === 'hindi' ? "सारांश कॉपी करने में विफल।" : "Failed to copy summary.");
        });
    };

    const currentSummaryText = displayLanguage === 'hindi' ? summaryHindi : summaryEnglish;

    // --- Skeleton Component ---
    const SummarySkeleton = () => (
         <div className="space-y-6 animate-pulse">
            <Skeleton className="h-9 w-28 rounded-md bg-gray-200 mb-6" /> {/* Back button placeholder */}
             <div className="flex items-center gap-3 mb-6">
                 <Skeleton className="h-10 w-10 rounded-lg bg-green-200/50 flex-shrink-0" />
                 <div>
                     <Skeleton className="h-7 w-48 rounded bg-gray-300" />
                     <Skeleton className="h-4 w-64 rounded mt-2 bg-gray-200" />
                 </div>
             </div>
             <Card className="shadow-lg border-0">
                 <CardHeader className="bg-gray-100/50 border-b border-gray-200/50 h-[60px] flex flex-row items-center justify-between px-4 py-3">
                     <Skeleton className="h-6 w-1/4 rounded bg-gray-300" />
                     <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded bg-gray-200" />
                          <Skeleton className="h-8 w-8 rounded bg-gray-200" />
                     </div>
                 </CardHeader>
                 <CardContent className="pt-6 space-y-3">
                     <Skeleton className="h-4 w-full rounded bg-gray-200" />
                     <Skeleton className="h-4 w-[95%] rounded bg-gray-200" />
                     <Skeleton className="h-4 w-[90%] rounded bg-gray-200" />
                     <Skeleton className="h-4 w-full rounded bg-gray-200" />
                     <Skeleton className="h-4 w-[70%] rounded bg-gray-200" />
                 </CardContent>
                 <CardContent className="pt-4 pb-6 flex flex-col sm:flex-row gap-4">
                     <Skeleton className="h-11 w-full sm:w-48 rounded-md bg-gray-300" />
                     <Skeleton className="h-11 w-full sm:w-40 rounded-md bg-gray-200" />
                 </CardContent>
             </Card>
         </div>
     );


    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <TooltipProvider delayDuration={100}>
            <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30 p-6 md:p-12">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button (Only render if not loading) */}
                     {!loading && (
                         <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-primary hover:bg-green-100">
                           <ArrowLeft className="h-4 w-4 mr-2" /> वापस जाएं
                         </Button>
                     )}

                    {/* Loading State */}
                    {loading && <SummarySkeleton />}

                    {/* Error State */}
                    {!loading && error && (
                        <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                            {/* Page Title for Error State */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0"> <AlertCircle className="h-7 w-7 text-destructive" /> </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900"> त्रुटि </h1>
                                    <p className="text-gray-600 text-sm md:text-base truncate max-w-md" title={contextFileName ?? undefined}>
                                        {contextFileName ? `फ़ाइल: ${contextFileName}` : ' कोई दस्तावेज़ चयनित नहीं'}
                                    </p>
                                </div>
                            </div>
                            {/* Error Alert */}
                            <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-800">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <AlertTitle className="font-semibold">सारांश लोड करने में त्रुटि</AlertTitle>
                                <AlertDescription>
                                    {error}
                                    {retryDelay > 0 && <span className="block mt-1 text-xs"> Please wait {retryDelay}s before retrying.</span>}
                                </AlertDescription>
                                {/* Retry Button with Delay */}
                                <Button
                                    className="mt-4"
                                    onClick={() => fetchSummary(displayLanguage)}
                                    variant="destructive"
                                    size="sm"
                                    disabled={retryDelay > 0} // Disable if delay is active
                                >
                                    <RefreshCw className={cn("h-4 w-4 mr-2", retryDelay > 0 ? "" : "animate-spin-slow")} /> {/* Simple rotation or spin */}
                                     {retryDelay > 0 ? `पुनः प्रयास करें (${retryDelay}s)` : 'पुनः प्रयास करें'}
                                </Button>
                            </Alert>
                             <Button size="lg" variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>
                                 डैशबोर्ड पर जाएं
                             </Button>
                        </motion.div>
                    )}

                    {/* Content State */}
                    {!loading && !error && currentSummaryText && contextFileName && (
                        <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0"> <Sparkles className="h-7 w-7 text-primary" /> </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900"> दस्तावेज़ सारांश </h1>
                                        <p className="text-gray-600 text-sm md:text-base truncate max-w-md" title={contextFileName}> फ़ाइल: {contextFileName} </p>
                                    </div>
                                </div>
                            </div>

                            <Card className="shadow-xl border border-green-100 rounded-xl overflow-hidden bg-white">
                                <CardHeader className="bg-green-50/70 border-b border-green-200/80 flex flex-row items-center justify-between py-3 px-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg md:text-xl text-primary font-semibold">
                                            {displayLanguage === 'hindi' ? 'मुख्य बातें' : 'Key Points'}
                                        </CardTitle>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-100" onClick={handleToggleLanguage} disabled={!summaryHindi}>
                                                    <Languages className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs">
                                                {displayLanguage === 'hindi' ? 'Translate to English' : 'हिंदी में अनुवाद करें'}
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-green-100" onClick={handleCopySummary} disabled={!currentSummaryText}>
                                                    {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs">
                                                {isCopied ? (displayLanguage === 'hindi' ? "कॉपी हो गया!" : "Copied!") : (displayLanguage === 'hindi' ? "सारांश कॉपी करें" : "Copy Summary")}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 pb-8 px-4 sm:px-6">
                                    {/* Using `prose` for better typography */}
                                    <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap bg-green-50/40 p-4 sm:p-6 rounded-lg border border-green-100 min-h-[150px]">
                                        {currentSummaryText ? <p>{currentSummaryText}</p> : <p className="italic text-gray-500">{(displayLanguage === 'english') ? 'Translation loading or unavailable.' : 'सारांश उपलब्ध नहीं है।'}</p>}
                                    </div>
                                </CardContent>
                                <CardContent className="pt-0 pb-6 px-4 sm:px-6 flex flex-col sm:flex-row gap-4">
                                    <Link href={`/chat?contextFile=${encodeURIComponent(contextFileName)}`} legacyBehavior>
                                        <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow">
                                            <MessageSquare className="h-5 w-5 mr-2" /> इस दस्तावेज़ के बारे में पूछें
                                        </Button>
                                    </Link>
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto shadow-sm" onClick={() => router.push('/dashboard')}>
                                        डैशबोर्ड पर जाएं
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Fallback if no context file name and not loading */}
                    {!loading && !contextFileName && !error && (
                        <div className="text-center p-10 bg-white rounded-lg shadow border border-gray-100">
                           <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                           <h2 className="text-xl font-semibold text-gray-800 mb-2">कोई दस्तावेज़ निर्दिष्ट नहीं</h2>
                           <p className="text-gray-600 mb-6">सारांश देखने के लिए कृपया डैशबोर्ड से एक दस्तावेज़ चुनें।</p>
                           <Button onClick={() => router.push('/dashboard')}>
                               डैशबोर्ड पर वापस जाएं
                           </Button>
                       </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}

// Export default wrapper using Suspense
export default function SummaryPage() {
    const SuspenseSkeleton = () => (
         // Use a more complete page skeleton for Suspense
         <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30 p-6 md:p-12 animate-pulse">
            <div className="max-w-4xl mx-auto">
                <Skeleton className="h-9 w-28 rounded-md bg-gray-200 mb-6" />
                <div className="flex items-center gap-3 mb-6">
                     <Skeleton className="h-10 w-10 rounded-lg bg-green-200/50 flex-shrink-0" />
                     <div>
                         <Skeleton className="h-7 w-48 rounded bg-gray-300" />
                         <Skeleton className="h-4 w-64 rounded mt-2 bg-gray-200" />
                     </div>
                 </div>
                 <Skeleton className="h-96 w-full rounded-xl bg-gray-100" />
            </div>
         </div>
    );

    return (
        <Suspense fallback={<SuspenseSkeleton />}>
            <SummaryDisplay />
        </Suspense>
    );
}
