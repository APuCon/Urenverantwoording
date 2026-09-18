# Beveiligde APu Projecturen Manager

De volledige site en `/api/*` vereisen de Azure Static Web Apps-rol `authenticated`. Niet-ingelogde bezoekers worden doorgestuurd naar Microsoft Entra ID via `/.auth/login/aad`. GitHub-login is geblokkeerd. De app toont de ingelogde gebruiker en bevat een uitlogknop.

Voor uitsluitend accounts uit één Microsoft Entra-tenant configureert u in Azure Static Web Apps een custom Microsoft Entra ID-provider. De standaardprovider laat Microsoft-accounts authenticeren; de routebeveiliging bepaalt vervolgens dat alleen geauthenticeerde gebruikers de app zien.

## Deploy
Configureer `AZURE_STATIC_WEB_APPS_API_TOKEN`, `SQL_CONNECTION_STRING` en optioneel `VITE_POWER_BI_REPORT_URL`.
