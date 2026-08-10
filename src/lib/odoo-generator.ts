// Odoo 16 Module Generator for Project Management (Jira/Trello-like) + Document Manager (Confluence-like)

export interface StageConfig {
  name: string;
  sequence: number;
  fold: boolean;
}

export interface PriorityConfig {
  value: string;
  label: string;
}

export interface ModuleConfig {
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
  // Document Manager (Confluence-like)
  enableDocuments: boolean;
  enableDocVersioning: boolean;
  enableDocTemplates: boolean;
}

export function generateManifest(config: ModuleConfig): string {
  const depends = ["base", "mail", "web"];
  const data = [
    "security/security_groups.xml",
    "security/ir.model.access.csv",
    "security/record_rules.xml",
    "data/stage_data.xml",
    "views/project_views.xml",
    "views/task_views.xml",
    "views/menu_views.xml",
  ];
  if (config.enableSprints) {
    data.push("views/sprint_views.xml");
  }
  if (config.enableTimelog) {
    data.push("views/timelog_views.xml");
  }
  if (config.enableDocuments) {
    data.push("data/doc_category_data.xml");
    data.push("views/document_views.xml");
    data.push("views/doc_space_views.xml");
    if (config.enableDocTemplates) {
      data.push("data/doc_template_data.xml");
    }
  }
  data.push("views/dashboard_views.xml");

  const docFeatures = config.enableDocuments ? `
- Document Spaces (like Confluence Spaces)
- Wiki-style Pages with rich text editor
${config.enableDocVersioning ? '- Version history & restore\\n' : ''}${config.enableDocTemplates ? '- Document templates\\n' : ''}- Document search & navigation
- Link documents to tasks` : '';

  return `# -*- coding: utf-8 -*-
{
    'name': '${config.moduleTitle}',
    'version': '16.0.1.0.0',
    'category': 'Project',
    'summary': '${config.moduleDescription}',
    'description': """
${config.moduleTitle}
=====================
A Jira/Trello-like Project Management module for Odoo 16.

Features:
- Kanban board with drag & drop
- Projects and Tasks management
- Multiple task stages (${config.stages.map(s => s.name).join(', ')})
- Priority levels
${config.enableSprints ? '- Sprint management\\n' : ''}${config.enableTimelog ? '- Time logging\\n' : ''}${config.enableTags ? '- Tags/Labels\\n' : ''}${config.enableSubtasks ? '- Subtasks/Checklists\\n' : ''}${config.enableComments ? '- Activity & Comments\\n' : ''}- Dashboard with analytics
- Responsive design${docFeatures}
    """,
    'author': '${config.authorName}',
    'website': '',
    'license': 'LGPL-3',
    'depends': ${JSON.stringify(depends)},
    'data': ${JSON.stringify(data, null, 8).replace(/"/g, "'")},
    'assets': {
        'web.assets_backend': [
            '${config.moduleName}/static/src/css/board.css',
            '${config.moduleName}/static/src/js/board.js',
        ],
    },
    'images': ['static/description/icon.png'],
    'installable': True,
    'application': True,
    'auto_install': False,
}
`;
}

export function generateInit(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from . import models
`;
}

export function generateModelsInit(config: ModuleConfig): string {
  const imports = [
    "from . import pm_project",
    "from . import pm_task",
    "from . import pm_stage",
  ];
  if (config.enableSprints) imports.push("from . import pm_sprint");
  if (config.enableTimelog) imports.push("from . import pm_timelog");
  if (config.enableTags) imports.push("from . import pm_tag");
  if (config.enableSubtasks) imports.push("from . import pm_subtask");
  if (config.enableDocuments) {
    imports.push("from . import pm_doc_space");
    imports.push("from . import pm_document");
    imports.push("from . import pm_doc_category");
    if (config.enableDocVersioning) imports.push("from . import pm_doc_version");
    if (config.enableDocTemplates) imports.push("from . import pm_doc_template");
  }

  return `# -*- coding: utf-8 -*-
${imports.join("\n")}
`;
}

export function generateProjectModel(config: ModuleConfig): string {
  let docFields = "";
  if (config.enableDocuments) {
    docFields = `
    # Document Space
    doc_space_id = fields.Many2one('${config.moduleName}.doc.space', string='Document Space')
    document_count = fields.Integer(compute='_compute_document_count', string='Documents')

    @api.depends('doc_space_id', 'doc_space_id.document_ids')
    def _compute_document_count(self):
        for project in self:
            if project.doc_space_id:
                project.document_count = len(project.doc_space_id.document_ids)
            else:
                project.document_count = 0
`;
  }

  return `# -*- coding: utf-8 -*-
from odoo import models, fields, api


class PmProject(models.Model):
    _name = '${config.moduleName}.project'
    _description = 'Project'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'

    name = fields.Char(string='Project Name', required=True, tracking=True)
    code = fields.Char(string='Project Key', required=True, size=10,
                       help='Short code for task numbering (e.g. PRJ)')
    description = fields.Html(string='Description')
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color Index')

    # Relationships
    task_ids = fields.One2many('${config.moduleName}.task', 'project_id', string='Tasks')
    member_ids = fields.Many2many('res.users', string='Members')
    manager_id = fields.Many2one('res.users', string='Project Manager',
                                  default=lambda self: self.env.user, tracking=True)
    stage_ids = fields.Many2many('${config.moduleName}.stage', string='Stages')
${config.enableSprints ? `    sprint_ids = fields.One2many('${config.moduleName}.sprint', 'project_id', string='Sprints')
` : ''}${config.enableTags ? `    tag_ids = fields.Many2many('${config.moduleName}.tag', string='Tags')
` : ''}
    # Computed fields
    task_count = fields.Integer(compute='_compute_task_count', string='Tasks')
    progress = fields.Float(compute='_compute_progress', string='Progress (%)')

    # Dates
    date_start = fields.Date(string='Start Date')
    date_end = fields.Date(string='End Date')
${docFields}
    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'Project code must be unique!'),
    ]

    @api.depends('task_ids')
    def _compute_task_count(self):
        for project in self:
            project.task_count = len(project.task_ids)

    @api.depends('task_ids', 'task_ids.stage_id', 'task_ids.stage_id.is_done')
    def _compute_progress(self):
        for project in self:
            total = len(project.task_ids)
            if total:
                done = len(project.task_ids.filtered(lambda t: t.stage_id.is_done))
                project.progress = (done / total) * 100
            else:
                project.progress = 0.0
`;
}

export function generateStageModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields


class PmStage(models.Model):
    _name = '${config.moduleName}.stage'
    _description = 'Task Stage'
    _order = 'sequence, name'

    name = fields.Char(string='Stage Name', required=True)
    sequence = fields.Integer(default=10)
    fold = fields.Boolean(string='Folded in Kanban',
                          help='Fold this stage in the kanban view')
    is_done = fields.Boolean(string='Is Done Stage',
                             help='Tasks in this stage are considered done')
    description = fields.Text(string='Description')
    color = fields.Integer(string='Color Index')
    active = fields.Boolean(default=True)
`;
}

export function generateTaskModel(config: ModuleConfig): string {
  let extraFields = "";

  if (config.enableTimelog) {
    extraFields += `
    timelog_ids = fields.One2many('${config.moduleName}.timelog', 'task_id', string='Time Logs')
    total_hours = fields.Float(compute='_compute_total_hours', string='Total Hours', store=True)
    estimated_hours = fields.Float(string='Estimated Hours')
`;
  }

  if (config.enableSprints) {
    extraFields += `
    sprint_id = fields.Many2one('${config.moduleName}.sprint', string='Sprint',
                                 tracking=True, domain="[('project_id', '=', project_id)]")
`;
  }

  if (config.enableTags) {
    extraFields += `
    tag_ids = fields.Many2many('${config.moduleName}.tag', string='Tags')
`;
  }

  if (config.enableSubtasks) {
    extraFields += `
    subtask_ids = fields.One2many('${config.moduleName}.subtask', 'task_id', string='Subtasks')
    subtask_count = fields.Integer(compute='_compute_subtask_count', string='Subtasks')
    subtask_progress = fields.Float(compute='_compute_subtask_progress', string='Subtask Progress')
`;
  }

  if (config.enableAttachments) {
    extraFields += `
    attachment_count = fields.Integer(compute='_compute_attachment_count', string='Attachments')
`;
  }

  if (config.enableDocuments) {
    extraFields += `
    document_ids = fields.Many2many('${config.moduleName}.document', string='Related Documents')
    document_count = fields.Integer(compute='_compute_document_count', string='Documents')
`;
  }

  let extraMethods = "";

  if (config.enableTimelog) {
    extraMethods += `
    @api.depends('timelog_ids.hours')
    def _compute_total_hours(self):
        for task in self:
            task.total_hours = sum(task.timelog_ids.mapped('hours'))
`;
  }

  if (config.enableSubtasks) {
    extraMethods += `
    @api.depends('subtask_ids')
    def _compute_subtask_count(self):
        for task in self:
            task.subtask_count = len(task.subtask_ids)

    @api.depends('subtask_ids', 'subtask_ids.is_done')
    def _compute_subtask_progress(self):
        for task in self:
            total = len(task.subtask_ids)
            if total:
                done = len(task.subtask_ids.filtered('is_done'))
                task.subtask_progress = (done / total) * 100
            else:
                task.subtask_progress = 0.0
`;
  }

  if (config.enableAttachments) {
    extraMethods += `
    def _compute_attachment_count(self):
        for task in self:
            task.attachment_count = self.env['ir.attachment'].search_count([
                ('res_model', '=', self._name),
                ('res_id', '=', task.id),
            ])
`;
  }

  if (config.enableDocuments) {
    extraMethods += `
    @api.depends('document_ids')
    def _compute_document_count(self):
        for task in self:
            task.document_count = len(task.document_ids)
`;
  }

  const prioritySelection = config.priorities
    .map(p => `('${p.value}', '${p.label}')`)
    .join(",\n        ");

  return `# -*- coding: utf-8 -*-
from odoo import models, fields, api
from datetime import date


class PmTask(models.Model):
    _name = '${config.moduleName}.task'
    _description = 'Task'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'priority desc, sequence, date_deadline, name'

    name = fields.Char(string='Task Title', required=True, tracking=True)
    display_name = fields.Char(compute='_compute_display_name', store=True)
    description = fields.Html(string='Description')
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color Index')

    # Relations
    project_id = fields.Many2one('${config.moduleName}.project', string='Project',
                                  required=True, tracking=True, ondelete='cascade')
    stage_id = fields.Many2one('${config.moduleName}.stage', string='Stage',
                                tracking=True, group_expand='_read_group_stage_ids',
                                default=lambda self: self._default_stage(),
                                index=True)
    assigned_to = fields.Many2one('res.users', string='Assignee', tracking=True)
    reviewer_id = fields.Many2one('res.users', string='Reviewer')
    creator_id = fields.Many2one('res.users', string='Reporter',
                                  default=lambda self: self.env.user, readonly=True)

    # Task details
    priority = fields.Selection([
        ${prioritySelection}
    ], string='Priority', default='1', tracking=True)

    task_type = fields.Selection([
        ('task', 'Task'),
        ('bug', 'Bug'),
        ('feature', 'Feature'),
        ('improvement', 'Improvement'),
        ('epic', 'Epic'),
    ], string='Type', default='task', tracking=True)

    # Dates
    date_deadline = fields.Date(string='Deadline')
    date_start = fields.Date(string='Start Date')
    date_end = fields.Date(string='End Date')
    create_date = fields.Datetime(string='Created On', readonly=True)

    # Progress
    progress = fields.Float(string='Progress (%)')
    kanban_state = fields.Selection([
        ('normal', 'In Progress'),
        ('done', 'Ready'),
        ('blocked', 'Blocked'),
    ], string='Kanban State', default='normal', tracking=True)

    # Story points / effort
    story_points = fields.Integer(string='Story Points')
${extraFields}
    # Computed
    is_overdue = fields.Boolean(compute='_compute_is_overdue', string='Overdue')

    @api.depends('project_id.code', 'id')
    def _compute_display_name(self):
        for task in self:
            if task.project_id and task.project_id.code and task.id:
                task.display_name = '%s-%s' % (task.project_id.code, task.id)
            else:
                task.display_name = task.name or ''

    def _default_stage(self):
        return self.env['${config.moduleName}.stage'].search([], limit=1, order='sequence')

    @api.model
    def _read_group_stage_ids(self, stages, domain, order):
        """Always display all stages in kanban view."""
        return self.env['${config.moduleName}.stage'].search([], order=order)

    @api.depends('date_deadline')
    def _compute_is_overdue(self):
        today = date.today()
        for task in self:
            task.is_overdue = bool(task.date_deadline and task.date_deadline < today
                                   and not task.stage_id.is_done)
${extraMethods}
`;
}

