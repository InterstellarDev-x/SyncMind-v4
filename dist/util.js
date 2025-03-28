"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomHash = RandomHash;
function RandomHash(len) {
    let options = "dsfjhdsfjgadksfjhkdsgf47tr78387y347858394nvy83";
    let length = options.length;
    let ans = "";
    for (let i = 0; i < len; i++) {
        ans += options[Math.floor(Math.random() * length)];
    }
    return ans;
}
