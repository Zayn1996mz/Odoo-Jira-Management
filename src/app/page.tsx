"use client";

import { useState, useCallback } from "react";

interface StageConfig {
  name: string;
  sequence: number;
  fold: boolean;
}

interface PriorityConfig {
  value: string;
  label: string;
}

interface ModuleConfig {
  moduleName: string;
  moduleTitle: string;
  moduleDescription: string;
  authorName: string;
  stages: StageConfig[];
  priorities: PriorityConfig[];
  enableTimelog: boolean;
  enableSprints: boolean;
  enableTags: boolean;
  enableAttachments: boolean;
  enableComments: boolean;
  enableSubtasks: boolean;
  // Document Manager
  enableDocuments: boolean;
  enableDocVersioning: boolean;
  enableDocTemplates: boolean;
}

const DEFAULT_CONFIG: ModuleConfig = {
  moduleName: "jira_zain",
  moduleTitle: "Jira-Zain",
  moduleDescription: "Jira/Trello-like Project Management with Confluence-style Docs",
  authorName: "Zain",
  stages: [
    { name: "Backlog", sequence: 1, fold: false },
    { name: "To Do", sequence: 2, fold: false },
    { name: "In Progress", sequence: 3, fold: false },
    { name: "In Review", sequence: 4, fold: false },
    { name: "Done", sequence: 5, fold: true },
  ],
  priorities: [
    { value: "0", label: "Low" },
    { value: "1", label: "Normal" },
    { value: "2", label: "High" },
    { value: "3", label: "Critical" },
  ],
  enableTimelog: true,
  enableSprints: true,
  enableTags: true,
  enableAttachments: true,
  enableComments: true,
  enableSubtasks: true,
  enableDocuments: true,
  enableDocVersioning: true,
  enableDocTemplates: true,
};

const SAMPLE_TASKS = [
  { title: "Setup project structure", type: "task", priority: "1", assignee: "AK", sp: 3, kanban: "done" },
  { title: "Login page not loading", type: "bug", priority: "3", assignee: "JS", sp: 5, kanban: "blocked" },
  { title: "Dark mode support", type: "feature", priority: "2", assignee: "MR", sp: 8, kanban: "normal" },
  { title: "Improve search speed", type: "improvement", priority: "1", assignee: "LP", sp: 3, kanban: "normal" },
  { title: "User dashboard redesign", type: "epic", priority: "2", assignee: "AK", sp: 13, kanban: "normal" },
  { title: "Fix email notifications", type: "bug", priority: "2", assignee: "JS", sp: 2, kanban: "normal" },
  { title: "API rate limiting", type: "feature", priority: "1", assignee: "MR", sp: 5, kanban: "done" },
  { title: "Update dependencies", type: "task", priority: "0", assignee: "LP", sp: 1, kanban: "normal" },
];

const SAMPLE_DOCS = [
  { title: "Getting Started Guide", type: "page", space: "General", status: "published", views: 342, icon: "📄" },
  { title: "API Documentation", type: "page", space: "Technical", status: "published", views: 128, icon: "📖" },
  { title: "Sprint 12 Planning", type: "meeting", space: "General", status: "published", views: 45, icon: "📅" },
  { title: "Architecture Decision: Database", type: "decision", space: "Technical", status: "draft", views: 12, icon: "⚖️" },
  { title: "How to Deploy to Production", type: "howto", space: "Technical", status: "published", views: 89, icon: "📖" },
  { title: "Frequently Asked Questions", type: "faq", space: "General", status: "published", views: 256, icon: "❓" },
  { title: "Incident Response Runbook", type: "runbook", space: "Technical", status: "published", views: 67, icon: "🔧" },
  { title: "New Feature Requirements", type: "requirement", space: "Product", status: "review", views: 23, icon: "📋" },
];

