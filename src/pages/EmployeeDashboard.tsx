import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Eye, Calendar, User, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  uploadDate: string;
  status: "approved" | "under_review" | "pending";
  uploadedBy: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  type: "high" | "medium" | "low";
  date: string;
}

const EmployeeDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [documents] = useState<Document[]>([
    {
      id: "1",
      title: "Safety Protocol Manual - Updated Version 3.2",
      category: "Safety & Compliance",
      description: "Updated safety protocols for metro operations including new emergency procedures and passenger guidelines.",
      uploadDate: "15/01/2024",
      status: "approved",
      uploadedBy: "Ravi Kumar"
    },
    {
      id: "2",
      title: "Monthly Operations Report - December 2023",
      category: "Operations", 
      description: "Comprehensive monthly operations report covering ridership statistics, maintenance activities, and performance metrics.",
      uploadDate: "08/01/2024",
      status: "under_review",
      uploadedBy: "System Auto"
    },
    {
      id: "3",
      title: "Staff Training Module - Customer Service",
      category: "Human Resources",
      description: "Customer service training materials for metro staff, covering communication skills, problem resolution, and service standards.",
      uploadDate: "10/01/2024",
      status: "approved",
      uploadedBy: "HR Department"
    },
    {
      id: "4",
      title: "Technical Maintenance Schedule - Q1 2024",
      category: "Maintenance",
      description: "First quarter maintenance schedule for metro systems including rolling stock, signalling, and infrastructure maintenance.",
      uploadDate: "05/01/2024",
      status: "approved",
      uploadedBy: "Technical Team"
    }
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: "1",
      title: "Safety Drill Reminder",
      description: "Monthly safety drill scheduled for January 20th at 10:00 AM. All staff must participate.",
      type: "high",
      date: "15/01/2024"
    },
    {
      id: "2",
      title: "System Maintenance Window",
      description: "Scheduled system maintenance on January 22nd from 2:00 AM to 6:00 AM. Limited services during this period.",
      type: "medium",
      date: "14/01/2024"
    },
    {
      id: "3",
      title: "Compliance Deadline Approaching",
      description: "Annual compliance paperwork deadline is January 25th. Please ensure all documents are submitted on time.",
      type: "high",
      date: "13/01/2024"
    }
  ]);

  const stats = {
    assignedDocuments: 0,
    completedTasks: 0,
    pendingTasks: 0,
    unreadAlerts: 3
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalDocuments = filteredDocuments.length;
  const completedDocuments = filteredDocuments.filter(doc => doc.status === "approved").length;
  const pendingDocuments = filteredDocuments.filter(doc => doc.status === "pending" || doc.status === "under_review").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="secondary" className="bg-success/20 text-success border-success/30">Approved</Badge>;
      case "under_review":
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">Under Review</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <Clock className="h-4 w-4 text-warning" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Layout userRole="employee" userName="Priya Nair">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Priya Nair!</h1>
          <p className="text-muted-foreground">Here are your assigned documents and recent updates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned Documents</p>
                  <p className="text-3xl font-bold text-primary">{stats.assignedDocuments}</p>
                  <p className="text-xs text-muted-foreground">4 new this week</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                  <p className="text-3xl font-bold text-success">{stats.completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Good progress</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                  <p className="text-3xl font-bold text-warning">{stats.pendingTasks}</p>
                  <p className="text-xs text-muted-foreground">Due this week</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread Alerts</p>
                  <p className="text-3xl font-bold text-destructive">{stats.unreadAlerts}</p>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Document List</CardTitle>
                  <Badge variant="outline">{totalDocuments} results</Badge>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Safety & Compliance">Safety & Compliance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="font-bold text-lg text-primary">{totalDocuments}</div>
                    <div className="text-muted-foreground">Total Documents</div>
                  </div>
                  <div className="text-center p-3 bg-success/5 rounded-lg">
                    <div className="font-bold text-lg text-success">{completedDocuments}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-warning/5 rounded-lg">
                    <div className="font-bold text-lg text-warning">{pendingDocuments}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm mb-1">{doc.title}</h3>
                              <p className="text-xs text-muted-foreground mb-2">{doc.category}</p>
                              <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{doc.uploadDate}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>Uploaded by {doc.uploadedBy}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusBadge(doc.status)}
                                  {doc.status === "approved" && (
                                    <Button size="sm" variant="outline">
                                      <Eye className="mr-1 h-3 w-3" />
                                      View
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground mt-2">No documents found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
                  Recent Alerts
                </CardTitle>
                <p className="text-sm text-muted-foreground">Important notifications</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{alert.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;