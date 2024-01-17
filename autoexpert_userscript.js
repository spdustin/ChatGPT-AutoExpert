// ==UserScript==
// @name        AutoExpert v6 Loader
// @namespace   https://spdustin.substack.com
// @version     1.0.1
// @description Loads AutoExpert custom instructions and provides simple buttons to activate them
// @match       https://chat.openai.com/*
// @grant       GM_xmlhttpRequest
// ==/UserScript==
(function () {
  const autoExpertPaths = [{
    "title": "Standard v5",
    "id": "std_5",
    "user_url": "https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/dev__pre-eval/standard-edition/chatgpt_GPT4__about_me.md",
    "model_url": "https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/dev__pre-eval/standard-edition/chatgpt_GPT4__custom_instructions.md",
    "emoji": "🧠"
  },
  {
    "title": "Dev v5",
    "id": "dev_5",
    "user_url": "https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/dev__pre-eval/developer-edition/chatgpt__about_me.md",
    "model_url": "https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/dev__pre-eval/developer-edition/chatgpt__custom_instructions.md",
    "emoji": "💻"
  },
  {
    "title": "Voice V5",
    "id": "voice_5",
    "user_url": "https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/dev__voice_edition/voice-edition/chatgpt_GPT4_voice__about_me.md",
    "model_url": "https://raw.githubusercontent.com/spdustin/ChatGPT-AutoExpert/dev__voice_edition/voice-edition/chatgpt_GPT4_voice__custom_instructions.md",
    "emoji": "💬"
  }
  ];
  const BASE_URL = 'https://chat.openai.com';
  const dataCache = {};
  const customInstructionButtons = createFloatingButtonContainer();

  let cachedToken = null;
  let tokenExpiration = Date.now();

  function handleError(context) {
    return error => console.error(`An error occurred in ${context}:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }

  async function fetchToken() {
    if (Date.now() < tokenExpiration) return cachedToken;
    try {
      const tokenData = await fetch(`${BASE_URL}/api/auth/session`)
        .then(res => res.json());
      cachedToken = tokenData.accessToken;
      tokenExpiration = Date.now() + 3600000;
    } catch (err) {
      handleError('fetchToken')(err);
    }
  }

  async function fetchData(url, options = {}, needsAuth = false, isCrossOrigin = false) {
    if (needsAuth) {
      await fetchToken();
      options.headers = {
        'Authorization': `Bearer ${cachedToken}`,
        ...options.headers
      };
    }

    if (isCrossOrigin) {
      // Use GM_xmlhttpRequest for cross-origin requests
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: options.method || "GET",
          headers: options.headers,
          url: url,
          onload: response => resolve(response.responseText),
          onerror: reject
        });
      });
    } else {
      // Use native fetch for same-origin requests
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  }

  async function updateCustomInstructions(data) {
    try {
      const response = await fetchData(`${BASE_URL}/backend-api/user_system_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }, true);

      if (response.status !== 200) {
        throw new Error(`Failed to update custom instructions: ${response.statusText}`);
      }
    } catch (err) {
      handleError('updateCustomInstructions')(err);
    }
  }

  function createFloatingButtonContainer() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.padding = '.25em';
    container.style.top = '3em';
    container.style.right = '1em';
    container.style.zIndex = '9999';
    container.style.backgroundColor = "var(--surface-tertiary)";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    return container;
  }

  function createButton(buttonData) {
    const btn = document.createElement('button');
    btn.title = buttonData.title;
    btn.id = buttonData.id;
    btn.innerHTML = buttonData.emoji;
    btn.dataset.userUrl = buttonData.user_url;
    btn.dataset.modelUrl = buttonData.model_url;
    btn.style.backgroundColor = "var(--surface-primary)";
    btn.style.border = "none";
    btn.style.color = "white";
    btn.style.padding = ".25em";
    btn.style.textAlign = "center";
    btn.style.fontSize = "16px";
    btn.style.margin = ".25em ";
    btn.style.cursor = "pointer";
    return btn;
  }

  function updateButtonUI(btn, {
    disabled,
    backgroundColor,
    text
  }) {
    btn.disabled = disabled;
    btn.style.backgroundColor = backgroundColor;
    btn.innerHTML = text || btn.innerHTML;
  }

  function generateButtons(autoExpertPaths, targetContainer) {
    autoExpertPaths.forEach(buttonData => {
      const btn = createButton(buttonData);
      btn.onclick = () => handleButtonClick(btn);
      targetContainer.appendChild(btn);
    });

    const disableBtn = createButton({
      title: "Disable Instructions",
      id: "ae_disable",
      emoji: "🚫"
    });
    disableBtn.onclick = () => handleDisableClick(disableBtn);
    targetContainer.appendChild(disableBtn);

    const downloadBtn = createDownloadDataButton();
    downloadBtn.onclick = () => handleDownloadDataClick(downloadBtn);
    targetContainer.appendChild(downloadBtn);

    document.body.appendChild(targetContainer);
  }

  function handleButtonClick(btn) {
    updateButtonUI(btn, {
      disabled: true,
      backgroundColor: 'yellow'
    });
    performButtonClickAction(btn)
      .then(() => {
        updateButtonUI(btn, {
          backgroundColor: 'green'
        });
        location.reload(true);
      })
      .catch((err) => {
        updateButtonUI(btn, {
          backgroundColor: 'red'
        });
        handleError('handleButtonClick')(err);
      });
  }

  async function performButtonClickAction(btn) {
    // The contents from autoExpertPaths are cross-origin
    const userContentPromise = fetchData(btn.dataset.userUrl, {}, false, true);
    const modelContentPromise = fetchData(btn.dataset.modelUrl, {}, false, true);

    const [aboutUserContent, aboutModelContent] = await Promise.all([userContentPromise, modelContentPromise]);
    const data = {
      "about_user_message": aboutUserContent,
      "about_model_message": aboutModelContent,
      "enabled": true,
    };

    await updateCustomInstructions(data);
  }

  function handleDisableClick(btn) {
    updateButtonUI(btn, {
      backgroundColor: 'yellow',
      disabled: true
    });
    performDisableClickAction(btn)
      .then(() => {
        updateButtonUI(btn, {
          backgroundColor: 'green'
        });
        location.reload(true);
      })
      .catch((err) => {
        updateButtonUI(btn, {
          backgroundColor: 'red'
        });
        handleError('handleDisableClick')(err);
      });
  }

  async function performDisableClickAction(btn) {
    const fetchedData = await fetchData(`${BASE_URL}/backend-api/user_system_messages`, {}, true);
    fetchedData.enabled = false;

    await updateCustomInstructions(fetchedData);
  }

  function createDownloadDataButton() {
    const downloadBtn = createButton({
      title: "Download Data",
      id: "download_data",
      emoji: "📥"
    });
    downloadBtn.onclick = handleDownloadDataClick.bind(downloadBtn);
    return downloadBtn;
  }

  async function handleDownloadDataClick(btn) {
    try {
      updateButtonUI(btn, {
        backgroundColor: 'yellow',
        disabled: true
      });
      const data = await fetchData(`${BASE_URL}/backend-api/user_system_messages`, {}, true);
      if (data) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_system_messages.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Received undefined data');
      }
      updateButtonUI(btn, {
        backgroundColor: '#DFDFDF',
        disabled: false
      });
    } catch (err) {
      updateButtonUI(btn, {
        backgroundColor: 'red'
      });
      handleError('handleDownloadDataClick')(err);
    }
  }

  generateButtons(autoExpertPaths, customInstructionButtons);

})();
