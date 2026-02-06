import toast from "react-hot-toast";
import React from "react";

/**
 * Shows a custom confirmation toast.
 * @param {string} message - The message to display.
 * @param {Function} onConfirm - Callback function to execute when confirmed.
 * @param {Function} onCancel - Optional callback when cancelled.
 */
/**
 * Triggers the global confirmation modal.
 * @param {string} message - The message to display.
 * @param {Function} onConfirm - Callback function to execute when confirmed.
 * @param {Function} onCancel - Optional callback when cancelled.
 */
export const showConfirmationToast = (message, onConfirm, onCancel) => {
  const event = new CustomEvent("show-confirmation-modal", {
    detail: { message, onConfirm, onCancel },
  });
  window.dispatchEvent(event);
};
