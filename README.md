# APu Projecturen Manager Secure v2

V2 herstelt toevoegen, bewerken en verwijderen voor projecten, medewerkers en urenregistraties. Projecten en medewerkers met gekoppelde uren worden beschermd tegen verwijderen. Gefactureerde urenregels kunnen niet worden verwijderd. Microsoft-login is verplicht voor de volledige app en API. Azure SQL en Power BI zijn opgenomen.

## Deploy
1. Voer database/001-create-schema.sql uit.
2. Configureer SQL_CONNECTION_STRING.
3. Configureer AZURE_STATIC_WEB_APPS_API_TOKEN in GitHub.
4. Push de inhoud naar main.
5. Configureer optioneel VITE_POWER_BI_REPORT_URL.
