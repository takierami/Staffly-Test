import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireAuth, RequireEmployee, GuestOnly, RequireAdmin, RequireSuperAdmin } from "./components/RouteGuards";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
import { EmployeeDetail } from "./pages/EmployeeDetail";
import { EmployeeForm } from "./pages/EmployeeForm";
import { Attendance } from "./pages/Attendance";
import { Leaves } from "./pages/Leaves";
import { Payroll } from "./pages/Payroll";
import { Performance } from "./pages/Performance";
import { Recruitment } from "./pages/Recruitment";
import { Training } from "./pages/Training";
import { Documents } from "./pages/Documents";
import { Settings } from "./pages/Settings";
import { Promotions } from "./pages/Promotions";
import { Customization } from "./pages/Customization";
import { AdminPrivilege } from "./pages/AdminPrivilege";
import { Login } from "./pages/Login";
import { EmployeePortal } from "./pages/EmployeePortal";

// Public Pages
import { PublicLayout } from "./pages/public/PublicLayout";
import { HomePage } from "./pages/public/HomePage";
import { FeaturesPage } from "./pages/public/FeaturesPage";
import { PricingPage } from "./pages/public/PricingPage";
import { AboutPage } from "./pages/public/AboutPage";
import { ContactPage } from "./pages/public/ContactPage";
import { SecurityPage } from "./pages/public/SecurityPage";
import { HelpPage } from "./pages/public/HelpPage";

// Super Admin Imports
import { SuperAdminLayout } from "./super-admin/layout/SuperAdminLayout";
import { PlatformBI } from "./super-admin/features/analytics/PlatformBI";
import { OrgListView } from "./super-admin/features/organizations/OrgListView";
import { SACreateOrganization } from "./super-admin/pages/SACreateOrganization";
import { OrgDetailView } from "./super-admin/features/organizations/OrgDetailView";
import { GlobalUserSearch } from "./super-admin/features/users/GlobalUserSearch";
import { SASubscriptions } from "./super-admin/pages/SASubscriptions";
import { SecurityCenter } from "./super-admin/features/security/SecurityCenter";
import { PlatformSettings } from "./super-admin/features/infrastructure/PlatformSettings";

export const router = createBrowserRouter([
  // Auth Routes (outside PublicLayout for proper redirect handling)
  {
    Component: GuestOnly,
    children: [
      { path: "/login", Component: Login },
      { path: "/demo", Component: Login },
    ],
  },
  // Public Website Routes
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "features", Component: FeaturesPage },
      { path: "features/:slug", Component: FeaturesPage },
      { path: "pricing", Component: PricingPage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "security", Component: SecurityPage },
      { path: "help", Component: HelpPage },
      { path: "help/:category", Component: HelpPage },
      { path: "help/article/:slug", Component: HelpPage },
      // Placeholder routes (render same components for now)
      { path: "solutions", Component: FeaturesPage },
      { path: "solutions/:slug", Component: FeaturesPage },
      { path: "resources", Component: FeaturesPage },
      { path: "blog", Component: FeaturesPage },
      { path: "case-studies", Component: FeaturesPage },
      { path: "webinars", Component: FeaturesPage },
      { path: "docs", Component: FeaturesPage },
      { path: "careers", Component: AboutPage },
      { path: "press", Component: AboutPage },
      { path: "privacy", Component: ContactPage },
      { path: "terms", Component: ContactPage },
      { path: "cookies", Component: ContactPage },
      { path: "gdpr", Component: ContactPage },
      { path: "integrations", Component: FeaturesPage },
    ],
  },
  {
    Component: RequireEmployee,
    children: [
      { path: "/portal", Component: EmployeePortal },
    ],
  },
  {
    Component: RequireAuth,
    children: [
      {
        path: "/dashboard",
        Component: AppLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "employees", Component: Employees },
          { path: "employees/new", Component: EmployeeForm },
          { path: "employees/:id", Component: EmployeeDetail },
          { path: "attendance", Component: Attendance },
          { path: "leaves", Component: Leaves },
          { path: "payroll", Component: Payroll },
          { path: "performance", Component: Performance },
          { path: "recruitment", Component: Recruitment },
          { path: "training", Component: Training },
          { path: "documents", Component: Documents },
          { path: "promotions", Component: Promotions },
          { path: "customization", Component: Customization },
          { path: "settings", Component: Settings },
          {
            Component: RequireAdmin,
            children: [
              { path: "admin-privilege", Component: AdminPrivilege },
            ],
          },
        ],
      },
    ],
  },
  {
    Component: RequireSuperAdmin,
    children: [
      {
        path: "/super-admin",
        Component: SuperAdminLayout,
        children: [
          { index: true, Component: PlatformBI },
          { path: "organizations", Component: OrgListView },
          { path: "organizations/new", Component: SACreateOrganization },
          { path: "organizations/:id", Component: OrgDetailView },
          { path: "users", Component: GlobalUserSearch },
          { path: "subscriptions", Component: SASubscriptions },
          { path: "activity", Component: SecurityCenter },
          { path: "settings", Component: PlatformSettings },
        ],
      },
    ],
  },
]);
