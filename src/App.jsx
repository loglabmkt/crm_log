import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Opportunities from '@/pages/Opportunities';
import Marketing from '@/pages/Marketing';
import Support from '@/pages/Support';
import Reports from '@/pages/Reports';
import SettingsPage from '@/pages/SettingsPage';
import OpportunityDetail from '@/pages/OpportunityDetail';
import Contacts from '@/pages/Contacts';
import Forms from '@/pages/Forms';
import FormEditor from '@/pages/FormEditor';
import FormResults from '@/pages/FormResults';
import PublicFormPage from '@/pages/PublicFormPage';
import TicketDetail from '@/pages/TicketDetail';
import Organizations from '@/pages/Organizations';
import OrganizationDetail from '@/pages/OrganizationDetail';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "linear-gradient(135deg, #FAF8F3 0%, #F0EBE0 100%)", fontFamily: "Inter, sans-serif" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.5px" }}>log.lab.</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#F0C000", letterSpacing: "0.15em", marginBottom: 4 }}>CRM</div>
        <div className="rounded-full" style={{ width: 32, height: 32, border: "3px solid rgba(240,192,0,0.2)", borderTop: "3px solid #F0C000", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 13, color: "#999" }}>Carregando...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
      {/* Public route - no auth */}
      <Route path="/f/:slug" element={<PublicFormPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/forms/new" element={<FormEditor />} />
        <Route path="/forms/:id/edit" element={<FormEditor />} />
        <Route path="/forms/:id/results" element={<FormResults />} />
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