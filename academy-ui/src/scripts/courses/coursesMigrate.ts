import { readFileSync } from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { prisma } from '../../prisma';

// Function to read and parse a single YAML file
const readYamlFile = async (filePath: string) => {
  try {
    const fileContent = readFileSync(filePath, 'utf8');
    const courseData = parse(fileContent);
    return courseData;
  } catch (error) {
    console.error('Error reading or parsing YAML file:', error);
    throw error;
  }
};

// Function to insert course into the database
const insertCourse = async (course: any, spaceId: string) => {
  try {
    await prisma.course.create({
      data: {
        id: course.id || course.key,
        coursePassContent: course.coursePassContent,
        space: {
          connect: {
            id: spaceId,
          },
        },
        thumbnail: course.thumbnail,
        publishStatus: course.publishStatus || 'Live',
        details: course.details,
        duration: course.duration,
        key: course.key,
        summary: course.summary,
        title: course.title,
        topicConfig: course.topicConfig,
        courseAdmins: course.courseAdmins,
        highlights: course.highlights,
        topics: course.topics,
      },
    });
  } catch (error) {
    console.error(`Failed to insert course with id: ${course.id}`, error);
  }
};
const main = async () => {
  // Get the folder path and space ID from command line arguments
  const folderPath = '/Users/robintc/projects/dodao-courses/raising-funds-using-defi/generated';
  const spaceId = process.env.DODAO_DEFAULT_SPACE_ID;
  if (!folderPath || !spaceId) {
    console.error('Please provide the absolute path of the folder containing course.json and the space ID.');
    process.exit(1);
  }

  try {
    const courseFilePath = path.join(folderPath, 'course.json');
    const course = await readYamlFile(courseFilePath);
    await insertCourse(course, spaceId);

    console.log('Course has been inserted.');
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
