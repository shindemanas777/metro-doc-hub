import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Eye, EyeOff, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role || !formData.username || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Mock authentication - in real app, this would call an API
    if (formData.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/employee");
    }

    toast({
      title: "Login Successful",
      description: `Welcome back, ${formData.username}!`,
    });
  };

  const handleDemoLogin = (role: "admin" | "employee") => {
    if (role === "admin") {
      navigate("/admin");
      toast({
        title: "Admin Demo Access",
        description: "Logged in as Ravi Kumar (Admin)",
      });
    } else {
      navigate("/employee");
      toast({
        title: "Employee Demo Access", 
        description: "Logged in as Priya Nair (Employee)",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">KMRL</CardTitle>
            <p className="text-muted-foreground mt-2">Document Intelligence System</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Select Role</h2>
            <p className="text-sm text-muted-foreground">Choose your role to access the system</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-10"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="space-y-3">
            <div className="text-center text-sm text-muted-foreground font-medium">
              QUICK LOGIN (DEMO)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("admin")}
                className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
              >
                Admin Demo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("employee")}
                className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
              >
                Employee Demo
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Kochi Metro Rail Limited</p>
            <p>Secure Document Management System</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;