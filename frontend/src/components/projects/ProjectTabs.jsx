import Link from 'next/link';

export default function ProjectTabs({ projectId, activeTab }) {
  const tabs = [
    { name: "Overview", path: `/projects/${projectId}/overview` },
    { name: "Board", path: `/projects/${projectId}` },
    { name: "Timeline", path: `/projects/${projectId}/timeline` },
    { name: "Members", path: `/projects/${projectId}/members` },
    { name: "Notes", path: `/projects/${projectId}/notes` },
  ];

  return (
    <div className="flex items-center gap-4 ml-4">
      {tabs.map((tab) => (
        <Link 
          key={tab.name}
          href={tab.path}
          className={`text-sm transition-colors block ${
            tab.name === activeTab 
              ? "text-stone-900 font-semibold border-b-2 border-stone-900 pb-[22px] pt-[24px] -mb-[24px]" 
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          {tab.name}
        </Link>
      ))}
    </div>
  );
}
