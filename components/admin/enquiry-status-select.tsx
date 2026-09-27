"use client";
import { useState, useTransition } from "react";
import { updateEnquiryStatusAction } from "@/app/actions";
const statuses = ["NEW", "REVIEWING", "RESPONDED", "CLOSED"] as const;
export function EnquiryStatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status); const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition();
  function change(next: string) { const previous = value; setValue(next); setMessage(""); startTransition(async () => { try { const data = new FormData(); data.set("id", id); data.set("status", next); await updateEnquiryStatusAction(data); setMessage("Enquiry status updated"); } catch { setValue(previous); setMessage("Could not update status"); } }); }
  return <span className="enquiry-status-control"><select value={value} onChange={event => change(event.target.value)} disabled={pending} aria-label="Update enquiry status">{statuses.map(item => <option key={item} value={item}>{item.toLowerCase()}</option>)}</select><span role="status" className="sr-only">{pending ? "Updating status" : message}</span></span>;
}
