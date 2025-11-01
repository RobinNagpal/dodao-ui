import {
  getLLMResponseInLamnda,
  LLMResponseViaLambda,
} from "@/llm/get-llm-response";
import { Logger } from "@aws-lambda-powertools/logger";

import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ResponseStream, streamifyResponse } from "lambda-stream";

const logger: Logger = new Logger({ serviceName: "llm-call-with-callback" });

/* --------------------------- shared types & headers -------------------------- */

export const api = streamifyResponse(myHandler);

async function myHandler(
  event: APIGatewayProxyEventV2,
  responseStream: ResponseStream
): Promise<void> {
  // Return response to client
  logger.info("[Function] Returning response to client");
  responseStream.setContentType("application/json");
  responseStream.write(
    JSON.stringify({ message: "Acknowledged. Your request has been received." })
  );
  responseStream.end();

  if (!event.body) {
    return;
  }

  const body: LLMResponseViaLambda<any> = JSON.parse(event.body);

  const llmResponse = await getLLMResponseInLamnda<any, any>(body);
  console.log("llmResponse", llmResponse);
  const { callbackUrl, additionalData } = body;

  // Send response to callback URL
  logger.info("[Function] Sending response to callback URL");
  await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      llmResponse,
      additionalData,
    }),
  });

  logger.info("[Function] Response sent to callback URL");
}
