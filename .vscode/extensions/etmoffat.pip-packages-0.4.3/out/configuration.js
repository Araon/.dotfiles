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
const vscode = require("vscode");
const path = require("path");
var ConfigurationLoadResult;
(function (ConfigurationLoadResult) {
    ConfigurationLoadResult[ConfigurationLoadResult["Success"] = 0] = "Success";
    ConfigurationLoadResult[ConfigurationLoadResult["PackageNameMissing"] = 1] = "PackageNameMissing";
})(ConfigurationLoadResult = exports.ConfigurationLoadResult || (exports.ConfigurationLoadResult = {}));
class PipUpdaterConfiguration {
    constructor() {
        this._autoUpdate = false;
        this._packagesAndVersions = [];
        this._timeout = 60000;
        this._environments = [];
    }
    get AutoUpdate() {
        return this._autoUpdate;
    }
    get PackagesAndVersions() {
        return this._packagesAndVersions;
    }
    get Timeout() {
        return this._timeout;
    }
    get Environments() {
        return this._environments;
    }
    LoadConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            let configuration = vscode.workspace.getConfiguration('pip-updater');
            let checkAutoUpdateTask = () => __awaiter(this, void 0, void 0, function* () {
                if (configuration.has('AutoUpdate')) {
                    let autoUpdate = configuration.get('AutoUpdate');
                    if (autoUpdate) {
                        this._autoUpdate = autoUpdate;
                    }
                }
            });
            let checkPackagesAndVersionsTask = () => __awaiter(this, void 0, void 0, function* () {
                if (configuration.has('PackagesAndVersions')) {
                    let packagesAndVersions = configuration.get('PackagesAndVersions');
                    if (packagesAndVersions) {
                        for (let pair of packagesAndVersions) {
                            let packageName = Object.getOwnPropertyDescriptor(pair, 'packageName');
                            let version = Object.getOwnPropertyDescriptor(pair, 'version');
                            if (!packageName || !packageName.value) {
                                return ConfigurationLoadResult.PackageNameMissing;
                            }
                            let safePackageName = packageName.value;
                            let safeVersion = "";
                            if (version && version.value.length > 0) {
                                safeVersion = version.value;
                            }
                            let packageVersionPair = new PackageVersionPair(safePackageName, safeVersion);
                            this._packagesAndVersions.push(packageVersionPair);
                        }
                    }
                }
                return ConfigurationLoadResult.Success;
            });
            let checkTimeoutTask = () => __awaiter(this, void 0, void 0, function* () {
                if (configuration.has('Timeout')) {
                    let timeout = configuration.get('Timeout');
                    if (timeout) {
                        this._timeout = timeout;
                    }
                }
            });
            let checkVirtualEnvTask = () => __awaiter(this, void 0, void 0, function* () {
                if (configuration.has('VirtualEnv')) {
                    let virtualEnv = configuration.get('VirtualEnv');
                    if (virtualEnv) {
                        for (let env of virtualEnv) {
                            let pythonPath = Object.getOwnPropertyDescriptor(env, 'pathToPython');
                            let envName = Object.getOwnPropertyDescriptor(env, 'virtualEnv');
                            let pathToEnvs = Object.getOwnPropertyDescriptor(env, 'pathToEnvs');
                            let safePythonPath = pythonPath ? pythonPath.value : "";
                            let safeEnvName = envName ? envName.value : "";
                            let safePathToEnvs = pathToEnvs ? pathToEnvs.value : "";
                            let environment = new PythonEnvironment(safePythonPath, safeEnvName, safePathToEnvs);
                            this._environments.push(environment);
                        }
                    }
                }
            });
            //execute in parallel and return the only result that can fail
            let results = yield Promise.all([checkAutoUpdateTask(), checkPackagesAndVersionsTask(), checkTimeoutTask(), checkVirtualEnvTask()]);
            return results[1];
        });
    }
}
exports.PipUpdaterConfiguration = PipUpdaterConfiguration;
class PythonEnvironment {
    constructor(pythonPath, envName, pathToEnvs) {
        if (pythonPath === null) {
            throw new Error("Python path may not be null");
        }
        if (envName === null) {
            throw new Error("Environment name may not be null");
        }
        if (pathToEnvs === null) {
            throw new Error("Path to environments may not be null");
        }
        this._pythonPath = pythonPath;
        this._envName = envName;
        this._pathToEnvs = pathToEnvs;
        this._pipExecutableName = "";
        this._pythonExecutableName = "";
    }
    get pythonPath() {
        return this._pythonPath;
    }
    get envName() {
        return this._envName;
    }
    get pathToEnvs() {
        return this._pathToEnvs;
    }
    get pipExecutableName() {
        return this._pipExecutableName;
    }
    set pipExecutableName(value) {
        this._pipExecutableName = value;
    }
    get pythonExecutableName() {
        return this._pythonExecutableName;
    }
    set pythonExecutableName(value) {
        this._pythonExecutableName = value;
    }
    getRelativeExecutable(executable) {
        return this.pythonPath
            ? (process.platform === "win32" ? path.join(this.pythonPath, "Scripts", executable) : path.join(this.pythonPath, executable))
            : executable;
    }
    getWorkonHome() {
        return this.pathToEnvs
            ? this.pathToEnvs
            : (process.env["WORKON_HOME"]
                ? process.env["WORKON_HOME"] //use existing value of $WORKON_HOME if it exists
                : (process.platform === "win32"
                    ? path.join(process.env.USERPROFILE, "Envs") //use %USERPROFILE%\envs on windows
                    : path.join(process.env.HOME, ".virtualenvs"))); //use ~/.virtualenvs on other platforms
    }
    toString() {
        let pythonPath = !this._pythonPath ? "[none]" : this._pythonPath;
        let envName = !this._envName ? "[none]" : this._envName;
        let pathToEnvs = !this._pathToEnvs ? "[none]" : this._pathToEnvs;
        return `PythonPath: ${pythonPath} | EnvName: ${envName} | PathToEnvs: ${pathToEnvs}`;
    }
}
exports.PythonEnvironment = PythonEnvironment;
class PackageVersionPair {
    constructor(packageName, version) {
        if (packageName === null) {
            throw new Error("Package name may not be null");
        }
        if (version === null) {
            throw new Error("Version may not be null");
        }
        this._packageName = packageName;
        this._version = version;
    }
    get packageName() {
        return this._packageName;
    }
    get version() {
        return this._version;
    }
    toString() {
        let packageName = !this._packageName ? "[none]" : this._packageName;
        let version = !this._version ? "latest" : this._version;
        return `${packageName}==${version}`;
    }
}
exports.PackageVersionPair = PackageVersionPair;
class ConfigurationLoader {
    static LoadConfiguration(output) {
        return __awaiter(this, void 0, void 0, function* () {
            output.appendLine("Loading configuration....");
            let configuration = new PipUpdaterConfiguration();
            let loadResult = yield configuration.LoadConfiguration();
            if (loadResult !== ConfigurationLoadResult.Success) {
                output.appendLine(`  ERROR Failed to load configuration: ${ConfigurationLoadResult[loadResult]}`);
                return undefined;
            }
            for (let pkg of configuration.PackagesAndVersions) {
                output.appendLine(`  Found package ${pkg}`);
            }
            for (let env of configuration.Environments) {
                output.appendLine(`  Found environment ${env}`);
            }
            output.appendLine("Done loading configuration");
            return configuration;
        });
    }
}
exports.ConfigurationLoader = ConfigurationLoader;
//# sourceMappingURL=configuration.js.map