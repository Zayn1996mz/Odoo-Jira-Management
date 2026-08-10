# -*- coding: utf-8 -*-
from odoo import models, fields, api


class Project(models.Model):
    _name = 'jira_zain.project'
    _description = 'Project'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'

    name = fields.Char(string='Project Name', required=True, tracking=True)
    code = fields.Char(
        string='Project Key', required=True, size=10,
        help='Short code for task numbering (e.g., PRJ)',
    )
    description = fields.Html(string='Description')
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color Index')

    manager_id = fields.Many2one(
        'res.users',
        string='Project Manager',
        default=lambda self: self.env.user,
        tracking=True,
    )
    member_ids = fields.Many2many(
        'res.users',
        'jira_zain_project_member_rel',
        'project_id',
        'user_id',
        string='Team Members',
    )

    task_ids = fields.One2many('jira_zain.task', 'project_id', string='Tasks')
    sprint_ids = fields.One2many('jira_zain.sprint', 'project_id', string='Sprints')

    task_count = fields.Integer(compute='_compute_stats', string='Tasks')
    sprint_count = fields.Integer(compute='_compute_stats', string='Sprints')
    bug_count = fields.Integer(compute='_compute_stats', string='Bugs')
    progress = fields.Float(compute='_compute_stats', string='Progress')

    date_start = fields.Date(string='Start Date')
    date_end = fields.Date(string='End Date')

    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'Project code must be unique!'),
    ]

    @api.depends('task_ids', 'task_ids.stage_id.is_closed', 'task_ids.task_type', 'sprint_ids')
    def _compute_stats(self):
        for project in self:
            tasks = project.task_ids
            total = len(tasks)
            project.task_count = total
            project.sprint_count = len(project.sprint_ids)
            project.bug_count = len(tasks.filtered(lambda t: t.task_type == 'bug'))
            if total:
                done = len(tasks.filtered(lambda t: t.stage_id.is_closed))
                project.progress = (done / total) * 100
            else:
                project.progress = 0
