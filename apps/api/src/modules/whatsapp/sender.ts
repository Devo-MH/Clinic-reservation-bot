/**
 * WhatsApp Cloud API message sender
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages
 */

export type TextMessage = {
  type: "text";
  to: string;
  body: string;
};

export type ButtonMessage = {
  type: "button";
  to: string;
  body: string;
  buttons: Array<{ id: string; title: string }>;
};

export type ListMessage = {
  type: "list";
  to: string;
  header?: string;
  body: string;
  footer?: string;
  buttonText: string;
  sections: Array<{
    title?: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
};

export type TemplateMessage = {
  type: "template";
  to: string;
  templateName: string;
  languageCode: "ar" | "en_US";
  components?: unknown[];
};

type OutboundMessage = TextMessage | ButtonMessage | ListMessage | TemplateMessage;

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  message: OutboundMessage
): Promise<void> {
  let payload: Record<string, unknown>;

  switch (message.type) {
    case "text":
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.to,
        type: "text",
        text: { body: message.body, preview_url: false },
      };
      break;

    case "button":
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: message.body },
          action: {
            buttons: message.buttons.map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title },
            })),
          },
        },
      };
      break;

    case "list":
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.to,
        type: "interactive",
        interactive: {
          type: "list",
          header: message.header ? { type: "text", text: message.header } : undefined,
          body: { text: message.body },
          footer: message.footer ? { text: message.footer } : undefined,
          action: {
            button: message.buttonText,
            sections: message.sections,
          },
        },
      };
      break;

    case "template":
      payload = {
        messaging_product: "whatsapp",
        to: message.to,
        type: "template",
        template: {
          name: message.templateName,
          language: { code: message.languageCode },
          components: message.components ?? [],
        },
      };
      break;
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }
}
