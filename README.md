# dodao-ui

Welcome to the dodao-ui repository! This repository serves as a monorepo for our projects. We have made some significant changes to improve code organization and reusability.

# Contribution
So far only DoDAO has been working on the applications in this repository. We like the crypto movement and also
creation of tokens/points for the community and having people as partners. 

If you are not getting paid from DoDAO, and you want to contribute to this repository, you are most welcome for it. 

We will maintain a list of contributors and their contributions in the repository. After we have more than 3-4 contributors, 
we can create token/points for the contributors and share the revenue/profits with them.

There is a long way to go for this. But its important to have this structure in place.

Check the [Contributions.md](docs/Contributions.md) file for more details.

# Setup
Academy or Tidbits are in `academy-ui` folder.

See [academy-ui/README.md](academy-ui/README.md) for setup instructions.

# Overview
You should be know the following things to be able to contribute to this repository:

- [ ] Understand the monorepo structure. More details in [ProjectStructure.md](docs/ProjectStructure.md)
- [ ] Understand how postgres is setup using docker-compose. See [LocalDatabaseSetup.md](docs/LocalDatabaseSetup.md) &  See [Video](https://drive.google.com/file/d/1Gg-KWR_OqEPLIjDMUIZmslXuZ0CUpAnZ/view?usp=sharing)
- [ ] Understand how migrations work. More details in [PrismaTypesAndMigrations.md](docs/PrismaTypesAndMigrations.md)
- [ ] Understand how to declare types for JSON fields in Prisma. More details in [PrismaTypesAndMigrations.md](docs/PrismaTypesAndMigrations.md)
- [ ] Understand how to create new entities and declare types for them. More details in [TypeDefinitions.md](docs/TypeDefinitions.md)
- [ ] Understand what is a space. More details in [UnderstandingSpace.md](docs/UnderstandingSpace.md)


### API
- [ ] Understand how migrations work. More details in [PrismaTypesAndMigrations.md](docs/PrismaTypesAndMigrations.md)
- [ ] Understand how to declare new types for entities, request and response types
- [ ] Understand how strict types need to be used for request and responses. See [TypeDefinitions.md](docs/TypeDefinitions.md) 
- [ ] Understand how to add new routes. More details in [AddingAPIRoutes.md](docs/AddingAPIRoutes.md)
- [ ] Understand how to handle errors in the API. More details in [ErrorHandling.md](docs/ErrorHandling.md)


### UI
- [ ] Understand how loading of the space works. See second half of this video [Video](https://drive.google.com/file/d/1Gg-KWR_OqEPLIjDMUIZmslXuZ0CUpAnZ/view?usp=sharing)
- [ ] Understand how notifications need to be shown
- [ ] Understand how strict types need to be used for request and responses
- [ ] Understand the spacing recommendations. More details in [SpacingRecommendations.md](docs/SpacingRecommendations.md)
- [ ] Making sure the UI works for various themes.
- [ ] Understand what is server side rendering and what are server side components in Next.js [ServerSideComponents.md](docs/ServerSideComponents.md).
- [ ] Understand how to handle errors in the UI. More details in [ErrorHandling.md](docs/ErrorHandling.md)
- [ ] Understand how theme and CSS works. More details in [HowThemeAndCssWorks.md](docs/HowThemeAndCssWorks.md)

### Base Application
We have a base application in the repository. See here on the things you can work on in the base application
[BaseFeatures.md](docs/features/BaseFeatures.md)

Checklist for contribution to base application:
- [ ] Understand how the code is structured
- [ ] Understand what is a space
- [ ] Understand how authentication works
- [ ] Understand the features we want to add in the base application

### Tidbits Hub
We have a Tidbits Hub in the repository. See here on the things you can work on in the Tidbits Hub application
[TidbitsHubFuture.md](docs/features/TidbitsHubFutures.md)

Checklist for contribution to Tidbits Hub:
- [ ] Understand how the code is structured
- [ ] Understand what is a Tidbit
- [ ] Understand what is a Clickable Demo
- [ ] Understand the features we want to add in the Tidbits Hub application

### AI Development Guidelines
For AI-assisted development and coding patterns, refer to our comprehensive knowledge base:
- **[AI Knowledge Base](docs/ai-knowledge/)** - Complete development guidelines and patterns
  - [Backend Instructions](docs/ai-knowledge/BackendInstructions.md) - Next.js API development patterns
  - [UI Instructions](docs/ai-knowledge/UIIInstructions.md) - React/Next.js UI development patterns
  - [UI Components](docs/ai-knowledge/ui/) - Specific component guidelines (buttons, forms, page structure, themes)

These documents contain the latest coding patterns, best practices, and examples used across all projects in this repository.
