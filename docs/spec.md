# Defect Tracker Spec

**Purpose**: Domain knowledge and business context for AI agents - what the system models and why, not how it's implemented.

## Domain Overview

**Defect Tracker** centralizes bug reporting, assignment, and tracking across software projects. Replaces spreadsheet-based tracking with structured workflows, role-based access, and automated audit trails.

**Problem Solved**: Development teams struggled with inconsistent spreadsheets, poor scalability, missing access control, and lack of accountability. This system provides unified structure, permissions, real-time collaboration, filtering, and automated tracking.

## Core Entities & Relationships

### Users

- **Roles** (hierarchy):
  - `manager`: Full oversight, monitoring, project management
  - `tester`: Report defects, verify fixes
  - `developer`: Resolve assigned defects
- **Key Attributes**: Name, email, role assignment
- **Purpose**: Represent team members who report, fix, or verify defects

### Projects

- **Purpose**: Organize defects into logical software project groupings
- **Key Attribute**: Name (required)
- **Relationship**: All defects must belong to exactly one project
- **Access**: Created/managed by managers and testers

### Defects (Primary Entity)

- **Purpose**: Represent bugs, issues, or improvement requests in software
- **Core Attributes**:
  - Name and description (required)
  - Reporter (who found/reported it)
  - Assignee (who is responsible for fixing it)
  - Project (which project it belongs to)
  - Severity (impact level)
  - Priority (urgency level)
  - Status (current state in workflow)
  - Types (one or more categories)
  - Optional screenshot attachment
- **Embedded Data**:
  - Comments (discussion thread)
  - Status History (audit trail of all status changes)
- **Key Behaviors**:
  - Reporter auto-assigned when defect is created
  - Status changes are automatically recorded with who changed it and when
  - Can have multiple types simultaneously
  - Supports text search by name or ID

### Defect Metadata (Reference Data)

**Types** (multiple allowed per defect):

- Functional, UI and Usability, Content, Improvement Request, Unit Test Failure

**Severities** (single, indicates impact):

- Minor, Medium, Major, Critical, Blocker

**Priorities** (single, indicates urgency):

- Low, Medium, High

**Statuses** (single, tracks lifecycle):

- Open → In Progress → Fixed → Verified (typical flow)
- Alternative paths: Reopened, Deferred, Hold

## Key Workflows

### Defect Lifecycle

1. **Report**: Tester/Manager discovers issue → Creates defect → Assigns to Developer → Status: "Open"
2. **Resolve**: Developer accepts assignment → Status: "In Progress" → Fixes issue → Status: "Fixed"
3. **Verify**: Tester reviews fix → Tests → Status: "Verified" (success) or "Reopened" (failed)
4. **Monitor**: Manager views dashboard metrics and filtered lists to track progress

### Status Change Tracking

- Every status change is automatically recorded in immutable `statusHistory`
- Records: new status, who changed it, timestamp
- Provides complete audit trail for accountability

### Comments

- Any authenticated user can add comments to any defect
- Comments include author and timestamp
- Purpose: Discussion, context, clarification
- Immutable: Comments cannot be edited or deleted

## Business Rules & Constraints

### Access Control

- All operations require user authentication
- Projects page: Only managers and testers can create/manage projects
- Defect operations: All authenticated users can view/create/update defects
- Permission levels follow role hierarchy (manager > tester > developer)

### Data Integrity Rules

- Defects must belong to a project (required)
- Defects must have exactly one severity, one priority, one status
- Defects must have at least one type (can have multiple)
- Defects must have an assigned user
- Status history is immutable (append-only audit trail)
- Comments are immutable (append-only discussion)

## Domain Concepts (DDD Perspective)

### Aggregate Roots

- **Defect**: Main aggregate containing comments and status history
- **Project**: Contains collection of related defects
- **User**: Associated with assigned/reported defects

### Value Objects

- Defect metadata (types, severities, priorities, statuses are reference data)
- Status history entries (immutable records)
- Comment entries (immutable records)

### Domain Events (Implicit)

- Defect Created (triggers: assign reporter, set initial status)
- Defect Status Changed (triggers: append to statusHistory)
- Comment Added (triggers: append to comments)
- Defect Assigned (triggers: update assignedTo)

## Important Constraints & Patterns

1. **Status History**: Immutable audit trail - every status change is permanently recorded
2. **Comments**: Append-only discussion thread - cannot be edited/deleted
3. **Assignment**: Defects always require an assigned user
4. **Project Scoping**: Defects are always scoped to a single project
5. **Multiple Types**: Defects can belong to multiple categories (e.g., "Functional" AND "UI")
6. **Single Status/Priority/Severity**: Only one value per defect at any time
7. **Real-time Collaboration**: Multiple users can work simultaneously with live updates

## Dashboard Metrics

The dashboard tracks:

- **Total Bugs**: All reported defects
- **Open Bugs**: Defects with status "Open" or "Reopened" (active issues)
- **Critical Bugs**: Defects with severity "Critical"
- **Unit Test Failures**: Defects with type "Unit Test Failure"

## Filtering & Search Capabilities

Defects can be filtered by:

- Project (scope to specific project)
- Severity (impact level)
- Priority (urgency level)
- Status (lifecycle state)
- Types (one or more categories)
- Assignee (who is responsible)
- Reporter (who reported it)
- Text search (matches name or ID)

## Common Scenarios

### Scenario 1: New Bug Report

Tester finds a UI issue → Creates defect with types ["Functional", "UI and Usability"], severity "Major", priority "High" → Assigns to Developer → System sets status "Open" and records tester as reporter

### Scenario 2: Developer Resolution

Developer sees assigned defect → Changes status to "In Progress" (recorded in history) → Fixes code → Changes status to "Fixed" (recorded in history) → System tracks all status changes automatically

### Scenario 3: Verification & Reopening

Tester sees "Fixed" defect → Tests the fix → Issue persists → Changes status to "Reopened" (recorded) → Adds comment explaining why → Developer is automatically aware via assignment

### Scenario 4: Manager Monitoring

Manager views dashboard → Sees 15 open bugs, 3 critical → Filters by project "Mobile App" → Sees 5 open bugs → Filters by severity "Critical" → Identifies urgent issues → Monitors status changes in real-time

## Key Terminology

- **Defect**: Software issue, bug, or improvement request
- **Reporter**: User who initially reports the defect (typically tester)
- **Assignee**: User responsible for resolving the defect (typically developer)
- **Severity**: Impact level of the defect on the system
- **Priority**: Urgency level for resolution
- **Status**: Current state in the defect lifecycle
- **Status History**: Immutable audit trail of all status changes
- **Project**: Logical grouping of related defects

## Business Value

The system provides:

1. **Accountability**: Complete audit trail shows who did what and when
2. **Organization**: Structured data replaces inconsistent spreadsheets
3. **Collaboration**: Multiple team members can work together in real-time
4. **Visibility**: Dashboards and filters provide clear project health metrics
5. **Efficiency**: Automated tracking eliminates manual status management
6. **Consistency**: Standardized workflows ensure nothing is missed
