import Home from '@/chatbot/home/home';
import { OpenAIModelID } from '@/chatbot/types/openai';

export default function NemaBot() {
  return <Home defaultModelId={OpenAIModelID.GPT_3_5} serverSideApiKeyIsSet={true} serverSidePluginKeysSet={false} isChatbotSite={false} />;
}
