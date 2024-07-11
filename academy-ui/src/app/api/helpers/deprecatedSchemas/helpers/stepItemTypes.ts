import { InputType, QuestionType, UserDiscordConnectType } from '@/app/api/helpers/deprecatedSchemas/models/enums';

export const isUserDiscordConnect = (item: { type: string }) => item.type === UserDiscordConnectType;

export const isQuestion = (item: { type: string }) => item.type === QuestionType.MultipleChoice || item.type === QuestionType.SingleChoice;
export const isUserInput = (item: { type: string }) => item.type === InputType.PublicShortInput || item.type === InputType.PrivateShortInput;
