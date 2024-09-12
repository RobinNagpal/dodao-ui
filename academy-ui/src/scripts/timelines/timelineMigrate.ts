import { readFileSync } from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { prisma } from '../../prisma';
import { v4 } from 'uuid';
import { TimelineEvent } from '@/graphql/generated/generated-types';

// Function to read and parse a single YAML file
const readYamlFile = async (filePath: string) => {
  try {
    const fileContent = readFileSync(filePath, 'utf8');
    const timelineData = parse(fileContent);
    return timelineData;
  } catch (error) {
    console.error('Error reading or parsing YAML file:', error);
    throw error;
  }
};

// Function to read and parse the timelines.yaml file
const readTimelinesList = async (folderPath: string) => {
  const timelinesFilePath = path.join(folderPath, 'timelines.yaml');
  try {
    const fileContent = readFileSync(timelinesFilePath, 'utf8');
    const timelinesList = parse(fileContent);
    return timelinesList.timelines;
  } catch (error) {
    console.error('Error reading or parsing timelines.yaml file:', error);
    throw error;
  }
};

// Function to insert timeline into the database
const insertTimeline = async (timeline: any, spaceId: string) => {
  try {
    await prisma.timeline.create({
      data: {
        id: timeline.id,
        content: timeline.content,
        created: timeline.created,
        spaceId: spaceId,
        thumbnail: timeline.thumbnail,
        publishStatus: timeline.publishStatus || 'Live',
        excerpt: timeline.excerpt,
        name: timeline.name,
        admins: timeline.admins,
        events: timeline.events.map((event: TimelineEvent) => ({
          fullDetails: event.fullDetails,
          date: event.date,
          moreLink: event.moreLink,
          summary: event.summary,
          title: event.title,
          uuid: event.uuid,
        })),
        // events: timeline.events,
        priority: timeline.priority,
        tags: timeline.tags,
        timelineStyle: timeline.timelineStyle,
      },
    });
  } catch (error) {
    console.error(`Failed to insert timeline with id: ${timeline.id}`, error);
  }
};
const main = async () => {
  // Get the folder path and space ID from command line arguments
  const folderPath = 'C:\\dodaoRepos\\compound-finance-academy\\src\\timelines\\main';
  const spaceId = process.env.DODAO_DEFAULT_SPACE_ID;
  if (!folderPath || !spaceId) {
    console.error('Please provide the absolute path of the folder containing timelines.yaml and the space ID.');
    process.exit(1);
  }

  try {
    const timelinesList = await readTimelinesList(folderPath);
    console.log('Timeline list:', timelinesList);

    for (const timelineFile of timelinesList) {
      const timelineFilePath = path.join(folderPath, timelineFile);
      const timeline = await readYamlFile(timelineFilePath);
      await insertTimeline(timeline, spaceId);
    }

    console.log('All timelines have been inserted.');
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