function getTypeEmoji(type: string) {
  switch (type) {
    case "bug": return "🐛";
    case "feature": return "✨";
    case "improvement": return "📈";
    case "epic": return "🎯";
    default: return "📋";
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "3": return "bg-red-500 text-white";
    case "2": return "bg-orange-500 text-white";
    case "1": return "bg-blue-500 text-white";
    default: return "bg-gray-400 text-white";
  }
}

function getKanbanDot(kanban: string) {
  switch (kanban) {
    case "done": return "bg-green-500";
    case "blocked": return "bg-red-500";
    default: return "bg-gray-400";
  }
}

function getDocStatusColor(status: string) {
  switch (status) {
    case "published": return "bg-green-500/20 text-green-300";
    case "draft": return "bg-blue-500/20 text-blue-300";
    case "review": return "bg-yellow-500/20 text-yellow-300";
    default: return "bg-gray-500/20 text-gray-300";
  }
}

export default function Home() {
  const [config, setConfig] = useState<ModuleConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"configure" | "board" | "docs" | "files">("configure");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const updateConfig = useCallback((updates: Partial<ModuleConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const addStage = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      stages: [
        ...prev.stages,
        { name: "New Stage", sequence: prev.stages.length + 1, fold: false },
      ],
    }));
  }, []);

  const removeStage = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index),
    }));
  }, []);

  const updateStage = useCallback((index: number, updates: Partial<StageConfig>) => {
    setConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((stage, i) => (i === index ? { ...stage, ...updates } : stage)),
    }));
  }, []);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error("Generation failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.moduleName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert("Failed to generate module. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [config]);

  const getTasksForStage = (stageIndex: number) => {
    return SAMPLE_TASKS.filter((_, i) => i % config.stages.length === stageIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="5" height="18" rx="1" />
                  <rect x="10" y="3" width="5" height="12" rx="1" />
                  <rect x="17" y="3" width="5" height="8" rx="1" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Odoo 16 Project Board Generator</h1>
                <p className="text-xs text-purple-300">Jira + Trello + Confluence for Odoo</p>
              </div>
              <a
                href="/preview"
                className="ml-4 flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Odoo Preview
              </a>
              <a
                href="/install"
                className="flex items-center gap-2 rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-2 text-sm text-green-300 hover:bg-green-500/30 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Install Guide
              </a>
              <a
                href="/guide"
                className="flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/30 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Help Guide
              </a>
            </div>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-lg transition-all ${
                downloadSuccess
                  ? "bg-green-500 text-white"
                  : isGenerating
                  ? "bg-gray-500 text-gray-300 cursor-wait"
                  : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 hover:shadow-xl hover:scale-105"
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  Generating...
                </>
              ) : downloadSuccess ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Downloaded!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Module (.zip)
                </>
              )}
            </button>
            <a
              href={`/api/download?name=${config.moduleName}&title=${encodeURIComponent(config.moduleTitle)}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
              download
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Direct Link
            </a>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {([
            { id: "configure", label: "⚙️ Configure" },
            { id: "board", label: "📋 Board Preview" },
            { id: "docs", label: "📖 Docs Preview" },
            { id: "files", label: "📁 File Structure" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white/15 text-white shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "configure" && (
          <ConfigurePanel
            config={config}
            updateConfig={updateConfig}
            addStage={addStage}
            removeStage={removeStage}
            updateStage={updateStage}
          />
        )}
        {activeTab === "board" && (
          <BoardPreviewPanel config={config} getTasksForStage={getTasksForStage} />
        )}
        {activeTab === "docs" && (
          <DocsPreviewPanel config={config} />
        )}
        {activeTab === "files" && (
          <FileStructurePanel config={config} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 mt-12">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-white/40">
            Generated modules are compatible with Odoo 16 Community & Enterprise.
            Copy the module folder to your addons path, update the apps list, and install.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =========== Configure Panel =========== */
function ConfigurePanel({
  config,
  updateConfig,
  addStage,
  removeStage,
  updateStage,
}: {
  config: ModuleConfig;
  updateConfig: (u: Partial<ModuleConfig>) => void;
  addStage: () => void;
  removeStage: (i: number) => void;
  updateStage: (i: number, u: Partial<StageConfig>) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Module Info */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">📦</span>
          Module Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Technical Name</label>
            <input
              type="text"
              value={config.moduleName}
              onChange={(e) => updateConfig({ moduleName: e.target.value.replace(/[^a-z0-9_]/g, "") })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
              placeholder="pm_board"
            />
            <p className="text-xs text-white/40 mt-1">Lowercase, no spaces. Used as folder name.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Display Title</label>
            <input
              type="text"
              value={config.moduleTitle}
              onChange={(e) => updateConfig({ moduleTitle: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
              placeholder="Project Board"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
            <input
              type="text"
              value={config.moduleDescription}
              onChange={(e) => updateConfig({ moduleDescription: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Author</label>
            <input
              type="text"
              value={config.authorName}
              onChange={(e) => updateConfig({ authorName: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Board Features */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">📋</span>
          Board Features (Jira/Trello)
        </h2>
        <div className="space-y-2">
          {[
            { key: "enableSprints" as const, label: "Sprint Management", desc: "Agile sprints with velocity", icon: "🏃" },
            { key: "enableTimelog" as const, label: "Time Logging", desc: "Track hours per task", icon: "⏱️" },
            { key: "enableTags" as const, label: "Tags / Labels", desc: "Categorize with colored tags", icon: "🏷️" },
            { key: "enableSubtasks" as const, label: "Subtasks / Checklists", desc: "Break into smaller items", icon: "✅" },
            { key: "enableComments" as const, label: "Comments & Activity", desc: "Discussions via mail.thread", icon: "💬" },
            { key: "enableAttachments" as const, label: "File Attachments", desc: "Attach documents to tasks", icon: "📎" },
          ].map(({ key, label, desc, icon }) => (
            <label
              key={key}
              className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition-all ${
                config[key] ? "bg-purple-500/10 border border-purple-500/30" : "bg-white/5 border border-white/10"
              }`}
            >
              <input
                type="checkbox"
                checked={config[key]}
                onChange={(e) => updateConfig({ [key]: e.target.checked })}
                className="sr-only"
              />
              <div className={`h-5 w-5 rounded flex items-center justify-center text-xs ${
                config[key] ? "bg-purple-500 text-white" : "bg-white/10 text-transparent"
              }`}>
                ✓
              </div>
              <span className="text-base">{icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-xs text-white/50 truncate">{desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Document Features */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">📖</span>
          Document Manager (Confluence)
        </h2>
        <div className="space-y-2">
          <label
            className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all ${
              config.enableDocuments ? "bg-blue-500/10 border border-blue-500/30" : "bg-white/5 border border-white/10"
            }`}
          >
            <input
              type="checkbox"
              checked={config.enableDocuments}
              onChange={(e) => updateConfig({ enableDocuments: e.target.checked })}
              className="sr-only"
            />
            <div className={`h-5 w-5 rounded flex items-center justify-center text-xs ${
              config.enableDocuments ? "bg-blue-500 text-white" : "bg-white/10 text-transparent"
            }`}>
              ✓
            </div>
            <span className="text-lg">📚</span>
            <div>
              <div className="text-sm font-medium text-white">Enable Document Manager</div>
              <div className="text-xs text-white/50">Wiki-style pages, spaces, categories</div>
            </div>
          </label>

          {config.enableDocuments && (
            <div className="pl-8 space-y-2 border-l-2 border-blue-500/20 ml-3">
              {[
                { key: "enableDocVersioning" as const, label: "Version History", desc: "Track changes & restore", icon: "📜" },
                { key: "enableDocTemplates" as const, label: "Document Templates", desc: "Meeting notes, ADR, runbook", icon: "📝" },
              ].map(({ key, label, desc, icon }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition-all ${
                    config[key] ? "bg-blue-500/10 border border-blue-500/30" : "bg-white/5 border border-white/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={config[key]}
                    onChange={(e) => updateConfig({ [key]: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`h-4 w-4 rounded flex items-center justify-center text-[10px] ${
                    config[key] ? "bg-blue-500 text-white" : "bg-white/10 text-transparent"
                  }`}>
                    ✓
                  </div>
                  <span className="text-sm">{icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-white/50">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {config.enableDocuments && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-white/70 mb-2">Document Types</h3>
            <div className="flex flex-wrap gap-2">
              {["📄 Page", "📝 Blog", "📅 Meeting", "⚖️ Decision", "📖 How-To", "❓ FAQ", "📋 Requirement", "🔧 Runbook"].map(type => (
                <span key={type} className="bg-white/10 rounded px-2 py-1 text-xs text-white/70">{type}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stages */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">📊</span>
            Kanban Stages
          </h2>
          <button
            onClick={addStage}
            className="flex items-center gap-1 rounded-lg bg-green-500/20 border border-green-500/30 px-3 py-1.5 text-sm text-green-400 hover:bg-green-500/30 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Stage
          </button>
        </div>
        <div className="space-y-2">
          {config.stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-2 group">
              <span className="text-xs font-mono text-white/40 w-5">#{index + 1}</span>
              <input
                type="text"
                value={stage.name}
                onChange={(e) => updateStage(index, { name: e.target.value })}
                className="flex-1 rounded bg-white/10 border border-white/20 px-2 py-1 text-sm text-white focus:border-purple-400 focus:outline-none"
              />
              <label className="flex items-center gap-1 text-xs text-white/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stage.fold}
                  onChange={(e) => updateStage(index, { fold: e.target.checked })}
                  className="rounded border-white/30 w-3 h-3"
                />
                Fold
              </label>
              {config.stages.length > 2 && (
                <button
                  onClick={() => removeStage(index)}
                  className="text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========== Board Preview Panel (Kanban) =========== */
function BoardPreviewPanel({
  config,
  getTasksForStage,
}: {
  config: ModuleConfig;
  getTasksForStage: (i: number) => typeof SAMPLE_TASKS;
}) {
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="bg-white/10 rounded-lg px-3 py-1">Search tasks...</span>
        </div>
        <div className="flex gap-2 ml-auto">
          <span className="bg-purple-500/20 text-purple-300 rounded-lg px-3 py-1 text-xs font-medium">My Tasks</span>
          <span className="bg-white/10 text-white/50 rounded-lg px-3 py-1 text-xs">Unassigned</span>
          <span className="bg-white/10 text-white/50 rounded-lg px-3 py-1 text-xs">Bugs</span>
          <span className="bg-orange-500/20 text-orange-300 rounded-lg px-3 py-1 text-xs font-medium">High Priority</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {config.stages.map((stage, stageIdx) => {
          const tasks = getTasksForStage(stageIdx);
          return (
            <div key={stageIdx} className="min-w-[280px] flex-shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">{stage.name}</h3>
                  <span className="bg-white/10 text-white/50 rounded-full px-2 py-0.5 text-xs">{tasks.length}</span>
                </div>
                <button className="text-white/30 hover:text-white/60">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {tasks.map((task, taskIdx) => (
                  <TaskCard key={taskIdx} task={task} config={config} />
                ))}
                <div className="rounded-xl border-2 border-dashed border-white/10 p-3 text-center text-xs text-white/30 hover:border-white/20 hover:text-white/50 cursor-pointer transition">
                  + Add Task
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-white/50">
        <span className="font-medium text-white/70">Task Types:</span>
        <span>📋 Task</span>
        <span>🐛 Bug</span>
        <span>✨ Feature</span>
        <span>📈 Improvement</span>
        <span>🎯 Epic</span>
        <span className="mx-2 text-white/20">|</span>
        <span className="font-medium text-white/70">Kanban State:</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400"></span> In Progress</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Ready</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> Blocked</span>
      </div>
    </div>
  );
}

function TaskCard({ task, config }: { task: typeof SAMPLE_TASKS[0]; config: ModuleConfig }) {
  return (
    <div className="rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/10 p-3 hover:bg-white/[0.1] hover:border-white/20 transition cursor-pointer group shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="bg-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/60">
            {getTypeEmoji(task.type)} {task.type}
          </span>
          <span className="bg-indigo-500/20 text-indigo-300 rounded px-1.5 py-0.5 text-[10px]">
            {task.sp} SP
          </span>
        </div>
        <button className="text-white/20 group-hover:text-white/50 transition">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
      <h4 className="text-sm font-medium text-white mb-2">{task.title}</h4>
      {config.enableTags && (
        <div className="flex gap-1 mb-2">
          <span className="bg-cyan-500/20 text-cyan-300 rounded px-1.5 py-0.5 text-[10px]">frontend</span>
          <span className="bg-amber-500/20 text-amber-300 rounded px-1.5 py-0.5 text-[10px]">v2.0</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(parseInt(task.priority) + 1)].map((_, i) => (
              <span key={i} className="text-xs text-yellow-400">★</span>
            ))}
          </div>
          <span className="bg-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/50">📅 Dec 15</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${getKanbanDot(task.kanban)}`}></span>
          <span className={`h-6 w-6 rounded-full ${getPriorityColor(task.priority)} flex items-center justify-center text-[10px] font-bold`}>
            {task.assignee}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========== Documents Preview Panel (Confluence-like) =========== */
