# -*- coding: utf-8 -*-
from odoo import models, fields


class Stage(models.Model):
    _name = 'jira_zain.stage'
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
