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
const child_process = require("child_process");
class ProcessResult {
    constructor(retCode, stdout, stderr, error) {
        this.retCode = retCode;
        this.stdout = stdout;
        this.stderr = stderr;
        this.error = error;
    }
    get ReturnCode() {
        return this.retCode;
    }
    get StdOut() {
        return this.stdout;
    }
    get StdErr() {
        return this.stderr;
    }
    get Error() {
        return this.error ? this.error : "";
    }
    StdErrOrErrorMessage() {
        return this.stderr
            ? this.stderr
            : this.error
                ? this.error
                : "";
    }
}
exports.ProcessResult = ProcessResult;
function ExecuteAsync(command, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let cpOptions = undefined;
        if (options) {
            cpOptions = {
                env: options.env,
                shell: options.shell
            };
        }
        return new Promise(resolve => {
            let process = child_process.spawn(command, args ? args : [], cpOptions);
            let stdout = "";
            let stderr = "";
            process.stdout.on('data', data => {
                stdout += data;
            });
            process.stderr.on('data', data => {
                stderr += data;
            });
            process.on('close', retCode => {
                resolve(new ProcessResult(retCode, stdout, stderr));
            });
            process.on('error', err => {
                resolve(new ProcessResult(-1, "", "", err.message));
            });
            if (options && options.timeout) {
                setTimeout(() => process.kill(), options.timeout);
            }
        });
    });
}
exports.ExecuteAsync = ExecuteAsync;
//# sourceMappingURL=processexecutor.js.map