import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CustomError } from "../../domain/custom-error";

export function withErrorHandling<T>(
  handler: (request: HttpRequest, context: InvocationContext) => Promise<T>
): (request: HttpRequest, context: InvocationContext) => Promise<T | HttpResponseInit> {
  return async (request, context) => {
      try {
          context.log(`Http function processed request for url "${request.url}"`);
          return await handler(request, context);
      } catch (error: any) {
          context.log(`Error occurred: ${error instanceof Error ? error.message : String(error)}`);
          return await errorHandler(error);
      }
  };
}

const errorHandler = async (error: Error | CustomError): Promise<HttpResponseInit> => {
  if ((error as any).code) {
    const cError = error as CustomError;
    return {
      jsonBody: { message: cError.message },
      status: cError.code,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  } else {
    return {
      jsonBody: { message: (error as Error).message },
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
}