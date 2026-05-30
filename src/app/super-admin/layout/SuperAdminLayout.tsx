import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Command } from "cmdk";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";

export function SuperAdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCommand, setOpenCommand] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/super-admin", icon: LayoutDashboard },
    { name: "Organizations", path: "/super-admin/organizations", icon: Building2 },
    { name: "All Users", path: "/super-admin/users", icon: Users },
    { name: "Subscriptions", path: "/super-admin/subscriptions", icon: CreditCard },
    { name: "Activity Log", path: "/super-admin/activity", icon: Activity },
    { name: "Settings", path: "/super-admin/settings", icon: Settings },
  ];

  // Breadcrumbs generation
  const pathnames = location.pathname.split('/').filter(x => x);
  const breadcrumbs = pathnames.map((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const name = value.charAt(0).toUpperCase() + value.slice(1);
    return { name, to };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-slate-800 p-4 flex flex-col transition-all duration-300 relative bg-slate-950 z-10`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-slate-800 rounded-full p-1 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="mb-8 flex items-center overflow-hidden h-10 px-2">
          {!isCollapsed ? (
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Staffly<span className="text-blue-500">Platform</span></h1>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Super Admin</div>
            </div>
          ) : (
            <div className="font-bold text-xl tracking-tighter w-full text-center">
              S<span className="text-blue-500">P</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 space-y-1 overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/super-admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!isCollapsed && <span className="ml-3 font-medium text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="pt-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className={`w-full flex items-center px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut size={20} className="shrink-0 text-red-400/70 group-hover:text-red-400" />
            {!isCollapsed && <span className="ml-3 font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-900/50">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.to} className="flex items-center">
                {index > 0 && <ChevronRight size={14} className="mx-2 text-slate-600" />}
                <Link to={crumb.to} className={`hover:text-white transition-colors ${index === breadcrumbs.length - 1 ? 'text-slate-200 font-medium' : ''}`}>
                  {crumb.name.replace('-', ' ')}
                </Link>
              </div>
            ))}
            {breadcrumbs.length === 0 && <span className="text-slate-200 font-medium">Dashboard</span>}
          </div>

          {/* Search Trigger */}
          <button 
            onClick={() => setOpenCommand(true)}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <Search size={16} />
            <span>Search Platform...</span>
            <kbd className="ml-2 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-xs font-mono text-slate-300">
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Cmd+K Palette using native cmdk with some Tailwind styling logic. Note: cmdk needs its own CSS or classes, we will style inline as much as possible */}
      <Command.Dialog 
        open={openCommand} 
        onOpenChange={setOpenCommand} 
        label="Global Command Menu"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 text-slate-200"
      >
        <div className="flex items-center border-b border-slate-800 px-3">
          <Search size={18} className="text-slate-500 mr-2 shrink-0" />
          <Command.Input 
            placeholder="Search users, organizations, or settings..." 
            className="w-full bg-transparent border-none outline-none focus:ring-0 py-4 text-sm placeholder:text-slate-500" 
          />
        </div>
        
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-slate-500">No results found.</Command.Empty>
          
          <Command.Group heading="Quick Links" className="text-xs font-medium text-slate-500 px-2 py-2">
            <Command.Item 
              onSelect={() => { navigate('/super-admin/organizations'); setOpenCommand(false); }}
              className="flex items-center px-2 py-2 mt-1 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white"
            >
              <Building2 size={16} className="mr-2 text-slate-400" />
              Manage Organizations
            </Command.Item>
            <Command.Item 
              onSelect={() => { navigate('/super-admin/users'); setOpenCommand(false); }}
              className="flex items-center px-2 py-2 mt-1 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white"
            >
              <Users size={16} className="mr-2 text-slate-400" />
              Search Users
            </Command.Item>
            <Command.Item 
              onSelect={() => { navigate('/super-admin/settings'); setOpenCommand(false); }}
              className="flex items-center px-2 py-2 mt-1 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white"
            >
              <Settings size={16} className="mr-2 text-slate-400" />
              Platform Settings
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
      
      {/* Overlay for Cmd+K Dialog (cmdk handles its own focus trap but we need a backdrop) */}
      {openCommand && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setOpenCommand(false)} />
      )}
    </div>
  );
}
