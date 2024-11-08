
Hooks.on("renderSettingsConfig", (app, html) => {
    const expertRole = game.settings.get("mimirs-codex", "expertRole");

    const levelOfDetailSetting = html.find(`[name="mimirs-codex.levelOfDetail"]`).closest(".form-group");
    const customContextSetting = html.find(`[name="mimirs-codex.customContext"]`).closest(".form-group")

    if (expertRole !== "combatFlavor") {
        levelOfDetailSetting.find("input, select, textarea").prop("disabled", true);
    } else {
        levelOfDetailSetting.find("input, select, textarea").prop("disabled", false);
    }

    if (expertRole !== "customContext") {
        customContextSetting.find("input, select, textarea").prop("disabled", true);
    } else {
        customContextSetting.find("input, select, textarea").prop("disabled", false);
    }

    html.find(`[name="mimirs-codex.expertRole"]`).on("change", function() {
        const selectedRole = $(this).val();
        if (selectedRole === "combatFlavor") {
            levelOfDetailSetting.find("input, select, textarea").prop("disabled", false);
        } else {
            levelOfDetailSetting.find("input, select, textarea").prop("disabled", true);
        }

        if (selectedRole === "customContext") {
            customContextSetting.find("input, select, textarea").prop("disabled", false);
        } else {
            customContextSetting.find("input, select, textarea").prop("disabled", true);
        }
    });
});

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
            "npcGenerator": "NPC Generator",
            "combatFlavor": "Combat Flavor",
            "customContext": "Custom",
        },
        default: "loreExpert",
        restricted: true
    });

    game.settings.register("mimirs-codex", "levelOfDetail", {
        name: "Level of Detail",
        hint: "Choose how detailed you would like descriptions to be.",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "low": "Concise",
            "medium": "Detailed",
            "high": "Dramatic"
        },
        default: "low",
        restricted: true
    });


    game.settings.register("mimirs-codex", "customContext", {
        name: "Custom Context",
        hint: "Enter a custom prompt context that will be used to guide the AI's responses. This context should provide background or style instructions to better suit your campaign setting.",
        scope: "world",
        config: true,
        type: String,
        default: "",
        restricted: true
    });

    
    game.settings.register("mimirs-codex", "openAIModel", {
        name: "Open AI Model",
        hint: "Choose which OpenAI model to use for Mimir's Codex. This affects response quality, speed, and cost.",
        choices: {
            "gpt-3.5-turbo": "gpt-3.5-turbo",
            "gpt-4": "gpt-4",
            "gpt-4-turbo": "gpt-4-turbo",
            "gpt-4o": "gpt-4o",
            "gpt-4o-mini": "gpt-4o-mini"
        },
        scope: "world",
        config: true,
        type: String,
        default: "gpt-4o-mini",
        restricted: true
    });

}

Hooks.on("renderSettingsConfig", async (app, html) => {
    // Find the setting group that contains your registered model setting
    const openAISetting = html.find(`[name="mimirs-codex.openAIModel"]`).closest('.form-group');

    // Create the HTML content for the model descriptions
    const modelDescriptionsHtml = await renderTemplate("modules/mimirs-codex/templates/gpt-model-descriptions.html");

    // Append the model descriptions after the model setting
    openAISetting.after(modelDescriptionsHtml);
});