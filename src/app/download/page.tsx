"use client";

import { useState } from "react";
import JSZip from "jszip";
import { generateModule } from "@/lib/odoo-module-generator";

export default function DownloadPage() {
  const [moduleName, setModuleName] = useState("jira_zain");
  const [moduleTitle, setModuleTitle] = useState("Jira-Zain");
  const [authorName, setAuthorName] = useState("Zain");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");

  const handleDownload = async () => {
    setIsGenerating(true);
    setStatus("Generating module...");

    try {
      // Generate all files
      const files = generateModule({
        moduleName: moduleName.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        moduleTitle,
        authorName,
      });

      setStatus("Creating ZIP archive...");

      // Create ZIP
      const zip = new JSZip();
      const folder = zip.folder(moduleName)!;

      for (const [path, content] of Object.entries(files)) {
        folder.file(path, content);
      }

      setStatus("Preparing download...");

      // Generate and download
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${moduleName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      setStatus("✅ Download started!");
      
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error(error);
      setStatus("❌ Error generating module");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📦 Odoo 16 Module Generator
          </h1>
          <p className="text-purple-300">
            Generate a clean, working Jira-like module for Odoo 16
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Module Technical Name
              </label>
              <input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
                placeholder="jira_zain"
              />
              <p className="text-white/50 text-sm mt-1">Lowercase, underscores only (e.g., jira_zain)</p>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Display Title
              </label>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
                placeholder="Jira-Zain"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
                placeholder="Your Name"
              />
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isGenerating || !moduleName || !moduleTitle}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
            isGenerating
              ? "bg-gray-500 cursor-wait"
              : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:scale-[1.02]"
          } text-white shadow-lg`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75"/>
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download {moduleName}.zip
            </span>
          )}
        </button>

        {/* Status */}
        {status && (
          <div className="mt-4 text-center text-white/80">{status}</div>
        )}

        {/* Module Preview */}
        <div className="mt-8 bg-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📁 Module Structure</h2>
          <pre className="text-green-400 text-sm font-mono bg-black/30 rounded-xl p-4 overflow-x-auto">
{`${moduleName}/
├── __manifest__.py        # Module manifest
├── __init__.py            # Python package init
├── README.md
├── models/
│   ├── __init__.py
│   ├── project.py         # Project model
│   ├── task.py            # Task model with Kanban
│   ├── stage.py           # Kanban stages
│   ├── sprint.py          # Sprint management
│   └── timelog.py         # Time tracking
├── security/
│   ├── security_groups.xml    # Scrum roles
│   └── ir.model.access.csv    # Access rights
├── data/
│   └── stage_data.xml     # Default stages
├── views/
│   ├── project_views.xml
│   ├── task_views.xml     # Kanban board
│   ├── sprint_views.xml
│   ├── timelog_views.xml
│   └── menu_views.xml
└── static/
    └── description/
        └── index.html`}
          </pre>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          {[
            { icon: "📋", title: "Kanban Board", desc: "Drag & drop tasks" },
            { icon: "🏃", title: "Sprints", desc: "Agile sprint management" },
            { icon: "🎯", title: "Story Points", desc: "Estimate effort" },
            { icon: "⏱️", title: "Time Logs", desc: "Track work hours" },
            { icon: "👥", title: "Scrum Roles", desc: "PO, SM, PM, Team" },
            { icon: "🔐", title: "Access Rights", desc: "Role-based security" },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 rounded-xl p-4">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="text-white font-bold mt-2">{f.title}</h3>
              <p className="text-white/50 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Installation Guide */}
        <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🚀 Installation Steps</h2>
          <ol className="space-y-3 text-white/80">
            <li className="flex gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Extract <code className="bg-black/30 px-2 py-0.5 rounded">{moduleName}.zip</code></span>
            </li>
            <li className="flex gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Copy <code className="bg-black/30 px-2 py-0.5 rounded">{moduleName}</code> folder to Odoo addons directory</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>Restart Odoo server</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <span>Go to Apps → Update Apps List → Update</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
              <span>Search "{moduleTitle}" → Install</span>
            </li>
          </ol>
        </div>

        {/* Links */}
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/" className="text-purple-300 hover:text-white transition">
            ← Back to Home
          </a>
          <a href="/guide" className="text-blue-300 hover:text-white transition">
            📖 Help Guide
          </a>
          <a href="/preview" className="text-green-300 hover:text-white transition">
            👁️ Preview
          </a>
        </div>
      </div>
    </div>
  );
}
