# ChatGPT AutoExpert (Developer Edition)
by Dustin Miller • [Reddit](https://www.reddit.com/u/spdustin) • [Substack](https://spdustin.substack.com)

**License**: [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

_**Want to support these free prompts? [My Substack](https://spdustin.substack.com) offers paid subscriptions, that's the best way to show your appreciation.**_

> [!IMPORTANT]
> This requires a ChatGPT professional subscription, as it needs both GPT-4 _and_ **Advanced Data Analysis**!

> [!NOTE]
> - [See `/memory` in action](https://chat.openai.com/share/0f707aba-3cb4-4b35-9c8e-48a4d351b996)
> - [Check out restoring into a new session!](https://chat.openai.com/share/edee3207-0937-47c5-84de-418912262262)

# Table of Contents
- [Usage](#usage)
  - [Verbosity](#verbosity)
  - [Slash Commands](#slash-commands)
    - [Slash Command Tips:](#slash-command-tips)
- [Usage Notes](#usage-notes)
  - [Preamble Example:](#preamble-example)
  - [Epilogue Example](#epilogue-example)
    - [Emoji key](#emoji-key)
- [Installation (first time)](#installation-first-time)
- [Installation (per-chat)](#installation-per-chat)

# Usage

## Verbosity
You can alter the verbosity of the code written by ChatGPT by prefixing your request with `V=[0–3]`.
- `V=0`: code golf (really terse)
- `V=1`: concise, but not overly clever
- `V=2`: simple (the default)
- `V=3`: verbose, paying even more attention to DRY principles

## Slash Commands
Once `autodev.py` has been uploaded, you'll have some new functionality accessible through the use of **Slash Commands**:

| Slash Command | Description |
|---------------|-------------|
| /help | Shows what slash commands are available |
| /install_ctags | If attaching a `ctags` release from [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build/releases), will extract and install it to the sandbox (*experimental*)|
| /ctags | If `ctags` has been installed, builds a ctags file for your saved code (*experimental*) |
| /memory | Saves files, session history, etc. and zips them up for download |
| /stash | Prepares to stash some text, to be recalled later with /recall |
| /recall | Recalls text, using a key or description that appears after the command, that was previously stored with /stash |

### Slash Command Tips:
Before ending your session, use the `/memory` slash command to zip up all your hard work. The next time you start a session, attach the zip file ***in the same message as `autodev.py`***, and AutoExpert will automatically extract your zip file and restore its memory of the work that was done in the last session.

# Usage Notes

Once the custom instructions have been set (and the `autodev.py` file has been uploaded), you should notice that ChatGPT's responses to your coding requests are a lot smarter. Why?

Every time you ask ChatGPT to code something, it is instructed to create a preamble at the start of its response. This preamble is designed to automatically adjust ChatGPT's "attention mechanisms" to pay more attention to your requirements, the type of code it will need to write, and the plan it should follow when writing it.

## Preamble Example:

> **Me**:<br>
> Show me a sample JavaScript file that has a couple of classes with methods, and a couple of top-level functions. Don't use the sandbox yet.

> **ChatGPT**:<br>
> **Language > Specialist**: JavaScript > Software > Engineer
>
> **Includes**: ES6 syntax, classes, methods, and functions
>
> **Requirements**: V=2, focusing on readability, modularity, and standard JavaScript conventions.
>
> ## Plan
> 1. Create a JavaScript file outline in text form.
> 2. Define two classes with methods.
> 3. Add two top-level functions.

It tries its best not to elide or omit any code, and will also attempt to break down its tasks to occur over several chat turns, asking you to continue when it needs to. It'll even throw in some `// TODO:` comments where it knows it'll be editing something on the next chat turn.

The epilogue section at the end of each response keeps important things in memory no matter how long your chat context gets. Things like:
- The stuff ChatGPT has done so far
- A list of every file it has written
- An outline of any classes and/or functions and methods in those files

## Epilogue Example

> **History**: Provided a sample JavaScript file with two classes (`Calculator` and `AdvancedCalculator`) and their methods, along with two top-level functions (`add` and `subtract`).
>
> **Source Tree**:
> - ⚠️ sample.js
>   - 📦 Calculator
>     - ✅ add
>     - ✅ subtract
>   - 📦 AdvancedCalculator
>     - ✅ multiply
>     - ✅ divide
>   - ✅ add (global function)
>   - ✅ subtract (global function)
>
> **Next Task**: No pending tasks. Would you like to implement this sample in a real JavaScript file?

### Emoji key
|Emoji|Meaning|
|---|---|
|💾|File was saved to the sandbox (the filename is linked for download)|
|⚠️|ChatGPT created a code snippet with a filename, but it hasn't been saved|
|👻|ChatGPT created a file snippet, but it doesn't have a filename|
|📦|Class name (if classes are being used)|
|✅|Symbol (function/method) is finished|
|⭕️|Symbol (function/method) is not finished yet, and has a TODO comment|
|🔴|Symbol (function/method) is not finished yet, but doesn't have a TODO comment|


# Installation (first time)
ChatGPT AutoExpert (Developer Edition) is intended for use in the ChatGPT web interface, and with a Pro subscription. To activate it, you'll need to do a few things!

1. Download the [latest release](https://github.com/spdustin/ChatGPT-AutoExpert/releases/latest)
    - Expand **Assets**, then download the file titled "**Source Code** (zip)"
2. Extract the downloaded .zip file
3. Sign in to [ChatGPT](https://chat.openai.com)
4. Select the profile + ellipsis button in the lower-left of the screen to open the settings menu
5. Select **Custom Instructions**
    > [!WARNING]
    > You should save the contents of your existing custom instructions somewhere, because you're about to overwrite both text boxes!
6. Copy and paste the text from [`developer-edition/chatgpt__about_me.md`](https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/main/developer-edition/chatgpt__about_me.md) to the first text box, replacing whatever was there
7. Copy and paste the text from [`developer-edition/chatgpt__custom_instructions.md`](https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/main/developer-edition/chatgpt__custom_instructions.md) to the second text box, replacing whatever was there
8. Select the **Save** button in the lower right
9. Continue with the per-chat installation steps
# Installation (per-chat)

1. Start a new chat
2. Select **GPT-4** at the top of the new chat
3. Select **Advanced Data Analysis** from the menu
4. Attach `autodev.py` by selecting the **(+)** button to the left of "Send a message" at the bottom of the chat
5. Without entering any other text in the input text box, select the paper airplane icon to send the empty text and upload the `autodev.py` file
6. If all went well, you should see a heading "ChatGPT AutoExpert (Developer Edition)" along with an introduction to the tool
