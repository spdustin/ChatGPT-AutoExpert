// ==UserScript==
// @name        ChatGPT Debug Helper 1.2.2
// @author      Dustin Miller <dustin@llmimagineers.com>
// @namespace   https://spdustin.substack.com
// @version     1.2.2
// @description Adds some helpful debugging tools to the ChatGPT UI
// @run-at      document-idle
// @match       https://chat.openai.com/*
// @grant       none
// ==/UserScript==

/* eslint-disable no-nested-ternary */
const DEBUG_TRANSCRIPT_FILENAME = 'autoexpert_debugger_transcript.json';
const DEBUG_STATUS_LABEL_COLORS = {
  in_progress: 'bg-yellow-100 text-yellow-700',
  finished_successfully: 'bg-green-100 text-green-700',
};

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
const DEBUG_GENERAL_FORMATTER = (parts) => {
  const response = parts.map((part) => {
    if (typeof part !== 'string') {
      return JSON.stringify(part, null, 2);
    }
    const escaped = escapeHtml(part);
    return escaped.replace(/\n/g, '<br>');
  });
  return response.join('<br><br>');
};
const DEBUG_PATHS = [
  {
    label: 'From',
    paths: [
      ['author', 'role'],
      ['author', 'name'],
    ],
    formatter: (role, name) => `${role} ${!name ? '' : `(${name})`}`,
    textClasses: ['text-green-700', 'font-bold'],
  },
  {
    label: 'To',
    paths: [['recipient']],
    formatter: (name) => {
      if (name.includes('__')) {
        return `${name.split('__')[0]}.${name.split('.')[1]}()`;
      }
      return name;
    },
    textClasses: ['text-red-700', 'font-bold'],
  },
  {
    label: 'Created',
    paths: [['create_time']],
    formatter: (timestamp) => {
      const date = new Date(Math.round(timestamp * 1000));
      return date.toLocaleString();
    },
  },
  {
    label: 'Status',
    paths: [['status']],
    textClass: (status) => DEBUG_STATUS_LABEL_COLORS[status],
  },
  {
    label: 'Msg Type',
    paths: [['metadata', 'message_type']],
  },
  {
    label: 'Model',
    paths: [['metadata', 'model_slug']],
  },
  {
    label: 'Cont. Type',
    paths: [
      ['content', 'content_type'],
      ['content', 'language'],
    ],
    formatter: (type, language) => `${type} ${!language ? '' : `(${language})`}`,
  },
  {
    label: '——Domain',
    paths: [['content', 'domain']],
  },
  {
    label: '——URL',
    paths: [['content', 'url']],
  },
  {
    label: '——Title',
    paths: [['content', 'title']],
  },
  {
    label: '——Text',
    paths: [['content', 'text']],
    formatter: (text) => text.replace(/\n/g, '<br>'),
    textClasses: ['break-all'],
  },
  {
    label: '——Summary',
    paths: [['content', 'summary']],
  },
  {
    label: '——Results',
    paths: [['content', 'result']],
    formatter: (results) => results.replace(/\n/g, '<br>'),
    textClasses: ['break-all'],
  },
  {
    label: '——Assets',
    paths: [['content', 'assets']],
    formatter: DEBUG_GENERAL_FORMATTER,
  },
  {
    label: 'Command',
    paths: [
      ['metadata', 'command'],
      ['metadata', 'args'],
    ],
    formatter: (command, args) => `${command}(${args.join(',')})`,
    textClasses: ['text-green-700'],
  },
  {
    label: '——Status',
    paths: [['metadata', 'status']],
  },
  {
    label: 'Response',
    paths: [['content', 'parts']],
    formatter: DEBUG_GENERAL_FORMATTER,
    textClasses: ['break-all', 'whitespace-pre-wrap'],
  },
  {
    label: 'Citations',
    paths: [['metadata', 'citations']],
    formatter: DEBUG_GENERAL_FORMATTER,
    textClasses: ['break-all', 'whitespace-pre-wrap'],
  },
];

function createDomElementFromHTML(htmlString) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.firstElementChild;
}

const debugPanel = createDomElementFromHTML(`
    <div id="ae_debug_panel" style="width: 33vw; height: 100vh; opacity:0.95; margin:0;" class="fixed top-0 left-0 bottom-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-gray-50 dark:bg-gray-950 text-xs font-mono" tabindex="-1">
    </div>
  `);

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

function createDebugButton(buttonData) {
  const buttonHtml = `
  <button
    title="${buttonData.title}"
    id="${buttonData.id}"
    class="btn relative btn-neutral btn-small flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-lg border border-token-border-medium focus:ring-0 ${
      buttonData.hideForGPTs ? ' hideForGPTs' : ''
    }" >
    ${buttonData.emoji}
  </button>
  `;

  const button = createDomElementFromHTML(buttonHtml);
  button.addEventListener('click', buttonData.handler, true);
  return button;
}

function renderHtmlFromJson(jsonData, options) {
  // Retrieve values for multiple paths
  function getNestedProperties(obj, paths) {
    return paths.map((path) => path.reduce((acc, part) => acc && acc[part], obj));
  }

  let html = '<dl class="debug_dl">';

  options.forEach((option) => {
    const { paths, formatter, textClass, textClasses } = option;

    // Retrieve the values for all paths
    const values = getNestedProperties(jsonData, paths);

    if (values.some((value) => value === undefined)) {
      return;
    }

    const formattedValue = formatter ? formatter(...values) : values.join(' ');

    const formattedValueWithClass = textClasses
      ? `<span class="${textClasses.join(' ')}">${formattedValue}</span>`
      : textClass
      ? `<span class="${textClass(formattedValue)}">${formattedValue}</span>`
      : `${formattedValue}`;

    html += `<dt class="col-span-1">${option.label}:</dt>`;
    html += `<dd class="col-span-4">${formattedValueWithClass}</dd>`;
  });

  html += '</dl>';

  return html;
}

