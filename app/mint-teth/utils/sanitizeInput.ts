/**
 * Sanitizes the deposit input by enforcing specific formatting rules:
 *
 * - If the user presses the decimal point with an empty input, the value is set to "0.".
 * - If the current deposit amount is "0" and the user enters a number between 1-9,
 *   the leading zero is removed.
 * - The input can be an empty string or a valid number format (digits and an optional decimal point).
 * - If the input starts with multiple leading zeros, the current deposit amount is returned unchanged.
 * - If the input is cleared, it returns an empty string.
 * - If the input is a valid number, it returns the input as a string to preserve decimal places.
 * - If none of the conditions are met, the current deposit amount is returned unchanged.
 *
 * @param val - The new value entered by the user.
 * @param currentDepositAmount - The current deposit amount in the input field.
 * @returns The sanitized value is to be set in the input field.
 */
export const sanitizeInput = (val: string, currentDepositAmount: string): string => {
  // If the user presses the decimal point with an empty input, set the value to "0."
  if (val === ".") {
    return "0.";
  }

  // Replace the single leading zero with the number pressed (if it's between 1-9)
  if (currentDepositAmount === "0" && parseInt(val) > 0 && parseInt(val) <= 9) {
    return val.replace("0", "");
  }

  // Allow the input to be an empty string or a valid number format
  if (/^\d*\.?\d*$/.test(val) || val === "") {
    // Check if the value has multiple leading zeros
    if (/^0\d+/.test(val)) {
      return currentDepositAmount; // Do nothing if the value starts with multiple leading zeros
    }

    // If the value is empty, return an empty string
    if (val === "") {
      return ""; // Set to empty string when cleared
    } else {
      // Convert the value to a number for validation
      const numberValue = parseFloat(val);

      // If the value is a valid number, return it
      if (!isNaN(numberValue)) {
        return val; // Keep the value as a string to maintain decimal places
      }
    }
  }

  return currentDepositAmount; // Return the current value if no changes are made
};
