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
