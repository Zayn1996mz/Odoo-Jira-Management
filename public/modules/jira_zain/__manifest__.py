# -*- coding: utf-8 -*-
{
    'name': 'Jira-Zain',
    'version': '16.0.2.0.0',
    'category': 'Project',
    'summary': 'Jira/Trello-like Project Management with Scrum & Documentation',
    'description': """
Jira-Zain - Agile Project Management
====================================
A complete Agile/Scrum project management module for Odoo 16.

Features:
- Kanban board with drag & drop
- Sprint management with velocity tracking
- Story points estimation
- Time logging
- Role-based access (Product Owner, Scrum Master, Project Manager, Team Member)
- Confluence-like Documentation Spaces
- Dashboard with analytics
    """,
    'author': 'Zain',
    'website': '',
    'license': 'LGPL-3',
    'depends': ['base', 'mail'],
    'data': [
        'security/security_groups.xml',
        'security/ir.model.access.csv',
        'data/stage_data.xml',
        'views/task_views.xml',
        'views/sprint_views.xml',
        'views/timelog_views.xml',
        'views/doc_views.xml',
        'views/dashboard_views.xml',
        'views/project_views.xml',
        'views/menu_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
