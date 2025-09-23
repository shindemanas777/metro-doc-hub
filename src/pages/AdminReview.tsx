import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, CheckCircle, X, Eye, Calendar, User, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PendingDocument {
  id: string;
  title: string;
  category: string;
  uploadDate: string;
  uploadedBy: string;
  description: string;
  assignedEmployees: string[];
  priority: "high" | "medium" | "low";
}

const AdminReview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<PendingDocument[]>([
    {
      id: "1",
      title: "Monthly Operations Report - December 2023",
      category: "Operations",
      uploadDate: "08/01/2024",
      uploadedBy: "System Auto",
      description: "Comprehensive monthly operations report covering ridership statistics, maintenance activities, and performance metrics.",
      assignedEmployees: ["Priya Nair", "John Doe"],
      priority: "high"
    },
    {
      id: "2", 
      title: "Technical Maintenance Schedule - Q1 2024",
      category: "Maintenance",
      uploadDate: "05/01/2024",
      uploadedBy: "Technical Team",
      description: "First quarter maintenance schedule for metro systems including rolling stock, signalling, and infrastructure maintenance.",
      assignedEmployees: ["Michael Chen", "Rajesh Kumar"],
      priority: "medium"
    },
    {
      id: "3",
      title: "Safety Protocol Updates - Version 3.3",
      category: "Safety & Compliance",
      uploadDate: "10/01/2024",
      uploadedBy: "Safety Department",
      description: "Updated safety protocols incorporating new emergency procedures and enhanced passenger safety guidelines.",
      assignedEmployees: ["All Staff"],
      priority: "high"
    }
  ]);

  const stats = {
    pendingReview: documents.length,
    approvedToday: 8,
    totalDocuments: documents.length
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setDocuments(documents.filter(d => d.id !== docId));
    toast({
      title: "Document Approved",
      description: `"${doc?.title}" has been approved and is now available to assigned employees.`,
    });
  };

  const handleReject = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setDocuments(documents.filter(d => d.id !== docId));
    toast({
      title: "Document Rejected",
      description: `"${doc?.title}" has been rejected and returned to the uploader.`,
      variant: "destructive",
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <Layout userRole="admin" userName="Ravi Kumar">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Review Documents</h1>
          <p className="text-muted-foreground">{documents.length} documents pending review</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-warning">{stats.pendingReview}</p>
                  <p className="text-xs text-muted-foreground">Documents awaiting review</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-warning" />
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
                  <p className="text-xs text-muted-foreground">Recently approved</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalDocuments}</p>
                  <p className="text-xs text-muted-foreground">All documents</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
                Pending Documents
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Documents waiting for your review and approval</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">{doc.title}</h3>
                              {getPriorityBadge(doc.priority)}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                              <span className="px-2 py-1 bg-secondary rounded">{doc.category}</span>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{doc.uploadDate}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>Uploaded by {doc.uploadedBy}</span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>

                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Assigned to:</p>
                              <div className="flex flex-wrap gap-2">
                                {doc.assignedEmployees.map((employee, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {employee}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(doc.id)}
                                className="bg-success text-success-foreground hover:bg-success/90"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(doc.id)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-16 w-16 text-success mb-4" />
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No documents pending review at this time.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminReview;