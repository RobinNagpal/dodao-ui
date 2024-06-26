# dodao-ui

Welcome to the dodao-ui repository! This repository serves as a monorepo for our projects. We have made some significant changes to improve code organization and reusability.

## Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Project Details](#project-details)
  - [Academy UI](#academy-ui)
  - [Shared Web-Core](#shared-web-core)
  - [Base UI](#base-ui)
- [Setup Instructions](#setup-instructions)
- [Contributing](#contributing)

## Overview

The DoDAO monorepo is designed to streamline development by consolidating multiple projects into a single repository using Yarn workspaces. This setup allows us to share code more effectively, reduce redundancy, and maintain consistency across projects.

Previously, we had a separate repository for the Academy site (`dodao-ui`). We have now transitioned to a monorepo approach to better manage and scale our projects. The primary components and logic have been abstracted into reusable modules to promote modularity and reuse.

## Repository Structure

```
.
├── academy-ui            # Contains the Academy site code
├── shared
│   └── web-core         # Contains shared UI components and logic
└── base-ui               # The base setup for new projects
```

### Detailed Structure

- **academy-ui**: Contains the code specific to the Academy site, encapsulated as a project within the workspace.
- **shared/web-core**: A collection of reusable UI components and core logic for functionalities like authentication, themes, and more.
- **base-ui**: A foundational project setup with essential dependencies (like Tailwind CSS), serving as a template for new projects.

## Project Details

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

## Setup Instructions

### Prerequisites

- **Node.js** (Nodejs 18+)
- **Yarn** (Yarn 1.22.x)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/RobinNagpal/dodao-ui.git
   cd dodao-ui
   ```

2. **Install dependencies using Yarn:**

   ```bash
   yarn install
   ```

3. **Navigate to a specific project folder**

   ```bash
   cd academy-ui
   ```

4. **Setup environment variables**

    - Rename the `.env.example` file to `.env` and modify the keys as mentioned below.
    - Make sure to update `DATABASE_URL` according to your own postgres username and password:

    ```bash
        postgresql://<username>:<password>@localhost:5432/dodao_api_localhost_db?sslmode=verify-full
    ```

    - Uncomment the V2_API_SERVER_URL set to localhost:8000 (line: 16) and comment out the V2_API_SERVER_URL set to v2-api.dodao.io (line: 17).

    -Replace the value of the DODAO_SUPERADMINS key with your MetaMask wallet's public address.

5. **Generate Prisma Migrations**

    Run the following command to generate your Prisma Migrations:

    ```bash
    yarn prisma migrate dev
    ```

6. **Start the development server**

    Now you're ready to start the development server:

    ```bash
    yarn dev
    ```

For detailed setup instructions for each project, refer to the respective project’s README in its directory.

## Contributing

To contribute, please follow these steps:

1. **Clone the repository**: Clone the repository on your local machine.
2. **Create a branch**: Create a new branch for your changes.
   ```bash
   git checkout -b your-name/my-feature-branch
   ```
3. **Make changes**: Implement your changes.
4. **Commit changes**: Commit your changes with a descriptive message.
   ```bash
   git commit -m "Add new feature X"
   ```
5. **Push to GitHub**: Push your changes to your forked repository.
   ```bash
   git push origin your-name/my-feature-branch
   ```
6. **Create a pull request**: Submit a pull request to the main repository.
