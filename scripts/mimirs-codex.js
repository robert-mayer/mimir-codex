// mimirs-codex.js

// Display a console message to confirm the script is loaded
console.log("Mimir's Codex module loaded!");


//Create Module Settings
Hooks.once("init", () => {
  game.settings.register("mimirs-codex", "apiKey", {
      name: "OpenAI API Key",
      hint: "Enter your OpenAI API key to enable the AI assistant.",
      scope: "world", // Ensures all users in this world share the same API key
      config: true, // Shows this setting in the module configuration UI
      type: "password",
      default: "",
      restricted: true,
      secret: true,
      onChange: value => console.log("API Key updated:", value)
  });
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

      const url = "https://api.openai.com/v1/chat/completions";
      const body = {
          model: "gpt-4o-mini",
          messages: [
              { role: "system", content: "You are a knowledgeable D&D assistant with detailed knowledge of Greyhawk, Ghosts of Saltmarsh, and the custom campaign setting. Answer questions in a way that is consistent with Greyhawk lore and the story arcs of this campaign." },
              { role: "user", content: prompt }
          ],
          max_tokens: 150,
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
            return data.choices[0].message.content.trim();
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

