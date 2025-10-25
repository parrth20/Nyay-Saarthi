// app/dashboard/page.tsx
"use client"; // <-- MAKE THIS A CLIENT COMPONENT

import { useState, useEffect } from "react"; // <-- Import useState and useEffect
import { useRouter } from "next/navigation"; // <-- Use client hook
import { createClient } from "@/utils/supabase/client"; // <-- Use client Supabase
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Search,
  Inbox,
  MessageSquare,
  AlertTriangle,
  User as UserIcon,
  Clock,
  Briefcase,
  FileSignature,
  Bot,
  CheckCircle,
  Loader2 // <-- Import Loader2 for loading state
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { hi } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OnboardingTour } from "@/components/OnboardingTour"; // <-- IMPORT THE TOUR COMPONENT
import { cn } from "@/lib/utils"; // Import cn if not already


// --- Data Structure Interfaces (keep as is) ---
interface Document {
  id: string;
  name: string | null;
  status: string | null;
  created_at: string;
  user_id: string;
}

interface UserProfile {
  name: string | null;
}

interface Chat {
  last_message: string | null;
  updated_at: string | null;
}
// ---

// --- Helper: Get Initials (keep as is) ---
const getInitials = (name?: string | null, email?: string | null): string => {
  // ... (keep existing function)
    if (name) {
    const nameParts = name.split(" ").filter(Boolean);
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${
        nameParts[nameParts.length - 1][0]
      }`.toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      return nameParts[0][0].toUpperCase();
    }
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
};
// ---

// --- Dashboard Component ---
export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  // --- State for data ---
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [lastChat, setLastChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ---

  // --- Fetch data on component mount ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Fetching dashboard data...");

      // 1. Get User
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !currentUser) {
        console.error("Dashboard Auth Error:", authError);
        router.push("/login?message=Please log in to view the dashboard");
        return; // Stop fetching if not authenticated
      }
      setUser(currentUser);
      console.log("User fetched:", currentUser.id);

      // 2. Fetch Profile, Documents, Chat in parallel
      try {
        const [profileRes, documentsRes, chatRes] = await Promise.all([
          supabase
            .from("userProfile")
            .select("name")
            .eq("user_id", currentUser.id)
            .single(),
          supabase
            .from("documents")
            .select("id, name, status, created_at, user_id")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("chats")
            .select("last_message, updated_at")
            .eq("user_id", currentUser.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle() // Use maybeSingle to handle 0 or 1 row gracefully
        ]);

        // Handle Profile Response
        if (profileRes.error && profileRes.error.code !== "PGRST116") { // Ignore "No rows found"
          console.error("Error fetching user profile:", profileRes.error);
          // Set error state or use default name later
        } else {
            setUserProfile(profileRes.data);
            console.log("Profile fetched:", profileRes.data);
        }


        // Handle Documents Response
        if (documentsRes.error) {
          console.error("Error fetching documents:", documentsRes.error);
          setError("Failed to load documents.");
          setDocuments([]);
        } else {
            setDocuments(documentsRes.data || []);
             console.log("Documents fetched:", documentsRes.data);
        }

        // Handle Chat Response
        if (chatRes.error && chatRes.error.code !== "PGRST116") { // Ignore "No rows found"
          console.error("Error fetching last chat:", chatRes.error);
           // Optionally set an error state specific to chat
        } else {
             setLastChat(chatRes.data);
              console.log("Last chat fetched:", chatRes.data);
        }

      } catch (fetchError: any) {
        console.error("Error fetching dashboard data:", fetchError);
        setError("An error occurred while loading dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
        console.log("Finished fetching data.");
      }
    };

    fetchData();
  }, [supabase, router]);
  // --- End data fetching ---


  // --- Calculate Stats ---
  // Define allowed analyzed statuses explicitly (keep as is)
  const analyzedStatuses = ["विश्लेषित", "analyzed", "complete", "Analyzed"]; // Added "Analyzed"
  const processingStatuses = ["प्रगति में", "processing", "uploading"];
  const errorStatuses = ["त्रुटि", "error"];

  const calculateStats = (docs: Document[]) => {
    const totalDocs = docs.length;
    const analyzedCount = docs.filter((d) =>
        analyzedStatuses.includes(d.status?.toLowerCase() ?? "")
    ).length;
    const processingCount = docs.filter((d) =>
        processingStatuses.includes(d.status?.toLowerCase() ?? "")
    ).length;
    const requiresAttentionCount = docs.filter((d) =>
        errorStatuses.includes(d.status?.toLowerCase() ?? "")
    ).length;

    return [
      { id: 'tour-stats-total', label: "कुल दस्तावेज़", value: totalDocs, IconComponent: FileText, color: "text-blue-600 bg-blue-100" }, // <-- ADDED ID
      { id: 'tour-stats-analyzed', label: "विश्लेषित", value: analyzedCount, IconComponent: CheckCircle, color: "text-green-600 bg-green-100" },
      { id: 'tour-stats-processing', label: "प्रगति में", value: processingCount, IconComponent: Clock, color: "text-yellow-600 bg-yellow-100" },
      { id: 'tour-stats-attention', label: "ध्यान दें", value: requiresAttentionCount, IconComponent: AlertTriangle, color: "text-red-600 bg-red-100" },
    ];
  };
  const stats = calculateStats(documents);
  // ---

  // --- Quick Actions Definition (keep as is) ---
  const quickActions = [
    { id: 'tour-quick-upload', label: "नया दस्तावेज़ अपलोड करें", href: "/upload", IconComponent: Upload }, // <-- ADDED ID (example)
    { id: 'tour-quick-chat', label: "AI सहायक से पूछें", href: "/chat", IconComponent: MessageSquare }, // <-- ADDED ID (example)
    { id: 'tour-quick-consult', label: "परामर्श बुक करें", href: "/consultation", IconComponent: Briefcase }, // <-- ADDED ID (example)
  ];
  // ---

  // --- Loading State ---
   if (isLoading) {
       return (
         <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-green-50/30 via-blue-50/30 to-purple-50/30">
           <Loader2 className="h-10 w-10 animate-spin text-primary" />
         </div>
       );
     }
  // ---

   // --- Error State ---
   if (error) {
     return (
       <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-red-50 p-6">
         <Card className="w-full max-w-md border-red-200">
             <CardHeader className="items-center text-center">
                 <AlertTriangle className="h-10 w-10 text-destructive mb-3"/>
                 <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
             </CardHeader>
             <CardContent className="text-center">
                 <p className="text-red-700 mb-4">{error}</p>
                 <Button onClick={() => window.location.reload()}>Try Again</Button>
             </CardContent>
         </Card>
       </div>
     );
   }
   // ---

   // --- Authentication Fallback (Should ideally be handled by useEffect redirect) ---
    if (!user) {
        // This is a fallback, the redirect in useEffect should handle this
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <p>Redirecting to login...</p>
            </div>
        );
    }
  // ---

  // Get user's display name and initials
  const displayName = userProfile?.name || user.email?.split("@")[0] || "User";
  const userInitials = getInitials(userProfile?.name, user.email);


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-blue-50/30 to-purple-50/30 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
             {/* ... Avatar ... */}
             <Avatar className="h-12 w-12 hidden sm:flex">
               <AvatarFallback className="text-lg bg-gradient-to-br from-green-200 to-blue-200 text-green-800 font-semibold">
                 {userInitials}
               </AvatarFallback>
             </Avatar>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-0.5">
                स्वागत है, {displayName}!
              </h1>
              <p className="text-gray-600 text-lg">
                यहां आपके कानूनी दस्तावेज़ों का अवलोकन है।
              </p>
            </div>
          </div>
          <div className="flex w-full md:w-auto items-center gap-3 mt-2 md:mt-0">
            {/* Search Input */}
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              <Input
                placeholder="दस्तावेज़ खोजें..."
                className="pl-10 w-full md:w-72 h-11 rounded-full bg-white shadow-sm border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* Upload Button */}
            {/* --- ADD TOUR ID --- */}
            <Link href="/upload" id="tour-upload-button">
              <Button
                size="lg"
                className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md h-11 px-6 whitespace-nowrap transition-transform transform hover:scale-105"
              >
                <Upload className="h-5 w-5 mr-2" />
                अपलोड करें
              </Button>
            </Link>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            // --- ADD TOUR ID TO THE CARD ---
            <Card
              key={stat.id}
              id={stat.id} // Add the ID from the stats object
              className="shadow-lg border-0 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-full ${stat.color} flex-shrink-0 shadow-inner`}>
                  <stat.IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-500 mb-0.5">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Main Content Area: Recent Docs, Last Chat & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Documents Section */}
          {/* --- ADD TOUR ID --- */}
          <Card id="tour-recent-docs" className="lg:col-span-2 shadow-lg border-0 rounded-xl bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-3 text-gray-800">
                <FileText className="h-6 w-6 text-blue-600" />
                हाल के दस्तावेज़
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                आपके द्वारा हाल ही में एक्सेस किए गए या अपलोड किए गए दस्तावेज़।
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {/* ... (keep existing empty state and document list rendering logic) ... */}
               {documents.length === 0 ? (
                 // Empty State
                 <div className="text-center py-16 px-6 flex flex-col items-center">
                   {/* ... empty state content ... */}
                   <Inbox className="h-16 w-16 text-gray-300 mb-5" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    आपका डैशबोर्ड खाली है
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    विश्लेषण और सरलीकरण शुरू करने के लिए अपना पहला कानूनी
                    दस्तावेज़ अपलोड करें।
                  </p>
                  <Link href="/upload">
                    <Button
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md px-8 py-3 transition-transform transform hover:scale-105"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      पहला दस्तावेज़ अपलोड करें
                    </Button>
                  </Link>
                 </div>
               ) : (
                 // Document List
                 <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                   {documents.map((doc) => {
                     const showSummaryButton = analyzedStatuses.includes(
                       doc.status?.toLowerCase() ?? ""
                     );
                     return (
                        <div key={doc.id} className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors duration-200 cursor-pointer group">
                           {/* ... document item content ... */}
                            <div className="flex items-center gap-4 flex-grow overflow-hidden">
                              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                {/* ... icon logic ... */}
                                 {doc.name?.toLowerCase().includes("समझौता") ||
                                    doc.name?.toLowerCase().includes("contract") ? (
                                      <FileSignature className="h-5 w-5 text-indigo-600" />
                                    ) : (
                                      <FileText className="h-5 w-5 text-gray-500" />
                                    )}
                              </div>
                              <div className="overflow-hidden">
                                <h4
                                  className="font-semibold text-gray-800 truncate text-base group-hover:text-blue-700 transition-colors"
                                  title={doc.name ?? "Untitled"}
                                >
                                  {doc.name || "Untitled Document"}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                                  {doc.status && (
                                    <Badge
                                      variant="secondary"
                                      className={cn('text-xs font-medium px-2 py-0.5', /* Status color logic */
                                         analyzedStatuses.includes(doc.status?.toLowerCase() ?? "") ? "bg-green-100 text-green-800 border border-green-200" :
                                         processingStatuses.includes(doc.status?.toLowerCase() ?? "") ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                                         errorStatuses.includes(doc.status?.toLowerCase() ?? "") ? "bg-red-100 text-red-800 border border-red-200" :
                                         "bg-gray-100 text-gray-800 border border-gray-200"
                                      )}
                                    >
                                      {doc.status}
                                    </Badge>
                                  )}
                                  {doc.status && <span>•</span>}
                                  <span title={new Date(doc.created_at).toLocaleString()}>
                                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: hi })}
                                  </span>
                                </div>
                              </div>
                            </div>
                           <div className="flex gap-2 flex-shrink-0 mt-3 sm:mt-0 ml-auto sm:ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             <Link href={`/chat?contextFile=${encodeURIComponent(doc.name || "document")}`}>
                               <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-8 px-3"> चर्चा </Button>
                             </Link>
                             {showSummaryButton && (
                               <Link key={doc.id} href={`/summary?docId=${encodeURIComponent(doc.id)}&docName=${encodeURIComponent(doc.name ?? '')}`}>
                                 <Button variant="outline" size="sm" className="bg-white h-8 px-3"> सारांश </Button>
                               </Link>
                             )}
                           </div>
                         </div>
                     );
                   })}
                 </div>
               )}
            </CardContent>
            {documents.length > 0 && (
              <div className="p-4 text-center border-t border-gray-100 bg-gray-50/50">
                {/* --- Link to future /documents page --- */}
                 <Link href="/documents"> {/* TODO: Create this page */}
                   <Button variant="link" className="text-sm text-blue-600 hover:text-blue-800">
                     सभी दस्तावेज़ देखें ({documents.length})
                   </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Last Chat Card */}
            <Card className="shadow-lg border-0 rounded-xl bg-white overflow-hidden">
               {/* ... (keep existing Last Chat content) ... */}
                <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-xl flex items-center gap-3 text-gray-800">
                  <Bot className="h-6 w-6 text-green-600" />
                  पिछला AI संदेश
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {lastChat?.last_message ? (
                  <div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-4 leading-relaxed">
                      "{lastChat.last_message}"
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xs text-gray-500">
                        {lastChat.updated_at
                          ? formatDistanceToNow(new Date(lastChat.updated_at), { addSuffix: true, locale: hi })
                          : "Unknown time"}
                      </p>
                      <Link href="/chat">
                        <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-800 h-auto p-0 text-sm font-medium">
                          चैट जारी रखें &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                     <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                     <p className="text-sm">अभी तक कोई चैट इतिहास नहीं है।</p>
                     <Link href="/chat">
                       <Button variant="link" size="sm" className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
                         AI से पूछना शुरू करें
                       </Button>
                     </Link>
                   </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            {/* --- ADD TOUR ID --- */}
            <Card id="tour-quick-actions" className="shadow-lg border-0 rounded-xl bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">त्वरित कार्य</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Link href={action.href} key={action.label} className="block">
                     {/* --- ADD TOUR ID (optional, if you want specific action tips) --- */}
                     {/* <Button id={action.id} ... > */}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start h-12 text-base font-medium rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 group"
                    >
                      <action.IconComponent className="h-5 w-5 mr-3 text-gray-500 group-hover:text-blue-600 transition-colors" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

       {/* --- RENDER THE TOUR COMPONENT --- */}
      <OnboardingTour />
       {/* --- END TOUR COMPONENT --- */}

    </div>
  );
}