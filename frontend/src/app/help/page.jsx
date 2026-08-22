import PageShell from "../../components/layout/PageShell";
import Link from "next/link";

export default function HelpPage() {
  return (
    <PageShell title="Help & Support">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="headline-lg text-stone-900 mb-6">Help & Support</h1>
        
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-stone-200 mb-8">
          <h2 className="headline-sm text-stone-900 mb-4">About CollabSphere</h2>
          <p className="body-md text-stone-600 mb-4 leading-relaxed">
            CollabSphere is a project management tool designed to cut through the noise. 
            We focus on providing a clean, distraction-free environment for you and your team to track tasks, share notes, and collaborate effectively.
          </p>
          <p className="body-md text-stone-600 leading-relaxed">
            Use the Kanban board to track task progress, the timeline to see upcoming deadlines, and project notes to capture important context and decisions.
          </p>
        </div>

        <h2 className="headline-sm text-stone-900 mb-6">Frequently Asked Questions</h2>
        
        <div className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
            <h3 className="text-base font-semibold text-stone-900 mb-2">How do I invite team members?</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Navigate to a project and click on the "Members" tab. From there, if you are an Admin or Project Admin, you can click "Add Member" and search for existing users to add to your project.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
            <h3 className="text-base font-semibold text-stone-900 mb-2">What are the different roles?</h3>
            <ul className="text-sm text-stone-600 leading-relaxed list-disc pl-5 flex flex-col gap-1">
              <li><strong>Admin</strong>: Can manage members, tasks, and project settings.</li>
              <li><strong>Project Admin</strong>: Can manage members and tasks.</li>
              <li><strong>Member</strong>: Can view the project, add notes, and complete tasks.</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
            <h3 className="text-base font-semibold text-stone-900 mb-2">How can I see all my assigned work?</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Check the <Link href="/my-tasks" className="text-stone-900 underline font-medium">My Tasks</Link> page from the sidebar. It aggregates all tasks assigned to you across all your projects in one place.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-stone-500">
            Need more help? Contact your workspace administrator.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
