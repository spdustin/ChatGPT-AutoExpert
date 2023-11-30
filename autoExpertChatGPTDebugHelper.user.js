// ==UserScript==
// @name        ChatGPT Debug Helper 1.1.5
// @author      Dustin Miller <dustin@llmimagineers.com>
// @namespace   https://spdustin.substack.com
// @version     1.1.5
// @description Adds some helpful debugging tools to the ChatGPT UI
// @run-at      document-idle
// @match       https://chat.openai.com/*
// @grant       none
// ==/UserScript==

const BASE_URL = "https://chat.openai.com";
const BASE_SUPPORT_URL = "https://llmimagineers.com";
const DEBUG_TRANSCRIPT_FILENAME = "autoexpert_debugger_transcript.json";
const DEBUG_CUSTOM_INSTRUCTIONS_FILENAME = "user_system_messages.json";
const CI_MODAL_TRIGGER = new KeyboardEvent("keydown", {
  key: "I",
  keyCode: 73,
  metaKey: true,
  shiftKey: true,
  altKey: false,
  ctrlKey: false,
  bubbles: true,
});
const originalFetch = window.fetch;
let messages = new Map();

class AEDataService {
  static MAX_RETRIES = 3;
  static RETRY_DELAY = 2000;
  static TOKEN_EXPIRATION_BUFFER = 3600000;

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cachedToken = null;
    this.tokenExpiration = Date.now();
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
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

