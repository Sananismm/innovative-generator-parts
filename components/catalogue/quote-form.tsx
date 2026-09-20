"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitEnquiryAction, type FormState } from "@/app/actions";

const initialState: FormState = {};
export function QuoteForm({ productName, productId }: { productName?: string; productId?: string }) {
  const [state, action, pending] = useActionState(submitEnquiryAction, initialState);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) form.current?.reset(); }, [state.success]);
  const error = (name: string) => state.fieldErrors?.[name]?.[0];
  return <form ref={form} action={action} className="quote-form" noValidate><input type="hidden" name="productId" value={productId || ""} />
    <div className="form-grid"><Field label="Name" required error={error("name")}><input name="name" autoComplete="name" required maxLength={120} /></Field><Field label="Company" error={error("company")}><input name="company" autoComplete="organization" maxLength={160} /></Field><Field label="Email" required error={error("email")}><input name="email" type="email" autoComplete="email" required maxLength={254} /></Field><Field label="Phone" error={error("phone")}><input name="phone" type="tel" autoComplete="tel" maxLength={40} /></Field>
      <Field label="Product or part required" error={error("productName")} full><input name="productName" defaultValue={productName} maxLength={200} /></Field><Field label="Part number" error={error("partNumber")}><input name="partNumber" maxLength={120} /></Field><Field label="Required quantity" error={error("quantity")}><input name="quantity" type="number" min="1" step="1" /></Field>
      <Field label="Generator brand" error={error("generatorBrand")}><input name="generatorBrand" maxLength={120} /></Field><Field label="Generator model" error={error("generatorModel")}><input name="generatorModel" maxLength={160} /></Field><Field label="Engine manufacturer" error={error("engineManufacturer")}><input name="engineManufacturer" maxLength={120} /></Field><Field label="Serial number" error={error("serialNumber")}><input name="serialNumber" maxLength={160} /></Field>
      <Field label="Message" error={error("message")} full><textarea name="message" rows={5} maxLength={4000} placeholder="Describe the part, issue or application. Include anything that will help identify it." /></Field><Field label="Reference photo or PDF" error={error("attachment")} full><input name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" /><small>JPG, PNG, WebP or PDF up to 5 MB. Uploads are enabled after storage is configured.</small></Field></div>
    <p className="form-privacy">By submitting, you confirm the information is accurate. Do not include payment or other sensitive details.</p>{state.error && <p className="form-message error" role="alert">{state.error}</p>}{state.success && <p className="form-message success" role="status">{state.success}</p>}<button className="button button-primary" type="submit" disabled={pending}>{pending ? "Sending request…" : "Send quote request"} <span aria-hidden="true">↗</span></button>
  </form>;
}
function Field({ label, required, error, full, children }: { label: string; required?: boolean; error?: string; full?: boolean; children: React.ReactNode }) { return <label className={`field ${full ? "field-full" : ""}`}>{label}{required && <span aria-hidden="true"> *</span>}{children && <span className="field-control">{children}</span>}{error && <span className="field-error" role="alert">{error}</span>}</label>; }
