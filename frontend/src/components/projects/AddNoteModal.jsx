"use client";

import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function AddNoteModal({ isOpen, onClose, onSuccess, projectId }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError("Note content is required");
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post(`/notes/${projectId}`, { 
        content: content.trim() 
      });
      setContent("");
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-elevated p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4 text-stone-900">
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
          </div>
          <h2 className="headline-md text-stone-900">Add Project Note</h2>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-container text-error rounded text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="noteContent">Note Content *</label>
            <textarea
              id="noteContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md resize-y"
              placeholder="Write your note here..."
              disabled={isLoading}
            />
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
              {isLoading ? "Posting..." : "Post Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
