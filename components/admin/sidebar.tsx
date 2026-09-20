import Link from "next/link";
import { logoutAction } from "@/app/actions";

export function AdminSidebar({ email, role }: { email: string; role: string }) { return <aside className="admin-sidebar"><Link href="/admin" className="admin-brand">IGP <span>ADMIN</span></Link><nav><Link href="/admin">Overview</Link><Link href="/admin/products">Products</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/enquiries">Enquiries</Link></nav><div className="admin-user"><strong>{email}</strong><span>{role.toLowerCase()}</span><form action={logoutAction}><button>Sign out</button></form></div></aside>; }
