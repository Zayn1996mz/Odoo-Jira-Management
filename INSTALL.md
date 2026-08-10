# Installation Guide

This project includes a Next.js web application and an Odoo module (`jira_zain`).

## 1. Next.js Web Application Setup

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm
- PostgreSQL database (for Drizzle ORM)

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zayn1996mz/Odoo-Jira-Management.git
   cd Odoo-Jira-Management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and configure your database connection:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   ```

4. **Run database migrations (if applicable):**
   ```bash
   npx drizzle-kit push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 2. Odoo Module (`jira_zain`) Installation

### Prerequisites
- A running Odoo instance (v16/v17/v18 depending on your target).

### Steps
1. **Copy the module:**
   Copy the folder `public/modules/jira_zain` into your Odoo `addons` directory.
   
2. **Restart Odoo:**
   Restart your Odoo service so it can detect the new module in the addons path.

3. **Update the App List:**
   - Log in to your Odoo instance as an Administrator.
   - Go to **Settings** and activate **Developer Mode**.
   - Navigate to the **Apps** menu.
   - Click on **Update Apps List** in the top navigation bar.

4. **Install the Module:**
   - Remove the `Apps` filter in the search bar and search for `jira_zain` or `Jira Management`.
   - Click **Activate** to install the module on your database.
