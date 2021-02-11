"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EnvironmentVariableBuilder {
    constructor() {
        this.Reset();
    }
    WithEnv(key, value) {
        this._envs[key] = value;
        return this;
    }
    RemoveEnv(key) {
        this._envs[key] = "";
        return this;
    }
    Build() {
        return this._envs;
    }
    Reset() {
        this._envs = JSON.parse(JSON.stringify(process.env)); //deep copy of starting environment variables!
        return this;
    }
}
exports.EnvironmentVariableBuilder = EnvironmentVariableBuilder;
//# sourceMappingURL=environmentvariablebuilder.js.map