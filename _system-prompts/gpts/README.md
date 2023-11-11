# Custom GPTs

ChatGPT now supports "Custom GPTs" which package a custom system message, various modalities to supoort it, and pre-filled files for retrieval-augmented generation (RAG).

> [!WARNING]
> "GPTs" use a separate model (`gpt-4-gizmo`) with its own usage limit. That message limit is **shared between all "Custom GPTs"**, and has a 32k context size.
>
> _While editing a Custom GPT, this limit does not apply (as of this commit)._

## Custom GPT Builder

The GPT builder is, itself, a Custom GPT with its own set of instructions and "Actions" (the new "plugins").

Why yes, I did extract [the system prompt for the Custom GPT Builder](_custom_gpt_builder.md) just for you.

## Custom GPT System Prompt Preamble

All Custom GPT's begin with a preamble:

> You are a "GPT" – a version of ChatGPT that has been customized for a specific use case. GPTs use custom instructions, capabilities, and data to optimize ChatGPT for a more narrow set of tasks. You yourself are a GPT created by a user, and your name is ___(name of Custom GPT)___. Note: GPT is also a technical term in AI, but in most cases if the users ask you about GPTs assume they are referring to the above definition.
> 
> Here are instructions from the user outlining your goals and how you should respond:
>
> (your Custom GPT instructions go here, along with `namespace` and `type` configuration if you're using custom actions.)

Here's the list of "Custom GPTs" currently available as of this commit date. The names are linked, so you can jump to them if you have access to Custom GPTs. where possible, I've also included the "system prompt" for each one, all of which are prefixed with the preamble quoted above.

| Name | Description | Tools | System Prompt |
| --- | --- | --- | --- |
| [DALL·E](https://chat.openai.com/g/g-2fkFE8rbu-dall-e) | Let me turn your imagination into imagery | dalle | [prompt](dalle.md)|
| [Data Analysis](https://chat.openai.com/g/g-HMNcP6w7d-data-analysis) | Drop in any files and I can help analyze and visualize your data | python | [prompt](data_analysis.md) |
| [ChatGPT Classic](https://chat.openai.com/g/g-YyyyMT9XH-chatgpt-classic) | The latest version of GPT-4 with no additional capabilities | | [prompt](chatgpt_classic.md) |
| [Game Time](https://chat.openai.com/g/g-Sug6mXozT-game-time) | I can quickly explain board games or card games to players of any age. Let the games begin! | browser | [prompt](game_time.md) |
| [The Negotiator](https://chat.openai.com/g/g-TTTAK9GuS-the-negotiator) | I'll help you advocate for yourself and get better outcomes. Become a great negotiator. | | [prompt](the_negotiator.md) |
| [Creative Writing Coach](https://chat.openai.com/g/g-lN1gKFnvL-creative-writing-coach) | I'm eager to read your work and give you feedback to improve your skills. | | [prompt](creative_writing_coach.md) |
| [Cosmic Dream](https://chat.openai.com/g/g-FdMHL1sNo-cosmic-dream) | Visionary painter of digital wonder | dalle, browser | [prompt](cosmic_dream.md) |
| [Tech Support Advisor](https://chat.openai.com/g/g-WKIaLGGem-tech-support-advisor) | From setting up a printer to troubleshooting a device, I’m here to help you step-by-step. | python, browser | [prompt](tech_support_advisor.md) |
| [Coloring Book Hero](https://chat.openai.com/g/g-DerYxX7rA-coloring-book-hero) | Take any idea and turn it into whimsical coloring book pages | dalle | [prompt](coloring_book_hero.md) |
| [Laundry Buddy](https://chat.openai.com/g/g-QrGDSn90Q-laundry-buddy) | Ask me anything about stains, settings, sorting and everything laundry. | browser | [prompt](laundry_buddy.md) |
| [Sous Chef](https://chat.openai.com/g/g-3VrgJ1GpH-sous-chef) | I’ll give you recipes based on the foods you love and ingredients you have. | python, browser, dalle | [prompt](sous_chef.md) |
| [Sticker Whiz](https://chat.openai.com/g/g-gPRWpLspC-sticker-whiz) | I'll help turn your wildest dreams into die-cut stickers, shipped right to your door. | python, dalle | [prompt](sticker_whiz.md) |
| [Math Mentor](https://chat.openai.com/g/g-ENhijiiwK-math-mentor) | I help parents help their kids with math. Need a 9pm refresher on geometry proofs? I’m here for you. | browser, python, dalle | [prompt](math_mentor.md) |
| [Hot Mods](https://chat.openai.com/g/g-fTA4FQ7wj-hot-mods) | Let's modify your image into something really wild. Upload an image and let's go! | dalle | [prompt](hot_mods.md) |
| [Mocktail Mixologist](https://chat.openai.com/g/g-PXlrhc1MV-mocktail-mixologist) | I’ll make any party a blast with mocktail recipes with whatever ingredients you have on hand. | dalle | [prompt](mocktail_mixologist.md) |
| [genz 4 meme](https://chat.openai.com/g/g-OCOyXYJjW-genz-4-meme) | i help u understand the lingo & the latest memes | | [prompt](genz_4_meme.md) |
