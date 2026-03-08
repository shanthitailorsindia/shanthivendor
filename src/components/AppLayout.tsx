import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  QrCode,
  Package,
  ChevronRight,
  Upload,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import shanthiLogo from "@/assets/shanthi-logo.png";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendors", label: "Vendors", icon: Users },
  { to: "/purchase-bills", label: "Purchase Bills", icon: FileText },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/gst-reports", label: "GST Reports", icon: BarChart3 },
  { to: "/qr-price-tags", label: "QR Price Tags", icon: QrCode },
  { to: "/zoho-import", label: "Zoho Import", icon: Upload },
];

const externalLinks = [
  { href: "https://orderly-sales-view.lovable.app", label: "Sales / GST Report", icon: ExternalLink },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar flex flex-col shrink-0">
        <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
          <img src={shanthiLogo} alt="Shanthi Tailors" className="h-10 w-10 rounded-lg bg-white/10 object-contain" />
          <div>
            <h1 className="text-sm font-bold text-sidebar-primary tracking-wide leading-tight">
              Shanthi Tailors
            </h1>
            <p className="text-[10px] text-sidebar-muted">Purchase Management</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-muted">© 2026 Shanthi Tailors</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
