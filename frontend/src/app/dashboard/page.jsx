"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "../../components/layout/PageShell";
import api from "../../lib/api";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import { useSearch } from "../../context/SearchContext";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/projects");
      setProjects(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const { searchQuery, setIsSearchable } = useSearch();

  useEffect(() => {
    setIsSearchable(true);
    return () => setIsSearchable(false);
  }, [setIsSearchable]);

  const filteredProjects = projects.filter(p => 
    p.project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageShell title="Projects Dashboard" onOpenCreateProject={() => setIsModalOpen(true)}>
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchProjects();
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="headline-lg text-stone-900">Projects</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Project
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-error rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-stone-500 label-md">Loading projects...</div>
      ) : projects.length === 0 ? (
        // Empty state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full h-[180px] bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-900 hover:border-stone-300 hover:bg-white transition-all group"
          >
            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">add_circle</span>
            <span className="font-medium text-sm">Create new project</span>
          </button>
        </div>
      ) : (
        // Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredProjects.map(({ project, role }) => (
            <Link 
              key={project._id} 
              href={`/projects/${project._id}`}
              className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-card border border-transparent hover:border-stone-300 transition-colors flex flex-col h-[200px]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                  <span className="material-symbols-outlined">folder_open</span>
                </div>
                {role && (
                  <div className="bg-stone-100 text-stone-600 rounded-full px-3 py-1 label-md flex items-center gap-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div>
                    {role.replace('_', ' ')}
                  </div>
                )}
              </div>
              <h3 className="headline-sm text-stone-900 mb-2 truncate">{project.name}</h3>
              <p className="body-md text-stone-600 line-clamp-2 flex-1">
                {project.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="label-md text-stone-500">
                  {project.members > 0 ? `${project.members} member${project.members !== 1 ? 's' : ''}` : 'No members'}
                </div>
                <div className="text-sm font-medium text-stone-900 hover:underline flex items-center gap-1">
                  View Details
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
          {filteredProjects.length === 0 && projects.length > 0 && (
            <div className="col-span-full py-8 text-center text-stone-500">
              No projects match your search.
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
