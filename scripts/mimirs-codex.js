// mimirs-codex.js

// Display a console message to confirm the script is loaded
console.log("Mimir's Codex module loaded!");

import { registerSettings } from "./settings.js";

Hooks.once("init", () => {
  console.log("Mimir's Codex module initialized");
  registerSettings();
});



// Initialization hook that runs when Foundry VTT is ready
Hooks.on("renderSidebarTab", async (app, html) => {
  if (app instanceof JournalDirectory) {
    let button = $("<button class='action-buttons theme-light'><i class='fas fa-book'></i> Mimir's Codex</button>")

    button.click(function () {
      new MimirsCodexApp().render(true);
    });

    // Append the button to the footer of the Journal directory
    html.find(".directory-footer").append(button);
  }
});

class MimirsCodexApp extends Application {
  constructor(options = {}) {
    super(options);
    this.lastResponse = "";

  }
  static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
          id: "mimirs-codex",
          title: "Mimir's Codex AI Assistant",
          template: "modules/mimirs-codex/templates/mimir-chat-window.html",
          width: 500,
          height: 400,
          resizable: true,
          classes: ["mimirs-codex"]
      });
  }

  activateListeners(html) {
      super.activateListeners(html);

      // Event listener for the Send button
      html.find("#send-button").click(async () => {
          await this.sendMessage(html);
      });

        // Event listener for Enter key press
      html.find("#user-input").keydown(async (event) => {
          if (event.key === "Enter") {
              event.preventDefault(); // Prevents a new line
              await this.sendMessage(html);
          }
      });
      
      html.find("#send-to-chat").click(() => {
        if (this.lastResponse) {
          ChatMessage.create({ 
            content: this.lastResponse, 
            speaker: {
              alias: "Mimir",
              avatar: "modules/mimirs-codex/media/mimir-avatar-image.png"
            },
            type: CONST.CHAT_MESSAGE_TYPES.IC,
            
          });
        } else {
          ui.notifications.warn("No response available to send to chat.");
        }
      });

    }

  async sendMessage(html) {
    const userInput = html.find("#user-input").val().trim();
    if (userInput === "") return;

    // Display user's message
    this.addMessageToChat("You", userInput);

    // Clear input field
    html.find("#user-input").val("");

    // Send message to OpenAI and display response
    const response = await this.getAIResponse(userInput);
    this.addMessageToChat("Mimir", response);
    }

  async getAIResponse(prompt) {
      const apiKey = game.settings.get("mimirs-codex", "apiKey");
      if (!apiKey) {
          console.error("API key is not set. Please set it in the module settings.");
          return "API key not set. Please configure the API key in module settings.";
      }

      const expertRole = game.settings.get("mimirs-codex", "expertRole");

      let systemMessage;
      if (expertRole === "loreExpert") {
        systemMessage = "You are a knowledgeable D&D assistant with detailed knowledge of Greyhawk, Ghosts of Saltmarsh, and the custom campaign setting. Answer questions in a way that is consistent with Greyhawk lore and the story arcs of this campaign.";
      } else if (expertRole === "ruleExpert") {
        systemMessage = "You are an expert in D&D 5e rules, mechanics, and interpretations. Answer questions with precise rules clarifications and examples based on the D&D 5e ruleset.";
      }
      

      const url = "https://api.openai.com/v1/chat/completions";
      const body = {
          model: "gpt-4o-mini",
          messages: [
              { role: "system", content: systemMessage },
              { role: "user", content: prompt }
          ],
          max_tokens: 300,
          temperature: 0.5
      };

      try {
          const response = await fetch(url, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${apiKey}`
              },
              body: JSON.stringify(body)
            });

          if (!response.ok) {
              console.error(`Error: ${response.status} - ${response.statusText}`);
              return `Error ${response.status}: ${response.statusText}`;
          }

          const data = await response.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            this.lastResponse = data.choices[0].message.content.trim()
            return this.lastResponse;
          } else {
            console.error("Unexpected response structure:", data);
            return "An error occurred: unexpected response format.";
          }
      } catch (error) {
          console.error("Error fetching AI response:", error);
          return "An error occurred while fetching the AI response.";
      }
  }

  addMessageToChat(sender, message) {
      const chatHistory = this.element.find("#chat-history");
      const messageClass = sender === "You" ? "user-message" : "ai-message";
      const newMessage = `<p class="${messageClass}"><strong>${sender}:</strong> ${message}</p>`;
      chatHistory.append(newMessage);
      chatHistory.scrollTop(chatHistory[0].scrollHeight); // Scroll to bottom
  }
}

