# Bug Tracker

[![Convex](https://img.shields.io/badge/Convex-%23de5d33.svg?style=for-the-badge&logo=convex&logoColor=white)](https://convex.dev/)
[![Tanstack Start](https://img.shields.io/badge/TanStack%20Start-%230092b8.svg?style=for-the-badge&logo=tanstack-start&logoColor=white)](https://tanstack.com/start/)

A web application to centralize defect reporting, assignment, and tracking. Each project will have its own structured list of defects with detailed fields and status workflows. The application supports role-based access, allowing QA testers to log and update defects, developers to resolve them, and managers to monitor progress. Features intuitive navigation, searchable/filterable tables, and a simple notification mechanism to ensure follow-ups.

### Background

The development team spends unnecessary time and effort wrangling shared spreadsheets for defect tracking, leading to missed defects and poor accountability. QA testers are currently using spreadsheets to track defects. This method is inconsistent, lacks scalability, and doesn't support essential features like access control, filtering, or status tracking. access control, filtering, or status tracking.

**Features**

- Establishes a unified, consistent structure for all projects
- Provides clear user roles with granular permission control
- Supports real-time collaboration for multiple users
- Offers powerful search, filtering, and sorting tools for defects
- Includes built-in notifications and automated follow-up reminders
- Automates defect tracking to prevent missed updates

### Development

Install bun to get started: https://bun.com

Install dependencies:

```bash
bun install
```

Configure application keys:

```bash
bun --bun generateKeys.mjs
```

Copy the whole output and paste it into your Convex dashboard deployment's Environment Variables page.

Run development server:

```bash
bun dev
```

Deploy to production:

```bash
bunx convex deploy --cmd 'bun --bun run build'
```
