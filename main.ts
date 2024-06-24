import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { config } from 'config';

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

		const vault_name = this.app.vault.adapter.getName();
		const pathToVault = config.location;

		const filePath1 = path.join(homeDir, `${pathToVault}/${vault_name}`);
		
		if (!fs.existsSync(filePath1)) {// creates path to vault if it doesn't exist
			// If it doesn't exist, create it
			fs.mkdirSync(filePath1, {recursive: true});
		}
		const filePath2 = path.join(filePath1,`${config.gpt_log}/${crntYear}/2024-${crntMonth}` )
		
		if (!fs.existsSync(filePath2)) {// creates folders for year and month
			// If it doesn't exist, create it
			fs.mkdirSync(filePath2, {recursive: true});
		}
		
		function generateTimestampedFileName(): string { //generates the filename based on date and time
			const timestamp = new Date().toISOString();
			return `cligpt-${timestamp}.md`;
		}
		function createAndWriteToFile(directory: string): string {//creates file using generated timestamp, and writes our info into file
			const fileName = generateTimestampedFileName();
			const filePath = path.join(directory, fileName);
			const message = `role: ${config.role}\nmodel: ${config.model}\n## Question:\n---------\n`
		
			try {
				fs.writeFileSync(filePath, message, { flag: 'a' });
			} catch (error) {
				new Notice('Failed to create and write to the file');
			}
			return filePath;
		}

		async function sendToChatGPT(content: string): Promise<string | null> {//sends content to chatGPT using info from config.ts file
			const apiKey: string = config.apiKey;
			const model: string = config.model;

			if(model){
				new Notice(model);
			}
			else{
				new Notice("undefined model");
			}
			let auth: string = 'Bearer ' + apiKey;
			try {
				const response = await axios.post('https://api.openai.com/v1/chat/completions', {
					model: model, // Specify the correct model
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
					let final:string = response.data.choices[0].message.content;
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

		this.addRibbonIcon('dog', 'cligpt', () => {
			gptfilePath = createAndWriteToFile(filePath2);
		});

		this.addCommand({//command for sending current open file to gpt
			id: 'send-to-gpt',
			name: 'send to gpt',
			editorCallback: async () => {
				new Notice('running gpt');
				let activeLeaf = app.workspace.activeLeaf;

				if (activeLeaf) {
					let view = activeLeaf.view
					if (view instanceof MarkdownView) {
						let activeFile = view.file;
						if (activeFile) {
							gptfilePath = path.join(filePath2, activeFile.basename) + ".md";
						}
						else{
							new Notice("FAIL");
						}
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
						let activeFile = view.file;
						if (activeFile) {
							gptfilePath = path.join(filePath2, activeFile.basename) + ".md";
						}
						else{
							new Notice("FAIL");
						}
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