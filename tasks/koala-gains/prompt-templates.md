I want to create a nextjs application with app router that uses typescript and tailwindcss. I want to create
the following in the application: 

Make sure to use strict and explicit types in typescript. 

Some rules to follow:
1. Each entity should have id which will be a uuid
2. Each entity should have a created_at and updated_at, created_by and updated_by fields
3. Each entity should have spaceId field which will be a uuid

Entities:
1. Prompt - A prompt version has a name, key, excerpt, and a list of prompt version, and one active prompt version
Key will be like a aws s3 key with slashes to represent a folder structure, inputSchema, outputSchema, sampleJson.
2. Prompt Version - A prompt version will have version which will be a number, promptTemplate, commit message
3. Prompt Invocation - A prompt invocation will have promptVersion, inputJson, outputJson, status, and error

The api routes should be:
- POST - /api/[spaceId]/prompts - Create a prompt
- GET - /api/[spaceId]/prompts - Get all prompts
- GET - /api/[spaceId]/prompts/[promptId] - Get a prompt
- PUT - /api/[spaceId]/prompts/[promptId] - Update a prompt
- DELETE - /api/[spaceId]/prompts/[promptId] - Delete a prompt
- POST - /api/[spaceId]/prompts/[promptId]/versions - Create a prompt version
- GET - /api/[spaceId]/prompts/[promptId]/versions - Get all prompt versions
- GET - /api/[spaceId]/prompts/[promptId]/versions/[version] - Get a prompt version
- PUT - /api/[spaceId]/prompts/[promptId]/versions/[version] - Update a prompt version
- DELETE - /api/[spaceId]/prompts/[promptId]/versions/[version] - Delete a prompt version
- POST - /api/[spaceId]/prompts/[promptId]/invocations - Create a prompt invocation
- GET - /api/[spaceId]/prompts/[promptId]/invocations - Get all prompt invocations
- GET - /api/[spaceId]/prompts/[promptId]/invocations/[invocationId] - Get a prompt invocation
- GET - /api/schemas - Get all schemas


I will be having the following pages:
- /prompts - List of all prompts in a table format
- /prompts/[promptId] - Details of a prompt which includes showing of all the details of the prompt and a list of prompt versions
in a table format
- /prompts/edit/[promptId] - Edit a prompt - This will have a form to edit the prompt
- /prompts/edit/create - Create a prompt - This will have a form to edit the prompt
- /prompts/[promptId]/versions/create - Create a prompt version - This will have a form to create a prompt version

I will be using the following libraries:
- nextjs
- typescript
- tailwindcss
- react

Make sure to use very very strict types in typescript and tsx code.

I have already have some utils for forms and making api calls. You should make sure to use them.

