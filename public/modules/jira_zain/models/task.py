# -*- coding: utf-8 -*-
from odoo import models, fields, api
from datetime import date


class Task(models.Model):
    _name = 'jira_zain.task'
    _description = 'Task'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'priority desc, sequence, id desc'

    name = fields.Char(string='Title', required=True, tracking=True)
    description = fields.Html(string='Description')
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color')

    project_id = fields.Many2one(
        'jira_zain.project',
        string='Project',
        required=True,
        ondelete='cascade',
        tracking=True,
    )
    stage_id = fields.Many2one(
        'jira_zain.stage',
        string='Stage',
        tracking=True,
        index=True,
        copy=False,
        group_expand='_read_group_stage_ids',
        default=lambda self: self._get_default_stage(),
    )
    sprint_id = fields.Many2one(
        'jira_zain.sprint',
        string='Sprint',
        tracking=True,
        domain="[('project_id', '=', project_id), ('state', '!=', 'done')]",
    )
    user_id = fields.Many2one(
        'res.users',
        string='Assignee',
        tracking=True,
        index=True,
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
    progress = fields.Float(string='Progress (%)')

    date_deadline = fields.Date(string='Deadline')
    date_start = fields.Date(string='Start Date')

    kanban_state = fields.Selection([
        ('normal', 'In Progress'),
        ('done', 'Ready'),
        ('blocked', 'Blocked'),
    ], string='Kanban State', default='normal', copy=False, tracking=True)

    tag_ids = fields.Many2many('jira_zain.tag', string='Tags')
    document_ids = fields.Many2many(
        'jira_zain.document',
        'jira_zain_doc_task_rel',
        'task_id',
        'document_id',
        string='Documents',
    )
    document_count = fields.Integer(compute='_compute_document_count', string='Documents')

    timelog_ids = fields.One2many('jira_zain.timelog', 'task_id', string='Time Logs')
    hours_spent = fields.Float(
        compute='_compute_hours_spent', string='Hours Spent', store=True
    )
    hours_planned = fields.Float(string='Planned Hours')

    is_overdue = fields.Boolean(compute='_compute_is_overdue', string='Overdue', store=True)
    is_closed = fields.Boolean(
        related='stage_id.is_closed', string='Is Closed', store=True,
    )

    # Display field: project code + id
    display_key = fields.Char(compute='_compute_display_key', string='Key')

    @api.depends('project_id.code')
    def _compute_display_key(self):
        for task in self:
            if task.project_id and task.project_id.code and task.id:
                task.display_key = '%s-%s' % (task.project_id.code, task.id)
            else:
                task.display_key = ''

    @api.depends('date_deadline', 'stage_id.is_closed')
    def _compute_is_overdue(self):
        today = date.today()
        for task in self:
            task.is_overdue = bool(
                task.date_deadline
                and task.date_deadline < today
                and not task.stage_id.is_closed
            )

    @api.depends('timelog_ids.hours')
    def _compute_hours_spent(self):
        for task in self:
            task.hours_spent = sum(task.timelog_ids.mapped('hours'))

    @api.depends('document_ids')
    def _compute_document_count(self):
        for task in self:
            task.document_count = len(task.document_ids)

    def _get_default_stage(self):
        return self.env['jira_zain.stage'].search([], limit=1, order='sequence')

    @api.model
    def _read_group_stage_ids(self, stages, domain, order):
        return self.env['jira_zain.stage'].search([], order=order)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('stage_id'):
                vals['stage_id'] = self._get_default_stage().id
        return super().create(vals_list)


class Tag(models.Model):
    _name = 'jira_zain.tag'
    _description = 'Task Tag'

    name = fields.Char(string='Name', required=True)
    color = fields.Integer(string='Color')

    _sql_constraints = [
        ('name_uniq', 'unique (name)', 'Tag name already exists!'),
    ]
