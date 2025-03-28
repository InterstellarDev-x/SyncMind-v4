"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserRoute = (0, express_1.Router)();
const zod_1 = require("zod");
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Middleware_1 = __importDefault(require("./Middleware"));
const util_1 = require("./util");
const JWT_SECRET = "Second_brain";
const RegisteringSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, { message: "Must be atleast 6 charchacter" }),
}); //  schema for registering and singing the user
const ContentSchema = zod_1.z.object({
    tittle: zod_1.z.string({ message: "please provide the tittle of the content" }),
    link: zod_1.z.string({ message: "Please provide the link of content" }),
    type: zod_1.z.string({ message: "Please provide the type of content" }),
    tag: zod_1.z.string({ message: "provide the tag" }),
});
UserRoute.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const succesRegisterSchema = RegisteringSchema.safeParse(req.body);
    if (!succesRegisterSchema.success) {
        return res.json({
            error: succesRegisterSchema.error.format(),
        });
    }
    const { email, password } = req.body;
    try {
        const hashpassword = yield bcrypt_1.default.hash(password, 5, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield db_1.UserModel.create({
                email: email,
                password: hash,
            });
            return res.status(200).json({
                msg: "User successfully registered",
            });
        }));
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            msg: "Server error ",
        });
    }
}));
UserRoute.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const succesRegisterSchema = RegisteringSchema.safeParse(req.body);
    if (!succesRegisterSchema.success) {
        return res.json({
            error: succesRegisterSchema.error.format(),
        });
    }
    const { email, password } = req.body;
    try {
        const user = yield db_1.UserModel.findOne({
            email: email,
        });
        if (!user) {
            return res.status(404).json({
                msg: "User is not found ",
            });
        }
        const passwordSucces = yield bcrypt_1.default.compareSync(password, (user === null || user === void 0 ? void 0 : user.password) || "");
        if (!passwordSucces) {
            return res.status(403).json({
                msg: "Invalid Credientials",
            });
        }
        else {
            const token = jsonwebtoken_1.default.sign({ id: user === null || user === void 0 ? void 0 : user._id }, JWT_SECRET, {
                algorithm: "HS256",
            });
            return res.status(200).json({
                msg: "you are signed in ",
                token: token,
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            msg: "Intenal server eroor ",
        });
    }
}));
UserRoute.post("/content", Middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const succesContentSchema = ContentSchema.safeParse(req.body);
    if (!succesContentSchema.success) {
        return res.json({
            error: succesContentSchema.error.format(),
        });
    }
    const { tittle, type, tag, link } = req.body;
    const user_id = req.userId;
    try {
        const Findtag = yield db_1.TagModel.findOne({
            tag: tag,
        });
        console.log(Findtag);
        if (Findtag) {
            console.log("hello im here");
            const tagId = Findtag.id;
            const Content = yield db_1.ContenModel.create({
                tittle: tittle,
                type: type,
                tag: [tagId],
                link: link,
                user_id: user_id,
            });
        }
        else {
            const Tag = yield db_1.TagModel.create({
                tag: tag,
            });
            const Content = yield db_1.ContenModel.create({
                tittle: tittle,
                type: type,
                tag: [Tag._id],
                link: link,
                user_id: user_id,
            });
        }
        return res.status(200).send(" succesfully posted content ");
    }
    catch (e) {
        console.log(e);
        return res.status(500).send("Internal server error");
    }
}));
UserRoute.get("/content", Middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.userId;
    const Course = yield db_1.ContenModel.find({
        user_id: user_id,
    }).populate("tag");
    return res.status(200).send(Course);
}));
UserRoute.delete("/content/:id", Middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hello iam reached here");
    const user_id = req.userId;
    const _id = req.params.id;
    try {
        yield db_1.ContenModel.findOneAndDelete({
            _id: _id,
            user_id: user_id,
        });
        return res.status(200).json({
            msg: "Content Deleted Succesfully ",
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            msg: "Internal Server Error",
        });
    }
}));
UserRoute.post("/brain/share", Middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    const user_id = req.userId;
    let shareHash = "";
    try {
        if (share) {
            const ExistingLink = yield db_1.SharedlinkModel.findOne({
                userId: user_id,
            });
            if (ExistingLink) {
                return res.status(200).json({
                    message: "Shared link updated ",
                    link: "http://localhost:3000/api/v1/brain/" + ExistingLink.hash,
                });
                return;
            }
            shareHash = (0, util_1.RandomHash)(10);
            const share = yield db_1.SharedlinkModel.create({
                hash: shareHash,
                userId: user_id,
            });
        }
        else {
            yield db_1.SharedlinkModel.findOneAndDelete({
                userId: user_id,
            });
            return res.status(200).json({
                message: "Link Revoked Successfully ",
            });
            return;
        }
        return res.status(200).json({
            message: "Shared link updated ",
            link: "http://localhost:3000/api/v1/brain/" + shareHash,
        });
        return;
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Internal Server Error",
        });
        return;
    }
}));
UserRoute.get("/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    try {
        const Verifyhash = yield db_1.SharedlinkModel.findOne({
            hash: hash,
        });
        if (Verifyhash) {
            const user_id = Verifyhash.userId;
            const Allcontents = yield db_1.ContenModel.find({
                user_id: user_id,
            })
                .populate("tag")
                .populate("user_id", "email");
            return res.status(200).json({ Allcontents });
        }
        else {
            return res.status(403).json({
                message: "Link is expired ",
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}));
exports.default = UserRoute;
