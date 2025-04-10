"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    var _a;
    const authorization = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    if (!authorization) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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
exports.default = verifyToken;
