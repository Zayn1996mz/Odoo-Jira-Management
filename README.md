# Odoo Jira Management

A comprehensive solution bridging Jira-like project management capabilities with Odoo. This project consists of two main components:
1. **Next.js Web Application:** A frontend/backend built with Next.js and Drizzle ORM to manage configurations and generate/interface with Odoo.
2. **Odoo Module (`jira_zain`):** A custom Odoo addon that introduces Projects, Sprints, Tasks, Stages, Documents, and Timelogs directly inside your Odoo environment.

## 🚀 Installation Guide

You can find the detailed installation guide in [INSTALL.md](./INSTALL.md), or follow the quick steps below.

### 1. Next.js Application Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zayn1996mz/Odoo-Jira-Management.git
   cd Odoo-Jira-Management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory and add your PostgreSQL database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

### 2. Odoo Module Setup

1. Copy the `public/modules/jira_zain` folder into your Odoo `addons` path.
2. Restart your Odoo server.
3. Log in to Odoo, activate **Developer Mode**, and go to **Apps**.
4. Click **Update Apps List**.
5. Search for `jira_zain` and click **Activate**.

## 📄 License

This project is open-source and available under the standard MIT License.