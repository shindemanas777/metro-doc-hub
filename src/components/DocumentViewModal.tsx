import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Globe, Eye, Loader2, Calendar, User, Hash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  uploadDate: string;
  status: string;
  uploadedBy: string;
}

interface DocumentViewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewModal = ({ document, isOpen, onClose }: DocumentViewModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [summary, setSummary] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  if (!document) return null;

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
        return <Badge variant="secondary" className="bg-success/20 text-success border-success/30">Approved</Badge>;
      case "under_review":
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">Under Review</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Document Details</span>
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

          {/* Document Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Document Information</h3>
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
                      {getStatusBadge(document.status)}
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
            </div>

            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleViewOriginal} 
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Original Document
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
                      Translate to Malayalam
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
                      Generate Summary
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
            </div>
          </div>

          {/* Summary Section */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Document Summary</Label>
            <Textarea
              placeholder="Document summary will appear here after generation..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
              className="resize-none"
            />
            {!summary && (
              <p className="text-xs text-muted-foreground mt-1">
                Click "Generate Summary" to automatically create a document summary using AI
              </p>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};