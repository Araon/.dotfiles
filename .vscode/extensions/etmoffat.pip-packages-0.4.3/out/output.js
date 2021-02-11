"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class OutputConsole {
    constructor(consoleName) {
        this._console = vscode.window.createOutputChannel(consoleName);
    }
    show() {
        this._console.show();
    }
    append(text) {
        this._console.append(text);
    }
    appendLine(text) {
        this._console.appendLine(text);
    }
    dispose() {
        this._console.dispose();
    }
}
exports.OutputConsole = OutputConsole;
//# sourceMappingURL=output.js.map