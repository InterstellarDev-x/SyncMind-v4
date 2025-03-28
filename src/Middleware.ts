import { Request, Response, NextFunction } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET: string = "Second_brain";

interface CustomRequest extends Request {
  userId?: string; // You can define a proper type instead of 'any'
}

function UserMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    const token: string = req.headers?.token as string;

    if (!token) {
      res.status(401).json({ message: "Access Denied! No token provided." });
    }

    const verifytoken: JwtPayload = Jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (verifytoken) {
      req.userId = verifytoken.id;
      next();
    } else {
      res.status(401).json({ message: "Invalid token! Please log in again." });
    }
  } catch (e) {
    console.log(e);
    res.send("server serror");
  }
}

export default UserMiddleware;