```tsx
'use client';

import { GicsSector, SectorsData } from '@/types/public-equity/gicsSector';
import { TickerCreateRequest } from '@/types/public-equity/ticker-request-response';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';

import { useState } from 'react';
import PrivateWrapper from '../auth/PrivateWrapper';

interface EditTickerViewProps {
  gicsData: SectorsData;
  ticker?: Ticker;
}

export default function EditTickerView({ gicsData, ticker }: EditTickerViewProps) {
  const sectors: GicsSector[] = Object.values(gicsData);

  const [tickerKey, setTickerKey] = useState(ticker?.tickerKey || '');

  const initialSector = sectors.find((s) => s.id === ticker?.sectorId) || sectors[0];
  console.log('initialSector', initialSector);
  console.log('sectors', sectors);

  const [tickerForm, setTickerForm] = useState<TickerCreateRequest>({
    tickerKey: ticker?.tickerKey || '',
    sectorId: ticker?.sectorId || initialSector.id,
    industryGroupId: ticker?.industryGroupId || Object.values(initialSector.industryGroups)[0].id,
    companyName: ticker?.companyName || '',
    shortDescription: ticker?.shortDescription || '',
  });

  const [selectedSector, setSelectedSector] = useState<GicsSector>(initialSector);

  const { postData, loading: createLoading } = usePostData<Ticker, TickerCreateRequest>({
    successMessage: 'Ticker saved successfully!',
    errorMessage: 'Failed to save ticker. Please try again.',
    redirectPath: `/public-equities/tickers`,
  });

  const { putData, loading: updateLoading } = usePutData<Ticker, TickerCreateRequest>({
    successMessage: 'Ticker updated successfully!',
    errorMessage: 'Failed to update ticker. Please try again.',
    redirectPath: `/public-equities/tickers`,
  });

  const handleSave = async () => {
    if (ticker) {
      await putData(`${getBaseUrl()}/api/tickers/${tickerKey}`, {
        tickerKey: tickerForm.tickerKey,
        sectorId: tickerForm.sectorId,
        industryGroupId: tickerForm.industryGroupId,
        companyName: tickerForm.companyName,
        shortDescription: tickerForm.shortDescription,
      });
    } else {
      await postData(`${getBaseUrl()}/api/tickers`, {
        tickerKey: tickerForm.tickerKey,
        sectorId: tickerForm.sectorId,
        industryGroupId: tickerForm.industryGroupId,
        companyName: tickerForm.companyName,
        shortDescription: tickerForm.shortDescription,
      });
    }
  };

  return (
    <Block title={ticker ? 'Edit Ticker' : 'Create Ticker'} className="font-semibold text-color">
      <Input
        modelValue={tickerForm.tickerKey}
        placeholder="Enter Ticker Key"
        maxLength={10}
        className="text-color"
        onUpdate={(e) => setTickerForm({ ...tickerForm, tickerKey: e as string })}
      >
        Ticker *
      </Input>

      <Input
        modelValue={tickerForm.companyName}
        placeholder="Enter Company Name"
        className="text-color"
        onUpdate={(e) => setTickerForm({ ...tickerForm, companyName: e as string })}
      >
        Company Name
      </Input>

      <Input
        modelValue={tickerForm.shortDescription}
        placeholder="Enter Short Description"
        className="text-color"
        onUpdate={(e) => setTickerForm({ ...tickerForm, shortDescription: e as string })}
      >
        Short Description
      </Input>

      <StyledSelect
        label="Sector"
        selectedItemId={selectedSector.id.toString()}
        items={sectors.map((sector) => ({ id: sector.id.toString(), label: sector.name }))}
        setSelectedItemId={(value) => {
          const selected = sectors.find((s) => s.id === parseInt(value || '0'))!;
          setSelectedSector(selected);
          setTickerForm({ ...tickerForm, sectorId: selected.id, industryGroupId: Object.values(selected?.industryGroups)[0].id });
        }}
      />

      <StyledSelect
        label="Industry Group"
        selectedItemId={tickerForm.industryGroupId.toString()}
        items={Object.values(selectedSector.industryGroups).map((ig) => ({
          id: ig.id.toString(),
          label: ig.name,
        }))}
        setSelectedItemId={(value) => {
          setTickerForm({ ...tickerForm, industryGroupId: parseInt(value || '0') });
        }}
      />
      {/* ✅ Save Button */}
      <PrivateWrapper>
        <div className="flex justify-center items-center mt-6">
          <Button
            onClick={handleSave}
            className="block"
            variant="contained"
            primary
            loading={createLoading || updateLoading}
            disabled={createLoading || updateLoading}
          >
            {createLoading || updateLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </PrivateWrapper>
    </Block>
  );
}
```

For colors use the following css classes as it uses the colors from css variables:
```css
.text-color {
  color: var(--text-color);
}

.heading-color {
  color: var(--heading-color);
}

.primary-text-color {
  color: var(--primary-color);
}

.primary-color {
  color: var(--primary-color);
}

.primary-text-color {
  color: var(--primary-text-color);
}

.link-color {
  color: var(--link-color);
}

.background-color {
  background-color: var(--bg-color);
}

.block-bg-color {
  background-color: var(--block-bg);
}

.block-bg-color:hover {
  background-color: var(--block-bg);
}

.border-color {
  border-color: var(--border-color);
}

.divider-bg {
  background-color: var(--border-color);
}
.bg-primary-text {
  background-color: var(--primary-text-color);
}
.ring-border {
  /* When used in conjunction with Tailwind’s ring-1, this sets the ring color */
  --tw-ring-color: var(--border-color);
}
```

```ts
import { CSSProperties } from 'react';

export const themeColors = {
  '--primary-color': '#4F46E5', // Indigo-600 for primary actions
  '--primary-text-color': '#ffffff', // Crisp white text on primary elements
  '--bg-color': '#1F2937', // Gray-800 for the main background
  '--text-color': '#D1D5DB', // Gray-300 for body text for good contrast
  '--link-color': '#4F46E5', // Matching the primary color for links
  '--heading-color': '#ffffff', // White for headings
  '--border-color': '#374151', // Gray-700 for subtle borders
  '--block-bg': '#374151', // A slightly lighter dark for block backgrounds
  '--swiper-theme-color': '#4F46E5', // Consistent with the primary color for Swiper components
} as CSSProperties;

```
Here is how I define my prisma models. Make sure to be consistent.

