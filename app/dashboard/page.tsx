// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server"; // Use server client for data fetching
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
  CheckCircle, // <-- Added CheckCircle
} from "lucide-react"; // Added Bot and CheckCircle icons
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
// Import a suitable locale for date formatting, e.g., Hindi
import { hi } from "date-fns/locale"; // Hindi locale
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Import Avatar components

// --- Data Structure Interfaces ---
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
// --- End Interfaces ---

// --- Helper: Get Initials ---
const getInitials = (name?: string | null, email?: string | null): string => {
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
export default async function Dashboard() {
  const supabase = createClient();

  // 1. Authentication Check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Dashboard Auth Error:", authError);
    return redirect("/login?message=Please log in to view the dashboard");
  }

  // --- Start Server-Side Data Fetching ---
  const fetchUserData = async () => {
    const { data: profile, error: profileError } = await supabase
      .from("userProfile") // Make sure this matches your table name
      .select("name")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching user profile:", profileError);
    }
    return profile;
  };

  const fetchDocumentsData = async () => {
    const { data: documents, error: documentsError } = await supabase
      .from("documents") // Make sure this matches your table name
      .select("id, name, status, created_at, user_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5); // Fetch latest 5 documents

    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      return [];
    }
    return documents || [];
  };

  // Fetch last chat message
  const fetchLastChat = async (): Promise<Chat | null> => {
    const { data: chat, error: chatError } = await supabase
      .from("chats") // Make sure this matches your table name
      .select("last_message, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (chatError && chatError.code !== "PGRST116") {
      // Ignore "No rows found"
      console.error("Error fetching last chat:", chatError);
    }
    return chat;
  };

  // Fetch data in parallel
  const [userProfile, documents, lastChat] = await Promise.all([
    fetchUserData(),
    fetchDocumentsData(),
    fetchLastChat(),
  ]);
  // --- End Server-Side Data Fetching ---

  // --- Calculate Stats ---
  // Define allowed analyzed statuses explicitly
  const analyzedStatuses = ["विश्लेषित", "analyzed", "complete"];
  const processingStatuses = ["प्रगति में", "processing", "uploading"];
  const errorStatuses = ["त्रुटि", "error"];

  const calculateStats = (docs: Document[]) => {
    const totalDocs = docs.length;
    const analyzedCount = docs.filter((d) =>
      analyzedStatuses.includes(d.status?.toLowerCase() ?? "")
    ).length; // Check against array
    const processingCount = docs.filter((d) =>
      processingStatuses.includes(d.status?.toLowerCase() ?? "")
    ).length; // Check against array
    const requiresAttentionCount = docs.filter((d) =>
      errorStatuses.includes(d.status?.toLowerCase() ?? "")
    ).length; // Check against array

    // Define stats array with correct icon references
    return [
      {
        label: "कुल दस्तावेज़",
        value: totalDocs,
        IconComponent: FileText,
        color: "text-blue-600 bg-blue-100",
      }, // Use IconComponent alias
      {
        label: "विश्लेषित",
        value: analyzedCount,
        IconComponent: CheckCircle,
        color: "text-green-600 bg-green-100",
      }, // Use IconComponent alias
      {
        label: "प्रगति में",
        value: processingCount,
        IconComponent: Clock,
        color: "text-yellow-600 bg-yellow-100",
      }, // Use IconComponent alias
      {
        label: "ध्यान दें",
        value: requiresAttentionCount,
        IconComponent: AlertTriangle,
        color: "text-red-600 bg-red-100",
      }, // Use IconComponent alias
    ];
  };
  const stats = calculateStats(documents);
  // ---

  // Get user's display name and initials
  const displayName = userProfile?.name || user.email?.split("@")[0] || "User";
  const userInitials = getInitials(userProfile?.name, user.email);

  // --- Quick Actions Definition ---
  const quickActions = [
    {
      label: "नया दस्तावेज़ अपलोड करें",
      href: "/upload",
      IconComponent: Upload,
    }, // Use IconComponent alias
    { label: "AI सहायक से पूछें", href: "/chat", IconComponent: MessageSquare }, // Use IconComponent alias
    {
      label: "परामर्श बुक करें",
      href: "/consultation",
      IconComponent: Briefcase,
    }, // Use IconComponent alias
  ];
  // ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-blue-50/30 to-purple-50/30 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 hidden sm:flex">
              {/* <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} /> */}
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
            <Link href="/upload">
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
          {stats.map((stat, index) => (
            // Destructure IconComponent from stat
            <Card
              key={index}
              className="shadow-lg border-0 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${stat.color} flex-shrink-0 shadow-inner`}
                >
                  <stat.IconComponent className="h-6 w-6" />{" "}
                  {/* Use IconComponent alias */}
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
          <Card className="lg:col-span-2 shadow-lg border-0 rounded-xl bg-white overflow-hidden">
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
              {documents.length === 0 ? (
                // Empty State
                <div className="text-center py-16 px-6 flex flex-col items-center">
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
                    // Determine if summary button should show based on multiple statuses
                    const showSummaryButton = analyzedStatuses.includes(
                      doc.status?.toLowerCase() ?? ""
                    ); // Use the array check

                    return (
                      <div
                        key={doc.id}
                        className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 flex-grow overflow-hidden">
                          {/* Icon based on type */}
                          <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
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
                                  className={`text-xs font-medium px-2 py-0.5 ${
                                    analyzedStatuses.includes(
                                      doc.status?.toLowerCase() ?? ""
                                    )
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : processingStatuses.includes(
                                          doc.status?.toLowerCase() ?? ""
                                        )
                                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      : errorStatuses.includes(
                                          doc.status?.toLowerCase() ?? ""
                                        )
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : "bg-gray-100 text-gray-800 border border-gray-200"
                                  }`}
                                >
                                  {doc.status}
                                </Badge>
                              )}
                              {doc.status && <span>•</span>}
                              <span
                                title={new Date(
                                  doc.created_at
                                ).toLocaleString()}
                              >
                                {formatDistanceToNow(new Date(doc.created_at), {
                                  addSuffix: true,
                                  locale: hi,
                                })}{" "}
                                {/* Hindi Locale */}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-3 sm:mt-0 ml-auto sm:ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Action Buttons */}
                          <Link
                            href={`/chat?contextFile=${encodeURIComponent(
                              doc.name || "document"
                            )}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-8 px-3"
                            >
                              चर्चा
                            </Button>
                          </Link>
                          {/* Corrected Condition: Use showSummaryButton variable */}
                          {showSummaryButton && (
                            <Link
                              key={doc.id}
                              href={`/summary?docId=${encodeURIComponent(
                                doc.id
                              )}&docName=${encodeURIComponent(doc.name)}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white h-8 px-3"
                              >
                                सारांश
                              </Button>
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
                <Button
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  सभी दस्तावेज़ देखें ({documents.length})
                </Button>
              </div>
            )}
          </Card>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Last Chat Card */}
            <Card className="shadow-lg border-0 rounded-xl bg-white overflow-hidden">
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
                      {" "}
                      {/* Added leading-relaxed */}"{lastChat.last_message}"
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      {" "}
                      {/* Added mt-4 */}
                      <p className="text-xs text-gray-500">
                        {lastChat.updated_at
                          ? formatDistanceToNow(new Date(lastChat.updated_at), {
                              addSuffix: true,
                              locale: hi,
                            })
                          : "Unknown time"}
                      </p>
                      <Link href="/chat">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 h-auto p-0 text-sm font-medium"
                        >
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
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        AI से पूछना शुरू करें
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow-lg border-0 rounded-xl bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">त्वरित कार्य</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  // Destructure IconComponent from action
                  <Link href={action.href} key={action.label} className="block">
                    <Button
                      variant="outline"
                      size="lg" // Larger buttons
                      className="w-full justify-start h-12 text-base font-medium rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 group" // Added group class
                    >
                      <action.IconComponent className="h-5 w-5 mr-3 text-gray-500 group-hover:text-blue-600 transition-colors" />{" "}
                      {/* Use IconComponent alias and add hover effect */}
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>{" "}
        {/* End Main Content Grid */}
      </div>{" "}
      {/* End Max Width Container */}
    </div>
  );
}
