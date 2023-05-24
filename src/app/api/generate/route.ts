import { NextResponse } from 'next/server';
import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai';
import { CreateChatCompletionRequest } from 'openai/api';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI');
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getByteWithGpt3Completion(prompt: string) {
  const createCompletionRequestGpt3: CreateCompletionRequest = {
    model: 'gpt-3.5-turbo',
    prompt: prompt,
    temperature: 0.2,
    top_p: 1,
    stream: false,
    n: 1,
  };

  console.time('openai - createCompletionRequestGpt3');
  console.log('payload', createCompletionRequestGpt3);

  const completion = await openai.createCompletion(createCompletionRequestGpt3, { timeout: 5 * 60 * 1000 });

  const response = completion.data.choices[0].text;
  console.timeEnd('openai - createCompletionRequestGpt3');
  console.log('response', response);
  const responseBody = response ? JSON.parse(response) : {};
  return responseBody;
}

async function getByteWithGpt3Chat(prompt: string) {
  const createChatCompletionRequest: CreateChatCompletionRequest = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
    n: 1,
  };

  console.time('openai - createChatCompletionRequest');
  console.log('payload', createChatCompletionRequest);

  const completion = await openai.createChatCompletion(createChatCompletionRequest, { timeout: 5 * 60 * 1000 });

  const response = completion.data.choices[0].message;
  console.timeEnd('openai - createChatCompletionRequest');
  console.log('response', response);
  const responseBody = response?.content ? JSON.parse(response.content) : {};
  return responseBody;
}

async function getByteWithDavinciChat(prompt: string) {
  const createChatCompletionRequestDavinci: CreateChatCompletionRequest = {
    model: 'text-davinci-003',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    top_p: 1,
    stream: false,
    n: 1,
  };

  console.time('openai - createChatCompletionRequestDavinci');
  console.log('payload', createChatCompletionRequestDavinci);

  const completion = await openai.createChatCompletion(createChatCompletionRequestDavinci, { timeout: 5 * 60 * 1000 });

  const response = completion.data.choices[0].message;
  console.timeEnd('openai - createChatCompletionRequestDavinci');
  console.log('response', response);
  const responseBody = response?.content ? JSON.parse(response.content) : {};
  return responseBody;
}

export async function POST(req: Request): Promise<Response> {
  const { prompt } = (await req.json()) as {
    prompt: string;
  };

  try {
    console.log('get response for generation');
    const body = await getByteWithGpt3Chat(prompt);
    return NextResponse.json(body);
  } catch (e) {
    console.log('error', e);
    return NextResponse.json({});
  }
}
