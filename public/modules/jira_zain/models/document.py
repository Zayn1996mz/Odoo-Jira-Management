# -*- coding: utf-8 -*-
from odoo import models, fields, api


class DocSpace(models.Model):
    _name = 'jira_zain.doc.space'
    _description = 'Document Space'
    _inherit = ['mail.thread']
    _order = 'sequence, name'

    name = fields.Char(string='Space Name', required=True, tracking=True)
    key = fields.Char(string='Space Key', required=True, size=10)
    description = fields.Text(string='Description')
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color')

    owner_id = fields.Many2one(
        'res.users',
        string='Owner',
        default=lambda self: self.env.user,
    )
    member_ids = fields.Many2many(
        'res.users',
        'jira_zain_doc_space_member_rel',
        'space_id',
        'user_id',
        string='Members',
    )

    document_ids = fields.One2many('jira_zain.document', 'space_id', string='Documents')
    document_count = fields.Integer(compute='_compute_document_count', string='Documents')

    _sql_constraints = [
        ('key_unique', 'UNIQUE(key)', 'Space key must be unique!'),
    ]

    @api.depends('document_ids')
    def _compute_document_count(self):
        for space in self:
            space.document_count = len(space.document_ids)


class Document(models.Model):
    _name = 'jira_zain.document'
    _description = 'Document'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'write_date desc, id desc'

    name = fields.Char(string='Title', required=True, tracking=True)
    content = fields.Html(string='Content', sanitize=False)
    summary = fields.Text(string='Summary')

    doc_type = fields.Selection([
        ('page', 'Page'),
        ('meeting', 'Meeting Notes'),
        ('decision', 'Decision Record'),
        ('howto', 'How-To Guide'),
        ('faq', 'FAQ'),
        ('runbook', 'Runbook'),
    ], string='Type', default='page', required=True, tracking=True)

    state = fields.Selection([
        ('draft', 'Draft'),
        ('review', 'In Review'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ], string='Status', default='draft', tracking=True, copy=False)

    space_id = fields.Many2one(
        'jira_zain.doc.space',
        string='Space',
        required=True,
        ondelete='cascade',
    )
    parent_id = fields.Many2one(
        'jira_zain.document',
        string='Parent Page',
        ondelete='set null',
        domain="[('space_id', '=', space_id)]",
    )
    child_ids = fields.One2many('jira_zain.document', 'parent_id', string='Sub Pages')
    child_count = fields.Integer(compute='_compute_child_count', string='Sub Pages')

    author_id = fields.Many2one(
        'res.users',
        string='Author',
        default=lambda self: self.env.user,
        tracking=True,
    )
    last_editor_id = fields.Many2one('res.users', string='Last Edited By')

    task_ids = fields.Many2many(
        'jira_zain.task',
        'jira_zain_doc_task_rel',
        'document_id',
        'task_id',
        string='Linked Tasks',
    )
    label_ids = fields.Many2many(
        'jira_zain.doc.label',
        string='Labels',
    )

    is_pinned = fields.Boolean(string='Pinned', default=False)
    view_count = fields.Integer(string='Views', default=0)
    color = fields.Integer(string='Color')
    active = fields.Boolean(default=True)

    version_ids = fields.One2many('jira_zain.doc.version', 'document_id', string='Versions')
    version_count = fields.Integer(compute='_compute_version_count', string='Versions')

    @api.depends('child_ids')
    def _compute_child_count(self):
        for doc in self:
            doc.child_count = len(doc.child_ids)

    @api.depends('version_ids')
    def _compute_version_count(self):
        for doc in self:
            doc.version_count = len(doc.version_ids)

    def action_publish(self):
        self.write({'state': 'published'})

    def action_review(self):
        self.write({'state': 'review'})

    def action_draft(self):
        self.write({'state': 'draft'})

    def action_archive_doc(self):
        self.write({'state': 'archived', 'active': False})

    def action_save_version(self):
        for doc in self:
            version_num = len(doc.version_ids) + 1
            self.env['jira_zain.doc.version'].create({
                'document_id': doc.id,
                'version_number': version_num,
                'content': doc.content,
                'author_id': self.env.user.id,
                'summary': 'Version %s' % version_num,
            })
        return True

    def write(self, vals):
        if 'content' in vals:
            vals['last_editor_id'] = self.env.user.id
        return super().write(vals)


class DocLabel(models.Model):
    _name = 'jira_zain.doc.label'
    _description = 'Document Label'
    _order = 'name'

    name = fields.Char(string='Label', required=True)
    color = fields.Integer(string='Color')

    _sql_constraints = [
        ('name_uniq', 'unique (name)', 'Label already exists!'),
    ]


class DocVersion(models.Model):
    _name = 'jira_zain.doc.version'
    _description = 'Document Version'
    _order = 'version_number desc'

    document_id = fields.Many2one(
        'jira_zain.document',
        string='Document',
        required=True,
        ondelete='cascade',
    )
    version_number = fields.Integer(string='Version #', required=True)
    content = fields.Html(string='Content Snapshot', sanitize=False)
    author_id = fields.Many2one('res.users', string='Saved By')
    summary = fields.Char(string='Change Summary')
    create_date = fields.Datetime(string='Date', readonly=True)

    def action_restore(self):
        self.ensure_one()
        self.document_id.write({'content': self.content})
        return True
