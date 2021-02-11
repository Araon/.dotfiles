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
const path = require("path");
const configuration_1 = require("./configuration");
const commandbuilder_1 = require("./commandbuilder");
const environmentvariablebuilder_1 = require("./environmentvariablebuilder");
const procex = require("./processexecutor");
const fileio = require("./fileio");
class PipUpdateEngine {
    constructor(output, config) {
        this._output = output;
        this._configuration = config;
    }
    CheckForValidPip() {
        return __awaiter(this, void 0, void 0, function* () {
            this._output.appendLine("Checking for valid pip....");
            if (this._configuration.Environments.length === 0) {
                let env = new configuration_1.PythonEnvironment("", "", "");
                this._configuration.Environments.push(env);
            }
            let pipExecutableNames = this._getPipExecutableNames();
            let pythonExecutableNames = this._getPythonExecutableNames();
            //todo: clean up detection of pip/python executable names
            for (let i = this._configuration.Environments.length - 1; i >= 0; --i) {
                let env = this._configuration.Environments[i];
                if (!env.pythonPath) {
                    let optionsWithTimeout = { timeout: this._configuration.Timeout };
                    for (let pipName of pipExecutableNames) {
                        let pipVersionResult = yield procex.ExecuteAsync(pipName, ["--version"], optionsWithTimeout);
                        if (pipVersionResult.ReturnCode === 0) {
                            env.pipExecutableName = pipName;
                            for (let pythonName of pythonExecutableNames) {
                                let pythonVersionResult = yield procex.ExecuteAsync(pythonName, ["--version"], optionsWithTimeout);
                                if (pythonVersionResult.ReturnCode === 0) {
                                    env.pythonExecutableName = pythonName;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                else {
                    for (let pipName of pipExecutableNames) {
                        let res = yield fileio.FileExistsAsync(env.getRelativeExecutable(pipName));
                        if (res) {
                            env.pipExecutableName = pipName;
                            for (let pythonName of pythonExecutableNames) {
                                res = yield fileio.FileExistsAsync(env.getRelativeExecutable(pythonName));
                                if (res) {
                                    env.pythonExecutableName = pythonName;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                if (!env.pipExecutableName || !env.pythonExecutableName) {
                    this._output.appendLine(`  WARNING Python not found for [${env}]; this environment will be ignored`);
                    this._configuration.Environments.splice(i, 1);
                }
            }
            this._output.appendLine("Done checking for valid pip");
            return true;
        });
    }
    SetUpEnvironments() {
        return __awaiter(this, void 0, void 0, function* () {
            this._output.appendLine("Setting up specified environments....");
            if (this._configuration.Environments.length === 0) {
                this._output.appendLine("  ERROR no valid environments exist! Update aborted.");
                return false;
            }
            var pipLists = {};
            for (let env of this._configuration.Environments) {
                if (!env.envName) {
                    continue;
                }
                let pipListKey = env.pythonPath;
                let pipPath = env.getRelativeExecutable(env.pipExecutableName);
                if (!pipLists[pipListKey]) {
                    let optionsWithTimeout = { timeout: this._configuration.Timeout };
                    let pipListResult = yield procex.ExecuteAsync(pipPath, ["list"], optionsWithTimeout);
                    if (pipListResult.ReturnCode !== 0) {
                        this._output.appendLine(`  ERROR running pip list for env ${env}`);
                        this._output.appendLine(pipListResult.StdErrOrErrorMessage());
                        continue;
                    }
                    pipLists[pipListKey] = pipListResult.StdOut.toString();
                }
                let requiredVirtualEnvWrapper = process.platform === "win32" ? "virtualenvwrapper-win" : "virtualenvwrapper";
                if (pipLists[pipListKey].toLowerCase().indexOf("virtualenv") === -1 ||
                    pipLists[pipListKey].toLowerCase().indexOf(requiredVirtualEnvWrapper) === -1) {
                    this._output.appendLine(`  Installing virtualenv into python at ${env.pythonPath ? env.pythonPath : "SYSTEM PYTHON"}`);
                    let optionsWithTimeout = { timeout: this._configuration.Timeout };
                    let pipInstallVirtualEnvResult = yield procex.ExecuteAsync(pipPath, ["install", requiredVirtualEnvWrapper], optionsWithTimeout);
                    if (pipInstallVirtualEnvResult.ReturnCode !== 0) {
                        this._output.appendLine(`  ERROR installing virtualenv for python ${env.pythonPath ? env.pythonPath : "SYSTEM PYTHON"}`);
                        if (process.platform === "darwin") {
                            this._output.appendLine(`\n  *** On macOS, you may have problems using the default system python. This can be fixed by installing virtualenvwrapper yourself or installing an alternate python into the $PATH. ***\n`);
                        }
                        this._output.appendLine(pipInstallVirtualEnvResult.StdErrOrErrorMessage());
                        continue;
                    }
                }
                let workonHome = env.getWorkonHome();
                let res = yield fileio.FileExistsAsync(workonHome);
                if (!res) {
                    try {
                        yield fileio.MakeDirAsync(workonHome);
                    }
                    catch (err) {
                        this._output.appendLine("  ERROR Unable to create virtual environments folder!");
                        this._output.appendLine(err);
                        return false;
                    }
                }
                let virtualEnvPython = env.getRelativeExecutable(env.pythonExecutableName);
                let envBuilder = new environmentvariablebuilder_1.EnvironmentVariableBuilder()
                    .WithEnv("WORKON_HOME", workonHome)
                    .WithEnv("VIRTUALENV_PYTHON", virtualEnvPython);
                if (process.platform === "win32" && env.pythonPath) {
                    //required: add %PYTHONLOC%\Scripts to %PATH% for virtualenvwrapper-win to work
                    envBuilder = envBuilder.WithEnv("Path", `${env.pythonPath};${path.join(env.pythonPath, "Scripts")};${process.env.PATH}`);
                }
                let processOptions = { env: envBuilder.Build(), timeout: this._configuration.Timeout, shell: this._getShell() };
                let listEnvsCommand = new commandbuilder_1.CommandBuilder(env).BuildListEnvsCommand();
                let virtualEnvResult = yield procex.ExecuteAsync(listEnvsCommand, undefined, processOptions);
                if (virtualEnvResult.ReturnCode !== 0) {
                    this._output.appendLine(`  ERROR executing lsvirtualenv for python ${env.pythonPath ? env.pythonPath : "SYSTEM PYTHON"}`);
                    this._output.appendLine(virtualEnvResult.StdErrOrErrorMessage());
                    continue;
                }
                if (virtualEnvResult.StdErr.length > 0) {
                    this._output.appendLine("  WARNING stderr was not empty:");
                    this._output.appendLine(virtualEnvResult.StdErr.toString());
                }
                let virtualEnvList = virtualEnvResult.StdOut.toString();
                if (virtualEnvList.indexOf(env.envName) === -1) {
                    this._output.append(`  Virtual environment ${env.envName} not found in ${workonHome}. Creating...`);
                    let makeEnvCommand = new commandbuilder_1.CommandBuilder(env).BuildMakeEnvCommand();
                    let createEnvResult = yield procex.ExecuteAsync(makeEnvCommand, undefined, processOptions);
                    if (createEnvResult.ReturnCode !== 0) {
                        this._output.appendLine("FAILED");
                        this._output.appendLine(`  ERROR Failed to create the virtual environment!`);
                        this._output.appendLine(createEnvResult.StdErrOrErrorMessage());
                        return false;
                    }
                    this._output.appendLine("done");
                }
            }
            this._output.appendLine("Environments successfully set up");
            return true;
        });
    }
    CheckForUpdates() {
        return __awaiter(this, void 0, void 0, function* () {
            this._output.appendLine("Checking for updates....");
            if (this._configuration.Environments.length === 0) {
                this._output.appendLine("  ERROR no valid environments have been configured. Unable to check for updates.");
                return false;
            }
            let anyFailed = false;
            for (let env of this._configuration.Environments) {
                this._output.appendLine(`  UPDATING ${env.envName ? env.envName : "Main Environment"} (${env.pythonPath ? env.pythonPath : "SYSTEM PYTHON"})...`);
                for (let pkg of this._configuration.PackagesAndVersions) {
                    this._output.append(`    package ${pkg}...`);
                    let workonHome = env.getWorkonHome();
                    let virtualEnvPython = env.getRelativeExecutable(env.pythonExecutableName);
                    let envBuilder = new environmentvariablebuilder_1.EnvironmentVariableBuilder()
                        .WithEnv("WORKON_HOME", workonHome)
                        .WithEnv("VIRTUALENV_PYTHON", virtualEnvPython);
                    if (process.platform === "win32" && env.pythonPath) {
                        //required: add %PYTHONLOC%\Scripts to %PATH% for virtualenvwrapper-win to work
                        envBuilder = envBuilder.WithEnv("Path", `${env.pythonPath};${path.join(env.pythonPath, "Scripts")};${process.env.PATH}`);
                    }
                    let processOptions = { env: envBuilder.Build(), timeout: this._configuration.Timeout, shell: this._getShell() };
                    let fullCommand = new commandbuilder_1.CommandBuilder(env).BuildInstallPackageCommand(pkg);
                    let updatePackageResult = yield procex.ExecuteAsync(fullCommand, undefined, processOptions);
                    if (updatePackageResult.ReturnCode !== 0 || updatePackageResult.StdErr.toString()) {
                        this._output.appendLine("FAILED");
                        this._output.appendLine(`    ${updatePackageResult.StdErrOrErrorMessage()}`);
                        anyFailed = true;
                        continue;
                    }
                    this._output.appendLine("done");
                }
            }
            if (anyFailed) {
                this._output.appendLine("  WARNING: Some packages did not update correctly");
            }
            return true;
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
    _getShell() {
        return process.platform === "win32" ? "cmd.exe" : "/bin/sh";
    }
}
exports.PipUpdateEngine = PipUpdateEngine;
//# sourceMappingURL=engine.js.map