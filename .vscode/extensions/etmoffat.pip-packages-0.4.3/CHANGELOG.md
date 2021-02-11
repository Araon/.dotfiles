# Change Log

## 0.4.3
- Fix regression where changing a configuration would cause it to reload incorrectly

## 0.4.2
- Output now displayed in real-time
- All long-running operations are now implemented asynchronously

## 0.4.1
- Bind event for onDidChangeConfiguration instead of onDidSaveTextDocument

## 0.4.0
- Add command for reloading configuration to pip-updater
- Add auto-reload of configuration when configuration file is saved

## 0.3.2
- Fix command execution on Windows when no system python is available in the PATH

## 0.3.1
- Fix creation of virtual environment on Windows

## 0.3.0
- Added support for cross-platform (macOS and Win32)
- Fix issues with environment variables being passed to spawned processes
- Code cleanup/refactoring and added tests for commandbuilder

## 0.2.0
- Utilize value specified in the 'timeout' setting when invoking external processes
- Remove internal state that made it difficult to execute the extension multiple times

## 0.1.0
- Added auto-update functionality that executes when vscode launches
- Added missing documentation for pathToEnvs value for environments

## 0.0.3
- Removed repository from package JSON (private repo)

## 0.0.2
- Updated CHANGELOG with non-default text

## 0.0.1
- Initial release