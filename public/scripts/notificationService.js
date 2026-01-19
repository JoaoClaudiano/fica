import { generateMessage } from "./notifications.js";

export function sendInAppNotification(context) {
  const message = generateMessage(context);

  const container = document.createElement("div");
  container.className = "notification-banner";
  container.setAttribute("role", "alert");

  container.innerText = message;

  document.body.prepend(container);

  setTimeout(() => {
    container.remove();
  }, 6000);
}