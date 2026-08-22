"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageShell from "../../../../components/layout/PageShell";
import ProjectTabs from "../../../../components/projects/ProjectTabs";
import AddMemberModal from "../../../../components/projects/AddMemberModal";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import api from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import { useSearch } from "../../../../context/SearchContext";

export default function MembersPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const { searchQuery, setIsSearchable } = useSearch();

  useEffect(() => {
    setIsSearchable(true);
    return () => setIsSearchable(false);
  }, [setIsSearchable]);

  const fetchProjectData = async () => {
    if (!projectId || !user) return;
    
    try {
      const [projectRes, membersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/members`)
      ]);

      setProject(projectRes.data.data);
      const membersList = membersRes.data.data;
      setMembers(membersList);
      
      const currentUserMember = membersList.find(m => m.user._id === user._id);
      if (currentUserMember) {
        setUserRole(currentUserMember.role);
      } else {
        setError("You do not have access to this project.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load project members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId, user]);

  const canManageMembers = userRole === "admin" || userRole === "project_admin";

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/projects/${projectId}/members/${userId}`, { newRole });
      fetchProjectData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the project?")) {
      return;
    }
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      fetchProjectData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to remove member");
    }
  };

  const handleMemberAdded = () => {
    setIsAddMemberModalOpen(false);
    fetchProjectData();
  };

  if (isLoading) {
    return (
      <PageShell title="Loading...">
        <div className="flex items-center justify-center h-full">
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
      <ProjectTabs projectId={projectId} activeTab="Members" />
    </div>
  ) : "Loading Project...";

  return (
    <ProtectedRoute>
      <PageShell title={topbarTitle}>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="headline-lg text-stone-900 mb-1">Project Members</h2>
            <p className="body-md text-stone-500">
              {members.length} {members.length === 1 ? 'member' : 'members'} in this project
            </p>
          </div>
          {canManageMembers && (
            <button 
              onClick={() => setIsAddMemberModalOpen(true)}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Member
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-lowest border border-stone-100 rounded-xl">
            <span className="material-symbols-outlined text-[32px] text-stone-300 mb-2">groups</span>
            <h3 className="headline-sm text-stone-900">No members yet</h3>
            <p className="body-md text-stone-500 mt-1">This project has no members.</p>
          </div>
        ) : (() => {
          const filteredMembers = members.filter(m => 
            (m.user.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.user.fullName || "").toLowerCase().includes(searchQuery.toLowerCase())
          );
          return filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-lowest border border-stone-100 rounded-xl text-stone-500">
              No members match your search.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredMembers.map((member) => (
                <div 
                  key={member.user._id} 
                  className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-stone-100 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]"
                >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                    {member.user.avatar?.url ? (
                      <img src={member.user.avatar.url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-stone-600 uppercase">
                        {member.user.fullName?.charAt(0) || member.user.username?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">
                      {member.user.fullName || member.user.username}
                      {member.user._id === user._id && <span className="ml-2 text-stone-400 font-normal">(You)</span>}
                    </h3>
                    <p className="text-xs text-stone-500">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {canManageMembers && member.user._id !== user._id ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                      className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs font-medium text-stone-700 outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    >
                      <option value="admin">Admin</option>
                      <option value="project_admin">Project Admin</option>
                      <option value="member">Member</option>
                    </select>
                  ) : (
                    <span className="bg-stone-100 text-stone-600 rounded-full px-3 py-1 text-xs font-medium capitalize flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        member.role === 'admin' ? 'bg-orange-500' : 
                        member.role === 'project_admin' ? 'bg-blue-500' : 'bg-stone-400'
                      }`}></span>
                      {member.role.replace("_", " ")}
                    </span>
                  )}

                  {canManageMembers && member.user._id !== user._id && (
                    <button 
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-error hover:bg-error-container rounded transition-colors"
                      title="Remove Member"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_remove</span>
                    </button>
                  )}
                  {(!canManageMembers || member.user._id === user._id) && (
                    <div className="w-8 h-8"></div> // Spacer to keep layout aligned
                  )}
                </div>
              </div>
            ))}
          </div>
        );
        })()}
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={handleMemberAdded}
        projectId={projectId}
      />
    </PageShell>
    </ProtectedRoute>
  );
}
