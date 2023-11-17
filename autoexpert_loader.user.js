// ==UserScript==
// @name        AutoExpert v6 Loader
// @author      Dustin Miller <dustin@llmimagineers.com>
// @namespace   https://spdustin.substack.com
// @version     1.0.2
// @description Loads AutoExpert custom instructions and provides simple buttons to activate them
// @run-at      document-idle
// @match       https://chat.openai.com/*
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// @connect     llmimagineers.com
// @connect     llmimagineers-web.s3.amazonaws.com
// @connect     raw.githubusercontent.com
// ==/UserScript==

(function () {
  const BASE_URL = "https://chat.openai.com";
  const AUTOEXPERT_CONFIG_URL = "https://llmimagineers.com/data/autoexpert_userscript.config.json";
  const customInstructionModalEvent = new KeyboardEvent("keydown", {
    key: "I",
    keyCode: 73,
    metaKey: true,
    shiftKey: true,
    altKey: false,
    ctrlKey: false,
    bubbles: true,
  });
  const debugSkip = ["id", "create_time", "update_time", "parent_id", "conversation_id"];
  let autoExpertPaths = null;
  let cachedToken = null;
  let tokenExpiration = Date.now();
  let messages = [];

  function createFloatingButtonContainer() {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.padding = ".5em .25em";
    container.style.top = "2px";
    container.style.right = "3.5em";
    container.style.backgroundColor = "transparent";
    container.style.display = "flex";
    container.style.flexDirection = "row";
    return container;
  }

  function createButton(buttonData) {
    const button = document.createElement("button");
    button.classList =
      "btn relative btn-neutral btn-small flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-lg border border-token-border-medium focus:ring-0";
    button.title = buttonData.title;
    button.id = buttonData.id;
    button.textContent = buttonData.emoji;
    button.dataset.userUrl = buttonData.user_url;
    button.dataset.modelUrl = buttonData.model_url;
    button.style.margin = "0 .25em ";
    return button;
  }

  async function setup() {
    const lastUpdate = localStorage.getItem("autoExpertLastUpdate");
    const now = new Date();
    const customInstructionButtons = createFloatingButtonContainer();

    if (
      !lastUpdate ||
      new Date(lastUpdate) < new Date(now.getFullYear(), now.getMonth(), now.getDate())
    ) {
      const response = await fetchData(AUTOEXPERT_CONFIG_URL);
      const configData = safeJSONParse(response);
      localStorage.setItem("autoExpertLastUpdate", now.toISOString());
      localStorage.setItem("autoExpertPaths", JSON.stringify(configData));
    }
    autoExpertPaths = safeJSONParse(localStorage.getItem("autoExpertPaths"));
    generateButtons(autoExpertPaths, customInstructionButtons);
    GM_addStyle(`
      #headlessui-menu-items-debug ul {
        display: block;
        list-style-type: disc;
        margin: 0;
        padding: 0 0 0 0.5em;
      }
      #headlessui-menu-items-debug > ul {
        margin: 0 0 1em 0.75em;
      }
    `);
  }

  function handleError(context, error) {
    const errorMessage = `An error occurred in ${context}: ${error.message}`;
    console.error(errorMessage);
  }

  async function fetchToken() {
    if (Date.now() < tokenExpiration) return cachedToken;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/session`);
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
          cachedToken = tokenData.accessToken;
          tokenExpiration = new Date(tokenData.expires).getTime();
          return cachedToken;
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

  async function fetchData(url, options = {}, needsAuth = false) {
    if (url.startsWith(BASE_URL)) {
      if (needsAuth) {
        await fetchToken();
        options.headers = {
          Authorization: `Bearer ${cachedToken}`,
          ...options.headers,
        };
      }
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      }
    } else {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: options.method || "GET",
          headers: options.headers,
          url: url,
          onload: (response) => {
            if (response.status >= 200 && response.status < 300) {
              resolve(response.responseText);
            } else {
              reject(new Error(`HTTP error! status: ${response.status}`));
            }
          },
          onerror: reject,
        });
      });
    }
  }

  async function updateCustomInstructions(data) {
    try {
      const response = await fetchData(
        `${BASE_URL}/backend-api/user_system_messages`,
        {
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
    } catch (err) {
      handleError("updateCustomInstructions", err);
    }
  }

  function updateButtonUI(button, { disabled, backgroundColor, text }) {
    button.disabled = disabled;
    button.style.backgroundColor = backgroundColor;
    if (text) {
      button.textContent = text;
    }
  }

  function generateButtons(autoExpertPaths, buttonBar) {
    autoExpertPaths.forEach((buttonData) => {
      const button = createButton(buttonData);
      button.onclick = () => handleButtonClick(button);
      buttonBar.appendChild(button);
    });

    const disableButton = createButton({
      id: "ae_disable",
      emoji: "🚫",
    });
    disableButton.onclick = () => handleDisableClick(disableButton);

    const downloadButton = createDownloadDataButton();
    downloadButton.onclick = () => handleDownloadDataClick(downloadButton);

    const customInstuctionsButton = createButton({
      id: "ae_CustomInstModal",
      emoji: "📝",
    });
    customInstuctionsButton.onclick = () => handleCustomInstClick(customInstuctionsButton);

    const downloadLogButton = createButton({
      id: "ae_DownloadLog",
      emoji: "🕵️",
    });
    downloadLogButton.onclick = () => downloadJson(messages);

    buttonBar.appendChild(customInstuctionsButton);
    buttonBar.appendChild(downloadButton);
    buttonBar.appendChild(disableButton);
    buttonBar.appendChild(downloadLogButton);
    document.body.appendChild(buttonBar);
  }

  function handleButtonClick(btn) {
    updateButtonUI(btn, {
      disabled: true,
      backgroundColor: "yellow",
    });
    performButtonClickAction(btn)
      .then(() => {
        updateButtonUI(btn, {
          backgroundColor: "green",
        });
        location.reload(true);
      })
      .catch((err) => {
        updateButtonUI(btn, {
          backgroundColor: "red",
        });
        handleError("handleButtonClick", err);
      });
  }

  async function performButtonClickAction(btn) {
    try {
      const userContentPromise = fetchData(btn.dataset.userUrl);
      const modelContentPromise = fetchData(btn.dataset.modelUrl);

      const [aboutUserContent, aboutModelContent] = await Promise.all([
        userContentPromise,
        modelContentPromise,
      ]);
      const instructionData = {
        about_user_message: aboutUserContent,
        about_model_message: aboutModelContent,
        enabled: true,
      };

      await updateCustomInstructions(instructionData);
    } catch (err) {
      handleError("performButtonClickAction", err);
    }
  }

  function handleCustomInstClick(btn) {
    document.dispatchEvent(customInstructionModalEvent);
  }

  function handleDisableClick(btn) {
    updateButtonUI(btn, {
      backgroundColor: "yellow",
      disabled: true,
    });
    performDisableClickAction(btn)
      .then(() => {
        updateButtonUI(btn, {
          backgroundColor: "green",
        });
        location.reload(true);
      })
      .catch((err) => {
        updateButtonUI(btn, {
          backgroundColor: "red",
        });
        handleError("handleDisableClick")(err);
      });
  }

  async function performDisableClickAction(btn) {
    try {
      const fetchedData = await fetchData(`${BASE_URL}/backend-api/user_system_messages`, {}, true);
      fetchedData.enabled = false;

      await updateCustomInstructions(fetchedData);
    } catch (err) {
      handleError("performDisableClickAction", err);
    }
  }

  function createDownloadDataButton() {
    const downloadBtn = createButton({
      title: "Download Data",
      id: "download_data",
      emoji: "📥",
    });
    downloadBtn.onclick = handleDownloadDataClick.bind(downloadBtn);
    return downloadBtn;
  }

  async function handleDownloadDataClick(button) {
    try {
      updateButtonUI(button, {
        backgroundColor: "yellow",
        disabled: true,
      });
      const data = await fetchData(`${BASE_URL}/backend-api/user_system_messages`, {}, true);
      if (data) {
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });
        const tempURL = URL.createObjectURL(blob);
        const tmpAnchor = document.createElement("a");
        tmpAnchor.href = tempURL;
        tmpAnchor.download = "user_system_messages.json";
        document.body.appendChild(tmpAnchor);
        tmpAnchor.click();
        document.body.removeChild(tmpAnchor);
        URL.revokeObjectURL(tempURL);
      } else {
        throw new Error("Received undefined data");
      }
      updateButtonUI(button, {
        backgroundColor: "var(--surface-primary)",
        disabled: false,
      });
    } catch (err) {
      updateButtonUI(button, {
        backgroundColor: "red",
      });
      handleError("handleDownloadDataClick", err);
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

  const main = document.getElementsByTagName("main")[0];
  const lowerRight = main.lastChild.lastChild;

  const btnDebug = createDomElementFromHTML(
    '<button class="flex items-center justify-center rounded-full mb-2 border border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-200" id="headlessui-menu-button-debug" type="button" aria-haspopup="true" aria-expanded="false" data-headlessui-state="" > <div class="flex h-6 w-6 items-center justify-center text-xs">&gt;</div> </button> '
  );

  const panelDebug = createDomElementFromHTML(
    '<div style="height: 50vh; display: none" class="shadow-xl absolute bottom-full h-3/6 max-h-50vh right-0 z-20 mb-4 w-full min-w-[300px] overflow-y-auto rounded-md bg-gray-50 pb-1.5 pt-1 outline-none dark:bg-gray-950 opacity-100 translate-y-0" aria-labelledby="headlessui-menu-button-debug" id="headlessui-menu-items-debug" role="menu" tabindex="0" data-headlessui-state="open">'
  );

  function createNestedList(obj) {
    function createList(item, isTopLevel = false) {
      if (typeof item !== "object" || item === null) {
        return document.createTextNode(item);
      }

      let ul;
      if (isTopLevel && item.id) {
        let existingUl = document.getElementById(`debug-${item.id}`);
        if (existingUl) {
          existingUl.innerHTML = ""; // Clear existing UL content
          ul = existingUl;
        } else {
          ul = document.createElement("ul");
          ul.setAttribute("id", `debug-${item.id}`);
          ul.classList = "text-xs";
          panelDebug.appendChild(ul);
        }
      } else {
        ul = document.createElement("ul");
      }

      for (const key in item) {
        if (!debugSkip.includes(key)) {
          const li = document.createElement("li");
          li.appendChild(document.createTextNode(key + ": "));
          li.appendChild(createList(item[key]));
          ul.appendChild(li);
          ul.scrollIntoView({ block: "end" });
        }
      }
      return ul;
    }

    return createList(obj, true); // Ensure the created list is returned
  }

  btnDebug.addEventListener("click", () => {
    panelDebug.style.display = panelDebug.style.display === "none" ? "block" : "none";
  });

  lowerRight.prepend(btnDebug);
  lowerRight.appendChild(panelDebug);

  setup();

  const originalFetch = unsafeWindow.fetch;

  unsafeWindow.fetch = async (...args) => {
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
          if (done) break;
          decodeEventStream(value);
          controller.enqueue(value);
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
      let r = JSON.parse(jsonPart);
      messages.push(r);
      createNestedList(r.message);
    } catch (err) {
      return;
    }
  }

  function downloadJson(variable, filename) {
    const jsonString = JSON.stringify(variable, null, 2); // Pretty print with 2 spaces

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download.json"; // Default filename if none is provided

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
})();
