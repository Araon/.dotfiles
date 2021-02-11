"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function FileExistsAsync(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            fs.stat(fileName, (err, stats) => {
                if (err || !stats) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    });
}
exports.FileExistsAsync = FileExistsAsync;
function MakeDirAsync(dirName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.mkdir(dirName, err => {
                if (!err) {
                    resolve();
                }
                else {
                    reject(err);
                }
            });
        });
    });
}
exports.MakeDirAsync = MakeDirAsync;
//# sourceMappingURL=fileio.js.map