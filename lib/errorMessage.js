export function getErrorMessage(code, lang = "zh") {
  const messages = {
    zh: {
      MISSING_PARAMS: "缺少參數，請重新感應卡片",
      INVALID_TP: "卡片類型錯誤，請確認卡片",
      INVALID_TOKEN: "卡片驗證失敗，請重新感應",
      CARD_NOT_FOUND: "卡片不存在，請確認是否已開卡",
      CARD_ALREADY_ACTIVATED: "卡片已經啟用，不能重複開卡",
      SERVER_ERROR: "伺服器錯誤，請稍後再試",
    },
    en: {
      MISSING_PARAMS: "Missing parameters, please tap card again.",
      INVALID_TP: "Invalid card type.",
      INVALID_TOKEN: "Token verification failed, please try again.",
      CARD_NOT_FOUND: "Card not found.",
      CARD_ALREADY_ACTIVATED: "Card already activated.",
      SERVER_ERROR: "Server error, please try again later.",
    },
  };

  return messages[lang]?.[code] || (lang === "zh" ? "未知錯誤" : "Unknown error");
}