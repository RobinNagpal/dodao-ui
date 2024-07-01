When working with the UI you might primarily be working with the following things:

1. Adding new components - This follows react and nextjs conventions.
2. Adding new graphql queries - This is when you need to fetch data from the backend and show it on the UI.
3. Adding new graphql mutations - This is when you need to send data to the backend and update the database.

## Graphql Coding Workflow

We use graphql to fetch and send data to the backend. This is a guide on how to work with graphql in the UI layer.

### What is graphql?

GraphQL is a query language for APIs and a runtime for executing those queries by using a type system you define for our data. Based on the information you provided and my own knowledge, here are some key points about GraphQL and its benefits for our project:

1. **Efficient Data Retrieval**: GraphQL allows clients to request exactly what they need and nothing more. This minimizes data transfer, which is particularly beneficial for mobile or low-bandwidth environments. In our setup, defining queries and mutations on the client side ensures that our application only retrieves the necessary data from the server.

2. **Strong Typing and Validation**: By generating a schema (`src/schema.graphql`) from our server at `http://localhost:8000/graphql`, you establish a contract between the client and server. This schema serves as a strong type system for validating queries and mutations, reducing the likelihood of runtime errors and improving development efficiency.

3. **Code Generation for Types and Hooks**: Using `graphql-codegen`, you're automatically generating TypeScript types and React hooks based on our GraphQL schema and operations. This approach streamlines the development process, as it ensures type safety and provides ready-to-use hooks for querying and mutating data, which aligns well with modern React development practices.

4. **Modularity and Reusability**: The structure of `codegen.yml` shows a modular approach, where GraphQL documents are organized under `src/graphql/**/*.graphql`. This modularity facilitates reusability and maintainability of our queries and mutations, making it easier to manage and evolve our codebase.

5. **Customizable Configuration for Specific Needs**: Configuration files (`introspection.yml` and `codegen.yml`) indicate a high level of customization, such as including directives, choosing specific types for unions, interfaces, etc. This flexibility allows us to tailor the GraphQL setup to generate code that meets our specific needs.

6. **Real-Time Data with Subscriptions (If Used)**: While not used currently in the project, GraphQL also supports real-time data updates through subscriptions. If implemented, this could enable our application to react instantly to changes in data, enhancing user experience with live updates.

### Graphql Workflow

The workflow described here involves using GraphQL in combination with `graphql-codegen` to generate server-side GraphQL schemas and then client-side types and hooks. Here's an explanation of the process in 7-8 points:

1. **Server-Side GraphQL Schema Generation**: Initially, a GraphQL schema is created on the server. This schema defines the structure of data that can be queried or mutated via GraphQL.

2. **Introspection Query with `graphql-codegen`**: Using `graphql-codegen` with the `introspection.yml` configuration, an introspection query is performed against the server's GraphQL endpoint (here, 'http://localhost:8000/graphql'). This process is used to fetch the schema details from the server using the command:

   ```bash
   yarn graphql:download
   ```

3. **Generation of `schema.graphql`**: The introspection results are used to generate a `schema.graphql` file in the `src` directory. This file represents the server-side schema in GraphQL Schema Definition Language (SDL). The configuration includes plugins like 'schema-ast' and settings like `includeDirectives` to include directives in the schema.

4. **Client-Side Query and Mutation Documentation**: In the client-side codebase, GraphQL queries and mutations are defined in `.graphql` files under `src/graphql`.

5. **Code Generation with `codegen.yml`**: The `codegen.yml` configuration is used to generate TypeScript types and React hooks based on the `src/schema.graphql` and the client-side GraphQL documents.

6. **Generation of TypeScript Types**: The `graphql-codegen` tool generates TypeScript types for the data structures used in the GraphQL queries and mutations. This ensures type safety and autocompletion in IDEs.

7. **Creation of React Apollo Hooks**: The process also generates custom React hooks using the 'typescript-react-apollo' plugin. These hooks can be used to execute the queries and mutations in a React application.

### DoDAO System Architecure