export function generateSprintModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields, api


class PmSprint(models.Model):
    _name = '${config.moduleName}.sprint'
    _description = 'Sprint'
    _order = 'date_start desc'
    _inherit = ['mail.thread']

    name = fields.Char(string='Sprint Name', required=True, tracking=True)
    project_id = fields.Many2one('${config.moduleName}.project', string='Project',
                                  required=True, ondelete='cascade')
    state = fields.Selection([
        ('draft', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ], string='Status', default='draft', tracking=True)

    date_start = fields.Date(string='Start Date', required=True)
    date_end = fields.Date(string='End Date', required=True)
    goal = fields.Text(string='Sprint Goal')

    task_ids = fields.One2many('${config.moduleName}.task', 'sprint_id', string='Tasks')
    task_count = fields.Integer(compute='_compute_task_count', string='Tasks')
    velocity = fields.Integer(compute='_compute_velocity', string='Velocity (SP)')
    progress = fields.Float(compute='_compute_progress', string='Progress (%)')

    @api.depends('task_ids')
    def _compute_task_count(self):
        for sprint in self:
            sprint.task_count = len(sprint.task_ids)

    @api.depends('task_ids.story_points', 'task_ids.stage_id.is_done')
    def _compute_velocity(self):
        for sprint in self:
            done_tasks = sprint.task_ids.filtered(lambda t: t.stage_id.is_done)
            sprint.velocity = sum(done_tasks.mapped('story_points'))

    @api.depends('task_ids', 'task_ids.stage_id.is_done')
    def _compute_progress(self):
        for sprint in self:
            total = len(sprint.task_ids)
            if total:
                done = len(sprint.task_ids.filtered(lambda t: t.stage_id.is_done))
                sprint.progress = (done / total) * 100
            else:
                sprint.progress = 0.0

    def action_start(self):
        self.write({'state': 'active'})

    def action_complete(self):
        self.write({'state': 'completed'})
`;
}

export function generateTimelogModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields, api


class PmTimelog(models.Model):
    _name = '${config.moduleName}.timelog'
    _description = 'Time Log'
    _order = 'date desc'

    task_id = fields.Many2one('${config.moduleName}.task', string='Task',
                              required=True, ondelete='cascade')
    project_id = fields.Many2one(related='task_id.project_id', store=True,
                                  string='Project')
    user_id = fields.Many2one('res.users', string='User',
                               default=lambda self: self.env.user, required=True)
    date = fields.Date(string='Date', default=fields.Date.today, required=True)
    hours = fields.Float(string='Hours Spent', required=True)
    description = fields.Text(string='Work Description')
`;
}

export function generateTagModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields


class PmTag(models.Model):
    _name = '${config.moduleName}.tag'
    _description = 'Task Tag'
    _order = 'name'

    name = fields.Char(string='Tag Name', required=True)
    color = fields.Integer(string='Color Index')

    _sql_constraints = [
        ('name_unique', 'UNIQUE(name)', 'Tag name must be unique!'),
    ]
`;
}

export function generateSubtaskModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields


class PmSubtask(models.Model):
    _name = '${config.moduleName}.subtask'
    _description = 'Subtask / Checklist Item'
    _order = 'sequence, name'

    name = fields.Char(string='Subtask', required=True)
    task_id = fields.Many2one('${config.moduleName}.task', string='Parent Task',
                              required=True, ondelete='cascade')
    is_done = fields.Boolean(string='Done', default=False)
    assigned_to = fields.Many2one('res.users', string='Assignee')
    sequence = fields.Integer(default=10)
`;
}

// ========== DOCUMENT MANAGER MODELS (Confluence-like) ==========

export function generateDocSpaceModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields, api


class PmDocSpace(models.Model):
    _name = '${config.moduleName}.doc.space'
    _description = 'Document Space'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'

    name = fields.Char(string='Space Name', required=True, tracking=True)
    key = fields.Char(string='Space Key', required=True, size=10,
                      help='Short key for the space (e.g. DEV, HR, SALES)')
    description = fields.Html(string='Description')
    icon = fields.Selection([
        ('folder', '📁 Folder'),
        ('book', '📖 Book'),
        ('lightbulb', '💡 Ideas'),
        ('rocket', '🚀 Product'),
        ('gear', '⚙️ Technical'),
        ('users', '👥 Team'),
        ('chart', '📊 Analytics'),
        ('shield', '🛡️ Security'),
    ], string='Icon', default='folder')
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color Index')

    # Access control
    is_public = fields.Boolean(string='Public Space', default=True,
                                help='If checked, all users can view documents')
    member_ids = fields.Many2many('res.users', string='Members',
                                   help='Users with access to this space')
    admin_ids = fields.Many2many('res.users', 'pm_doc_space_admin_rel',
                                  string='Administrators')

    # Relationships
    document_ids = fields.One2many('${config.moduleName}.document', 'space_id', string='Documents')
    category_ids = fields.One2many('${config.moduleName}.doc.category', 'space_id', string='Categories')
    project_ids = fields.One2many('${config.moduleName}.project', 'doc_space_id', string='Projects')

    # Computed
    document_count = fields.Integer(compute='_compute_document_count', string='Documents')
    page_count = fields.Integer(compute='_compute_page_count', string='Pages')

    _sql_constraints = [
        ('key_unique', 'UNIQUE(key)', 'Space key must be unique!'),
    ]

    @api.depends('document_ids')
    def _compute_document_count(self):
        for space in self:
            space.document_count = len(space.document_ids)

    @api.depends('document_ids')
    def _compute_page_count(self):
        for space in self:
            space.page_count = len(space.document_ids.filtered(lambda d: d.doc_type == 'page'))
`;
}

export function generateDocCategoryModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields, api


class PmDocCategory(models.Model):
    _name = '${config.moduleName}.doc.category'
    _description = 'Document Category'
    _order = 'sequence, name'
    _parent_store = True

    name = fields.Char(string='Category Name', required=True)
    space_id = fields.Many2one('${config.moduleName}.doc.space', string='Space',
                                required=True, ondelete='cascade')
    parent_id = fields.Many2one('${config.moduleName}.doc.category', string='Parent Category',
                                 ondelete='cascade', index=True)
    parent_path = fields.Char(index=True, unaccent=False)
    child_ids = fields.One2many('${config.moduleName}.doc.category', 'parent_id', string='Subcategories')
    sequence = fields.Integer(default=10)
    icon = fields.Char(string='Icon', default='📂')
    color = fields.Integer(string='Color Index')

    document_ids = fields.One2many('${config.moduleName}.document', 'category_id', string='Documents')
    document_count = fields.Integer(compute='_compute_document_count', string='Documents')

    @api.depends('document_ids')
    def _compute_document_count(self):
        for category in self:
            category.document_count = len(category.document_ids)
`;
}

