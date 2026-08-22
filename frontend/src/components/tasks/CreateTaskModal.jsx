"use client";

import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function CreateTaskModal({ isOpen, onClose, onSuccess, projectId, projectMembers = [] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [attachments, setAttachments] = useState([]);
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      
      if (assignedTo) {
        formData.append("assignedTo", assignedTo);
      }
      
      if (status) {
        formData.append("status", status);
      }

      if (dueDate) {
        formData.append("dueDate", new Date(dueDate).toISOString());
      }
      
      if (attachments.length > 0) {
        // Backend expects upload.array("attachments", 5)
        attachments.slice(0, 5).forEach((file) => {
          formData.append("attachments", file);
        });
      }

      await api.post(`/tasks/${projectId}`, formData);
      
      // Reset form
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setStatus("todo");
      setDueDate("");
      setAttachments([]);
      onSuccess(); // Triggers refetch in dashboard and closes modal
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-elevated p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4 text-stone-900">
            <span className="material-symbols-outlined text-[20px]">task</span>
          </div>
          <h2 className="headline-md text-stone-900">Create New Task</h2>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-container text-error rounded text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="taskTitle">Task Title *</label>
            <input
              id="taskTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
              placeholder="E.g., Design homepage hero section"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="taskDesc">Description (Optional)</label>
            <textarea
              id="taskDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md resize-none"
              placeholder="Add more details about this task..."
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="label-md text-stone-900" htmlFor="taskStatus">Status</label>
              <select
                id="taskStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
                disabled={isLoading}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-md text-stone-900" htmlFor="taskDueDate">Due Date (Optional)</label>
              <input
                id="taskDueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md text-stone-900"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="taskAssignee">Assignee (Optional)</label>
            <select
              id="taskAssignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
              disabled={isLoading}
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.fullName || member.user.username}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="taskAttachments">Attachments (Max 5)</label>
            <input
              id="taskAttachments"
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full text-body-md text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-stone-100 file:text-stone-900 hover:file:bg-stone-200 transition-all cursor-pointer"
              disabled={isLoading}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            {attachments.length > 5 && (
              <span className="text-xs text-error mt-1">Only the first 5 files will be uploaded.</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-sm flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

