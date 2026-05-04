import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Sales from '@/pages/Sales';
import Marketing from '@/pages/Marketing';
import Support from '@/pages/Support';
import Reports from '@/pages/Reports';
import SettingsPage from '@/pages/SettingsPage';
import OpportunityDetail from '@/pages/OpportunityDetail';
import TicketDetail from '@/pages/TicketDetail';
import Organizations from '@/pages/Organizations';
import OrganizationDetail from '@/pages/OrganizationDetail';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FAF8F3 0%, #F0EBE0 100%)" }}>
        <div className="flex flex-col items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69f8ee9615d3f5128d9c0f57/8fcc0078f_fb3797ffe_logotipo_loglab.png"
            alt="Log Lab"
            className="h-10 w-auto object-contain"
          />
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }}></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/:id" element={<OpportunityDetail />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/support" element={<Support />} />
        <Route path="/support/:id" element={<TicketDetail />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:id" element={<OrganizationDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App