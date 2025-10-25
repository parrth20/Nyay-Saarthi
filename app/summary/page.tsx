'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SummaryResponse {
  error: string;
  success: boolean;
  summary: string;
  pageCount?: number;
  fileName: string;
}

export default function summary() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [metadata, setMetadata] = useState<{ pageCount?: number; fileName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('फ़ाइल का आकार 10MB से कम होना चाहिए');
        return;
      }

      setFile(selectedFile);
      setSummary('');
      setError('');
      setMetadata(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setSummary('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: formData,
      });

      const data: SummaryResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PDF प्रोसेस करने में विफल');
      }

      setSummary(data.summary);
      setMetadata({
        pageCount: data.pageCount,
        fileName: data.fileName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'एक त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-green-100">
      <div className="container max-w-5xl mx-auto px-4 py-12 md:py-20">

        {/* Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-2xl bg-linear-to-br from-[rgb(0,131,57)] via-green-600 to-green-400">
          <CardHeader className="text-white pb-6 pt-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold">
                दस्तावेज़ सारांशक
              </CardTitle>
            </div>
            <CardDescription className="text-emerald-50 text-base md:text-lg">
              PDF दस्तावेज़ अपलोड करें और जनित सारांश प्राप्त करें
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Upload Card */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-3">
                  <FileText className="h-4 w-4 text-[rgb(0,131,55)]" />
                  PDF दस्तावेज़ चुनें
                </label>

                <div
                  onClick={() => document.getElementById('file-input')?.click()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer
                    transition-all duration-300 ease-in-out
                    ${file
                      ? 'border-green-500 bg-green-50/60 hover:bg-green-100'
                      : 'border-green-300 bg-green-50/30 hover:bg-green-100 hover:border-green-400'
                    }
                  `}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />

                  {file ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-10 w-10 text-[rgb(0,131,55)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900 mb-1">{file.name}</p>
                        <p className="text-sm text-green-700">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Upload className="h-10 w-10 text-[rgb(0,131,55)]" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 mb-1">
                          फ़ाइल अपलोड करने के लिए क्लिक करें
                        </p>
                        <p className="text-sm text-green-700">
                          PDF फ़ाइल (अधिकतम 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-3 px-6 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-medium">आपका PDF प्रोसेस किया जा रहा है...</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!file || loading}
                size="lg"
                className="w-full bg-gradient-to-r from-[rgb(0,131,55)] to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    सारांश बनाया जा रहा है...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    सारांश बनाएं
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8 border-red-300 bg-red-50">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">त्रुटि</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Output */}
        {summary && (
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-[rgb(0,131,55)]" />
                <CardTitle className="text-xl text-green-900">सारांश परिणाम</CardTitle>
              </div>
              {metadata && (
                <CardDescription className="text-sm text-green-700">
                  {metadata.fileName} {metadata.pageCount && `• ${metadata.pageCount} पृष्ठ`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-green max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-green-900 bg-green-50/60 p-6 rounded-lg border border-green-200">
                  {summary}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
