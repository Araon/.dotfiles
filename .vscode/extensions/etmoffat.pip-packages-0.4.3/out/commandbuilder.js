"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandBuilder {
    constructor(env) {
        this._env = env;
    }
    BuildListEnvsCommand() {
        let sourceVirtualEnvWrapper = this._isWindows() ? "" : `source ${this._env.getRelativeExecutable(this._getVirtualEnvWrapperExecutableName())}`;
        let listEnvsCommand = this._isWindows() ? this._env.getRelativeExecutable(this._getlsVirtualEnvExecutableName()) : this._getlsVirtualEnvExecutableName();
        return this._isWindows() ? listEnvsCommand : `${sourceVirtualEnvWrapper} ${this._getShellCommandSeparator()} ${listEnvsCommand}`;
    }
    BuildMakeEnvCommand() {
        let sourceVirtualEnvWrapper = this._isWindows() ? "" : `source ${this._env.getRelativeExecutable(this._getVirtualEnvWrapperExecutableName())}`;
        let makeEnvCommand = this._isWindows() ? this._env.getRelativeExecutable(this._getmkVirtualEnvExecutableName()) : this._getmkVirtualEnvExecutableName();
        return this._isWindows() ? `${makeEnvCommand} ${this._env.envName}` : `${sourceVirtualEnvWrapper} ${this._getShellCommandSeparator()} ${makeEnvCommand} ${this._env.envName}`;
    }
    BuildInstallPackageCommand(pkg) {
        let sourceCommand = this._isWindows() ? "" : `source ${this._env.getRelativeExecutable(this._getVirtualEnvWrapperExecutableName())}`;
        let workonCommand = this._isWindows() ? this._env.getRelativeExecutable(this._getWorkonExecutableName()) : this._getWorkonExecutableName();
        workonCommand = this._env.envName ? `${workonCommand} ${this._env.envName}` : "";
        let deactivateCommand = this._env.envName ? "deactivate" : "";
        //If there is an environment, the pip path needs to just be the exe name, not the fully resolved path
        let pipPath = this._env.envName ? this._env.pipExecutableName : this._env.getRelativeExecutable(this._env.pipExecutableName);
        let versionPart = !pkg.version || pkg.version === "latest" ? "" : `==${pkg.version}`;
        let installCommand = `${pipPath} install ${pkg.packageName}${versionPart}`;
        let commSep = this._getShellCommandSeparator();
        let prefix = this._env.envName && sourceCommand ? `${sourceCommand} ${commSep} ${workonCommand}` : `${workonCommand}`;
        let fullCommand = this._env.envName
            ? `${prefix} ${commSep} ${installCommand} ${commSep} ${deactivateCommand}`
            : installCommand;
        return fullCommand;
    }
    _isWindows() {
        return process.platform === "win32";
    }
    _getlsVirtualEnvExecutableName() {
        return "lsvirtualenv" + (this._isWindows() ? ".bat" : "");
    }
    _getmkVirtualEnvExecutableName() {
        return "mkvirtualenv" + (this._isWindows() ? ".bat" : "");
    }
    _getWorkonExecutableName() {
        return "workon" + (this._isWindows() ? ".bat" : "");
    }
    _getVirtualEnvWrapperExecutableName() {
        return "virtualenvwrapper" + (this._isWindows() ? ".bat" : ".sh");
    }
    _getShellCommandSeparator() {
        return this._isWindows() ? "&" : "&&";
    }
}
exports.CommandBuilder = CommandBuilder;
//# sourceMappingURL=commandbuilder.js.map