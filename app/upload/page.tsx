"use client"

import type React from "react"

import { useState, useCallback } from "react"
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

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (file.size > maxSize) {
      return "फाइल का साइज़ 10MB से अधिक है"
    }

    if (!allowedTypes.includes(file.type)) {
      return "केवल PDF, DOCX, या TXT फाइलें स्वीकार की जाती हैं"
    }

    return null
  }

  const processFile = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => {
          if (f.id === fileId) {
            if (f.progress >= 100) {
              clearInterval(interval)
              return { ...f, status: "processing" }
            }
            return { ...f, progress: f.progress + 10 }
          }
          return f
        }),
      )
    }, 200)

    // Simulate processing completion
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "complete", result: "आपका दस्तावेज़ सफलतापूर्वक सरल भाषा में बदल दिया गया है।" }
            : f,
        ),
      )
    }, 3000)
  }

  const handleFileUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)

    fileArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        alert(error)
        return
      }

      const fileId = Math.random().toString(36).substr(2, 9)
      const newFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0,
        status: "uploading",
      }

      setUploadedFiles((prev) => [...prev, newFile])
      processFile(fileId)
    })
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
                accept=".pdf,.docx,.txt"
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
                        <span>{uploadedFile.progress}%</span>
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
                        <Button size="sm">परिणाम देखें</Button>
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
