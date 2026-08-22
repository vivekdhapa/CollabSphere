"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageShell from "../../../../components/layout/PageShell";
import ProjectTabs from "../../../../components/projects/ProjectTabs";
import CreateTaskModal from "../../../../components/tasks/CreateTaskModal";
import TaskDetailDrawer from "../../../../components/tasks/TaskDetailDrawer";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import api from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

export default function ProjectTimelinePage() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const fetchTimelineData = async () => {
    if (!projectId || !user) return;
    setIsLoading(true);
    try {
      const [projectRes, membersRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/members`),
        api.get(`/tasks/${projectId}`),
      ]);

      const fetchedProject = projectRes.data.data;
      const membersList = membersRes.data.data || [];
      const tasksList = tasksRes.data.data || [];

      setProject(fetchedProject);
      setMembers(membersList);
      setTasks(tasksList);

      const currentUserMember = membersList.find((m) => m.user._id === user._id);
      if (currentUserMember) {
        setUserRole(currentUserMember.role);
      } else {
        setError("You do not have access to this project.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load project timeline.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineData();
  }, [projectId, user]);

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

  const canManageTasks = userRole === "admin" || userRole === "project_admin";

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

  const topbarTitle = project ? (
    <div className="flex items-center h-full">
      <span className="text-stone-900 font-bold">{project.name}</span>
      <span className="text-stone-300 mx-3">/</span>
      <ProjectTabs projectId={projectId} activeTab="Timeline" />
    </div>
  ) : "Loading Project...";

  // Sort tasks chronologically:
  // 1. By dueDate if present
  // 2. Fall back to createdAt
  // 3. Tasks with no date grouped into undatedTasks
  const datedTasks = [];
  const undatedTasks = [];

  tasks.forEach((task) => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (!isNaN(d.getTime())) {
        datedTasks.push({ ...task, _time: d.getTime(), _hasDueDate: true });
        return;
      }
    }
    if (task.createdAt) {
      const d = new Date(task.createdAt);
      if (!isNaN(d.getTime())) {
        datedTasks.push({ ...task, _time: d.getTime(), _hasDueDate: false });
        return;
      }
    }
    undatedTasks.push(task);
  });

  // Sort chronologically ascending
  datedTasks.sort((a, b) => a._time - b._time);

  const renderTaskRow = (task) => {
    return (
      <div
        key={task._id}
        onClick={() => setSelectedTaskId(task._id)}
        className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-stone-50 border border-stone-100 hover:border-stone-200 rounded-xl transition-all cursor-pointer shadow-[0px_2px_8px_rgba(0,0,0,0.02)] group"
      >
        {/* Left: Status badge + Title */}
        <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
          <span className="bg-stone-100 text-stone-600 rounded-full px-3 py-1 text-xs font-medium capitalize flex items-center gap-1.5 shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                task.status === "done"
                  ? "bg-success-green"
                  : task.status === "in_progress"
                  ? "bg-stone-900"
                  : "bg-stone-300"
              }`}
            ></span>
            {task.status.replace("_", " ")}
          </span>

          <h4
            className={`body-md font-medium text-stone-900 truncate group-hover:text-stone-900 ${
              task.status === "done" ? "line-through text-stone-400" : ""
            }`}
          >
            {task.title}
          </h4>
        </div>

        {/* Right: Due Date badge + Assignee */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className="material-symbols-outlined text-[16px] text-stone-400">
              {task.dueDate ? "calendar_today" : "schedule"}
            </span>
            <span>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : task.createdAt
                ? `Created ${new Date(task.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : "No date"}
            </span>
          </div>

          <div
            className="w-7 h-7 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0"
            title={task.assignedTo?.fullName || task.assignedTo?.username || "Unassigned"}
          >
            {task.assignedTo?.avatar?.url ? (
              <img
                src={task.assignedTo.avatar.url}
                alt="Assignee"
                className="w-full h-full object-cover"
              />
            ) : task.assignedTo ? (
              <span className="text-[10px] font-medium text-stone-600 uppercase">
                {task.assignedTo.fullName?.charAt(0) ||
                  task.assignedTo.username?.charAt(0) ||
                  "U"}
              </span>
            ) : (
              <span className="material-symbols-outlined text-[14px] text-stone-300">
                person
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <PageShell
        title={topbarTitle}
        showAddTask={true}
        isAddTaskEnabled={canManageTasks}
        onAddTask={() => setIsCreateTaskModalOpen(true)}
      >
        <div className="max-w-4xl mx-auto py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="headline-lg text-stone-900 mb-1">Project Timeline</h2>
              <p className="body-md text-stone-500">
                Chronological list of project tasks ordered by due date
              </p>
            </div>
            {canManageTasks && (
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-lowest border border-stone-100 rounded-xl">
              <span className="material-symbols-outlined text-[32px] text-stone-300 mb-2">
                event_note
              </span>
              <h3 className="headline-sm text-stone-900">No tasks found</h3>
              <p className="body-md text-stone-500 mt-1">
                Create a task to see it on the timeline.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Chronologically dated tasks */}
              {datedTasks.length > 0 && (
                <div className="flex flex-col gap-3">
                  {datedTasks.map((t) => renderTaskRow(t))}
                </div>
              )}

              {/* Undated tasks section */}
              {undatedTasks.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                    <h3 className="label-md text-stone-500 uppercase font-bold tracking-wider">
                      No date set ({undatedTasks.length})
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {undatedTasks.map((t) => renderTaskRow(t))}
                  </div>
                </div>
              )}
            </div>
          )}
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
