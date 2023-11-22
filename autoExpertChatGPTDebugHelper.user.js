// ==UserScript==
// @name        ChatGPT Debug Helper 1.0.1
// @author      Dustin Miller <dustin@llmimagineers.com>
// @namespace   https://spdustin.substack.com
// @version     1.0.1
// @description Adds some helpful debugging tools to the ChatGPT UI
// @run-at      document-idle
// @match       https://chat.openai.com/*
// @grant       none
// ==/UserScript==

(function () {
  
  console.log('starting');

  class AEDataService {
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
      this.cachedToken = null;
      this.tokenExpiration = Date.now();
    }

    async fetchToken() {
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 2000;
      let retries = 0;

      if (Date.now() < this.tokenExpiration) return this.cachedToken;

      while (retries < MAX_RETRIES) {
        try {
          const response = await fetch(`${this.baseUrl}/api/auth/session`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          let tokenData;
          try {
            tokenData = await response.json();
          } catch (err) {
            throw new Error("Failed to parse token data as JSON");
          }
          if (tokenData && tokenData.accessToken && typeof tokenData.expires === "string") {
            this.cachedToken = tokenData.accessToken;
            this.tokenExpiration = new Date(tokenData.expires).getTime();
            return this.cachedToken;
          } else {
            throw new Error("Token data is missing the accessToken property");
          }
        } catch (err) {
          handleError("fetchToken", err);
          retries++;
          if (retries < MAX_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          } else {
            return null;
          }
        }
      }
    }

    async fetchData(url, options = {}, needsAuth = false) {
      if (needsAuth) {
        await this.fetchToken();
        options.headers = {
          Authorization: `Bearer ${this.cachedToken}`,
          ...options.headers,
        };
      }
      const response = await fetch(`${this.baseUrl}/${url}`, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      }
    }

    async updateCustomInstructions(data) {
      try {
        const response = await this.fetchData(
          `backend-api/user_system_messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
          true
        );

        if (response.error) {
          throw new Error(`Failed to update custom instructions: ${response.error}`);
        }

        return response;
      } catch (error) {
        handleError("updateCustomInstructions", error);
      }
    }
  }

  const BASE_URL = "https://chat.openai.com";
  const BASE_SUPPORT_URL = "https://llmimagineers.com";
  const CI_MODAL_TRIGGER = new KeyboardEvent("keydown", {
    key: "I",
    keyCode: 73,
    metaKey: true,
    shiftKey: true,
    altKey: false,
    ctrlKey: false,
    bubbles: true,
  });
  const DEBUGGER_SKIP_KEYS = ["id", "error", "create_time", "update_time", "parent_id", "conversation_id"];

  const aeDataService = new AEDataService(BASE_URL);
  const aeSupportDataService = new AEDataService(BASE_SUPPORT_URL);
  let messages = [];

  async function setup() {
    const fetchedData = await aeDataService.fetchData("backend-api/user_system_messages", {}, true);
    //const configData = await aeSupportDataService.fetchData("data/autoexpert_userscript.config.json", {}, false);
    //console.log(configData);
    const buttonBar = createFloatingButtonContainer();
    const buttons = [{
      title: "Show custom instructions dialog",
      id: "ae_CustomInstModal",
      emoji: "📝",
      handler: () => document.dispatchEvent(CI_MODAL_TRIGGER)
    }, {
      title: "Toggle Custom Instructions",
      id: "ae_toggle",
      emoji: fetchedData.enabled ? "✅" : "❌",
      handler: handleToggleClick
    }, {
      title: "Download Data",
      id: "ae_downloadData",
      emoji: "📥",
      handler: handleDownloadDataClick
    }, {
      title: "Download Message Log",
      id: "ae_DownloadLog",
      emoji: "🕵️",
      handler: () => downloadJson(messages)
    }, {
      title: "Show debug panel",
      id: "ae_debug",
      emoji: "🕷️",
      handler: () => panelDebug.style.display = (panelDebug.style.display === "none") ? "block" : "none"
    }];
    for (let i in buttons) {
      const _button = createButton(buttons[i]);
      buttonBar.appendChild(_button);
    }

    const panelDebug = createDomElementFromHTML(
      '<div style="height: 50vh; display: none; top: 0; right: 4em; width: 50vw;" class="prose shadow-xl absolute bottom-full z-20 overflow-y-auto rounded-md bg-gray-50 pb-1.5 pt-1 outline-none dark:bg-gray-950" aria-labelledby="headlessui-menu-button-debug" id="headlessui-menu-items-debug" role="menu" tabindex="0" data-headlessui-state="open">'
    );

    buttonBar.appendChild(panelDebug);

    document.body.appendChild(buttonBar);

    updateLimitText();
  }

  function createFloatingButtonContainer() {
    const container = document.createElement("div");
    container.classList = "absolute p-2 top-8 mt-3 right-1 bg-transparent flex flex-col space-y-2";
    container.id = "ae_floatingButtons";
    return container;
  }


  function createButton(buttonData) {
    const button = document.createElement("button");
    button.classList =
      "btn relative btn-neutral btn-small flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-lg border my-0 mz-2 border-token-border-medium focus:ring-0";
    button.title = buttonData.title;
    button.id = buttonData.id;
    button.textContent = buttonData.emoji;
    button.addEventListener("click", buttonData.handler, true);
    return button;
  }

  function handleError(context, error) {
    const errorMessage = `An error occurred in ${context}: ${error.message}`;
    console.error(errorMessage);
  }

  async function handleToggleClick() {
    try {
      const fetchedData = await aeDataService.fetchData("backend-api/user_system_messages", {}, true);
      fetchedData.enabled = !fetchedData.enabled;
      await aeDataService.updateCustomInstructions(fetchedData);
      window.location.reload(true);
    } catch (error) {
      handleError("handleToggleClick", error);
    }
  }

  async function handleDownloadDataClick() {
    try {
      const data = await aeDataService.fetchData("backend-api/user_system_messages", {}, true);
      if (data) {
        downloadJson(data, "user_system_messages.json");
      } else {
        throw new Error("Received undefined data");
      }
    } catch (error) {
      handleError("handleDownloadDataClick", error);
    }
  }

  async function updateLimitText() {
    try {
      const data = await aeDataService.fetchData("public-api/conversation_limit", {}, true);
      if (data) {
        document.forms[0].nextElementSibling.firstChild.innerText =
          data.message_disclaimer.textarea;
      }
    } catch (error) {
      handleError("updateLimitText", error);
    }
  }

  function safeJSONParse(data) {
    try {
      return JSON.parse(data);
    } catch (err) {
      const MAX_LOG_LENGTH = 200;
      const truncatedData =
        data.length > MAX_LOG_LENGTH ? `${data.substring(0, MAX_LOG_LENGTH)}...` : data;
      handleError(`safeJSONParse - Failed to parse JSON. Data: ${truncatedData}`, err);
      return null;
    }
  }

  function createDomElementFromHTML(htmlString) {
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    return tempDiv.firstElementChild;
  }

  function addDebugLogEntry(obj) {
    function createDebugLogKV(item, isTopLevel = false) {
      if (typeof item !== "object" || item === null) {
        return document.createTextNode(item);
      }
      const panelDebug = document.getElementById('headlessui-menu-items-debug');
      let ul;
      if (isTopLevel && item.message.id) {
        let existingUl = document.getElementById(`debug-${item.message.id}`);
        if (existingUl) {
          existingUl.innerHTML = "";
          ul = existingUl;
        } else {
          ul = document.createElement("ul");
          ul.setAttribute("id", `debug-${item.message.id}`);
          ul.classList = "list-inside text-xs my-0 space-y-4 max-w-md  dark:text-red-300 pl-2 text-red-500";
          panelDebug.appendChild(ul);
        }
      } else {
        ul = document.createElement("ul");
        ul.classList = "ml-2 my-0 text-gray-500";
      }

      for (const key in item) {
        if (!DEBUGGER_SKIP_KEYS.includes(key)) {
          const li = document.createElement("li");
          const fieldName = document.createElement("b");
          li.classList = "my-0";
          fieldName.appendChild(document.createTextNode(key));
          li.appendChild(fieldName)
          li.appendChild(document.createTextNode(": "));
          li.appendChild(createDebugLogKV(item[key]));
          ul.appendChild(li);
          ul.scrollIntoView({
            block: "end"
          });
        }
      }
      return ul;
    }

    return createDebugLogKV(obj, true);
  }

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.headers.get("content-type") === "text/event-stream; charset=utf-8") {
      logEventStream(response.clone());
    }
    return response;
  };

  async function logEventStream(response) {
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const {
            done,
            value
          } = await reader.read();
          decodeEventStream(value);
          controller.enqueue(value);
          if (done) break;
        }
        controller.close();
        reader.releaseLock();
      },
    });
    return new Response(stream, {
      headers: response.headers,
    });
  }

  async function decodeEventStream(value) {
    const data = new TextDecoder().decode(value);
    let jsonPart = data.replace(/^data: /, "");
    try {
      let parsedEvent = safeJSONParse(jsonPart);
      messages.push(parsedEvent.message);
      addDebugLogEntry(parsedEvent, true);
    } catch (error) {
      return;
    }
  }

  function downloadJson(variable = messages, filename = "autoexpert_debugger_transcript.json") {
    const jsonString = JSON.stringify(variable, null, 2);
    const blob = new Blob([jsonString], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  setup();

})();