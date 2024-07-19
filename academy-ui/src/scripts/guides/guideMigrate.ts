import { readFileSync } from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { prisma } from '../../prisma';
import { v4 } from 'uuid';

// Function to read and parse a single YAML file
const readYamlFile = async (filePath: string) => {
  try {
    const fileContent = readFileSync(filePath, 'utf8');
    const guideData = parse(fileContent);
    return guideData;
  } catch (error) {
    console.error('Error reading or parsing YAML file:', error);
    throw error;
  }
};

// Function to read and parse the guides.yaml file
const readGuidesList = async (folderPath: string) => {
  const guidesFilePath = path.join(folderPath, 'guides.yaml');
  try {
    const fileContent = readFileSync(guidesFilePath, 'utf8');
    const guidesList = parse(fileContent);
    return guidesList.guides;
  } catch (error) {
    console.error('Error reading or parsing guides.yaml file:', error);
    throw error;
  }
};

// Function to insert guide into the database
const insertGuide = async (guide: any, spaceId: string, guideSource: string) => {
  const guideId = v4();
  try {
    await prisma.guide.create({
      data: {
        id: guideId,
        content: guide.content,
        uuid: guide.uuid,
        authors: '0x...',
        createdAt: new Date(guide.created),
        spaceId: spaceId,
        guideName: guide.name,
        guideSource: guideSource,
        status: guide.publishStatus,
        version: guide.version || 1,
        thumbnail: guide.thumbnail,
        categories: guide.categories,
        guideType: guide.guideType,
        publishStatus: guide.publishStatus || 'Live',
        discordRoleIds: [],
        showIncorrectOnCompletion: guide.showIncorrectOnCompletion,
        postSubmissionStepContent: '',
      },
    });

    // Insert guide steps
    if (guide.steps && Array.isArray(guide.steps)) {
      for (const [index, step] of guide.steps.entries()) {
        const stepId = v4();
        const newStep = await prisma.guideStep.create({
          data: {
            id: stepId,
            uuid: step.uuid,
            createdAt: new Date(),
            stepName: step.name,
            content: step.content,
            stepItems: step.stepItems,
            stepOrder: index, // Use the index as the stepOrder
            spaceId: spaceId,
          },
        });

        // Create the relation in GuidesGuideStep
        await prisma.guidesGuideStep.create({
          data: {
            id: v4(), // You can generate a unique ID for this relation
            guideStepId: stepId,
            guideId: guideId,
            createdAt: new Date(),
            spaceId: spaceId,
          },
        });
      }
    }
  } catch (error) {
    console.error(`Failed to insert guide with id: ${guide.id}`, error);
  }
};

const main = async () => {
  // Get the folder path and space ID from command line arguments
  const folderPath = '/Users/robintc/projects/dodao-academies/aave-academy';
  const spaceId = 'aave-eth-1';
  const guideSource = 'Database';

  if (!folderPath || !spaceId) {
    console.error('Please provide the absolute path of the folder containing guides.yaml and the space ID.');
    process.exit(1);
  }

  try {
    const guidesList = await readGuidesList(folderPath);
    console.log('Guides list:', guidesList);

    for (const guideFile of guidesList) {
      const guideFilePath = path.join(folderPath, guideFile);
      const guide = await readYamlFile(guideFilePath);
      await insertGuide(guide, spaceId, guideSource);
    }

    console.log('All guides have been inserted.');
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
