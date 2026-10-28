import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { legacyRedirects, routes } from "./routeConfig";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import MainLayout from "@/shared/components/layout/MainLayout";
import PublicRoute from "./PublicRoute";

const Login = lazy(() => import("@/features/auth/pages/Login"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const CreateCollection = lazy(() => import("@/features/create-collection/pages/CreateCollection"));
const ManageCollections = lazy(() => import("@/features/manage-collections/pages/ManageCollections"));
const ConfigureValidationRules = lazy(() => import("@/features/validation-rules/pages/ConfigureValidationRules"));
const ConfigureDedicatedInterface = lazy(() => import("@/features/dedicated-interface/pages/ConfigureDedicatedInterface"));
const InstitutionLandingPage = lazy(() => import("@/features/dedicated-interface/pages/InstitutionLandingPage"));
const MyCollections = lazy(() => import("@/features/my-collections/pages/MyCollections"));
const OfflineUpload = lazy(() => import("@/features/offline-upload/pages/OfflineUpload"));
const VerifySubmissions = lazy(() => import("@/features/verify-submissions/pages/VerifySubmissions"));
const CollectionMonitoring = lazy(() => import("@/features/collection-monitoring/pages/CollectionMonitoring"));
const CollectedDataReports = lazy(() => import("@/features/collected-data/pages/CollectedDataReports"));

/** Sends an old path to its new one, keeping the query string (e.g. ?collectionId=). */
const LegacyRedirect = ({ to }: { to: string }) => {
  const { search, hash } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace />;
};

const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      void navigate(customEvent.detail);
    };
    window.addEventListener("auth-redirect", handleAuthRedirect);
    return () =>
      window.removeEventListener("auth-redirect", handleAuthRedirect);
  }, [navigate]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-300 h-16 w-16 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-64 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-40" />
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to={routes.login.path} replace />} />

        {/* Public Authentication Route */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={routes.login.path} element={<Login />} />
          </Route>
        </Route>

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={routes.dashboard.path} element={<Dashboard />} />

            {/* Manage Information Collection */}
            <Route path={routes.createCollection.path} element={<CreateCollection />} />
            <Route path={routes.manageCollections.path} element={<ManageCollections />} />
            <Route path={routes.validationRules.path} element={<ConfigureValidationRules />} />
            <Route path={routes.dedicatedInterface.path} element={<ConfigureDedicatedInterface />} />
            <Route path={routes.myCollections.path} element={<MyCollections />} />
            <Route path={routes.offlineUpload.path} element={<OfflineUpload />} />
            <Route path={routes.verifySubmissions.path} element={<VerifySubmissions />} />
            <Route path={routes.monitoring.path} element={<CollectionMonitoring />} />
            <Route path={routes.collectedData.path} element={<CollectedDataReports />} />

            <Route path={routes.institutionLanding.path} element={<InstitutionLandingPage />} />

            {/* Old paths → new ones */}
            {legacyRedirects.map(({ from, to }) => (
              <Route key={from} path={from} element={<LegacyRedirect to={to} />} />
            ))}

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to={routes.dashboard.path} replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
