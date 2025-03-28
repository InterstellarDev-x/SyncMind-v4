"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "Second_brain";
function UserMiddleware(req, res, next) {
    var _a;
    try {
        const token = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.token;
        if (!token) {
            res.status(401).json({ message: "Access Denied! No token provided." });
        }
        const verifytoken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (verifytoken) {
            req.userId = verifytoken.id;
            next();
        }
        else {
            res.status(401).json({ message: "Invalid token! Please log in again." });
        }
    }
    catch (e) {
        console.log(e);
        res.send("server serror");
    }
}
exports.default = UserMiddleware;
