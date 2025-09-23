import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, Users, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  department: string;
  role: string;
}

const AdminUpload = () => {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    priority: "medium",
    deadline: "",
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee');

    if (error) {
      console.error('Error fetching employees:', error);
    } else {
      setEmployees(data || []);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      toast({
        title: "File selected",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      });
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.user_id === employeeId);
    if (employee && !selectedEmployees.find(emp => emp.user_id === employeeId)) {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const handleEmployeeRemove = (employeeId: string) => {
    setSelectedEmployees(selectedEmployees.filter(emp => emp.user_id !== employeeId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a document to upload",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Authentication Error",
        description: "Please log in to upload documents",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Insert document record
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          priority: formData.priority,
          file_url: publicUrl,
          file_name: selectedFile.name,
          uploaded_by: profile.user_id,
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Create assignments if employees selected
      if (selectedEmployees.length > 0) {
        const assignments = selectedEmployees.map(emp => ({
          document_id: document.id,
          employee_id: emp.user_id,
        }));

        const { error: assignError } = await supabase
          .from('document_assignments')
          .insert(assignments);

        if (assignError) {
          console.error('Error creating assignments:', assignError);
        }
      }

      // Process PDF in background
      try {
        console.log('Calling process-pdf function with:', { documentId: document.id, fileUrl: publicUrl });
        const { data, error } = await supabase.functions.invoke('process-pdf', {
          body: {
            documentId: document.id,
            fileUrl: publicUrl,
          },
        });
        
        if (error) {
          console.error('Edge function error:', error);
          toast({
            title: "Processing Warning",
            description: "Document uploaded but processing failed. Please contact admin.",
            variant: "destructive",
          });
        } else {
          console.log('PDF processing initiated:', data);
        }
      } catch (processError) {
        console.error('Error calling process-pdf function:', processError);
        toast({
          title: "Processing Warning", 
          description: "Document uploaded but processing failed. Please contact admin.",
          variant: "destructive",
        });
      }

      toast({
        title: "Document uploaded successfully",
        description: `${formData.title} has been uploaded and assigned to ${selectedEmployees.length} employees`,
      });

      // Reset form
      setFormData({
        title: "",
        category: "",
        description: "",
        priority: "medium",
        deadline: "",
      });
      setSelectedFile(null);
      setSelectedEmployees([]);

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole="admin" userName={profile?.full_name || "Admin"}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Document</h1>
          <p className="text-muted-foreground">Upload and assign documents to employees</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Select Document</CardTitle>
                <p className="text-sm text-muted-foreground">Upload PDF or Word documents (max 10MB)</p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-4">
                      <FileText className="h-12 w-12 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Upload Document</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop your file here, or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Browse Files
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Details */}
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
                <p className="text-sm text-muted-foreground">Provide information about the document</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter document title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="safety">Safety & Compliance</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the document content"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assign to Employees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Assign to Employees
                </CardTitle>
                <p className="text-sm text-muted-foreground">Select employees who should have access to this document</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Employee</Label>
                  <Select onValueChange={handleEmployeeSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employees to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees
                        .filter(emp => !selectedEmployees.find(selected => selected.user_id === emp.user_id))
                        .map((employee) => (
                          <SelectItem key={employee.user_id} value={employee.user_id}>
                            {employee.full_name} - {employee.department || 'No Department'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEmployees.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Employees ({selectedEmployees.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployees.map((employee) => (
                        <Badge key={employee.user_id} variant="secondary" className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                            {employee.full_name.charAt(0)}
                          </div>
                          <span>{employee.full_name}</span>
                          <span className="text-xs opacity-75">{employee.department || 'No Dept'}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-2"
                            onClick={() => handleEmployeeRemove(employee.user_id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {loading ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUpload;