# -*- coding: utf-8 -*-
from odoo import models, fields


class Timelog(models.Model):
    _name = 'jira_zain.timelog'
    _description = 'Time Log'
    _order = 'date desc, id desc'

    task_id = fields.Many2one(
        'jira_zain.task',
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
