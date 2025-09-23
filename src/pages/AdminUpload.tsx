import { useState } from "react";
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

interface Employee {
  id: string;
  name: string;
  department: string;
  avatar: string;
}

const AdminUpload = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    priority: "",
    deadline: "",
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  const employees: Employee[] = [
    { id: "1", name: "John Doe", department: "Maintenance", avatar: "J" },
    { id: "2", name: "Priya Nair", department: "Operations", avatar: "P" },
    { id: "3", name: "Sarah Thomas", department: "Human Resources", avatar: "S" },
    { id: "4", name: "Michael Chen", department: "Safety", avatar: "M" },
    { id: "5", name: "Rajesh Kumar", department: "Technical", avatar: "R" },
  ];

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
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee && !selectedEmployees.find(emp => emp.id === employeeId)) {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const handleEmployeeRemove = (employeeId: string) => {
    setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employeeId));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // Mock upload success
    toast({
      title: "Document uploaded successfully",
      description: `${formData.title} has been uploaded and assigned to ${selectedEmployees.length} employees`,
    });

    // Reset form
    setFormData({
      title: "",
      category: "",
      description: "",
      priority: "",
      deadline: "",
    });
    setSelectedFile(null);
    setSelectedEmployees([]);
  };

  return (
    <Layout userRole="admin" userName="Ravi Kumar">
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
                        .filter(emp => !selectedEmployees.find(selected => selected.id === emp.id))
                        .map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} - {employee.department}
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
                        <Badge key={employee.id} variant="secondary" className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                            {employee.avatar}
                          </div>
                          <span>{employee.name}</span>
                          <span className="text-xs opacity-75">{employee.department}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-2"
                            onClick={() => handleEmployeeRemove(employee.id)}
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
                  <Button type="submit">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
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