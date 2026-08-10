"use client";

import { useState } from "react";

type Section = "overview" | "workflow" | "roles" | "storypoints" | "sprints" | "kanban" | "documents" | "access";

export default function HelpGuide() {
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "🎯" },
    { id: "workflow", label: "Agile Workflow", icon: "🔄" },
    { id: "roles", label: "Scrum Roles", icon: "👥" },
    { id: "storypoints", label: "Story Points", icon: "🎲" },
    { id: "sprints", label: "Sprints", icon: "🏃" },
    { id: "kanban", label: "Kanban Board", icon: "📋" },
    { id: "documents", label: "Documentation", icon: "📚" },
    { id: "access", label: "Access Rights", icon: "🔐" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Agile & Scrum Guide</h1>
                <p className="text-xs text-blue-300">Complete workflow and role documentation</p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
            >
              ← Back to Generator
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <nav className="w-64 flex-shrink-0">
            <div className="sticky top-6 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                    activeSection === section.id
                      ? "bg-purple-500/20 border border-purple-500/30 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeSection === "overview" && <OverviewSection />}
            {activeSection === "workflow" && <WorkflowSection />}
            {activeSection === "roles" && <RolesSection />}
            {activeSection === "storypoints" && <StoryPointsSection />}
            {activeSection === "sprints" && <SprintsSection />}
            {activeSection === "kanban" && <KanbanSection />}
            {activeSection === "documents" && <DocumentsSection />}
            {activeSection === "access" && <AccessRightsSection />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ============ OVERVIEW SECTION ============ */
function OverviewSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🎯 Jira-Zain Module Overview</h2>
        <p className="text-white/70 mb-6">
          Jira-Zain is a complete Agile Project Management solution for Odoo 16, combining the best features of 
          <strong className="text-purple-300"> Jira</strong> (task management), 
          <strong className="text-blue-300"> Trello</strong> (Kanban boards), and 
          <strong className="text-green-300"> Confluence</strong> (documentation).
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <h3 className="font-bold text-white mb-2">📋 Project Management</h3>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Kanban board with drag & drop</li>
              <li>• Sprint planning & tracking</li>
              <li>• Story points & velocity</li>
              <li>• Time logging</li>
              <li>• Subtasks & checklists</li>
            </ul>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h3 className="font-bold text-white mb-2">📚 Documentation</h3>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Wiki-style pages</li>
              <li>• Document spaces</li>
              <li>• Version history</li>
              <li>• Templates</li>
              <li>• Link docs to tasks</li>
            </ul>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h3 className="font-bold text-white mb-2">👥 Team Collaboration</h3>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Role-based access</li>
              <li>• Activity tracking</li>
              <li>• Comments & mentions</li>
              <li>• Email notifications</li>
              <li>• Dashboard analytics</li>
            </ul>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <h3 className="font-bold text-white mb-2">🔐 Access Control</h3>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Scrum Master role</li>
              <li>• Product Owner role</li>
              <li>• Project Manager role</li>
              <li>• Team Member role</li>
              <li>• Custom permissions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Start Workflow</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { step: "1", label: "Create Project", icon: "📁" },
            { step: "2", label: "Add Team", icon: "👥" },
            { step: "3", label: "Plan Sprint", icon: "📅" },
            { step: "4", label: "Create Tasks", icon: "📋" },
            { step: "5", label: "Work & Track", icon: "⚡" },
            { step: "6", label: "Review & Ship", icon: "🚀" },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center">
              <div className="flex flex-col items-center px-4 py-2 bg-white/5 rounded-xl min-w-[100px]">
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs text-white/50">Step {item.step}</span>
                <span className="text-sm font-medium text-white">{item.label}</span>
              </div>
              {idx < 5 && <span className="text-white/30 mx-2">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ WORKFLOW SECTION ============ */
function WorkflowSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🔄 Agile Workflow</h2>
        <p className="text-white/70 mb-6">
          The Agile workflow in Jira-Zain follows Scrum methodology with iterative development cycles called Sprints.
        </p>

        {/* Workflow Diagram */}
        <div className="bg-black/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Complete Sprint Cycle</h3>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {[
              { phase: "Product Backlog", desc: "All features & requirements", color: "bg-blue-500", icon: "📝" },
              { phase: "Sprint Planning", desc: "Select items for sprint", color: "bg-purple-500", icon: "📅" },
              { phase: "Sprint Backlog", desc: "Committed work items", color: "bg-indigo-500", icon: "📋" },
              { phase: "Daily Standups", desc: "15-min sync meetings", color: "bg-cyan-500", icon: "🗣️" },
              { phase: "Development", desc: "Build & test features", color: "bg-green-500", icon: "⚡" },
              { phase: "Sprint Review", desc: "Demo to stakeholders", color: "bg-yellow-500", icon: "👁️" },
              { phase: "Retrospective", desc: "Improve process", color: "bg-orange-500", icon: "🔄" },
            ].map((item, idx) => (
              <div key={item.phase} className="flex items-center">
                <div className={`${item.color} rounded-xl p-4 text-center min-w-[140px]`}>
                  <span className="text-2xl block mb-1">{item.icon}</span>
                  <span className="font-bold text-white text-sm block">{item.phase}</span>
                  <span className="text-white/70 text-xs">{item.desc}</span>
                </div>
                {idx < 6 && <span className="text-white/30 mx-2 text-2xl">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">📋 Detailed Workflow Steps</h3>
          
          {[
            {
              title: "1. Product Backlog Grooming",
              who: "Product Owner",
              what: "Create and prioritize user stories, features, and bugs in the backlog. Each item should have clear acceptance criteria.",
              odoo: "Go to Tasks → Create new tasks with type, priority, and story points"
            },
            {
              title: "2. Sprint Planning",
              who: "Scrum Master + Team",
              what: "Select items from backlog for the upcoming sprint based on team velocity. Set sprint goal.",
              odoo: "Create Sprint → Add tasks to sprint → Set start/end dates"
            },
            {
              title: "3. Daily Work",
              who: "Development Team",
              what: "Move tasks across Kanban board stages. Log time spent. Update progress.",
              odoo: "Drag tasks in Kanban view → Log time in task form"
            },
            {
              title: "4. Sprint Review",
              who: "All Stakeholders",
              what: "Demo completed work. Get feedback. Update backlog based on feedback.",
              odoo: "Filter tasks by sprint → Show completed items → Create follow-up tasks"
            },
            {
              title: "5. Sprint Retrospective",
              who: "Scrum Team",
              what: "Discuss what went well, what didn't, and improvements for next sprint.",
              odoo: "Create Meeting Notes document → Link action items to tasks"
            },
          ].map((step) => (
            <div key={step.title} className="bg-white/5 rounded-xl p-4">
              <h4 className="font-bold text-white mb-2">{step.title}</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-purple-300 font-medium">Who:</span>
                  <p className="text-white/70">{step.who}</p>
                </div>
                <div>
                  <span className="text-blue-300 font-medium">What:</span>
                  <p className="text-white/70">{step.what}</p>
                </div>
                <div>
                  <span className="text-green-300 font-medium">In Odoo:</span>
                  <p className="text-white/70">{step.odoo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ ROLES SECTION ============ */
function RolesSection() {
  const roles = [
    {
      name: "Product Owner",
      icon: "👔",
      color: "from-blue-500 to-blue-600",
      responsibilities: [
        "Defines product vision and roadmap",
        "Manages and prioritizes product backlog",
        "Writes user stories and acceptance criteria",
        "Makes decisions on features and scope",
        "Represents stakeholders and customers",
        "Accepts or rejects completed work",
      ],
      permissions: [
        "Full access to all projects",
        "Create/edit/delete backlog items",
        "Manage priorities and roadmap",
        "View all reports and dashboards",
        "Manage document spaces",
      ],
      odooGroup: "jira_zain.group_product_owner",
    },
    {
      name: "Scrum Master",
      icon: "🎯",
      color: "from-purple-500 to-purple-600",
      responsibilities: [
        "Facilitates Scrum ceremonies",
        "Removes impediments for the team",
        "Coaches team on Agile practices",
        "Protects team from distractions",
        "Tracks sprint progress and velocity",
        "Facilitates retrospectives",
      ],
      permissions: [
        "Manage sprints (create/start/complete)",
        "Edit all tasks in assigned projects",
        "View and manage team capacity",
        "Access all project reports",
        "Configure project stages",
      ],
      odooGroup: "jira_zain.group_scrum_master",
    },
    {
      name: "Project Manager",
      icon: "📊",
      color: "from-green-500 to-green-600",
      responsibilities: [
        "Plans project timeline and milestones",
        "Manages project resources and budget",
        "Coordinates with stakeholders",
        "Tracks project health and risks",
        "Reports to leadership",
        "Manages project team members",
      ],
      permissions: [
        "Full access to assigned projects",
        "Manage project settings and team",
        "Create and manage sprints",
        "View all project analytics",
        "Manage project documents",
      ],
      odooGroup: "jira_zain.group_project_manager",
    },
    {
      name: "Team Member",
      icon: "👨‍💻",
      color: "from-cyan-500 to-cyan-600",
      responsibilities: [
        "Implements user stories and tasks",
        "Estimates effort for backlog items",
        "Participates in daily standups",
        "Updates task progress and status",
        "Reviews peers' code/work",
        "Logs time spent on tasks",
      ],
      permissions: [
        "View assigned projects and tasks",
        "Edit tasks assigned to them",
        "Log time on tasks",
        "Create subtasks",
        "Add comments and attachments",
      ],
      odooGroup: "jira_zain.group_team_member",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">👥 Scrum Roles & Responsibilities</h2>
        <p className="text-white/70 mb-6">
          The module includes four pre-defined security groups that map to Scrum roles. 
          Each role has specific permissions tailored to their responsibilities.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role.name} className="bg-white/5 rounded-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${role.color} p-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{role.icon}</span>
                  <div>
                    <h3 className="font-bold text-white text-lg">{role.name}</h3>
                    <code className="text-xs text-white/70">{role.odooGroup}</code>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-2">Responsibilities</h4>
                  <ul className="text-sm text-white/60 space-y-1">
                    {role.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-2">Permissions</h4>
                  <ul className="text-sm text-white/60 space-y-1">
                    {role.permissions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400">🔑</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Hierarchy */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 Role Hierarchy</h3>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">👔</div>
            <span className="text-white font-medium">Product Owner</span>
            <div className="text-xs text-white/50">Highest access</div>
          </div>
          <span className="text-white/30 text-2xl">≥</span>
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">🎯</div>
            <span className="text-white font-medium">Scrum Master</span>
          </div>
          <span className="text-white/30 text-2xl">≥</span>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">📊</div>
            <span className="text-white font-medium">Project Manager</span>
          </div>
          <span className="text-white/30 text-2xl">≥</span>
          <div className="text-center">
            <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">👨‍💻</div>
            <span className="text-white font-medium">Team Member</span>
            <div className="text-xs text-white/50">Base access</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ STORY POINTS SECTION ============ */
function StoryPointsSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🎲 What are Story Points?</h2>
        <p className="text-white/70 mb-6">
          Story Points are a unit of measure for expressing the overall <strong className="text-purple-300">effort</strong> required 
          to fully implement a task or user story. They consider complexity, risk, and uncertainty—not just time.
        </p>

        {/* Why Story Points */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-white mb-3">❓ Why Use Story Points Instead of Hours?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-red-300 font-medium mb-2">❌ Problems with Hours</h4>
              <ul className="text-white/70 space-y-1">
                <li>• Different people work at different speeds</li>
                <li>• Pressure to underestimate</li>
                <li>• Doesn't account for complexity</li>
                <li>• Creates blame for "wrong" estimates</li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-300 font-medium mb-2">✅ Benefits of Story Points</h4>
              <ul className="text-white/70 space-y-1">
                <li>• Team consensus on effort</li>
                <li>• Accounts for complexity & risk</li>
                <li>• Consistent over time</li>
                <li>• Enables velocity tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fibonacci Scale */}
        <h3 className="text-lg font-bold text-white mb-4">📏 The Fibonacci Scale</h3>
        <p className="text-white/70 mb-4">
          Story Points typically use the Fibonacci sequence because the gaps between numbers grow larger, 
          reflecting increasing uncertainty for bigger tasks.
        </p>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
          {[
            { points: 1, label: "Trivial", color: "bg-green-500", example: "Fix typo" },
            { points: 2, label: "Small", color: "bg-green-400", example: "Update button text" },
            { points: 3, label: "Medium-Small", color: "bg-yellow-400", example: "Add form field" },
            { points: 5, label: "Medium", color: "bg-yellow-500", example: "New API endpoint" },
            { points: 8, label: "Medium-Large", color: "bg-orange-400", example: "New feature" },
            { points: 13, label: "Large", color: "bg-orange-500", example: "Complex feature" },
            { points: 21, label: "Very Large", color: "bg-red-400", example: "Major module" },
            { points: 34, label: "Epic", color: "bg-red-500", example: "Split this!" },
          ].map((item) => (
            <div key={item.points} className="text-center">
              <div className={`${item.color} rounded-xl py-4 px-2 mb-2`}>
                <span className="text-2xl font-bold text-white">{item.points}</span>
              </div>
              <div className="text-xs font-medium text-white">{item.label}</div>
              <div className="text-xs text-white/50">{item.example}</div>
            </div>
          ))}
        </div>

        {/* How to Estimate */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-white mb-3">🎯 How to Estimate Story Points</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded font-bold">1</span>
              <div>
                <strong className="text-white">Pick a Reference Story</strong>
                <p className="text-white/70 text-sm">Choose a well-understood task as your "3-point" baseline</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded font-bold">2</span>
              <div>
                <strong className="text-white">Compare Relatively</strong>
                <p className="text-white/70 text-sm">"Is this bigger or smaller than our reference?"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded font-bold">3</span>
              <div>
                <strong className="text-white">Consider All Factors</strong>
                <p className="text-white/70 text-sm">Complexity + Risk + Uncertainty + Testing effort</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded font-bold">4</span>
              <div>
                <strong className="text-white">Team Consensus</strong>
                <p className="text-white/70 text-sm">Use Planning Poker: everyone votes, discuss differences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Velocity */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">📈 Velocity = Story Points / Sprint</h3>
          <p className="text-white/70 text-sm mb-3">
            Track how many story points your team completes per sprint. Use this to plan future sprints.
          </p>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="flex items-end gap-2 h-32">
              {[28, 32, 30, 35, 33, 38].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(v / 40) * 100}%` }}
                  ></div>
                  <span className="text-xs text-white/50 mt-1">S{i + 1}</span>
                  <span className="text-xs text-white font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-2 text-sm text-white/70">
              Average Velocity: <strong className="text-green-400">33 SP/Sprint</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ SPRINTS SECTION ============ */
function SprintsSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🏃 Sprint Management</h2>
        <p className="text-white/70 mb-6">
          A Sprint is a time-boxed iteration (usually 1-4 weeks) where the team commits to completing a set of work items.
        </p>

        {/* Sprint Anatomy */}
        <div className="bg-black/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">📅 Anatomy of a Sprint</h3>
          <div className="relative">
            <div className="h-4 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full mb-4"></div>
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-1"></div>
                <strong className="text-blue-300">Day 1</strong>
                <p className="text-white/50 text-xs">Sprint Planning</p>
                <p className="text-white/50 text-xs">2-4 hours</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
                <strong className="text-green-300">Days 2-9</strong>
                <p className="text-white/50 text-xs">Development</p>
                <p className="text-white/50 text-xs">Daily Standups</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mx-auto mb-1"></div>
                <strong className="text-purple-300">Day 10</strong>
                <p className="text-white/50 text-xs">Review + Retro</p>
                <p className="text-white/50 text-xs">2-3 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sprint States */}
        <h3 className="text-lg font-bold text-white mb-4">🔄 Sprint States in Odoo</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            { state: "Planning", color: "bg-gray-500", icon: "📝", desc: "Sprint is being planned, tasks being added" },
            { state: "Active", color: "bg-green-500", icon: "▶️", desc: "Sprint is in progress, team is working" },
            { state: "Completed", color: "bg-blue-500", icon: "✅", desc: "Sprint ended, velocity calculated" },
          ].map((s) => (
            <div key={s.state} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`${s.color} text-white text-xs px-2 py-1 rounded`}>{s.state}</span>
                <span className="text-xl">{s.icon}</span>
              </div>
              <p className="text-sm text-white/70">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* How to Manage Sprints */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">📋 Managing Sprints in Jira-Zain</h3>
          <div className="space-y-3">
            {[
              { step: "Create Sprint", action: "Board → Sprints → New", detail: "Set name, dates, and sprint goal" },
              { step: "Add Tasks", action: "Edit Sprint → Tasks tab", detail: "Select tasks from backlog or drag in Kanban" },
              { step: "Start Sprint", action: "Click 'Start Sprint' button", detail: "Locks the sprint backlog" },
              { step: "Track Progress", action: "Sprint form shows progress", detail: "See velocity and burndown" },
              { step: "Complete Sprint", action: "Click 'Complete Sprint'", detail: "Unfinished tasks go back to backlog" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="bg-blue-500 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                <div>
                  <strong className="text-white">{item.step}</strong>
                  <span className="text-cyan-300 text-sm ml-2">({item.action})</span>
                  <p className="text-white/60 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ KANBAN SECTION ============ */
function KanbanSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">📋 Kanban Board</h2>
        <p className="text-white/70 mb-6">
          The Kanban board provides a visual representation of work flowing through your process.
          Tasks move from left to right as they progress through stages.
        </p>

        {/* Board Preview */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 overflow-x-auto">
          <div className="flex gap-4 min-w-[800px]">
            {[
              { name: "Backlog", color: "border-gray-400", tasks: ["PRJ-12", "PRJ-15"] },
              { name: "To Do", color: "border-blue-400", tasks: ["PRJ-8", "PRJ-11"] },
              { name: "In Progress", color: "border-yellow-400", tasks: ["PRJ-5"] },
              { name: "In Review", color: "border-purple-400", tasks: ["PRJ-3"] },
              { name: "Done", color: "border-green-400", tasks: ["PRJ-1", "PRJ-2"] },
            ].map((stage) => (
              <div key={stage.name} className="w-40 flex-shrink-0">
                <div className={`border-t-4 ${stage.color} bg-gray-700 rounded-t px-2 py-1`}>
                  <span className="text-white text-sm font-medium">{stage.name}</span>
                  <span className="text-gray-400 text-xs ml-1">({stage.tasks.length})</span>
                </div>
                <div className="bg-gray-600/50 rounded-b p-2 space-y-2 min-h-[100px]">
                  {stage.tasks.map((task) => (
                    <div key={task} className="bg-white rounded p-2 text-xs text-gray-800 shadow">
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Descriptions */}
        <h3 className="text-lg font-bold text-white mb-4">📊 Default Stages Explained</h3>
        <div className="space-y-3">
          {[
            { name: "Backlog", icon: "📝", desc: "All tasks not yet planned for a sprint. The 'parking lot' for ideas and future work." },
            { name: "To Do", icon: "📋", desc: "Tasks planned for current sprint but not yet started. Ready to be picked up." },
            { name: "In Progress", icon: "⚡", desc: "Tasks actively being worked on. Limit WIP (Work In Progress) here!" },
            { name: "In Review", icon: "👁️", desc: "Work completed, waiting for code review, testing, or approval." },
            { name: "Done", icon: "✅", desc: "Tasks fully completed and accepted. No more work needed." },
          ].map((stage) => (
            <div key={stage.name} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-2xl">{stage.icon}</span>
              <div>
                <strong className="text-white">{stage.name}</strong>
                <p className="text-white/60 text-sm">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban Tips */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">💡 Kanban Best Practices</h3>
          <ul className="text-sm text-white/70 space-y-2">
            <li>✓ <strong>Limit WIP:</strong> Don't have too many tasks "In Progress" at once (2-3 per person max)</li>
            <li>✓ <strong>Pull, Don't Push:</strong> Team members pull tasks when ready, not assigned randomly</li>
            <li>✓ <strong>Visualize Blockers:</strong> Use the "Blocked" kanban state to highlight stuck items</li>
            <li>✓ <strong>Daily Updates:</strong> Move your tasks every day during standup</li>
            <li>✓ <strong>Definition of Done:</strong> Everyone agrees what "Done" means before moving tasks there</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ============ DOCUMENTS SECTION ============ */
function DocumentsSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">📚 Document Management</h2>
        <p className="text-white/70 mb-6">
          Like Confluence, the document system provides wiki-style pages organized into spaces for team knowledge management.
        </p>

        {/* Document Structure */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <span className="text-3xl block mb-2">📚</span>
            <h3 className="font-bold text-white">Spaces</h3>
            <p className="text-sm text-white/70">Top-level containers (e.g., "Engineering", "Product", "HR")</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <span className="text-3xl block mb-2">🗂️</span>
            <h3 className="font-bold text-white">Categories</h3>
            <p className="text-sm text-white/70">Organize documents within a space (e.g., "Guides", "API Docs")</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <span className="text-3xl block mb-2">📄</span>
            <h3 className="font-bold text-white">Documents</h3>
            <p className="text-sm text-white/70">Individual wiki pages with rich content</p>
          </div>
        </div>

        {/* Document Types */}
        <h3 className="text-lg font-bold text-white mb-4">📝 Document Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { type: "Page", icon: "📄", use: "General documentation" },
            { type: "Blog", icon: "📝", use: "Team updates & news" },
            { type: "Meeting Notes", icon: "📅", use: "Meeting minutes & actions" },
            { type: "Decision Record", icon: "⚖️", use: "Architecture decisions" },
            { type: "How-To Guide", icon: "📖", use: "Step-by-step tutorials" },
            { type: "FAQ", icon: "❓", use: "Common questions" },
            { type: "Requirement", icon: "📋", use: "Product requirements" },
            { type: "Runbook", icon: "🔧", use: "Operational procedures" },
          ].map((doc) => (
            <div key={doc.type} className="bg-white/5 rounded-lg p-3 text-center">
              <span className="text-2xl block mb-1">{doc.icon}</span>
              <strong className="text-white text-sm">{doc.type}</strong>
              <p className="text-xs text-white/50">{doc.use}</p>
            </div>
          ))}
        </div>

        {/* Link to Tasks */}
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">🔗 Link Documents to Tasks</h3>
          <p className="text-white/70 text-sm mb-3">
            Documents can be linked to tasks to provide context, requirements, or technical specs.
          </p>
          <div className="bg-black/30 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded">Task PRJ-5</span>
              <span className="text-white">Implement user dashboard</span>
            </div>
            <div className="text-white/60 ml-4">
              📎 Related Documents:
              <ul className="ml-4 text-cyan-300">
                <li>• Dashboard Design Specs</li>
                <li>• API Documentation</li>
                <li>• User Stories</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ ACCESS RIGHTS SECTION ============ */
function AccessRightsSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🔐 Access Rights Configuration</h2>
        <p className="text-white/70 mb-6">
          The module creates security groups that integrate with Odoo's existing user management. 
          Assign users to groups to control their access level.
        </p>

        {/* How to Assign Roles */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-white mb-3">📋 How to Assign Roles in Odoo</h3>
          <div className="space-y-3">
            {[
              { step: "Go to Settings → Users & Companies → Users" },
              { step: "Select the user you want to configure" },
              { step: "Scroll down to 'Jira-Zain' section" },
              { step: "Select the appropriate role from dropdown" },
              { step: "Save the user record" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="bg-green-500 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                <span className="text-white/80">{item.step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <h3 className="text-lg font-bold text-white mb-4">📊 Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 px-3 text-white/70">Permission</th>
                <th className="text-center py-2 px-3 text-blue-300">Product Owner</th>
                <th className="text-center py-2 px-3 text-purple-300">Scrum Master</th>
                <th className="text-center py-2 px-3 text-green-300">Project Manager</th>
                <th className="text-center py-2 px-3 text-cyan-300">Team Member</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {[
                { perm: "View all projects", po: "✅", sm: "✅", pm: "✅", tm: "👁️" },
                { perm: "Create projects", po: "✅", sm: "❌", pm: "✅", tm: "❌" },
                { perm: "Edit project settings", po: "✅", sm: "✅", pm: "✅", tm: "❌" },
                { perm: "Delete projects", po: "✅", sm: "❌", pm: "❌", tm: "❌" },
                { perm: "Create tasks", po: "✅", sm: "✅", pm: "✅", tm: "✅" },
                { perm: "Edit any task", po: "✅", sm: "✅", pm: "✅", tm: "❌" },
                { perm: "Edit own tasks", po: "✅", sm: "✅", pm: "✅", tm: "✅" },
                { perm: "Delete tasks", po: "✅", sm: "✅", pm: "✅", tm: "❌" },
                { perm: "Manage sprints", po: "✅", sm: "✅", pm: "✅", tm: "❌" },
                { perm: "Start/complete sprints", po: "✅", sm: "✅", pm: "❌", tm: "❌" },
                { perm: "Log time", po: "✅", sm: "✅", pm: "✅", tm: "✅" },
                { perm: "View reports", po: "✅", sm: "✅", pm: "✅", tm: "👁️" },
                { perm: "Manage doc spaces", po: "✅", sm: "✅", pm: "✅", tm: "❌" },
                { perm: "Edit documents", po: "✅", sm: "✅", pm: "✅", tm: "✅" },
                { perm: "Configure stages", po: "✅", sm: "✅", pm: "❌", tm: "❌" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-2 px-3">{row.perm}</td>
                  <td className="text-center py-2 px-3">{row.po}</td>
                  <td className="text-center py-2 px-3">{row.sm}</td>
                  <td className="text-center py-2 px-3">{row.pm}</td>
                  <td className="text-center py-2 px-3">{row.tm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/50 mt-2">✅ = Full access | 👁️ = View only (own/assigned) | ❌ = No access</p>

        {/* Code Reference */}
        <div className="mt-6 bg-black/30 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">🔧 Technical Reference</h3>
          <p className="text-white/60 text-sm mb-3">Security groups are defined in <code className="bg-black/50 px-1 rounded">security/</code> folder:</p>
          <pre className="text-xs text-green-300 overflow-x-auto">
{`# security/security_groups.xml
<record id="group_team_member" model="res.groups">
    <field name="name">Team Member</field>
    <field name="category_id" ref="module_category_jira_zain"/>
</record>

<record id="group_project_manager" model="res.groups">
    <field name="name">Project Manager</field>
    <field name="implied_ids" eval="[(4, ref('group_team_member'))]"/>
</record>

<record id="group_scrum_master" model="res.groups">
    <field name="name">Scrum Master</field>
    <field name="implied_ids" eval="[(4, ref('group_project_manager'))]"/>
</record>

<record id="group_product_owner" model="res.groups">
    <field name="name">Product Owner</field>
    <field name="implied_ids" eval="[(4, ref('group_scrum_master'))]"/>
</record>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
