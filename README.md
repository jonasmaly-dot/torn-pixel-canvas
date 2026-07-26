# Torn Pixel Canvas

Eine Next.js-App für ein dauerhaftes 10000×10000-Pixel-Art. Der Käufer-Key wird nur zur Torn-Identifikation verwendet; Kaufverifikation geschieht ausschließlich mit einem getrennten Admin-Key auf dem Server.

## Lokal starten

1. `cp .env.example .env` und alle Werte setzen (unter PowerShell: `Copy-Item .env.example .env`).
2. `docker compose up -d db`
3. `npm install && npm run db:generate && npm run db:migrate && npm run dev`
4. Start the payment worker in a separate terminal: `npm run worker:payments`. It polls once immediately and then every 60 seconds.

## Produktion und Torn-Konformität

- Ausschließlich HTTPS betreiben und `SESSION_SECRET` sicher generieren.
- Die Loginseite enthält die von Torn geforderte API-Key-Transparenz. Vor Produktivgang die Angaben an die tatsächlich genutzten Felder und Aufbewahrungsfristen anpassen.
- Die offizielle API ist read-only. Der Käufer sendet den Xanax im Spiel; die Anwendung gleicht nur bestätigte, eingehende Admin-Transaktionen ab.
- `fetchAdminIncomingItems` is deliberately an adapter: configure a server-only admin key with the permitted `user/log` selection and map its response to `IncomingItem`. The current Torn v2 `user/log` endpoint requires full access; a restricted custom key should be limited to the necessary incoming-item log type. No buyer key may be stored or reused for this.

## Datenintegrität

The unique `(x,y)` database constraint prevents concurrent purchases. A selection of up to ten pixels becomes one payment batch, which is fulfilled only by an exact matching Xanax amount and the `pixel` message. Each external Torn log ID is saved only once and all matching runs in a serializable database transaction.
