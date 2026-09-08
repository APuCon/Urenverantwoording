# Projecturen Manager

Complete React/Vite-app voor:

- Projectbeheer
- Medewerkersbeheer
- Urenregistratie met datum, van-tijd en tot-tijd
- Automatische urenberekening
- Factureerbare en niet-factureerbare uren
- Facturatieproces met factuurdatum en factuurreferentie
- Selectietotalen per project en totaal van de volledige facturatieselectie
- Dashboard voor niet-gefactureerde en gefactureerde uren van deze en vorige week
- CSV-export en JSON-back-up
- Lokale browseropslag
- GitHub Actions deployment naar Azure Static Web Apps

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

## GitHub

```bash
git init
git add .
git commit -m "Initial release Projecturen Manager"
git branch -M main
git remote add origin https://github.com/APUCON/projecturen-manager.git
git push -u origin main
```

## Azure Static Web Apps

Koppel de repository en gebruik:

- Branch: `main`
- App location: `/`
- API location: leeg
- Output location: `dist`

Zorg dat GitHub Actions het repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN` bevat.

## Opslagmodel

Deze versie gebruikt `localStorage`. Daardoor zijn gegevens beschikbaar in dezelfde browser op hetzelfde apparaat. Voor gedeeld gebruik door meerdere medewerkers is later een centrale API en database nodig.

## APu Consultancy huisstijl

De interface gebruikt een zakelijke APu-stijl met diep marineblauw, helder blauw, warme oranje accenten, compacte rechthoekige componenten en een APu-woordmerk in de navigatie.

## Logo

Het aangeleverde APu Consultancy-logo staat in `public/apu-consultancy-logo.png` en wordt in de navigatie gebruikt. `public/favicon.png` wordt als browsericoon gebruikt.
