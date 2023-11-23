// ==UserScript==
// @name        ChatGPT Debug Helper 1.1.7
// @author      Dustin Miller <dustin@llmimagineers.com>
// @namespace   https://spdustin.substack.com
// @version     1.1.7
// @description Adds some helpful debugging tools to the ChatGPT UI
// @run-at      document-idle
// @match       https://chat.openai.com/*
// @grant       none
// ==/UserScript==

const BASE_URL = 'https://chat.openai.com';
const GPT4_LIMIT_ENDPOINT = '/public-api/conversation_limit';
const DEBUG_TRANSCRIPT_FILENAME = 'autoexpert_debugger_transcript.json';
const DEBUG_CUSTOM_INSTRUCTIONS_FILENAME = 'user_system_messages.json';
const CI_MODAL_TRIGGER = new KeyboardEvent('keydown', {
  key: 'I',
  keyCode: 73,
  metaKey: true,
  shiftKey: true,
  altKey: false,
  ctrlKey: false,
  bubbles: true,
});
const DEBUG_MESSAGE_PATHS = [
  { label: 'ID', path: ['id'] },
  { label: 'Created', path: ['create_time'], isDate: true },
  { label: 'Type', path: ['content', 'content_type'] },
  { label: 'Lang', path: ['content', 'language'] },
  { label: 'Model', path: ['metadata', 'model_slug'] },
  { label: 'Command', path: ['metadata', 'command'] },
  { label: 'Args', path: ['metadata', 'args'], isList: true },
  { label: 'Status', path: ['metadata', 'status'] },
];
const DEBUG_CONTENT_LABEL_COLORS = {
  Text: 'bg-yellow-100 text-yellow-700',
  Result: 'bg-green-100 text-green-700',
  Reply: 'bg-gray-100 text-gray-700',
  Multi: 'bg-blue-100 text-blue-700',
};
const DEBUG_STATUS_LABEL_COLORS = {
  in_progress: 'bg-yellow-100 text-yellow-700',
  finished_successfully: 'bg-green-100 text-green-700',
};

let messages = new Map();
let debugPanel;

function handleError(context, error) {
  const errorMessage = `An error occurred in ${context}: ${error.message}`;
  // eslint-disable-next-line no-console
  console.error(errorMessage);
}

class AEDataService {
  static MAX_RETRIES = 3;

  static TOKEN_EXPIRATION_BUFFER = 3600000;

  static RETRY_DELAY = 2000;

  static TOKEN_ENDPOINT = '/api/auth/session';

  static CI_ENDPOINT = '/backend-api/user_system_messages';

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cachedToken = null;
    this.tokenExpiration = Date.now();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
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
    const response = await fetch(`${this.baseUrl}${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  async fetchToken() {
    if (Date.now() + AEDataService.TOKEN_EXPIRATION_BUFFER < this.tokenExpiration) {
      return this.cachedToken;
    }

    for (let retries = 0; retries < AEDataService.MAX_RETRIES; retries++) {
      try {
        const response = await fetch(`${this.baseUrl}${AEDataService.TOKEN_ENDPOINT}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tokenData = await response.json();

        if (tokenData && tokenData.accessToken && typeof tokenData.expires === 'string') {
          this.cachedToken = tokenData.accessToken;
          this.tokenExpiration = new Date(tokenData.expires).getTime();
          return this.cachedToken;
        }
        throw new Error('Token data is missing the accessToken property');
      } catch (error) {
        this.handleError('fetchToken', error);
        if (retries === AEDataService.MAX_RETRIES - 1) {
          throw error;
        }
        await this.delay(AEDataService.RETRY_DELAY);
      }
    }
  }

  async getUserCustomInstructions() {
    try {
      const options = {};
      const userCustomInstructions = await this.fetchData(AEDataService.CI_ENDPOINT, options, true);
      return userCustomInstructions;
    } catch (error) {
      handleError('getUserCustomInstructions', error);
    }
  }

  async updateCustomInstructions(data) {
    try {
      const response = await this.fetchData(
        AEDataService.CI_ENDPOINT,
        {
          method: 'POST',
          headers: this.defaultHeaders,
          body: JSON.stringify(data),
        },
        true,
      );
      if (response.error) {
        throw new Error(`Failed to update custom instructions: ${response.error}`);
      }
      return response;
    } catch (error) {
      handleError('updateCustomInstructions', error);
    }
  }

  delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

const aeDataService = new AEDataService(BASE_URL);

function createDomElementFromHTML(htmlString) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.firstElementChild;
}

