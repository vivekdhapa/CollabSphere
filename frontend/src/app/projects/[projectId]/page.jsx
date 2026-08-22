"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageShell from "../../../components/layout/PageShell";
import ProjectTabs from "../../../components/projects/ProjectTabs";
import CreateTaskModal from "../../../components/tasks/CreateTaskModal";
import TaskDetailDrawer from "../../../components/tasks/TaskDetailDrawer";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { useSearch } from "../../../context/SearchContext";

export default function ProjectBoardPage() {
  const params = useParams();
  const { projectId } = params;
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const { searchQuery, setIsSearchable } = useSearch();

  useEffect(() => {
    setIsSearchable(true);
    return () => setIsSearchable(false);
  }, [setIsSearchable]);

  useEffect(() => {
    if (!projectId || !user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projectRes, membersRes, tasksRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/members`),
          api.get(`/tasks/${projectId}`)
        ]);

        const membersList = membersRes.data.data;
        setMembers(membersList);
        // Find current user's role
        const currentUserMember = membersList.find(m => m.user._id === user._id);
        
        if (currentUserMember) {
          setUserRole(currentUserMember.role);
          setProject(projectRes.data.data); // Use the real project object
        } else {
          setError("You do not have access to this project.");
        }

        setTasks(tasksRes.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load project details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, user]);

  const handleAddTask = () => {
    setIsCreateTaskModalOpen(true);
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
  };

  const refreshTasks = async () => {
    try {
      const tasksRes = await api.get(`/tasks/${projectId}`);
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      console.error("Failed to refresh tasks", err);
    }
  };

  const handleTaskCreated = () => {
    refreshTasks();
    setIsCreateTaskModalOpen(false);
  };

  // RBAC checks
  const canManageTasks = userRole === "admin" || userRole === "project_admin";

  const topbarTitle = project ? (
    <div className="flex items-center h-full">
      <span className="text-stone-900 font-bold">{project.name}</span>
      <span className="text-stone-300 mx-3">/</span>
      <ProjectTabs projectId={projectId} activeTab="Board" />
    </div>
  ) : "Loading Project...";

  // Group tasks by status
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const todoTasks = filteredTasks.filter(t => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(t => t.status === "in_progress");
  const doneTasks = filteredTasks.filter(t => t.status === "done");

  const renderTaskCard = (task, isDone = false) => {
    return (
      <div 
        key={task._id} 
        onClick={() => handleTaskClick(task._id)}
        className={`bg-surface-container-lowest rounded-xl p-4 border border-transparent hover:border-stone-300 transition-all cursor-pointer shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-3 ${isDone ? 'opacity-80 hover:opacity-100' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className="bg-stone-100 text-stone-600 rounded px-2 py-1 text-[10px] uppercase tracking-wider font-semibold">
            Task
          </span>
          {task.priority === "high" && (
            <span className="material-symbols-outlined text-[16px] text-orange-500">priority_high</span>
          )}
        </div>
        
        <h4 className={`body-md font-medium text-stone-900 ${isDone ? 'line-through text-stone-500' : ''}`}>
          {task.title}
        </h4>
        
        <div className="flex items-center justify-end mt-1 pt-3 border-t border-stone-100">
          {task.assignedTo ? (
            <div className="w-6 h-6 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0" title={task.assignedTo.fullName || task.assignedTo.username}>
              {task.assignedTo.avatar?.url ? (
                <img src={task.assignedTo.avatar.url} alt="Assignee" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-medium text-stone-600 uppercase">
                  {task.assignedTo.fullName?.charAt(0) || task.assignedTo.username?.charAt(0) || "U"}
                </span>
              )}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-stone-200 border-dashed flex items-center justify-center text-stone-300" title="Unassigned">
              <span className="material-symbols-outlined text-[14px]">person</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <PageShell title="Loading Project...">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Project Error">
        <div className="p-4 bg-error-container text-error rounded-lg">
          {error}
        </div>
      </PageShell>
    );
  }

  return (
    <ProtectedRoute>
      <PageShell 
        title={topbarTitle} 
        showAddTask={true}
        isAddTaskEnabled={canManageTasks}
        onAddTask={handleAddTask}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="headline-sm text-stone-900">Kanban Board</h2>
          <div className="flex items-center gap-2">
            <span className="bg-stone-100 text-stone-600 rounded-full px-3 py-1 label-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span>
              Role: <span className="font-bold capitalize">{userRole?.replace("_", " ")}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-gutter overflow-x-auto pb-4 h-[calc(100vh-220px)] items-start">
          
          {/* Todo Column */}
          <div className="w-[320px] shrink-0 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-stone-300"></span>
              <h3 className="label-md text-stone-900 uppercase font-bold tracking-wider">Todo</h3>
              <span className="bg-stone-200 text-stone-600 rounded-full px-2 py-0.5 text-[10px] font-medium ml-1">
                {todoTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 flex-1">
              {todoTasks.map(t => renderTaskCard(t))}
              
              <button 
                onClick={handleAddTask}
                disabled={!canManageTasks}
                className="mt-2 w-full py-3 border-2 border-dashed border-stone-200 text-stone-400 rounded-xl hover:text-stone-900 hover:border-stone-300 hover:bg-stone-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:border-stone-200 disabled:hover:text-stone-400 disabled:hover:bg-transparent disabled:cursor-not-allowed font-medium text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Task
              </button>
            </div>
          </div>

          {/* In Progress Column */}
          <div className="w-[320px] shrink-0 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-stone-900"></span>
              <h3 className="label-md text-stone-900 uppercase font-bold tracking-wider">In Progress</h3>
              <span className="bg-stone-200 text-stone-600 rounded-full px-2 py-0.5 text-[10px] font-medium ml-1">
                {inProgressTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 flex-1">
              {inProgressTasks.map(t => renderTaskCard(t))}
            </div>
          </div>

          {/* Done Column */}
          <div className="w-[320px] shrink-0 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-success-green"></span>
              <h3 className="label-md text-stone-900 uppercase font-bold tracking-wider">Done</h3>
              <span className="bg-stone-200 text-stone-600 rounded-full px-2 py-0.5 text-[10px] font-medium ml-1">
                {doneTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 flex-1">
              {doneTasks.map(t => renderTaskCard(t, true))}
            </div>
          </div>

        </div>

        <CreateTaskModal 
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onSuccess={handleTaskCreated}
          projectId={projectId}
          projectMembers={members}
        />
        
        <TaskDetailDrawer 
          taskId={selectedTaskId} 
          projectId={projectId}
          projectName={project?.name}
          isOpen={!!selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
          onTaskUpdated={refreshTasks}
          userRole={userRole}
        />
      </PageShell>
    </ProtectedRoute>
  );
}
