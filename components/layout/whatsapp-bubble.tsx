import { buildWhatsAppContactUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export function WhatsAppBubble() {
  const href = buildWhatsAppContactUrl();
  if (!href) return null;

  return (
    <a className="whatsapp-bubble" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with Innovative Generator Parts on WhatsApp (opens in a new tab)" title="Chat with us on WhatsApp">
      <WhatsAppIcon />
      <span className="whatsapp-bubble-label">Chat with us</span>
    </a>
  );
}