async function setup() {
  const userCustomInstructions = await aeDataService.getUserCustomInstructions();

  function downloadJson(variable, filename) {
    const jsonString = JSON.stringify(variable, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function injectCSS() {
    const style = document.createElement('style');
    style.innerHTML = `
  body[class*="debug-g-] .hideForGPTs {
    display: none;
  }
  .debug-gpts-discovery #ae_floatingButtons {
    display: none !important;
  }
  `;
    document.head.appendChild(style);
  }

  function createDebugButton(buttonData) {
    const buttonHtml = `
  <button
    title="${buttonData.title}"
    id="${buttonData.id}"
    class="btn relative btn-neutral btn-small flex h-9 w-9 justify-center ${
      buttonData.hideForGPTs ? ' hideForGPTs' : ''
    }" >
    ${buttonData.emoji}
  </button>
  `;

    const button = createDomElementFromHTML(buttonHtml);
    button.addEventListener('click', buttonData.handler, true);
    return button;
  }

  async function updateLimitText() {
    if (document.getElementById('prompt-textarea')) {
      try {
        const options = {};
        const data = await aeDataService.fetchData(GPT4_LIMIT_ENDPOINT, options, true);
        if (data) {
          const limitText = document.forms[0].nextElementSibling.firstChild;
          limitText.innerText = data.message_disclaimer.textarea;
        }
      } catch (error) {
        handleError('updateLimitText', error);
      }
    }
  }

  const debugToolbarButtons = [
    {
      title: 'Show Custom Instructions dialog',
      id: 'ae_CustomInstModal',
      emoji: '📝',
      hideForGPTs: true,
      handler: () => document.dispatchEvent(CI_MODAL_TRIGGER),
    },
    {
      title: `Toggle Custom Instructions (currently ${
        userCustomInstructions.enabled ? 'On' : 'Off'
      })`,
      id: 'ae_toggle',
      emoji: userCustomInstructions.enabled ? '✅' : '❌',
      hideForGPTs: true,
      handler: async () => {
        try {
          userCustomInstructions.enabled = !userCustomInstructions.enabled;
          await aeDataService.updateCustomInstructions(userCustomInstructions);
          window.location.reload(true);
        } catch (error) {
          handleError('handleToggleClick', error);
        }
      },
    },
    {
      title: 'Download Data',
      id: 'ae_downloadData',
      emoji: '📥',
      hideForGPTs: true,
      handler: async () => {
        try {
          downloadJson(userCustomInstructions, DEBUG_CUSTOM_INSTRUCTIONS_FILENAME);
        } catch (error) {
          handleError('handleDownloadDataClick', error);
        }
      },
    },
    {
      title: 'Clear Messages and Debug Panel',
      id: 'ae_clearMessages',
      emoji: '🧹',
      hideForGPTs: false,
      handler: () => {
        debugPanel.innerHTML = '';
        messages = new Map();
      },
    },
    {
      title: 'Download Message Log',
      id: 'ae_DownloadLog',
      emoji: '🕵️',
      hideForGPTs: false,
      handler: () => {
        const messageLog = Object.fromEntries(messages);
        downloadJson(messageLog, DEBUG_TRANSCRIPT_FILENAME);
      },
    },
    {
      title: 'Show debug panel',
      id: 'ae_debug',
      emoji: '🕷️',
      hideForGPTs: false,
      handler: () => debugPanel.classList.toggle('-translate-x-full'),
      // (debugPanel.style.display = debugPanel.style.display === "none" ? "block" : "none"),
    },
  ];
  const debugToolbar = createDomElementFromHTML(
    '<div id="ae_floatingButtons" class="absolute p-2 top-8 mt-3 right-1 bg-transparent flex flex-col space-y-2"></div>',
  );

  debugPanel = createDomElementFromHTML(`
    <div id="ae_debug_panel" style="width: 33vw;" class="fixed top-0 left-0 bottom-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-gray-50 dark:bg-gray-950 rounded-md text-xs font-mono" tabindex="-1">
    </div>
  `);

  const pagePath = window.location.pathname.replace(/\W/g, '-');

  document.body.classList.forEach((className) => {
    if (className.startsWith('debug-')) {
      document.body.classList.remove(className);
    }
  });
  document.body.classList.add(`debug${pagePath}`);

  Object.keys(debugToolbarButtons).forEach((key) => {
    const buttonToAdd = createDebugButton(debugToolbarButtons[key]);
    debugToolbar.appendChild(buttonToAdd);
  });
  debugToolbar.appendChild(debugPanel);
  document.body.appendChild(debugToolbar);

  injectCSS();
  updateLimitText();
}

function createLogEntryHtml(logEntry) {
  const { message } = logEntry;
  const { id, author, status, recipient, content } = message;
  const itemsToWrap = [
    { label: 'Text', value: message.content.text },
    { label: 'Result', value: message.content.result },
  ];
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
              '<br>',
            )}</div>
            <div class="${
              DEBUG_CONTENT_LABEL_COLORS[label.split('-')[0]]
            } font-bold px-2 py-3 ml-2 font-sans">${label}</div>
          </div>`;
          }
        }
        return '';
      })
      .join('');
  }

  function createDetailListFromPaths(obj, paths) {
    let detailListHtml =
      '<dl style="grid-template-columns: repeat(5, minmax(0, 1fr)); display: grid;">';

    paths.forEach((entry) => {
      const { label, path, isDate, isList } = entry;
      const rawValue = path.reduce((acc, key) => acc && acc[key], obj);
      if (rawValue !== undefined && rawValue !== null && rawValue !== 'unknown') {
        let value;
        if (isDate) {
          value = new Date(rawValue * 1000).toLocaleString();
        } else if (isList) {
          value = `(${rawValue})`;
        } else {
          value = rawValue;
        }

        detailListHtml += `
        <dt style="grid-column:span 1" class="bg-gray-100 p-1 font-sans">${label}</dt>
        <dd style="grid-column:span 4" class="p-1 break-all">${value}</dd>
      `;
      }
    });

    detailListHtml += '</dl>';
    return detailListHtml;
  }

  function escapeHtml(html) {
    return html.replace(/[&<>"']/g, (match) => {
      const escape = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return escape[match];
    });
  }

  if (content.parts && content.parts.length) {
    for (let i = 0; i < content.parts.length; i++) {
      const part = content.parts[i];
      let label;
      let value;
      switch (content.content_type) {
        case 'tether_quote':
          label = 'Quote';
          value = `${content.title} (${content.url})\n${escapeHtml(content.text)}`;
          break;
        case 'tether_browsing_display':
          value = false;
          break;
        case 'text':
          label = 'Reply';
          value = escapeHtml(part);
          break;
        default:
          label = `Multi-${i + 1}`;
          value = JSON.stringify(content.parts[i], null, 2);
      }
      itemsToWrap.push({
        label,
        value,
      });
    }
  }
  const detailListHtml = createDetailListFromPaths(message, DEBUG_MESSAGE_PATHS);
  const wrappedItemsHtml = wrapItemsInDiv(itemsToWrap);
  const logEntryHtml = `
    <div class="bg-white border-solid border-2 mb-4" id="ae_log_entry_${id}">
      <div class="p-2 uppercase border-b-2 flex flex-auto justify-between flex-row" style="border-bottom: 2px solid #e5e7eb;">
        <div class="grow py-1">
          <span class="text-green-700">${author.role} (${author.name || 'N/A'})</span>
          <span class="px-2">→</span>
          <span class="text-green-700">${recipient}</span>
        </div>
        <span class="text-right px-4 py-1 rounded-lg ${
          DEBUG_STATUS_LABEL_COLORS[status]
        }">${status}</span>
      </div>
      ${detailListHtml}
      ${wrappedItemsHtml}
    </div>
  `;

  return logEntryHtml;
}

function appendLogEntries(logEntry) {
  requestAnimationFrame(() => {
    const existingLogEntry = document.getElementById(`ae_log_entry_${logEntry.message.id}`);
    const logEntryElement = createDomElementFromHTML(createLogEntryHtml(logEntry));
    if (existingLogEntry) {
      existingLogEntry.replaceWith(logEntryElement);
    } else {
      debugPanel.appendChild(logEntryElement);
    }
    logEntryElement.scrollIntoView({
      block: 'end',
    });
  });
}

async function decodeEventStream(event) {
  const events = new TextDecoder().decode(event);
  events
    .replace(/^data: /, '')
    .split('\n')
    .filter(Boolean)
    .map((eventData) => {
      try {
        const parsedEvent = JSON.parse(eventData);
        messages.set(parsedEvent.message.id, parsedEvent);
        appendLogEntries(parsedEvent);
        return parsedEvent;
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
}

async function logEventStream(response) {
  const reader = response.body.getReader();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          decodeEventStream(value);
          controller.enqueue(value);
          if (done) break;
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
  return new Response(stream, {
    headers: response.headers,
  });
}

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.headers.get('content-type') === 'text/event-stream; charset=utf-8') {
    logEventStream(response.clone());
  }
  return response;
};

setup();
