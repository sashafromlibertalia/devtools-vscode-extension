import * as vscode from 'vscode';
import fs = require('fs');

export async function activate(context: vscode.ExtensionContext) {
	const gitignores = await vscode.workspace.findFiles('**/.gitignore');
	if (!gitignores.length) {
		vscode.window.showInformationMessage('No files to ignore');
		return;
	}

	const files = new Set();

	const gitignorePaths = await Promise.all(gitignores.map(async (file) => {
		return (await vscode.workspace.openTextDocument(file.path)).fileName;
	}));

	gitignorePaths.forEach((path) => {
		const data = fs.readFileSync(path, 'utf8');
		const filesToIgnore = data.split('\n').filter((f: string) => f && !f.includes('#'));
		filesToIgnore.forEach(item => files.add(item));
	});

	const hideCommand = 'devtools-extension.hideIgnored';
	const hideCommandHandler = () => {
		const config = vscode.workspace.getConfiguration();
		config.update('files.exclude', [...files].reduce((acc: any, file) => {
			acc[file as string] = true;
			return acc;
		}, {}), false);

		vscode.window.showWarningMessage(`Hiding ${[...files].length} files`);
	};

	const showCommand = 'devtools-extension.showIgnored';
	const showCommandHandler = () => {
		const config = vscode.workspace.getConfiguration();
		config.update('files.exclude', [...files].reduce((acc: any, file) => {
			acc[file as string] = false;
			return acc;
		}, {}), false);

		vscode.window.showWarningMessage(`Showing ${[...files].length} files`);
	};

	context.subscriptions.push(vscode.commands.registerCommand(hideCommand, hideCommandHandler));
	context.subscriptions.push(vscode.commands.registerCommand(showCommand, showCommandHandler));
}
