"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-stone-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-[20px]">dashboard</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">CollabSphere</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-sm shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 md:px-12 flex flex-col items-center text-center max-w-[1200px] mx-auto overflow-hidden">

          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full -z-10 pointer-events-none opacity-40 mix-blend-multiply">
            <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-blue-100 rounded-full blur-3xl"></div>
            <div className="absolute top-[40%] right-[20%] w-80 h-80 bg-orange-50 rounded-full blur-3xl"></div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-sm font-medium text-stone-600 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            CollabSphere 1.0 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-stone-900 tracking-tight mb-6 max-w-4xl leading-[1.1]">
            Project management, <span className="text-stone-500">without the noise.</span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mb-12 leading-relaxed">
            A minimalist workspace for your team to organize projects, track tasks, and collaborate with role-based precision. Get more done, beautifully.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all active:scale-[0.98] font-semibold text-base shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2"
            >
              Start for free
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-stone-200 text-stone-900 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-colors font-semibold text-base flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>

          {/* Dashboard Preview Image */}
          <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl shadow-stone-900/10 border border-stone-200 p-2 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
            <div className="bg-stone-100 rounded-xl overflow-hidden aspect-[16/10] relative flex items-center justify-center">
              {/* Fallback layout in case image isn't named exactly right */}
              <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

              <img
                src="/dashboard.png"
                alt="CollabSphere Dashboard Preview"
                className="w-full h-full object-cover rounded-lg z-10 relative shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback message if image is missing */}
              <div className="hidden absolute inset-0 flex-col items-center justify-center text-stone-400 z-20 bg-stone-100">
                <span className="material-symbols-outlined text-4xl mb-2">image</span>
                <p className="font-medium">Please rename your image to 'dashboard-preview.png' and place it in the frontend/public folder.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-white px-6 md:px-12 border-t border-stone-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Everything you need to ship faster</h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">CollabSphere provides a focused toolkit designed to keep teams aligned without the overwhelming complexity of traditional tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center mb-6 text-stone-900 shadow-sm">
                  <span className="material-symbols-outlined">folder_open</span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Organize projects</h3>
                <p className="text-stone-600 leading-relaxed">
                  Keep all your work neatly organized in dedicated projects with clean, distraction-free interfaces.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center mb-6 text-stone-900 shadow-sm">
                  <span className="material-symbols-outlined">checklist</span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Track tasks & subtasks</h3>
                <p className="text-stone-600 leading-relaxed">
                  Move work seamlessly across boards with nested subtasks for granular tracking and progress monitoring.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center mb-6 text-stone-900 shadow-sm">
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Role-based access</h3>
                <p className="text-stone-600 leading-relaxed">
                  Control access effortlessly with a tiered permission system, ensuring the right people see the right things.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 bg-stone-900 text-stone-400 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-semibold text-white">CollabSphere</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} CollabSphere. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
