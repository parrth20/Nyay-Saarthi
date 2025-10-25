'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LOCALSTORAGE_CONTEXT_KEY = 'nyaySaarthi_chatContextFile';

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('docId');
  const docName = searchParams.get('docName');

  const [contextFileName, setContextFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Read from URL and fallback to localStorage
  useEffect(() => {
    let fileName: string | null = null;

    if (docName) {
      fileName = decodeURIComponent(docName);
      localStorage.setItem(LOCALSTORAGE_CONTEXT_KEY, fileName);
    } else {
      fileName = localStorage.getItem(LOCALSTORAGE_CONTEXT_KEY);
    }

    setContextFileName(fileName);
  }, [docName]);

  // ✅ Fetch summary for this specific document
  const fetchSummary = async () => {
    if (!contextFileName) return;

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docName: contextFileName, docId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Summary fetch failed');
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [contextFileName, docId]);

  return (
    <div className="min-h-screen bg-green-50 p-6 md:p-12">
      <Card className="mb-8 shadow-xl border-0">
        <CardHeader className="pb-6 pt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-900">
              दस्तावेज़ सारांश
            </CardTitle>
          </div>
          <p className="text-green-700">
            {contextFileName
              ? `"${contextFileName}" का सारांश दिखाया जा रहा है।`
              : 'कोई दस्तावेज़ चयनित नहीं।'}
          </p>
        </CardHeader>
      </Card>

      {loading && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-green-600" />
          <span>सारांश लाया जा रहा है...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>त्रुटि</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summary && (
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <CardTitle className="text-xl text-green-900">{contextFileName}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-green-50/60 p-6 rounded-lg border border-green-200 text-green-900 whitespace-pre-wrap">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !summary && contextFileName && (
        <Button className="mt-6" onClick={fetchSummary}>
          सारांश पुनः लाएँ
        </Button>
      )}
    </div>
  );
}
