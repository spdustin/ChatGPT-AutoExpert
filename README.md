# ChatGPT AutoExpert

_Elevating Conversational AI to Expert Level_

## Introduction
ChatGPT AutoExpert is a **_shockingly effective_** set of custom instructions aimed at enhancing the capabilities of GPT-4 and GPT-3.5-Turbo conversational models. These instructions maximize the depth and nuance in responses while minimizing general disclaimers and hand-holding. The ultimate objective is to provide users with accurate, context-rich information and an improved learning experience.

## Getting Started
To get started with ChatGPT AutoExpert, choose which set of custom instructions you want to use:

* [AutoExpert](standard-edition) (for non-coding tasks)
* [AutoExpert (Developer Edition)](developer-edition) (GPT-4 only, with optional support for Advanced Data Analysis)

## Features

### ["Standard Edition"](standard-edition)
- **Perfect for Everyday Use**<br>
    No need to switch these instructions on and off. They'll give you a greatly improved experience with ChatGPT, even if you're writing code. Although, if you _are_ writing code, you should check the [Developer Edition](developer-edition)
- **Automatically Identifies the Best Expert**<br>
    The AutoExpert custom instruction automatically finds the best expert role to answer whatever question you ask, every time. You don't need a bunch of special prompts any more—this works with even the simplest of prompts!
- **Maximized Depth and Nuance**<br>
    Receive high-level, in-depth responses without compromising on the granularity of the information.
- **Minimized Hand-Holding**<br>
    Cut through the noise and get straight to the facts, reducing unnecessary disclaimers.
- **Explicit Reasoning**<br>
    Your AutoExpert doesn't just provide answers; it offers an explanation, detailing the thought process behind each response.
- **Self-Questioning**<br>
    Designed to question its assumptions, and iteratively refine its responses for maximum clarity and accuracy.
- **Resourceful Links**<br>
    Automatically generates inline links for related topics and "you may also like" topics, helpfully linked to Google search results to avoid hallucination (GPT-3.5 still hallucinates here, but not always. GPT-4 is rock-solid).

### ["Developer Edition"](developer-edition)

> [!IMPORTANT]
> This requires a ChatGPT professional subscription, as it needs both GPT-4 _and_ **Advanced Data Analysis**!

- **Verbosity Selection**<br>Easily choose the complexity of the generated code, from compact "code golf" type responses, up to complex, modular code samples
- **Powered by Jupyter**<br>ChatGPT Advanced Data Analysis already runs a Jupyter kernel under the hood. AutoExpert (Developer Edition) comes with a companion Python script that you simply upload to your conversation. It will automatically take advantage of the sandbox Python environment for editing longer code samples, and activate a handful of extra "slash commands" to make your life even easier.
- **Pick Up Where You Left Off**<br>You can start a new chat without worrying about ChatGPT forgetting what you were doing in the previous one. The `/memory` slash command will download all your files, and a history of everything that's been done during your session. Simply upload it (along with the companion script) in a new session, and pick up where you left off.
- **Install Custom Wheels**<br>Yeah, you heard me. Wheels for Python packages can be uploaded and installed automatically.
  - *Note that your ChatGPT sandbox uses Python 3.8, on a VM with `x86_64` architecture (as of this writing)*.
- **Save Your Work**<br>Among other `/slash` commands, AutoExpert (Developer Edition) will save all your code snippets, dehydrate its memory of your requirements and the work it's done—even back up the code cells themselves. Then it zips it up, and you can quickly download your coding conversation history.
- **File and Symbol Tree**<br>By keeping a running history along with a file/symbol tree at the end of each response, ChatGPT will always remember what it just did, and you'll always see what files still need work. It's even smart enough to handle breaking down complex requirements in a way that allows it to write code over multiple turns.

---

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/spdustin/ChatGPT-AutoExpert/">ChatGPT AutoExpert (both standard and "Developer Edition")</a><br/>by <span property="cc:attributionName">Dustin Miller</span> is licensed under <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution-NonCommercial-ShareAlike 4.0 International<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"></a></p>