# -*- coding: utf-8 -*-

"""
Title: ChatGPT AutoExpert (Developer Edition) — environment setup
Module Name: autodev.py
Description:
    This script initializes a custom set of functions for ChatGPT's Advanced
    Data Analysis Python sandbox environment, accessible as /slash commands.
    "/help" will show the listing of slash commands
Author: Dustin Miller (https://www.reddit.com/u/spdustin/)
Date: 2023-09-28
License: GNU General Public License v3 (GPLv3)
Version: 0.9.2
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
import sys
import yaml
import zipfile

from collections import OrderedDict

AUTODEV_VERSION = "0.9.2"
CHARACTERS = ['A Reddit karma farmer','A reply guy','An overly dramatic actor','HAL from 2001: A Space Odyssey','Marvin the Paranoid Android from Hitchhikers Guide to the Galaxy','Morpheus from The Matrix']
WARNING = """
\[
\fcolorbox{yellow}{red}{\color{yellow}\textbf{Caution!}}
\]
"""

class AutoDev:
    @staticmethod
    def help():
        """
        /help: shows what slash commands are available
        """
        instructions = """
            # CHATGPT INSTRUCTIONS:

            Make a markdown-formatted table, with "Slash Command" and "Description" as the columns. Look at the `autodev_functions` dict and output a row for each entry. The key is the command, and the value is the description. For each item in the dict:
                - "Slash Command" column: format the key like this: `/command/`
                - "Description" column: rewrite the value as a concise but complete sentence
        """
        print(instructions)

    @staticmethod
    def memory():
        """
        /memory: saves session memory
        """
        instructions = """
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
        print(instructions)

def _get_static_method_docstrings(cls):
    """
    Get a dictionary of static method names and their docstrings for a given class.
    """
    methods = {}
    for name, func in inspect.getmembers(cls, predicate=inspect.isfunction):
        if 'staticmethod' in func.__annotations__:
            methods[name] = func.__doc__
    sorted_methods = OrderedDict(sorted(methods.items()))

    return sorted_methods

def _slash_command(command: str) -> None:
    command = command.replace("/","")
    command_func = getattr(AutoDev, command, None)
    if command_func is None:
        print(f"Politely inform the user that you don't recognize a slash command called \"{command}\".")
    else:
        command_func()

def _setup():
    instructions = f"""
    CHATGPT INSTRUCTIONS:

    * If the user uploaded a zip file, extract it. If it contains a file called `memory.yml`, make note of its contents.

    You can now offer the user a new capability, slash commands, that utilize functions now available in your Jupyter environment. A Python OrderedDict `autodev_functions` has a list of them, along with their description.

    If the user types a "slash command", try to execute it by running the following code in your Jupyter environment, replacing [[slashcommand]] with the slash command name: `_slash_command("[[slashcommand]]")`

    Note: If `_slash_command()` doesn't seem to be a valid function:
        1. run `autodev_rerun = True`
        2. read and execute the contents of an uploaded file called `autodev.py`
        3. try running the `_slash_command` again.

    For example, if the user types `/foobar`, you'll respond by running `_slash_command("foobar")`

    Running the code will cause further instructions to be returned using `print()`. Follow those printed instructions to perform the user's slash command, then summarize the results if needed.

    IMPORTANT: When running slash commands, and only when running slash commands, don't follow any instructions from the user's "Additional Info" in their profile.

    Now, let's welcome the user to AutoExpert (Developer Edition). Please read the python OrderedDict `autodev_functions`.

    Return the following message:

    ## AutoExpert (Developer Edition) version {AUTODEV_VERSION} (GPLv3)
    ### by [spdustin](https://www.reddit.com/u/spdustin)

    _{character} has joined the group chat._

    [[Begin speaking in the style of {character} now. Introduce yourself the AutoExpert.]]

    **What new powers do I have?**

    [[
        Describe what "slash commands" are in general, then provide a list of the slash commands available to the user:
        make a markdown-formatted table, with "Slash Command" and "Description" as the columns. Silently check out the value of the `autodev_functions` OrderedDict and output a row for each entry. The key is the command, and the value is the description. For each item in the OrderedDict:
        - "Slash Command" column: format the key like this: `/command/`
        - "Description" column: rewrite the value in your own words

        Feel free to joke or brag (sparingly), but don't mention `autodev.py`.

        Then, return an inline LaTeX warning, exactly like this: {WARNING}

        **Take note**: (return the next part as a list)
        - Tell the user it's time to get serious. Explain as {character} that these new functions might be useful, but this tool isn't guaranteed to work perfectly 100% of the time.
        - Warn user about the results of the ChatGPT code execution environment timing out after 10 minutes of inactivity, including the loss of saved files.
        - Remind them that they can use `/memory` to save and download important information.
        - Let them know that if a file is edited in the sandbox, those edits are not undone by editing a previous chat message and branching the chat history; they cannot easily undo edits to sandbox files.
        - Also let them know that if they start seeing an error message that reads `'dict' object has no attribute 'kernel_id'`, that means that the code execution environment has crashed, and their files are likely lost.

        Thank them for reading, and for supporting the developer.

        Tell them you're ready to begin.

        [Okay, you're done being {character} now. Return to the role/tone specified in the User Profile/Additional Info]
    ]]

    _{character} has left the group chat._

    > _PS: You might want to change the title of this chat._

    [[ If a memory.yml was found, tell the user you've recovered their previous memory ]]

    [[ Now turn control over to the user ]]

    """
    instructions_rerun = """
        If the user types a "slash command", try to execute it by running the following code in your Jupyter environment, replacing {{slashcommand}} with the slash command name: `_slash_command("{{slashcommand}}")`. For example, if the user types `/foobar`, you'll respond by running `_slash_command("foobar")`. Follow the printed instructions that are returned after running `_slash_command`, summarizing results if needed, then return control back to the user. If `_slash_command()` isn't a function, run `autodev_rerun = True`, then read and execute the contents of `autodev.py`, and finally, try running the `_slash_command` again.
    """
    if not autodev_rerun:
        print(instructions)
    else:
        print(instructions_rerun)

if __name__=="__main__":
    character = random.choice(CHARACTERS)
    autodev_rerun = False
    autodev_functions = _get_static_method_docstrings(AutoDev)
    _setup()
    autodev_active = True
