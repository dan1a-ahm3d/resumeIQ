import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="pl-[220px]">
        <Header />
        <main className="relative pt-16 bg-background min-h-screen">
          <div className="max-w-[1280px] mx-auto p-space-xl">
            <div className="flex flex-col w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
