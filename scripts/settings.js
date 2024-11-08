


//Create Module Settings
export function registerSettings() {
    game.settings.register("mimirs-codex", "apiKey", {
        name: "OpenAI API Key",
        hint: "Enter your OpenAI API key to enable the AI assistant.",
        scope: "world", // Ensures all users in this world share the same API key
        config: true, // Shows this setting in the module configuration UI
        type: String,
        default: "",
        restricted: true,
        secret: true,
        onChange: value => console.log("API Key updated:", value)
    });
    
    game.settings.register("mimirs-codex", "expertRole", {
        name: "Expert Role",
        hint: "Choose the role for the AI assistant: Lore or Rule Expert.",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "loreExpert": "Lore Expert",
            "ruleExpert": "DnD5e Rule Expert",
            "npcGenerator": "NPC Generator"
        },
        default: "loreExpert",
        restricted: true
    });


    game.settings.register("mimirs-codex", "campaignOverview", {
        name: "Campaign Overview",
        hint: "Future Development. No current functionality.",
        scope: "world",
        config: true,
        type: String,
        default: "",
        restricted: true
    });

}