export function generateDocumentModel(config: ModuleConfig): string {
  let versionFields = "";
  let versionMethods = "";
  
  if (config.enableDocVersioning) {
    versionFields = `
    version_ids = fields.One2many('${config.moduleName}.doc.version', 'document_id', string='Versions')
    version_count = fields.Integer(compute='_compute_version_count', string='Versions')
    current_version = fields.Integer(string='Current Version', default=1)
`;
    versionMethods = `
    @api.depends('version_ids')
    def _compute_version_count(self):
        for doc in self:
            doc.version_count = len(doc.version_ids)

    def action_create_version(self):
        """Create a new version snapshot of the document."""
        self.ensure_one()
        self.env['${config.moduleName}.doc.version'].create({
            'document_id': self.id,
            'version_number': self.current_version,
            'content': self.content,
            'created_by': self.env.user.id,
        })
        self.current_version += 1
        return True

    def action_restore_version(self, version_id):
        """Restore document content from a specific version."""
        version = self.env['${config.moduleName}.doc.version'].browse(version_id)
        if version.document_id == self:
            self.content = version.content
            self.action_create_version()
        return True
`;
  }

  let templateFields = "";
  if (config.enableDocTemplates) {
    templateFields = `
    template_id = fields.Many2one('${config.moduleName}.doc.template', string='Template')
    is_template = fields.Boolean(string='Is Template', default=False)
`;
  }

  return `# -*- coding: utf-8 -*-
from odoo import models, fields, api
from datetime import datetime


class PmDocument(models.Model):
    _name = '${config.moduleName}.document'
    _description = 'Document / Wiki Page'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'
    _parent_store = True

    name = fields.Char(string='Title', required=True, tracking=True)
    slug = fields.Char(string='URL Slug', compute='_compute_slug', store=True)
    content = fields.Html(string='Content', sanitize=False)
    summary = fields.Text(string='Summary', help='Brief description for search results')

    doc_type = fields.Selection([
        ('page', 'Page'),
        ('blog', 'Blog Post'),
        ('meeting', 'Meeting Notes'),
        ('decision', 'Decision Record'),
        ('howto', 'How-To Guide'),
        ('faq', 'FAQ'),
        ('requirement', 'Requirement'),
        ('runbook', 'Runbook'),
    ], string='Document Type', default='page', tracking=True)

    # Hierarchy
    space_id = fields.Many2one('${config.moduleName}.doc.space', string='Space',
                                required=True, ondelete='cascade', tracking=True)
    category_id = fields.Many2one('${config.moduleName}.doc.category', string='Category',
                                   domain="[('space_id', '=', space_id)]")
    parent_id = fields.Many2one('${config.moduleName}.document', string='Parent Document',
                                 ondelete='cascade', index=True)
    parent_path = fields.Char(index=True, unaccent=False)
    child_ids = fields.One2many('${config.moduleName}.document', 'parent_id', string='Child Pages')

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('review', 'In Review'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ], string='Status', default='draft', tracking=True)

    # Metadata
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color Index')
    icon = fields.Char(string='Icon', default='📄')
    is_pinned = fields.Boolean(string='Pinned', default=False)
    is_starred = fields.Boolean(string='Starred', compute='_compute_is_starred', inverse='_inverse_is_starred')
    starred_by_ids = fields.Many2many('res.users', string='Starred By')
    active = fields.Boolean(default=True)

    # Ownership & Audit
    author_id = fields.Many2one('res.users', string='Author',
                                 default=lambda self: self.env.user, tracking=True)
    last_editor_id = fields.Many2one('res.users', string='Last Edited By')
    date_published = fields.Datetime(string='Published Date')
    
    # Links
    task_ids = fields.Many2many('${config.moduleName}.task', string='Related Tasks')
    label_ids = fields.Many2many('${config.moduleName}.doc.label', string='Labels')

    # Stats
    view_count = fields.Integer(string='Views', default=0)
    child_count = fields.Integer(compute='_compute_child_count', string='Child Pages')

    # Attachments
    attachment_ids = fields.One2many('ir.attachment', 'res_id', string='Attachments',
                                      domain=[('res_model', '=', '${config.moduleName}.document')])
    attachment_count = fields.Integer(compute='_compute_attachment_count', string='Attachments')
${versionFields}${templateFields}
    @api.depends('name')
    def _compute_slug(self):
        for doc in self:
            if doc.name:
                slug = doc.name.lower().replace(' ', '-')
                slug = ''.join(c for c in slug if c.isalnum() or c == '-')
                doc.slug = slug[:50]
            else:
                doc.slug = ''

    @api.depends('starred_by_ids')
    def _compute_is_starred(self):
        for doc in self:
            doc.is_starred = self.env.user in doc.starred_by_ids

    def _inverse_is_starred(self):
        for doc in self:
            if doc.is_starred:
                doc.starred_by_ids = [(4, self.env.user.id)]
            else:
                doc.starred_by_ids = [(3, self.env.user.id)]

    @api.depends('child_ids')
    def _compute_child_count(self):
        for doc in self:
            doc.child_count = len(doc.child_ids)

    def _compute_attachment_count(self):
        for doc in self:
            doc.attachment_count = self.env['ir.attachment'].search_count([
                ('res_model', '=', self._name),
                ('res_id', '=', doc.id),
            ])

    def action_publish(self):
        self.write({
            'state': 'published',
            'date_published': datetime.now(),
        })

    def action_archive(self):
        self.write({'state': 'archived'})

    def action_draft(self):
        self.write({'state': 'draft'})

    def action_increment_view(self):
        self.sudo().view_count += 1
${versionMethods}
`;
}

export function generateDocVersionModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields


class PmDocVersion(models.Model):
    _name = '${config.moduleName}.doc.version'
    _description = 'Document Version'
    _order = 'version_number desc'

    document_id = fields.Many2one('${config.moduleName}.document', string='Document',
                                   required=True, ondelete='cascade')
    version_number = fields.Integer(string='Version', required=True)
    content = fields.Html(string='Content Snapshot')
    created_by = fields.Many2one('res.users', string='Created By',
                                  default=lambda self: self.env.user)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    change_summary = fields.Char(string='Change Summary')

    def action_restore(self):
        """Restore this version to the document."""
        self.document_id.action_restore_version(self.id)
        return True
`;
}

export function generateDocTemplateModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields


class PmDocTemplate(models.Model):
    _name = '${config.moduleName}.doc.template'
    _description = 'Document Template'
    _order = 'sequence, name'

    name = fields.Char(string='Template Name', required=True)
    description = fields.Text(string='Description')
    content = fields.Html(string='Template Content', sanitize=False)
    doc_type = fields.Selection([
        ('page', 'Page'),
        ('blog', 'Blog Post'),
        ('meeting', 'Meeting Notes'),
        ('decision', 'Decision Record'),
        ('howto', 'How-To Guide'),
        ('faq', 'FAQ'),
        ('requirement', 'Requirement'),
        ('runbook', 'Runbook'),
    ], string='Document Type', default='page')
    icon = fields.Char(string='Icon', default='📝')
    sequence = fields.Integer(default=10)
    is_global = fields.Boolean(string='Global Template', default=True,
                                help='Available in all spaces')
    space_id = fields.Many2one('${config.moduleName}.doc.space', string='Space',
                                help='If not global, limit to this space')
    active = fields.Boolean(default=True)

    def action_use_template(self, space_id=None):
        """Create a new document from this template."""
        vals = {
            'name': 'New %s' % self.name,
            'content': self.content,
            'doc_type': self.doc_type,
            'space_id': space_id or self.space_id.id,
            'template_id': self.id,
        }
        return self.env['${config.moduleName}.document'].create(vals)
`;
}

export function generateDocLabelModel(config: ModuleConfig): string {
  return `# -*- coding: utf-8 -*-
from odoo import models, fields


class PmDocLabel(models.Model):
    _name = '${config.moduleName}.doc.label'
    _description = 'Document Label'
    _order = 'name'

    name = fields.Char(string='Label', required=True)
    color = fields.Integer(string='Color Index')

    _sql_constraints = [
        ('name_unique', 'UNIQUE(name)', 'Label name must be unique!'),
    ]
`;
}

// ========== SECURITY ==========

export function generateSecurity(config: ModuleConfig): string {
  const mn = config.moduleName;
  const mnUnder = mn.replace(/\./g, '_');
  
  let csv = `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_${mn}_project_user,${mn}.project.user,model_${mnUnder}_project,base.group_user,1,1,1,1
access_${mn}_task_user,${mn}.task.user,model_${mnUnder}_task,base.group_user,1,1,1,1
access_${mn}_stage_user,${mn}.stage.user,model_${mnUnder}_stage,base.group_user,1,1,1,1`;

  if (config.enableSprints) {
    csv += `\naccess_${mn}_sprint_user,${mn}.sprint.user,model_${mnUnder}_sprint,base.group_user,1,1,1,1`;
  }
  if (config.enableTimelog) {
    csv += `\naccess_${mn}_timelog_user,${mn}.timelog.user,model_${mnUnder}_timelog,base.group_user,1,1,1,1`;
  }
  if (config.enableTags) {
    csv += `\naccess_${mn}_tag_user,${mn}.tag.user,model_${mnUnder}_tag,base.group_user,1,1,1,1`;
  }
  if (config.enableSubtasks) {
    csv += `\naccess_${mn}_subtask_user,${mn}.subtask.user,model_${mnUnder}_subtask,base.group_user,1,1,1,1`;
  }
  if (config.enableDocuments) {
    csv += `\naccess_${mn}_doc_space_user,${mn}.doc.space.user,model_${mnUnder}_doc_space,base.group_user,1,1,1,1`;
    csv += `\naccess_${mn}_document_user,${mn}.document.user,model_${mnUnder}_document,base.group_user,1,1,1,1`;
    csv += `\naccess_${mn}_doc_category_user,${mn}.doc.category.user,model_${mnUnder}_doc_category,base.group_user,1,1,1,1`;
    csv += `\naccess_${mn}_doc_label_user,${mn}.doc.label.user,model_${mnUnder}_doc_label,base.group_user,1,1,1,1`;
    if (config.enableDocVersioning) {
      csv += `\naccess_${mn}_doc_version_user,${mn}.doc.version.user,model_${mnUnder}_doc_version,base.group_user,1,1,1,1`;
    }
    if (config.enableDocTemplates) {
      csv += `\naccess_${mn}_doc_template_user,${mn}.doc.template.user,model_${mnUnder}_doc_template,base.group_user,1,1,1,1`;
    }
  }

  return csv;
}

