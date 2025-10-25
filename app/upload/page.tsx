"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, X, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client"; // Import Supabase client
import { cn } from "@/lib/utils"; // Import cn

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "uploading" | "processing" | "saving" | "complete" | "error"; // Added 'saving' state
  result?: string;
  error?: string;
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();
  const supabase = createClient(); // Initialize Supabase client

  const handleViewResult = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    const queryParams = file ? `?contextFile=${encodeURIComponent(file.file.name)}` : '';
    router.push(`/chat${queryParams}`);
  };

   // --- Extracted upload AND SAVE logic ---
   const uploadAndProcessFile = async (file: File, fileId: string) => {
    const formData = new FormData();
    formData.append("file", file);

    // --- Backend Processing ---
    const processingToastId = toast.loading("Processing document...", {
      description: `Analyzing ${file.name}`
    });

    try {
      const response = await fetch("https://parrth020-nyay-saarthi-ai-agent.hf.space/upload/", {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      if (!response.ok) {
        // Handle backend processing error
        const errorText = await response.text();
        throw new Error(`Processing failed: ${response.statusText} (${response.status}) - ${errorText}`);
      }
      
      // Backend processed successfully, now save to Supabase
      toast.dismiss(processingToastId); // Dismiss processing toast
      setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "saving" } : f)) // Set saving state
      );

      const savingToastId = toast.loading("Saving document record...", {
          description: `Adding ${file.name} to your dashboard.`
      });

      // --- Supabase Insert ---
      const { data: { user } } = await supabase.auth.getUser(); // Get current user
      if (!user) {
          throw new Error("User not logged in. Cannot save document.");
      }

      const { error: insertError } = await supabase
        .from('documents') // Your documents table
        .insert({
            user_id: user.id, // Link to current user
            name: file.name,
            status: 'Analyzed', // Set initial status (or 'विश्लेषित')
            // 'created_at' is usually set automatically by Supabase
        });

      if (insertError) {
          console.error("Supabase insert error:", insertError);
          throw new Error(`Failed to save document record: ${insertError.message}`);
      }
      // --- End Supabase Insert ---

      // Everything succeeded
      const resultMessage = "File processed and saved!";
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "complete", result: resultMessage }
            : f
        )
      );
      toast.success("Document Ready!", {
         id: savingToastId, // Update the saving toast
         description: `${file.name} was analyzed and saved.`,
         action: {
           label: "Chat Now",
           onClick: () => handleViewResult(fileId),
         },
      });

    } catch (error: any) {
        // Handle errors from either fetch or Supabase insert
       console.error("Error during upload/save:", error);
       const errorMessage = error.message || "An unknown error occurred.";
       setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "error", error: errorMessage } : f))
      );
       // Dismiss any loading toasts
       toast.dismiss(processingToastId);
       // toast.dismiss(savingToastId); // This might not exist if processing failed
       toast.error("Operation Failed", {
         description: errorMessage,
       });
    }
  }
  // --- End extracted logic ---

  const handleFileUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0,
        status: "uploading",
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // Simulate Upload Progress (Visual Feedback)
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress >= 100) {
           clearInterval(progressInterval);
           setUploadedFiles((prev) =>
             prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 100 } : f))
           );
           uploadAndProcessFile(file, fileId); // Call the combined function
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: currentProgress } : f))
          );
        }
      }, 50);
    }
  }, [uploadAndProcessFile]); // Dependency on the combined function

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
    [handleFileUpload]
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
            className={cn( // Use cn here
                'border-2 border-dashed transition-all duration-300 mb-8',
                isDragOver
                ? "border-primary bg-primary/10 scale-[1.03] shadow-inner ring-4 ring-primary/20" // Enhanced drag over styles
                : "border-border hover:border-primary/50"
            )}
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
              <Card key={uploadedFile.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                 {/* File info and remove button */}
                  <div className="flex items-start justify-between mb-3">
                     <div className="flex items-center gap-3 overflow-hidden mr-2">
                       <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                       <div className="flex-grow overflow-hidden">
                         <p className="font-medium truncate leading-tight">{uploadedFile.file.name}</p>
                         <p className="text-xs text-muted-foreground">
                           ({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                         </p>
                       </div>
                     </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
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
                       <Progress value={uploadedFile.progress} className="h-1.5" />
                     </div>
                  )}

                  {uploadedFile.status === "processing" && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI द्वारा विश्लेषण किया जा रहा है...</span>
                    </div>
                  )}

                  {/* Saving State */}
                  {uploadedFile.status === "saving" && (
                     <div className="flex items-center gap-2 text-sm text-purple-600">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span>रिकॉर्ड सहेजा जा रहा है...</span>
                     </div>
                  )}

                  {uploadedFile.status === "complete" && (
                    <div className="space-y-2 pt-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleViewResult(uploadedFile.id)}>
                          चैट करें
                        </Button>
                         {/* Optional Download Button Placeholder */}
                         {/*
                         <Button variant="outline" size="sm">
                           डाउनलोड करें
                         </Button>
                         */}
                      </div>
                    </div>
                  )}

                   {uploadedFile.status === "error" && (
                     <div className="flex items-center gap-2 text-sm text-destructive pt-1">
                       <AlertCircle className="w-4 h-4" />
                       <span>त्रुटि: {uploadedFile.error || "Unknown error occurred"}</span>
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
