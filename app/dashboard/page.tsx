"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, AlertTriangle, Calendar, Clock, Eye, MessageSquare, Upload, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProtectedRoute } from "@/components/protected-route"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  const stats = [
    {
      title: "कुल दस्तावेज़",
      value: "24",
      subtitle: "+3 इस सप्ताह",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "उच्च जोखिम",
      value: "2",
      subtitle: "-1 पिछले महीने से",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "आगामी समय सीमा",
      value: "5",
      subtitle: "अगले 30 दिन में",
      icon: Calendar,
      color: "text-orange-600",
    },
    {
      title: "समय की बचत",
      value: "12 घंटे",
      subtitle: "इस महीने",
      icon: Clock,
      color: "text-green-600",
    },
  ]

  const recentDocuments = [
    {
      id: 1,
      title: "सेवा समझौता - ABC कंपनी",
      type: "अनुबंध",
      date: "आज",
      status: "विश्लेषित",
      priority: "मध्यम जोखिम",
      progress: 100,
    },
    {
      id: 2,
      title: "गोपनीयता नीति - XYZ ऐप",
      type: "नीति",
      date: "कल",
      status: "प्रगति में",
      priority: "कम जोखिम",
      progress: 75,
    },
    {
      id: 3,
      title: "किराया अनुबंध",
      type: "संपत्ति",
      date: "2 दिन पहले",
      status: "उच्च जोखिम",
      priority: "तत्काल कार्रवाई",
      progress: 100,
    },
  ]

  const pendingTasks = [
    {
      id: 1,
      title: "नया दस्तावेज़ अपलोड करें",
      type: "action",
    },
    {
      id: 2,
      title: "AI सहायक से पूछें",
      type: "chat",
    },
    {
      id: 3,
      title: "समय सीमा देखें",
      type: "calendar",
    },
  ]

  const alerts = [
    {
      id: 1,
      title: "महत्वपूर्ण अलर्ट",
      message: "किराया अनुबंध में उच्च जोखिम",
      details: "जमानत वापसी की शर्त स्पष्ट नहीं है",
      type: "urgent",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="p-6">
          {/* Page Title Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">डैशबोर्ड</h1>
                <p className="text-gray-600">अपने दस्तावेज़ों का अवलोकन और विश्लेषण</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="दस्तावेज़ खोजें..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-lg">
                  <Upload className="h-4 w-4 mr-2" />
                  नया अपलोड करें
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Documents */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    हाल के दस्तावेज़
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    सभी देखें
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                          <Badge
                            variant={
                              doc.status === "उच्च जोखिम"
                                ? "destructive"
                                : doc.status === "विश्लेषित"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>
                            {doc.type} • {doc.date}
                          </span>
                          <span
                            className={
                              doc.priority === "तत्काल कार्रवाई"
                                ? "text-red-600 font-medium"
                                : doc.priority === "मध्यम जोखिम"
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }
                          >
                            {doc.priority}
                          </span>
                        </div>
                        {doc.status === "प्रगति में" && (
                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>विश्लेषण {doc.progress}% पूर्ण</span>
                            </div>
                            <Progress value={doc.progress} className="h-2" />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            देखें
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            चर्चा
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            सारांश
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>त्वरित कार्य</CardTitle>
                  <p className="text-sm text-gray-600">सामान्य कार्यों के लिए शॉर्टकट</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.map((task) => (
                    <Button key={task.id} variant="outline" className="w-full justify-start bg-transparent">
                      {task.type === "action" && <Upload className="h-4 w-4 mr-2" />}
                      {task.type === "chat" && <MessageSquare className="h-4 w-4 mr-2" />}
                      {task.type === "calendar" && <Calendar className="h-4 w-4 mr-2" />}
                      {task.title}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Important Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    महत्वपूर्ण अलर्ट
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alerts.map((alert) => (
                    <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-1">{alert.title}</h4>
                      <p className="text-red-700 text-sm mb-2">{alert.message}</p>
                      <p className="text-red-600 text-xs mb-3">{alert.details}</p>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        कार्रवाई करें
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    समय सीमा - 5 दिन बचे
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-1">सेवा समझौता की समीक्षा आवश्यक</h4>
                    <p className="text-orange-600 text-sm">अगले 5 दिनों में पूरा करना आवश्यक</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
