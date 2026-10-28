export interface RouteDefinition {
  path: string;
  label: string;
  protected: boolean;
}

/** Base path of the "Manage Information Collection" menu group; every sub page lives under it. */
export const INFORMATION_COLLECTION_BASE = "/information-collection";
const ic = (segment: string) => `${INFORMATION_COLLECTION_BASE}/${segment}`;

export const routes: Record<string, RouteDefinition> = {
  login: { path: "/login", label: "Login", protected: false },
  dashboard: { path: "/dashboard", label: "Dashboard", protected: true },
  informationCollection: { path: INFORMATION_COLLECTION_BASE, label: "Manage Information Collection", protected: true },
  createCollection: { path: ic("create-collection"), label: "Create Collection", protected: true },
  manageCollections: { path: ic("manage-collections"), label: "Manage Collections", protected: true },
  validationRules: { path: ic("validation-rules"), label: "Validation Rules", protected: true },
  dedicatedInterface: { path: ic("dedicated-interface"), label: "Dedicated Interface", protected: true },
  institutionLanding: { path: "/portal/collection/:linkName", label: "Dedicated Collection Portal", protected: true },
  myCollections: { path: ic("my-collections"), label: "My Collections", protected: true },
  offlineUpload: { path: ic("offline-upload"), label: "Offline Upload", protected: true },
  verifySubmissions: { path: ic("verify-submissions"), label: "Verify Submissions", protected: true },
  monitoring: { path: ic("monitoring"), label: "Monitoring", protected: true },
  collectedData: { path: ic("collected-data"), label: "Collected Data & Reports", protected: true },
};

/** Old paths (before the menu group) → their current path, so bookmarks and links keep working. */
export const legacyRedirects: { from: string; to: string }[] = [
  { from: INFORMATION_COLLECTION_BASE, to: routes.manageCollections.path },
  { from: "/create-collection", to: routes.createCollection.path },
  { from: ic("create"), to: routes.createCollection.path },
  { from: "/manage-collections", to: routes.manageCollections.path },
  { from: "/validation-rules", to: routes.validationRules.path },
  { from: "/dedicated-interface", to: routes.dedicatedInterface.path },
  { from: "/my-collections", to: routes.myCollections.path },
  { from: "/offline-upload", to: routes.offlineUpload.path },
  { from: "/verify-submissions", to: routes.verifySubmissions.path },
  { from: "/monitoring", to: routes.monitoring.path },
  { from: "/collected-data", to: routes.collectedData.path },
];
