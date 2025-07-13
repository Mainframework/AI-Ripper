// preload.js
// Expose only a minimal, secure clipboard API to the renderer

const { contextBridge, clipboard } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Write the given string into the system clipboard.
   * @param {string} text
   */
  copyText: (text) => {
    try {
      clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to write to clipboard in preload:', err);
    }
  },

  /**
   * Read and return the current text contents of the system clipboard.
   * @returns {string}
   */
  readText: () => {
    try {
      return clipboard.readText();
    } catch (err) {
      console.error('Failed to read from clipboard in preload:', err);
      return '';
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  // Preload loaded—no additional bridges needed.
});
