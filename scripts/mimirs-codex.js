// mimirs-codex.js

// Display a console message to confirm the script is loaded
console.log("Mimir's Codex module loaded!");

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
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "mimirs-codex",
      title: "Mimir's Codex",
      template: "modules/mimirs-codex/templates/mimir_ui.html",
      width: 400,
      height: 300,
      resizable: false,
      classes: ["mimirs-codex-app"]
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("#refresh-button").click((event) => {
        event.preventDefault(); // Prevent any default action
        this._onRefreshNotes();
        event.currentTarget.blur(); // Remove focus from the button
    });
}


  _onRefreshNotes() {
    console.log("Notes refreshed!");
    ui.notifications.info("Mimir's Codex has been refreshed!");
  }
}

class ChatGPTWindow extends Application {
  static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
          id: "chatgpt-window",
          title: "Mimir's Codex AI Assistant",
          template: "modules/mimirs-codex/templates/chat_window.html",
          width: 500,
          height: 400,
          resizable: true,
          classes: ["chatgpt-window"]
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
          this.addMessageToChat("AI Assistant", response);
      });
  }

  async getAIResponse(prompt) {
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

// Add a button in the Journal sidebar to open the chat window
Hooks.on("renderSidebarTab", (app, html) => {
  if (app instanceof JournalDirectory) {
      let button = $(`<button class="chatgpt-btn action-button theme-light"><i class="fas fa-robot"></i> Mimir's Codex</button>`);
      button.click(() => new ChatGPTWindow().render(true));
      html.find(".directory-footer").append(button);
  }
});
