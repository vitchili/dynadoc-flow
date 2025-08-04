
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/components/LoginPage";
import ProtectedLayout from "@/components/ProtectedLayout";
import DocumentsPage from "@/components/DocumentsPage";
import SettingsPage from "@/components/SettingsPage";
import ProfilePage from "@/components/ProfilePage";
import BatchPage from "@/components/BatchPage";
import FilesPage from "@/components/FilesPage";
import ApiPage from "@/components/ApiPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/documents" replace />} />
            <Route path="/documents" element={
              <ProtectedLayout>
                <DocumentsPage />
              </ProtectedLayout>
            } />
            <Route path="/batch" element={
              <ProtectedLayout>
                <BatchPage />
              </ProtectedLayout>
            } />
            <Route path="/files" element={
              <ProtectedLayout>
                <FilesPage />
              </ProtectedLayout>
            } />
            <Route path="/api" element={
              <ProtectedLayout>
                <ApiPage />
              </ProtectedLayout>
            } />
            <Route path="/settings" element={
              <ProtectedLayout>
                <SettingsPage />
              </ProtectedLayout>
            } />
            <Route path="/profile" element={
              <ProtectedLayout>
                <ProfilePage />
              </ProtectedLayout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
