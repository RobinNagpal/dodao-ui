# Repository Structure

```
.
├── academy-ui            # Contains the Academy site code
├── shared
│   └── web-core         # Contains shared UI components and logic
└── base-ui               # The base setup for new projects
```

## Detailed Structure

- **academy-ui**: Contains the code specific to the Academy site, encapsulated as a project within the workspace.
- **shared/web-core**: A collection of reusable UI components and core logic for functionalities like authentication, themes, and more.
- **base-ui**: A foundational project setup with essential dependencies (like Tailwind CSS), serving as a template for new projects.

# Project Details

### Academy UI

The **Academy UI** project is dedicated to our educational platform. It contains the frontend code that powers the Academy site. This project now resides within the `academy-ui` directory in the monorepo, allowing for easier management.

### Shared Web-Core

The **shared/web-core** directory is a vital part of our monorepo, encapsulating common UI components and logic used across various projects. It includes:

- **UI Components**: Modular components like buttons, forms, and navigation elements.
- **Authentication Logic**: Functions and hooks for user login, sign-up, and authentication flows.
- **Theme Management**: Tools and settings for managing application themes.
- **Utility Functions**: Shared utilities and helpers used across projects.

This shared codebase helps in maintaining consistency and reducing duplication of efforts.

### Base UI

The **Base UI** project serves as a starting template for new projects. It is a Next.js application pre-configured with essential dependencies and settings, including:

- **Tailwind CSS**: Pre-configured for rapid styling.
- **Project Structure**: Basic file and folder setup to kickstart development.

[//]: <> (Todo: Add more concrete description of what's contained in this folder.)

This setup ensures that all new projects start with a solid foundation, adhering to best practices and consistency.