  async fetchToken() {
    if (Date.now() + AEDataService.TOKEN_EXPIRATION_BUFFER < this.tokenExpiration) {
      return this.cachedToken;
    }

    for (let retries = 0; retries < AEDataService.MAX_RETRIES; retries++) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/session`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tokenData = await response.json();

        if (tokenData && tokenData.accessToken && typeof tokenData.expires === "string") {
          this.cachedToken = tokenData.accessToken;
          this.tokenExpiration = new Date(tokenData.expires).getTime();
          return this.cachedToken;
        } else {
          throw new Error("Token data is missing the accessToken property");
        }
      } catch (error) {
        this.handleError("fetchToken", error);
        if (retries === AEDataService.MAX_RETRIES - 1) {
          throw error;
        }
        await this.delay(AEDataService.RETRY_DELAY);
      }
    }
  }

  async getUserCustomInstructions() {
    try {
      const endpoint = "backend-api/user_system_messages";
      const options = {};
      const userCustomInstructions = await aeDataService.fetchData(endpoint, options, true);
      return userCustomInstructions;
    } catch (error) {
      handleError("getUserCustomInstructions", error);
    }
  }

  async updateCustomInstructions(data) {
    try {
      const response = await this.fetchData(
        `backend-api/user_system_messages`,
        {
          method: "POST",
          headers: this.defaultHeaders,
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
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const aeDataService = new AEDataService(BASE_URL);
const aeSupportDataService = new AEDataService(BASE_SUPPORT_URL);

async function setup() {
  const userCustomInstructions = await aeDataService.fetchData(
    "backend-api/user_system_messages",
    {},
    true
  );
  const buttons = [
    {
      title: "Show Custom Instructions dialog",
      id: "ae_CustomInstModal",
      emoji: "📝",
      hideForGPTs: true,
      handler: () => document.dispatchEvent(CI_MODAL_TRIGGER),
    },
    {
      title: `Toggle Custom Instructions (currently ${
        userCustomInstructions.enabled ? "On" : "Off"
      })`,
      id: "ae_toggle",
      emoji: userCustomInstructions.enabled ? "✅" : "❌",
      hideForGPTs: true,
      handler: handleToggleClick,
    },
    {
      title: "Download Data",
      id: "ae_downloadData",
      emoji: "📥",
      hideForGPTs: true,
      handler: handleDownloadDataClick,
    },
    {
      title: "Clear Messages and Debug Panel",
      id: "ae_clearMessages",
      emoji: "🧹",
      hideForGPTs: false,
      handler: () => {
        const panelDebug = document.getElementById("ae_debug_panel");
        if (panelDebug) {
          panelDebug.innerHTML = "";
        }
        messages = new Map();
      },
    },
    {
      title: "Download Message Log",
      id: "ae_DownloadLog",
      emoji: "🕵️",
      hideForGPTs: false,
      handler: () => {
        const _m = Object.fromEntries(messages);
        downloadJson(_m, DEBUG_TRANSCRIPT_FILENAME);
      }
    },
    {
      title: "Show debug panel",
      id: "ae_debug",
      emoji: "🕷️",
      hideForGPTs: false,
      handler: () =>
        (panelDebug.style.display = panelDebug.style.display === "none" ? "block" : "none"),
    },
  ];
  const buttonBar = createDomElementFromHTML(
    `<div id="ae_floatingButtons" class="absolute p-2 top-8 mt-3 right-1 bg-transparent flex flex-col space-y-2"></div>`
  );
  const panelDebug = createDomElementFromHTML(
    '<div id="ae_debug_panel" style="display: none; top: 0; right: 4em;" class="font-mono text-xs shadow-xl absolute bottom-full z-20 overflow-y-auto rounded-md bg-gray-50 pb-1.5 pt-1 outline-none dark:bg-gray-950" aria-labelledby="ae_debug" role="menu" tabindex="0" data-headlessui-state="open">'
  );

  injectCSS();
  updateLimitText();
  for (let i in buttons) {
    const _button = createButton(buttons[i]);
    buttonBar.appendChild(_button);
  }
  buttonBar.appendChild(panelDebug);
  document.body.appendChild(buttonBar);

  function makeResizable(element, localStorageKey) {
    const savedSize = localStorage.getItem(localStorageKey);
    if (savedSize) {
      const { width, height } = JSON.parse(savedSize);
      element.style.width = width;
      element.style.height = height;
    } else {
      element.style.width = "50vw";
      element.style.height = "50vh";
    }

    const createResizer = (width, height, cursor, position) => {
      const resizer = document.createElement("div");
      resizer.style.position = "absolute";
      resizer.style.backgroundColor = "transparent";
      resizer.style.width = width;
      resizer.style.height = height;
      resizer.style.cursor = cursor;
      resizer.style[position] = 0;
      return resizer;
    };

    const leftResizer = createResizer("5px", "100%", "ew-resize", "left");
    const bottomLeftResizer = createResizer("20px", "20px", "nesw-resize", "bottom");

    element.appendChild(leftResizer);
    element.appendChild(bottomLeftResizer);

    let originalWidth, originalHeight, originalMouseX, originalMouseY;
    let isResizing = false;

    const mouseDownHandler = function (e) {
      isResizing = true;
      e.preventDefault();
      originalWidth = parseFloat(
        getComputedStyle(element, null).getPropertyValue("width").replace("px", "")
      );
      originalHeight = parseFloat(
        getComputedStyle(element, null).getPropertyValue("height").replace("px", "")
      );
      originalMouseX = e.pageX;
      originalMouseY = e.pageY;
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    const mouseMoveHandler = function (e) {
      if (!isResizing) {
        return;
      }
      const widthDifference = originalMouseX - e.pageX;
      element.style.width = `${originalWidth + widthDifference}px`;
      const heightDifference = e.pageY - originalMouseY;
      element.style.height = `${originalHeight + heightDifference}px`;
    };

    const mouseUpHandler = function () {
      if (!isResizing) {
        return;
      }
      isResizing = false;
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);

      const size = { width: element.style.width, height: element.style.height };
      localStorage.setItem(localStorageKey, JSON.stringify(size));
    };

    const mouseLeaveHandler = function () {
      if (isResizing) {
        isResizing = false;
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      }
    };

    leftResizer.addEventListener("mousedown", mouseDownHandler);
    bottomLeftResizer.addEventListener("mousedown", mouseDownHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
    document.addEventListener("mouseleave", mouseLeaveHandler);
  }

  makeResizable(panelDebug, "ae_debug_panel_size");
}

function injectCSS() {
  const style = document.createElement("style");
  style.innerHTML = `
  head:has(meta[property="og:url"][content*="/g/"]) + body .hideForGPTs {
    display: none;
  }
  `;
  document.head.appendChild(style);
}

function createButton(buttonData) {
  const buttonHtml = `
  <button
    title="${buttonData.title}"
    id="${buttonData.id}"
    class="btn relative btn-neutral btn-small flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-lg border my-0 mz-2 border-token-border-medium focus:ring-0${
      buttonData.hideForGPTs ? " hideForGPTs" : ""
    }"
  >
    ${buttonData.emoji}
  </button>
  `;

  const button = createDomElementFromHTML(buttonHtml);
  button.addEventListener("click", buttonData.handler, true);
  return button;
}

function handleError(context, error) {
  const errorMessage = `An error occurred in ${context}: ${error.message}`;
  console.error(errorMessage);
}

async function handleToggleClick() {
  try {
    const userCustomInstructions = await aeDataService.getUserCustomInstructions();
    userCustomInstructions.enabled = !userCustomInstructions.enabled;
    await aeDataService.updateCustomInstructions(userCustomInstructions);
    window.location.reload(true);
  } catch (error) {
    handleError("handleToggleClick", error);
  }
}

async function handleDownloadDataClick() {
  try {
    const userCustomInstructions = await aeDataService.getUserCustomInstructions();
    if (!userCustomInstructions) {
      throw new Error("Received undefined data");
    }
    downloadJson(userCustomInstructions, DEBUG_CUSTOM_INSTRUCTIONS_FILENAME);
  } catch (error) {
    handleError("handleDownloadDataClick", error);
  }
}

async function updateLimitText() {
  try {
    const endpoint = "public-api/conversation_limit";
    const options = {};
    const data = await aeDataService.fetchData(endpoint, options, true);
    if (data) {
      const limitText = document.forms[0].nextElementSibling.firstChild;
      limitText.innerText = data.message_disclaimer.textarea;
    }
  } catch (error) {
    handleError("updateLimitText", error);
  }
}

function createDomElementFromHTML(htmlString) {
  var tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.firstElementChild;
}

const contentLabelColors = {
  Text: "bg-yellow-100 text-yellow-700",
  Result: "bg-green-100 text-green-700",
  Reply: "bg-gray-100 text-gray-700",
  Multi: "bg-blue-100 text-blue-700",
};
const statusLabelColors = {
  in_progress: "bg-yellow-100 text-yellow-700",
  finished_successfully: "bg-green-100 text-green-700",
};

function wrapItemsInDiv(items) {
  return items
    .map((item) => {
      if (item) {
        const { label, value } = item;
        if (value !== undefined && value !== null) {
          return `
          <div style="border-top: 2px solid #e5e7eb;" class="text-gray-600 flex justify-between">
            <div class="grow p-3 break-normal whitespace-pre-wrap">${value?.replace(
              /\n/g,
              "<br>"
            )}</div>
            <div class="${
              contentLabelColors[label.split("-")[0]]
            } font-bold px-2 py-3 ml-2 font-sans">${label}</div>
          </div>`;
        }
      }
      return "";
    })
    .join("");
}

function createDetailListFromPaths(obj, paths) {
  let detailListHtml = '<dl class="grid grid-cols-5 mix-blend-multiply">';

  paths.forEach((entry) => {
    const { label, path, isDate, isList } = entry;
    const rawValue = path.reduce((acc, key) => acc && acc[key], obj);
    if (rawValue !== undefined && rawValue !== null && rawValue !== "unknown") {
      let value;
      if (isDate) {
        value = new Date(rawValue * 1000).toLocaleString();
      } else if (isList) {
        value = `(${rawValue})`;
      } else {
        value = rawValue;
      }

      detailListHtml += `
        <dt class="bg-gray-100 p-1 font-sans">${label}</dt>
        <dd style="grid-column:span 4/span 4" class="p-1 break-all">${value}</dd>
      `;
    }
  });

  detailListHtml += "</dl>";
  return detailListHtml;
}

function createLogEntryHtml(logEntry) {
  const { message, conversation_id, error } = logEntry;
  const { id, author, status, recipient, content } = message;
  const paths = [
    { label: "ID", path: ["id"] },
    { label: "Created", path: ["create_time"], isDate: true },
    { label: "Type", path: ["content", "content_type"] },
    { label: "Lang", path: ["content", "language"] },
    { label: "Model", path: ["metadata", "model_slug"] },
    { label: "Command", path: ["metadata", "command"] },
    { label: "Args", path: ["metadata", "args"], isList: true },
    { label: "Status", path: ["metadata", "status"] },
  ];
  let itemsToWrap = [
    { label: "Text", value: message.content.text },
    { label: "Result", value: message.content.result },
  ];
  if (content.parts && content.parts.length) {
    for (let i = 0; i < content.parts.length; i++) {
      const part = content.parts[i];
      let label;
      let value;
      switch (content.content_type) {
        case "tether_quote":
          label = "Quote";
          value = `${content.title} (${content.url})\n${content.text}`;
          break;
        case "tether_browsing_display":
          value = false;
          break;
        case "text":
          (label = "Reply"), (value = part);
          break;
        default:
          label = `Multi-${i + 1}`;
          value = JSON.stringify(content.parts[i], null, 2);
      }
      itemsToWrap.push({
        label: label,
        value: value,
      });
    }
  }
  const detailListHtml = createDetailListFromPaths(message, paths);
  const wrappedItemsHtml = wrapItemsInDiv(itemsToWrap);
  const logEntryHtml = `
    <div class="bg-white border-solid border-2 mb-4" id="ae_log_entry_${id}">
      <div class="p-2 uppercase border-b-2 flex flex-auto justify-between flex-row" style="border-bottom: 2px solid #e5e7eb;">
        <div class="grow py-1">
          <span class="text-green-700">${author.role} (${author.name || "N/A"})</span>
          <span class="px-2">→</span>
          <span class="text-green-700">${recipient}</span>
        </div>
        <span class="text-right px-4 py-1 rounded-lg ${statusLabelColors[status]}">${status}</span>
      </div>
      ${detailListHtml}
      ${wrappedItemsHtml}
    </div>
  `;

  return logEntryHtml;
}

function appendLogEntries(logEntry) {
  requestAnimationFrame(() => {
    const container = document.getElementById("ae_debug_panel");
    const existingLogEntry = document.getElementById(`ae_log_entry_${logEntry.message.id}`);
    const logEntryElement = createDomElementFromHTML(createLogEntryHtml(logEntry));
    if (existingLogEntry) {
      existingLogEntry.replaceWith(logEntryElement);
    } else {
      container.appendChild(logEntryElement);
    }
    logEntryElement.scrollIntoView({
      block: "end",
    });
  });
}

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
        const { done, value } = await reader.read();
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

async function decodeEventStream(event) {
  const events = new TextDecoder().decode(event);
  const eventsData = events
    .replace(/^data: /, "")
    .split("\n")
    .filter(Boolean);
  for (const eventData of eventsData) {
    try {
      const parsedEvent = JSON.parse(eventData);
      messages.set(parsedEvent.message.id, parsedEvent);
      appendLogEntries(parsedEvent);
    } catch (error) {
      return;
    }
  }
}

function downloadJson(variable, filename) {
  const jsonString = JSON.stringify(variable, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

setup();
