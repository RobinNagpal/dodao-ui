import { Table, TableRow } from '@/components/core/table/Table';
import { useRawGitCoursesQuery } from '@/graphql/generated/generated-types';

export default function CourseListScreen(props: { spaceId: string }) {
  const { data: coursesResponse } = useRawGitCoursesQuery({
    variables: {
      spaceId: props.spaceId,
    },
  });
  const coursesList = coursesResponse?.payload;
  return coursesList ? (
    <Table
      heading={'Courses List'}
      data={coursesList.map(
        (c): TableRow => ({
          columns: [c.key, c.courseRepoUrl || 'N/A'],
          id: c.key,
          item: c,
        })
      )}
      columnsHeadings={['Key', 'Repo Url']}
      columnsWidthPercents={[20, 80]}
    />
  ) : null;
}
