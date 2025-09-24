import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Globe, Eye, Loader2, Calendar, User, Hash, Users, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  uploadDate: string;
  status: string;
  uploadedBy: string;
  priority?: string;
}

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department?: string;
}

interface AdminDocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (docId: string) => void;
  onReject?: (docId: string) => void;
}

export const AdminDocumentPreviewModal = ({ 
  document, 
  isOpen, 
  onClose,
  onApprove,
  onReject
}: AdminDocumentPreviewModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [summary, setSummary] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, department')
        .eq('role', 'employee');
      
      if (error) throw error;
      return data as Employee[];
    },
    enabled: isOpen
  });

  // Fetch current assignments for this document
  const { data: currentAssignments = [] } = useQuery({
    queryKey: ['document-assignments', document?.id],
    queryFn: async () => {
      if (!document?.id) return [];
      
      const { data, error } = await supabase
        .from('document_assignments')
        .select('employee_id')
        .eq('document_id', document.id);
      
      if (error) throw error;
      return data.map(assignment => assignment.employee_id);
    },
    enabled: isOpen && !!document?.id
  });

  // Update selected employees when current assignments change
  useEffect(() => {
    if (currentAssignments.length > 0) {
      setSelectedEmployees(new Set(currentAssignments));
    } else {
      setSelectedEmployees(new Set());
    }
  }, [currentAssignments]);

  // Save assignments mutation
  const saveAssignmentsMutation = useMutation({
    mutationFn: async () => {
      if (!document?.id) throw new Error('No document selected');

      // First, delete existing assignments
      const { error: deleteError } = await supabase
        .from('document_assignments')
        .delete()
        .eq('document_id', document.id);

      if (deleteError) throw deleteError;

      // Then, insert new assignments
      if (selectedEmployees.size > 0) {
        const assignments = Array.from(selectedEmployees).map(employeeId => ({
          document_id: document.id,
          employee_id: employeeId
        }));

        const { error: insertError } = await supabase
          .from('document_assignments')
          .insert(assignments);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Assignments Saved",
        description: `Document assigned to ${selectedEmployees.size} employee(s)`,
      });
      queryClient.invalidateQueries({ queryKey: ['document-assignments', document?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Assignments",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (!document) return null;

  const handleEmployeeToggle = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(emp => emp.user_id)));
    }
  };

  const handleSaveAssignments = async () => {
    setIsSavingAssignments(true);
    try {
      await saveAssignmentsMutation.mutateAsync();
    } finally {
      setIsSavingAssignments(false);
    }
  };

  const handleTranslate = async () => {
    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      toast({
        title: "API Key Required",
        description: "Please enter your Perplexity API key to use translation features",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Translate the given text to Malayalam language. Maintain the original meaning and context. Return only the translated text.'
            },
            {
              role: 'user',
              content: `Translate this document information to Malayalam:
Title: ${document.title}
Description: ${document.description}
Category: ${document.category}`
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translated = data.choices[0]?.message?.content || 'Translation failed';
      setTranslatedContent(translated);
      
      toast({
        title: "Translation Complete",
        description: "Document has been translated to Malayalam",
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Please check your API key and try again",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      toast({
        title: "API Key Required",
        description: "Please enter your Perplexity API key to generate summaries",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a professional document summarizer. Create a concise and informative summary of the document based on the provided information. Focus on key points and main objectives.'
            },
            {
              role: 'user',
              content: `Create a summary for this document:
Title: ${document.title}
Description: ${document.description}
Category: ${document.category}
Uploaded by: ${document.uploadedBy}
Date: ${document.uploadDate}`
            }
          ],
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 500,
          return_images: false,
          return_related_questions: false
        }),
      });

      if (!response.ok) {
        throw new Error('Summary generation failed');
      }

      const data = await response.json();
      const generatedSummary = data.choices[0]?.message?.content || 'Summary generation failed';
      setSummary(generatedSummary);
      
      toast({
        title: "Summary Generated",
        description: "Document summary has been created",
      });
    } catch (error) {
      toast({
        title: "Summary Generation Failed",
        description: "Please check your API key and try again",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleViewOriginal = () => {
    // Mock PDF viewer - in real app, this would open the actual document
    toast({
      title: "Opening Document",
      description: "PDF viewer would open here in a real implementation",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/20 text-success border-success/30">Approved</Badge>;
      case "under_review":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Under Review</Badge>;
      case "pending":
        return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-muted text-muted-foreground">Low Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Document Review & Assignment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Input */}
          {showApiKeyInput && (
            <div className="p-4 border border-warning/30 bg-warning/5 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Perplexity API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Perplexity API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setShowApiKeyInput(false)}
                    disabled={!apiKey.trim()}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is needed for translation and summary features. Get your API key from{" "}
                  <a href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Perplexity AI
                  </a>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Document Information */}
            <div className="xl:col-span-2 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Document Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Title</p>
                        <p className="font-medium">{document.title}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                        <p>{document.category}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Upload Date</p>
                        <p>{document.uploadDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Uploaded By</p>
                        <p>{document.uploadedBy}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(document.status)}
                          {document.priority && getPriorityBadge(document.priority)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Assigned Employees</p>
                        <p className="text-sm">{selectedEmployees.size} employees assigned</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {document.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button onClick={handleViewOriginal} className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View Original
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="w-full"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        Translate
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="w-full"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Summary
                      </>
                    )}
                  </Button>
                </div>

                {/* Translation Result */}
                {translatedContent && (
                  <div>
                    <Label className="text-sm font-medium">Malayalam Translation</Label>
                    <div className="mt-2 p-3 bg-secondary/50 rounded-lg text-sm">
                      {translatedContent}
                    </div>
                  </div>
                )}

                {/* Summary Section */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Document Summary</Label>
                  <Textarea
                    placeholder="Document summary will appear here after generation..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  {!summary && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Click "Summary" to automatically create a document summary using AI
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Employee Assignment Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Assign to Employees</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-xs"
                    >
                      {selectedEmployees.size === employees.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {selectedEmployees.size} of {employees.length} selected
                    </span>
                  </div>

                  <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                    {employees.map((employee) => (
                      <div
                        key={employee.user_id}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedEmployees.has(employee.user_id)}
                          onCheckedChange={() => handleEmployeeToggle(employee.user_id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{employee.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                          {employee.department && (
                            <p className="text-xs text-muted-foreground">{employee.department}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {employees.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No employees found
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleSaveAssignments}
                    disabled={isSavingAssignments || saveAssignmentsMutation.isPending}
                    className="w-full"
                    size="sm"
                  >
                    {(isSavingAssignments || saveAssignmentsMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Assignments'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
            <div className="flex space-x-2">
              {document.status === 'pending' && onApprove && (
                <Button
                  onClick={() => onApprove(document.id)}
                  className="bg-success hover:bg-success/90"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve Document
                </Button>
              )}
              
              {document.status === 'pending' && onReject && (
                <Button
                  variant="destructive"
                  onClick={() => onReject(document.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject Document
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};