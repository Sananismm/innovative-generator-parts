import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EnquiryStatusSelect } from "@/components/admin/enquiry-status-select";

const dateTime = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const enquiry = await db.enquiry.findUnique({ where: { id }, include: { attachments: true } }); if (!enquiry) notFound();
  const fields = [["Company", enquiry.company], ["Email", enquiry.email], ["Phone", enquiry.phone], ["Product", enquiry.productName], ["Part number", enquiry.partNumber], ["Generator", [enquiry.generatorBrand, enquiry.generatorModel].filter(Boolean).join(" ") || null], ["Engine manufacturer", enquiry.engineManufacturer], ["Serial number", enquiry.serialNumber], ["Quantity", enquiry.quantity?.toString()]];
  return <section className="enquiry-detail"><Link href="/admin/enquiries" className="text-link">← All enquiries</Link><header className="admin-page-heading"><p className="eyebrow">Customer enquiry</p><h1>{enquiry.name}</h1><p>Received {dateTime.format(enquiry.createdAt)}</p></header><div className="enquiry-detail-grid"><section><h2>Contact and request</h2><dl>{fields.filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === "Email" ? <a href={`mailto:${value}`}>{value}</a> : label === "Phone" ? <a href={`tel:${value}`}>{value}</a> : value}</dd></div>)}</dl>{enquiry.message && <><h2>Message</h2><p className="enquiry-message">{enquiry.message}</p></>}{enquiry.attachments.length > 0 && <><h2>Attachments</h2>{enquiry.attachments.map(file => <a className="attachment" target="_blank" rel="noopener noreferrer" href={file.url} key={file.id}>{file.filename}</a>)}</>}</section><aside><h2>Status</h2><span className={`enquiry-badge enquiry-${enquiry.status.toLowerCase()}`}>{enquiry.status.toLowerCase()}</span><EnquiryStatusSelect id={enquiry.id} status={enquiry.status} /><h2>Activity</h2><p>Enquiry received<br /><strong>{dateTime.format(enquiry.createdAt)}</strong></p><p>Last updated<br /><strong>{dateTime.format(enquiry.updatedAt)}</strong></p><small>Enquiry ID: {enquiry.id}</small></aside></div></section>;
}
