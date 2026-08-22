"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageShell from "../../../../components/layout/PageShell";
import ProjectTabs from "../../../../components/projects/ProjectTabs";
import CreateTaskModal from "../../../../components/tasks/CreateTaskModal";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import api from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const fetchOverviewData = async () => {
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
      setError("Failed to load project overview.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [projectId, user]);

  const canManageTasks = userRole === "admin" || userRole === "project_admin";

  const handleTaskCreated = () => {
    fetchOverviewData();
    setIsCreateTaskModalOpen(false);
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

  const topbarTitle = project ? (
    <div className="flex items-center h-full">
      <span className="text-stone-900 font-bold">{project.name}</span>
      <span className="text-stone-300 mx-3">/</span>
      <ProjectTabs projectId={projectId} activeTab="Overview" />
    </div>
  ) : "Loading Project...";

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;

  const formattedCreatedDate = project?.createdAt
    ? new Date(project.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <ProtectedRoute>
      <PageShell
        title={topbarTitle}
        showAddTask={true}
        isAddTaskEnabled={canManageTasks}
        onAddTask={() => setIsCreateTaskModalOpen(true)}
      >
        <div className="max-w-5xl mx-auto py-6 flex flex-col gap-6">
          {/* Header section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="headline-lg text-stone-900 mb-1">{project?.name}</h2>
              <p className="body-md text-stone-500">
                Created on {formattedCreatedDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-stone-100 text-stone-600 rounded-full px-3 py-1 label-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                Role: <span className="font-bold capitalize">{userRole?.replace("_", " ")}</span>
              </span>
            </div>
          </div>

          {/* Top Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description / Info Card */}
            <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-6 border border-stone-100 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                  About Project
                </span>
                <p className="body-md text-stone-700 whitespace-pre-wrap">
                  {project?.description || "No project description provided."}
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Created date: {formattedCreatedDate}</span>
                <Link
                  href={`/projects/${projectId}`}
                  className="text-stone-900 font-semibold hover:underline flex items-center gap-1"
                >
                  View Kanban Board
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Members Summary Card */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-stone-100 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                  Team
                </span>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="headline-lg text-stone-900">{members.length}</span>
                  <span className="body-md text-stone-500">
                    {members.length === 1 ? "member" : "members"}
                  </span>
                </div>
                {/* Member avatars */}
                <div className="flex items-center -space-x-2 overflow-hidden">
                  {members.slice(0, 5).map((m) => (
                    <div
                      key={m.user._id}
                      className="w-8 h-8 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center overflow-hidden shrink-0"
                      title={m.user.fullName || m.user.username}
                    >
                      {m.user.avatar?.url ? (
                        <img
                          src={m.user.avatar.url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-stone-600 uppercase">
                          {m.user.fullName?.charAt(0) || m.user.username?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                  ))}
                  {members.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-[10px] font-medium text-stone-600">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100">
                <Link
                  href={`/projects/${projectId}/members`}
                  className="text-xs text-stone-900 font-semibold hover:underline flex items-center justify-between"
                >
                  <span>Manage Members</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Task Breakdown Section */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-stone-100 shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="headline-sm text-stone-900">Task Breakdown</h3>
                <p className="body-md text-stone-500">
                  {totalTasks} total {totalTasks === 1 ? "task" : "tasks"} across all columns
                </p>
              </div>
              <Link
                href={`/projects/${projectId}/timeline`}
                className="text-xs text-stone-900 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Timeline</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Todo Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stone-300"></span>
                    <span className="label-md text-stone-900 uppercase font-bold tracking-wider">
                      Todo
                    </span>
                  </div>
                  <span className="bg-stone-200 text-stone-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {todoCount}
                  </span>
                </div>
                <div className="text-2xl font-bold text-stone-900 mt-2">
                  {todoCount}
                </div>
                <span className="text-xs text-stone-500">
                  {totalTasks > 0 ? `${Math.round((todoCount / totalTasks) * 100)}% of tasks` : "No tasks"}
                </span>
              </div>

              {/* In Progress Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stone-900"></span>
                    <span className="label-md text-stone-900 uppercase font-bold tracking-wider">
                      In Progress
                    </span>
                  </div>
                  <span className="bg-stone-200 text-stone-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {inProgressCount}
                  </span>
                </div>
                <div className="text-2xl font-bold text-stone-900 mt-2">
                  {inProgressCount}
                </div>
                <span className="text-xs text-stone-500">
                  {totalTasks > 0 ? `${Math.round((inProgressCount / totalTasks) * 100)}% of tasks` : "No tasks"}
                </span>
              </div>

              {/* Done Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success-green"></span>
                    <span className="label-md text-stone-900 uppercase font-bold tracking-wider">
                      Done
                    </span>
                  </div>
                  <span className="bg-stone-200 text-stone-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {doneCount}
                  </span>
                </div>
                <div className="text-2xl font-bold text-stone-900 mt-2">
                  {doneCount}
                </div>
                <span className="text-xs text-stone-500">
                  {totalTasks > 0 ? `${Math.round((doneCount / totalTasks) * 100)}% of tasks` : "No tasks"}
                </span>
              </div>
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
      </PageShell>
    </ProtectedRoute>
  );
}
