import { buildWhatsAppContactUrl } from "@/lib/whatsapp";

export function WhatsAppBubble() {
  const href = buildWhatsAppContactUrl();
  if (!href) return null;

  return (
    <a className="whatsapp-bubble" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with Innovative Generator Parts on WhatsApp (opens in a new tab)" title="Chat with us on WhatsApp">
      <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M16.03 3C8.86 3 3.04 8.8 3.03 15.97c0 2.29.6 4.52 1.73 6.5L3 29l6.69-1.75a12.94 12.94 0 0 0 6.34 1.62h.01c7.16 0 12.98-5.82 12.98-12.99C29.02 8.78 23.19 3 16.03 3Zm0 23.68h-.01c-2.01 0-3.99-.54-5.71-1.56l-.41-.24-3.97 1.04 1.06-3.87-.27-.42a10.72 10.72 0 0 1-1.64-5.66C5.08 9.94 10 5.02 16.04 5.02c2.92 0 5.67 1.14 7.73 3.21a10.82 10.82 0 0 1-7.74 18.45Zm5.9-8.08c-.32-.16-1.9-.94-2.2-1.05-.29-.1-.5-.16-.71.16-.21.31-.82 1.05-1 1.26-.18.21-.37.23-.68.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.77-2.21-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.1-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54h-.6c-.21 0-.55.08-.84.4s-1.1 1.08-1.1 2.63 1.13 3.05 1.29 3.26c.16.21 2.23 3.41 5.4 4.78.76.33 1.35.52 1.81.66.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.16-1.53.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.6-.37Z" />
      </svg>
      <span className="whatsapp-bubble-label">Chat with us</span>
    </a>
  );
}