```prisma
model ImportantMetricsEvaluation {
  id                    String           @id @default(uuid())
  status                ProcessingStatus
  createdAt             DateTime         @default(now()) @map("created_at")
  updatedAt             DateTime         @updatedAt @map("updated_at")
  createdBy             String?          @map("created_by")
  updatedBy             String?          @map("updated_by")
  tickerKey             String           @map("ticker_key")
  criterionKey          String           @map("criterion_key")
  spaceId               String           @default("koala_gains") @map("space_id")
  criterionEvaluationId String?          @unique @map("criterion_evaluation_id")

  criterionEvaluation CriterionEvaluation? @relation(fields: [criterionEvaluationId], references: [id])
  ticker              Ticker               @relation(fields: [tickerKey], references: [tickerKey])
  metrics             MetricValueItem[]

  @@unique([spaceId, tickerKey, criterionKey])
  @@map("important_metrics")
}
```

I also have some helper functions for api. Make sure to reuse them 

```ts
import { prisma } from '@/prisma';
import { TickerCreateRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(): Promise<Ticker[]> {
  const tickers = await prisma.ticker.findMany();
  return tickers;
}

async function postHandler(req: NextRequest): Promise<Ticker> {
  const { sectorId, industryGroupId, tickerKey, companyName, shortDescription }: TickerCreateRequest = await req.json();

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (existingTicker) {
    console.log(`Ticker already exists for ${tickerKey}`);
    return existingTicker;
  }

  const data: any = {
    tickerKey,
    sectorId,
    industryGroupId,
  };

  if (companyName && companyName.trim() !== '') {
    data.companyName = companyName;
  }
  if (shortDescription && shortDescription.trim() !== '') {
    data.shortDescription = shortDescription;
  }

  const newTicker = await prisma.ticker.create({
    data,
  });

  console.log(`Created new ticker for ${tickerKey}`);
  return newTicker;
}

export const GET = withErrorHandlingV2<Ticker[]>(getHandler);
export const POST = withErrorHandlingV2<Ticker>(postHandler);

```

```ts
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const ticker = await prisma.ticker.findUniqueOrThrow({
    where: {
      spaceId_tickerKey: {
        tickerKey,
        spaceId: KoalaGainsSpaceId,
      },
    },
    include: {
      criteriaMatchesOfLatest10Q: {
        include: {
          criterionMatches: {
            include: {
              matchedAttachments: true,
            },
          },
        },
      },
      evaluationsOfLatest10Q: {
        include: {
          reports: true,
          importantMetricsEvaluation: {
            include: {
              metrics: true,
            },
          },
          performanceChecklistEvaluation: {
            include: {
              performanceChecklistItems: true,
            },
          },
        },
      },
    },
  });

  return ticker;
}

async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const deletedTicker = await prisma.ticker.delete({
    where: { tickerKey },
  });

  return deletedTicker;
}

async function putHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;
  const { tickerKey: newTickerKey, sectorId, industryGroupId, companyName, shortDescription } = await req.json();

  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        tickerKey,
        spaceId: KoalaGainsSpaceId,
      },
    },
    data: {
      tickerKey: newTickerKey,
      sectorId,
      industryGroupId,
      companyName,
      shortDescription,
    },
  });

  return updatedTicker;
}

export const GET = withErrorHandlingV2<Ticker>(getHandler);
export const DELETE = withErrorHandlingV2<Ticker>(deleteHandler);
export const PUT = withErrorHandlingV2<Ticker>(putHandler);
```




Here are more details about the application. Earlier I had a non-web version of the application, but now I want to create a web version of the application.


# Table of Contents

