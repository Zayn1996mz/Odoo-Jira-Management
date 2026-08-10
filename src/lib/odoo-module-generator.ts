// Clean Odoo 16 Module Generator - Proper Architecture

export interface ModuleConfig {
  moduleName: string;
  moduleTitle: string;
  authorName: string;
}

export function generateModule(config: ModuleConfig): Record<string, string> {
  const mn = config.moduleName;
  const files: Record<string, string> = {};

  // __manifest__.py
  files["__manifest__.py"] = `# -*- coding: utf-8 -*-
{
    'name': '${config.moduleTitle}',
    'version': '16.0.1.0.0',
    'category': 'Project',
    'summary': 'Jira/Trello-like Project Management with Scrum',
    'description': """
${config.moduleTitle}
=====================
Agile Project Management module for Odoo 16.

Features:
- Kanban board with drag & drop
- Sprint management
- Story points & velocity tracking
- Time logging
- Role-based access (Product Owner, Scrum Master, Team Member)
- Document management
    """,
    'author': '${config.authorName}',
    'website': '',
    'license': 'LGPL-3',
    'depends': ['base', 'mail'],
    'data': [
        'security/security_groups.xml',
        'security/ir.model.access.csv',
        'data/stage_data.xml',
        'views/project_views.xml',
        'views/task_views.xml',
        'views/sprint_views.xml',
        'views/timelog_views.xml',
        'views/menu_views.xml',
    ],
    'assets': {},
    'installable': True,
    'application': True,
    'auto_install': False,
}
`;

  // __init__.py
  files["__init__.py"] = `# -*- coding: utf-8 -*-
from . import models
`;

  // models/__init__.py
  files["models/__init__.py"] = `# -*- coding: utf-8 -*-
from . import project
from . import stage
from . import task
from . import sprint
from . import timelog
`;

  // models/project.py
  files["models/project.py"] = `# -*- coding: utf-8 -*-
from odoo import models, fields, api


class Project(models.Model):
    _name = '${mn}.project'
    _description = 'Project'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'

    name = fields.Char(string='Project Name', required=True, tracking=True)
    code = fields.Char(string='Project Key', required=True, size=10,
                       help='Short code for task numbering (e.g., PRJ)')
    description = fields.Html(string='Description')
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color Index')

    manager_id = fields.Many2one(
        'res.users', 
        string='Project Manager',
        default=lambda self: self.env.user,
        tracking=True
    )
    member_ids = fields.Many2many(
        'res.users',
        '${mn}_project_member_rel',
        'project_id',
        'user_id',
        string='Team Members'
    )
    
    task_ids = fields.One2many('${mn}.task', 'project_id', string='Tasks')
    sprint_ids = fields.One2many('${mn}.sprint', 'project_id', string='Sprints')
    
    task_count = fields.Integer(compute='_compute_task_count', string='Tasks')
    
    date_start = fields.Date(string='Start Date')
    date_end = fields.Date(string='End Date')

    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'Project code must be unique!'),
    ]

    @api.depends('task_ids')
    def _compute_task_count(self):
        for project in self:
            project.task_count = len(project.task_ids)
`;

  // models/stage.py
  files["models/stage.py"] = `# -*- coding: utf-8 -*-
from odoo import models, fields


class Stage(models.Model):
    _name = '${mn}.stage'
    _description = 'Task Stage'
    _order = 'sequence, name'

    name = fields.Char(string='Stage Name', required=True, translate=True)
    sequence = fields.Integer(default=10)
    fold = fields.Boolean(
        string='Folded in Kanban',
        help='This stage is folded in the kanban view.'
    )
    is_closed = fields.Boolean(
        string='Closing Stage',
        help='Tasks in this stage are considered as done.'
    )
    description = fields.Text(string='Description', translate=True)
`;

  // models/task.py
  files["models/task.py"] = `# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError


class Task(models.Model):
    _name = '${mn}.task'
    _description = 'Task'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'priority desc, sequence, id desc'

    name = fields.Char(string='Title', required=True, tracking=True)
    description = fields.Html(string='Description')
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color')

    project_id = fields.Many2one(
        '${mn}.project',
        string='Project',
        required=True,
        ondelete='cascade',
        tracking=True
    )
    stage_id = fields.Many2one(
        '${mn}.stage',
        string='Stage',
        tracking=True,
        index=True,
        copy=False,
        group_expand='_read_group_stage_ids',
        default=lambda self: self._get_default_stage()
    )
    sprint_id = fields.Many2one(
        '${mn}.sprint',
        string='Sprint',
        tracking=True,
        domain="[('project_id', '=', project_id), ('state', '!=', 'done')]"
    )
    
    user_id = fields.Many2one(
        'res.users',
        string='Assignee',
        tracking=True,
        index=True
    )
    reviewer_id = fields.Many2one('res.users', string='Reviewer')
    
    priority = fields.Selection([
        ('0', 'Low'),
        ('1', 'Normal'),
        ('2', 'High'),
        ('3', 'Urgent'),
    ], string='Priority', default='1', tracking=True)

    task_type = fields.Selection([
        ('task', 'Task'),
        ('bug', 'Bug'),
        ('feature', 'Feature'),
        ('improvement', 'Improvement'),
    ], string='Type', default='task', required=True, tracking=True)

    story_points = fields.Integer(string='Story Points', default=0)
    
    date_deadline = fields.Date(string='Deadline')
    date_start = fields.Date(string='Start Date')
    
    kanban_state = fields.Selection([
        ('normal', 'In Progress'),
        ('done', 'Ready'),
        ('blocked', 'Blocked'),
    ], string='Kanban State', default='normal', copy=False, tracking=True)

    tag_ids = fields.Many2many(
        '${mn}.tag',
        string='Tags'
    )
    
    timelog_ids = fields.One2many('${mn}.timelog', 'task_id', string='Time Logs')
    hours_spent = fields.Float(compute='_compute_hours_spent', string='Hours Spent', store=True)
    hours_planned = fields.Float(string='Planned Hours')

    @api.depends('timelog_ids.hours')
    def _compute_hours_spent(self):
        for task in self:
            task.hours_spent = sum(task.timelog_ids.mapped('hours'))

    def _get_default_stage(self):
        return self.env['${mn}.stage'].search([], limit=1, order='sequence')

    @api.model
    def _read_group_stage_ids(self, stages, domain, order):
        return self.env['${mn}.stage'].search([], order=order)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('stage_id'):
                vals['stage_id'] = self._get_default_stage().id
        return super().create(vals_list)


class Tag(models.Model):
    _name = '${mn}.tag'
    _description = 'Task Tag'

    name = fields.Char(string='Name', required=True)
    color = fields.Integer(string='Color')

    _sql_constraints = [
        ('name_uniq', 'unique (name)', 'Tag name already exists!'),
    ]
`;

  // models/sprint.py
  files["models/sprint.py"] = `# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import UserError


class Sprint(models.Model):
    _name = '${mn}.sprint'
    _description = 'Sprint'
    _order = 'date_start desc, id desc'
    _inherit = ['mail.thread']

    name = fields.Char(string='Sprint Name', required=True, tracking=True)
    project_id = fields.Many2one(
        '${mn}.project',
        string='Project',
        required=True,
        ondelete='cascade'
    )
    
    state = fields.Selection([
        ('draft', 'Planning'),
        ('active', 'Active'),
        ('done', 'Completed'),
    ], string='Status', default='draft', tracking=True, copy=False)

    date_start = fields.Date(string='Start Date', required=True)
    date_end = fields.Date(string='End Date', required=True)
    goal = fields.Text(string='Sprint Goal')

    task_ids = fields.One2many('${mn}.task', 'sprint_id', string='Tasks')
    
    task_count = fields.Integer(compute='_compute_stats', string='Task Count')
    story_points_total = fields.Integer(compute='_compute_stats', string='Total Story Points')
    story_points_done = fields.Integer(compute='_compute_stats', string='Done Story Points')
    velocity = fields.Integer(compute='_compute_stats', string='Velocity')

    @api.depends('task_ids', 'task_ids.story_points', 'task_ids.stage_id.is_closed')
    def _compute_stats(self):
        for sprint in self:
            tasks = sprint.task_ids
            sprint.task_count = len(tasks)
            sprint.story_points_total = sum(tasks.mapped('story_points'))
            done_tasks = tasks.filtered(lambda t: t.stage_id.is_closed)
            sprint.story_points_done = sum(done_tasks.mapped('story_points'))
            sprint.velocity = sprint.story_points_done if sprint.state == 'done' else 0

    def action_start(self):
        for sprint in self:
            if sprint.state != 'draft':
                raise UserError('Only planning sprints can be started.')
            # Check no other active sprint in same project
            active = self.search([
                ('project_id', '=', sprint.project_id.id),
                ('state', '=', 'active'),
                ('id', '!=', sprint.id)
            ])
            if active:
                raise UserError('There is already an active sprint in this project.')
            sprint.state = 'active'

    def action_complete(self):
        for sprint in self:
            if sprint.state != 'active':
                raise UserError('Only active sprints can be completed.')
            sprint.state = 'done'
`;

  // models/timelog.py
  files["models/timelog.py"] = `# -*- coding: utf-8 -*-
from odoo import models, fields, api


class Timelog(models.Model):
    _name = '${mn}.timelog'
    _description = 'Time Log'
    _order = 'date desc, id desc'

    task_id = fields.Many2one(
        '${mn}.task',
        string='Task',
        required=True,
        ondelete='cascade'
    )
    project_id = fields.Many2one(
        related='task_id.project_id',
        string='Project',
        store=True
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        default=lambda self: self.env.user,
        required=True
    )
    date = fields.Date(
        string='Date',
        default=fields.Date.context_today,
        required=True
    )
    hours = fields.Float(string='Hours', required=True)
    description = fields.Text(string='Description')
`;

  // security/security_groups.xml
  files["security/security_groups.xml"] = `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="0">
        
        <!-- Module Category -->
        <record id="module_category" model="ir.module.category">
            <field name="name">${config.moduleTitle}</field>
            <field name="sequence">50</field>
        </record>

        <!-- Team Member Group -->
        <record id="group_team_member" model="res.groups">
            <field name="name">Team Member</field>
            <field name="category_id" ref="module_category"/>
            <field name="comment">Can view and edit assigned tasks, log time.</field>
        </record>

        <!-- Project Manager Group -->
        <record id="group_project_manager" model="res.groups">
            <field name="name">Project Manager</field>
            <field name="category_id" ref="module_category"/>
            <field name="implied_ids" eval="[(4, ref('group_team_member'))]"/>
            <field name="comment">Can manage projects and all tasks within.</field>
        </record>

        <!-- Scrum Master Group -->
        <record id="group_scrum_master" model="res.groups">
            <field name="name">Scrum Master</field>
            <field name="category_id" ref="module_category"/>
            <field name="implied_ids" eval="[(4, ref('group_project_manager'))]"/>
            <field name="comment">Can manage sprints, stages, and team workflow.</field>
        </record>

        <!-- Product Owner Group -->
        <record id="group_product_owner" model="res.groups">
            <field name="name">Product Owner</field>
            <field name="category_id" ref="module_category"/>
            <field name="implied_ids" eval="[(4, ref('group_scrum_master'))]"/>
            <field name="comment">Full access to all module features.</field>
        </record>

    </data>
</odoo>
`;

  // security/ir.model.access.csv
  files["security/ir.model.access.csv"] = `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_project_team,${mn}.project team,model_${mn.replace(/\./g, '_')}_project,group_team_member,1,0,0,0
access_project_manager,${mn}.project manager,model_${mn.replace(/\./g, '_')}_project,group_project_manager,1,1,1,0
access_project_owner,${mn}.project owner,model_${mn.replace(/\./g, '_')}_project,group_product_owner,1,1,1,1
access_stage_team,${mn}.stage team,model_${mn.replace(/\./g, '_')}_stage,group_team_member,1,0,0,0
access_stage_master,${mn}.stage master,model_${mn.replace(/\./g, '_')}_stage,group_scrum_master,1,1,1,1
access_task_team,${mn}.task team,model_${mn.replace(/\./g, '_')}_task,group_team_member,1,1,1,0
access_task_owner,${mn}.task owner,model_${mn.replace(/\./g, '_')}_task,group_product_owner,1,1,1,1
access_sprint_team,${mn}.sprint team,model_${mn.replace(/\./g, '_')}_sprint,group_team_member,1,0,0,0
access_sprint_master,${mn}.sprint master,model_${mn.replace(/\./g, '_')}_sprint,group_scrum_master,1,1,1,1
access_timelog_team,${mn}.timelog team,model_${mn.replace(/\./g, '_')}_timelog,group_team_member,1,1,1,1
access_tag_team,${mn}.tag team,model_${mn.replace(/\./g, '_')}_tag,group_team_member,1,0,0,0
access_tag_manager,${mn}.tag manager,model_${mn.replace(/\./g, '_')}_tag,group_project_manager,1,1,1,1
`;

  // data/stage_data.xml
  files["data/stage_data.xml"] = `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <record id="stage_backlog" model="${mn}.stage">
            <field name="name">Backlog</field>
            <field name="sequence">1</field>
            <field name="fold">False</field>
            <field name="is_closed">False</field>
        </record>
        <record id="stage_todo" model="${mn}.stage">
            <field name="name">To Do</field>
            <field name="sequence">2</field>
            <field name="fold">False</field>
            <field name="is_closed">False</field>
        </record>
        <record id="stage_in_progress" model="${mn}.stage">
            <field name="name">In Progress</field>
            <field name="sequence">3</field>
            <field name="fold">False</field>
            <field name="is_closed">False</field>
        </record>
        <record id="stage_review" model="${mn}.stage">
            <field name="name">Code Review</field>
            <field name="sequence">4</field>
            <field name="fold">False</field>
            <field name="is_closed">False</field>
        </record>
        <record id="stage_done" model="${mn}.stage">
            <field name="name">Done</field>
            <field name="sequence">5</field>
            <field name="fold">True</field>
            <field name="is_closed">True</field>
        </record>
    </data>
</odoo>
`;

  // views/project_views.xml
  files["views/project_views.xml"] = `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    
    <!-- Project Form View -->
    <record id="view_project_form" model="ir.ui.view">
        <field name="name">${mn}.project.form</field>
        <field name="model">${mn}.project</field>
        <field name="arch" type="xml">
            <form string="Project">
                <sheet>
                    <div class="oe_button_box" name="button_box">
                        <button class="oe_stat_button" type="action" name="%(action_task)d"
                                icon="fa-tasks" context="{'default_project_id': active_id, 'search_default_project_id': active_id}">
                            <field string="Tasks" name="task_count" widget="statinfo"/>
                        </button>
                    </div>
                    <widget name="web_ribbon" title="Archived" bg_color="bg-danger" 
                            invisible="active"/>
                    <div class="oe_title">
                        <label for="name" string="Project Name"/>
                        <h1>
                            <field name="name" placeholder="Project Name..."/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="code"/>
                            <field name="manager_id" widget="many2one_avatar_user"/>
                            <field name="active" invisible="1"/>
                        </group>
                        <group>
                            <field name="date_start"/>
                            <field name="date_end"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Team Members" name="members">
                            <field name="member_ids" widget="many2many_tags" 
                                   options="{'color_field': 'color'}"/>
                        </page>
                        <page string="Description" name="description">
                            <field name="description" placeholder="Project description..."/>
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
    <record id="view_project_tree" model="ir.ui.view">
        <field name="name">${mn}.project.tree</field>
        <field name="model">${mn}.project</field>
        <field name="arch" type="xml">
            <tree string="Projects">
                <field name="sequence" widget="handle"/>
                <field name="code"/>
                <field name="name"/>
                <field name="manager_id" widget="many2one_avatar_user"/>
                <field name="task_count"/>
                <field name="date_start"/>
                <field name="date_end"/>
            </tree>
        </field>
    </record>

    <!-- Project Kanban View -->
    <record id="view_project_kanban" model="ir.ui.view">
        <field name="name">${mn}.project.kanban</field>
        <field name="model">${mn}.project</field>
        <field name="arch" type="xml">
            <kanban class="o_kanban_mobile">
                <field name="color"/>
                <templates>
                    <t t-name="kanban-box">
                        <div t-attf-class="oe_kanban_color_#{kanban_getcolor(record.color.raw_value)} oe_kanban_card oe_kanban_global_click">
                            <div class="oe_kanban_content">
                                <div class="o_kanban_record_top mb-0">
                                    <div class="o_kanban_record_headings">
                                        <strong class="o_kanban_record_title">
                                            <span class="badge text-bg-primary me-2"><field name="code"/></span>
                                            <field name="name"/>
                                        </strong>
                                    </div>
                                </div>
                                <div class="o_kanban_record_bottom">
                                    <div class="oe_kanban_bottom_left">
                                        <field name="task_count"/> tasks
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
    <record id="view_project_search" model="ir.ui.view">
        <field name="name">${mn}.project.search</field>
        <field name="model">${mn}.project</field>
        <field name="arch" type="xml">
            <search string="Search Projects">
                <field name="name"/>
                <field name="code"/>
                <field name="manager_id"/>
                <filter string="My Projects" name="my_projects" 
                        domain="['|', ('manager_id', '=', uid), ('member_ids', 'in', uid)]"/>
                <filter string="Archived" name="archived" domain="[('active', '=', False)]"/>
                <group expand="0" string="Group By">
                    <filter string="Manager" name="group_manager" context="{'group_by': 'manager_id'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Project Action -->
    <record id="action_project" model="ir.actions.act_window">
        <field name="name">Projects</field>
        <field name="res_model">${mn}.project</field>
        <field name="view_mode">kanban,tree,form</field>
        <field name="search_view_id" ref="view_project_search"/>
        <field name="context">{'search_default_my_projects': 1}</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first project
            </p>
        </field>
    </record>

</odoo>
`;

  // views/task_views.xml
  files["views/task_views.xml"] = `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- Task Form View -->
    <record id="view_task_form" model="ir.ui.view">
        <field name="name">${mn}.task.form</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <form string="Task">
                <header>
                    <field name="stage_id" widget="statusbar" options="{'clickable': '1'}"/>
                </header>
                <sheet>
                    <div class="oe_title">
                        <h1>
                            <field name="name" placeholder="Task Title..."/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="project_id"/>
                            <field name="user_id" widget="many2one_avatar_user"/>
                            <field name="reviewer_id" widget="many2one_avatar_user"/>
                            <field name="sprint_id"/>
                        </group>
                        <group>
                            <field name="task_type"/>
                            <field name="priority" widget="priority"/>
                            <field name="story_points"/>
                            <field name="kanban_state" widget="state_selection"/>
                        </group>
                    </group>
                    <group>
                        <group>
                            <field name="date_start"/>
                            <field name="date_deadline"/>
                        </group>
                        <group>
                            <field name="hours_planned"/>
                            <field name="hours_spent"/>
                        </group>
                    </group>
                    <group>
                        <field name="tag_ids" widget="many2many_tags" options="{'color_field': 'color'}"/>
                    </group>
                    <notebook>
                        <page string="Description" name="description">
                            <field name="description" placeholder="Task description..."/>
                        </page>
                        <page string="Timesheets" name="timesheets">
                            <field name="timelog_ids">
                                <tree editable="bottom">
                                    <field name="date"/>
                                    <field name="user_id"/>
                                    <field name="hours" sum="Total Hours"/>
                                    <field name="description"/>
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

    <!-- Task Tree View -->
    <record id="view_task_tree" model="ir.ui.view">
        <field name="name">${mn}.task.tree</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <tree string="Tasks" default_order="priority desc, sequence">
                <field name="sequence" widget="handle"/>
                <field name="name"/>
                <field name="project_id"/>
                <field name="user_id" widget="many2one_avatar_user"/>
                <field name="task_type"/>
                <field name="priority" widget="priority"/>
                <field name="story_points"/>
                <field name="stage_id"/>
                <field name="sprint_id" optional="show"/>
                <field name="date_deadline"/>
                <field name="kanban_state" widget="state_selection"/>
            </tree>
        </field>
    </record>

    <!-- Task Kanban View -->
    <record id="view_task_kanban" model="ir.ui.view">
        <field name="name">${mn}.task.kanban</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <kanban default_group_by="stage_id" class="o_kanban_small_column" 
                    on_create="quick_create" quick_create_view="${mn}.view_task_quick_create">
                <field name="color"/>
                <field name="priority"/>
                <field name="stage_id"/>
                <field name="user_id"/>
                <field name="task_type"/>
                <field name="story_points"/>
                <field name="kanban_state"/>
                <progressbar field="kanban_state" 
                             colors='{"done": "success", "blocked": "danger", "normal": "muted"}'/>
                <templates>
                    <t t-name="kanban-box">
                        <div t-attf-class="oe_kanban_card oe_kanban_global_click #{!selection_mode ? kanban_color(record.color.raw_value) : ''}">
                            <div class="oe_kanban_content">
                                <div class="o_kanban_record_top mb-0">
                                    <div class="o_kanban_record_headings">
                                        <span class="badge text-bg-secondary me-1">
                                            <t t-if="record.task_type.raw_value == 'bug'">🐛</t>
                                            <t t-elif="record.task_type.raw_value == 'feature'">✨</t>
                                            <t t-elif="record.task_type.raw_value == 'improvement'">📈</t>
                                            <t t-else="">📋</t>
                                            <field name="task_type"/>
                                        </span>
                                        <span t-if="record.story_points.raw_value" class="badge text-bg-info">
                                            <field name="story_points"/> SP
                                        </span>
                                    </div>
                                    <div class="o_dropdown_kanban dropdown">
                                        <a class="dropdown-toggle o-no-caret btn" data-bs-toggle="dropdown" href="#">
                                            <span class="fa fa-ellipsis-v"/>
                                        </a>
                                        <div class="dropdown-menu" role="menu">
                                            <a role="menuitem" type="edit" class="dropdown-item">Edit</a>
                                            <a role="menuitem" type="delete" class="dropdown-item">Delete</a>
                                            <div class="dropdown-divider"/>
                                            <ul class="oe_kanban_colorpicker" data-field="color"/>
                                        </div>
                                    </div>
                                </div>
                                <div class="o_kanban_record_body">
                                    <strong><field name="name"/></strong>
                                </div>
                                <div class="o_kanban_record_bottom">
                                    <div class="oe_kanban_bottom_left">
                                        <field name="priority" widget="priority"/>
                                    </div>
                                    <div class="oe_kanban_bottom_right">
                                        <field name="kanban_state" widget="state_selection"/>
                                        <field name="user_id" widget="many2one_avatar_user"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>

    <!-- Task Quick Create Form -->
    <record id="view_task_quick_create" model="ir.ui.view">
        <field name="name">${mn}.task.quick.create</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <form>
                <group>
                    <field name="name" placeholder="Task title..."/>
                    <field name="project_id"/>
                    <field name="user_id"/>
                </group>
            </form>
        </field>
    </record>

    <!-- Task Search View -->
    <record id="view_task_search" model="ir.ui.view">
        <field name="name">${mn}.task.search</field>
        <field name="model">${mn}.task</field>
        <field name="arch" type="xml">
            <search string="Search Tasks">
                <field name="name"/>
                <field name="project_id"/>
                <field name="user_id"/>
                <field name="sprint_id"/>
                <filter string="My Tasks" name="my_tasks" domain="[('user_id', '=', uid)]"/>
                <filter string="Unassigned" name="unassigned" domain="[('user_id', '=', False)]"/>
                <separator/>
                <filter string="Bugs" name="bugs" domain="[('task_type', '=', 'bug')]"/>
                <filter string="Features" name="features" domain="[('task_type', '=', 'feature')]"/>
                <separator/>
                <filter string="High Priority" name="high_priority" domain="[('priority', 'in', ['2', '3'])]"/>
                <filter string="In Sprint" name="in_sprint" domain="[('sprint_id', '!=', False)]"/>
                <group expand="0" string="Group By">
                    <filter string="Project" name="group_project" context="{'group_by': 'project_id'}"/>
                    <filter string="Stage" name="group_stage" context="{'group_by': 'stage_id'}"/>
                    <filter string="Assignee" name="group_user" context="{'group_by': 'user_id'}"/>
                    <filter string="Sprint" name="group_sprint" context="{'group_by': 'sprint_id'}"/>
                    <filter string="Type" name="group_type" context="{'group_by': 'task_type'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Task Action -->
    <record id="action_task" model="ir.actions.act_window">
        <field name="name">Tasks</field>
        <field name="res_model">${mn}.task</field>
        <field name="view_mode">kanban,tree,form</field>
        <field name="search_view_id" ref="view_task_search"/>
        <field name="context">{'search_default_my_tasks': 1}</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first task
            </p>
        </field>
    </record>

</odoo>
`;

  // views/sprint_views.xml
  files["views/sprint_views.xml"] = `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- Sprint Form View -->
    <record id="view_sprint_form" model="ir.ui.view">
        <field name="name">${mn}.sprint.form</field>
        <field name="model">${mn}.sprint</field>
        <field name="arch" type="xml">
            <form string="Sprint">
                <header>
                    <button name="action_start" string="Start Sprint" type="object"
                            class="btn-primary" invisible="state != 'draft'"/>
                    <button name="action_complete" string="Complete Sprint" type="object"
                            class="btn-success" invisible="state != 'active'"/>
                    <field name="state" widget="statusbar" statusbar_visible="draft,active,done"/>
                </header>
                <sheet>
                    <div class="oe_button_box" name="button_box">
                        <button class="oe_stat_button" type="object" name="action_start" icon="fa-tasks">
                            <field string="Tasks" name="task_count" widget="statinfo"/>
                        </button>
                    </div>
                    <div class="oe_title">
                        <h1>
                            <field name="name" placeholder="Sprint Name..."/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="project_id"/>
                            <field name="date_start"/>
                            <field name="date_end"/>
                        </group>
                        <group>
                            <field name="story_points_total"/>
                            <field name="story_points_done"/>
                            <field name="velocity" invisible="state != 'done'"/>
                        </group>
                    </group>
                    <group string="Sprint Goal">
                        <field name="goal" nolabel="1" placeholder="What do we want to achieve in this sprint?"/>
                    </group>
                    <notebook>
                        <page string="Tasks" name="tasks">
                            <field name="task_ids">
                                <tree>
                                    <field name="name"/>
                                    <field name="user_id" widget="many2one_avatar_user"/>
                                    <field name="task_type"/>
                                    <field name="story_points"/>
                                    <field name="stage_id"/>
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
    <record id="view_sprint_tree" model="ir.ui.view">
        <field name="name">${mn}.sprint.tree</field>
        <field name="model">${mn}.sprint</field>
        <field name="arch" type="xml">
            <tree string="Sprints">
                <field name="name"/>
                <field name="project_id"/>
                <field name="state" widget="badge" 
                       decoration-success="state == 'done'"
                       decoration-info="state == 'active'"
                       decoration-muted="state == 'draft'"/>
                <field name="date_start"/>
                <field name="date_end"/>
                <field name="task_count"/>
                <field name="story_points_total"/>
                <field name="velocity"/>
            </tree>
        </field>
    </record>

    <!-- Sprint Search View -->
    <record id="view_sprint_search" model="ir.ui.view">
        <field name="name">${mn}.sprint.search</field>
        <field name="model">${mn}.sprint</field>
        <field name="arch" type="xml">
            <search string="Search Sprints">
                <field name="name"/>
                <field name="project_id"/>
                <filter string="Active" name="active" domain="[('state', '=', 'active')]"/>
                <filter string="Planning" name="planning" domain="[('state', '=', 'draft')]"/>
                <filter string="Completed" name="completed" domain="[('state', '=', 'done')]"/>
                <group expand="0" string="Group By">
                    <filter string="Project" name="group_project" context="{'group_by': 'project_id'}"/>
                    <filter string="State" name="group_state" context="{'group_by': 'state'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Sprint Action -->
    <record id="action_sprint" model="ir.actions.act_window">
        <field name="name">Sprints</field>
        <field name="res_model">${mn}.sprint</field>
        <field name="view_mode">tree,form</field>
        <field name="search_view_id" ref="view_sprint_search"/>
        <field name="context">{'search_default_active': 1}</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first sprint
            </p>
        </field>
    </record>

</odoo>
`;

  // views/timelog_views.xml
  files["views/timelog_views.xml"] = `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- Timelog Tree View -->
    <record id="view_timelog_tree" model="ir.ui.view">
        <field name="name">${mn}.timelog.tree</field>
        <field name="model">${mn}.timelog</field>
        <field name="arch" type="xml">
            <tree string="Time Logs" editable="top">
                <field name="date"/>
                <field name="project_id"/>
                <field name="task_id" domain="[('project_id', '=', project_id)]"/>
                <field name="user_id" widget="many2one_avatar_user"/>
                <field name="hours" sum="Total Hours"/>
                <field name="description"/>
            </tree>
        </field>
    </record>

    <!-- Timelog Search View -->
    <record id="view_timelog_search" model="ir.ui.view">
        <field name="name">${mn}.timelog.search</field>
        <field name="model">${mn}.timelog</field>
        <field name="arch" type="xml">
            <search string="Search Time Logs">
                <field name="task_id"/>
                <field name="project_id"/>
                <field name="user_id"/>
                <filter string="My Time" name="my_time" domain="[('user_id', '=', uid)]"/>
                <filter string="Today" name="today" domain="[('date', '=', context_today().strftime('%Y-%m-%d'))]"/>
                <filter string="This Week" name="this_week" domain="[
                    ('date', '>=', (context_today() - relativedelta(days=context_today().weekday())).strftime('%Y-%m-%d')),
                    ('date', '&lt;=', context_today().strftime('%Y-%m-%d'))
                ]"/>
                <group expand="0" string="Group By">
                    <filter string="Project" name="group_project" context="{'group_by': 'project_id'}"/>
                    <filter string="Task" name="group_task" context="{'group_by': 'task_id'}"/>
                    <filter string="User" name="group_user" context="{'group_by': 'user_id'}"/>
                    <filter string="Date" name="group_date" context="{'group_by': 'date:month'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Timelog Action -->
    <record id="action_timelog" model="ir.actions.act_window">
        <field name="name">Time Logs</field>
        <field name="res_model">${mn}.timelog</field>
        <field name="view_mode">tree</field>
        <field name="search_view_id" ref="view_timelog_search"/>
        <field name="context">{'search_default_my_time': 1}</field>
    </record>

</odoo>
`;

  // views/menu_views.xml
  files["views/menu_views.xml"] = `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- Root Menu -->
    <menuitem id="menu_root" 
              name="${config.moduleTitle}" 
              sequence="45"/>

    <!-- Main Menu -->
    <menuitem id="menu_main" 
              name="Board" 
              parent="menu_root" 
              sequence="10"/>

    <menuitem id="menu_project" 
              name="Projects" 
              parent="menu_main" 
              action="action_project" 
              sequence="10"/>

    <menuitem id="menu_task" 
              name="Tasks" 
              parent="menu_main" 
              action="action_task" 
              sequence="20"/>

    <menuitem id="menu_sprint" 
              name="Sprints" 
              parent="menu_main" 
              action="action_sprint" 
              sequence="30"/>

    <menuitem id="menu_timelog" 
              name="Time Logs" 
              parent="menu_main" 
              action="action_timelog" 
              sequence="40"/>

    <!-- Configuration Menu -->
    <menuitem id="menu_config" 
              name="Configuration" 
              parent="menu_root" 
              sequence="100"
              groups="group_scrum_master"/>

    <menuitem id="menu_config_stages" 
              name="Stages" 
              parent="menu_config" 
              action="action_stage" 
              sequence="10"/>

    <menuitem id="menu_config_tags" 
              name="Tags" 
              parent="menu_config" 
              action="action_tag" 
              sequence="20"/>

    <!-- Stage Action -->
    <record id="action_stage" model="ir.actions.act_window">
        <field name="name">Stages</field>
        <field name="res_model">${mn}.stage</field>
        <field name="view_mode">tree,form</field>
    </record>

    <!-- Tag Action -->
    <record id="action_tag" model="ir.actions.act_window">
        <field name="name">Tags</field>
        <field name="res_model">${mn}.tag</field>
        <field name="view_mode">tree,form</field>
    </record>

    <!-- Stage Tree View -->
    <record id="view_stage_tree" model="ir.ui.view">
        <field name="name">${mn}.stage.tree</field>
        <field name="model">${mn}.stage</field>
        <field name="arch" type="xml">
            <tree string="Stages" editable="bottom">
                <field name="sequence" widget="handle"/>
                <field name="name"/>
                <field name="fold"/>
                <field name="is_closed"/>
            </tree>
        </field>
    </record>

    <!-- Tag Tree View -->
    <record id="view_tag_tree" model="ir.ui.view">
        <field name="name">${mn}.tag.tree</field>
        <field name="model">${mn}.tag</field>
        <field name="arch" type="xml">
            <tree string="Tags" editable="bottom">
                <field name="name"/>
                <field name="color" widget="color_picker"/>
            </tree>
        </field>
    </record>

</odoo>
`;

  // static/description/icon.png placeholder info
  files["static/description/index.html"] = `<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #714B67; }
    </style>
</head>
<body>
    <h1>${config.moduleTitle}</h1>
    <p>Agile Project Management for Odoo 16</p>
    <h2>Features</h2>
    <ul>
        <li>Kanban Board with drag &amp; drop</li>
        <li>Sprint Management</li>
        <li>Story Points &amp; Velocity Tracking</li>
        <li>Time Logging</li>
        <li>Role-based Access Control</li>
    </ul>
</body>
</html>
`;

  // README
  files["README.md"] = `# ${config.moduleTitle}

## Odoo 16 Agile Project Management

### Installation
1. Copy this folder to your Odoo addons directory
2. Restart Odoo server
3. Go to Apps → Update Apps List
4. Search for "${config.moduleTitle}" and install

### Features
- Kanban board
- Sprint management  
- Story points
- Time logging
- Scrum roles (Product Owner, Scrum Master, Project Manager, Team Member)

### Author
${config.authorName}
`;

  return files;
}
