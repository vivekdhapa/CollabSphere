"use client";

import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function TaskDetailDrawer({ 
  isOpen, 
  onClose, 
  taskId, 
  projectId, 
  projectName, 
  userRole, 
  onTaskUpdated 
}) {
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [editedDueDate, setEditedDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Subtask states
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);
  
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const canEdit = userRole === "admin" || userRole === "project_admin";

  useEffect(() => {
    if (isOpen && taskId && projectId) {
      fetchTask();
    } else {
      setTask(null);
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setIsEditingDueDate(false);
      setIsAddingSubtask(false);
      setNewSubtaskTitle("");
    }
  }, [isOpen, taskId, projectId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const fetchTask = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/tasks/${projectId}/t/${taskId}`);
      const fetchedTask = response.data.data;
      setTask(fetchedTask);
      setEditedTitle(fetchedTask.title);
      setEditedDesc(fetchedTask.description || "");
      setEditedDueDate(fetchedTask.dueDate ? new Date(fetchedTask.dueDate).toISOString().split('T')[0] : "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load task details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === task.title) {
      setIsEditingTitle(false);
      setEditedTitle(task.title);
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/tasks/${projectId}/t/${taskId}`, { title: editedTitle.trim() });
      setTask({ ...task, title: editedTitle.trim() });
      setIsEditingTitle(false);
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      alert("Failed to update title");
      setEditedTitle(task.title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDesc = async () => {
    if (editedDesc === (task.description || "")) {
      setIsEditingDesc(false);
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/tasks/${projectId}/t/${taskId}`, { description: editedDesc.trim() });
      setTask({ ...task, description: editedDesc.trim() });
      setIsEditingDesc(false);
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      alert("Failed to update description");
      setEditedDesc(task.description || "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDueDate = async (newDate) => {
    setIsSaving(true);
    try {
      const payload = { dueDate: newDate ? new Date(newDate).toISOString() : null };
      await api.put(`/tasks/${projectId}/t/${taskId}`, payload);
      setTask(prev => ({ ...prev, dueDate: newDate ? new Date(newDate).toISOString() : null }));
      setIsEditingDueDate(false);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update due date");
    } finally {
      setIsSaving(false);
    }
  };


  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    try {
      // Optimistic update
      setTask(prev => {
        const newSubtasks = (prev.subtasks || []).map(st => 
          st._id === subtaskId ? { ...st, isCompleted: !currentStatus } : st
        );
        return { ...prev, subtasks: newSubtasks };
      });
      await api.put(`/tasks/${projectId}/st/${subtaskId}`, { isCompleted: !currentStatus });
    } catch (err) {
      console.error(err);
      fetchTask(); // revert on fail
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      // Optimistic delete
      setTask(prev => ({
        ...prev,
        subtasks: (prev.subtasks || []).filter(st => st._id !== subtaskId)
      }));
      await api.delete(`/tasks/${projectId}/st/${subtaskId}`);
    } catch (err) {
      console.error(err);
      fetchTask(); // revert on fail
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    
    setIsSubmittingSubtask(true);
    try {
      const response = await api.post(`/tasks/${projectId}/t/${taskId}/subtasks`, { title: newSubtaskTitle.trim() });
      const createdSubtask = response.data.data;
      setTask(prev => ({
        ...prev,
        subtasks: [...(prev.subtasks || []), createdSubtask]
      }));
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add subtask");
    } finally {
      setIsSubmittingSubtask(false);
    }
  };

  const handleUploadAttachments = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingAttachment(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("attachments", files[i]);
    }

    try {
      const response = await api.put(`/tasks/${projectId}/t/${taskId}`, formData);
      setTask(response.data.data);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload attachments");
    } finally {
      setIsUploadingAttachment(false);
      e.target.value = "";
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-[640px] h-full bg-surface-container-lowest shadow-elevated animate-in slide-in-from-right duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="h-[64px] border-b border-stone-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-stone-400 text-[20px]">task</span>
            <span className="text-stone-500 font-medium text-sm">
              TASK-{taskId.slice(-6).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-stone-100 hover:text-stone-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-stone-100 hover:text-stone-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>
            <div className="w-[1px] h-4 bg-stone-200 mx-1"></div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-error-container text-error rounded-lg text-sm font-medium">
              {error}
            </div>
          ) : task ? (
            <>
              {/* Title and Status */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  {isEditingTitle && canEdit ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1 headline-lg px-2 py-1 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none"
                        disabled={isSaving}
                      />
                      <button 
                        onClick={handleSaveTitle}
                        disabled={isSaving}
                        className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 text-sm font-medium shrink-0 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <h2 
                      className={`headline-lg text-stone-900 flex-1 ${canEdit ? 'cursor-pointer hover:bg-stone-50 rounded px-2 -ml-2 py-1 transition-colors' : ''}`}
                      onClick={() => canEdit && setIsEditingTitle(true)}
                      title={canEdit ? "Click to edit" : ""}
                    >
                      {task.title}
                    </h2>
                  )}
                </div>
                
                <div className="inline-flex">
                  <span className="bg-stone-100 text-stone-600 rounded-full px-3 py-1 label-md flex items-center gap-2 cursor-pointer hover:bg-stone-200 transition-colors">
                    <span className={`w-2 h-2 rounded-full ${
                      task.status === 'done' ? 'bg-success-green' : 
                      task.status === 'in_progress' ? 'bg-stone-900' : 'bg-stone-300'
                    }`}></span>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 p-4 rounded-xl border border-stone-100 bg-stone-50/50">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Assignee</span>
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <>
                        <div className="w-6 h-6 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden">
                          {task.assignedTo.avatar?.url ? (
                            <img src={task.assignedTo.avatar.url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-medium text-stone-600 uppercase">
                              {task.assignedTo.fullName?.charAt(0) || task.assignedTo.username?.charAt(0) || "U"}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-stone-900">
                          {task.assignedTo.fullName || task.assignedTo.username}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-stone-500 italic">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Due Date</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-stone-600">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    </div>
                    {canEdit && isEditingDueDate ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={editedDueDate}
                          onChange={(e) => setEditedDueDate(e.target.value)}
                          className="px-2 py-1 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:bg-white focus:border-stone-900 outline-none"
                          disabled={isSaving}
                        />
                        <button
                          onClick={() => handleSaveDueDate(editedDueDate)}
                          disabled={isSaving}
                          className="px-2 py-1 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingDueDate(false);
                            setEditedDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
                          }}
                          disabled={isSaving}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div 
                        className={`flex items-center gap-1.5 ${canEdit ? 'cursor-pointer group hover:text-stone-900' : ''}`}
                        onClick={() => canEdit && setIsEditingDueDate(true)}
                        title={canEdit ? "Click to edit due date" : ""}
                      >
                        <span className="text-sm font-medium text-stone-900">
                          {task.dueDate 
                            ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : <span className="text-stone-400 italic">No due date</span>}
                        </span>
                        {canEdit && (
                          <span className="material-symbols-outlined text-[14px] text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            edit
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Project</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-stone-600">
                      <span className="material-symbols-outlined text-[14px]">folder</span>
                    </div>
                    <span className="text-sm font-medium text-stone-900">{projectName || "Unknown Project"}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="headline-sm text-stone-900">Description</h3>
                  {canEdit && !isEditingDesc && (
                    <button 
                      onClick={() => setIsEditingDesc(true)}
                      className="text-xs font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingDesc && canEdit ? (
                  <div className="flex flex-col gap-3">
                    <textarea
                      autoFocus
                      rows={4}
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none text-body-md resize-y"
                      disabled={isSaving}
                      placeholder="Add a more detailed description..."
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setIsEditingDesc(false);
                          setEditedDesc(task.description || "");
                        }}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded text-sm font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveDesc}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-stone-900 text-white rounded hover:bg-stone-800 text-sm font-medium disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`body-md text-stone-600 whitespace-pre-wrap min-h-[60px] ${!task.description ? 'italic text-stone-400' : ''}`}
                    onClick={() => { if (canEdit && !task.description) setIsEditingDesc(true); }}
                  >
                    {task.description || (canEdit ? "Click to add a description..." : "No description provided.")}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="headline-sm text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">checklist</span>
                    Subtasks
                  </h3>
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                      {task.subtasks.filter(st => st.isCompleted).length} / {task.subtasks.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {task.subtasks && task.subtasks.map((subtask) => (
                    <div key={subtask._id} className="flex items-center gap-3 group px-2 py-1.5 hover:bg-stone-50 rounded-lg transition-colors">
                      <button 
                        onClick={() => handleToggleSubtask(subtask._id, subtask.isCompleted)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          subtask.isCompleted ? "bg-success-green border-success-green text-white" : "border-stone-300 hover:border-stone-900 bg-white"
                        }`}
                      >
                        {subtask.isCompleted && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                      </button>
                      <span className={`body-md flex-1 ${subtask.isCompleted ? "text-stone-400 line-through" : "text-stone-900"}`}>
                        {subtask.title}
                      </span>
                      {canEdit && (
                        <button 
                          onClick={() => handleDeleteSubtask(subtask._id)}
                          className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-error hover:bg-error-container rounded opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          title="Delete subtask"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Subtask Row */}
                  {canEdit && (
                    isAddingSubtask ? (
                      <form onSubmit={handleAddSubtask} className="mt-2 ml-8 flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="What needs to be done?"
                          className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none text-sm"
                          disabled={isSubmittingSubtask}
                        />
                        <button 
                          type="button"
                          onClick={() => setIsAddingSubtask(false)}
                          disabled={isSubmittingSubtask}
                          className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded text-xs font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmittingSubtask || !newSubtaskTitle.trim()}
                          className="px-3 py-1.5 bg-stone-900 text-white rounded hover:bg-stone-800 text-xs font-medium disabled:opacity-50"
                        >
                          Add
                        </button>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setIsAddingSubtask(true)}
                        className="mt-2 ml-8 text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors self-start"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add subtask...
                      </button>
                    )
                  )}
                  {!canEdit && (!task.subtasks || task.subtasks.length === 0) && (
                    <div className="text-sm italic text-stone-400 pl-8">No subtasks found.</div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="headline-sm text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">attachment</span>
                    Attachments
                  </h3>
                  {canEdit && (
                    <div>
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        id={`upload-attachment-${taskId}`}
                        onChange={handleUploadAttachments}
                        disabled={isUploadingAttachment}
                      />
                      <label 
                        htmlFor={`upload-attachment-${taskId}`}
                        className={`text-xs font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors ${isUploadingAttachment ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{isUploadingAttachment ? 'hourglass_empty' : 'upload_file'}</span>
                        {isUploadingAttachment ? 'Uploading...' : 'Add attachment'}
                      </label>
                    </div>
                  )}
                </div>
                {task.attachments && task.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {task.attachments.map((file) => (
                      <div key={file._id} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 bg-stone-50 group hover:border-stone-300 transition-colors">
                        <div className="w-10 h-10 rounded bg-white border border-stone-100 flex items-center justify-center shrink-0 text-stone-400">
                          <span className="material-symbols-outlined">draft</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className="text-sm font-medium text-stone-900 truncate">
                            Attachment_{file._id.slice(-4)}
                          </span>
                          <span className="text-xs text-stone-500">Document</span>
                        </div>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-900 transition-colors opacity-0 group-hover:opacity-100"
                          title="Download"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm italic text-stone-400 pl-2">No attachments found.</div>
                )}
              </div>

            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
