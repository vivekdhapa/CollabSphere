"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ onOpenCreateProject }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "My Tasks", href: "/my-tasks", icon: "task" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  return (
    <div className="hidden md:flex flex-col w-[260px] fixed top-0 left-0 h-full bg-stone-100 border-r border-stone-200 z-20">
      <div className="p-base flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[18px]">dashboard</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="headline-md leading-none text-stone-900 truncate">CollabSphere</span>
            <span className="label-md text-stone-600 mt-1 truncate">Pro Workspace</span>
          </div>
        </div>

        {/* Create Project Button */}
        <div className="px-2">
          <button 
            onClick={() => onOpenCreateProject && onOpenCreateProject()}
            className="w-full py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Project
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-stone-200 border-l-2 border-stone-900 font-medium text-stone-900" 
                    : "text-stone-600 hover:bg-stone-200"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'icon-fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-base border-t border-stone-200">
        <nav className="flex flex-col gap-1 px-2">
          <Link href="/help" className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="text-sm">Help</span>
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors w-full text-left">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm">Sign Out</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