function render(key, value) {
  const container = document.getElementById('ae_debug_panel');
  let entry = document.getElementById(`debug-${key}`);
  const newHTML = renderHtmlFromJson(value, DEBUG_PATHS);
  if (!entry) {
    entry = document.createElement('div');
    entry.id = `debug-${key}`;
    entry.classList = 'debug_entry';
    container.appendChild(entry);
  }
  entry.innerHTML = newHTML;
}

class AEDebugLog extends Map {
  set(key, value) {
    render(key, value);
    return super.set(key, value);
  }
}
let messages = new AEDebugLog();

async function decodeEventStream(event) {
  const events = new TextDecoder().decode(event);
  events
    .replace(/^data: /, '')
    .split('\n')
    .filter(Boolean)
    .map((eventData) => {
      try {
        const parsedEvent = JSON.parse(eventData);
        messages.set(parsedEvent.message.id, parsedEvent.message);
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
const debugToolbarButtons = [
  {
    title: 'Clear debug message log',
    id: 'ae_clearMessages',
    emoji:
      '<svg width="18" height="18" viewBox="0 0 448 512" fill="none"><path fill="currentColor" d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0h120.4c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64s14.3-32 32-32h96l7.2-14.3zM32 128h384v320c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>',
    hideForGPTs: false,
    handler: () => {
      debugPanel.innerHTML = '';
      messages = new AEDebugLog();
    },
  },
  {
    title: 'Download debug message log',
    id: 'ae_DownloadLog',
    emoji:
      '<svg width="18" height="18" viewBox="0 0 576 512" fill="none"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0h160v128c0 17.7 14.3 32 32 32h128v128H216c-13.3 0-24 10.7-24 24s10.7 24 24 24h168v112c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 272v-48h110.1l-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H384zm0-208H256V0l128 128z"/></svg>',
    hideForGPTs: false,
    handler: () => {
      const messageLog = Object.fromEntries(messages);
      downloadJson(messageLog, DEBUG_TRANSCRIPT_FILENAME);
    },
  },
  {
    title: 'Show debug message log',
    id: 'ae_debug',
    emoji:
      '<svg width="18" height="18" viewBox="0 0 512 512" fill="none"><path fill="currentColor" d="M256 0c53 0 96 43 96 96v3.6c0 15.7-12.7 28.4-28.4 28.4H188.4c-15.7 0-28.4-12.7-28.4-28.4V96c0-53 43-96 96-96zM41.4 105.4c12.5-12.5 32.8-12.5 45.3 0l64 64c.7.7 1.3 1.4 1.9 2.1 14.2-7.3 30.4-11.4 47.5-11.4H312c17.1 0 33.2 4.1 47.5 11.4.6-.7 1.2-1.4 1.9-2.1l64-64c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-64 64c-.7.7-1.4 1.3-2.1 1.9 6.2 12 10.1 25.3 11.1 39.5H480c17.7 0 32 14.3 32 32s-14.3 32-32 32h-64c0 24.6-5.5 47.8-15.4 68.6 2.2 1.3 4.2 2.9 6 4.8l64 64c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-63.1-63.1c-24.5 21.8-55.8 36.2-90.3 39.6V240c0-8.8-7.2-16-16-16s-16 7.2-16 16v239.2c-34.5-3.4-65.8-17.8-90.3-39.6l-63 63c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l64-64c1.9-1.9 3.9-3.4 6-4.8C101.5 367.8 96 344.6 96 320H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h64.3c1.1-14.1 5-27.5 11.1-39.5-.7-.6-1.4-1.2-2.1-1.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3z"/></svg>',
    hideForGPTs: false,
    handler: () => debugPanel.classList.toggle('-translate-x-full'),
  },
];
const debugToolbar = createDomElementFromHTML(`
  <div id="ae_floatingButtons" class="absolute p-2 top-8 mt-3 right-3 bg-transparent flex flex-col space-y-2">
    <!--Debug toolbar icons via Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.-->
  </div>
`);

Object.keys(debugToolbarButtons).forEach((key) => {
  const buttonToAdd = createDebugButton(debugToolbarButtons[key]);
  debugToolbar.appendChild(buttonToAdd);
});
document.body.appendChild(debugPanel);
document.body.appendChild(debugToolbar);

const style = document.createElement('style');
style.innerHTML = `
  .prose.dark a {
    color: #AACCFF !important;
    text-decoration: underline !important;
    text-underline-offset: 2px !important;
  }
  .debug_entry {
    --tw-bg-opacity: 1;
    background-color: rgba(255,255,255,var(--tw-bg-opacity));
    border-width: 1px;
    font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
    margin-bottom: 2.5rem;
    --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05);
    -webkit-box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
    box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
    --tw-text-opacity: 1;
    color: rgba(0,0,0,var(--tw-text-opacity))
  }
  .debug_dl {
    --tw-bg-opacity: 1;
    background-color: rgba(255,255,255,var(--tw-bg-opacity));
    display: grid;
    padding: .5rem;
    gap: .5rem;
    grid-template-columns: repeat(5,minmax(0,1fr))
  }
  .debug_dl dt {
    grid-column: span 1/span 1
  }
  .debug_dl dd {
    grid-column: span 4/span 4
  }
`;
document.head.appendChild(style);
