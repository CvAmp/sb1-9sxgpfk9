import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import { ImpersonationBar } from './components/ImpersonationBar';
import { Navigation } from './components/Navigation';
import { UserMenu } from './components/UserMenu';
import { Login } from './pages/Login';
import Calendar from './pages/Calendar';
import CreateAppointment from './pages/CreateAppointment';
import { AppointmentDetails } from './pages/AppointmentDetails';
import { CreateAcceleration } from './pages/CreateAcceleration';
import { Accelerations } from './pages/Accelerations';
import { ModifyAccelerations } from './pages/ModifyAccelerations';
import { ModifyAccess } from './pages/ModifyAccess';
import { ModifyAvailability } from './pages/ModifyAvailability';
import { ModifyWorkflows } from './pages/ModifyWorkflows';
import { ModifyTemplates } from './pages/ModifyTemplates';
import { ThemeProvider } from './components/ThemeProvider';
import { ShiftSchedule } from './pages/ShiftSchedule';
import { History } from './pages/History';
import { WorkOrders } from './pages/WorkOrders';
import { TIVStatus } from './pages/TIVStatus';
import { MACDs } from './pages/MACDs';
import { HelpAndFAQ } from './pages/HelpAndFAQ';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={
            <ErrorBoundary>
              <AuthGuard>
                <div className="min-h-screen bg-secondary-bg text-primary-text flex transition-colors duration-200">
                  <Navigation />
                  <main className="flex-1 ml-20 lg:ml-64">
                    <div className="sticky top-0 z-10 bg-primary-bg border-b border-secondary-bg px-6 py-4">
                      <div className="flex items-center justify-between">
                        <ImpersonationBar />
                        <UserMenu />
                      </div>
                    </div>
                    <div className="max-w-7xl mx-auto p-6">
                      <Routes>
                        <Route path="/" element={<Calendar />} />
                        <Route path="/create-appointment" element={<CreateAppointment />} />
                        <Route path="/create-acceleration" element={<CreateAcceleration />} />
                        <Route path="/appointment/:id" element={<AppointmentDetails />} />
                        <Route path="/accelerations" element={<Accelerations />} />
                        <Route path="/modify-accelerations" element={
                          <AuthGuard requireAdmin><ModifyAccelerations /></AuthGuard>
                        } />
                        <Route path="/modify-access" element={
                          <AuthGuard requireAdmin><ModifyAccess /></AuthGuard>
                        } />
                        <Route path="/modify-availability" element={
                          <AuthGuard requireAdmin><ModifyAvailability /></AuthGuard>
                        } />
                        <Route path="/modify-workflows" element={
                          <AuthGuard requireAdmin><ModifyWorkflows /></AuthGuard>
                        } />
                        <Route path="/modify-templates" element={
                          <AuthGuard requireAdmin><ModifyTemplates /></AuthGuard>
                        } />
                        <Route path="/shift-schedule" element={<ShiftSchedule />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/work-orders" element={<WorkOrders />} />
                        <Route path="/tiv-status" element={<TIVStatus />} />
                        <Route path="/macds" element={<MACDs />} />
                        <Route path="/help-and-faq" element={<HelpAndFAQ />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </AuthGuard>
            </ErrorBoundary>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App