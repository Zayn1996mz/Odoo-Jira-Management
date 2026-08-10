import { NextRequest } from "next/server";
import JSZip from "jszip";
import {
  ModuleConfig,
  generateManifest,
  generateInit,
  generateModelsInit,
  generateProjectModel,
  generateStageModel,
  generateTaskModel,
  generateSprintModel,
  generateTimelogModel,
  generateTagModel,
  generateSubtaskModel,
  generateSecurity,
  generateSecurityGroups,
  generateRecordRules,
  generateStageData,
  generateProjectViews,
  generateTaskViews,
  generateMenuViews,
  generateSprintViews,
  generateTimelogViews,
  generateDashboardViews,
  generateBoardCSS,
  generateBoardJS,
  generateDocSpaceModel,
  generateDocCategoryModel,
  generateDocumentModel,
  generateDocVersionModel,
  generateDocTemplateModel,
  generateDocLabelModel,
  generateDocCategoryData,
  generateDocTemplateData,
  generateDocSpaceViews,
  generateDocumentViews,
} from "@/lib/odoo-generator";

function generateIconSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#bg)"/>
  <g fill="white" opacity="0.95">
    <rect x="20" y="25" width="25" height="78" rx="4"/>
    <rect x="52" y="25" width="25" height="55" rx="4"/>
    <rect x="84" y="25" width="25" height="40" rx="4"/>
    <path d="M28 45 L32 49 L40 38" stroke="url(#bg)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M60 45 L64 49 L72 38" stroke="url(#bg)" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
}

// GET endpoint - downloads with default config
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const moduleName = searchParams.get("name") || "jira_zain";
  const moduleTitle = searchParams.get("title") || "Jira-Zain";

  const config: ModuleConfig = {
    moduleName,
    moduleTitle,
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

  try {
    const zip = new JSZip();
    const folder = zip.folder(config.moduleName)!;

    // Root files
    folder.file("__manifest__.py", generateManifest(config));
    folder.file("__init__.py", generateInit(config));

    // Models
    const models = folder.folder("models")!;
    models.file("__init__.py", generateModelsInit(config));
    models.file("pm_project.py", generateProjectModel(config));
    models.file("pm_stage.py", generateStageModel(config));
    models.file("pm_task.py", generateTaskModel(config));
    if (config.enableSprints) models.file("pm_sprint.py", generateSprintModel(config));
    if (config.enableTimelog) models.file("pm_timelog.py", generateTimelogModel(config));
    if (config.enableTags) models.file("pm_tag.py", generateTagModel(config));
    if (config.enableSubtasks) models.file("pm_subtask.py", generateSubtaskModel(config));
    
    // Document Manager Models
    if (config.enableDocuments) {
      models.file("pm_doc_space.py", generateDocSpaceModel(config));
      models.file("pm_doc_category.py", generateDocCategoryModel(config));
      models.file("pm_document.py", generateDocumentModel(config));
      models.file("pm_doc_label.py", generateDocLabelModel(config));
      if (config.enableDocVersioning) models.file("pm_doc_version.py", generateDocVersionModel(config));
      if (config.enableDocTemplates) models.file("pm_doc_template.py", generateDocTemplateModel(config));
    }

    // Security
    const security = folder.folder("security")!;
    security.file("security_groups.xml", generateSecurityGroups(config));
    security.file("ir.model.access.csv", generateSecurity(config));
    security.file("record_rules.xml", generateRecordRules(config));

    // Data
    const data = folder.folder("data")!;
    data.file("stage_data.xml", generateStageData(config));
    if (config.enableDocuments) {
      data.file("doc_category_data.xml", generateDocCategoryData(config));
      if (config.enableDocTemplates) {
        data.file("doc_template_data.xml", generateDocTemplateData(config));
      }
    }

    // Views
    const views = folder.folder("views")!;
    views.file("project_views.xml", generateProjectViews(config));
    views.file("task_views.xml", generateTaskViews(config));
    views.file("menu_views.xml", generateMenuViews(config));
    views.file("dashboard_views.xml", generateDashboardViews(config));
    if (config.enableSprints) views.file("sprint_views.xml", generateSprintViews(config));
    if (config.enableTimelog) views.file("timelog_views.xml", generateTimelogViews(config));
    if (config.enableDocuments) {
      views.file("doc_space_views.xml", generateDocSpaceViews(config));
      views.file("document_views.xml", generateDocumentViews(config));
    }

    // Static assets
    const staticFolder = folder.folder("static")!;
    const staticSrc = staticFolder.folder("src")!;
    staticSrc.folder("css")!.file("board.css", generateBoardCSS());
    staticSrc.folder("js")!.file("board.js", generateBoardJS(config));

    // Description
    const desc = staticFolder.folder("description")!;
    desc.file("icon.svg", generateIconSVG());

    // README
    folder.file("README.md", `# ${config.moduleTitle}

## Odoo 16 Project Management Module

A Jira/Trello-like project management module with Confluence-style documentation.

### Features
- Kanban board with drag & drop
- Projects and Tasks management  
- Sprint management
- Time logging
- Document spaces and wiki pages
- Version history
- Templates

### Installation
1. Copy the \`${config.moduleName}\` folder to your Odoo addons directory
2. Restart the Odoo server
3. Go to Apps → Update Apps List
4. Search for "${config.moduleTitle}" and click Install

### Author
${config.authorName}
`);

    const zipContent = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 }
    });

    return new Response(zipContent, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${config.moduleName}.zip"`,
        "Content-Length": String(zipContent.size),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate module" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
