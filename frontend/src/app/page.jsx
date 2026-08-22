"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="h-[64px] bg-stone-50 border-b border-stone-100 flex items-center justify-between px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">dashboard</span>
          </div>
          <span className="headline-md">CollabSphere</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 bg-white border border-stone-200 text-stone-900 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-colors font-medium text-sm"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop flex flex-col items-center text-center max-w-container-max mx-auto">
          <h1 className="headline-lg-mobile md:headline-lg text-stone-900 mb-6">
            Project management, without the noise.
          </h1>
          <p className="body-lg text-stone-600 max-w-[600px] mb-10">
            A quiet workspace for your team to organize projects, track tasks, manage subtasks, and collaborate with role-based precision.
          </p>
          <div className="flex items-center gap-4 mb-16">
            <Link 
              href="/register" 
              className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-base"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3 bg-white border border-stone-200 text-stone-900 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-colors font-medium text-base"
            >
              Sign In
            </Link>
          </div>

          {/* Kanban mockup placeholder */}
          <div className="w-full max-w-4xl bg-surface-container-lowest rounded-xl shadow-ambient-card border border-stone-200 p-2 md:p-4 aspect-video flex flex-col mx-auto">
            <div className="h-8 border-b border-stone-100 flex items-center px-4 gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-stone-200"></div>
              <div className="w-3 h-3 rounded-full bg-stone-200"></div>
              <div className="w-3 h-3 rounded-full bg-stone-200"></div>
            </div>
            <div className="flex-1 flex gap-gutter px-2 pb-2 overflow-hidden opacity-50">
              <div className="flex-1 bg-stone-50 rounded border border-stone-100 flex flex-col gap-2 p-2">
                <div className="h-4 bg-stone-200 rounded w-1/3 mb-2"></div>
                <div className="h-16 bg-white rounded border border-stone-200 shadow-sm"></div>
                <div className="h-16 bg-white rounded border border-stone-200 shadow-sm"></div>
              </div>
              <div className="flex-1 bg-stone-50 rounded border border-stone-100 flex flex-col gap-2 p-2">
                <div className="h-4 bg-stone-200 rounded w-1/3 mb-2"></div>
                <div className="h-16 bg-white rounded border border-stone-200 shadow-sm"></div>
              </div>
              <div className="flex-1 bg-stone-50 rounded border border-stone-100 flex flex-col gap-2 p-2 hidden sm:flex">
                <div className="h-4 bg-stone-200 rounded w-1/3 mb-2"></div>
                <div className="h-16 bg-white rounded border border-stone-200 shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-white px-margin-mobile md:px-margin-desktop">
          <div className="max-w-[1024px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-card border border-transparent hover:border-stone-300 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center mb-4 text-stone-900">
                <span className="material-symbols-outlined">folder_open</span>
              </div>
              <h3 className="headline-sm text-stone-900 mb-2">Organize projects</h3>
              <p className="body-md text-stone-600 flex-1">
                Keep all your work neatly organized in projects with role-based team access.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-card border border-transparent hover:border-stone-300 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center mb-4 text-stone-900">
                <span className="material-symbols-outlined">checklist</span>
              </div>
              <h3 className="headline-sm text-stone-900 mb-2">Track tasks & subtasks</h3>
              <p className="body-md text-stone-600 flex-1">
                Move work across Todo, In Progress, and Done boards with nested subtasks for granular tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-card border border-transparent hover:border-stone-300 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center mb-4 text-stone-900">
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </div>
              <h3 className="headline-sm text-stone-900 mb-2">Role-based permissions</h3>
              <p className="body-md text-stone-600 flex-1">
                Control access effortlessly with a three-tier Admin, Project Admin, and Member permission system.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-stone-50 border-t border-stone-100 px-margin-mobile md:px-margin-desktop flex items-center justify-between">
        <div className="label-md text-stone-500">
          © CollabSphere {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-4 label-md text-stone-500">
          <Link href="/login" className="hover:text-stone-900 transition-colors">Sign In</Link>
          <Link href="/register" className="hover:text-stone-900 transition-colors">Get Started</Link>
        </div>
      </footer>
    </div>
  );
}
