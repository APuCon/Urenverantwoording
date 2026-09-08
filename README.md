# Projecturen Manager

Complete React/Vite-app voor projectbeheer, medewerkersbeheer en urenregistratie per medewerker, datum en van/tot-tijd.

## Lokaal starten

```bash
npm install
npm run dev
```

## Productiebuild

```bash
npm run build
npm run preview
```

## Publiceren op GitHub

1. Maak een lege repository, bijvoorbeeld `projecturen-manager`.
2. Pak deze ZIP uit.
3. Open een terminal in de uitgepakte map.
4. Voer uit:

```bash
git init
git add .
git commit -m "Initial release Projecturen Manager"
git branch -M main
git remote add origin https://github.com/APUCON/projecturen-manager.git
git push -u origin main
```

## Publiceren op Azure Static Web Apps

Maak in Azure een Static Web App en koppel repository `APUCON/projecturen-manager`, branch `main`.

Gebruik:

- App location: `/`
- API location: leeg
- Output location: `dist`

Azure moet in GitHub een repository secret met naam `AZURE_STATIC_WEB_APPS_API_TOKEN` plaatsen. De meegeleverde workflow gebruikt dit secret.

## Opslag

Deze versie bewaart projecten en uren in de lokale browseropslag. Dit is geschikt voor een single-user demonstratie. Voor centraal multi-usergebruik is een API en database nodig.

## Medewerkersbeheer

Medewerkers kunnen worden aangemaakt, gewijzigd, actief/inactief gezet en verwijderd wanneer er geen urenboekingen aan gekoppeld zijn. Bij uren schrijven wordt een medewerker gekozen uit de medewerkerslijst.

## Facturatieproces

Selecteer openstaande factureerbare uren onder Facturatie, leg factuurdatum en optioneel factuurreferentie vast en markeer de selectie als gefactureerd. Het dashboard toont open en gefactureerde uren voor deze en vorige week.
