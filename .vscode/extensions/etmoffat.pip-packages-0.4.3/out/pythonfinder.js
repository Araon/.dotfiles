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
const fileio = require("./fileio");
class PythonFinder {
    constructor(processExecutor) {
        this._executor = processExecutor;
    }
    FindPythonAsync(env, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!env.pythonPath) {
                const checkFunction = (str) => __awaiter(this, void 0, void 0, function* () {
                    let optionsWithTimeout = { timeout: timeout };
                    let pipVersionResult = yield this._executor.ExecuteAsync(str, ["--version"], optionsWithTimeout);
                    return pipVersionResult.ReturnCode === 0;
                });
                env = yield this._findExecutablesForEnv(env, checkFunction);
            }
            else {
                env = yield this._findExecutablesForEnv(env, fileio.FileExistsAsync);
            }
            return env; //todo: immutability for input environment
        });
    }
    _findExecutablesForEnv(env, checkForFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let pipExecutableNames = this._getPipExecutableNames();
            let pythonExecutableNames = this._getPythonExecutableNames();
            for (let pipName of pipExecutableNames) {
                let res = yield checkForFile(env.getRelativeExecutable(pipName));
                if (res) {
                    env.pipExecutableName = pipName;
                    for (let pythonName of pythonExecutableNames) {
                        res = yield checkForFile(env.getRelativeExecutable(pythonName));
                        if (res) {
                            env.pythonExecutableName = pythonName;
                            break;
                        }
                    }
                    break;
                }
            }
            return env;
        });
    }
    _getPipExecutableNames() {
        let isWindows = process.platform === "win32";
        return isWindows
            ? ["pip.exe"]
            : ["pip", "pip2", "pip3"];
    }
    _getPythonExecutableNames() {
        let isWindows = process.platform === "win32";
        return isWindows
            ? ["python.exe", "..\\python.exe"]
            : ["python", "python2", "python3"];
    }
}
exports.PythonFinder = PythonFinder;
//# sourceMappingURL=pythonfinder.js.map