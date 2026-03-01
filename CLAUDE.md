# CLAUDE Development Guidelines

## Overview
This document provides development workflow guidelines for the DoDAO UI monorepo. Please refer to [AGENTS.md](AGENTS.md) for comprehensive project documentation and architecture details.

## Pre-Commit Development Workflow

Before committing any code changes, follow these essential steps to ensure code quality and successful deployment:

### 1. Code Quality Checks
Before committing your changes, ensure the build passes for the specific project you're working on:

```bash
# Run linting check
yarn lint

# Run prettier formatting check  
yarn prettier-check
```

### 2. Fix Code Quality Issues
If the above checks fail, fix the issues using the automated tools:

```bash
# Fix linting issues automatically
yarn lint-fix

# Fix formatting issues automatically
yarn prettier-fix
```

### 3. Verify Build Success
After fixing any code quality issues, verify that the project builds successfully:

```bash
# Run the build process
yarn build
```

**Important**: Ensure the build completes without errors before proceeding to the next step.

### 4. Push Your Code
Once all checks pass and the build is successful, push your code to the repository:

```bash
git add .
git commit -m "Your descriptive commit message"
git push origin your-branch-name
```

### 5. Monitor GitHub Build Status
After pushing your code:

1. **Check GitHub Actions**: Navigate to the repository's Actions tab on GitHub
2. **Monitor Build Progress**: Watch for your commit's build status
3. **Verify Success**: Ensure all CI/CD checks pass successfully

### 6. Handle Build Failures
If your Pull Request (PR) fails the build process:

#### Pull GitHub Logs
1. Go to the GitHub Actions tab in your repository
2. Click on the failed workflow run
3. Expand the failed job steps to view detailed error logs
4. Download logs if needed for detailed analysis

#### Pull Vercel Logs (if applicable)
1. Access your Vercel dashboard
2. Navigate to the specific project deployment
3. Check the "Functions" or "Build" logs for detailed error information
4. Look for runtime errors or deployment issues

#### Common Issues to Check
- **Linting Errors**: Code style violations
- **TypeScript Errors**: Type checking failures  
- **Build Errors**: Compilation or bundling issues
- **Test Failures**: Unit or integration test failures
- **Environment Variables**: Missing or incorrect configuration

## Project-Specific Notes

### For Simulations Project
- Ensure Prisma schema is up to date: `prisma generate`
- Check authentication flows work correctly
- Verify role-based access controls

### For Insights-UI Project  
- Validate financial data processing
- Check API integrations with external services
- Ensure data visualization components render correctly

### For Shared Web-Core
- Run type checking: `pnpm tsc`
- Test changes across dependent projects
- Update documentation for API changes

## Additional Resources

- **Project Documentation**: See [AGENTS.md](AGENTS.md) for detailed project information
- **AI Development Guidelines**: Refer to [docs/ai-knowledge/](docs/ai-knowledge/) for coding patterns
- **Build Process**: See [docs/ai-knowledge/build-process.md](docs/ai-knowledge/build-process.md) for detailed build information
- **Monorepo Structure**: See [docs/ai-knowledge/monorepo-structure.md](docs/ai-knowledge/monorepo-structure.md) for repository organization

## Best Practices

1. **Always test locally** before pushing to remote
2. **Write descriptive commit messages** that explain the changes
3. **Keep commits focused** on a single feature or fix
4. **Review your own code** before creating a PR
5. **Monitor build status** after pushing changes
6. **Address failures promptly** to avoid blocking other developers

Following this workflow ensures consistent code quality, successful deployments, and a smooth development experience for all team members.
