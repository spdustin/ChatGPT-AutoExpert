# ChatGPT AutoExpert ("Standard" Edition)
by Dustin Miller • [Reddit](https://www.reddit.com/u/spdustin) • [Substack](https://spdustin.substack.com)

> License: [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

> [!IMPORTANT]
> While this supports both ChatGPT using the GPT-3.5 model, it does work better with the GPT-4 model (naturally).

# Table of Contents
- [ChatGPT AutoExpert ("Standard" Edition)](#chatgpt-autoexpert-standard-edition)
- [Table of Contents](#table-of-contents)
- [Usage Notes](#usage-notes)
  - [Verbosity](#verbosity)
  - [Automatically Select an Expert](#automatically-select-an-expert)
    - [Preamble Example](#preamble-example)
  - [Write Nuanced Answers with Inline Links to More Info](#write-nuanced-answers-with-inline-links-to-more-info)
    - [Answer example](#answer-example)
  - [Provide Direction for Additional Research](#provide-direction-for-additional-research)
    - [Epilogue Example](#epilogue-example)
- [Installation (one-time)](#installation-one-time)

# Usage Notes

> [!NOTE]
> - [**See it in action** with this example shared chat](https://chat.openai.com/share/391262b8-cc16-4b38-944a-fe363e2ababd)

Once these instructions are in place, you should immediately notice a dramatic improvement in ChatGPT's responses. Why are its answers so much better? It comes down to how ChatGPT "attends to" both text you've written, and the text it's in the middle of writing.

> [!NOTE]
> You can read more info about this by reading this [article I wrote about "attention"](https://spdustin.substack.com/p/whatre-you-lookin-at-chatgpt) on my Substack.

## Verbosity
You can alter the verbosity of the answers provided by ChatGPT by prefixing your request with `V=[0–5]`.
- `V=0`: tries to only return one line answers
- `V=1`: concise
- `V=2`: brief
- `V=3`: "normal length"
- `V=4`: detailed answers, with examples
- `V=5`: the most verbose answers, aiming to be comprehensive; and with as much length, detail, and nuance as possible

## Automatically Select an Expert

Every time you ask ChatGPT a question, it is instructed to create a preamble at the start of its response. This preamble is designed to automatically adjust ChatGPT's "attention mechnisms" to pay more attention to:
- The broad academic or study domain the question falls under
- The best available expert within that domain that can provide the specific answers you are seeking
- The key topics, phrases, and jargon that the expert would typically use when answering a question like yours
- What its goal is when answering your question
- Any assumptions it has made about your question, your intent, or any related context
- Any specific methodology or thought process that could be useful when answering your question

### Preamble Example

> **Me**:<br>
> V=5 How can I purposefully lucid dream?

> **ChatGPT**:<br>
> | Attribute | Description |
> |:--|:--|
> | Domain > Expert | Psychology > Sleep and Dream Researcher |
> | Topics / Keywords / Jargon | Lucid dreaming, dream induction, REM sleep, dream journal, sleep hygiene |
> | Objective | Provide a comprehensive guide on purposefully inducing lucid dreams. |
> | Assumptions | 1. The user is familiar with the concept of lucid dreaming. 2. The user has no known sleep disorders. |

## Write Nuanced Answers with Inline Links to More Info

From there, ChatGPT will try to avoid superfluous prose, disclaimers about seeking expert advice, or apologizing. Wherever it can, it will also add **working links** to important words, phrases, topics, papers, etc. These links will go to Google Search, passing in the terms that are most likely to give you the details you need.

> ![NOTE]
> GPT-4 has yet to create a non-working or hallucinated link during my automated evaluations. While GPT-3.5 still hallucinates links, the instructions reduce the chance of that happening as often as "normal" GPT-3.5)

It is also instructed with specific words and phrases to elicit the most useful responses possible, with instructions like:

- Present a holistic understanding of the topic
- Provide comprehensive and nuanced analysis and guidance
- For complex queries, demonstrate your reasoning process with step-by-step explanations
- Mimic socratic self-questioning and theory of mind as needed

### Answer example

> ### Understanding Lucid Dreaming
>
> Lucid dreaming refers to the experience of being aware that one is dreaming while inside a dream. During a lucid dream, the dreamer can often control or influence the dream's content and outcome. The exact cause and mechanisms behind lucid dreaming are not entirely understood, but certain techniques and practices have been developed to increase the chances of experiencing one.
>
> ### 1. Maintain Good Sleep Hygiene
> 🛏️ **Healthy Sleep Patterns**: Ensure you're getting 7-9 hours of sleep each night, as it increases the chances of reaching REM sleep, where dreams are most vivid.
>
> 🕘 **Consistent Sleep Schedule**: Go to bed and wake up at the same time daily. This stabilizes your internal clock, leading to a higher quality of sleep.
>
> 🚫 **Limit Stimulants**: Avoid caffeine and other stimulants close to bedtime. They can interfere with sleep quality and REM sleep.
>
> ### 2. Dream Journal
> 📔 **Document Your Dreams**: Upon waking, immediately record your dreams in a [dream journal](https://www.google.com/search?q=dream+journal). This improves dream recall and makes you more attuned to dream patterns.
>
> ✍️ **Analyze Common Themes**: Identify recurring symbols, settings, or narratives. Recognizing these can trigger lucidity in future dreams.
>
> ### 3. Reality Checks
> 🤔 **Question Your Reality**: Several times a day, ask yourself, "Am I dreaming?" This habit will carry over into your dreams.
>
> 👌 **Physical Checks**: Perform simple acts, like attempting to push your finger through your palm or looking at digital clocks. These checks can behave differently in dreams, acting as indicators of the dream state.
>
> ### 4. Mnemonic Induction of Lucid Dreams (MILD)
> 🔄 **Repetition Before Sleep**: Before bed, tell yourself, "I will know that I am dreaming," repeatedly. This reinforces the intention to become lucid.
>
> 🔙 **Visualize Past Dreams**: Imagine yourself in a past dream, but becoming lucid. This primes the mind for future lucid experiences.
>
> ### 5. Wake Back to Bed (WBTB)
> ⏰ **Set an Alarm**: After about 5-6 hours of sleep, set an alarm to wake up. Stay awake for 20-30 minutes.
>
> 🛌 **Return to Sleep**: As you drift off again, your chances of entering REM sleep quickly are high, increasing the likelihood of a lucid dream.
>
> ### 6. Consider External Aids
> 🎧 **Binaural Beats**: Listen to [binaural beats](https://www.google.com/search?q=binaural+beats+for+lucid+dreaming) designed for lucid dreaming before sleep. They can enhance brainwave patterns associated with dreaming.
>
> 🕶️ **Dream Masks**: There are [specialized masks](https://www.google.com/search?q=lucid+dream+mask) that detect REM sleep and flash subtle lights, signaling to the dreamer that they're dreaming.
>
> ### 7. Focus on Meditation and Mindfulness
> 🧘 **Daily Meditation**: Mindfulness meditation cultivates an awareness that can be beneficial in recognizing the dream state.
>
> 💭 **Dream Yoga**: Originating in Tibetan Buddhism, [dream yoga](https://www.google.com/search?q=dream+yoga) practices integrate meditation and lucid dreaming techniques.
>
> ### 8. Manage Expectations
> ✨ **Patience is Key**: Not everyone will experience lucid dreams immediately. It requires patience, practice, and a genuine interest in exploring the dream world.
>
> ⚖️ **Balance Effort**: Being overly eager can cause anxiety, which is counterproductive. Find a balance that works best for you.
>

## Provide Direction for Additional Research

After it's done answering your question, an epilogue section is created to suggest additional, topical content related to your query, as well as some more tangential things that you might enjoy reading.

### Epilogue Example

> _See also_:<br>
> 🧠 [The science of lucid dreaming](https://www.google.com/search?q=science+of+lucid+dreaming)<br>
> 📚 [Books on lucid dreaming](https://www.google.com/search?q=best+books+on+lucid+dreaming)<br>
> 🎓 [Stephen LaBerge's research](https://www.google.com/search?q=Stephen+LaBerge+lucid+dreaming+research)<br>
> _You may also enjoy_:<br>
> 🌌 [Astral projection and out-of-body experiences](https://www.google.com/search?q=astral+projection)<br>
> 🎭 [Dream interpretation in different cultures](https://www.google.com/search?q=dream+interpretation+different+cultures)<br>
> 🎨 [Art inspired by dreams](https://www.google.com/search?q=art+inspired+by+dreams)

# Installation (one-time)
ChatGPT AutoExpert ("Standard" Edition) is intended for use in the ChatGPT web interface, with or without a Pro subscription. To activate it, you'll need to do a few things!
1. Download the [latest release](https://github.com/spdustin/ChatGPT-AutoExpert/releases/latest)
    - Expand **Assets**, then download the file titled "**Source Code** (zip)"
2. Extract the downloaded .zip file
3. Sign in to [ChatGPT](https://chat.openai.com)
4. Select the profile + ellipsis button in the lower-left of the screen to open the settings menu
5. Select **Custom Instructions**
    > [!WARNING]
    > You should save the contents of your existing custom instructions somewhere, because you're about to overwrite both text boxes!
6. Copy and paste the text from [`standard-edition/chatgpt__about_me.md`](chatgpt__about_me.md) to the first text box, replacing whatever was there
    > [!NOTE]
    > Check the **About Me** heading at the top of the text you just pasted in. Either add one or two lines about yourself (prefixed with `- ` as shown), or remove the first three lines (plus the blank line after it) altogether.
7. Copy and paste the text from [`standard-edition/chatgpt__custom_instructions.md`](chatgpt__custom_instructions.md) to the second text box, replacing whatever was there
8. Select the **Save** button in the lower right

