'use strict';
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
const engine_1 = require("./engine");
const output_1 = require("./output");
const configuration_1 = require("./configuration");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Activated pip-updater extension');
        //create output console
        let outputConsole = new output_1.OutputConsole("Pip package updater");
        outputConsole.show();
        let configuration = yield configuration_1.ConfigurationLoader.LoadConfiguration(outputConsole);
        if (!configuration) {
            console.log('Failed to load configuration! pip-updater will not be available as a command.');
            return;
        }
        //create engine and invoke auto-update
        let updateEngine = new engine_1.PipUpdateEngine(outputConsole, configuration);
        if (configuration.AutoUpdate) {
            yield RunUpdate(updateEngine, outputConsole);
        }
        let updateAndInstallRegistration = vscode.commands.registerCommand("pip-updater.updateAndInstall", () => __awaiter(this, void 0, void 0, function* () {
            yield RunUpdate(updateEngine, outputConsole);
        }));
        //register configuration reload command and auto-reload
        let reloadConfigurationFunction = () => __awaiter(this, void 0, void 0, function* () {
            configuration = yield configuration_1.ConfigurationLoader.LoadConfiguration(outputConsole);
            if (!configuration) {
                console.log('Failed to load configuration!');
                return;
            }
            updateEngine = new engine_1.PipUpdateEngine(outputConsole, configuration);
        });
        vscode.workspace.onDidChangeConfiguration((event) => __awaiter(this, void 0, void 0, function* () {
            if (event.affectsConfiguration("pip-updater")) {
                yield reloadConfigurationFunction();
            }
        }));
        let reloadConfigRegistration = vscode.commands.registerCommand("pip-updater.reloadConfig", reloadConfigurationFunction);
        //push disposables so they get disposed
        context.subscriptions.push(outputConsole);
        context.subscriptions.push(updateAndInstallRegistration);
        context.subscriptions.push(reloadConfigRegistration);
    });
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
function RunUpdate(updateEngine, outputConsole) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield updateEngine.CheckForValidPip()) ||
            !(yield updateEngine.SetUpEnvironments()) ||
            !(yield updateEngine.CheckForUpdates())) {
            outputConsole.appendLine("***UPDATE FAILED TO COMPLETE***");
        }
        else {
            outputConsole.appendLine("***UPDATE COMPLETED***");
        }
    });
}
//# sourceMappingURL=pip-updater.js.map