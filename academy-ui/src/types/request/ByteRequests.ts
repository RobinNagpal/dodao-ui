import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { ByteStepDto, CompletionScreenDto, ImageDisplayMode } from '@/types/bytes/ByteDto';

export interface DeleteByteItemRequest {
  itemId: string;
  itemType: ByteCollectionItemType;
}

export interface StepItemInputGenericInput {
  answerKeys?: Array<string> | null;
  choices?: Array<QuestionChoiceInput> | null;
  content?: string;
  explanation?: string;
  label?: string;
  questionType?: string;
  required?: boolean;
  type: string;
  uuid: string;
}

export interface QuestionChoiceInput {
  content: string;
  key: string;
}

export interface ByteStepInput {
  content: string;
  displayMode?: ImageDisplayMode | null;
  imageUrl?: string | null;
  name: string;
  stepItems: Array<StepItemInputGenericInput>;
  uuid: string;
}

export interface UpsertByteInput {
  admins: Array<string>;
  byteStyle?: string;
  completionScreen?: CompletionScreenDto | null;
  content: string;
  created: string;
  id: string;
  name: string;
  priority: number;
  steps: Array<ByteStepInput>;
  tags: Array<string>;
  thumbnail?: string;
  videoAspectRatio?: string;
  videoUrl?: string;
}

export interface EditByteStep extends ByteStepInput, ByteStepDto {
  stepItems: Omit<StepItemInputGenericInput, 'order'>[];
}

export interface EditByteType extends UpsertByteInput {
  id: string;
  isPristine: boolean;
  byteExists: boolean;
  steps: EditByteStep[];
}
