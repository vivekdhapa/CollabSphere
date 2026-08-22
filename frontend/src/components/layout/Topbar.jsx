"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";

export default function Topbar({ title = "Overview", showAddTask = false, isAddTaskEnabled = true, onAddTask }) {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery, isSearchable } = useSearch();
  
  return (
    <div className="h-[64px] bg-stone-50 border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2 text-stone-600 text-sm font-medium">
        {title}
      </div>
      
      <div className="flex items-center gap-4">
        {isSearchable && (
          <div className="relative flex items-center">
            <span className="material-symbols-outlined text-[20px] text-stone-400 absolute left-3">search</span>
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-sm outline-none focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all w-[200px] sm:w-[260px]"
            />
          </div>
        )}
        {showAddTask && (
          <button 
            onClick={onAddTask}
            disabled={!isAddTaskEnabled}
            className="px-3 py-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-xs hidden sm:block disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Add Task
          </button>
        )}
        <Link href="/settings" className="w-8 h-8 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0 hover:border-stone-400 transition-colors">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user.fullName || "User"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-stone-600 uppercase">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
