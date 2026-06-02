const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/;
const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s-]?)?(?:\d{10}|\d{3}[\s-]\d{3}[\s-]\d{4}|\(\d{3}\)[\s-]?\d{3}[\s-]\d{4})/;

export function validateChatMessage(content: string): { isValid: boolean; reason?: string } {
  if (emailRegex.test(content)) {
    return { isValid: false, reason: "Sharing email addresses is strictly prohibited." };
  }
  
  if (phoneRegex.test(content)) {
    return { isValid: false, reason: "Sharing phone numbers is strictly prohibited." };
  }

  if (urlRegex.test(content)) {
    return { isValid: false, reason: "External links are not allowed in the chat. Please use the Resources tab." };
  }

  return { isValid: true };
}