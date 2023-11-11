# Behind the scenes

Let's see what `SYSTEM` messages are used behind the scenes at ChatGPT, and how they might influence custom instructions. They have been especially useful for me as I work on the [ChatGPT AutoExpert](README.md) custom instructions and supporting package (in the case of the Developer Edition).

> [!NOTE]
> I have added whitespace to some prompts to improve readability/formatting (but only where it wouldn't change how ChatGPT would attend to the prompt). 
>
> I also updated this page to separate each prompt into their own Markdown file.

**All examples are from GPT-4**.

- [**Model Metadata**](_system-prompts/_backend_api__models.md)
- [**Baseline GPT-4**](_system-prompts/base.md)
  - [All Tools](_system-prompts/all_tools.md)
  - [Advanced Data Analysis](_system-prompts/advanced-data-analysis.md)
  - [Browse with Bing](_system-prompts/browse-with-bing.md)
  - [DALL•E](_system-prompts/dall-e.md)
  - [Mobile App (iOS)](_system-prompts/mobile-app-ios.md)
  - [Mobile App (Android)](_system-prompts/mobile-app-android.md)
  - [Plugins (Example: Zapier)](_system-prompts/plugins.md)
  - [Vision](_system-prompts/vision.md)
  - [Voice Conversation](_system-prompts/voice-conversation.md)
- [**Custom Instructions**](_system-prompts/_custom-instructions.md)
- [**Custom GPTs**](_system-prompts/gpts/README.md) ❇️ _New: 10-Nov-2023_
