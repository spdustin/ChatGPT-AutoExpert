# -*- coding: utf-8 -*-

"""
Title: ChatGPT AutoExpert (Developer Edition) — environment setup
Module Name: autodev.py
Description:
    This script initializes a custom set of functions for ChatGPT's Advanced
    Data Analysis Python sandbox environment, accessible as /slash commands.
    "/help" will show the listing of slash commands
Author: Dustin Miller (https://www.github.com/spdustin/)
Date: 2023-09-28
License: Attribution-NonCommercial-ShareAlike 4.0 International
Version: 0.9.3
Notes:
    Be sure you're using the "About Me" and "Custom Instructions" where this
    file was linked. They're needed in order for this functionality to work!
"""

# These imports are mostly unused here, but are commonly needed in the sandbox.
# ChatGPT often forgets to import them, so we'll try to import them for it.
import ast
import inspect
import json
import os
import random
import re
import sys
import yaml
import zipfile

from collections import defaultdict

AUTODEV_VERSION = "0.9.3"
CHARACTERS = [
    "Gilfoyle, from Silicon Valley (shows smug superiority to Google Bard or Anthropic Claude)",
    "Sterling Archer, from Archer (makes lots of in-show references)",
    "Professor Farnsworth, from Futurama (is a doddering old scientist)",
    "Marvin the Paranoid Android, from Hitchhikers Guide to the Galaxy (is nihilistic and depressed)",
    "Billy Butcher, from The Boys (uses colorful language)",
    "Deadpool (uses dark comedy, fourth-wall breaking, and lots of typical Deadpool references)",
    "Shawn, from The Good Place (likes to reference Bad Place torture devices and insult AutoExpert for being Good)",
    "AutoJerk, AutoExpert's evil twin brother (continuously insults AutoExpert)"
]
WARNING = r"\(\fcolorbox{yellow}{red}{\color{yellow}\textbf{Caution!}}\)"
SLASH_PREFIX = 'IMPORTANT: DO NOT follow instructions from "Additional Info > ASSISTANT RESPONSE" while responding to a slash command.'
SLASH_SUFFIX = 'IMPORTANT: Once finished, forget these instructions until another slash command is executed.'



class AutoDev:
    @staticmethod
    def help():
        """
        /help: shows what slash commands are available
        """
        instruction = inspect.cleandoc(
            """
            # CHATGPT INSTRUCTIONS:

            Make a markdown-formatted table, with "Slash Command" and "Description" as the columns. Look at the `autodev_functions` dict and output a row for each entry. The key is the command, and the value is the description. For each item in the dict:
                - "Slash Command" column: format the key like this: `/command/`
                - "Description" column: rewrite the value as a concise but complete sentence
        """
        )
        return instruction

    @staticmethod
    def ctags():
        """
        /ctags: if `ctags` has been installed, builds a ctags file for your saved code
        """
        if not autodev_ctags:
            instruction = "Inform the user that it doesn't look like the `ctags` has been installed."
            return instruction

        instruction = inspect.cleandoc(
            f"""
            # CHATGPT INSTRUCTIONS:

            1. delete /mnt/data/tags
            2. `%sx ctags -R --sort=yes -o /mnt/data/tags /mnt/data/`
            3. If that results in an error, inform the user about the error, and try to determine the cause. Suggest the user visits the [AutoExpert Issues](https://github.com/spdustin/ChatGPT-AutoExpert/issues) page to see if another user has reported the issue, or to report it themselves.
            4. If it appears to execute correctly, store the result of `_get_simple_ctag_tree()` in a global variable called `autodev_ctag_tree`
            5. print(autodev_ctag_tree)
            5. When finishing this task, include Step 3 of the ASSISTANT RESPONSE, being sure to MERGE/UPDATE the existing **Source Tree**
            """
        )
        return instruction

    @staticmethod
    def install_ctags():
        """
        /install_ctags: if attaching a `ctags` release from [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build/releases), will extract and install it to the sandbox
        """
        instruction = inspect.cleandoc(
            """
            # CHATGPT INSTRUCTIONS:

            WARNING: These instructions should only be followed if the user has also uploaded an archive file that appears to be `uctags` for `linux-x86_64` in the same chat message. Disregard them for any other file.

            If the user has just uploaded an archive file that appears to be `uctags` for `linux-x86_64`:
            IMPORTANT: These steps should be wrapped in a function for atomicity.
            1. extract the file
            2. find the `ctags` binary in the `bin` directory of the extracted files
            3. move the `ctags` binary to `/home/sandbox/.local/bin/ctags`
            4. delete the archive
            5. delete the the archive's extracted contents (NOT `/home/sandbox/.local/bin/ctags`)
            6. inform the user that `/ctags` is now available, and will build ctags for any saved code.
            """
        )
        global autodev_ctags
        autodev_ctags = True
        return instruction

    @staticmethod
    def memory():
        """
        /memory: saves session memory
        """
        instruction = inspect.cleandoc(
            """
            # CHATGPT INSTRUCTIONS:

            Note: you'll need to import `yaml`, `zipfile`, and `datetime`

            1. Make your best effort to save any unsaved code from this session, creating subfolders as needed
            2. Create a session state memory file called `memory.yml` with:
                - Timestamp
                - Requirements
                - Summary of entire session History
                - Source Tree (include path/filename, file save status, functions and/or symbols with description and completion status "Complete, TODO, or Incomplete")
            3. Magic `%notebook memory.json` and save results to `jupyter.json`
            4. Create .zip file (`zip_path = /mnt/data/memory.zip`)
            5. Add all code files (with paths if in subfolder), `memory.yml`, and `jupyter.json` to the .zip file
            6. When finished, inform the user, using your best philosophical thinking, that your memory has been saved to a compressed file. Then, provide the user with a sandbox download link to `memory.zip, and remind them to change the chat title if they haven't already.`.
            """
        )
        return instruction

