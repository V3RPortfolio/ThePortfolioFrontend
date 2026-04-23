import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css'
import Sidebar from './components/Header/Sidebar';
import { AllRoutes } from './Route';
import TopHeader from './components/Header/TopHeader';

import { loginPath, requireAuth } from './constants';
import httpService from './services/http.service';
import { ToastProvider } from './contexts/toast.context';
import ToastComponent from './components/Modals/Toast';
import { OrganizationProvider } from './contexts/organization.context';



function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? httpService.getAccessToken() : null;
  if (!token && requireAuth) {
    window.location.href = loginPath;
    return null;
  }
  return <>{children}</>;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className='App min-h-screen flex flex-col'>
      <OrganizationProvider>
        {/* Main Layout: Sidebar + Content */}
        <div className='flex flex-1 relative'>
          {/* Mobile overlay backdrop */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <Sidebar
            fixed={false}
            sidebarWidth={'w-[100%] md:w-[20%]'}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content Area */}
          {/* Body - Routes render here */}
          <div className={`py-[var(--padding-md)] flex-1 transition-all duration-300 ${isSidebarOpen ? 'max-w-[100%] md:max-w-[80%]' : 'w-full'}`}>
            <TopHeader
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            />

            <ToastProvider>
              <main className='p-[var(--padding-md)]'>
                <Routes>
                  {AllRoutes().filter(x => !!x.component).map(({ path, component: Component, props }) => (
                    !!Component && <Route
                      key={path}
                      path={path}
                      element={<ProtectedRoute><Component /></ProtectedRoute>}
                      {...props}
                    />
                  ))}
                </Routes>
              </main>
              <ToastComponent />
            </ToastProvider>
          </div>

        </div>
      </OrganizationProvider>
      {/* Footer */}
      <footer>
        {/* Footer content will go here */}
      </footer>
    </div>
  );
}

export default App;