export function generateSecurityGroups(config: ModuleConfig): string {
  const mn = config.moduleName;
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Module Category -->
    <record id="module_category_${mn.replace(/\./g, '_')}" model="ir.module.category">
        <field name="name">${config.moduleTitle}</field>
        <field name="description">Access rights for ${config.moduleTitle} module</field>
        <field name="sequence">50</field>
    </record>

    <!-- ========== SECURITY GROUPS ========== -->
    
    <!-- Team Member: Base access level -->
    <record id="group_team_member" model="res.groups">
        <field name="name">Team Member</field>
        <field name="category_id" ref="module_category_${mn.replace(/\./g, '_')}"/>
        <field name="comment">
            Can view assigned projects and tasks.
            Can edit tasks assigned to them.
            Can log time and add comments.
        </field>
    </record>

    <!-- Project Manager: Inherits Team Member -->
    <record id="group_project_manager" model="res.groups">
        <field name="name">Project Manager</field>
        <field name="category_id" ref="module_category_${mn.replace(/\./g, '_')}"/>
        <field name="implied_ids" eval="[(4, ref('group_team_member'))]"/>
        <field name="comment">
            Full access to assigned projects.
            Can manage project settings and team.
            Can create and manage sprints.
        </field>
    </record>

    <!-- Scrum Master: Inherits Project Manager -->
    <record id="group_scrum_master" model="res.groups">
        <field name="name">Scrum Master</field>
        <field name="category_id" ref="module_category_${mn.replace(/\./g, '_')}"/>
        <field name="implied_ids" eval="[(4, ref('group_project_manager'))]"/>
        <field name="comment">
            Can manage sprints (create/start/complete).
            Can edit all tasks in assigned projects.
            Can configure project stages.
        </field>
    </record>

    <!-- Product Owner: Highest access level -->
    <record id="group_product_owner" model="res.groups">
        <field name="name">Product Owner</field>
        <field name="category_id" ref="module_category_${mn.replace(/\./g, '_')}"/>
        <field name="implied_ids" eval="[(4, ref('group_scrum_master'))]"/>
        <field name="comment">
            Full access to all projects.
            Can create/edit/delete backlog items.
            Can manage priorities and roadmap.
            Access to all reports and dashboards.
        </field>
    </record>

    <!-- Users default group selection -->
    <record id="base.default_user" model="res.users">
        <field name="groups_id" eval="[(4, ref('group_team_member'))]"/>
    </record>

</odoo>
`;
}

export function generateRecordRules(config: ModuleConfig): string {
  const mn = config.moduleName;
  const mnUnder = mn.replace(/\./g, '_');
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        
        <!-- ========== PROJECT RULES ========== -->
        
        <!-- Team Member: See projects they are member of -->
        <record id="rule_project_team_member" model="ir.rule">
            <field name="name">Project: Team Member sees own projects</field>
            <field name="model_id" ref="model_${mnUnder}_project"/>
            <field name="domain_force">[
                '|',
                ('member_ids', 'in', user.id),
                ('manager_id', '=', user.id)
            ]</field>
            <field name="groups" eval="[(4, ref('group_team_member'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="False"/>
            <field name="perm_create" eval="False"/>
            <field name="perm_unlink" eval="False"/>
        </record>

        <!-- Project Manager: Full access to their projects -->
        <record id="rule_project_project_manager" model="ir.rule">
            <field name="name">Project: Manager has full access</field>
            <field name="model_id" ref="model_${mnUnder}_project"/>
            <field name="domain_force">[
                '|',
                ('member_ids', 'in', user.id),
                ('manager_id', '=', user.id)
            ]</field>
            <field name="groups" eval="[(4, ref('group_project_manager'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="False"/>
        </record>

        <!-- Product Owner: Full access to all projects -->
        <record id="rule_project_product_owner" model="ir.rule">
            <field name="name">Project: Product Owner full access</field>
            <field name="model_id" ref="model_${mnUnder}_project"/>
            <field name="domain_force">[(1, '=', 1)]</field>
            <field name="groups" eval="[(4, ref('group_product_owner'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="True"/>
        </record>

        <!-- ========== TASK RULES ========== -->
        
        <!-- Team Member: See and edit assigned tasks -->
        <record id="rule_task_team_member" model="ir.rule">
            <field name="name">Task: Team Member sees assigned tasks</field>
            <field name="model_id" ref="model_${mnUnder}_task"/>
            <field name="domain_force">[
                '|', '|',
                ('assigned_to', '=', user.id),
                ('creator_id', '=', user.id),
                ('project_id.member_ids', 'in', user.id)
            ]</field>
            <field name="groups" eval="[(4, ref('group_team_member'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="False"/>
        </record>

        <!-- Scrum Master: Full task access in their projects -->
        <record id="rule_task_scrum_master" model="ir.rule">
            <field name="name">Task: Scrum Master full access</field>
            <field name="model_id" ref="model_${mnUnder}_task"/>
            <field name="domain_force">[
                '|',
                ('project_id.member_ids', 'in', user.id),
                ('project_id.manager_id', '=', user.id)
            ]</field>
            <field name="groups" eval="[(4, ref('group_scrum_master'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="True"/>
        </record>

        <!-- Product Owner: Full access to all tasks -->
        <record id="rule_task_product_owner" model="ir.rule">
            <field name="name">Task: Product Owner full access</field>
            <field name="model_id" ref="model_${mnUnder}_task"/>
            <field name="domain_force">[(1, '=', 1)]</field>
            <field name="groups" eval="[(4, ref('group_product_owner'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="True"/>
        </record>

${config.enableSprints ? `
        <!-- ========== SPRINT RULES ========== -->
        
        <!-- Team Member: View sprints -->
        <record id="rule_sprint_team_member" model="ir.rule">
            <field name="name">Sprint: Team Member view only</field>
            <field name="model_id" ref="model_${mnUnder}_sprint"/>
            <field name="domain_force">[('project_id.member_ids', 'in', user.id)]</field>
            <field name="groups" eval="[(4, ref('group_team_member'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="False"/>
            <field name="perm_create" eval="False"/>
            <field name="perm_unlink" eval="False"/>
        </record>

        <!-- Scrum Master: Full sprint access -->
        <record id="rule_sprint_scrum_master" model="ir.rule">
            <field name="name">Sprint: Scrum Master full access</field>
            <field name="model_id" ref="model_${mnUnder}_sprint"/>
            <field name="domain_force">[
                '|',
                ('project_id.member_ids', 'in', user.id),
                ('project_id.manager_id', '=', user.id)
            ]</field>
            <field name="groups" eval="[(4, ref('group_scrum_master'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="True"/>
        </record>
` : ''}
${config.enableDocuments ? `
        <!-- ========== DOCUMENT RULES ========== -->
        
        <!-- Team Member: View published documents, edit own -->
        <record id="rule_document_team_member" model="ir.rule">
            <field name="name">Document: Team Member access</field>
            <field name="model_id" ref="model_${mnUnder}_document"/>
            <field name="domain_force">[
                '|',
                ('state', '=', 'published'),
                ('author_id', '=', user.id)
            ]</field>
            <field name="groups" eval="[(4, ref('group_team_member'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="False"/>
        </record>

        <!-- Product Owner: Full document access -->
        <record id="rule_document_product_owner" model="ir.rule">
            <field name="name">Document: Product Owner full access</field>
            <field name="model_id" ref="model_${mnUnder}_document"/>
            <field name="domain_force">[(1, '=', 1)]</field>
            <field name="groups" eval="[(4, ref('group_product_owner'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="True"/>
        </record>
` : ''}
    </data>
</odoo>
`;
}

