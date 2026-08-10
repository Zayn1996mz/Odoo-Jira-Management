"use client";

import { useState } from "react";

type ViewType = "kanban" | "task-form" | "project-list" | "doc-space" | "doc-editor" | "sprint" | "dashboard";

export default function OdooPreview() {
  const [activeView, setActiveView] = useState<ViewType>("kanban");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const views: { id: ViewType; label: string; icon: string }[] = [
    { id: "kanban", label: "Task Kanban Board", icon: "📋" },
    { id: "task-form", label: "Task Form View", icon: "📝" },
    { id: "project-list", label: "Project List", icon: "📁" },
    { id: "doc-space", label: "Document Spaces", icon: "📚" },
    { id: "doc-editor", label: "Document Editor", icon: "✏️" },
    { id: "sprint", label: "Sprint Board", icon: "🏃" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Odoo 16 Module Preview</h1>
            <p className="text-purple-200 text-sm">See how your module will look when installed</p>
          </div>
          <a
            href="/"
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            ← Back to Generator
          </a>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activeView === view.id
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{view.icon}</span>
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Odoo-style Frame */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Odoo Top Bar */}
          <div className="bg-[#714B67] text-white flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <span className="font-semibold">Project Board</span>
              </div>
              <nav className="flex gap-1 ml-6">
                <span className="px-3 py-1 bg-white/20 rounded text-sm">Board</span>
                <span className="px-3 py-1 hover:bg-white/10 rounded text-sm cursor-pointer">Documents</span>
                <span className="px-3 py-1 hover:bg-white/10 rounded text-sm cursor-pointer">Configuration</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded px-3 py-1 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search...
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                AD
              </div>
            </div>
          </div>

          {/* Odoo Sub-header */}
          <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="font-semibold text-gray-800">
                {views.find(v => v.id === activeView)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-[#714B67] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#5d3d55]">
                + New
              </button>
              <div className="flex border rounded overflow-hidden">
                <button className={`px-3 py-1 text-sm ${activeView === 'kanban' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button className="px-3 py-1 text-sm hover:bg-gray-100 border-l">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="3" rx="1" />
                    <rect x="3" y="10" width="18" height="3" rx="1" />
                    <rect x="3" y="16" width="18" height="3" rx="1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex min-h-[600px]">
            {/* Sidebar */}
            {sidebarOpen && (
              <div className="w-64 bg-gray-50 border-r p-4 flex-shrink-0">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filters</div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked /> My Tasks
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" /> Unassigned
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" /> High Priority
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" /> Overdue
                  </label>
                </div>
                <div className="mt-6 space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Group By</div>
                  <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">Stage</button>
                  <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">Assignee</button>
                  <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">Project</button>
                  <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">Priority</button>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              {activeView === "kanban" && <KanbanView />}
              {activeView === "task-form" && <TaskFormView />}
              {activeView === "project-list" && <ProjectListView />}
              {activeView === "doc-space" && <DocSpaceView />}
              {activeView === "doc-editor" && <DocEditorView />}
              {activeView === "sprint" && <SprintView />}
              {activeView === "dashboard" && <DashboardView />}
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-gray-500 text-sm mt-4">
          This is a preview mockup. Actual appearance may vary slightly based on your Odoo theme.
        </p>
      </div>
    </div>
  );
}

/* ============ KANBAN VIEW ============ */
interface KanbanTask {
  id: string;
  title: string;
  type: string;
  priority: number;
  assignee: string;
  sp: number;
  blocked?: boolean;
  done?: boolean;
}

interface KanbanStage {
  name: string;
  color: string;
  tasks: KanbanTask[];
}

function KanbanView() {
  const stages: KanbanStage[] = [
    { name: "Backlog", color: "border-gray-300", tasks: [
      { id: "PRJ-12", title: "Setup CI/CD pipeline", type: "task", priority: 1, assignee: "JD", sp: 5 },
      { id: "PRJ-15", title: "Write unit tests", type: "task", priority: 0, assignee: "MK", sp: 3 },
    ]},
    { name: "To Do", color: "border-blue-400", tasks: [
      { id: "PRJ-8", title: "Login page not loading on mobile", type: "bug", priority: 3, assignee: "AS", sp: 5, blocked: true },
      { id: "PRJ-11", title: "Add dark mode support", type: "feature", priority: 2, assignee: "JD", sp: 8 },
    ]},
    { name: "In Progress", color: "border-yellow-400", tasks: [
      { id: "PRJ-5", title: "Implement user dashboard", type: "feature", priority: 2, assignee: "MK", sp: 13 },
      { id: "PRJ-9", title: "Optimize database queries", type: "improvement", priority: 1, assignee: "AS", sp: 5 },
    ]},
    { name: "In Review", color: "border-purple-400", tasks: [
      { id: "PRJ-3", title: "API documentation", type: "task", priority: 1, assignee: "JD", sp: 3, done: true },
    ]},
    { name: "Done", color: "border-green-400", tasks: [
      { id: "PRJ-1", title: "Project setup", type: "task", priority: 1, assignee: "MK", sp: 2, done: true },
      { id: "PRJ-2", title: "Database schema design", type: "task", priority: 2, assignee: "AS", sp: 5, done: true },
    ]},
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug": return "🐛";
      case "feature": return "✨";
      case "improvement": return "📈";
      case "epic": return "🎯";
      default: return "📋";
    }
  };

  const getPriorityStars = (p: number) => "★".repeat(p + 1) + "☆".repeat(3 - p);

  const getAssigneeColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="flex gap-4 p-4 overflow-x-auto min-h-full bg-gray-100">
      {stages.map((stage) => (
        <div key={stage.name} className="w-72 flex-shrink-0">
          <div className={`border-t-4 ${stage.color} bg-white rounded-t-lg px-3 py-2 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{stage.name}</span>
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{stage.tasks.length}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="bg-gray-200/50 rounded-b-lg p-2 space-y-2 min-h-[400px]">
            {stage.tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${
                  task.blocked ? "border-l-red-500" : task.done ? "border-l-green-500" : "border-l-[#714B67]"
                } p-3 cursor-pointer hover:shadow-md transition group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{getTypeIcon(task.type)} {task.type}</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{task.sp} SP</span>
                  </div>
                  <button className="text-gray-300 group-hover:text-gray-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="18" r="2" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-2">{task.title}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-xs">{getPriorityStars(task.priority)}</span>
                    <span className="text-xs text-gray-400">{task.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {task.blocked && <span className="w-2 h-2 bg-red-500 rounded-full" title="Blocked"></span>}
                    {task.done && <span className="w-2 h-2 bg-green-500 rounded-full" title="Ready"></span>}
                    <div className={`w-7 h-7 ${getAssigneeColor(task.assignee)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                      {task.assignee}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm hover:border-gray-400 hover:text-gray-500 transition">
              + Add Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ TASK FORM VIEW ============ */
function TaskFormView() {
  return (
    <div className="p-6 bg-white">
      {/* Status Bar */}
      <div className="flex items-center gap-2 mb-6">
        <span className="px-4 py-1 bg-gray-200 rounded-full text-sm font-medium">Backlog</span>
        <span className="text-gray-300">→</span>
        <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">To Do</span>
        <span className="text-gray-300">→</span>
        <span className="px-4 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium border-2 border-yellow-400">In Progress</span>
        <span className="text-gray-300">→</span>
        <span className="px-4 py-1 bg-gray-200 rounded-full text-sm font-medium">In Review</span>
        <span className="text-gray-300">→</span>
        <span className="px-4 py-1 bg-gray-200 rounded-full text-sm font-medium">Done</span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Implement user dashboard redesign</h1>
        <span className="text-sm text-gray-500">PRJ-5</span>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Project</label>
          <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
            <span className="bg-[#714B67] text-white text-xs px-2 py-0.5 rounded">PRJ</span>
            <span>Main Project</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
          <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
            <span>✨</span>
            <span>Feature</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Assignee</label>
          <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">MK</div>
            <span>Mitchell Admin</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Reviewer</label>
          <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">JD</div>
            <span>John Doe</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
          <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
            <span className="text-yellow-500">★★★☆</span>
            <span>High</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Sprint</label>
          <div className="p-2 border rounded bg-gray-50">Sprint 12</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
          <div className="p-2 border rounded bg-gray-50">2024-01-15</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Deadline</label>
          <div className="p-2 border rounded bg-gray-50 text-red-600">2024-01-25 ⚠️</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Story Points</label>
          <div className="p-2 border rounded bg-gray-50">13</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Kanban State</label>
          <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
            <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
            <span>In Progress</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Progress</label>
          <div className="p-2 border rounded bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-[#714B67] h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <span className="text-sm text-gray-600">65%</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Tags</label>
          <div className="flex gap-1 p-2 border rounded bg-gray-50">
            <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded">frontend</span>
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded">ux</span>
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">v2.0</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          <button className="px-4 py-2 border-b-2 border-[#714B67] text-[#714B67] font-medium">Description</button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">Subtasks (3)</button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">Time Logs</button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">Documents</button>
        </nav>
      </div>

      {/* Description */}
      <div className="py-4">
        <div className="prose max-w-none">
          <p>Redesign the user dashboard to improve usability and add new widgets:</p>
          <ul>
            <li>Add quick action buttons</li>
            <li>Implement drag-and-drop widget arrangement</li>
            <li>Add data visualization charts</li>
            <li>Improve mobile responsiveness</li>
          </ul>
        </div>
      </div>

      {/* Chatter */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold text-gray-800 mb-3">Activity</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">MK</div>
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">Mitchell Admin</span>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <p className="text-sm text-gray-600">Updated the progress to 65%</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">JD</div>
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">John Doe</span>
                <span className="text-xs text-gray-400">yesterday</span>
              </div>
              <p className="text-sm text-gray-600">Added a code review comment. Looking good so far! 👍</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ PROJECT LIST VIEW ============ */
function ProjectListView() {
  const projects = [
    { code: "PRJ", name: "Main Project", manager: "Mitchell Admin", tasks: 24, progress: 65, start: "2024-01-01", end: "2024-03-31" },
    { code: "WEB", name: "Website Redesign", manager: "John Doe", tasks: 18, progress: 40, start: "2024-02-01", end: "2024-04-15" },
    { code: "API", name: "API Integration", manager: "Alice Smith", tasks: 12, progress: 85, start: "2023-12-01", end: "2024-02-28" },
    { code: "MOB", name: "Mobile App", manager: "Bob Wilson", tasks: 32, progress: 20, start: "2024-01-15", end: "2024-06-30" },
  ];

  return (
    <div className="p-4">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Code</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Project Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Manager</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tasks</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Progress</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Start Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">End Date</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.code} className="border-b hover:bg-gray-50 cursor-pointer">
              <td className="py-3 px-4">
                <span className="bg-[#714B67] text-white text-xs px-2 py-1 rounded font-mono">{project.code}</span>
              </td>
              <td className="py-3 px-4 font-medium text-gray-800">{project.name}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {project.manager.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="text-sm text-gray-600">{project.manager}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="bg-gray-100 px-2 py-1 rounded text-sm">{project.tasks}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#714B67] h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{project.progress}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{project.start}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{project.end}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============ DOCUMENT SPACE VIEW ============ */
function DocSpaceView() {
  const spaces = [
    { name: "General", key: "GEN", icon: "📖", docs: 24, desc: "General documentation and guides", color: "border-blue-400" },
    { name: "Technical", key: "TECH", icon: "⚙️", docs: 42, desc: "Technical documentation and APIs", color: "border-green-400" },
    { name: "Product", key: "PROD", icon: "🚀", docs: 18, desc: "Product requirements and roadmap", color: "border-purple-400" },
    { name: "Team", key: "TEAM", icon: "👥", docs: 12, desc: "Team processes and onboarding", color: "border-orange-400" },
  ];

  const recentDocs = [
    { title: "Getting Started Guide", space: "General", type: "page", views: 342, updated: "2 hours ago", author: "MK" },
    { title: "API Authentication", space: "Technical", type: "page", views: 128, updated: "yesterday", author: "JD" },
    { title: "Sprint 12 Planning", space: "General", type: "meeting", views: 45, updated: "3 days ago", author: "AS" },
    { title: "Database Schema v2", space: "Technical", type: "decision", views: 89, updated: "1 week ago", author: "MK" },
  ];

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Document Spaces</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {spaces.map((space) => (
          <div key={space.key} className={`bg-white rounded-lg border-l-4 ${space.color} p-4 cursor-pointer hover:shadow-md transition`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{space.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{space.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">{space.key}</span>
                </div>
              </div>
              <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">{space.docs} docs</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{space.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">📄 Recent Documents</h2>
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Space</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Views</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Updated</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Author</th>
            </tr>
          </thead>
          <tbody>
            {recentDocs.map((doc, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 cursor-pointer">
                <td className="py-3 px-4 font-medium text-[#714B67]">{doc.title}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{doc.space}</td>
                <td className="py-3 px-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {doc.type === "page" ? "📄" : doc.type === "meeting" ? "📅" : "⚖️"} {doc.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">👁 {doc.views}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{doc.updated}</td>
                <td className="py-3 px-4">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {doc.author}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ DOCUMENT EDITOR VIEW ============ */
function DocEditorView() {
  return (
    <div className="flex h-full">
      {/* Sidebar - Page Tree */}
      <div className="w-64 bg-gray-50 border-r p-4 flex-shrink-0">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pages in General</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#714B67]/10 text-[#714B67] rounded font-medium text-sm">
            <span>📄</span> Getting Started
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm text-gray-700 cursor-pointer">
            <span>📄</span> Installation Guide
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm text-gray-700 cursor-pointer">
            <span>📁</span> Tutorials
          </div>
          <div className="pl-4 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-sm text-gray-600 cursor-pointer">
              <span>📄</span> Quick Start
            </div>
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-sm text-gray-600 cursor-pointer">
              <span>📄</span> Advanced Usage
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm text-gray-700 cursor-pointer">
            <span>❓</span> FAQ
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6">
        {/* Document Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Getting Started Guide</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>General</span>
                <span>•</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Published</span>
                <span>•</span>
                <span>👁 342 views</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded">⭐</button>
            <button className="p-2 hover:bg-gray-100 rounded">📌</button>
            <button className="bg-[#714B67] text-white px-4 py-2 rounded text-sm font-medium">Edit</button>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white border rounded-lg p-6 prose max-w-none">
          <h2>Welcome to Project Board! 👋</h2>
          <p>
            This guide will help you get started with the Project Board module. Follow these steps to set up your first project.
          </p>

          <h3>Step 1: Create a Project</h3>
          <p>
            Navigate to <strong>Board → Projects</strong> and click the <code>+ New</code> button. Fill in the project details:
          </p>
          <ul>
            <li><strong>Project Name:</strong> Your project title</li>
            <li><strong>Project Key:</strong> A short code (e.g., PRJ, WEB)</li>
            <li><strong>Manager:</strong> The project lead</li>
          </ul>

          <h3>Step 2: Add Team Members</h3>
          <p>
            In the project form, add team members who will be working on tasks. They will be available for task assignment.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
            <strong>💡 Tip:</strong> You can also link a Document Space to your project for better documentation organization.
          </div>

          <h3>Step 3: Create Tasks</h3>
          <p>
            Go to <strong>Board → Tasks</strong> to see the Kanban board. Click <code>+ Add Task</code> in any column to create a new task.
          </p>

          <table className="table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Task Type</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">📋 Task</td>
                <td className="border border-gray-300 px-4 py-2">General work item</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">🐛 Bug</td>
                <td className="border border-gray-300 px-4 py-2">Something that needs fixing</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">✨ Feature</td>
                <td className="border border-gray-300 px-4 py-2">New functionality</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Version History */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Last edited by <strong>Mitchell Admin</strong> • 2 hours ago</span>
            <button className="text-[#714B67] hover:underline">View history (8 versions)</button>
          </div>
          <div className="flex items-center gap-2">
            <span>Labels:</span>
            <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded">onboarding</span>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">getting-started</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ SPRINT VIEW ============ */
function SprintView() {
  return (
    <div className="p-6">
      {/* Sprint Header */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">Sprint 12</h2>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Active</span>
            </div>
            <p className="text-gray-500 mt-1">Jan 15 - Jan 29, 2024 • Main Project</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">8</div>
              <div className="text-xs text-gray-500">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#714B67]">34</div>
              <div className="text-xs text-gray-500">Story Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">21</div>
              <div className="text-xs text-gray-500">Velocity</div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">62%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-[#714B67] h-3 rounded-full" style={{ width: "62%" }}></div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">🎯 Sprint Goal</div>
          <p className="text-sm text-gray-600">Complete user dashboard redesign and deploy to staging environment.</p>
        </div>
      </div>

      {/* Sprint Tasks */}
      <h3 className="font-semibold text-gray-800 mb-3">Sprint Tasks</h3>
      <div className="bg-white border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Task</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Assignee</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Priority</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stage</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">SP</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: "PRJ-5", title: "Implement user dashboard", assignee: "MK", priority: "High", stage: "In Progress", sp: 13 },
              { id: "PRJ-8", title: "Fix login bug", assignee: "AS", priority: "Critical", stage: "To Do", sp: 5 },
              { id: "PRJ-9", title: "Optimize queries", assignee: "AS", priority: "Normal", stage: "In Progress", sp: 5 },
              { id: "PRJ-11", title: "Dark mode support", assignee: "JD", priority: "High", stage: "To Do", sp: 8 },
              { id: "PRJ-3", title: "API documentation", assignee: "JD", priority: "Normal", stage: "Done", sp: 3 },
            ].map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <span className="text-xs text-gray-400 mr-2">{task.id}</span>
                  <span className="font-medium text-gray-800">{task.title}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {task.assignee}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === "Critical" ? "bg-red-100 text-red-700" :
                    task.priority === "High" ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>{task.priority}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.stage === "Done" ? "bg-green-100 text-green-700" :
                    task.stage === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{task.stage}</span>
                </td>
                <td className="py-3 px-4 font-medium">{task.sp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ DASHBOARD VIEW ============ */
function DashboardView() {
  return (
    <div className="p-6 bg-gray-50">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tasks", value: "86", icon: "📋", change: "+12 this week" },
          { label: "In Progress", value: "18", icon: "🔄", change: "5 overdue" },
          { label: "Completed", value: "54", icon: "✅", change: "+8 this week" },
          { label: "Story Points", value: "234", icon: "🎯", change: "Velocity: 42/sprint" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
            </div>
            <div className="mt-2">
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Tasks by Stage Chart */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Tasks by Stage</h3>
          <div className="space-y-3">
            {[
              { stage: "Backlog", count: 12, color: "bg-gray-400", width: "15%" },
              { stage: "To Do", count: 18, color: "bg-blue-500", width: "22%" },
              { stage: "In Progress", count: 14, color: "bg-yellow-500", width: "17%" },
              { stage: "In Review", count: 8, color: "bg-purple-500", width: "10%" },
              { stage: "Done", count: 34, color: "bg-green-500", width: "42%" },
            ].map((item) => (
              <div key={item.stage} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600">{item.stage}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div className={`${item.color} h-full rounded-full flex items-center justify-end pr-2`} style={{ width: item.width }}>
                    <span className="text-xs text-white font-medium">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by Type Chart */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Tasks by Type</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#714B67" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="25" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="85" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="65" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="15 85" strokeDashoffset="40" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">86</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#714B67] rounded"></span>
                <span className="text-sm text-gray-600">Tasks (40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded"></span>
                <span className="text-sm text-gray-600">Features (25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded"></span>
                <span className="text-sm text-gray-600">Bugs (20%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded"></span>
                <span className="text-sm text-gray-600">Improvements (15%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Team Workload</h3>
          <div className="space-y-3">
            {[
              { name: "Mitchell Admin", initials: "MA", tasks: 12, sp: 45 },
              { name: "John Doe", initials: "JD", tasks: 8, sp: 32 },
              { name: "Alice Smith", initials: "AS", tasks: 10, sp: 38 },
              { name: "Bob Wilson", initials: "BW", tasks: 6, sp: 24 },
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#714B67] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {member.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{member.name}</span>
                    <span className="text-xs text-gray-500">{member.tasks} tasks • {member.sp} SP</span>
                  </div>
                  <div className="mt-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-[#714B67] h-2 rounded-full" style={{ width: `${(member.sp / 50) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { user: "MA", action: "completed", target: "PRJ-5 Implement dashboard", time: "2 hours ago" },
              { user: "JD", action: "commented on", target: "PRJ-8 Login bug", time: "3 hours ago" },
              { user: "AS", action: "moved", target: "PRJ-9 to In Progress", time: "5 hours ago" },
              { user: "BW", action: "created", target: "PRJ-15 New feature", time: "yesterday" },
              { user: "MA", action: "published", target: "API Documentation", time: "yesterday" },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                  {activity.user}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">{activity.action}</span>{" "}
                  <span className="font-medium text-gray-800">{activity.target}</span>
                  <div className="text-xs text-gray-400">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
