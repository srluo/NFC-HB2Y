import errors from "@/config/errors.json";

/**
 * 取得錯誤訊息
 * @param {string} code - 錯誤代碼 (例如 "MISSING_UID")
 * @param {string} lang - 語言代碼 ("zh" | "en")
 * @returns {string} - 對應的錯誤訊息
 */
export function getErrorMessage(code, lang = "zh") {
  if (errors[code] && errors[code].message[lang]) {
    return errors[code].message[lang];
  }
  return errors["UNKNOWN_ERROR"].message[lang] || "⚠️ Unknown error";
}