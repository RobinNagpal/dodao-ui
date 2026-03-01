# Simulations - Business Case Study Platform

## Overview
The Simulations platform is an educational web application designed to provide interactive business case study experiences. Built with Next.js and powered by AI, it offers immersive learning environments for students to practice real-world business scenarios across multiple disciplines.

## 🎯 Purpose
This platform bridges the gap between theoretical business education and practical application by providing:
- Interactive case study simulations
- Role-based learning experiences
- AI-powered guidance and feedback
- Comprehensive assessment tools
- Multi-disciplinary business education

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15.5.7 with React 18.3.1
- **Styling**: Tailwind CSS with custom components
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js with Prisma adapter
- **AI Integration**: Google GenAI for intelligent tutoring
- **UI Components**: Radix UI primitives
- **Development**: TypeScript, ESLint, Prettier

### Key Dependencies
- `@google/genai` - AI-powered educational assistance
- `@prisma/client` - Database operations
- `@radix-ui/*` - Accessible UI components
- `@uiw/react-md-editor` - Rich text editing
- `next-auth` - Authentication system

## 👥 User Roles

### Students
- Access assigned case studies
- Work through business scenarios
- Submit solutions and analyses
- Receive AI-powered feedback
- Track progress and performance

### Instructors
- Create and manage case studies
- Assign studies to students
- Monitor student progress
- Provide feedback and grading
- Generate performance reports

### Administrators
- Manage users and permissions
- Oversee platform operations
- Configure system settings
- Access analytics and reporting

## 📚 Subject Areas

The platform covers five core business disciplines:

### 🎯 Marketing
- Market analysis and strategy
- Consumer behavior studies
- Brand management scenarios
- Digital marketing campaigns

### 💰 Finance
- Financial analysis and planning
- Investment decision making
- Risk assessment scenarios
- Corporate finance cases

### 👥 Human Resources
- Talent management
- Organizational behavior
- Performance management
- Workplace conflict resolution

### ⚙️ Operations
- Supply chain management
- Process optimization
- Quality control scenarios
- Logistics and distribution

### 📈 Economics
- Market dynamics
- Economic policy analysis
- Competitive strategy
- Industry analysis

## 🔄 Workflow

### Student Journey
1. **Login** - Secure authentication
2. **Dashboard** - View assigned case studies
3. **Case Study** - Interactive scenario engagement
4. **Exercise** - Practical application tasks
5. **Submission** - Solution submission
6. **Summary** - Performance review and feedback

### Instructor Journey
1. **Case Creation** - Design new scenarios
2. **Student Assignment** - Distribute to learners
3. **Progress Monitoring** - Track engagement
4. **Assessment** - Review and grade submissions
5. **Feedback** - Provide detailed guidance

## 🤖 AI Integration

### Intelligent Tutoring
- Contextual hints and guidance
- Personalized learning paths
- Automated feedback generation
- Performance analysis

### Content Generation
- Dynamic scenario variations
- Question generation
- Assessment rubrics
- Learning recommendations

## 🗄️ Data Management

### Database Schema
- User management and roles
- Case study content and metadata
- Student progress tracking
- Assessment and grading data
- Analytics and reporting metrics

### File Structure
```
src/
├── app/                 # Next.js app router
│   ├── admin/          # Admin interface
│   ├── instructor/     # Instructor dashboard
│   ├── student/        # Student interface
│   └── api/            # API routes
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── types/             # TypeScript definitions
└── utils/             # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Installation
```bash
cd simulations
pnpm install
```

### Development
```bash
pnpm dev
```

### Database Setup
```bash
prisma generate
prisma db push
```

## 🔧 Configuration

### Environment Variables
- Database connection strings
- Authentication providers
- AI service API keys
- Application secrets

### Features
- Real-time collaboration
- Progress tracking
- Performance analytics
- Mobile-responsive design
- Accessibility compliance

## 📊 Analytics & Reporting

### Student Analytics
- Learning progress tracking
- Performance metrics
- Time spent analysis
- Completion rates

### Instructor Insights
- Class performance overview
- Individual student progress
- Content effectiveness metrics
- Engagement analytics

## 🔒 Security & Privacy

### Data Protection
- Secure authentication
- Role-based access control
- Data encryption
- Privacy compliance

### User Safety
- Content moderation
- Safe learning environment
- Academic integrity measures
- Secure data handling

This platform represents the future of business education, combining traditional case study methodology with modern technology and AI-powered personalization to create engaging, effective learning experiences.

## 📚 Development Guidelines

For AI-assisted development and coding patterns specific to this project, refer to the comprehensive knowledge base in **[../docs/ai-knowledge/](../docs/ai-knowledge/)**. This includes:

- **Backend Instructions** - Next.js API development patterns used in this project
- **UI Instructions** - React/Next.js UI patterns including the useAuthGuard hook
- **Component Guidelines** - Button, form, page structure, and theming patterns
- **Authentication Patterns** - Role-based access control and loading state management

These guidelines ensure consistency with the established codebase and development patterns used throughout the simulations platform.

# vercel logs

The `vercel logs` command displays request logs for your project or streams live runtime logs from a specific deployment.

By default, running `vercel logs` shows request logs from the last 24 hours for the linked project and branch. You can filter logs by environment, log level, status code, source, and more.

To stream live logs, use the `--follow` flag. Live streaming continues for up to 5 minutes unless interrupted.

You can find more detailed logs on the [Logs](/d?to=%2F%5Bteam%5D%2F%5Bproject%5D%2Flogs\&title=Open+Logs) page in the Vercel Dashboard.

## Usage

```bash filename="terminal"
# Display recent request logs for the linked project
vercel logs

