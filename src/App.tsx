import {  Route, Routes } from "react-router-dom";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AssessmentsPage } from "./pages/AssessmentPage";
import { OwnerAssessmentPage } from "./pages/OwnerAssessmentPage";
import { AssessmentParticipantsPage } from "./pages/AssessmentParticipantsPage";
import { ParticipantAssessmentPage } from "./pages/ParticipantAssessmentPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { ActionsPage } from "./pages/ActionsPage"
import { ReportPage } from "./pages/ReportPage";
import { GrowthAdvisorPage } from "./pages/GrowthAdvisorPage";
import { BusinessProfilePage } from "./pages/BusinessProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpSupportPage } from "./pages/HelpSupportPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="signup" element={<AuthPage mode="signup" />} />
        <Route path="forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="reset-password" element={<AuthPage mode="reset" />} />
        <Route path="reset-success" element={<AuthPage mode="success" />} />
      </Route>
      <Route
  path="respond/:accessToken"
  element={<ParticipantAssessmentPage />}
/>
     <Route element={<ProtectedRoute />}>
  <Route path="onboarding" element={<OnboardingPage />} />

  <Route element={<DashboardLayout />}>
    <Route path="dashboard" element={<DashboardPage />} />
    <Route
  path="assessments"
  element={<AssessmentsPage />}
/>
<Route
  path="recommendations"
  element={<RecommendationsPage />}
/>

<Route
  path="actions"
  element={<ActionsPage />}
/>

<Route
  path="assessments/:assessmentId/owner"
  element={<OwnerAssessmentPage />}
/>

<Route
  path="assessments/:assessmentId/participants"
  element={<AssessmentParticipantsPage />}
/>
    <Route path="reports" element={<ReportPage />}/>
    <Route path="actions" element={<WorkspacePage page="actions" />} />
    <Route
  path="advisor"
  element={<GrowthAdvisorPage />}
/>
   <Route
  path="profile"
  element={<BusinessProfilePage />}
/>
   <Route
  path="settings"
  element={<SettingsPage />}
/>
    <Route path="help" element={<HelpSupportPage />} />
  </Route>
</Route>
    </Routes>
  );
}
