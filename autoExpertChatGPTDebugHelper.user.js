// ==UserScript==
// @name        ChatGPT Debug Helper 1.1.9
// @author      Dustin Miller <dustin@llmimagineers.com>
// @namespace   https://spdustin.substack.com
// @version     1.1.9
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
    class="btn relative btn-neutral btn-small text-md flex h-9 w-9 justify-center ${
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
            emoji: '<svg viewBox="0 0 512 512" fill="none"><path fill="currentColor" d="M495.9 166.6c3.2 8.7.5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4l-55.6 17.8c-8.8 2.8-18.6.3-24.5-6.8-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4c-1.1-8.4-1.7-16.9-1.7-25.5s.6-17.1 1.7-25.4l-43.3-39.4c-6.9-6.2-9.6-15.9-6.4-24.6 4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2 5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8 8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3l-.1.1zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" class="layer"/></svg>',
            hideForGPTs: true,
            handler: () => document.dispatchEvent(CI_MODAL_TRIGGER),
        },
        {
            title: `Toggle Custom Instructions (currently ${
        userCustomInstructions.enabled ? 'On' : 'Off'
        })`,
            id: 'ae_toggle',
            emoji: userCustomInstructions.enabled ? '<svg viewBox="0 0 576 512" fill="none"><path fill="currentColor" d="M192 64C86 64 0 150 0 256s86 192 192 192h192c106 0 192-86 192-192S490 64 384 64H192zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/></svg>' : '<svg viewBox="0 0 576 512" fill="none"><path fill="currentColor" d="M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128H192c-70.7 0-128-57.3-128-128s57.3-128 128-128h192zm192 128c0-106-86-192-192-192H192C86 64 0 150 0 256s86 192 192 192h192c106 0 192-86 192-192zm-384 96a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"/></svg>',
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
            emoji: '<svg viewBox="0 0 512 512" fill="none"><path fill="currentColor" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32v242.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64v-32c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>',
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
            emoji: '<svg viewBox="0 0 448 512" fill="none"><path fill="currentColor" d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0h120.4c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64s14.3-32 32-32h96l7.2-14.3zM32 128h384v320c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>',
            hideForGPTs: false,
            handler: () => {
                debugPanel.innerHTML = '';
                messages = new Map();
            },
        },
        {
            title: 'Download Message Log',
            id: 'ae_DownloadLog',
            emoji: '<svg viewBox="0 0 576 512" fill="none"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0h160v128c0 17.7 14.3 32 32 32h128v128H216c-13.3 0-24 10.7-24 24s10.7 24 24 24h168v112c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 272v-48h110.1l-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H384zm0-208H256V0l128 128z"/></svg>',
            hideForGPTs: false,
            handler: () => {
                const messageLog = Object.fromEntries(messages);
                downloadJson(messageLog, DEBUG_TRANSCRIPT_FILENAME);
            },
        },
        {
            title: 'Show debug panel',
            id: 'ae_debug',
            emoji: '<svg viewBox="0 0 512 512" fill="none"><path fill="currentColor" d="M256 0c53 0 96 43 96 96v3.6c0 15.7-12.7 28.4-28.4 28.4H188.4c-15.7 0-28.4-12.7-28.4-28.4V96c0-53 43-96 96-96zM41.4 105.4c12.5-12.5 32.8-12.5 45.3 0l64 64c.7.7 1.3 1.4 1.9 2.1 14.2-7.3 30.4-11.4 47.5-11.4H312c17.1 0 33.2 4.1 47.5 11.4.6-.7 1.2-1.4 1.9-2.1l64-64c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-64 64c-.7.7-1.4 1.3-2.1 1.9 6.2 12 10.1 25.3 11.1 39.5H480c17.7 0 32 14.3 32 32s-14.3 32-32 32h-64c0 24.6-5.5 47.8-15.4 68.6 2.2 1.3 4.2 2.9 6 4.8l64 64c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-63.1-63.1c-24.5 21.8-55.8 36.2-90.3 39.6V240c0-8.8-7.2-16-16-16s-16 7.2-16 16v239.2c-34.5-3.4-65.8-17.8-90.3-39.6l-63 63c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l64-64c1.9-1.9 3.9-3.4 6-4.8C101.5 367.8 96 344.6 96 320H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h64.3c1.1-14.1 5-27.5 11.1-39.5-.7-.6-1.4-1.2-2.1-1.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3z"/></svg>',
            hideForGPTs: false,
            handler: () => debugPanel.classList.toggle('-translate-x-full'),
        },
    ];
    const debugToolbar = createDomElementFromHTML(
        '<div id="ae_floatingButtons" class="absolute p-2 top-8 mt-3 right-1 bg-transparent flex flex-col space-y-2"><!-- Debug toolbar icons via Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--></div>',
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
    <div class="bg-white text-black border-solid border-2 mb-4" id="ae_log_entry_${id}">
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