export function generateStageData(config: ModuleConfig): string {
  const mn = config.moduleName;
  const records = config.stages.map((stage, i) => {
    const isDone = i === config.stages.length - 1;
    return `        <record id="stage_${i + 1}" model="${mn}.stage">
            <field name="name">${stage.name}</field>
            <field name="sequence">${stage.sequence}</field>
            <field name="fold" eval="${stage.fold ? 'True' : 'False'}"/>
            <field name="is_done" eval="${isDone ? 'True' : 'False'}"/>
        </record>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
${records}
    </data>
</odoo>
`;
}

export function generateDocCategoryData(config: ModuleConfig): string {
  const mn = config.moduleName;
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- Default Document Space -->
        <record id="doc_space_general" model="${mn}.doc.space">
            <field name="name">General</field>
            <field name="key">GEN</field>
            <field name="description">General documentation and knowledge base</field>
            <field name="icon">book</field>
            <field name="is_public" eval="True"/>
        </record>

        <!-- Default Categories -->
        <record id="doc_category_getting_started" model="${mn}.doc.category">
            <field name="name">Getting Started</field>
            <field name="space_id" ref="doc_space_general"/>
            <field name="sequence">1</field>
            <field name="icon">🚀</field>
        </record>
        <record id="doc_category_guides" model="${mn}.doc.category">
            <field name="name">Guides & Tutorials</field>
            <field name="space_id" ref="doc_space_general"/>
            <field name="sequence">2</field>
            <field name="icon">📚</field>
        </record>
        <record id="doc_category_reference" model="${mn}.doc.category">
            <field name="name">Reference</field>
            <field name="space_id" ref="doc_space_general"/>
            <field name="sequence">3</field>
            <field name="icon">📖</field>
        </record>
        <record id="doc_category_faq" model="${mn}.doc.category">
            <field name="name">FAQ</field>
            <field name="space_id" ref="doc_space_general"/>
            <field name="sequence">4</field>
            <field name="icon">❓</field>
        </record>
    </data>
</odoo>
`;
}

export function generateDocTemplateData(config: ModuleConfig): string {
  const mn = config.moduleName;
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- Meeting Notes Template -->
        <record id="doc_template_meeting" model="${mn}.doc.template">
            <field name="name">Meeting Notes</field>
            <field name="description">Template for meeting notes and action items</field>
            <field name="doc_type">meeting</field>
            <field name="icon">📝</field>
            <field name="sequence">1</field>
            <field name="content"><![CDATA[
<h2>📅 Meeting Details</h2>
<table class="table table-bordered">
    <tr><td><strong>Date:</strong></td><td>[Date]</td></tr>
    <tr><td><strong>Time:</strong></td><td>[Time]</td></tr>
    <tr><td><strong>Attendees:</strong></td><td>[Names]</td></tr>
    <tr><td><strong>Location:</strong></td><td>[Location/Link]</td></tr>
</table>

<h2>📋 Agenda</h2>
<ol>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ol>

<h2>📝 Discussion Notes</h2>
<p>[Notes here...]</p>

<h2>✅ Action Items</h2>
<table class="table table-bordered">
    <thead>
        <tr><th>Action</th><th>Owner</th><th>Due Date</th><th>Status</th></tr>
    </thead>
    <tbody>
        <tr><td>[Action 1]</td><td>[Name]</td><td>[Date]</td><td>🔵 Open</td></tr>
    </tbody>
</table>

<h2>📅 Next Meeting</h2>
<p>[Date and agenda for next meeting]</p>
            ]]></field>
        </record>

        <!-- Decision Record Template -->
        <record id="doc_template_decision" model="${mn}.doc.template">
            <field name="name">Decision Record (ADR)</field>
            <field name="description">Architecture Decision Record template</field>
            <field name="doc_type">decision</field>
            <field name="icon">⚖️</field>
            <field name="sequence">2</field>
            <field name="content"><![CDATA[
<h2>📋 Status</h2>
<p><span class="badge bg-warning">Proposed</span></p>

<h2>🎯 Context</h2>
<p>What is the issue that we're seeing that is motivating this decision or change?</p>

<h2>💡 Decision</h2>
<p>What is the change that we're proposing and/or doing?</p>

<h2>✅ Consequences</h2>
<h3>Positive</h3>
<ul>
    <li>Benefit 1</li>
</ul>
<h3>Negative</h3>
<ul>
    <li>Trade-off 1</li>
</ul>

<h2>🔄 Alternatives Considered</h2>
<ol>
    <li><strong>Alternative 1:</strong> Description and why rejected</li>
    <li><strong>Alternative 2:</strong> Description and why rejected</li>
</ol>

<h2>👥 Participants</h2>
<p>Decision makers: [Names]</p>
            ]]></field>
        </record>

        <!-- How-To Guide Template -->
        <record id="doc_template_howto" model="${mn}.doc.template">
            <field name="name">How-To Guide</field>
            <field name="description">Step-by-step guide template</field>
            <field name="doc_type">howto</field>
            <field name="icon">📖</field>
            <field name="sequence">3</field>
            <field name="content"><![CDATA[
<h2>🎯 Overview</h2>
<p>Brief description of what this guide covers and who it's for.</p>

<h2>📋 Prerequisites</h2>
<ul>
    <li>Requirement 1</li>
    <li>Requirement 2</li>
</ul>

<h2>📝 Steps</h2>
<h3>Step 1: [Title]</h3>
<p>Description of step 1...</p>

<h3>Step 2: [Title]</h3>
<p>Description of step 2...</p>

<h3>Step 3: [Title]</h3>
<p>Description of step 3...</p>

<h2>✅ Verification</h2>
<p>How to verify the steps were completed successfully.</p>

<h2>❓ Troubleshooting</h2>
<table class="table table-bordered">
    <thead>
        <tr><th>Issue</th><th>Solution</th></tr>
    </thead>
    <tbody>
        <tr><td>Problem 1</td><td>Solution 1</td></tr>
    </tbody>
</table>

<h2>📚 Related</h2>
<ul>
    <li><a href="#">Related Document 1</a></li>
</ul>
            ]]></field>
        </record>

        <!-- Runbook Template -->
        <record id="doc_template_runbook" model="${mn}.doc.template">
            <field name="name">Runbook</field>
            <field name="description">Operations runbook template</field>
            <field name="doc_type">runbook</field>
            <field name="icon">🔧</field>
            <field name="sequence">4</field>
            <field name="content"><![CDATA[
<h2>🎯 Purpose</h2>
<p>What this runbook is for and when to use it.</p>

<h2>⚠️ Severity Level</h2>
<p><span class="badge bg-danger">Critical</span> / <span class="badge bg-warning">High</span> / <span class="badge bg-info">Medium</span></p>

<h2>👥 Contacts</h2>
<table class="table table-bordered">
    <tr><td><strong>Primary:</strong></td><td>[Name] - [Phone/Slack]</td></tr>
    <tr><td><strong>Secondary:</strong></td><td>[Name] - [Phone/Slack]</td></tr>
    <tr><td><strong>Escalation:</strong></td><td>[Name] - [Phone/Slack]</td></tr>
</table>

<h2>🔍 Detection</h2>
<p>How to identify this issue (alerts, logs, symptoms).</p>

<h2>📝 Resolution Steps</h2>
<h3>1. Initial Assessment</h3>
<pre><code># Commands to assess the situation
[command here]</code></pre>

<h3>2. Mitigation</h3>
<pre><code># Commands to mitigate
[command here]</code></pre>

<h3>3. Resolution</h3>
<pre><code># Commands to resolve
[command here]</code></pre>

<h2>✅ Verification</h2>
<p>How to confirm the issue is resolved.</p>

<h2>📊 Post-Incident</h2>
<ul>
    <li>Create incident report</li>
    <li>Update this runbook if needed</li>
    <li>Schedule post-mortem if required</li>
</ul>
            ]]></field>
        </record>
    </data>
</odoo>
`;
}

// ========== VIEWS ==========

export function generateProjectViews(config: ModuleConfig): string {
  const mn = config.moduleName;
  let docButton = "";
  if (config.enableDocuments) {
    docButton = `
                        <button name="%(action_${mn}_document)d" type="action"
                                class="oe_stat_button" icon="fa-file-text-o"
                                context="{'default_space_id': doc_space_id}">
                            <field name="document_count" widget="statinfo" string="Docs"/>
                        </button>`;
  }

  let docFields = "";
  if (config.enableDocuments) {
    docFields = `                            <field name="doc_space_id"/>
`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Project Form View -->
    <record id="view_${mn}_project_form" model="ir.ui.view">
        <field name="name">${mn}.project.form</field>
        <field name="model">${mn}.project</field>
        <field name="arch" type="xml">
            <form string="Project">
                <sheet>
                    <div class="oe_button_box" name="button_box">
                        <button name="%(action_${mn}_task)d" type="action"
                                class="oe_stat_button" icon="fa-tasks"
                                context="{'default_project_id': active_id}">
                            <field name="task_count" widget="statinfo" string="Tasks"/>
                        </button>${docButton}
                    </div>
                    <widget name="web_ribbon" title="Archived" bg_color="bg-danger"
                            attrs="{'invisible': [('active', '=', True)]}"/>
                    <div class="oe_title">
                        <h1>
                            <field name="name" placeholder="Project Name"/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="code"/>
                            <field name="manager_id"/>
                            <field name="date_start"/>
                            <field name="date_end"/>
                        </group>
                        <group>
                            <field name="member_ids" widget="many2many_tags"
                                   options="{'color_field': 'color'}"/>
                            <field name="progress" widget="progressbar"/>
${docFields}                            <field name="active" invisible="1"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Description">
                            <field name="description"/>
                        </page>
                    </notebook>
                </sheet>
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- Project Tree View -->
    <record id="view_${mn}_project_tree" model="ir.ui.view">
        <field name="name">${mn}.project.tree</field>
        <field name="model">${mn}.project</field>
        <field name="arch" type="xml">
            <tree string="Projects">
                <field name="sequence" widget="handle"/>
                <field name="code"/>
                <field name="name"/>
                <field name="manager_id"/>
                <field name="task_count"/>
                <field name="progress" widget="progressbar"/>
                <field name="date_start"/>
                <field name="date_end"/>
            </tree>
        </field>
    </record>

    <!-- Project Kanban View -->
    <record id="view_${mn}_project_kanban" model="ir.ui.view">
        <field name="name">${mn}.project.kanban</field>
        <field name="model">${mn}.project</field>
        <field name="arch" type="xml">
            <kanban class="o_kanban_mobile" default_group_by="">
                <field name="name"/>
                <field name="code"/>
                <field name="manager_id"/>
                <field name="task_count"/>
                <field name="progress"/>
                <field name="color"/>
                <templates>
                    <t t-name="kanban-box">
                        <div t-attf-class="oe_kanban_color_#{kanban_getcolor(record.color.raw_value)} oe_kanban_card oe_kanban_global_click">
                            <div class="oe_kanban_content">
                                <div class="o_kanban_record_top mb-0">
                                    <div class="o_kanban_record_headings">
                                        <strong class="o_kanban_record_title">
                                            <field name="name"/>
                                        </strong>
                                    </div>
                                </div>
                                <div class="o_kanban_record_body">
                                    <span class="badge bg-primary"><field name="code"/></span>
                                    <field name="progress" widget="progressbar"
                                           options="{'editable': false}"/>
                                </div>
                                <div class="o_kanban_record_bottom">
                                    <div class="oe_kanban_bottom_left">
                                        <span><i class="fa fa-tasks"/> <field name="task_count"/></span>
                                    </div>
                                    <div class="oe_kanban_bottom_right">
                                        <field name="manager_id" widget="many2one_avatar_user"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>

    <!-- Project Search View -->
    <record id="view_${mn}_project_search" model="ir.ui.view">
        <field name="name">${mn}.project.search</field>
        <field name="model">${mn}.project</field>
        <field name="arch" type="xml">
            <search string="Search Projects">
                <field name="name"/>
                <field name="code"/>
                <field name="manager_id"/>
                <filter string="My Projects" name="my_projects"
                        domain="[('manager_id', '=', uid)]"/>
                <filter string="Archived" name="archived" domain="[('active', '=', False)]"/>
                <group expand="0" string="Group By">
                    <filter string="Manager" name="manager" context="{'group_by': 'manager_id'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Project Action -->
    <record id="action_${mn}_project" model="ir.actions.act_window">
        <field name="name">Projects</field>
        <field name="res_model">${mn}.project</field>
        <field name="view_mode">kanban,tree,form</field>
        <field name="search_view_id" ref="view_${mn}_project_search"/>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first project!
            </p>
        </field>
    </record>
</odoo>
`;
}

export function generateTaskViews(config: ModuleConfig): string {
  const mn = config.moduleName;

  let formExtraFields = "";
  let kanbanExtraFields = "";
  let treeExtraColumns = "";
  let searchExtraFilters = "";
  let formNotebookPages = "";

  if (config.enableSprints) {
    formExtraFields += `                            <field name="sprint_id"/>
`;
    treeExtraColumns += `                <field name="sprint_id" optional="show"/>
`;
    searchExtraFilters += `                <field name="sprint_id"/>
                <filter string="No Sprint" name="no_sprint" domain="[('sprint_id', '=', False)]"/>
`;
  }

  if (config.enableTags) {
    formExtraFields += `                            <field name="tag_ids" widget="many2many_tags"
                                   options="{'color_field': 'color'}"/>
`;
    kanbanExtraFields += `                        <field name="tag_ids"/>
`;
  }

  if (config.enableTimelog) {
    formExtraFields += `                            <field name="estimated_hours"/>
                            <field name="total_hours"/>
`;
    formNotebookPages += `
                        <page string="Time Logs">
                            <field name="timelog_ids">
                                <tree editable="bottom">
                                    <field name="date"/>
                                    <field name="user_id"/>
                                    <field name="hours"/>
                                    <field name="description"/>
                                </tree>
                            </field>
                        </page>`;
  }

  if (config.enableSubtasks) {
    formNotebookPages += `
                        <page string="Subtasks">
                            <field name="subtask_ids">
                                <tree editable="bottom">
                                    <field name="sequence" widget="handle"/>
                                    <field name="name"/>
                                    <field name="assigned_to"/>
                                    <field name="is_done"/>
                                </tree>
                            </field>
                            <group>
                                <field name="subtask_progress" widget="progressbar"/>
                            </group>
                        </page>`;
  }

  if (config.enableDocuments) {
    formNotebookPages += `
                        <page string="Documents">
                            <field name="document_ids">
                                <tree>
                                    <field name="name"/>
                                    <field name="doc_type"/>
                                    <field name="space_id"/>
                                    <field name="state"/>
                                    <field name="author_id"/>
                                </tree>
                            </field>
                        </page>`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Task Form View -->
    <record id="view_${mn}_task_form" model="ir.ui.view">
        <field name="name">${mn}.task.form</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <form string="Task">
                <header>
                    <field name="stage_id" widget="statusbar"
                           options="{'clickable': '1'}"/>
                </header>
                <sheet>
                    <div class="oe_title">
                        <h1>
                            <field name="name" placeholder="Task Title"/>
                        </h1>
                        <h3>
                            <field name="display_name" readonly="1"/>
                        </h3>
                    </div>
                    <group>
                        <group>
                            <field name="project_id"/>
                            <field name="task_type"/>
                            <field name="assigned_to"/>
                            <field name="reviewer_id"/>
                            <field name="priority"/>
${formExtraFields}
                        </group>
                        <group>
                            <field name="date_start"/>
                            <field name="date_deadline" decoration-danger="is_overdue"/>
                            <field name="story_points"/>
                            <field name="kanban_state" widget="state_selection"/>
                            <field name="progress" widget="progressbar"/>
                            <field name="creator_id"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Description">
                            <field name="description"/>
                        </page>${formNotebookPages}
                    </notebook>
                </sheet>
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- Task Tree View -->
    <record id="view_${mn}_task_tree" model="ir.ui.view">
        <field name="name">${mn}.task.tree</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <tree string="Tasks" default_order="priority desc, sequence">
                <field name="sequence" widget="handle"/>
                <field name="display_name" string="ID"/>
                <field name="name"/>
                <field name="project_id"/>
                <field name="task_type"/>
                <field name="assigned_to"/>
                <field name="priority"/>
                <field name="stage_id"/>
                <field name="date_deadline"/>
                <field name="story_points"/>
${treeExtraColumns}
                <field name="kanban_state" widget="state_selection"/>
            </tree>
        </field>
    </record>

    <!-- Task Kanban View (Trello/Jira style) -->
    <record id="view_${mn}_task_kanban" model="ir.ui.view">
        <field name="name">${mn}.task.kanban</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <kanban default_group_by="stage_id" class="o_kanban_small_column"
                    on_create="quick_create"
                    quick_create_view="view_${mn}_task_form_quick_create">
                <field name="name"/>
                <field name="project_id"/>
                <field name="assigned_to"/>
                <field name="priority"/>
                <field name="task_type"/>
                <field name="date_deadline"/>
                <field name="kanban_state"/>
                <field name="stage_id"/>
                <field name="color"/>
                <field name="story_points"/>
                <field name="is_overdue"/>
${kanbanExtraFields}
                <progressbar field="kanban_state"
                             colors='{"done": "success", "blocked": "danger", "normal": "200"}'/>
                <templates>
                    <t t-name="kanban-box">
                        <div t-attf-class="#{!selection_mode ? kanban_color(record.color.raw_value) : ''} oe_kanban_global_click oe_kanban_card">
                            <div class="oe_kanban_content">
                                <div class="o_kanban_record_top">
                                    <div class="o_kanban_record_headings">
                                        <span class="badge bg-secondary me-1">
                                            <t t-if="record.task_type.raw_value == 'bug'">🐛</t>
                                            <t t-elif="record.task_type.raw_value == 'feature'">✨</t>
                                            <t t-elif="record.task_type.raw_value == 'improvement'">📈</t>
                                            <t t-elif="record.task_type.raw_value == 'epic'">🎯</t>
                                            <t t-else="">📋</t>
                                            <field name="task_type"/>
                                        </span>
                                        <t t-if="record.story_points.raw_value > 0">
                                            <span class="badge bg-info ms-1">
                                                <field name="story_points"/> SP
                                            </span>
                                        </t>
                                    </div>
                                    <div class="o_dropdown_kanban dropdown">
                                        <a class="dropdown-toggle o-no-caret btn" role="button"
                                           data-bs-toggle="dropdown" href="#">
                                            <span class="fa fa-ellipsis-v"/>
                                        </a>
                                        <div class="dropdown-menu" role="menu">
                                            <a role="menuitem" type="edit" class="dropdown-item">Edit</a>
                                            <a role="menuitem" type="delete" class="dropdown-item">Delete</a>
                                            <ul class="oe_kanban_colorpicker" data-field="color"/>
                                        </div>
                                    </div>
                                </div>
                                <div class="o_kanban_record_body">
                                    <strong><field name="name"/></strong>
                                    <div class="text-muted mt-1">
                                        <field name="project_id"/>
                                    </div>
                                </div>
                                <div class="o_kanban_record_bottom mt-2">
                                    <div class="oe_kanban_bottom_left">
                                        <field name="priority" widget="priority"/>
                                        <t t-if="record.date_deadline.raw_value">
                                            <span t-attf-class="badge #{record.is_overdue.raw_value ? 'bg-danger' : 'bg-light text-dark'}">
                                                <i class="fa fa-clock-o"/>
                                                <field name="date_deadline"/>
                                            </span>
                                        </t>
                                    </div>
                                    <div class="oe_kanban_bottom_right">
                                        <field name="kanban_state" widget="state_selection"/>
                                        <field name="assigned_to" widget="many2one_avatar_user"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>

    <!-- Quick Create Form -->
    <record id="view_${mn}_task_form_quick_create" model="ir.ui.view">
        <field name="name">${mn}.task.form.quick_create</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <form>
                <group>
                    <field name="name" placeholder="Task title..."/>
                    <field name="project_id"/>
                    <field name="assigned_to"/>
                    <field name="task_type"/>
                </group>
            </form>
        </field>
    </record>

    <!-- Task Search View -->
    <record id="view_${mn}_task_search" model="ir.ui.view">
        <field name="name">${mn}.task.search</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <search string="Search Tasks">
                <field name="name"/>
                <field name="project_id"/>
                <field name="assigned_to"/>
${searchExtraFilters}
                <filter string="My Tasks" name="my_tasks"
                        domain="[('assigned_to', '=', uid)]"/>
                <filter string="Unassigned" name="unassigned"
                        domain="[('assigned_to', '=', False)]"/>
                <filter string="Overdue" name="overdue"
                        domain="[('is_overdue', '=', True)]"/>
                <separator/>
                <filter string="Bugs" name="bugs" domain="[('task_type', '=', 'bug')]"/>
                <filter string="Features" name="features" domain="[('task_type', '=', 'feature')]"/>
                <separator/>
                <filter string="High Priority" name="high_priority"
                        domain="[('priority', 'in', ['2', '3'])]"/>
                <group expand="0" string="Group By">
                    <filter string="Stage" name="stage" context="{'group_by': 'stage_id'}"/>
                    <filter string="Project" name="project" context="{'group_by': 'project_id'}"/>
                    <filter string="Assignee" name="assignee" context="{'group_by': 'assigned_to'}"/>
                    <filter string="Priority" name="priority" context="{'group_by': 'priority'}"/>
                    <filter string="Type" name="type" context="{'group_by': 'task_type'}"/>
                    <filter string="Deadline" name="deadline" context="{'group_by': 'date_deadline'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Task Action -->
    <record id="action_${mn}_task" model="ir.actions.act_window">
        <field name="name">Tasks</field>
        <field name="res_model">${mn}.task</field>
        <field name="view_mode">kanban,tree,form</field>
        <field name="search_view_id" ref="view_${mn}_task_search"/>
        <field name="context">{'search_default_my_tasks': 1}</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first task!
            </p>
            <p>Organize your work with a Kanban board.</p>
        </field>
    </record>
</odoo>
`;
}

export function generateMenuViews(config: ModuleConfig): string {
  const mn = config.moduleName;
  let extraMenus = "";

  if (config.enableSprints) {
    extraMenus += `
    <menuitem id="menu_${mn}_sprint"
              name="Sprints"
              parent="menu_${mn}_main"
              action="action_${mn}_sprint"
              sequence="30"/>
`;
  }

  if (config.enableTimelog) {
    extraMenus += `
    <menuitem id="menu_${mn}_timelog"
              name="Time Logs"
              parent="menu_${mn}_main"
              action="action_${mn}_timelog"
              sequence="40"/>
`;
  }

  let docMenus = "";
  if (config.enableDocuments) {
    docMenus = `
    <!-- Documents Menu -->
    <menuitem id="menu_${mn}_docs"
              name="Documents"
              parent="menu_${mn}_root"
              sequence="20"/>

    <menuitem id="menu_${mn}_doc_spaces"
              name="Spaces"
              parent="menu_${mn}_docs"
              action="action_${mn}_doc_space"
              sequence="10"/>

    <menuitem id="menu_${mn}_all_documents"
              name="All Documents"
              parent="menu_${mn}_docs"
              action="action_${mn}_document"
              sequence="20"/>

    <menuitem id="menu_${mn}_my_documents"
              name="My Documents"
              parent="menu_${mn}_docs"
              action="action_${mn}_my_documents"
              sequence="30"/>
${config.enableDocTemplates ? `
    <menuitem id="menu_${mn}_doc_templates"
              name="Templates"
              parent="menu_${mn}_docs"
              action="action_${mn}_doc_template"
              sequence="40"/>
` : ''}`;
  }

  let configMenus = "";
  if (config.enableDocuments) {
    configMenus += `
    <menuitem id="menu_${mn}_doc_category_config"
              name="Document Categories"
              parent="menu_${mn}_config"
              action="action_${mn}_doc_category"
              sequence="30"/>

    <menuitem id="menu_${mn}_doc_label_config"
              name="Document Labels"
              parent="menu_${mn}_config"
              action="action_${mn}_doc_label"
              sequence="40"/>
`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Main Menu -->
    <menuitem id="menu_${mn}_root"
              name="${config.moduleTitle}"
              web_icon="${mn},static/description/icon.png"
              sequence="45"/>

    <menuitem id="menu_${mn}_main"
              name="Board"
              parent="menu_${mn}_root"
              sequence="10"/>

    <menuitem id="menu_${mn}_project"
              name="Projects"
              parent="menu_${mn}_main"
              action="action_${mn}_project"
              sequence="10"/>

    <menuitem id="menu_${mn}_task"
              name="Tasks"
              parent="menu_${mn}_main"
              action="action_${mn}_task"
              sequence="20"/>
${extraMenus}
    <menuitem id="menu_${mn}_dashboard"
              name="Dashboard"
              parent="menu_${mn}_main"
              action="action_${mn}_dashboard"
              sequence="90"/>
${docMenus}
    <!-- Configuration Menu -->
    <menuitem id="menu_${mn}_config"
              name="Configuration"
              parent="menu_${mn}_root"
              sequence="100"/>

    <menuitem id="menu_${mn}_stage_config"
              name="Stages"
              parent="menu_${mn}_config"
              action="action_${mn}_stage_config"
              sequence="10"/>
${config.enableTags ? `
    <menuitem id="menu_${mn}_tag_config"
              name="Tags"
              parent="menu_${mn}_config"
              action="action_${mn}_tag"
              sequence="20"/>
` : ''}${configMenus}
    <!-- Stage Config Action -->
    <record id="action_${mn}_stage_config" model="ir.actions.act_window">
        <field name="name">Stages</field>
        <field name="res_model">${mn}.stage</field>
        <field name="view_mode">tree,form</field>
    </record>
${config.enableTags ? `
    <!-- Tag Action -->
    <record id="action_${mn}_tag" model="ir.actions.act_window">
        <field name="name">Tags</field>
        <field name="res_model">${mn}.tag</field>
        <field name="view_mode">tree,form</field>
    </record>
` : ''}${config.enableDocuments ? `
    <!-- Document Category Action -->
    <record id="action_${mn}_doc_category" model="ir.actions.act_window">
        <field name="name">Document Categories</field>
        <field name="res_model">${mn}.doc.category</field>
        <field name="view_mode">tree,form</field>
    </record>

    <!-- Document Label Action -->
    <record id="action_${mn}_doc_label" model="ir.actions.act_window">
        <field name="name">Document Labels</field>
        <field name="res_model">${mn}.doc.label</field>
        <field name="view_mode">tree,form</field>
    </record>
` : ''}
</odoo>
`;
}

export function generateSprintViews(config: ModuleConfig): string {
  const mn = config.moduleName;
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Sprint Form View -->
    <record id="view_${mn}_sprint_form" model="ir.ui.view">
        <field name="name">${mn}.sprint.form</field>
        <field name="model">${mn}.sprint</field>
        <field name="arch" type="xml">
            <form string="Sprint">
                <header>
                    <button name="action_start" string="Start Sprint" type="object"
                            class="btn-primary"
                            attrs="{'invisible': [('state', '!=', 'draft')]}"/>
                    <button name="action_complete" string="Complete Sprint" type="object"
                            class="btn-success"
                            attrs="{'invisible': [('state', '!=', 'active')]}"/>
                    <field name="state" widget="statusbar"/>
                </header>
                <sheet>
                    <div class="oe_title">
                        <h1><field name="name"/></h1>
                    </div>
                    <group>
                        <group>
                            <field name="project_id"/>
                            <field name="date_start"/>
                            <field name="date_end"/>
                        </group>
                        <group>
                            <field name="task_count"/>
                            <field name="velocity"/>
                            <field name="progress" widget="progressbar"/>
                        </group>
                    </group>
                    <group string="Sprint Goal">
                        <field name="goal" nolabel="1"/>
                    </group>
                    <notebook>
                        <page string="Tasks">
                            <field name="task_ids">
                                <tree>
                                    <field name="name"/>
                                    <field name="assigned_to"/>
                                    <field name="priority"/>
                                    <field name="stage_id"/>
                                    <field name="story_points"/>
                                </tree>
                            </field>
                        </page>
                    </notebook>
                </sheet>
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- Sprint Tree View -->
    <record id="view_${mn}_sprint_tree" model="ir.ui.view">
        <field name="name">${mn}.sprint.tree</field>
        <field name="model">${mn}.sprint</field>
        <field name="arch" type="xml">
            <tree string="Sprints">
                <field name="name"/>
                <field name="project_id"/>
                <field name="state"/>
                <field name="date_start"/>
                <field name="date_end"/>
                <field name="task_count"/>
                <field name="velocity"/>
                <field name="progress" widget="progressbar"/>
            </tree>
        </field>
    </record>

    <!-- Sprint Action -->
    <record id="action_${mn}_sprint" model="ir.actions.act_window">
        <field name="name">Sprints</field>
        <field name="res_model">${mn}.sprint</field>
        <field name="view_mode">tree,form</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first sprint!
            </p>
        </field>
    </record>
</odoo>
`;
}

export function generateTimelogViews(config: ModuleConfig): string {
  const mn = config.moduleName;
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Timelog Tree View -->
    <record id="view_${mn}_timelog_tree" model="ir.ui.view">
        <field name="name">${mn}.timelog.tree</field>
        <field name="model">${mn}.timelog</field>
        <field name="arch" type="xml">
            <tree string="Time Logs" editable="bottom">
                <field name="date"/>
                <field name="project_id"/>
                <field name="task_id" domain="[('project_id', '=', project_id)]"/>
                <field name="user_id"/>
                <field name="hours" sum="Total Hours"/>
                <field name="description"/>
            </tree>
        </field>
    </record>

    <!-- Timelog Search View -->
    <record id="view_${mn}_timelog_search" model="ir.ui.view">
        <field name="name">${mn}.timelog.search</field>
        <field name="model">${mn}.timelog</field>
        <field name="arch" type="xml">
            <search string="Search Time Logs">
                <field name="task_id"/>
                <field name="project_id"/>
                <field name="user_id"/>
                <filter string="My Time" name="my_time"
                        domain="[('user_id', '=', uid)]"/>
                <filter string="Today" name="today"
                        domain="[('date', '=', context_today().strftime('%Y-%m-%d'))]"/>
                <group expand="0" string="Group By">
                    <filter string="Project" name="project" context="{'group_by': 'project_id'}"/>
                    <filter string="Task" name="task" context="{'group_by': 'task_id'}"/>
                    <filter string="User" name="user" context="{'group_by': 'user_id'}"/>
                    <filter string="Date" name="date" context="{'group_by': 'date:month'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Timelog Action -->
    <record id="action_${mn}_timelog" model="ir.actions.act_window">
        <field name="name">Time Logs</field>
        <field name="res_model">${mn}.timelog</field>
        <field name="view_mode">tree</field>
        <field name="search_view_id" ref="view_${mn}_timelog_search"/>
        <field name="context">{'search_default_my_time': 1}</field>
    </record>
</odoo>
`;
}

export function generateDashboardViews(config: ModuleConfig): string {
  const mn = config.moduleName;
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Dashboard Action -->
    <record id="action_${mn}_dashboard" model="ir.actions.act_window">
        <field name="name">Dashboard</field>
        <field name="res_model">${mn}.task</field>
        <field name="view_mode">pivot,graph</field>
        <field name="context">{
            'search_default_stage': 1,
        }</field>
    </record>
</odoo>
`;
}

// ========== DOCUMENT VIEWS ==========

export function generateDocSpaceViews(config: ModuleConfig): string {
  const mn = config.moduleName;
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Document Space Form View -->
    <record id="view_${mn}_doc_space_form" model="ir.ui.view">
        <field name="name">${mn}.doc.space.form</field>
        <field name="model">${mn}.doc.space</field>
        <field name="arch" type="xml">
            <form string="Document Space">
                <sheet>
                    <div class="oe_button_box" name="button_box">
                        <button name="%(action_${mn}_document)d" type="action"
                                class="oe_stat_button" icon="fa-file-text-o"
                                context="{'default_space_id': active_id, 'search_default_space_id': active_id}">
                            <field name="document_count" widget="statinfo" string="Documents"/>
                        </button>
                    </div>
                    <widget name="web_ribbon" title="Archived" bg_color="bg-danger"
                            attrs="{'invisible': [('active', '=', True)]}"/>
                    <div class="oe_title">
                        <h1>
                            <field name="icon" readonly="1" class="me-2"/>
                            <field name="name" placeholder="Space Name"/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="key"/>
                            <field name="icon"/>
                            <field name="is_public"/>
                        </group>
                        <group>
                            <field name="admin_ids" widget="many2many_tags"/>
                            <field name="member_ids" widget="many2many_tags"
                                   attrs="{'invisible': [('is_public', '=', True)]}"/>
                            <field name="active" invisible="1"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Description">
                            <field name="description" placeholder="Space description..."/>
                        </page>
                        <page string="Categories">
                            <field name="category_ids">
                                <tree editable="bottom">
                                    <field name="sequence" widget="handle"/>
                                    <field name="icon"/>
                                    <field name="name"/>
                                    <field name="parent_id"/>
                                    <field name="document_count"/>
                                </tree>
                            </field>
                        </page>
                    </notebook>
                </sheet>
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- Document Space Tree View -->
    <record id="view_${mn}_doc_space_tree" model="ir.ui.view">
        <field name="name">${mn}.doc.space.tree</field>
        <field name="model">${mn}.doc.space</field>
        <field name="arch" type="xml">
            <tree string="Document Spaces">
                <field name="sequence" widget="handle"/>
                <field name="icon"/>
                <field name="key"/>
                <field name="name"/>
                <field name="is_public"/>
                <field name="document_count"/>
                <field name="page_count"/>
            </tree>
        </field>
    </record>

    <!-- Document Space Kanban View -->
    <record id="view_${mn}_doc_space_kanban" model="ir.ui.view">
        <field name="name">${mn}.doc.space.kanban</field>
        <field name="model">${mn}.doc.space</field>
        <field name="arch" type="xml">
            <kanban class="o_kanban_mobile">
                <field name="name"/>
                <field name="key"/>
                <field name="icon"/>
                <field name="document_count"/>
                <field name="color"/>
                <templates>
                    <t t-name="kanban-box">
                        <div t-attf-class="oe_kanban_color_#{kanban_getcolor(record.color.raw_value)} oe_kanban_card oe_kanban_global_click">
                            <div class="oe_kanban_content">
                                <div class="o_kanban_record_top">
                                    <div class="o_kanban_record_headings">
                                        <strong class="o_kanban_record_title">
                                            <t t-if="record.icon.raw_value == 'folder'">📁</t>
                                            <t t-elif="record.icon.raw_value == 'book'">📖</t>
                                            <t t-elif="record.icon.raw_value == 'lightbulb'">💡</t>
                                            <t t-elif="record.icon.raw_value == 'rocket'">🚀</t>
                                            <t t-elif="record.icon.raw_value == 'gear'">⚙️</t>
                                            <t t-elif="record.icon.raw_value == 'users'">👥</t>
                                            <t t-elif="record.icon.raw_value == 'chart'">📊</t>
                                            <t t-elif="record.icon.raw_value == 'shield'">🛡️</t>
                                            <t t-else="">📁</t>
                                            <field name="name"/>
                                        </strong>
                                    </div>
                                </div>
                                <div class="o_kanban_record_body">
                                    <span class="badge bg-secondary"><field name="key"/></span>
                                </div>
                                <div class="o_kanban_record_bottom">
                                    <div class="oe_kanban_bottom_left">
                                        <span><i class="fa fa-file-text-o"/> <field name="document_count"/> docs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>

    <!-- Document Space Action -->
    <record id="action_${mn}_doc_space" model="ir.actions.act_window">
        <field name="name">Document Spaces</field>
        <field name="res_model">${mn}.doc.space</field>
        <field name="view_mode">kanban,tree,form</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first document space!
            </p>
            <p>Organize your documentation into logical spaces like Confluence.</p>
        </field>
    </record>
</odoo>
`;
}

export function generateDocumentViews(config: ModuleConfig): string {
  const mn = config.moduleName;

  let versionPage = "";
  if (config.enableDocVersioning) {
    versionPage = `
                        <page string="Version History">
                            <button name="action_create_version" type="object"
                                    string="Create Version Snapshot" class="btn-secondary mb-2"/>
                            <field name="version_ids">
                                <tree>
                                    <field name="version_number"/>
                                    <field name="created_by"/>
                                    <field name="created_at"/>
                                    <field name="change_summary"/>
                                    <button name="action_restore" type="object" string="Restore"
                                            class="btn-link"/>
                                </tree>
                            </field>
                        </page>`;
  }

  let templateField = "";
  if (config.enableDocTemplates) {
    templateField = `                            <field name="template_id"/>
`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Document Form View -->
    <record id="view_${mn}_document_form" model="ir.ui.view">
        <field name="name">${mn}.document.form</field>
        <field name="model">${mn}.document</field>
        <field name="arch" type="xml">
            <form string="Document">
                <header>
                    <button name="action_publish" string="Publish" type="object"
                            class="btn-primary"
                            attrs="{'invisible': [('state', '=', 'published')]}"/>
                    <button name="action_draft" string="Back to Draft" type="object"
                            attrs="{'invisible': [('state', 'in', ['draft'])]}"/>
                    <button name="action_archive" string="Archive" type="object"
                            attrs="{'invisible': [('state', '=', 'archived')]}"/>
                    <field name="state" widget="statusbar"
                           statusbar_visible="draft,review,published"/>
                </header>
                <sheet>
                    <div class="oe_button_box" name="button_box">
                        <button class="oe_stat_button" icon="fa-eye" disabled="1">
                            <field name="view_count" widget="statinfo" string="Views"/>
                        </button>
                        <button class="oe_stat_button" icon="fa-files-o"
                                name="%(action_${mn}_document)d" type="action"
                                context="{'search_default_parent_id': active_id}"
                                attrs="{'invisible': [('child_count', '=', 0)]}">
                            <field name="child_count" widget="statinfo" string="Subpages"/>
                        </button>
                    </div>
                    <div class="oe_title">
                        <h1>
                            <field name="icon" class="me-2"/>
                            <field name="name" placeholder="Document Title"/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="space_id"/>
                            <field name="category_id" domain="[('space_id', '=', space_id)]"/>
                            <field name="parent_id" domain="[('space_id', '=', space_id)]"/>
                            <field name="doc_type"/>
${templateField}
                        </group>
                        <group>
                            <field name="author_id"/>
                            <field name="label_ids" widget="many2many_tags"
                                   options="{'color_field': 'color'}"/>
                            <field name="is_pinned"/>
                            <field name="is_starred"/>
                            <field name="task_ids" widget="many2many_tags"/>
                        </group>
                    </group>
                    <group>
                        <field name="summary" placeholder="Brief summary for search results..."/>
                    </group>
                    <notebook>
                        <page string="Content">
                            <field name="content" placeholder="Start writing..."/>
                        </page>
                        <page string="Attachments">
                            <field name="attachment_ids">
                                <tree>
                                    <field name="name"/>
                                    <field name="mimetype"/>
                                    <field name="file_size"/>
                                    <field name="create_date"/>
                                </tree>
                            </field>
                        </page>${versionPage}
                    </notebook>
                </sheet>
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- Document Tree View -->
    <record id="view_${mn}_document_tree" model="ir.ui.view">
        <field name="name">${mn}.document.tree</field>
        <field name="model">${mn}.document</field>
        <field name="arch" type="xml">
            <tree string="Documents">
                <field name="sequence" widget="handle"/>
                <field name="icon"/>
                <field name="name"/>
                <field name="space_id"/>
                <field name="category_id"/>
                <field name="doc_type"/>
                <field name="state" widget="badge"
                       decoration-success="state == 'published'"
                       decoration-info="state == 'draft'"
                       decoration-warning="state == 'review'"/>
                <field name="author_id"/>
                <field name="view_count"/>
                <field name="write_date"/>
            </tree>
        </field>
    </record>

    <!-- Document Kanban View (Confluence-style) -->
    <record id="view_${mn}_document_kanban" model="ir.ui.view">
        <field name="name">${mn}.document.kanban</field>
        <field name="model">${mn}.document</field>
        <field name="arch" type="xml">
            <kanban default_group_by="category_id" class="o_kanban_small_column">
                <field name="name"/>
                <field name="icon"/>
                <field name="space_id"/>
                <field name="doc_type"/>
                <field name="state"/>
                <field name="author_id"/>
                <field name="is_pinned"/>
                <field name="view_count"/>
                <field name="color"/>
                <templates>
                    <t t-name="kanban-box">
                        <div t-attf-class="#{!selection_mode ? kanban_color(record.color.raw_value) : ''} oe_kanban_global_click oe_kanban_card">
                            <div class="oe_kanban_content">
                                <div class="o_kanban_record_top">
                                    <div class="o_kanban_record_headings">
                                        <span t-if="record.is_pinned.raw_value" class="me-1">📌</span>
                                        <span class="badge bg-secondary me-1">
                                            <t t-if="record.doc_type.raw_value == 'page'">📄</t>
                                            <t t-elif="record.doc_type.raw_value == 'blog'">📝</t>
                                            <t t-elif="record.doc_type.raw_value == 'meeting'">📅</t>
                                            <t t-elif="record.doc_type.raw_value == 'decision'">⚖️</t>
                                            <t t-elif="record.doc_type.raw_value == 'howto'">📖</t>
                                            <t t-elif="record.doc_type.raw_value == 'faq'">❓</t>
                                            <t t-elif="record.doc_type.raw_value == 'requirement'">📋</t>
                                            <t t-elif="record.doc_type.raw_value == 'runbook'">🔧</t>
                                            <t t-else="">📄</t>
                                            <field name="doc_type"/>
                                        </span>
                                    </div>
                                    <div class="o_dropdown_kanban dropdown">
                                        <a class="dropdown-toggle o-no-caret btn" role="button"
                                           data-bs-toggle="dropdown" href="#">
                                            <span class="fa fa-ellipsis-v"/>
                                        </a>
                                        <div class="dropdown-menu" role="menu">
                                            <a role="menuitem" type="edit" class="dropdown-item">Edit</a>
                                            <a role="menuitem" type="delete" class="dropdown-item">Delete</a>
                                            <ul class="oe_kanban_colorpicker" data-field="color"/>
                                        </div>
                                    </div>
                                </div>
                                <div class="o_kanban_record_body">
                                    <strong><field name="name"/></strong>
                                    <div class="text-muted mt-1">
                                        <field name="space_id"/>
                                    </div>
                                </div>
                                <div class="o_kanban_record_bottom mt-2">
                                    <div class="oe_kanban_bottom_left">
                                        <field name="state" widget="badge"
                                               decoration-success="state == 'published'"
                                               decoration-info="state == 'draft'"/>
                                        <span class="ms-2 text-muted">
                                            <i class="fa fa-eye"/> <field name="view_count"/>
                                        </span>
                                    </div>
                                    <div class="oe_kanban_bottom_right">
                                        <field name="author_id" widget="many2one_avatar_user"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>

    <!-- Document Search View -->
    <record id="view_${mn}_document_search" model="ir.ui.view">
        <field name="name">${mn}.document.search</field>
        <field name="model">${mn}.document</field>
        <field name="arch" type="xml">
            <search string="Search Documents">
                <field name="name"/>
                <field name="content"/>
                <field name="space_id"/>
                <field name="category_id"/>
                <field name="author_id"/>
                <field name="label_ids"/>
                <filter string="My Documents" name="my_docs"
                        domain="[('author_id', '=', uid)]"/>
                <filter string="Starred" name="starred"
                        domain="[('starred_by_ids', 'in', uid)]"/>
                <filter string="Pinned" name="pinned"
                        domain="[('is_pinned', '=', True)]"/>
                <separator/>
                <filter string="Draft" name="draft" domain="[('state', '=', 'draft')]"/>
                <filter string="Published" name="published" domain="[('state', '=', 'published')]"/>
                <separator/>
                <filter string="Pages" name="pages" domain="[('doc_type', '=', 'page')]"/>
                <filter string="Meeting Notes" name="meetings" domain="[('doc_type', '=', 'meeting')]"/>
                <filter string="How-To Guides" name="howtos" domain="[('doc_type', '=', 'howto')]"/>
                <group expand="0" string="Group By">
                    <filter string="Space" name="space" context="{'group_by': 'space_id'}"/>
                    <filter string="Category" name="category" context="{'group_by': 'category_id'}"/>
                    <filter string="Type" name="type" context="{'group_by': 'doc_type'}"/>
                    <filter string="Status" name="status" context="{'group_by': 'state'}"/>
                    <filter string="Author" name="author" context="{'group_by': 'author_id'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Document Action -->
    <record id="action_${mn}_document" model="ir.actions.act_window">
        <field name="name">Documents</field>
        <field name="res_model">${mn}.document</field>
        <field name="view_mode">kanban,tree,form</field>
        <field name="search_view_id" ref="view_${mn}_document_search"/>
        <field name="context">{'search_default_published': 1}</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first document!
            </p>
            <p>Build your knowledge base with wiki-style pages.</p>
        </field>
    </record>

    <!-- My Documents Action -->
    <record id="action_${mn}_my_documents" model="ir.actions.act_window">
        <field name="name">My Documents</field>
        <field name="res_model">${mn}.document</field>
        <field name="view_mode">kanban,tree,form</field>
        <field name="search_view_id" ref="view_${mn}_document_search"/>
        <field name="context">{'search_default_my_docs': 1}</field>
    </record>
${config.enableDocTemplates ? `
    <!-- Document Template Tree View -->
    <record id="view_${mn}_doc_template_tree" model="ir.ui.view">
        <field name="name">${mn}.doc.template.tree</field>
        <field name="model">${mn}.doc.template</field>
        <field name="arch" type="xml">
            <tree string="Document Templates">
                <field name="sequence" widget="handle"/>
                <field name="icon"/>
                <field name="name"/>
                <field name="doc_type"/>
                <field name="is_global"/>
                <field name="space_id"/>
            </tree>
        </field>
    </record>

    <!-- Document Template Form View -->
    <record id="view_${mn}_doc_template_form" model="ir.ui.view">
        <field name="name">${mn}.doc.template.form</field>
        <field name="model">${mn}.doc.template</field>
        <field name="arch" type="xml">
            <form string="Document Template">
                <sheet>
                    <div class="oe_title">
                        <h1>
                            <field name="icon" class="me-2"/>
                            <field name="name" placeholder="Template Name"/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="doc_type"/>
                            <field name="is_global"/>
                            <field name="space_id" attrs="{'invisible': [('is_global', '=', True)]}"/>
                        </group>
                        <group>
                            <field name="description"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Template Content">
                            <field name="content"/>
                        </page>
                    </notebook>
                </sheet>
            </form>
        </field>
    </record>

    <!-- Document Template Action -->
    <record id="action_${mn}_doc_template" model="ir.actions.act_window">
        <field name="name">Document Templates</field>
        <field name="res_model">${mn}.doc.template</field>
        <field name="view_mode">tree,form</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create document templates!
            </p>
            <p>Templates help maintain consistency across your documentation.</p>
        </field>
    </record>
` : ''}
</odoo>
`;
}

export function generateBoardCSS(): string {
  return `/* Project Board Custom Styles */
.o_kanban_small_column .o_kanban_record {
    border-left: 3px solid #875A7B;
    margin-bottom: 8px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    transition: box-shadow 0.2s ease, transform 0.1s ease;
}

.o_kanban_small_column .o_kanban_record:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-1px);
}

.o_kanban_small_column .o_kanban_group_header {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
}

.o_kanban_small_column .badge {
    font-size: 11px;
}

/* Priority colors */
.o_priority .o_priority_star {
    font-size: 18px;
}

/* Task type badges */
.o_kanban_record .badge.bg-secondary {
    font-size: 10px;
    padding: 2px 6px;
}

/* Document styles */
.o_form_view .oe_title h1 .me-2 {
    font-size: 1.2em;
}

/* Document content styling */
.o_field_html .note-editable {
    min-height: 400px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 15px;
    line-height: 1.6;
}

.o_field_html .note-editable h1,
.o_field_html .note-editable h2,
.o_field_html .note-editable h3 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}

.o_field_html .note-editable pre {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
}

.o_field_html .note-editable code {
    background-color: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.9em;
}

.o_field_html .note-editable blockquote {
    border-left: 4px solid #875A7B;
    padding-left: 16px;
    margin-left: 0;
    color: #555;
}

.o_field_html .note-editable table {
    width: 100%;
    margin: 1em 0;
}

.o_field_html .note-editable table th,
.o_field_html .note-editable table td {
    padding: 8px 12px;
}
`;
}

export function generateBoardJS(config: ModuleConfig): string {
  return `/** @odoo-module **/
/* ${config.moduleTitle} - Board JavaScript */

import { registry } from "@web/core/registry";

// Custom behavior can be added here for enhanced kanban interactions
console.log("${config.moduleTitle} module loaded.");
`;
}