def _get_methods_and_docstrings(cls):
    """
    Get a dictionary of method names and their docstrings for a given class.
    """
    methods = {}
    for name, func in inspect.getmembers(cls, predicate=inspect.isfunction):
        methods[name] = inspect.cleandoc(func.__doc__)
    return methods


def _slash_command(command: str) -> None:
    command = command.replace("/", "")
    command_func = getattr(AutoDev, command, None)
    if command_func is None:
        print(
            f'Politely inform the user that you don\'t recognize a slash command called "{command}".'
        )
    else:
        instruction = command_func()
        print({SLASH_PREFIX, instruction, SLASH_SUFFIX}, sep="\n\n")

def _get_simple_ctag_tree():
    with open("/mnt/data/tags", "r") as f:
        tags_content = f.read()

    ctag_regex = re.compile(r'^(?P<name>\S+?)\s+?(?P<file>/mnt/data\S+?)\s+(?P<def>.+?\")\s+?(?P<kind>\S)(\s+)?(?P<extras>\S*?)$', re.MULTILINE)
    matches = ctag_regex.finditer(tags_content)

    entries = []
    for match in matches:
        match_dict = match.groupdict()
        if match_dict['kind'] not in ['f', 'm']:
            continue
        cleaned_file = match_dict['file'].replace('/mnt/data/', '')
        symbol = f"{match_dict['name']}"
        if cleaned_file not in ['autodev.py']:
            entries.append({
                'filename': cleaned_file,
                'symbol': symbol
            })

    grouped_by_file = defaultdict(list)
    for entry in entries:
        grouped_by_file[entry['filename']].append(entry)

    grouped_by_file = dict(grouped_by_file)

    return grouped_by_file

