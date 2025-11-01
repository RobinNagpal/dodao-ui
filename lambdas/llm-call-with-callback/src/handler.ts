import {
  getLLMResponseInLamnda,
  LLMResponseViaLambda,
} from "@/llm/get-llm-response";
import { Logger } from "@aws-lambda-powertools/logger";

// ⬇️ use the Function URL event type
import { LambdaFunctionURLEvent } from "aws-lambda";
import { ResponseStream, streamifyResponse } from "lambda-stream";

const logger: Logger = new Logger({ serviceName: "llm-call-with-callback" });

export const api = streamifyResponse(myHandler);

async function myHandler(
  event: LambdaFunctionURLEvent,
  responseStream: ResponseStream
): Promise<void> {
  // Immediate ack to the client (streamed)
  logger.info("[Function] Returning response to client");
  responseStream.setContentType("application/json");
  responseStream.write(
    JSON.stringify({ message: "Acknowledged. Your request has been received." })
  );
  responseStream.end();

  if (!event.body) return;

  const body: LLMResponseViaLambda<any> = JSON.parse(
    event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString()
      : event.body
  );

  const llmResponse = await getLLMResponseInLamnda<any, any>(body);
  const { callbackUrl, additionalData } = body;

  logger.info("[Function] Sending response to callback URL");
  await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ llmResponse, additionalData }),
  });

  logger.info("[Function] Response sent to callback URL");
}
