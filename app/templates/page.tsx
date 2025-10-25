// app/templates/page.tsx
'use client';

import React, { useState } from 'react';
// *** Corrected import path ***
import { templates, getTemplateById, TemplateVariable } from '@/lib/template';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Corrected import source for Label
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Languages, Download, Copy, Check, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';


type FormData = Record<string, string>;

export default function TemplateLibraryPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'hindi' | 'english'>('hindi');
  const [formData, setFormData] = useState<FormData>({});
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const [aiAssistDialogOpen, setAiAssistDialogOpen] = useState(false);
  const [aiAssistTargetField, setAiAssistTargetField] = useState<string | null>(null);
  const [aiAssistInput, setAiAssistInput] = useState('');
  const [isGeneratingClause, setIsGeneratingClause] = useState(false);
  const [aiAssistError, setAiAssistError] = useState<string | null>(null);


  const selectedTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : null;
  // Safely find the variable label
  const targetVariableLabel = React.useMemo(() => {
    return selectedTemplate?.content.variables.find(v => v.key === aiAssistTargetField)?.label ?? '';
  }, [selectedTemplate, aiAssistTargetField]);


  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    setFormData({}); // Reset form data
    setGeneratedDoc(''); // Clear generated doc
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setGeneratedDoc(''); // Clear generated doc when form data changes
  };

  const generateDocument = () => {
    if (!selectedTemplate) return;
    let templateString = selectedTemplate.content[selectedLanguage];
    let allVarsFilled = true;
    selectedTemplate.content.variables.forEach(variable => {
      const value = formData[variable.key]?.trim() || ''; // Trim value for check
      if (!value) {
          allVarsFilled = false;
          console.log(`Variable not filled: ${variable.key}`); // Debug log
      }
      // Replace placeholder with value OR keep the placeholder if empty for visual feedback
      const regex = new RegExp(`\\[${variable.key}\\]`, 'g');
      templateString = templateString.replace(regex, value || `[${variable.key}]`);
    });

    if (!allVarsFilled) {
      toast.warning(selectedLanguage === 'hindi' ? "कृपया सभी आवश्यक फ़ील्ड भरें।" : "Please fill all required fields.");
      setGeneratedDoc(''); // Don't show incomplete doc
      return;
    }
    setGeneratedDoc(templateString);
    toast.success(selectedLanguage === 'hindi' ? "दस्तावेज़ तैयार!" : "Document generated!");
  };

  const handleBackToList = () => {
    setSelectedTemplateId(null);
    setFormData({});
    setGeneratedDoc('');
  };

  const handleCopy = () => {
     if (!generatedDoc) return;
     const textArea = document.createElement("textarea");
     textArea.value = generatedDoc;
     textArea.style.position = "fixed"; // Prevent scrolling to bottom of page
     textArea.style.left = "-9999px";
     document.body.appendChild(textArea);
     textArea.focus();
     textArea.select();
     try {
       const successful = document.execCommand('copy');
       if (successful) {
           setIsCopied(true);
           toast.success(selectedLanguage === 'hindi' ? "कॉपी हो गया!" : "Copied!");
           setTimeout(() => setIsCopied(false), 2000);
       } else {
           throw new Error('Copy command failed');
       }
     } catch (err) {
       console.error('Fallback: Oops, unable to copy', err);
       toast.error(selectedLanguage === 'hindi' ? "कॉपी करने में विफल।" : "Failed to copy.");
     }
     document.body.removeChild(textArea);
   };

   // --- Download Function ---
   const handleDownload = () => {
       if (!generatedDoc || !selectedTemplate) return;
       const blob = new Blob([generatedDoc], { type: 'text/plain;charset=utf-8' });
       const link = document.createElement('a');
       const url = URL.createObjectURL(blob);
       link.href = url;
       const dateStr = new Date().toISOString().split('T')[0];
       const filename = `${selectedTemplate.id}-${selectedLanguage}-${dateStr}.txt`;
       link.download = filename;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);
       toast.info(selectedLanguage === 'hindi' ? "दस्तावेज़ डाउनलोड शुरू हुआ।" : "Document download started.");
   };
   // --- End Download Function ---


  // --- AI Assist Functions ---
  const openAiAssistDialog = (fieldKey: string) => {
    setAiAssistTargetField(fieldKey);
    setAiAssistInput('');
    setAiAssistError(null);
    setAiAssistDialogOpen(true);
  };

  const handleGenerateClause = async () => {
     if (!aiAssistInput.trim() || !selectedTemplate || !aiAssistTargetField) {
       setAiAssistError(selectedLanguage === 'hindi' ? "कृपया बताएं कि आपको किस प्रकार का क्लॉज चाहिए।" : "Please describe the clause you need.");
       return;
     }
     setIsGeneratingClause(true);
     setAiAssistError(null);
     const generatingToastId = toast.loading(selectedLanguage === 'hindi' ? "AI क्लॉज तैयार कर रहा है..." : "Generating AI clause...");

     try {
       const response = await fetch('/api/generate-clause', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           userInput: aiAssistInput,
           templateContext: selectedTemplate.name[selectedLanguage],
           targetLanguage: selectedLanguage,
         }),
       });

       // Check if response is okay before parsing JSON
       if (!response.ok) {
         let errorMsg = `Error ${response.status}: Failed to generate clause.`;
         try {
           const errorData = await response.json();
           errorMsg = errorData.error || errorData.details || errorMsg; // Try to get specific error
         } catch (parseError) {
           errorMsg = `Error ${response.status}: ${response.statusText || 'Failed to generate clause.'}`;
         }
         setAiAssistError(errorMsg);
         toast.error(selectedLanguage === 'hindi' ? "क्लॉज बनाने में विफल।" : "Failed to generate clause.", { id: generatingToastId, description: errorMsg });
         throw new Error(errorMsg);
       }

       const data = await response.json();
       if (!data.clause) {
          throw new Error("Received empty clause from API.");
       }

       // Append clause
       setFormData(prev => ({
         ...prev,
         [aiAssistTargetField]: (prev[aiAssistTargetField] ? prev[aiAssistTargetField].trim() + '\n\n' : '') + data.clause,
       }));
       setGeneratedDoc(''); // Clear preview as content changed

       toast.success(selectedLanguage === 'hindi' ? "क्लॉज जोड़ा गया!" : "Clause added!", { id: generatingToastId });
       setAiAssistDialogOpen(false); // Close dialog

     } catch (error: any) {
        console.error("AI Assist Error:", error);
        // Set a generic error ONLY if one wasn't set during the response check
        if (!aiAssistError) {
             const fetchErrorMsg = selectedLanguage === 'hindi' ? "अनुरोध भेजने में विफल।" : "Failed to send request.";
             setAiAssistError(fetchErrorMsg);
             toast.error(selectedLanguage === 'hindi' ? "क्लॉज बनाने में विफल।" : "Failed to generate clause.", {
                id: generatingToastId,
                description: error.message || fetchErrorMsg
             });
        }
     } finally {
        setIsGeneratingClause(false);
     }
  };
  // --- End AI Assist ---

  // Animation Variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Render Input/Textarea with optional AI Button
  const renderVariableInput = (variable: TemplateVariable) => {
    const value = formData[variable.key] || '';
    const inputId = `${selectedTemplateId}-${variable.key}`;

    const commonProps = {
        id: inputId,
        placeholder: variable.label,
        value: value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange(variable.key, e.target.value),
        required: true,
        // Add padding-right if AI assist is enabled
        className: cn(variable.aiAssist ? 'pr-10' : '')
    };

    let inputElement: React.ReactNode;

    switch (variable.type) {
      case 'textarea':
        inputElement = <Textarea {...commonProps} rows={3} />;
        break;
      case 'date':
        inputElement = <Input {...commonProps} type="date" />;
        break;
      case 'number':
        inputElement = <Input {...commonProps} type="number" />;
        break;
      case 'text':
      default:
        inputElement = <Input {...commonProps} type="text" />;
        break;
    }

    return (
        <div className="relative group">
            {inputElement}
            {variable.aiAssist && (
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            type="button" // Prevent form submission
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "absolute right-1 bottom-1 h-7 w-7 text-primary/70 hover:bg-primary/10 hover:text-primary z-10", // Added z-index
                                variable.type === 'textarea' ? 'bottom-1.5 right-1.5' : 'bottom-1 right-1',
                                "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-within:opacity-100 focus:opacity-100 transition-opacity duration-200"
                            )}
                            onClick={() => openAiAssistDialog(variable.key)}
                            aria-label={`Get AI assistance for ${variable.label}`}
                         >
                            <Wand2 className="h-4 w-4" />
                         </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        {selectedLanguage === 'hindi' ? 'AI द्वारा सुझाव दें' : 'Suggest with AI'}
                    </TooltipContent>
                 </Tooltip>
             )}
        </div>
    );
  };


  return (
    <TooltipProvider delayDuration={150}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
            {!selectedTemplate ? (
                 <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">दस्तावेज़ टेम्पलेट लाइब्रेरी</h1>
                    <p className="text-gray-600 mb-8">सामान्य कानूनी दस्तावेज़ों के लिए टेम्पलेट चुनें और भरें।</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                        <Card key={template.id} className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer flex flex-col" onClick={() => handleTemplateSelect(template.id)}>
                            <CardHeader>
                            <FileText className="h-8 w-8 text-primary mb-3" />
                            <CardTitle>{template.name[selectedLanguage]}</CardTitle>
                            <CardDescription>{template.description[selectedLanguage]}</CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto pt-4">
                            <Button variant="link" className="p-0 h-auto text-sm"> {selectedLanguage === 'hindi' ? 'इस टेम्पलेट का उपयोग करें' : 'Use this template'} → </Button>
                            </CardFooter>
                        </Card>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                        <Button variant="outline" size="sm" onClick={() => setSelectedLanguage(prev => prev === 'hindi' ? 'english' : 'hindi')}>
                        <Languages className="h-4 w-4 mr-2" /> {selectedLanguage === 'hindi' ? 'Switch to English' : 'हिंदी में बदलें'}
                        </Button>
                    </div>
                 </motion.div>
            ) : (
                <motion.div key="form" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <Button variant="ghost" onClick={handleBackToList} className="mb-6 text-primary hover:bg-green-100 pl-1">
                        <ArrowLeft className="h-4 w-4 mr-2" /> वापस लाइब्रेरी में जाएं / Back to Library
                    </Button>

                    <Card className="shadow-xl border border-gray-100">
                        <CardHeader className="border-b bg-gray-50/50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                <CardTitle className="text-2xl">{selectedTemplate.name[selectedLanguage]}</CardTitle>
                                <CardDescription>{selectedTemplate.description[selectedLanguage]}</CardDescription>
                                </div>
                                <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as 'hindi' | 'english')}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Languages className="h-4 w-4 mr-2" /> <SelectValue placeholder="भाषा चुनें / Select Language" />
                                </SelectTrigger>
                                <SelectContent> <SelectItem value="hindi">हिंदी</SelectItem> <SelectItem value="english">English</SelectItem> </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <form onSubmit={(e) => { e.preventDefault(); generateDocument(); }}>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {selectedTemplate.content.variables.map((variable) => (
                                <div key={variable.key} className="space-y-1.5">
                                    <Label htmlFor={`${selectedTemplateId}-${variable.key}`}>{variable.label} *</Label>
                                    {renderVariableInput(variable)}
                                </div>
                                ))}
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
                                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                                    {selectedLanguage === 'hindi' ? 'दस्तावेज़ तैयार करें' : 'Generate Document'}
                                </Button>
                            </CardFooter>
                        </form>

                        {generatedDoc && (
                        <CardFooter className="flex-col items-start gap-4 pt-4 border-t mt-0">
                            <div className="w-full space-y-3 pt-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <h3 className="text-lg font-semibold">{selectedLanguage === 'hindi' ? 'तैयार दस्तावेज़' : 'Generated Document'}</h3>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" onClick={handleCopy}>
                                            {isCopied ? <Check className="h-4 w-4 mr-1 text-green-600"/> : <Copy className="h-4 w-4 mr-1"/>}
                                            {isCopied ? (selectedLanguage === 'hindi' ? 'कॉपी हो गया' : 'Copied') : (selectedLanguage === 'hindi' ? 'कॉपी करें' : 'Copy')}
                                        </Button>
                                        {/* Updated Download Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownload}
                                            disabled={!generatedDoc}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            {selectedLanguage === 'hindi' ? 'डाउनलोड (.txt)' : 'Download (.txt)'}
                                        </Button>
                                    </div>
                                </div>
                                <Textarea value={generatedDoc} readOnly rows={15} className="font-mono text-sm bg-gray-50/80 border-gray-200" />
                            </div>
                        </CardFooter>
                        )}
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>

            {/* AI Assist Dialog */}
             <Dialog open={aiAssistDialogOpen} onOpenChange={setAiAssistDialogOpen}>
                 <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
                     <DialogTitle className="flex items-center gap-2">
                         <Wand2 className="h-5 w-5 text-primary" />
                         AI क्लॉज सहायता / AI Clause Assist
                     </DialogTitle>
                     <DialogDescription>
                         {selectedLanguage === 'hindi'
                             ? `"${targetVariableLabel}" के लिए आपको किस प्रकार का क्लॉज चाहिए? कृपया विशिष्ट आवश्यकता बताएं।`
                             : `Describe the specific requirement for the clause you need for "${targetVariableLabel}".`}
                     </DialogDescription>
                     </DialogHeader>
                     <div className="grid gap-4 py-4">
                         <div className="grid grid-cols-1 items-center gap-2"> {/* Reduced gap */}
                             <Label htmlFor="ai-assist-input" className="sr-only"> Clause Description </Label>
                             <Textarea
                             id="ai-assist-input"
                             value={aiAssistInput}
                             onChange={(e) => { setAiAssistInput(e.target.value); setAiAssistError(null); }}
                             placeholder={selectedLanguage === 'hindi' ? 'जैसे: किरायेदार 30 दिन का नोटिस देकर लीज समाप्त कर सकता है' : 'e.g., Tenant can terminate lease with 30 days notice'}
                             className={cn("col-span-3 min-h-[100px]", aiAssistError ? 'border-destructive focus-visible:ring-destructive/50' : '')}
                             disabled={isGeneratingClause}
                             aria-invalid={!!aiAssistError}
                             aria-describedby={aiAssistError ? "ai-assist-error-msg" : undefined}
                             />
                              {aiAssistError && (
                                  <p id="ai-assist-error-msg" className="text-sm text-destructive mt-1">{aiAssistError}</p> // Removed col-span
                              )}
                         </div>
                     </div>
                     <DialogFooter>
                         <DialogClose asChild>
                             <Button type="button" variant="outline" disabled={isGeneratingClause}> {selectedLanguage === 'hindi' ? 'रद्द करें' : 'Cancel'} </Button>
                         </DialogClose>
                         <Button type="button" onClick={handleGenerateClause} disabled={isGeneratingClause || !aiAssistInput.trim()}>
                             {isGeneratingClause && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {selectedLanguage === 'hindi' ? 'क्लॉज तैयार करें' : 'Generate Clause'}
                         </Button>
                     </DialogFooter>
                 </DialogContent>
             </Dialog>

        </div>
        </div>
    </TooltipProvider>
  );
}

