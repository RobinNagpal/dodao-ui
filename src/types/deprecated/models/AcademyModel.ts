import { ByteModel } from './byte/ByteModel';
import { GitCourseModel } from './course/GitCourseModel';
import { GitGuideModel } from './gitGuides/model/GitGuideModel';
import { SimulationModel } from './simulation/SimulationModel';
import { TimelineModel } from './timeline/TimelineModel';

export interface AcademyModel {
  bytes: Record<string, ByteModel[]>;
  courses: Record<string, GitCourseModel[]>;
  timelines: Record<string, TimelineModel[]>;
  guides: Record<string, GitGuideModel[]>;
  simulations: Record<string, SimulationModel[]>;
}
