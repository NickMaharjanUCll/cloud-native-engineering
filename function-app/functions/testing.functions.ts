// This is a template function.
// http://localhost:3001/api/test
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Auth } from "../types";
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { withErrorHandling } from "./helpers/function-wrapper";
import { extractVerifyDecodeJwtToken } from "../util/jwt";

// export const login = withErrorHandling(async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
//     context.log(`Http function processed request for url "${request.url}"`);


export const test = withErrorHandling(async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    return { body: `Hello world!` };
});

export const authTest = withErrorHandling(async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const auth: Auth = extractVerifyDecodeJwtToken(request);

    return { jsonBody: { auth }};
});

app.http('test', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'test/',
    handler: test
});


app.http('authTest', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'test/auth',
    handler: authTest
});