# Stream live logs for the current git branch
vercel logs --follow

# Filter logs by level and time range
vercel logs --level error --since 1h
```

*Using the \`vercel logs\` command to view request logs or stream runtime logs.*

## Unique options

These options only apply to the `vercel logs` command.

### Project

The `--project` option, shorthand `-p`, specifies the project ID or name. Defaults to the linked project.

```bash filename="terminal"
vercel logs --project my-app
```

### Deployment

The `--deployment` option, shorthand `-d`, specifies a deployment ID or URL to filter logs.

```bash filename="terminal"
vercel logs --deployment dpl_xxxxx
```

### Follow

The `--follow` option, shorthand `-f`, streams live runtime logs instead of showing request logs.

When using `--follow`, the command finds the latest deployment for your current git branch. You can combine it with `--deployment` to stream logs for a specific deployment.

```bash filename="terminal"
# Stream logs for the current branch's latest deployment
vercel logs --follow

# Stream logs for a specific deployment
vercel logs --follow --deployment dpl_xxxxx
```

Use `--no-follow` to disable auto-following when a deployment ID or URL is given as the first argument.

### JSON

The `--json` option, shorthand `-j`, outputs logs in JSON Lines format. This makes it easier to pipe the output to other command-line tools such as [jq](https://jqlang.github.io/jq/).

```bash filename="terminal"
vercel logs --json | jq 'select(.level == "error")'
```

### Expand

The `--expand` option, shorthand `-x`, displays the full log message below each request line instead of truncating it.

```bash filename="terminal"
vercel logs --expand
```

### Limit

The `--limit` option, shorthand `-n`, specifies the maximum number of log entries to return. The default is 100.

```bash filename="terminal"
vercel logs --limit 50
```

### Environment

The `--environment` option filters logs by deployment environment. Valid values are `production` and `preview`.

```bash filename="terminal"
vercel logs --environment production
```

### Level

The `--level` option filters logs by log level. You can specify multiple levels. Valid values are `error`, `warning`, `info`, and `fatal`.

```bash filename="terminal"
vercel logs --level error --level warning
```

### Status-code

The `--status-code` option filters logs by HTTP status code. You can use specific codes or wildcards like `4xx` or `5xx`.

```bash filename="terminal"
vercel logs --status-code 500
vercel logs --status-code 5xx
```

### Source

The `--source` option filters logs by request source. You can specify multiple sources. Valid values are `serverless`, `edge-function`, `edge-middleware`, and `static`.

```bash filename="terminal"
vercel logs --source edge-function --source serverless
```

### Query

The `--query` option, shorthand `-q`, performs a full-text search across log messages.

```bash filename="terminal"
vercel logs --query "timeout"
```

### Request-id

The `--request-id` option filters logs by a specific request ID.

```bash filename="terminal"
vercel logs --request-id req_xxxxx
```

### Since

The `--since` option returns logs from after a specific time. You can use ISO 8601 format or relative values like `1h` or `30m`. The default is 24 hours ago.

```bash filename="terminal"
vercel logs --since 1h
vercel logs --since 2026-01-15T10:00:00Z
```

### Until

The `--until` option returns logs up until a specific time. You can use ISO 8601 format or relative values. The default is now.

```bash filename="terminal"
vercel logs --since 2h --until 1h
```

### Branch

The `--branch` option, shorthand `-b`, filters logs by git branch. By default, the command detects your current git branch and filters to matching deployments.

```bash filename="terminal"
vercel logs --branch feature-x
```

Use `--no-branch` to disable automatic git branch detection and show logs from all branches.

## Examples

Display error logs from the last hour:

```bash filename="terminal"
vercel logs --level error --since 1h
```

Display production logs with 500 errors and output as JSON:

```bash filename="terminal"
vercel logs --environment production --status-code 500 --json
```

Search logs and pipe to jq:

```bash filename="terminal"
vercel logs --query "timeout" --json | jq '.message'
```

Display logs with full message details:

```bash filename="terminal"
vercel logs --expand --limit 20
```


---

[View full sitemap](/docs/sitemap)

