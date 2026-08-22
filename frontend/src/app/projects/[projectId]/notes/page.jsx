"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageShell from "../../../../components/layout/PageShell";
import ProjectTabs from "../../../../components/projects/ProjectTabs";
import AddNoteModal from "../../../../components/projects/AddNoteModal";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import api from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import { useSearch } from "../../../../context/SearchContext";

// Simple relative time formatter
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function NotesPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { searchQuery, setIsSearchable } = useSearch();

  useEffect(() => {
    setIsSearchable(true);
    return () => setIsSearchable(false);
  }, [setIsSearchable]);

  const fetchProjectData = async () => {
    if (!projectId || !user) return;
    
    try {
      const [projectRes, membersRes, notesRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/members`),
        api.get(`/notes/${projectId}`)
      ]);

      setProject(projectRes.data.data);
      setNotes(notesRes.data.data);
      
      const membersList = membersRes.data.data;
      const currentUserMember = membersList.find(m => m.user._id === user._id);
      if (currentUserMember) {
        setUserRole(currentUserMember.role);
      } else {
        setError("You do not have access to this project.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load project notes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId, user]);

  const canManageNotes = userRole === "admin" || userRole === "project_admin";

  const handleNoteAdded = () => {
    setIsAddNoteModalOpen(false);
    fetchProjectData();
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note._id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId) => {
    if (!editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      await api.put(`/notes/${projectId}/n/${noteId}`, { content: editContent.trim() });
      setEditingNoteId(null);
      fetchProjectData();
    } catch (err) {
      console.error(err);
      alert("Failed to update note");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    try {
      await api.delete(`/notes/${projectId}/n/${noteId}`);
      fetchProjectData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete note");
    }
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
      <ProjectTabs projectId={projectId} activeTab="Notes" />
    </div>
  ) : "Loading Project...";

  return (
    <ProtectedRoute>
      <PageShell title={topbarTitle}>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="headline-lg text-stone-900 mb-1">Project Notes</h2>
            <p className="body-md text-stone-500">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          {canManageNotes && (
            <button 
              onClick={() => setIsAddNoteModalOpen(true)}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Note
            </button>
          )}
        </div>

        {canManageNotes && notes.length === 0 && (
          <button 
            onClick={() => setIsAddNoteModalOpen(true)}
            className="w-full py-12 mb-6 border-2 border-dashed border-stone-200 text-stone-400 rounded-xl hover:text-stone-900 hover:border-stone-300 hover:bg-stone-50 transition-all flex flex-col items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[32px]">edit_note</span>
            <span className="font-medium">Create the first note</span>
          </button>
        )}

        {!canManageNotes && notes.length === 0 && (
          <div className="text-center py-12 bg-surface-container-lowest border border-stone-100 rounded-xl">
            <span className="material-symbols-outlined text-[32px] text-stone-300 mb-2">notes</span>
            <h3 className="headline-sm text-stone-900">No notes yet</h3>
            <p className="body-md text-stone-500 mt-1">This project has no notes.</p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {(() => {
            const filteredNotes = notes.filter(n => 
              (n.content || "").toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            if (filteredNotes.length === 0 && notes.length > 0) {
              return (
                <div className="text-center py-8 text-stone-500">
                  No notes match your search.
                </div>
              );
            }
            
            return filteredNotes.map((note) => (
              <div 
                key={note._id} 
                className="bg-surface-container-lowest p-5 rounded-xl border border-stone-100 shadow-[0px_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3"
              >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden">
                    {note.createdBy?.avatar?.url ? (
                      <img src={note.createdBy.avatar.url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-stone-600 uppercase">
                        {note.createdBy?.fullName?.charAt(0) || note.createdBy?.username?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">
                      {note.createdBy?.fullName || note.createdBy?.username || "Unknown"}
                    </h4>
                    <span className="text-xs text-stone-400">{timeAgo(note.createdAt)}</span>
                  </div>
                </div>

                {canManageNotes && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 /* Force visible for now due to touch devices, or just keep visible */ }}>
                    {editingNoteId !== note._id && (
                      <button 
                        onClick={() => handleStartEdit(note)}
                        className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                        title="Edit Note"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteNote(note._id)}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-error hover:bg-error-container rounded transition-colors"
                      title="Delete Note"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                )}
              </div>

              {editingNoteId === note._id ? (
                <div className="flex flex-col gap-2 mt-1">
                  <textarea
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none text-body-md min-h-[80px] resize-y"
                    disabled={isSavingEdit}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setEditingNoteId(null)}
                      disabled={isSavingEdit}
                      className="px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSaveEdit(note._id)}
                      disabled={isSavingEdit}
                      className="px-3 py-1 text-xs font-medium bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="body-md text-stone-700 whitespace-pre-wrap break-words overflow-hidden">
                  {note.content}
                </div>
              )}
            </div>
          ));
          })()}
        </div>
      </div>

      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onSuccess={handleNoteAdded}
        projectId={projectId}
      />
    </PageShell>
    </ProtectedRoute>
  );
}
