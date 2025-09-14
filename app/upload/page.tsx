"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation" // NEW: Import the router
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, X, AlertCircle } from "lucide-react"

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: "uploading" | "processing" | "complete" | "error"
  result?: string
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter() // NEW: Initialize the router

  // NEW: Function to handle clicking the "View Result" button
  const handleViewResult = () => {
    router.push("/chat")
  }

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const fileId = Math.random().toString(36).substr(2, 9)
      const newFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0,
        status: "uploading",
      }

      setUploadedFiles((prev) => [...prev, newFile])

      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("https://nyay-saarthi-backend-b3k7.onrender.com/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, status: "complete", result: "File processed successfully" }
                : f
            )
          )
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f))
          )
        }
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f))
        )
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileUpload(files)
      }
    },
    [handleFileUpload],
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card
          className={`border-2 border-dashed transition-all duration-200 ${
            isDragOver ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/50"
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
            <p className="text-muted-foreground">PDF, DOCX, या टेक्स्ट फाइल चुनें (अधिकतम 10MB)</p>

            <div className="space-y-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" // added photo functionality by OCR model Optical Character Recognition
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

        {uploadedFiles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">अपलोड की गई फाइलें</h3>
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-medium truncate">{uploadedFile.file.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {uploadedFile.status === "uploading" && (
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span>अपलोड हो रहा है...</span>
                         <span suppressHydrationWarning>{uploadedFile.progress}%</span>
                       </div>
                       <Progress value={uploadedFile.progress} className="h-2" />
                     </div>
                  )}

                  {uploadedFile.status === "processing" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>AI द्वारा संसाधित हो रहा है...</span>
                    </div>
                  )}

                  {uploadedFile.status === "complete" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>सफलतापूर्वक संसाधित</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{uploadedFile.result}</p>
                      <div className="flex gap-2">
                        {/* NEW: Added onClick handler */}
                        <Button size="sm" onClick={handleViewResult}>
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
                      <span>अपलोड में त्रुटि हुई</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
