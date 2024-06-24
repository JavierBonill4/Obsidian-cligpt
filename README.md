# cligpt README
This is an extension to use openAI's chatGPT through Obsidian. This extension will create a file in your current obsidian vault for when you want to ask chatgpt a question, each file logs a conversation and is stored in recommend a log folder organized in files by year and month. The fileName is based on the date and time. This extension currently supports 3 commands:
- The dog icon that shows up in the left bar: will create the file and give a space to write a question. Only needs to be called once per conversation
- send to gpt: Sends the complete file to chatGPT and will print out chatGPT's response. Once one queston is asked a space will be provided to add another question and this command should be run everytime you finish typing a question.
- commit to gpt: Ends the conversation with a short one sentence summary of the entire conversation.

I would recommend adding shortcuts to the last 2 commands.
## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

- Run `npm install` to install dependencies. Only use axios 1.7.2, and open 10.1.0
- Create a config.ts file in the obsidian-sample-plugin folder and add:
```
export const config = {
    apiKey: 'REPLACE WITH YOUR OPENAI APIKEY',
    model: 'WHAT MODE OF GPT YOU WANT TO USE',
    location: 'WHERE YOU WANT TO STORE FILES',
    gpt_log: 'FOLDER NAME FOR WHERE TO STORE LOGS ',
    role: 'ROLE YOU WANT TO GIVE TO CHATGPT'
};
```
here is an example of what it could look like with a fake API key:
```
export const config = {
    apiKey: 'sk-GDNhsveD83b5lsbFh4ns85ns84nwl2lDHY$bwsur4Dfksb&DBhes',
    model: 'gpt-4',
    location: 'Documents/2024/summer_intern',
    gpt_log: 'GPT-Logs',
    role: 'You are an expert Software Developer'
};
```

## Known Issues

Once you run cligptPush, it will take some time for chatGPT to give its response, ~5-15 seconds.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
