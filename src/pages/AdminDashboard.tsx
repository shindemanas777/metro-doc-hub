import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Clock, CheckCircle, Upload, Eye, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  title: string;
  category: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
  assignedTo: string;
  uploadedBy: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [documents] = useState<Document[]>([
    {
      id: "1",
      title: "Monthly Operations Report - December 2023",
      category: "Operations",
      uploadDate: "08/01/2024",
      status: "pending",
      assignedTo: "System Auto",
      uploadedBy: "System Auto"
    },
    {
      id: "2", 
      title: "Technical Maintenance Schedule - Q1 2024",
      category: "Maintenance",
      uploadDate: "05/01/2024",
      status: "approved",
      assignedTo: "Maintenance Team",
      uploadedBy: "Technical Team"
    }
  ]);

  const stats = {
    totalDocuments: 156,
    pendingReviews: 23,
    approvedToday: 8,
    totalUsers: 45,
    systemUptime: "99.8%",
    avgProcessingTime: "2.3 days",
    documentsThisMonth: 34
  };

  const pendingDocuments = documents.filter(doc => doc.status === "pending");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">Under Review</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-success/20 text-success border-success/30">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout userRole="admin" userName="Ravi Kumar">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your documents</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate("/admin/review")}>
              <Eye className="mr-2 h-4 w-4" />
              Review Queue
            </Button>
            <Button onClick={() => navigate("/admin/upload")}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalDocuments}</p>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                  <p className="text-3xl font-bold text-warning">{stats.pendingReviews}</p>
                  <p className="text-xs text-muted-foreground">Requires immediate attention</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                  <p className="text-3xl font-bold text-success">{stats.approvedToday}</p>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Active employees</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
                Pending Reviews
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/review")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Documents waiting for your review and approval</p>
              <div className="space-y-4">
                {pendingDocuments.length > 0 ? (
                  pendingDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground">{doc.category}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusBadge(doc.status)}
                          <span className="text-xs text-muted-foreground">{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground mt-2">No documents pending review</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Frequently used actions</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                onClick={() => navigate("/admin/upload")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Document
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/admin/users")}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/admin/review")}
              >
                <Eye className="mr-2 h-4 w-4" />
                Review Queue
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/admin/analytics")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <p className="text-sm text-muted-foreground">Overview of system performance</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{stats.systemUptime}</div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.avgProcessingTime}</div>
                <p className="text-sm text-muted-foreground">Avg Processing Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.documentsThisMonth}</div>
                <p className="text-sm text-muted-foreground">Documents This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;