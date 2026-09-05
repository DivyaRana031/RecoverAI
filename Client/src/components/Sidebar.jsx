import {
  LayoutDashboard,
  CreditCard,
  ShieldCheck,
  Brain,
  FileText,
  LogOut,
  Sparkles,
  ChevronRight,
  Radio,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Transactions",
    icon: CreditCard,
    path: "/transactions",
  },
  {
    label: "Recovery",
    icon: ShieldCheck,
    path: "/recovery",
  },
  {
    label: "AI Decisions",
    icon: Brain,
    path: "/ai-decisions",
  },
  {
    label: "Logs",
    icon: FileText,
    path: "/logs",
  },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white p-5 shrink-0 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      <div>
        {/* Brand Header */}
        <div className="mb-8 flex items-center gap-3 px-2 pt-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Sparkles size={20} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Recover<span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Revenue Recovery
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`transition-colors ${
                          isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {isActive && (
                      <ChevronRight size={15} className="text-indigo-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Logout */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Radio size={13} className="text-emerald-500 animate-pulse" />
              AI Agent Engine
            </span>
            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200">
              ONLINE
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Gateway
            </span>
            <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">
              TEST MODE
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
        >
          <LogOut
            size={18}
            className="text-slate-400 transition-colors group-hover:text-rose-600"
          />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;