1. [About "Prompt Manager Template"](##about-prompt-manager-template)  
   1.1. [Key Features](##key-features)  
   1.2. [Why .prompt.hbs is Used](##why-prompthbs-is-used)

2. [Project Explanation](##project-explanation)  
   2.1. [Code Structure & Flow](##code-structure--flow)  
   2.2. [How It All Works Together](##how-it-all-works-together)

3. [Example Explanation](##example-explanation)  
   3.1. [Detailed Analysis Prompt Example](##detailed-analysis-prompt-example)  
   3.2. [Concise Summary Prompt Example](##concise-summary-prompt-example)  
   3.3. [Overall Example Workflow](##overall-example-workflow)

# Prompt Manager Template


## 1) About "Prompt Manager Template"

### Key Features
- **Collaboration & Updates:**  
  The template manager provides a simple way for teams to collaborate and update prompt templates. All changes are tracked using GitHub for version control and permissioning.
- **Strict Types:**  
  Input and output types are strictly defined using JSON Schema. This ensures that data passed to and from the prompts is validated and error-free.
- **Versioning:**  
  Templates are versioned, so you can keep track of updates and revert changes if needed.
- **Schema-based Validation:**  
  The system uses schemas to validate both inputs and outputs, as well as the structure of the prompt templates.
- **Handlebars Engine:**  
  Handlebars is used to compile the prompt templates. The `.prompt.hbs` extension makes it clear that the file contains both metadata (via YAML frontmatter) and a Handlebars template.
- **Integrated Workflow:**  
  The project compiles the templates, validates inputs and outputs, and is managed entirely on GitHub.

### Why .prompt.hbs is Used
- **Dual Content:**  
  The `.prompt.hbs` extension indicates that the file includes a Handlebars template. Additionally, it allows YAML frontmatter to be embedded at the top for metadata (like input and output schema names).
- **Editor-Friendly:**  
  Combining YAML metadata with Handlebars syntax in one file makes it easier for developers to read, maintain, and version the prompt together.
- **Single Source of Truth:**  
  By keeping metadata and the template in one file, there is no risk of mismatched versions or lost context when updates are made.

---

## 2) Project Explanation

### Code Structure & Flow
- **templateLoader.ts:**  
  This file is responsible for loading all `.prompt.hbs` files from the designated templates folder. It uses a glob pattern to find the files and the `gray-matter` library to parse the YAML frontmatter and separate it from the Handlebars template content.  
  _Essential Code Example:_
  ```ts
  const compiledTemplate: Handlebars.TemplateDelegate = Handlebars.compile(templateContent);
  ```
  This compiles the template so it can later be rendered with dynamic data.

- **schemaLoader.ts:**  
  This file loads YAML schema files from multiple folders. It uses the `js-yaml` library to convert YAML into JavaScript objects and `$RefParser` to resolve any `$ref` pointers across schema files.  
  _Essential Code Example:_
  ```ts
  const schema: object = await $RefParser.dereference(schemaFilePath);
  ```
  This ensures that all nested schema references are properly resolved.

- **index.ts:**  
  The main file integrates the template and schema loaders. It demonstrates how to render the templates with dummy data and how to validate the output by dereferencing the output schemas.  
  _Essential Code Example:_
  ```ts
  const rendered = template.compiledTemplate(data);
  ```
  This shows how dynamic data is injected into the template to produce the final prompt.

### How It All Works Together
- The template loader finds and compiles all `.prompt.hbs` files.
- The schema loader reads and resolves complex, nested schemas that are spread over multiple folders.
- The main file (index.ts) ties everything together by rendering the templates with sample data and validating the results against the specified output schemas.

---

## 3) Example Explanation

```shell
prompt-manager-template/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts            // Main runner code
│   ├── templateLoader.ts   // Loads .prompt.hbs files
│   └── schemaLoader.ts     // Loads and dereferences YAML schemas
├── templates/
│   └── stock/
│       ├── detailed_analysis.prompt.hbs
│       └── concise_summary.prompt.hbs
└── schemas/
    └── stock/
        ├── entities/
        │     ├── company.schema.yaml
        │     ├── market.schema.yaml
        │     ├── historical.schema.yaml
        │     └── stock.schema.yaml
        ├── analysis/
        │     ├── input.schema.yaml
        │     ├── result.schema.yaml
        │     └── output.schema.yaml
        └── summary/
              ├── input.schema.yaml
              ├── result.schema.yaml
              └── output.schema.yaml
```

### Detailed Analysis Prompt Example
- **Input Schema:**  
  Stored in `schemas/stock/analysis/input.schema.yaml`, this schema references common entity schemas (company, market, historical) located in the `entities/` folder.
- **Output Schema:**  
  Stored in `schemas/stock/analysis/output.schema.yaml`, it wraps an analysis result schema that defines the structure of the LLM's response.
- **Prompt Template:**  
  The file `templates/stock/detailed_analysis.prompt.hbs` uses the above input and output schemas. It includes dynamic placeholders such as `{{company.name}}`, `{{market.trends}}`, and `{{historical.high}}` for generating a comprehensive stock analysis.
- **Key Idea:**  
  This prompt is designed for a detailed analysis where a lot of data is required. The structure ensures that every piece of information (company details, market trends, historical data) is validated before the prompt is sent to the LLM.

### Concise Summary Prompt Example
- **Input Schema:**  
  Defined in `schemas/stock/summary/input.schema.yaml`, this schema references the company and stock data schemas from the `entities/` folder.
- **Output Schema:**  
  Located at `schemas/stock/summary/output.schema.yaml`, it wraps a summary result schema detailing the key financial ratios and market sentiment.
- **Prompt Template:**  
  The file `templates/stock/concise_summary.prompt.hbs` uses these schemas and includes placeholders like `{{company.name}}`, `{{stock.current_price}}`, and `{{stock.sentiment}}` to create a brief summary.
- **Key Idea:**  
  This prompt is meant for a quick overview. The schema division ensures that only the necessary data is validated and used, making the prompt concise and to the point.

### Overall Example Workflow
- **File Organization:**  
  Schemas are divided into multiple folders:
    - **Entities:** Contains common reusable schemas (company, market, historical, stock).
    - **Analysis:** Contains input and output schemas specific to detailed analysis prompts.
    - **Summary:** Contains input and output schemas specific to concise summary prompts.
- **Versioning & Maintenance:**  
  Since all templates and schemas are stored in GitHub, it is easy to track changes and collaborate with team members.
- **Template Compilation & Validation:**  
  The project compiles the Handlebars templates, injects dummy data, and validates the output against the resolved schemas. This ensures that any prompt sent to the LLM adheres to the defined structure.


--
## Generated Code Explanation

- **TypeScript Model Generator:**  
  Generates TypeScript interfaces from YAML schemas using `json-schema-to-typescript`.  
  **Key Code:**
  ```ts
  const tsCode = await compileFromFile(file, { bannerComment: '' });
  ```  
Output is saved under `generated-models/typescript/models/stock` with the same folder structure as the schemas.

- **Python Pydantic Model Generator:**  
  Uses `datamodel-code-generator` to produce Pydantic models from the YAML schemas.  
  **Key Code:**
  ```python
  command = ['datamodel-codegen', '--input', input_path, '--output', output_path, '--input-file-type', 'yaml']
  ```  
  Models are saved under `generated-models/python/models/stock` following the schema folder hierarchy.

## 2) Lambda Explanation

- **Background & Purpose:**  
  This Serverless Lambda function is built in TypeScript and uses LangChain JS to call an LLM (e.g. OpenAI). It validates input using JSON Schemas and compiles Handlebars templates to generate a dynamic prompt. The Lambda ensures the prompt is valid and returns structured output according to an output schema.

- **Process Overview:**
    1. **Input Validation:**  
       The Lambda expects an event with `input`, `template-id`, `llmProvider`, and `model`. It loads the template (a `.prompt.hbs` file with YAML frontmatter) and validates the input against the specified input schema using Ajv.
       ```ts
       const { valid, errors } = validateData(inputSchema, input);
       ```

    2. **Template Compilation:**  
       After successful validation, the Handlebars template is compiled with the input data to generate the final prompt.
       ```ts
       const prompt = compiledTemplate(input);
       ```

    3. **LLM Call:**  
       The Lambda then uses LangChain JS (currently supports OpenAI) to send the generated prompt to the model.
       ```ts
       const chain = new LLMChain({ llm, prompt });
       const result = await chain.call({ input: prompt });
       ```

    4. **Output Validation & Error Handling:**  
       If an output schema is provided in the template metadata, the response from the LLM is validated. The function returns appropriate HTTP error codes (400, 404, 500) if any step fails.

- **What It Does:**
    - **Validates:** Ensures the incoming request data meets strict schema requirements.
    - **Generates:** Creates a prompt by merging dynamic data with a pre-defined Handlebars template.
    - **Calls:** Invokes the LLM using LangChain JS.
    - **Validates Output:** Checks that the LLM's response follows the output schema.
    - **Returns:** Provides structured results or error messages accordingly.
```
