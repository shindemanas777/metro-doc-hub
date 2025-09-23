import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  userRole?: "admin" | "employee";
  userName?: string;
}

export const Layout = ({ children, userRole, userName }: LayoutProps) => {
  if (!userRole) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userRole={userRole} userName={userName} />
      <main className="flex-1 bg-muted/30">
        {children}
      </main>
    </div>
  );
};