import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) { const session = await requireRole([Role.ADMIN, Role.EDITOR]); return <div className="admin-layout"><AdminSidebar email={session.email} role={session.role} /><main className="admin-main">{children}</main></div>; }
export const dynamic = "force-dynamic";
