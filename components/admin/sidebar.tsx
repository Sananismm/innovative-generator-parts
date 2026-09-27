import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { db } from "@/lib/db";

export async function AdminSidebar({ email, role }: { email: string; role: string }) { let newCount = 0; try { newCount = await db.enquiry.count({ where: { status: "NEW" } }); } catch { /* Database state is shown by the target page. */ } return <aside className="admin-sidebar"><Link href="/admin" className="admin-brand">IGP <span>ADMIN</span></Link><nav><Link href="/admin">Overview</Link><Link href="/admin/products">Products</Link><Link href="/admin/categories">Categories</Link><Link className="admin-enquiries-link" href="/admin/enquiries">Enquiries{newCount ? <b>{newCount}</b> : null}</Link></nav><Link className="admin-view-site" href="/">View website ↗</Link><div className="admin-user"><strong>{email}</strong><span>{role.toLowerCase()}</span><form action={logoutAction}><button>Sign out</button></form></div></aside>; }
