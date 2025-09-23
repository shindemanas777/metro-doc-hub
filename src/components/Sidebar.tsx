import { Home, FileText, Upload, Users, Settings, BarChart3, LogOut, AlertTriangle, Building2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import kmrlLogo from "@/assets/kmrl-logo.png";

interface SidebarProps {
  userRole: "admin" | "employee";
  userName?: string;
}

export const Sidebar = ({ userRole, userName = "User" }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const adminMenuItems = [
    { icon: Home, label: "Dashboard", path: "/admin" },
    { icon: FileText, label: "Review Documents", path: "/admin/review" },
    { icon: Upload, label: "Upload", path: "/admin/upload" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const employeeMenuItems = [
    { icon: Home, label: "Home", path: "/employee" },
    { icon: FileText, label: "Documents", path: "/employee/documents" },
    { icon: AlertTriangle, label: "Alerts", path: "/employee/alerts" },
    { icon: Settings, label: "Settings", path: "/employee/settings" },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : employeeMenuItems;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-primary text-primary-foreground flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-primary-hover">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-sm">KMRL</div>
            <div className="text-xs opacity-75 capitalize">{userRole} Panel</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-primary-hover">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-light text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{userName}</div>
            <div className="text-xs opacity-75 capitalize">{userRole}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`w-full justify-start text-left ${
                  isActive(item.path)
                    ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    : "text-primary-foreground hover:bg-primary-hover"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-primary-hover">
        <Button
          variant="ghost"
          className="w-full justify-start text-primary-foreground hover:bg-primary-hover"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};