Backend comprises of both RestAPIs and Graphql. Restful APIs are used for quering the bulk content like whole list of projects and Graphql queries are used for the efficient retrieval of rest of the data.

#### Backend

Over the `DoDAO-api`, we write queries and mutations for different entities of the project in different graphql files. Apollo combines all of the generated files into a single schema file.

#### Frontend

The `DoDAO-ui` uses the generated schema file to generate types and hooks. These hooks are used to fetch data from the backend. The frontend also uses the generated types to make sure the data is statically typed.

Here is an illustration of the DoDAO's system architecture:

![DoDAO Architecture](https://github.com/RobinNagpal/dodao-ui/blob/main/academy-ui/public/DoDAO_System_Architecture.png)

### Adding new queries in Graphql

Note: Some of the data is fetched from API instead of the graphql. This was done to support nextjs server side rendering.
So check if you need to fetch the new data as API or graphql first.

#### Step 1 - Download the latest graphql schema

The schema file is updated at the API/backend layer and we run `yarn graphql:download` to update the schema file in the UI layer.

When fetching the latest schema file, make sure you have the latest version of the API running as the schema is fetched from
`http://localhost:8000/graphql` url.

#### Step 2 - Declare new query in the graphql file

For this you need a add a .graphql file e.g. `src/graphql/byte/byteCollection.graphql`. In this file you need to add
the new query. For example:

```graphql
fragment ByteCollection on ByteCollection {
  id
  name
  description
  status
  byteIds
  order
  bytes {
    byteId
    name
    content
  }
}

query ByteCollections($spaceId: String!) {
  byteCollections(spaceId: $spaceId) {
    ...ByteCollection
  }
}

query ByteCollection($spaceId: String!, $byteCollectionId: String!) {
  byteCollection(spaceId: $spaceId, byteCollectionId: $byteCollectionId) {
    ...ByteCollection
  }
}
```

These queries map to the schema defined in `src/schema.graphql`. If the queries are not present in the schema then
you will get an error.

#### Step 3 - Generate graphql files/types/code

Run `yarn graphql:generate` to generate the graphql files/types/code. This will generate the following code:

1. Types - Types corresponding to the data returned by the graphql queries.
2. Hooks - Hooks corresponding to the graphql queries. These hooks can be used to fetch data from the backend.

#### Step 4 - Use the hooks to fetch data

See `src/app/projects/view/[projectId]/[viewType]/page.tsx` for an example of how to use the hooks to fetch data.

Here is the code

```typescript
import {
  SpaceWithIntegrationsFragment,
  useProjectByteCollectionsQuery,
  useProjectByteQuery,
  useProjectBytesQuery,
  useProjectQuery,
} from '@/graphql/generated/generated-types';

const { loading: loadingByteCollections, data: byteCollectionsData } = useProjectByteCollectionsQuery({
  variables: {
    projectId: props.params.projectId,
  },
});
```

The types imported are generated by the graphql code generation step. This makes sure the UI code
is always typed and are using the right fields

## Adding new mutations

#### Step 1 - Download the latest graphql schema

The schema file is updated at the API/backend layer and we run `yarn graphql:download` to update the schema file in the UI layer.

When fetching the latest schema file, make sure you have the latest version of the API running as the schema is fetched from
`http://localhost:8000/graphql` url.

#### Step 2 - Declare new mutation in the graphql file

For this you need a add a .graphql file e.g. `src/graphql/byte/byteCollection.graphql`. In this file you need to add
the new mutation. For example:

```graphql
fragment ByteCollection on ByteCollection {
  id
  name
  description
  status
  byteIds
  order
  bytes {
    byteId
    name
    content
  }
}

mutation CreateByteCollection($input: CreateByteCollectionInput!) {
  createByteCollection(input: $input) {
    ...ByteCollection
  }
}

mutation UpdateByteCollection($input: UpdateByteCollectionInput!) {
  updateByteCollection(input: $input) {
    ...ByteCollection
  }
}
```

#### Step 3 - Generate graphql files/types/code

Run `yarn graphql:generate` to generate the graphql files/types/code. This will generate the following code:

1. Types - Types corresponding to the data to be sent to the backend and also the data returned by the backed in the response.
2. Hooks - Hooks corresponding to the graphql mutations. These hooks can be used to send data to the backend.

```typescript
import {
  SpaceWithIntegrationsFragment,
  useCreateByteCollectionMutation,
  useQueryBytesQuery,
  useUpdateByteCollectionMutation,
} from '@/graphql/generated/generated-types';

const [updateByteCollectionMutation] = useUpdateByteCollectionMutation();

const [createByteCollectionMutation] = useCreateByteCollectionMutation();

async function upsertByteCollectionFn(byteCollection: EditByteCollection, byteCollectionId: string | null) {
  if (!byteCollectionId) {
    await createByteCollectionMutation({
      variables: {
        input: {
          spaceId: props.space.id,
          name: byteCollection.name,
          description: byteCollection.description,
          byteIds: byteCollection.bytes.map((byte) => byte.byteId),
          status: byteCollection.status,
          order: byteCollection.order,
        },
      },
    });
  } else {
    await updateByteCollectionMutation({
      variables: {
        input: {
          byteCollectionId,
          name: byteCollection.name,
          description: byteCollection.description,
          byteIds: byteCollection.bytes.map((byte) => byte.byteId),
          status: byteCollection.status,
          spaceId: props.space.id,
          order: byteCollection.order,
        },
      },
    });
  }
}
```

The types imported are generated by the graphql code generation step. This makes sure the UI code
is always typed and are using the right fields

## Form Validation

### Form Validation Process Documentation

#### Overview

This document outlines a structured approach to form validation within our Next.js application, designed to ensure consistency and maintainability across different forms. It describes a method for validating forms based on mandatory fields, utilizing an interface for field definitions and a helper function for validation. It's important to note that while `validateCategory` is used here for illustration purposes, the actual function name will vary according to the form being validated.

#### Interface Definition

For each form requiring validation, we define an interface within `error.ts` that enumerates all mandatory fields. For example, in a form for creating a category where "name" and "excerpt" are mandatory, these fields would be included in the interface. This interface acts as a foundation for the validation process, ensuring all required checks are implemented.

#### Helper Function: Example `validateCategory`

At the heart of our validation approach is a helper function exemplified here as `validateCategory`. This function's purpose is to validate the form's inputs against the criteria specified in our interface, determining if the mandatory fields are adequately completed.

**Functionality:**

- The function evaluates each mandatory field for completeness and correctness.
- An error object is populated based on the validation outcome, identifying any fields that fail the validation.
- It returns a boolean indicating the form's validity. This boolean is essential for managing form submission and for displaying error messages where necessary.

#### Usage

The validation function (e.g., `validateCategory` in this example) should be invoked with the form's current state as input prior to submission. Depending on the return value:

- A return value of `true` indicates that the form meets all validation criteria, allowing for submission.
- A return value of `false` signals the presence of validation errors. The accompanying error object, detailed by the function, should then be used to guide error display in the UI, informing users about which fields require attention.

## Server Side Rendering (SSR) in Nextjs

Nextjs supports server side rendering. This means that the UI is rendered on the server and then sent to the client which makes the rendering of the components faster.

Here is a video explanation on a top level [What is SSR & how to achieve it?](https://drive.google.com/file/d/1Qj7JJLJB4gx0pgH_4T-vpNG3-pREIlE1/view?usp=sharing):

Here is a coding example of [Converting Client Side to Server Side Rendering](https://drive.google.com/file/d/1jqD-EZL70sYXH-A7NnL7EQ9A1Mr09rjz/view?usp=sharing).

[![What is SSR and how to achieve it?](https://miro.medium.com/v2/resize:fit:1400/1*7TEKaVM6HhAHl0uDc4kjSw.gif)](https://drive.google.com/file/d/1Qj7JJLJB4gx0pgH_4T-vpNG3-pREIlE1/view?usp=sharing)

## Application Architecture

![DoDAO Application Architecture](https://github.com/RobinNagpal/dodao-ui/blob/main/academy-ui/public/Application_Architecture.png)
