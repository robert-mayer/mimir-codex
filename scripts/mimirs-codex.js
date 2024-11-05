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
      type: String,
      default: "",
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
          const userInput = html.find("#user-input").val();
          if (userInput.trim() === "") return;

          // Display user's message
          this.addMessageToChat("You", userInput);

          // Clear input field
          html.find("#user-input").val("");

          // Send message to OpenAI and display response
          const response = await this.getAIResponse(userInput);
          this.addMessageToChat("Mimir", response);
      });
  }

  async getAIResponse(prompt) {
      const apiKey = game.settings.get("mimirs-codex", "apiKey");
      if (!apiKey) {
          console.error("API key is not set. Please set it in the module settings.");
          return "API key not set. Please configure the API key in module settings.";
      }
      
      try {
          const response = await fetch("https://api.openai.com/v1/completions", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer YOUR_API_KEY`
              },
              body: JSON.stringify({
                  model: "text-davinci-003",
                  prompt: prompt,
                  max_tokens: 150,
                  temperature: 0.7
              })
          });

          const data = await response.json();
          return data.choices[0].text.trim();
      } catch (error) {
          console.error("Error fetching AI response:", error);
          return "An error occurred while fetching the AI response.";
      }
  }

  addMessageToChat(sender, message) {
      const chatHistory = this.element.find("#chat-history");
      const newMessage = `<p><strong>${sender}:</strong> ${message}</p>`;
      chatHistory.append(newMessage);
      chatHistory.scrollTop(chatHistory[0].scrollHeight); // Scroll to bottom
  }
}

