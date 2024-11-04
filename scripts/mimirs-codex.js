// mimirs-codex.js

// Display a console message to confirm the script is loaded
console.log("Mimir's Codex module loaded!");

// Initialization hook that runs when Foundry VTT is ready
Hooks.once('ready', () => {
  console.log("Mimir's Codex is now active!");
  // Add a button to the control bar to open the UI
  let button = $('<button class="mimirs-codex-btn">Mimir\'s Codex</button>');
  button.on('click', () => {
    new MimirsCodexApp().render(true);
  });
  $('#sidebar').prepend(button);
});  


class MimirsCodexApp extends Application {
  constructor(options = {}) {
    super(options);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "mimirs-codex",
      title: "Mimir's Codex",
      template: "modules/mimirs-codex/templates/mimir_ui.html",
      width: 400,
      height: 300,
      resizable: true,
      classes: ["mimirs-codex-app"]
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("#refresh-button").click(this._onRefreshNotes.bind(this));
  }

  _onRefreshNotes() {
    console.log("Notes refreshed!");
    ui.notifications.info("Notes have been refreshed!");
  }
}
