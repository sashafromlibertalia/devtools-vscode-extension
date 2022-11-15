import * as vscode from 'vscode';
import fs = require('fs');

const [folder] = [...vscode.workspace.workspaceFolders ?? []];
const folderPath = folder.uri.path;

const data = fs.readFileSync(`${folderPath}/.gitignore`, 'utf8');
const files = data.split('\n').filter((f: string) => f && !f.includes('#'));

export function activate(context: vscode.ExtensionContext) {
	const hideCommand = 'devtools-extension.hideIgnored';
	const hideCommandHandler = () => {
		const config = vscode.workspace.getConfiguration();
		config.update('files.exclude', files.reduce((acc: any, file) => {
			acc[file] = true;
			return acc;
		}, {}), false);

		vscode.window.showWarningMessage(`Hiding ${files.length} files`);
	};

	const showCommand = 'devtools-extension.showIgnored';
	const showCommandHandler = () => {
		const config = vscode.workspace.getConfiguration();
		config.update('files.exclude', files.reduce((acc: any, file) => {
			acc[file] = false;
			return acc;
		}, {}), false);
		vscode.window.showWarningMessage(`Showing ${files.length} files`);
	};

	context.subscriptions.push(vscode.commands.registerCommand(hideCommand, hideCommandHandler));
	context.subscriptions.push(vscode.commands.registerCommand(showCommand, showCommandHandler));
}
