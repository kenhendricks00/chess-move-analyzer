document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load preferences
    const result = await browser.storage.local.get([
      "playerColor",
      "autoAnalyzeEnabled",
    ]);

    // Set color toggle
    const colorToggle = document.getElementById("colorToggle");
    const colorOptions = colorToggle.querySelectorAll(".color-option");

    if (result.playerColor) {
      colorToggle.dataset.selected = result.playerColor;
      colorOptions.forEach((option) => {
        option.classList.toggle(
          "selected",
          option.dataset.color === result.playerColor
        );
      });
    }

    // Set button state
    const analyzeButton = document.getElementById("analyze");
    analyzeButton.classList.toggle(
      "active",
      result.autoAnalyzeEnabled || false
    );
    analyzeButton.textContent = result.autoAnalyzeEnabled
      ? "Auto Analyze: ON"
      : "Auto Analyze: OFF";

    // Color toggle click handler
    colorToggle.addEventListener("click", async (event) => {
      const newColor =
        colorToggle.dataset.selected === "white" ? "black" : "white";
      colorToggle.dataset.selected = newColor;

      colorOptions.forEach((option) => {
        option.classList.toggle("selected", option.dataset.color === newColor);
      });

      await browser.storage.local.set({ playerColor: newColor });
      console.log("Color preference saved:", newColor);

      // If auto-analyze is enabled, restart with new color
      const state = await browser.storage.local.get("autoAnalyzeEnabled");
      if (state.autoAnalyzeEnabled) {
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        await browser.tabs.sendMessage(tabs[0].id, {
          action: "colorChanged",
          color: newColor,
        });
      }
    });
  } catch (error) {
    console.error("Error loading preferences:", error);
  }
});

document.getElementById("analyze").addEventListener("click", async () => {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];

    // Toggle auto-analyze state
    const result = await browser.storage.local.get("autoAnalyzeEnabled");
    const newState = !result.autoAnalyzeEnabled;
    await browser.storage.local.set({ autoAnalyzeEnabled: newState });

    // Update button appearance
    const button = document.getElementById("analyze");
    button.classList.toggle("active", newState);
    button.textContent = newState ? "Auto Analyze: ON" : "Auto Analyze: OFF";

    // Notify content script
    await browser.tabs.sendMessage(activeTab.id, {
      action: "toggleAutoAnalyze",
      enabled: newState,
    });
  } catch (error) {
    console.error("Error:", error);
  }
});
