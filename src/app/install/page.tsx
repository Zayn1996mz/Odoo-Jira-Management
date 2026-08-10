"use client";

import { useState } from "react";

export default function InstallGuide() {
  const [os, setOs] = useState<"linux" | "windows" | "docker">("linux");

  const paths = {
    linux: {
      odoo: "/opt/odoo",
      addons: "/opt/odoo/addons",
      customAddons: "/opt/odoo/custom-addons",
      config: "/etc/odoo/odoo.conf",
    },
    windows: {
      odoo: "C:\\Program Files\\Odoo 16",
      addons: "C:\\Program Files\\Odoo 16\\server\\odoo\\addons",
      customAddons: "C:\\Program Files\\Odoo 16\\server\\custom-addons",
      config: "C:\\Program Files\\Odoo 16\\server\\odoo.conf",
    },
    docker: {
      odoo: "/mnt/extra-addons",
      addons: "/mnt/extra-addons",
      customAddons: "/mnt/extra-addons",
      config: "docker-compose.yml",
    },
  };

  const currentPaths = paths[os];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Odoo 16 Installation Guide</h1>
                <p className="text-xs text-purple-300">Step-by-step module installation</p>
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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* OS Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Select Your Environment</h2>
          <div className="flex gap-2">
            {[
              { id: "linux" as const, label: "🐧 Linux/Ubuntu", desc: "Most common" },
              { id: "windows" as const, label: "🪟 Windows", desc: "Desktop install" },
              { id: "docker" as const, label: "🐳 Docker", desc: "Container setup" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setOs(option.id)}
                className={`flex-1 rounded-xl p-4 text-left transition ${
                  os === option.id
                    ? "bg-purple-500/20 border-2 border-purple-500"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="text-lg font-semibold text-white">{option.label}</div>
                <div className="text-xs text-white/50">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Summary Box */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6">
          <h2 className="text-lg font-bold text-white mb-2">📋 Quick Summary for "jira_zain"</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/50">Module folder name:</span>
              <code className="ml-2 bg-black/30 px-2 py-1 rounded text-green-300">jira_zain</code>
            </div>
            <div>
              <span className="text-white/50">Extract to:</span>
              <code className="ml-2 bg-black/30 px-2 py-1 rounded text-green-300">{currentPaths.customAddons}/jira_zain</code>
            </div>
          </div>
        </div>

        {/* Step-by-step Guide */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white font-bold">1</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Download the Module</h3>
                <p className="text-white/70 mb-4">
                  Go to the generator, configure your module as <strong>"jira_zain"</strong>, and click <strong>"Download Module (.zip)"</strong>
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Go to Generator & Download
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white font-bold">2</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Extract the ZIP File</h3>
                <p className="text-white/70 mb-4">
                  Extract <code className="bg-black/30 px-2 py-1 rounded text-yellow-300">jira_zain.zip</code> to get a folder named <code className="bg-black/30 px-2 py-1 rounded text-yellow-300">jira_zain</code>
                </p>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  {os === "linux" && (
                    <pre className="text-green-400">
{`# Extract the downloaded zip
unzip jira_zain.zip

# You should see this structure:
jira_zain/
├── __manifest__.py
├── __init__.py
├── models/
├── views/
├── security/
├── data/
├── static/
└── README.md`}
                    </pre>
                  )}
                  {os === "windows" && (
                    <pre className="text-green-400">
{`# Right-click jira_zain.zip → Extract All
# Or use 7-Zip / WinRAR

# You should see this structure:
jira_zain\\
├── __manifest__.py
├── __init__.py
├── models\\
├── views\\
├── security\\
├── data\\
├── static\\
└── README.md`}
                    </pre>
                  )}
                  {os === "docker" && (
                    <pre className="text-green-400">
{`# Extract the downloaded zip
unzip jira_zain.zip

# You should see this structure:
jira_zain/
├── __manifest__.py
├── __init__.py
├── models/
├── views/
├── security/
├── data/
├── static/
└── README.md`}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white font-bold">3</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Copy to Odoo Addons Directory</h3>
                <p className="text-white/70 mb-4">
                  Copy the <code className="bg-black/30 px-2 py-1 rounded text-yellow-300">jira_zain</code> folder to your Odoo addons path
                </p>

                {os === "linux" && (
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-green-400">
{`# Option 1: Use the default custom addons directory
sudo mkdir -p /opt/odoo/custom-addons
sudo cp -r jira_zain /opt/odoo/custom-addons/
sudo chown -R odoo:odoo /opt/odoo/custom-addons/jira_zain

# Option 2: Use the main addons directory
sudo cp -r jira_zain /opt/odoo/odoo/addons/
sudo chown -R odoo:odoo /opt/odoo/odoo/addons/jira_zain`}
                      </pre>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-200 text-sm">
                        <strong>⚠️ Important:</strong> Make sure the addons path is in your <code className="bg-black/30 px-1 rounded">/etc/odoo/odoo.conf</code>:
                      </p>
                      <pre className="mt-2 text-yellow-300 text-xs bg-black/30 p-2 rounded">
{`addons_path = /opt/odoo/odoo/addons,/opt/odoo/custom-addons`}
                      </pre>
                    </div>
                  </div>
                )}

                {os === "windows" && (
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-green-400">
{`# Copy the folder to Odoo's addons directory:
C:\\Program Files\\Odoo 16\\server\\odoo\\addons\\jira_zain

# Or create a custom-addons folder:
C:\\Program Files\\Odoo 16\\server\\custom-addons\\jira_zain`}
                      </pre>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-200 text-sm">
                        <strong>⚠️ Important:</strong> Update <code className="bg-black/30 px-1 rounded">odoo.conf</code> if using custom-addons:
                      </p>
                      <pre className="mt-2 text-yellow-300 text-xs bg-black/30 p-2 rounded">
{`addons_path = C:\\Program Files\\Odoo 16\\server\\odoo\\addons,C:\\Program Files\\Odoo 16\\server\\custom-addons`}
                      </pre>
                    </div>
                  </div>
                )}

                {os === "docker" && (
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-green-400">
{`# Copy to your mounted addons volume
cp -r jira_zain ./addons/

# Your docker-compose.yml should have:
volumes:
  - ./addons:/mnt/extra-addons

# The folder structure:
./addons/
└── jira_zain/
    ├── __manifest__.py
    └── ...`}
                      </pre>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-200 text-sm">
                        <strong>💡 Docker Tip:</strong> Make sure your docker-compose.yml maps the addons volume correctly:
                      </p>
                      <pre className="mt-2 text-blue-300 text-xs bg-black/30 p-2 rounded">
{`services:
  odoo:
    image: odoo:16
    volumes:
      - ./addons:/mnt/extra-addons
      - ./config:/etc/odoo`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white font-bold">4</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Restart Odoo Server</h3>
                <p className="text-white/70 mb-4">
                  Restart Odoo to recognize the new module
                </p>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  {os === "linux" && (
                    <pre className="text-green-400">
{`# Restart Odoo service
sudo systemctl restart odoo

# Or if running manually:
sudo service odoo restart

# Check logs for errors:
sudo tail -f /var/log/odoo/odoo.log`}
                    </pre>
                  )}
                  {os === "windows" && (
                    <pre className="text-green-400">
{`# Restart from Services:
1. Press Win + R, type "services.msc"
2. Find "Odoo Server" 
3. Right-click → Restart

# Or restart from command line (as Administrator):
net stop odoo
net start odoo`}
                    </pre>
                  )}
                  {os === "docker" && (
                    <pre className="text-green-400">
{`# Restart the container
docker-compose restart odoo

# Or rebuild if needed:
docker-compose down
docker-compose up -d

# Check logs:
docker-compose logs -f odoo`}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white font-bold">5</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Update Apps List in Odoo</h3>
                <p className="text-white/70 mb-4">
                  Log into Odoo and update the apps list
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/40 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Via Web Interface:</h4>
                    <ol className="text-sm text-white/70 space-y-2">
                      <li>1. Log in as <strong>Administrator</strong></li>
                      <li>2. Enable <strong>Developer Mode</strong>:
                        <br /><code className="text-xs bg-black/50 px-1 rounded">Settings → General Settings → Developer Tools → Activate Developer Mode</code>
                      </li>
                      <li>3. Go to <strong>Apps</strong> menu</li>
                      <li>4. Click <strong>Update Apps List</strong> (top menu)</li>
                      <li>5. Click <strong>Update</strong> in the popup</li>
                    </ol>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Via URL (Quick way):</h4>
                    <p className="text-sm text-white/70 mb-2">Add this to your Odoo URL:</p>
                    <code className="text-green-300 text-sm bg-black/50 px-2 py-1 rounded block">
                      /web?debug=1
                    </code>
                    <p className="text-xs text-white/50 mt-2">This enables developer mode instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white font-bold">6</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Install the Module</h3>
                <p className="text-white/70 mb-4">
                  Search for your module and install it
                </p>
                <div className="bg-black/40 rounded-lg p-4">
                  <ol className="text-sm text-white/70 space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded">1</span>
                      <span>Go to <strong>Apps</strong> menu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded">2</span>
                      <span>Remove the default "Apps" filter (click the ✕ next to it)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded">3</span>
                      <span>Search for <code className="bg-black/50 px-2 rounded text-yellow-300">Jira-Zain</code> or <code className="bg-black/50 px-2 rounded text-yellow-300">jira_zain</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded">4</span>
                      <span>Click <strong>Install</strong> (or Activate)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded">5</span>
                      <span>Wait for installation to complete</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Step 7 - Success */}
          <div className="rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white font-bold">✓</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">🎉 Start Using Jira-Zain!</h3>
                <p className="text-white/70 mb-4">
                  After installation, you'll see <strong>"Jira-Zain"</strong> in your main menu
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/20 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-2">📋 Board Menu</h4>
                    <ul className="text-white/70 space-y-1">
                      <li>• Projects - Create and manage projects</li>
                      <li>• Tasks - Kanban board view</li>
                      <li>• Sprints - Agile sprint management</li>
                      <li>• Time Logs - Track work hours</li>
                      <li>• Dashboard - Analytics</li>
                    </ul>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-2">📚 Documents Menu</h4>
                    <ul className="text-white/70 space-y-1">
                      <li>• Spaces - Confluence-like spaces</li>
                      <li>• All Documents - Wiki pages</li>
                      <li>• My Documents - Your docs</li>
                      <li>• Templates - Pre-built templates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 rounded-2xl bg-red-500/10 border border-red-500/30 p-6">
          <h2 className="text-lg font-bold text-white mb-4">🔧 Troubleshooting</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="text-white font-medium">Module not showing in Apps list?</h4>
              <ul className="text-white/70 mt-1 space-y-1">
                <li>• Make sure you removed the default "Apps" filter in search</li>
                <li>• Verify the folder is in the correct addons path</li>
                <li>• Check that <code className="bg-black/30 px-1 rounded">__manifest__.py</code> exists in the folder</li>
                <li>• Restart Odoo server and try again</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium">Getting errors during install?</h4>
              <ul className="text-white/70 mt-1 space-y-1">
                <li>• Check Odoo logs for detailed error messages</li>
                <li>• Ensure all dependencies (base, mail, web) are installed</li>
                <li>• Make sure you're running Odoo 16 (not 14, 15, or 17)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium">Permission issues?</h4>
              <ul className="text-white/70 mt-1 space-y-1">
                <li>• Linux: <code className="bg-black/30 px-1 rounded">sudo chown -R odoo:odoo /path/to/jira_zain</code></li>
                <li>• Windows: Run as Administrator when copying files</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Jira-Zain Module
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 mt-12">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-white/40">
            Need help? Check the Odoo documentation or community forums for more assistance.
          </p>
        </div>
      </footer>
    </div>
  );
}
