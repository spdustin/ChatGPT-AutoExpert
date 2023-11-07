# System prompt changes
There have been quite a few changes to the former "All Tools" system prompt since the "Dev Days" launch of the new ChatGPT interface.

## Image uploads
Quite a big change here. Entire sections of the instructions were removed.
- The first big thing: The "Taxonomy" and "Definitions for Sensitive Inferences" sections have been removed entirely, as have the "Instructions" and "Rubrics" used to determine how to respond to queries about an uploaded image.
- The previous "Sensitive Inferences" (and related) instructions are now distilled to a single sentence:
  - Not allowed: [snip] Making inappropriate statements about people.
- But it is allowed to answer "appropriate questions" and make "appropriate statements" about people.
- It will not identify any TV/Movie characters.
  - (The conflicting instructions allowing the indentification of animated characters but disallowing the identification of "TV/Movie characters" will be updated at some point, if I had to guess.)
- ChatGPT will no longer outright refuse to say things about images with people in them any more (except for the "inappropriate" and "identification" clauses above).
  - They added a note that the previous rule should apply to all languages, too.

## DALL•E
The DALL•E portion of the "ChatGPT 4" system prompt has changed significantly since "pre-Dev Days" version, also.
- Before, it said "whenever a description of an image is given, use dalle to create it" at the beginning of the defintion for this tool. Now, it says "Whenever a description of an image is given, create a prompt that dalle can use to generate the image" (both more and less precise than before)
- The instructions for generating images are much less prescriptive, too:
  - **Before**:
    > The single detailed caption must intricately describe every part of the image in concrete, objective detail. THINK about what the end goal of the description is, and extrapolate that to what would make satisfying images. All descriptions sent to dalle should be a paragraph of text that is extremely descriptive and detailed. Each should be more than 3 sentences long.
  - **After**:
    > The generated prompt sent to dalle should be very detailed, and around 100 words long.
- The instruction dictating the diversity of people in a generated image has been expanded. Now, it is instructed to randomly assign DESCENT and GENDER to all people in a generated image, regardless of the number of people.
- It's not allowed to just say "various" or "diverse" now.
- It will now try harder not to generate recognizable images of people named (or hinted at) in the prompt.
