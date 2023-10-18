# ChatGPT AutoExpert ("Standard" Edition) v5
by Dustin Miller • [Reddit](https://www.reddit.com/u/spdustin) • [Substack](https://spdustin.substack.com)

**License**: [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

_**Want to support these free prompts? [My Substack](https://spdustin.substack.com) offers paid subscriptions, that's the best way to show your appreciation.**_

***

**Check it out in action, then keep reading:**
- [V=5 history of quantum mechanics](https://chat.openai.com/share/7a3c0c73-c811-4976-a98b-d424322bec6f)
- [Interpreting bloodwork results](https://chat.openai.com/share/606f8074-2ed7-49a3-a56a-faa7ecd671f7) (using a [fictional example](https://functionalhealthclinic.co.uk/functional-blood-chemistry-analysis/))

***

> [!IMPORTANT]
> There are two versions of the AutoExpert custom instructions for ChatGPT: one for the GPT-3.5 model, and another for the GPT-4 model.

> [!NOTE]
> **Several things have changed since the previous version**:
> - The `VERBOSITY` level selection has changed from the previous version from `0–5` to `1–5`
> - There is no longer an `About Me` section, since it's so rarely utilized in context
> - The `Assistant Rules / Language & Tone, Content Depth and Breadth` is no longer its own section; the instructions there have been supplanted by other mentions to the guidelines where GPT models are more likely to attend to them.
> - Similarly, `Methodology and Approach` has been incorporated in the "Preamble", resulting in ChatGPT self-selecting any formal framework or process it should use when answering a query.
> - ✳️ **New to v5**: [Slash Commands](#slash-commands)
> - ✳️ **Improved in v5**: The [AutoExpert Preamble](#the-autoexpert-secret-sauce) has gotten more effective at directing the GPT model's attention mechanisms

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

Once these instructions are in place, you should immediately notice a dramatic improvement in ChatGPT's responses. Why are its answers so much better? It comes down to how ChatGPT "attends to" both text you've written, and the text it's in the middle of writing.

> [!NOTE]
> You can read more info about this by reading this [article I wrote about "attention"](https://spdustin.substack.com/p/whatre-you-lookin-at-chatgpt) on my Substack.

## Slash Commands
✳️ **New to v5**: Slash commands offer an easy way to interact with the AutoExpert system.

| Command                          | Description                                                                                                                | GPT-3.5 | GPT-4 |
|:---------------------------------|:---------------------------------------------------------------------------------------------------------------------------|---------|-------|
| `/help`                          | gets help with slash commands (GPT-4 also describes its other special capabilities)                                        | ✅       | ✅     |
| `/review`                        | asks the assistant to critically evaluate its answer, correcting mistakes or missing information and offering improvements | ✅       | ✅     |
| `/summary`                       | summarize the questions and important takeaways from this conversation                                                     | ✅       | ✅     |
| `/q`                             | suggest additional follow-up questions that you could ask                                                                  | ✅       | ✅     |
| `/more [optional topic/heading]` | drills deeper into the topic; it will select the aspect to drill down into, or you can provide a related topic or heading  | ✅       | ✅     |
| `/links`                         | get a list of additional Google search links that might be useful or interesting                                           | ✅       | ✅     |
| `/redo`                          | prompts the assistant to develop its answer again, but using a different framework or methodology                          | ❌       | ✅     |
| `/alt`                           | prompts the assistant to provide alternative views of the topic at hand                                                    | ❌       | ✅     |
| `/arg`                           | prompts the assistant to provide a more argumentative or controversial take of the current topic                            | ❌       | ✅     |
| `/joke`                          | gets a topical joke, just for grins                                                                                        | ❌       | ✅     |

## Verbosity
You can alter the verbosity of the answers provided by ChatGPT by prefixing your request with `V=[1–5]`.
- `V=1`: extremely terse
- `V=2`: concise
- `V=3`: detailed (default)
- `V=4`: comprehensive
- `V=5`: exhaustive and nuanced detail with comprehensive depth and breadth

## The AutoExpert "Secret Sauce"

Every time you ask ChatGPT a question, it is instructed to create a preamble at the start of its response. This preamble is designed to automatically adjust ChatGPT's "attention mechanisms" to attend to specific tokens that positively influence the quality of its completions. This preamble sets the stage for higher-quality outputs by:

- Selecting the best available expert(s) able to provide an authoritative and nuanced answer to your question
  - By specifying this in the output context, the emergent attention mechanisms in the GPT model are more likely to respond in the style and tone of the expert(s)
- Suggesting possible key topics, phrases, people, and jargon that the expert(s) might typically use
  - These "Possible Keywords" prime the output context further, giving the GPT models another set of anchors for its attention mechanisms
- ✳️ **New to v5**: Rephrasing your question as an examplar of question-asking for ChatGPT
  - Not only does this demonstrate how to write effective queries for GPT models, but it essentially "fixes" poorly-written queries to be more effective in directing the attention mechanisms of the GPT models
- Detailing its plan to answer your question, including any specific methodology, framework, or thought process that it will apply
  - When its asked to describe its own plan and methodological approach, it's effectively generating a lightweight version of "chain of thought" reasoning

<details>
  <summary>Expand example "preamble" table</summary>
  <table>
<thead>
<tr>
<th style="text-align:left">Expert(s)</th>
<th style="text-align:left">Historian of Science, Theoretical Physicist</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left">Possible Keywords</td>
<td style="text-align:left">Quantum Mechanics, Max Planck, Albert Einstein, Niels Bohr, Erwin Schrödinger, Werner Heisenberg, Matrix Mechanics, Wave Mechanics, Quantum Field Theory, Quantum Electrodynamics, Quantum Computing, Double-slit experiment, Paul Dirac, Richard Feynman, Uncertainty Principle, Quantum Entanglement, Superposition, Quantum States, Hilbert Space, Copenhagen Interpretation, Many-Worlds Interpretation, Quantum Tunneling, Quantum Gravity, Bell&#39;s Theorem, Quantum Cryptography, Quantum Supremacy</td>
</tr>
<tr>
<td style="text-align:left">Question</td>
<td style="text-align:left">Could you provide a comprehensive historical overview of the development of quantum mechanics from its inception to the current state, covering significant contributions and shifts in understanding?</td>
</tr>
<tr>
<td style="text-align:left">Plan</td>
<td style="text-align:left">To answer this question with a verbosity level of 5, I will start with the early beginnings of quantum mechanics, working through key figures, theories, and experiments. I will elaborate on the main turning points and controversies, while also emphasizing the underlying mathematical frameworks. Finally, I will discuss modern applications and ongoing questions. I will use a historical framework for context and a scientific lens for technical explanations.</td>
</tr>
</tbody>
</table>
</details>

## Write Nuanced Answers with Inline Links to More Info

From there, ChatGPT will try to avoid superfluous prose, disclaimers about seeking expert advice, or apologizing. Wherever it can, it will also add **working links** to important words, phrases, topics, papers, etc. These links will go to Google Search, passing in the terms that are most likely to give you the details you need.

> ![NOTE]
> GPT-4 has yet to create a non-working or hallucinated link during my automated evaluations. While GPT-3.5 still occasionally hallucinates links, the instructions drastically reduce the chance of that happening.

It is also instructed with specific words and phrases to elicit the most useful responses possible, guiding its response to be more holistic, nuanced, and comprehensive. The use of such "lexically dense" words provides a stronger signal to the attention mechanism.

## Multi-turn Responses for More Depth and Detail
✳️ **New to v5**: (_**GPT-4 only**_) When `VERBOSITY` is set to `V=5`, your AutoExpert will stretch its legs and settle in for a long chat session with you. These custom instructions guide ChatGPT into splitting its answer across multiple conversation turns. It even lets you know in advance what it's going to cover in the current turn.

> ⏯️ **This first part will focus on the pre-1920s era, emphasizing the roles of Max Planck and Albert Einstein in laying the foundation for quantum mechanics.**

Once it's finished its partial response, it'll interrupt itself and ask if it can continue:

> 🔄 May I continue with the next phase of quantum mechanics, which delves into the 1920s, including the works of Heisenberg, Schrödinger, and Dirac?

## Provide Direction for Additional Research

After it's done answering your question, an epilogue section is created to suggest additional, topical content related to your query, as well as some more tangential things that you might enjoy reading.

<details>
  <summary>Expand example epilogue</summary>
  <h3>See also</h3>
  <ul>
    <li>📜 <a href="https://www.google.com/search?q=Critics+of+Modern+Quantum+Mechanics">Critics of Modern Quantum Mechanics</a> for a list of scientists and thinkers who have questioned the current trends.</li>
    <li>👥 <a href="https://www.google.com/search?q=Debates+in+Quantum+Mechanics">Debates in Quantum Mechanics</a> for an overview of ongoing controversies.</li>
  </ul>
  <h3>You may also enjoy</h3>
  <ul>
    <li>📚 <a href="https://www.google.com/search?q=books+criticizing+the+state+of+physics">Books Criticizing the State of Physics</a> for a more in-depth look at these critiques.</li>
    <li>🎤 <a href="https://www.google.com/search?q=podcasts+on+quantum+controversies">Podcasts on Quantum Controversies</a> for engaging discussions about the debates in quantum mechanics.</li>
  </ul>
</details>

# Installation (one-time)
ChatGPT AutoExpert ("Standard" Edition) is intended for use in the ChatGPT web interface, with or without a Pro subscription. To activate it, you'll need to do a few things!
1. Sign in to [ChatGPT](https://chat.openai.com)
2. Select the profile + ellipsis button in the lower-left of the screen to open the settings menu
3. Select **Custom Instructions**
    > [!WARNING]
    > You should save the contents of your existing custom instructions somewhere, because you're about to overwrite both text boxes!
4. Into the first textbox, copy and paste the text from the correct "About Me" source for the GPT model you're using in ChatGPT, replacing whatever was there
  - GPT 3.5: [`standard-edition/chatgpt_GPT3__about_me.md`](https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/main/standard-edition/chatgpt_GPT3__about_me.md)
  - GPT 4: [`standard-edition/chatgpt_GPT4__about_me.md`](https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/main/standard-edition/chatgpt_GPT4__about_me.md)
5. Into the second textbox, copy and paste the text from the correct "Custom Instructions" source for the GPT model you're using in ChatGPT, replacing whatever was there
  - GPT 3.5: [`standard-edition/chatgpt_GPT3__custom_instructions.md`](https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/main/standard-edition/chatgpt_GPT3__custom_instructions.md)
  - GPT 4: [`standard-edition/chatgpt_GPT4__custom_instructions.md`](https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/main/standard-edition/chatgpt_GPT4__custom_instructions.md)
6. Select the **Save** button in the lower right
7. Try it out!