function DocsPreviewPanel({ config }: { config: ModuleConfig }) {
  if (!config.enableDocuments) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📖</div>
        <h2 className="text-xl font-bold text-white mb-2">Document Manager Disabled</h2>
        <p className="text-white/50 mb-4">Enable the Document Manager feature in the Configure tab to preview.</p>
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 max-w-md">
          <p className="text-sm text-white/70">
            The Document Manager adds Confluence-like wiki pages, document spaces, version history, and templates to your Odoo module.
          </p>
        </div>
      </div>
    );
  }

  const spaces = [
    { name: "General", key: "GEN", icon: "📖", docs: 12 },
    { name: "Technical", key: "TECH", icon: "⚙️", docs: 24 },
    { name: "Product", key: "PROD", icon: "🚀", docs: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Document Spaces */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <h2 className="text-lg font-bold text-white mb-4">📚 Document Spaces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {spaces.map(space => (
            <div key={space.key} className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 cursor-pointer transition">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{space.icon}</span>
                <div>
                  <h3 className="font-bold text-white">{space.name}</h3>
                  <span className="text-xs text-white/50">{space.key}</span>
                </div>
              </div>
              <div className="text-sm text-white/60">{space.docs} documents</div>
            </div>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">📄 Recent Documents</h2>
          <div className="flex gap-2">
            <span className="bg-green-500/20 text-green-300 rounded-lg px-3 py-1 text-xs font-medium">Published</span>
            <span className="bg-white/10 text-white/50 rounded-lg px-3 py-1 text-xs">My Docs</span>
            <span className="bg-white/10 text-white/50 rounded-lg px-3 py-1 text-xs">Starred</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_DOCS.map((doc, idx) => (
            <div key={idx} className="rounded-xl bg-white/[0.07] border border-white/10 p-4 hover:bg-white/[0.1] cursor-pointer transition group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{doc.icon}</span>
                <span className={`rounded px-2 py-0.5 text-[10px] ${getDocStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{doc.title}</h3>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{doc.space}</span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {doc.views}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates Preview */}
      {config.enableDocTemplates && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h2 className="text-lg font-bold text-white mb-4">📝 Document Templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Meeting Notes", icon: "📅", desc: "Agenda, notes, action items" },
              { name: "Decision Record", icon: "⚖️", desc: "Architecture decisions (ADR)" },
              { name: "How-To Guide", icon: "📖", desc: "Step-by-step instructions" },
              { name: "Runbook", icon: "🔧", desc: "Operational procedures" },
            ].map(tpl => (
              <div key={tpl.name} className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 cursor-pointer transition text-center">
                <span className="text-3xl block mb-2">{tpl.icon}</span>
                <h3 className="font-medium text-white text-sm">{tpl.name}</h3>
                <p className="text-xs text-white/50 mt-1">{tpl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="flex flex-wrap gap-4 rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-white/50">
        <span className="font-medium text-white/70">Features:</span>
        <span>📚 Document Spaces</span>
        <span>🗂️ Categories</span>
        <span>📄 Wiki Pages</span>
        <span>🔗 Link to Tasks</span>
        <span>⭐ Star & Pin</span>
        <span>👁️ View Tracking</span>
        {config.enableDocVersioning && <span>📜 Version History</span>}
        {config.enableDocTemplates && <span>📝 Templates</span>}
      </div>
    </div>
  );
}

/* =========== File Structure Panel =========== */
function FileStructurePanel({ config }: { config: ModuleConfig }) {
  const mn = config.moduleName;

  const files = [
    { path: `${mn}/`, type: "folder", desc: "Module root directory" },
    { path: `${mn}/__manifest__.py`, type: "file", desc: "Module manifest with metadata, dependencies" },
    { path: `${mn}/__init__.py`, type: "file", desc: "Root Python package init" },
    { path: `${mn}/models/`, type: "folder", desc: "ORM model definitions" },
    { path: `${mn}/models/__init__.py`, type: "file", desc: "Import all models" },
    { path: `${mn}/models/pm_project.py`, type: "file", desc: "Project model" },
    { path: `${mn}/models/pm_task.py`, type: "file", desc: "Task model with Kanban support" },
    { path: `${mn}/models/pm_stage.py`, type: "file", desc: "Stage model for Kanban columns" },
    ...(config.enableSprints ? [{ path: `${mn}/models/pm_sprint.py`, type: "file", desc: "Sprint model" }] : []),
    ...(config.enableTimelog ? [{ path: `${mn}/models/pm_timelog.py`, type: "file", desc: "Time log entries" }] : []),
    ...(config.enableTags ? [{ path: `${mn}/models/pm_tag.py`, type: "file", desc: "Tags/Labels" }] : []),
    ...(config.enableSubtasks ? [{ path: `${mn}/models/pm_subtask.py`, type: "file", desc: "Subtasks" }] : []),
    ...(config.enableDocuments ? [
      { path: `${mn}/models/pm_doc_space.py`, type: "file", desc: "Document Space model" },
      { path: `${mn}/models/pm_doc_category.py`, type: "file", desc: "Document Category model" },
      { path: `${mn}/models/pm_document.py`, type: "file", desc: "Document/Wiki Page model" },
      { path: `${mn}/models/pm_doc_label.py`, type: "file", desc: "Document Label model" },
    ] : []),
    ...(config.enableDocuments && config.enableDocVersioning ? [{ path: `${mn}/models/pm_doc_version.py`, type: "file", desc: "Document Version model" }] : []),
    ...(config.enableDocuments && config.enableDocTemplates ? [{ path: `${mn}/models/pm_doc_template.py`, type: "file", desc: "Document Template model" }] : []),
    { path: `${mn}/security/`, type: "folder", desc: "Access control" },
    { path: `${mn}/security/ir.model.access.csv`, type: "file", desc: "Model access rights" },
    { path: `${mn}/data/`, type: "folder", desc: "Default data" },
    { path: `${mn}/data/stage_data.xml`, type: "file", desc: "Default stages" },
    ...(config.enableDocuments ? [{ path: `${mn}/data/doc_category_data.xml`, type: "file", desc: "Default doc categories" }] : []),
    ...(config.enableDocuments && config.enableDocTemplates ? [{ path: `${mn}/data/doc_template_data.xml`, type: "file", desc: "Default doc templates" }] : []),
    { path: `${mn}/views/`, type: "folder", desc: "XML view definitions" },
    { path: `${mn}/views/project_views.xml`, type: "file", desc: "Project views" },
    { path: `${mn}/views/task_views.xml`, type: "file", desc: "Task views (Jira-style Kanban)" },
    { path: `${mn}/views/menu_views.xml`, type: "file", desc: "Menu items" },
    { path: `${mn}/views/dashboard_views.xml`, type: "file", desc: "Dashboard analytics" },
    ...(config.enableSprints ? [{ path: `${mn}/views/sprint_views.xml`, type: "file", desc: "Sprint views" }] : []),
    ...(config.enableTimelog ? [{ path: `${mn}/views/timelog_views.xml`, type: "file", desc: "Time log views" }] : []),
    ...(config.enableDocuments ? [
      { path: `${mn}/views/doc_space_views.xml`, type: "file", desc: "Document Space views" },
      { path: `${mn}/views/document_views.xml`, type: "file", desc: "Document views (Confluence-style)" },
    ] : []),
    { path: `${mn}/static/`, type: "folder", desc: "Static assets" },
    { path: `${mn}/static/src/css/board.css`, type: "file", desc: "Custom styling" },
    { path: `${mn}/static/src/js/board.js`, type: "file", desc: "JavaScript" },
    { path: `${mn}/static/description/icon.svg`, type: "file", desc: "Module icon" },
    { path: `${mn}/README.md`, type: "file", desc: "Documentation" },
  ];

  const boardModelCount = 3 + (config.enableSprints ? 1 : 0) + (config.enableTimelog ? 1 : 0) + (config.enableTags ? 1 : 0) + (config.enableSubtasks ? 1 : 0);
  const docModelCount = config.enableDocuments ? (4 + (config.enableDocVersioning ? 1 : 0) + (config.enableDocTemplates ? 1 : 0)) : 0;
  const totalModels = boardModelCount + docModelCount;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Board Models", value: boardModelCount, icon: "📋", color: "from-purple-500/20 to-indigo-500/20" },
          { label: "Doc Models", value: docModelCount, icon: "📖", color: "from-blue-500/20 to-cyan-500/20" },
          { label: "Kanban Stages", value: config.stages.length, icon: "📊", color: "from-green-500/20 to-emerald-500/20" },
          { label: "Total Models", value: totalModels, icon: "🐍", color: "from-yellow-500/20 to-orange-500/20" },
          { label: "Total Files", value: files.filter(f => f.type === "file").length, icon: "📁", color: "from-pink-500/20 to-rose-500/20" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`rounded-xl bg-gradient-to-br ${color} border border-white/10 p-4 text-center`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-white/50">{label}</div>
          </div>
        ))}
      </div>

      {/* File Tree */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-4">📁 Generated Module Structure</h2>
        <div className="font-mono text-sm space-y-0.5 max-h-[500px] overflow-y-auto">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-start gap-3 py-1 px-2 rounded hover:bg-white/5 transition">
              <span className="text-lg leading-none mt-0.5">
                {file.type === "folder" ? "📂" : file.path.endsWith(".py") ? "🐍" : file.path.endsWith(".xml") ? "📝" : file.path.endsWith(".csv") ? "📊" : file.path.endsWith(".css") ? "🎨" : file.path.endsWith(".js") ? "⚡" : "📄"}
              </span>
              <div className="min-w-0 flex-1">
                <span className={`${file.type === "folder" ? "text-blue-300 font-bold" : "text-green-300"}`}>
                  {file.path}
                </span>
                <span className="text-white/40 text-xs ml-2">{file.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Installation Guide */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-4">🚀 Installation Guide</h2>
        <div className="space-y-4">
          {[
            { step: 1, title: "Download & Extract", desc: `Download the ${mn}.zip file and extract it` },
            { step: 2, title: "Copy to Addons", desc: `Copy the '${mn}' folder to your Odoo addons directory` },
            { step: 3, title: "Update Apps List", desc: "In Odoo, go to Apps → Update Apps List → Update" },
            { step: 4, title: "Install Module", desc: `Search for "${config.moduleTitle}" and click Install` },
            { step: 5, title: "Start Using", desc: "Create projects, tasks, and documents!" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">{step}</span>
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-xs text-white/50">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
