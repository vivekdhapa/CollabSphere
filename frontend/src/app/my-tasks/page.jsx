"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/layout/PageShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import TaskDetailDrawer from "../../components/tasks/TaskDetailDrawer";

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchMyTasks = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const projectsRes = await api.get("/projects");
      const projects = projectsRes.data.data || [];
      
      const allTasksPromises = projects.map(p => api.get(`/tasks/${p.project._id}`));
      const allTasksResponses = await Promise.allSettled(allTasksPromises);
      
      let myTasks = [];
      allTasksResponses.forEach((res, index) => {
        if (res.status === "fulfilled") {
          const projectTasks = res.value.data.data || [];
          const projectTasksAssignedToMe = projectTasks.filter(t => t.assignedTo?._id === user._id);
          // attach project info
          projectTasksAssignedToMe.forEach(t => {
            t.projectInfo = projects[index].project;
            t.userRole = projects[index].role;
          });
          myTasks = [...myTasks, ...projectTasksAssignedToMe];
        }
      });
      
      // sort by due date or created at
      myTasks.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.createdAt);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.createdAt);
        return dateA - dateB;
      });

      setTasks(myTasks);
    } catch (err) {
      console.error(err);
      setError("Failed to load your tasks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [user]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <ProtectedRoute>
      <PageShell title="My Tasks">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="headline-lg text-stone-900 mb-8">My Tasks</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
            </div>
          ) : error ? (
             <div className="p-4 bg-error-container text-error rounded-xl text-sm font-medium">
               {error}
             </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest border border-stone-100 rounded-xl">
              <span className="material-symbols-outlined text-[40px] text-stone-300 mb-4">task</span>
              <h3 className="headline-sm text-stone-900">You have no tasks assigned</h3>
              <p className="body-md text-stone-500 mt-2">When you're assigned tasks across your projects, they'll appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tasks.map(task => (
                <div 
                  key={task._id} 
                  onClick={() => handleTaskClick(task)}
                  className={`bg-surface-container-lowest p-5 rounded-xl border border-stone-200 hover:border-stone-400 transition-colors cursor-pointer shadow-[0px_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between group ${task.status === 'done' ? 'opacity-60 hover:opacity-100' : ''}`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        task.status === 'done' ? 'bg-success-green' : 
                        task.status === 'in_progress' ? 'bg-stone-900' : 'bg-stone-300'
                      }`}></span>
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{task.status.replace("_", " ")}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs font-medium text-stone-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">folder</span>
                        {task.projectInfo.name}
                      </span>
                    </div>
                    <h3 className={`text-base font-semibold text-stone-900 ${task.status === 'done' ? 'line-through' : ''}`}>
                      {task.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {task.dueDate && (
                      <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${
                        new Date(task.dueDate) < new Date() && task.status !== 'done' 
                          ? 'bg-error-container text-error' 
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                    <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-900 transition-colors">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedTask && (
          <TaskDetailDrawer 
            taskId={selectedTask._id} 
            projectId={selectedTask.projectInfo._id}
            projectName={selectedTask.projectInfo.name}
            isOpen={!!selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onTaskUpdated={fetchMyTasks}
            userRole={selectedTask.userRole}
          />
        )}
      </PageShell>
    </ProtectedRoute>
  );
}
