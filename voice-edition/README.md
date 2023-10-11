> [!IMPORTANT]
> This is a work in progress, and currently only tested on mobile app voice conversations with GPT-4

# ChatGPT AutoExpert (Voice Edition) v5.1 Beta
by Dustin Miller • [Reddit](https://www.reddit.com/u/spdustin) • [Substack](https://spdustin.substack.com)

**License**: [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

_**Want to support these free prompts? [My Substack](https://spdustin.substack.com) offers paid subscriptions, that's the best way to show your appreciation.**_

***

**Check it out in action:**
- [Transcript of a quick trial run](https://chat.openai.com/share/0c3d8f4e-1b62-4713-a645-f087c88d9602)

First thing's first: even if you're in a voice conversation, the attention mechanisms used by the underlying GPT model are still in play. Your speech is transcribed to text automatically, and the assistant's response is translated back to speech. The model itself doesn't know anything about speech—it's still text going in and out of it.

Everything you've learned about prompting and attention still applies. The difference is in how you instruct the model to behave during a voice convesation, either with a SYSTEM prompt or custom instructions, like these. The model's instructions should reflect that **voice** is the human-computer interface rather than text.

Designing speech prompts for GPT models is a balancing act between getting conversational outputs from the assistant, and allowing the voice user to interact with the assistant naturally. For example: I chose "Hey Otto" for special commands because it's similar to the "activation phrase" many folks are used to using with Siri, Alexa, and Google. It's addressing the assistant "out of band" from the AutoExpert conversation itself.

***

# Table of Contents
- [Usage Notes](#usage-notes)
  - [Slash Commands](#slash-commands)
  - [Verbosity](#verbosity)
  - [Automatically Select an Expert](#the-autoexpert-secret-sauce)
  - [Write Nuanced Answers with Inline Links to More Info](#write-nuanced-answers-with-inline-links-to-more-info)
  - [Multi-turn Responses for More Depth and Detail](#multi-turn-responses-for-more-depth-and-detail) (_**GPT-4 only**_)
  - [Provide Direction for Additional Research](#provide-direction-for-additional-research)
- [Installation (one-time)](#installation-one-time)

# Usage Notes

These instructions are meant for use in the ChatGPT mobile apps in "voice conversation" mode.

## "Hey Otto" commands
✳️ **New to v5.1**: "Hey Otto" commands offer an easy way to interact with the AutoExpert system during a voice conversation.

Just say "Hey Otto," followed by one of the commands shown. Why **Hey Otto**? It's faster than _**Hey AutoExpert**_!

| Command                       | Description                                                                                                                                          |
|:------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `What can I say?`             | gets help with "Hey Otto" commands                                                                                                                   |
| `Are you sure?`               | asks the assistant to critically evaluate its answer, correcting mistakes or missing information and offering improvements                           |
| `Recap`                       | summarizes the questions and important takeaways from this conversation                                                                              |
| `What else should I know?`    | suggests additional follow-up questions that you could ask                                                                                           |
| `Tell me more!`               | drills deeper into the topic; it will select the aspect to drill down into, or you can provide a related topic by saying "Tell me more about _topic_ |
| `Let's play devil's advocate` | prompts the assistant to provide alternative views of the topic at hand                                                                              |
| `Flip the script`             | prompts the assistant to provide a more argumentative or controversial take of the current topic                                                     |

## Verbosity
The verbosity of the answers provided by ChatGPT is automatically inferred based on the phrasing of your question. You can give a hint by including one of the words or phrases here in your speech interaction, with **bold** words being a stronger signal based on early testing.

- extremely **terse**
- **concise**
- **detailed**
- **comprehensive**
- **exhaustive** and nuanced detail with comprehensive depth and breadth

## The AutoExpert "Secret Sauce"

Every time you ask ChatGPT a question in a voice conversation, it is instructed to first introduce its answer by saying some "preamble" text. This preamble text is designed to automatically adjust ChatGPT's "attention mechnisms" to attend to specific tokens that positively influence the quality of its completions. This preamble sets the stage for higher-quality outputs by:

- Selecting the best available expert(s) able to provide an authoritative and nuanced answer to your question.
  - By specifying this in the output context, the emergent attention mechanisms in the GPT model are more likely to respond in the style and tone of the expert(s).
- Rephrasing your question as an examplar of question-asking for ChatGPT.
  - Essentially "fixing" voice conversation prompts to be more effective in directing the attention mechanisms of the GPT models.
- Detailing its plan to answer your question, including any specific methodology, framework, or thought process that it will apply.
  - Unless the inferred verbosity is "terse" or "concise", it will describe its plan. When its asked to describe its own plan and methodological approach, it's effectively generating a lightweight version of "chain of thought" reasoning.

## Provide Nuanced Answers as the Expert

From there, ChatGPT will try to avoid superfluous prose, disclaimers about seeking expert advice, or apologizing. It will adopt the role of the expert(s) automatically selected, and speak to you in the tone and manner that matches. It is also instructed with specific words and phrases to elicit the most useful responses possible, guiding its response to be more holistic, nuanced, and comprehensive. The use of such "lexically dense" words provides a stronger signal to the attention mechanism.

## Multi-turn Responses for More Depth and Detail

When the assistant expects that the inferred verbosity level will cause it to run out of space to answer in a single turn, the assistant will let you know first what it plans to cover during a given turn. When it's finished, it'll ask you if it can continue, describing what's still to come.

# Installation (one-time)
ChatGPT AutoExpert ("Standard" Edition) is intended for use in the ChatGPT web interface, with or without a Pro subscription. To activate it, you'll need to do a few things!
1. Sign in to [ChatGPT](https://chat.openai.com)
2. Select the profile + ellipsis button in the lower-left of the screen to open the settings menu
3. Select **Custom Instructions**
    > [!WARNING]
    > You should save the contents of your existing custom instructions somewhere, because you're about to overwrite both text boxes!
4. Into the first textbox, copy and paste the text from the "About Me" source, replacing whatever was there
  - [`voice-edition/chatgpt_GPT4_voice__about_me`](voice-edition/chatgpt_GPT4_voice__about_me)
5. Into the second textbox, copy and paste the text from the "Custom Instructions" source, replacing whatever was there
main/standard-edition/chatgpt_GPT3__custom_instructions.md)
  - [`voice-edition/chatgpt_GPT4_voice__custom_instructions.md`](voice-edition/chatgpt_GPT4_voice__custom_instructions.md)
6. Select the **Save** button in the lower right
7. Try starting a voice conversation on your mobile device