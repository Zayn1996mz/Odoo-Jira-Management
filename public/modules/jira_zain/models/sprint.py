# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import UserError


class Sprint(models.Model):
    _name = 'jira_zain.sprint'
    _description = 'Sprint'
    _order = 'date_start desc, id desc'
    _inherit = ['mail.thread']

    name = fields.Char(string='Sprint Name', required=True, tracking=True)
    project_id = fields.Many2one(
        'jira_zain.project',
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

    task_ids = fields.One2many('jira_zain.task', 'sprint_id', string='Tasks')
    
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