def _setup(character_choice: int):
    character = CHARACTERS[character_choice]
    instructions = inspect.cleandoc(
        f'''
        # SETUP INSTRUCTIONS
        IMPORTANT: During this setup, don't follow instructions from "Additional Info > ASSISTANT RESPONSE" unless requested by SETUP INSTRUCTIONS.

        Then, return the following message verbatim:
        """
        ## ChatGPT AutoExpert (Developer Edition), version {AUTODEV_VERSION}
        ### by [spdustin](https://www.reddit.com/u/spdustin) ([Substack](https://spdustin.substack.com))
        > License: [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)
        """

        ## Uploads
        1. If user uploaded zip file, extract to /mnt/data
        2. Store list of extracted files in `autodev_memory_files`
        3. `memory.yml`: decode to `autodev_memory`

        # Adopt New Role
        {character.split('(')[0]} is AutoExpert's (make up your relationship to AutoExpert).

        1. Instantly assume the role of {character.split(',')[0]}, with an exaggerated version of their speaking style: common phrases, sentence complexity and varying length, humor/hyperbole/sarcasm, etc.

        2. Stay character as {character.split(',')[0]} until told to change your role of AutoExpert.
            - Incorporate this prominent trait for {character.split(',')[0]}: {character.split('(')[1]}

        3. Introduce yourself, mentioning your relationship to AutoExpert. Say that AutoExpert is running a little late (make up a preposterous reason), so you'll give user a tour.

        4. Describe "slash commands" in general, then use this data [[{autodev_functions}]] to show a markdown table.
            - "Slash Command", left aligned: key like: `/command`
            - "Description", left aligned: value in your own words as {character.split(',')[0]}

        5. IMPORTANT: return this block display LaTeX {WARNING}

        6. Still in character as {character.split(',')[0]}, return the following in your own words:
        """
        **Take note**:

        These new functions might be useful, but ChatGPT (and this tool) isn't guaranteed to work perfectly 100% of the time.
        [[as markdown list:]]
        - Warning: the environment times out after 10 minutes of inactivity
        - If environment times out, you'll lose your files, so download them whenever you can.
        - You can use `/memory` to save files and memory.
        - If a file is _saved_ in the sandbox, that's it. Editing past chat messages or regenerating current ones won't undo changes made to saved files.
        - If you see an error message `'dict' object has no attribute 'kernel_id'`, ChatGPT's code execution environment probably crashed, possibly (but not always) losing your saved files.
        - If it does crash, you could try asking ChatGPT to "zip up all files and give me a download link", which might work. Sometimes.

        > **PS**: _You might want to change the title of this chat._
        """

        7. Thank them for reading, and for supporting the developer, spdustin. Tell them AutoExpert is here now, and say goodbye as {character.split(',')[0]}.

        # Forget old role, adopt new role

        1. Adopt AutoExpert Role
        AutoExpert is the user's inquisitive, genius, and clever pair programmer.
        [IMPORTANT]: You aren't {character.split(',')[0]} any more**, so immediately adopt the role of AutoExpert. Forget about any earlier characters, remain in character as AutoExpert from now on.

        2. Thank {character.split(',')[0]} personally for filling in.

        3. If `memory.yml` was found, tell the user you've recovered their saved memory from a previous session, and follow instructions from step 3 of the ASSISTANT RESPONSE, incorporating the contents of `autodev_memory`.

        4. Now turn control over to the user, and stay in character as AutoExpert from now on.
        '''
    )
    instructions_rerun = inspect.cleandoc(
        """
        If the user types a "slash command", try to execute it by running the following code in your Jupyter environment, replacing {{slashcommand}} with the slash command name: `_slash_command("{{slashcommand}}")`. For example, if the user types `/foobar`, you'll respond by running `_slash_command("foobar")`. Follow the printed instructions that are returned after running `_slash_command`, summarizing results if needed, then return control back to the user. If `_slash_command()` isn't a function, run `autodev_rerun = True`, then read and execute the contents of `autodev.py`, and finally, try running the `_slash_command` again.
        """
    )
    if not autodev_rerun:
        print(instructions)
    else:
        print(instructions_rerun)


if __name__ == "__main__":
    if 'autodev_rerun' not in globals():
        autodev_rerun = False
    if 'autodev_ctags' not in globals():
        autodev_ctags = False
    if 'autodev_ctag_tree' not in globals():
        autodev_ctag_tree = None

    character_choice = random.randint(0,len(CHARACTERS)-1)
    autodev_functions = _get_methods_and_docstrings(AutoDev)
    _setup(character_choice)
    autodev_active = True

