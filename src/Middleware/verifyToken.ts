import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    email?: string; 
}

const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authorization = req.headers?.authorization;

    if (!authorization) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }

    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send({ message: 'Token expired' });
            }
            return res.status(403).send({ message: 'Forbidden access' });
        }

        req.email = decoded.data;
        next();
    });
};
export default verifyToken;
