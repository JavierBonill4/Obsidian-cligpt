import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
//import * as open from 'open';
import open from 'open';
import axios from 'axios';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	
	

	async onload() {
		
		await this.loadSettings();
		let gptfilePath: string;
		const homeDir = os.homedir();
		let crntYear: number = new Date().getFullYear();
		let crntMonth: number = new Date().getMonth() + 1;
		
		//const filePath1 = path.join(homeDir, 'Documents/2024/summer_intern/Obsidian-cligpt');
		const filePath1 = path.join(homeDir, `Documents/GPT-Logs/${crntYear}/2024-${crntMonth}`);
		if (!fs.existsSync(filePath1)) {
			// If it doesn't exist, create it
			fs.mkdirSync(filePath1, {recursive: true});
		}
		//const filePath1 = path.join(homeDir, `Documents/2024/summer_intern/Obsidian-cligpt`);
		function generateTimestampedFileName(): string { //generates the filename based on timestamp
			const timestamp = new Date().toISOString();
			return `cligpt-${timestamp}.md`;
		}
		function createAndWriteToFile(directory: string): string {//creates file using generated timestamp, and writes our info into file
			const fileName = generateTimestampedFileName();
			const filePath = path.join(directory, fileName);
			const message = "role: You are an expert Software Developer\nmodel: gpt-4\n## Question:\n---------\n"
		
			try {
				fs.writeFileSync(filePath, message, { flag: 'a' });
				new Notice(`File created and content written: ${fileName}`);
				//vscode.window.showInformationMessage(`File created and content written: ${fileName}`);
			} catch (error) {
				new Notice('Failed to create and write to the file');
				//vscode.window.showErrorMessage('Failed to create and write to the file');
			}
			//return fileName;
			return filePath;
		}
		// async function openFileInVSCode(filePath: string) {
		// 	let fileToOpen = app.vault.getAbstractFileByPath(filePath);
		// 	if(fileToOpen) {
		// 		app.workspace.activeLeaf?.open(fileToOpen);
		// 		let newLeaf = app.workspace.splitActiveLeaf(); 
    	// 		newLeaf.open(fileToOpen);
		// 	// Open the file in a new leaf
		// 		//app.workspace.openLeafInNewWindow(fileToOpen);
		// 	}
		// }

		async function sendToChatGPT(content: string): Promise<string | null> {
			//return content;
			const apiKey = 'REPLACE WITH API KEY';//process.env.OPENAI_API_KEY; 
			let auth: string = 'Bearer ' + apiKey;
			// const api_key = process.env.OPENAI_APIKEY;
			// vscode.window.showInformationMessage(api_key);
			try {
				const response = await axios.post('https://api.openai.com/v1/chat/completions', {
					model: 'gpt-4', // Specify the correct model
					messages: [{"role": "user", "content": content}],
					max_tokens: 1000
				}, 
				{
					headers: {
						'Authorization': auth,
						'Content-Type': 'application/json'
					}
				});
				if (response.data && response.data.choices && response.data.choices.length > 0) {
					//return response.request.choices[0].message.content;
					let final:string = response.data.choices[0].message.content;//.data.choices[0].text;//.data.choices[0].text.trim();
					return final;
				}
				else{
					new Notice('something bad');
				}
			}
			catch (error) {
				if (axios.isAxiosError(error)) {
					new Notice('Error response:', error.response?.data);
					console.error('Error response:', error.response?.data);
				}
				else {
					console.error('Unexpected error:', error);
					new Notice('unexpected error:', error);
				}
				throw error;
			}
			return null;
		}

		//
		this.addRibbonIcon('dog', 'cligpt', () => {
			gptfilePath = createAndWriteToFile(filePath1);
			//openFileInObsidian(gptfilePath);
		});
		this.addCommand({
			id: 'send-to-gpt',
			name: 'send to gpt',
			editorCallback: async () => {
				new Notice('running gpt');
				let activeLeaf = app.workspace.activeLeaf;

				if (activeLeaf) {
					let view = activeLeaf.view
					if (view instanceof MarkdownView) {
						//if(!gptfilePath){
						let activeFile = view.file;
						//new Notice(gptfilePath);
						if (activeFile) {
							// basename gives you the filename (with extension)
							gptfilePath = path.join(filePath1, activeFile.basename) + ".md";
							//console.log(fileName);
							//new Notice(gptfilePath);
						}
						else{
							new Notice("FAIL");
						}
						//
						//}
						let editor = view.editor
						let doc = editor.getDoc()
						let fileContent = doc.getValue() // This is the text content of your current file
						const response = await sendToChatGPT(fileContent);
						if(response){
							fs.writeFileSync(gptfilePath, `\n\n## ChatGPT Response:\n---------\n${response}\n\n## My question:\n---------\n`, { flag: 'a' });
						}
						else{
							new Notice('no response');
						}
					}
					else{
						new Notice('instance of markdown fail');
					}
				}
				else{
					new Notice('app or activeLeaf is deprecated');
				}
			}
		});
		this.addCommand({
			id: 'commit-to-gpt',
			name: 'commit to gpt',
			editorCallback: async () => {
				let activeLeaf = app.workspace.activeLeaf;

				if (activeLeaf) {
					let view = activeLeaf.view
					if (view instanceof MarkdownView) {
						//if(!gptfilePath){
						let activeFile = view.file;
						//new Notice(gptfilePath);
						if (activeFile) {
							// basename gives you the filename (with extension)
							gptfilePath = path.join(filePath1, activeFile.basename) + ".md";
							//console.log(fileName);
							//new Notice(gptfilePath);
						}
						else{
							new Notice("FAIL");
						}
						//
						//}
						let editor = view.editor
						let doc = editor.getDoc()
						const lineCount = editor.lineCount();
						
						let fileContent = doc.getValue() // This is the text content of your current file
						const summary = await sendToChatGPT(fileContent + "give me a 1 sentence summary of this conversation, I want you to make it as short a sentence as possible while still encapsolating the conversation. No more than 25 words but ideally less, and it doesnt have to be a pretty complete sentence as long as I can understand the gist");
						if(summary){
							if(lineCount > 3) {
								// Delete last three lines
								editor.replaceRange("\n## Summary:\n---------\n", {line: lineCount - 4, ch: 0}, {line: lineCount, ch: 0});
							}
							
							fs.writeFileSync(gptfilePath, summary, { flag: 'a' });
						}
						else{
							new Notice('no response');
						}
					}
					else{
						new Notice('instance of markdown fail');
					}
				}
				else{
					new Notice('app or activeLeaf is deprecated');
				}
			}
		})


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
