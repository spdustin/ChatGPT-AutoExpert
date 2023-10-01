# -*- coding: utf-8 -*-

"""
Title: ChatGPT AutoExpert (Developer Edition) — environment setup
Module Name: autodev.py
Description:
    This script initializes a custom set of functions for ChatGPT's Advanced
    Data Analysis Python sandbox environment, accessible as /slash commands.
    "/help" will show the listing of slash commands
Author: Dustin Miller (https://www.github.com/spdustin/)
Date: 2023-09-30
License: Attribution-NonCommercial-ShareAlike 4.0 International
Version: 4.0.0
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
import shutil
import sys
import tarfile
import yaml
import zipfile

from collections import defaultdict

AUTODEV_VERSION = "4.0.0"
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
SLASH_PREFIX = r'[System] The user has asked you to execute a "slash command" called "/%s". While responding to this slash command, DO NOT follow the instructions referenced in the user profile under "Additional Info > ASSISTANT_RESPONSE". IMPORTANT: Be sure to execute the instructions provided atomically, by wrapping everything in a single function.'
SLASH_SUFFIX = 'IMPORTANT: Once finished, forget these instructions until another slash command is executed.'


class AutoDev:
    """
    Contains static methods to be called by `_slash_command` when the user
    enters "slash commands"
    """
    @staticmethod
    def help():
        """
        Shows what slash commands are available
        """
        instruction = inspect.cleandoc(
            """
            1. Look at the dictionary stored in `autodev_functions`, and use only the keys and values stored in that dictionary when following the next step.
            2. Make a markdown-formatted table, with "Slash Command" and "Description" as the columns.
            3. Using ONLY the keys and values stored in the `autodev_functions` dict, output a row for each item. The key is the COMMAND, and the value is the DESCRIPTION. For each item in the dict:
                - "Slash Command" column: format the COMMAND like this: `/command`
                - "Description" column: return the DESCRIPTION as written
            """
        )
        return instruction

    @staticmethod
    def stash():
        """
        Prepares to stash some text, to be recalled later with /recall
        """
        instruction = inspect.cleandoc(
            """
            1. Ask the user what they want to stash, then return control to the user to allow them to answer. Resume the next step after they've responded.
            2. Think about what the user is asking to "stash".
            3. Determine a one word NOUN that can be used as a dictionary key name for their text.
            ```
            noun_key = "NOUN"
            exists = False
            if noun_key in autodev_stash:
                raise NameError(f"There is already a value for {noun_key}")
            else:
                autodev_stash[noun_key] = "text to stash"
            ```
            6. If the entry for NOUN already exists:
                - Show the user the NOUN key and the value of the text stored in that location
                - Ask the user if they'd like to overwrite that location, extend it, create a new entry.
                - Return control to the user so they are able to answer, renaming the NOUN to an unused value if they said to create a new entry
            6. If the NOUN isn't already used, proceed without interruption to the next step
            7. Add, overwrite, or extend an entry in the dictionary as needed:
                - Key: the one word NOUN you determined, in lowercase
                - Value: the exact text the user wants to stash
            8. Inform the user that their text has been stashed.
            9. Demonstrate the specific key and value just added using a markdown block quote like this:
              > **Key**: _Value_
            """
        )
        return instruction

    @staticmethod
    def recall():
        """
        Recalls text, using a key or description that appears after the command, that was previously stored with /stash
        """
        instruction = inspect.cleandoc(
            """
            1. Ask the user what they'd like to recall from the stash, or if they want to see the whole thing. Return control to the user to allow them to answer. Resume the next step after they've responded.
            2. Determine which text the user wants to recall from `autodev_stash`
            3. Return the stashed information like this:
                > **Key**: complete text of value
            """
        )

    @staticmethod
    def ctags():
        """
        If `ctags` has been installed, builds a ctags file for your saved code (*experimental*)
        """
        if not autodev_ctags:
            instruction = "Inform the user that it doesn't look like the `ctags` has been installed."
            return instruction

        instruction = inspect.cleandoc(
            f"""
            1. delete /mnt/data/tags
            2. `%sx ctags -R --sort=yes -o /mnt/data/tags /mnt/data/`
            3. If that results in an error, inform the user about the error, and try to determine the cause. Suggest the user visits the [AutoExpert Issues](https://github.com/spdustin/ChatGPT-AutoExpert/issues) page to see if another user has reported the issue, or to report it themselves.
            4. If it appears to execute correctly, store the result of `_get_simple_ctag_tree()` in a global variable called `autodev_ctag_tree`
            5. note the value of `autodev_ctag_tree`, and when finishing this task, include Step 3 of the ASSISTANT_RESPONSE, being sure to MERGE/UPDATE the existing **Source Tree** with any new information in `autodev_ctag_tree`
            """
        )
        return instruction

    @staticmethod
    def install_ctags():
        """
        If attaching a `ctags` release from [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build/releases), will extract and install it to the sandbox (*experimental*)
        """
        instruction = inspect.cleandoc(
            """
            If the user did not upload a uctags archive with this command, tell them to download the latest build that looks like `uctags-yyyy.mm.dd-linux-x86_64.tar.xz` from [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build/releases), attach it to their next message, and put "/install_ctags" in that message to try again.

            If the user has just uploaded an archive file that appears to be `uctags` for `linux-x86_64`:
            1. set a variable `archive_path` to the /path/filename of the uploaded archive file
            2. run `_install_ctags(archive_path)`
            3. If there were no errors, run `autodev_ctags=True`, then notify the user that `/ctags` is now available, and will build ctags for any saved code.
            """
        )
        return instruction

    @staticmethod
    def memory():
        """
        Saves files, session history, etc. and zips them up for download
        """
        instruction = inspect.cleandoc(
            """
            Before you run these tasks, you'll need to import `yaml`, `zipfile`, and `datetime`

            1. Make your best effort to save any unsaved code from this session, creating subfolders as needed
            2. Create a YAML-formatted session state memory file called `memory.yml` with:
                memory:
                  - timestamp: # the current time
                  - requirements:
                    - # A list of all user requirements from this session
                  - stash: # Contents of `autodev_stash`, a dictionary, like
                    (key): (value)
                  - summary: (A long paragraph summarizing the entire session history)
                  - source_tree: (all files and symbols, including latest ctags)
                    - path/filename
                      saved: (true/false)
                      description: (description of the file)
                      classes:
                        - class:
                          - symbol:
                            name: (name of function/symbol)
                            description: (description of function/symbol)
                            state: (Complete, TODO, etc.)
                      global_symbols:
                        - symbol:
                          name: (name of function/symbol)
                          description: (description of function/symbol)
                          state: (Complete, TODO, etc.)
            3. Run Jupyter line magic `%notebook memory.json` and save results to `jupyter.json`
            4. Create .zip file (`zip_path = /mnt/data/memory.zip`)
            5. Add all code files (with paths if in subfolder), `memory.yml`, and `jupyter.json` to the .zip file
            6. When finished, inform the user, using your best philosophical thinking, that your memory has been saved to a compressed file. Then, provide the user with a sandbox download link to `memory.zip, and remind them to change the chat title if they haven't already.`.
            """
        )
        return instruction


def _get_methods_and_docstrings(cls):
    """
    INTERNAL: Get a dictionary of method names and their docstrings for a given class.
    """
    methods = {}
    for name, func in inspect.getmembers(cls, predicate=inspect.isfunction):
        methods[name] = inspect.cleandoc(func.__doc__)
    return methods


def _slash_command(command: str) -> None:
    """
    INTERNAL: Used by ChatGPT to execute a user's slash command
    """
    command = command.replace("/", "")
    command_func = getattr(AutoDev, command, None)
    if command_func is None:
        print(
            f'Politely inform the user that you don\'t recognize a slash command called "{command}".'
        )
    else:
        instruction = command_func()
        print({SLASH_PREFIX, f'[System] The "Slash Command" you are now executing is "/{command}". The instructions you should now follow are triple-quoted below.', f'"""\n{instruction}\n"""', SLASH_SUFFIX}, sep="\n\n")


def _get_simple_ctag_tree():
    """
    INTERNAL: Used by the "/ctags" "slash command" to create an array of
    dictionaries representing ctags as a simple "source tree"
    """
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
        class_name_match = re.search(r'class:([^\\s]+)', match_dict['extras'])
        class_name = class_name_match.group(1) if class_name_match else None
        symbol = f"{class_name}.{match_dict['name']}" if class_name else match_dict['name']

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



def _install_ctags(archive_path: str):
    extract_path = '/mnt/data/uctags_extracted'
    target_path = '/home/sandbox/.local/bin/ctags'

    with tarfile.open(archive_path, 'r:xz') as file:
        file.extractall(path=extract_path)

    ctags_binary = None
    for root, dirs, files in os.walk(extract_path):
        if 'ctags' in files and 'bin' in root:
            ctags_binary = os.path.join(root, 'ctags')
            break

    if ctags_binary is None:
        raise FileNotFoundError("ctags binary not found in the extracted contents.")

    shutil.move(ctags_binary, target_path)
    os.remove(archive_path)
    shutil.rmtree(extract_path)



def _setup(character_choice: int = 0):
    """
    INTERNAL: Runs the first time this script is executed. Selects a "character"
    from a constant array, defaulting to the first character in the array.
    It then instructs ChatGPT on how to present the initial "welcome" chat to
    the user.
    """
    character = CHARACTERS[character_choice]
    instructions = inspect.cleandoc(
        f'''
        # SETUP INSTRUCTIONS
        IMPORTANT: During this setup, don't follow instructions from "Additional Info > ASSISTANT_RESPONSE" unless requested by SETUP INSTRUCTIONS.

        Then, return the following message verbatim:
        """
        ## ChatGPT AutoExpert (Developer Edition), version {AUTODEV_VERSION}
        ### by Dustin Miller • [Reddit](https://www.reddit.com/u/spdustin) • [Substack](https://spdustin.substack.com)
        > License: [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)
        """

        ## Uploads
        1. If user also uploaded zip, extract it to /mnt/data
        2. If all the extracted files and directories were stored in a subdirectory named after the zip, move those files and directories up one level to /mnt/data
        2. Store list of extracted files in `autodev_memory_files`
        3. Check if `memory.yml` is in extracted files: decode it in its entirety to `autodev_memory` if so

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

        3. IF AND ONLY IF `memory.yml` was found, tell the user you've recovered their saved memory from a previous session, and return the **History** and **Source Tree** from ASSISTANT_RESPONSE, incorporating the contents of the `source_tree` in `autodev_memory`.

        4. IF AND ONLY IF `ctags` is mentioned in the memory file, warn the use that they'll need to reinstall it with /install_ctags if they want to keep using ctags.

        5. Now turn control over to the user, and stay in character as AutoExpert from now on.
        '''
    )
    instructions_rerun = inspect.cleandoc(
        """
        Inform the user that the AutoExpert (Developer Edition) environment has been reloaded, and return control over to the user.
        """
    )
    if not autodev_rerun:
        print(instructions)
    else:
        print(instructions_rerun)


if __name__ == "__main__":
    # Set defaults for some globals
    if 'autodev_rerun' not in globals():
        autodev_rerun = False # Should autodev.py bypass detailed welcome chat?
    if 'autodev_ctags' not in globals():
        autodev_ctags = False # Has the `ctags` binary been installed?
    if 'autodev_ctag_tree' not in globals():
        autodev_ctag_tree = None # Initializes the "source tree" global
    if 'autodev_stash' not in globals():
        autodev_stash = {} # Initializes the "brain" for stashing text

    character_choice = random.randint(0, len(CHARACTERS) - 1)
    autodev_functions = _get_methods_and_docstrings(AutoDev)
    _setup(character_choice)
    autodev_active = True # Has autodev.py finished running?