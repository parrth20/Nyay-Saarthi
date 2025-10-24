// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, AlertTriangle, Calendar, Clock, Upload, Search, Inbox } from "lucide-react" // Added Inbox icon
import { Input } from "@/components/ui/input"
import Link from 'next/link'; // Import Link

// --- Mock Data (Replace with actual data fetching) ---
interface Document {
    id: string;
    name: string;
    type: string;
    status: string;
    date: string;
    analysisProgress?: number;
}

const recentDocuments: Document[] = [
    // Example data - replace or remove for empty state test
    // { id: '1', name: 'सेवा समझौता - ABC कंपनी', type: 'अनुबंध', status: 'विश्लेषित', date: 'आज', analysisProgress: 100 },
    // { id: '2', name: 'गोपनीयता नीति - XYZ ऐप', type: 'नीति', status: 'प्रगति में', date: 'कल', analysisProgress: 75 },
];

const stats = [
    { label: "कुल दस्तावेज़", value: recentDocuments.length, change: "+3 इस सप्ताह", icon: FileText, color: "text-blue-600 bg-blue-100" },
    { label: "उच्च जोखिम", value: recentDocuments.filter(d => d.status === 'विश्लेषित').length > 0 ? 1 : 0, change: "-1 पिछले महीने से", icon: AlertTriangle, color: "text-orange-600 bg-orange-100" }, // Simplified logic
    { label: "आगामी समय सीमा", value: 3, change: "अगले 30 दिनों में", icon: Calendar, color: "text-purple-600 bg-purple-100" },
    { label: "समय की बचत", value: "~8 घंटे", change: "इस महीने", icon: Clock, color: "text-green-600 bg-green-100" },
];
// --- End Mock Data ---


export default async function Dashboard() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // --- Real Data Fetching Would Go Here ---
  // const { data: fetchedDocuments, error } = await supabase
  //   .from('documents') // Replace 'documents' with your table name
  //   .select('*')
  //   .eq('user_id', user.id) // Filter by user ID
  //   .order('created_at', { ascending: false })
  //   .limit(5); // Get recent 5
  //
  // const documents = fetchedDocuments || []; // Use fetched data or default to empty
  // Update stats based on fetched data
  // --- End Real Data Fetching ---

  // Use the mock or fetched data
  const documentsToDisplay = recentDocuments; // Change to 'documents' if using real fetch

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 md:p-8"> {/* Added padding */}
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"> {/* Adjusted flex for mobile */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">डैशबोर्ड</h1>
            <p className="text-gray-600 text-sm md:text-base">अपने दस्तावेज़ों का अवलोकन और विश्लेषण</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto"> {/* Adjusted width for mobile */}
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="दस्तावेज़ खोजें..." className="pl-10 w-full md:w-64 h-10" /> {/* Ensured height */}
            </div>
            <Link href="/upload">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md h-10 whitespace-nowrap"> {/* Ensured height, added whitespace */}
                <Upload className="h-4 w-4 mr-2" />
                नया अपलोड करें
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm border-0">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">{stat.change}</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Documents */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            हाल के दस्तावेज़
          </CardTitle>
          <p className="text-gray-600 text-sm">आपके द्वारा हाल ही में अपलोड या विश्लेषण किए गए दस्तावेज़</p>
        </CardHeader>
        <CardContent>
          {/* --- Empty State Check --- */}
          {documentsToDisplay.length === 0 ? (
            <div className="text-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-lg">
                <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">कोई दस्तावेज़ नहीं मिला</h3>
                <p className="text-gray-500 mb-4">विश्लेषण शुरू करने के लिए अपना पहला दस्तावेज़ अपलोड करें।</p>
                <Link href="/upload">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Upload className="h-4 w-4 mr-2" />
                        अभी अपलोड करें
                    </Button>
                </Link>
            </div>
          ) : (
            // --- Document List ---
            <div className="space-y-4">
              {documentsToDisplay.map((doc) => (
                <div key={doc.id} className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900 mb-1">{doc.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                      <Badge variant={doc.status === 'विश्लेषित' ? 'default' : 'secondary'} className={`ml-2 text-xs ${doc.status === 'विश्लेषित' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.status}
                      </Badge>
                    </div>
                    {doc.analysisProgress !== undefined && doc.analysisProgress < 100 && (
                       <div className="mt-2">
                         {/* Consider adding a small Progress bar here if needed */}
                         {/* <Progress value={doc.analysisProgress} className="h-1 w-32" /> */}
                       </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm">देखें</Button>
                    <Link href={`/chat?contextFile=${encodeURIComponent(doc.name)}`}>
                        <Button variant="outline" size="sm">चर्चा</Button>
                    </Link>
                    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">सारांश</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* --- End Conditional Rendering --- */}
        </CardContent>
      </Card>

      {/* Add other dashboard sections here */}

    </div>
  );
}