import errors from "@/config/errors.json";

/**
 * React Hook：用於取得錯誤訊息
 * @param {string} lang - 預設語言 ("zh" | "en")
 * @returns {function} - getErrorMessage(code) 函式
 */
export function useErrorMessage(lang = "zh") {
  function getErrorMessage(code) {
    if (errors[code] && errors[code].message[lang]) {
      return errors[code].message[lang];
    }
    return errors["UNKNOWN_ERROR"].message[lang] || "⚠️ Unknown error";
  }

  return { getErrorMessage };
}