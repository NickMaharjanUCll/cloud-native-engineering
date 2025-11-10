import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { Auth, Role } from '../types';
import { HttpRequest } from '@azure/functions';

const generateJwtToken = ({ username, role }: { username: string, role: Role }): string => {
    // Default to 1 hour if process.env.JWT_EXPIRES_HOURS is not set
    const expiresInHours = process.env.JWT_EXPIRES_HOURS ? `${process.env.JWT_EXPIRES_HOURS}h` : '1h';
    const options = <SignOptions>{ expiresIn: expiresInHours, issuer: 'veso_app' };

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        return jwt.sign({ username, role }, `${process.env.JWT_SECRET}`, options);
    } catch (error) {
        console.log(error);
        throw new Error("Error generating JWT token, see server log for details.");
    }
};

const extractVerifyDecodeJwtToken = (request: HttpRequest): Auth => {
   // Extract.
    const authHeader: string = request.headers.get('Authorization');
    if (!authHeader) {
        throw new Error('Authorization header is null.');
    }
    const token: string = authHeader.replace('Bearer ', '');

    // Verify and decode.
    let verifiedToken: string | JwtPayload;

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        verifiedToken = jwt.verify(token, `${process.env.JWT_SECRET}`, { issuer: 'veso_app'})
    } catch (error) {
        console.log(error);
        // throw new Error("Error verifying JWT token, see server log for details.");
        throw new Error(error);
    }

    const auth: Auth = {
        username: verifiedToken['username'],
        role: verifiedToken['role']
    };

    return auth;
}

export { generateJwtToken, extractVerifyDecodeJwtToken };
