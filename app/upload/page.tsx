// app/upload/page.tsx
"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, X, AlertCircle, Loader2 } from "lucide-react"; // Added Loader2
import { toast } from "sonner"; // Import toast from sonner

interface UploadedFile {
  file: File;
  id: string;
  progress: number; // Keep progress for potential future use (e.g., actual upload progress)
  status: "uploading" | "processing" | "complete" | "error";
  result?: string; // Optional result message
  error?: string; // Optional error message
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();

  const handleViewResult = (fileId: string) => {
    // Potentially pass file context or ID to the chat page if needed
    // For now, just navigate
    router.push("/chat");
  };

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0, // Reset progress for new file
        status: "uploading", // Initial status
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // --- Simulate Upload Progress (Remove if using real progress) ---
      // For visual feedback, simulate progress before sending
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress >= 100) {
           clearInterval(progressInterval);
           // Set status to processing AFTER simulated upload
           setUploadedFiles((prev) =>
             prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 100 } : f))
           );
           // --- Now actually send the file ---
           uploadAndProcessFile(file, fileId);
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: currentProgress } : f))
          );
        }
      }, 50); // Adjust interval for simulation speed
      // --- End Simulation ---

      // // --- Use this block if you don't want simulation ---
      // setUploadedFiles((prev) =>
      //   prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 100 } : f))
      // );
      // uploadAndProcessFile(file, fileId);
      // // --- End non-simulation block ---
    }
  }, []); // Added empty dependency array

  // --- Extracted upload logic ---
  const uploadAndProcessFile = async (file: File, fileId: string) => {
      const formData = new FormData();
      formData.append("file", file);

      const toastId = toast.loading("Processing document...", { // Use loading toast
        description: `Analyzing ${file.name}`
      });

      try {
        const response = await fetch("https://parrth020-nyay-saarthi-ai-agent.hf.space/upload/", {
          method: "POST",
          body: formData,
          mode: "cors",
        });

        if (response.ok) {
          const resultMessage = "File processed successfully!"; // Define result message
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, status: "complete", result: resultMessage }
                : f
            )
          );
          toast.success("विश्लेषण पूर्ण हुआ!", { // Use success toast
             id: toastId,
             description: `${file.name} का सफलतापूर्वक विश्लेषण किया गया।`,
             action: {
               label: "परिणाम देखें",
               onClick: () => handleViewResult(fileId),
             },
          });
        } else {
          const errorText = await response.text();
          const errorMessage = `Processing failed: ${response.statusText} (${response.status})`;
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, status: "error", error: errorMessage } : f))
          );
           toast.error("विश्लेषण विफल हुआ", { // Use error toast
             id: toastId,
             description: `Error processing ${file.name}: ${errorText || errorMessage}`,
          });
        }
      } catch (error: any) {
         const errorMessage = `Upload error: ${error.message || "Network error"}`;
         setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "error", error: errorMessage } : f))
        );
         toast.error("अपलोड विफल हुआ", { // Use error toast for network errors too
           id: toastId,
           description: errorMessage,
         });
      }
  }
  // --- End extracted logic ---


  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload] // Add dependency
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
      e.target.value = ""; // Reset file input
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.info("File removed from list.");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Dropzone Card */}
        <Card
          className={`border-2 border-dashed transition-all duration-300 mb-8 ${ // Added mb-8
            isDragOver ? "border-primary bg-primary/10 scale-[1.02]" : "border-border hover:border-primary/50" // Enhanced drag over
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className={`w-8 h-8 text-primary transition-transform ${isDragOver ? "scale-110" : ""}`} />
            </div>
            <CardTitle className="text-2xl">अपना कानूनी दस्तावेज़ अपलोड करें</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">PDF, DOCX, TXT, PNG, JPG, JPEG चुनें (अधिकतम 10MB)</p>
            <div className="space-y-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                multiple
                onChange={handleFileInputChange}
              />
              <label htmlFor="file-upload">
                <Button size="lg" className="w-full max-w-xs cursor-pointer" asChild>
                  <span>
                    <FileText className="w-5 h-5 mr-2" />
                    फाइल चुनें
                  </span>
                </Button>
              </label>
              <p className="text-sm text-muted-foreground">या फाइल को यहाँ खींचकर छोड़ें</p>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">अपलोड की गई फाइलें</h3>
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="relative overflow-hidden"> {/* Added overflow-hidden */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3"> {/* Changed items-center to items-start */}
                    <div className="flex items-center gap-3 overflow-hidden mr-2"> {/* Added overflow-hidden and mr-2 */}
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" /> {/* Added flex-shrink-0 */}
                      <div className="flex-grow overflow-hidden"> {/* Wrap text */}
                        <p className="font-medium truncate leading-tight">{uploadedFile.file.name}</p> {/* Added leading-tight */}
                        <p className="text-xs text-muted-foreground">
                          ({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon" // Make it an icon button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0" // Ensure size and prevent shrinking
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Status Indicators */}
                  {uploadedFile.status === "uploading" && (
                     <div className="space-y-1">
                       <div className="flex justify-between text-xs text-muted-foreground">
                         <span>अपलोड हो रहा है...</span>
                         <span suppressHydrationWarning>{uploadedFile.progress}%</span>
                       </div>
                       <Progress value={uploadedFile.progress} className="h-1.5" /> {/* Made progress bar thinner */}
                     </div>
                  )}

                  {uploadedFile.status === "processing" && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" /> {/* Use Loader2 for better spinner */}
                      <span>AI द्वारा दस्तावेज़ का विश्लेषण किया जा रहा है...</span> {/* More specific message */}
                    </div>
                  )}

                  {uploadedFile.status === "complete" && (
                    <div className="space-y-2">
                       {/* Success message is now handled by the toast */}
                       {/* <p className="text-sm text-muted-foreground">{uploadedFile.result}</p> */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={() => handleViewResult(uploadedFile.id)}>
                          परिणाम देखें
                        </Button>
                        <Button variant="outline" size="sm">
                          डाउनलोड करें
                        </Button>
                      </div>
                    </div>
                  )}

                  {uploadedFile.status === "error" && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>त्रुटि: {uploadedFile.error || "Unknown error occurred"}</span> {/* Display specific error */}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}