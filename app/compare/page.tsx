// app/compare/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X, Loader2, GitCompareArrows, AlertTriangle } from "lucide-react"; // Added GitCompareArrows, AlertTriangle
import { toast } from "sonner";
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'; // Import the diff viewer

interface CompareFile {
  file: File;
  id: string; // Simple ID for UI key
}

export default function ComparePage() {
  const [file1, setFile1] = useState<CompareFile | null>(null);
  const [file2, setFile2] = useState<CompareFile | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string[] | null>(null); // Store raw diff lines
  const [error, setError] = useState<string | null>(null);

  // --- File Handling Logic ---
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileNumber: 1 | 2
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile = { file, id: file.name + Date.now() }; // Simple unique ID
      if (fileNumber === 1) setFile1(newFile);
      else setFile2(newFile);
      setComparisonResult(null); // Clear previous results
      setError(null);
    }
    e.target.value = ""; // Reset input
  };

  const removeFile = (fileNumber: 1 | 2) => {
    if (fileNumber === 1) setFile1(null);
    else setFile2(null);
    setComparisonResult(null); // Clear results when a file is removed
    setError(null);
  };

  // --- Drag and Drop Logic (Simplified) ---
  const handleDrop = (e: React.DragEvent, fileNumber: 1 | 2) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent parent handlers
    e.currentTarget.classList.remove('border-primary', 'bg-primary/10'); // Remove drag over styles
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const newFile = { file, id: file.name + Date.now() };
      if (fileNumber === 1) setFile1(newFile);
      else setFile2(newFile);
      setComparisonResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary', 'bg-primary/10'); // Add drag over style
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
     e.currentTarget.classList.remove('border-primary', 'bg-primary/10'); // Remove drag over style
  };

  // --- Comparison API Call ---
  const handleCompare = async () => {
    if (!file1 || !file2) {
      toast.error("कृपया तुलना करने के लिए दोनों फाइलें अपलोड करें।");
      return;
    }

    setIsComparing(true);
    setComparisonResult(null);
    setError(null);
    const toastId = toast.loading("दस्तावेजों की तुलना की जा रही है...");

    const formData = new FormData();
    formData.append("file1", file1.file);
    formData.append("file2", file2.file);

    try {
      // Replace with your actual backend URL if different
      const response = await fetch("https://parrth020-nyay-saarthi-ai-agent.hf.space/compare/", {
        method: "POST",
        body: formData,
        // mode: "cors", // Enable if backend runs on a different origin
      });

      if (!response.ok) {
        let errorMsg = `Comparison failed: ${response.statusText}`;
        try {
            const errData = await response.json();
            errorMsg = errData.detail || errorMsg; // Use detail from backend if available
        } catch (_) {} // Ignore if response is not JSON
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setComparisonResult(data.comparison_lines || []); // Expecting 'comparison_lines'
      toast.success("तुलना पूर्ण हुई!", { id: toastId });

    } catch (err: any) {
      console.error("Comparison error:", err);
      setError(err.message || "An unknown error occurred during comparison.");
      toast.error("तुलना विफल हुई", { id: toastId, description: err.message });
    } finally {
      setIsComparing(false);
    }
  };

  // --- Render File Input Area ---
  const renderFileInput = (fileNumber: 1 | 2, currentFile: CompareFile | null) => (
    <Card
      className="border-2 border-dashed border-border hover:border-primary/50 transition-all duration-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, fileNumber)}
    >
      <CardContent className="p-6 text-center min-h-[200px] flex flex-col justify-center items-center">
        {currentFile ? (
          <div className="w-full">
            <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-md border border-gray-200 w-full relative">
              <FileText className="w-6 h-6 text-primary flex-shrink-0" />
              <div className="flex-grow overflow-hidden text-left">
                <p className="font-medium truncate text-sm" title={currentFile.file.name}>
                  {currentFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ({(currentFile.file.size / 1024).toFixed(1)} KB)
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(fileNumber)}
                className="text-muted-foreground hover:text-destructive h-7 w-7 absolute top-1 right-1"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm mb-3">
              दस्तावेज़ {fileNumber} खींचें या चुनें
            </p>
            <input
              type="file"
              id={`file-upload-${fileNumber}`}
              className="hidden"
              accept=".pdf,.docx,.txt,.md" // Common text-based formats
              onChange={(e) => handleFileChange(e, fileNumber)}
            />
            <label htmlFor={`file-upload-${fileNumber}`}>
              <Button size="sm" variant="outline" asChild className="cursor-pointer">
                <span>फाइल चुनें</span>
              </Button>
            </label>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Card className="shadow-lg border-0 rounded-xl bg-white overflow-hidden mb-8">
           <CardHeader>
             <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <GitCompareArrows className="h-7 w-7 text-indigo-600"/>
                दस्तावेज़ों की तुलना करें
             </CardTitle>
             <CardDescription>दो दस्तावेज़ संस्करण अपलोड करें और उनके बीच के अंतर देखें।</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
                {/* File Input Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFileInput(1, file1)}
                  {renderFileInput(2, file2)}
                </div>

                {/* Compare Button */}
                <div className="text-center">
                    <Button
                    size="lg"
                    onClick={handleCompare}
                    disabled={!file1 || !file2 || isComparing}
                    className="px-8 py-3 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-transform transform hover:scale-105"
                    >
                    {isComparing ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                        <GitCompareArrows className="w-5 h-5 mr-2" />
                    )}
                    {isComparing ? "तुलना हो रही है..." : "अब तुलना करें"}
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Comparison Result Area */}
        {error && (
            <Card className="border-destructive bg-destructive/10 text-destructive-foreground p-4">
                <CardHeader className="p-0 pb-2">
                    {/* Corrected Error Display */}
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5"/> Error
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm">
                    {error}
                </CardContent>
            </Card>
        )}

        {comparisonResult && (
          <Card className="shadow-lg border-0 rounded-xl bg-white overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">तुलना परिणाम</CardTitle>
            </CardHeader>
            <CardContent>
              {comparisonResult.length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">कोई अंतर नहीं मिला। दोनों फाइलें समान हैं।</p>
              ) : (
                <div className="overflow-x-auto border rounded-md p-2 bg-gray-50/50">
                   {/* ReactDiffViewer Integration - Ensure parsing logic is suitable */}
                   <ReactDiffViewer
                       // This basic filtering might need adjustment based on ReactDiffViewer's expected input
                       // It attempts to create rough "old" and "new" strings from the unified diff lines
                       oldValue={comparisonResult
                           .filter(line => !line.startsWith('+') || line.startsWith('---') || line.startsWith('@@')) // Keep unchanged, removed, headers
                           .map(line => line.startsWith('-') ? line.substring(1) : line) // Remove leading '-'
                           .join('')}
                       newValue={comparisonResult
                           .filter(line => !line.startsWith('-') || line.startsWith('+++') || line.startsWith('@@')) // Keep unchanged, added, headers
                           .map(line => line.startsWith('+') ? line.substring(1) : line) // Remove leading '+'
                           .join('')}
                       splitView={true} // Show side-by-side view
                       compareMethod={DiffMethod.LINES} // Compare line by line
                       leftTitle={file1?.file.name ?? "मूल दस्तावेज़"}
                       rightTitle={file2?.file.name ?? "संशोधित दस्तावेज़"}
                       styles={{ // Optional: Customize styles
                         diffContainer: { /* CSS for the main container */ },
                         diffRemoved: { backgroundColor: '#ffebe9', /* pinkish for removed */ },
                         diffAdded: { backgroundColor: '#e6ffed', /* greenish for added */ },
                         line: { /* Styles for each line */ },
                         // Add more style overrides as needed
                       }}
                       // Optional: Use line numbers
                       // showLineNumbers={true}
                   />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}