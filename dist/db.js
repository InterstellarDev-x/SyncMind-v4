"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedlinkModel = exports.TagModel = exports.ContenModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = mongoose_1.default.Schema;
const ContentType = ['image', 'youtube', 'article', 'audio', 'twitter'];
const Users = new schema({
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true }
});
const Content = new schema({
    tittle: { type: String, require: true },
    type: { type: String, enum: ContentType, require: true },
    link: { type: String, require: true, unique: true },
    tag: [{ type: mongoose_1.default.Types.ObjectId, ref: "tag" }],
    user_id: { type: mongoose_1.default.Types.ObjectId, require: true, ref: "users" }
});
const Tags = new schema({
    tag: { type: String, require: true }
});
const Sharedlink = new schema({
    hash: { type: String, require: true },
    userId: { type: mongoose_1.default.Types.ObjectId, require: true, ref: "users", unique: true }
});
exports.UserModel = mongoose_1.default.model("users", Users);
exports.ContenModel = mongoose_1.default.model("content", Content);
exports.TagModel = mongoose_1.default.model("tag", Tags);
exports.SharedlinkModel = mongoose_1.default.model("sharedlink", Sharedlink);
