# 🧠 VokabelTrainer - Active Recall & Spaced Repetition

Ein moderner, interaktiver Vokabeltrainer mit Fokus auf **Active Recall** und wissenschaftlich fundiertem **Spaced Repetition (SM-2 / Leitner-System)**.

- 🌐 **Hosting:** Optimiert für **GitHub Pages** (Client-side Single Page App via Vite & GitHub Actions)
- 🔒 **Authentifizierung:** **Google OAuth Login** via Supabase
- 🗄️ **Datenbank:** **Supabase (PostgreSQL)** mit Row Level Security (RLS)
- 💾 **Offline & Gast-Modus:** Funktioniert auch ohne Login sofort lokal im Browser (LocalStorage)
- 🔊 **Audio:** Native Aussprache (Text-to-Speech) über die Web Speech API

---

## 🚀 Schnellstart (Lokal ausführen)

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```
   Öffne danach [http://localhost:3000](http://localhost:3000) im Browser.

3. **Produktions-Build erstellen:**
   ```bash
   npm run build
   ```

---

## 🗄️ Supabase & Google Login einrichten (in 3 Schritten)

### 1. Supabase Projekt erstellen
1. Erstelle ein kostenloses Konto auf [supabase.com](https://supabase.com) und lege ein neues Projekt an.
2. Gehe im Supabase Dashboard auf **SQL Editor** &rarr; **New query**.
3. Kopiere den Inhalt der Datei [`supabase/schema.sql`](./supabase/schema.sql) hinein und klicke auf **Run**.

### 2. Google OAuth Provider aktivieren
1. Gehe in der Google Cloud Console ([console.cloud.google.com](https://console.cloud.google.com)) auf **APIs & Services** &rarr; **Credentials**.
2. Erstelle eine **OAuth 2.0 Client ID** (Web application).
3. Trage als *Authorized redirect URI* deine Supabase Callback URL ein:
   `https://<DEIN-PROJEKT-ID>.supabase.co/auth/v1/callback`
4. Gehe in deinem Supabase Dashboard auf **Authentication** &rarr; **Providers** &rarr; **Google**, aktiviere den Schalter und trage Client ID & Client Secret ein.
5. Füge unter **Authentication** &rarr; **URL Configuration** die URL deiner GitHub Page (z. B. `https://<username>.github.io/vocabel_trainer/`) zu den **Redirect URLs** hinzu.

### 3. Zugangsdaten in der App hinterlegen
Du kannst die Zugangsdaten auf zwei Wegen einbinden:
- **Option A (In der UI):** Öffne den Vokabeltrainer im Browser, klicke oben rechts auf das ⚙️ Zahnrad und trage deine *Project URL* und den *Anon Key* ein.
- **Option B (Per `.env` Datei):** Kopiere `.env.example` zu `.env` und trage die Werte ein.

---

## 🌐 Auf GitHub Pages veröffentlichen

1. **Repository auf GitHub erstellen & pushen:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<dein-username>/<repo-name>.git
   git push -u origin main
   ```

2. **GitHub Pages in den Repo-Einstellungen aktivieren:**
   - Gehe auf GitHub in dein Repository &rarr; **Settings** &rarr; **Pages**.
   - Wähle unter **Build and deployment** als Source: **GitHub Actions**.

3. **Supabase Secrets hinterlegen (optional):**
   - Gehe zu **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
   - Füge `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` als Repository Secrets hinzu.
   - Bei jedem `git push` auf `main` baut und veröffentlicht der enthaltene Workflow `.github/workflows/deploy.yml` die App automatisch!

---

## 🎯 Active Recall Lernmodi

1. **Karteikarten-Modus (Spaced Repetition):**
   - Frage wird präsentiert &rarr; aktives Abrufen im Kopf/laut.
   - Karte umdrehen & Erinnerungsqualität (Nochmal, Schwer, Gut, Einfach) bewerten.
   - Der SM-2 Algorithmus berechnet den nächsten optimalen Wiederholungstag.

2. **Tipp-Modus (Aktives Schreiben):**
   - Das gesuchte Wort muss exakt eingetippt werden.
   - Automatische Toleranz bei kleinen Tippfehlern und Akzenten.
   - Sofortiges visuelles Feedback und Aussprache-Audio.

3. **CSV & JSON Import/Export:**
   - Schneller Import eigener Vokabellisten per Copy & Paste oder CSV-Upload.
