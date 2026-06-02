interface AppConfig {
  name: string;
  supportEmail: string;
  portalUrl: string;
  webUrl: string;
  firstName: string;
  lastName: string;
  managementEmail: string
}

export const appConfig: AppConfig = {
  name: process.env.APP_NAME ?? "Arinova Studio",
  supportEmail: process.env.APP_SUPPORT_EMAIL ?? "support@arinova.studio",
  managementEmail: process.env.APP_MANAGEMENT_EMAIL ?? "management@arinova.studio",
  portalUrl: process.env.APP_PORTAL_URL ?? "https://management.arinova.studio",
  webUrl: process.env.APP_WEB_URL ?? "https://management.arinova.studio",
  firstName: process.env.APP_FIRST_NAME ?? "Arinova",
  lastName: process.env.APP_LAST_NAME ?? "Studio",
};
