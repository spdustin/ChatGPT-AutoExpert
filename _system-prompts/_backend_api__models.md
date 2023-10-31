(taken from https://chat.openai.com/backend-api/models)

```json
{
  "models": [
    {
      "slug": "text-davinci-002-render-sha",
      "max_tokens": 8191,
      "title": "Default (GPT-3.5)",
      "description": "Our fastest model, great for most everyday tasks.",
      "tags": [
        "gpt3.5"
      ],
      "capabilities": {},
      "product_features": {}
    },
    {
      "slug": "gpt-4",
      "max_tokens": 32767,
      "title": "GPT-4 (All Tools)",
      "description": "Browsing, Advanced Data Analysis, and DALL-E are now built into GPT-4",
      "tags": [
        "gpt4"
      ],
      "capabilities": {},
      "product_features": {
        "attachments": {
          "type": "retrieval",
          "accepted_mime_types": [
            "text/plain",
            "application/pdf",
            "text/html",
            "text/x-tex",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/json",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/markdown"
          ],
          "image_mime_types": [
            "image/gif",
            "image/png",
            "image/webp",
            "image/jpeg"
          ],
          "can_accept_all_mime_types": true
        }
      },
      "enabled_tools": [
        "tools",
        "tools2"
      ]
    },
    {
      "slug": "gpt-4-browsing",
      "max_tokens": 8191,
      "title": "Web Browsing",
      "description": "An experimental model that knows when and how to browse the internet",
      "tags": [
        "beta",
        "gpt4"
      ],
      "capabilities": {},
      "product_features": {},
      "enabled_tools": [
        "tools"
      ]
    },
    {
      "slug": "gpt-4-code-interpreter",
      "max_tokens": 8192,
      "title": "Advanced Data Analysis",
      "description": "An experimental model that can solve tasks by generating Python code and executing it in a Jupyter notebook.\nYou can upload any kind of file, and ask model to analyse it, or produce a new file which you can download.",
      "tags": [
        "beta",
        "gpt4"
      ],
      "capabilities": {},
      "product_features": {
        "attachments": {
          "type": "code_interpreter",
          "can_accept_all_mime_types": false
        }
      },
      "enabled_tools": [
        "tools2"
      ]
    },
    {
      "slug": "gpt-4-plugins",
      "max_tokens": 8192,
      "title": "Plugins",
      "description": "An experimental model that knows when and how to use plugins",
      "tags": [
        "beta",
        "gpt4"
      ],
      "capabilities": {},
      "product_features": {},
      "enabled_tools": [
        "tools3"
      ]
    },
    {
      "slug": "gpt-4-dalle",
      "max_tokens": 8192,
      "title": "DALL\u00b7E 3",
      "description": "Try out GPT-4 with DALL\u00b7E 3",
      "tags": [
        "beta",
        "gpt4"
      ],
      "capabilities": {},
      "product_features": {}
    }
  ],
  "categories": [
    {
      "category": "gpt_3.5",
      "human_category_name": "GPT-3.5",
      "subscription_level": "free",
      "default_model": "text-davinci-002-render-sha",
      "code_interpreter_model": "text-davinci-002-render-sha-code-interpreter",
      "plugins_model": "text-davinci-002-render-sha-plugins"
    },
    {
      "category": "gpt_4",
      "human_category_name": "GPT-4",
      "subscription_level": "plus",
      "default_model": "gpt-4",
      "browsing_model": "gpt-4-browsing",
      "code_interpreter_model": "gpt-4-code-interpreter",
      "plugins_model": "gpt-4-plugins",
      "dalle_model": "gpt-4-dalle"
    }
  ]
}
```
