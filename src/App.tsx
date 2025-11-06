import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { TemplateListPage } from "./templates/TemplateListPage";
import { TemplateDetailPage } from "./templates/TemplateDetailPage";
import { TemplateCreatePage } from "./templates/TemplateCreatePage";
import { TestSendPage } from "./pages/TestSendPage";
import { ApprovePage } from "./pages/ApprovePage";
import { MsgRecordPage } from "./pages/MsgRecordPage";
import { useAuth } from "./state/AuthContext";

const App: React.FC = () => {
  const { role } = useAuth();

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/templates" replace />} />
        <Route path="/templates" element={<TemplateListPage />} />
        <Route path="/templates/new" element={<TemplateCreatePage />} />
        <Route path="/templates/:templateId" element={<TemplateDetailPage />} />
        <Route path="/templates/:templateId/test" element={<TestSendPage />} />
        <Route
          path="/test-send"
          element={
            role === "MARKETER" ? <TestSendPage /> : <Navigate to="/templates" />
          }
        />
        <Route
          path="/approve"
          element={
            role === "MANAGER" ? <ApprovePage /> : <Navigate to="/templates" />
          }
        />
        <Route path="/records" element={<MsgRecordPage />} />
        <Route path="*" element={<div className="page">Not Found</div>} />
      </Routes>
    </MainLayout>
  );
};

export default App;
