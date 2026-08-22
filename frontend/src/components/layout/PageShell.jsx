"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ProtectedRoute from "../ProtectedRoute";

export default function PageShell({ children, title, onOpenCreateProject, showAddTask = false, isAddTaskEnabled = true, onAddTask }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-stone-50 flex">
        <Sidebar onOpenCreateProject={onOpenCreateProject} />
        <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
          <Topbar 
            title={title} 
            showAddTask={showAddTask}
            isAddTaskEnabled={isAddTaskEnabled}
            onAddTask={onAddTask}
          />
          <main className="flex-1 p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
