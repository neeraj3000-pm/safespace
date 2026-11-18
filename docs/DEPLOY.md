# Deploy SafeSpace: GitHub → Supabase → Anthropic → Vercel

About 30–40 minutes. You need GitHub, Supabase, Anthropic Console and Vercel accounts (all free to start; Anthropic needs a few dollars of credit).

---

## 1. Get the code onto GitHub

The code currently lives in the Claude Code cloud session, so it has to get to GitHub first.

**Option A: let Claude push it (easiest)**
1. On github.com, click **+ → New repository**.
2. Name it `next-step` and choose **Private**. Leave *Add a README*, *.gitignore* and *license* all **unticked** (it must be empty).
3. Click **Create repository**.
4. Tell Claude: "push to `<your-username>/next-step`". Claude attaches the repo to the session and pushes.

**Option B: push it yourself from the zip**
1. Download `next-step.zip` from the chat and unzip it.
2. Create the empty repo as in Option A, steps 1–3.
3. In a terminal, from inside the unzipped `next-step` folder, run these one at a time:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "SafeSpace prototype"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/<your-username>/next-step.git
```

```bash
git push -u origin main
```

(No terminal? Use **GitHub Desktop**: *File → Add local repository* → pick the folder → *Publish repository*.)

`.env.local` is git-ignored, so secrets never reach GitHub.

---

## 2. Supabase (database)

1. Go to supabase.com → **New project**.
   - Use a **new project**, not one of your other apps.
   - Name: `next-step`. Region: **South Asia (Mumbai)**.
   - Set a database password and save it somewhere safe.
   - Wait about 2 minutes for it to finish setting up.
2. Left sidebar → **SQL Editor** → **New query**.
3. Open `supabase/schema.sql` from the repo, copy all of it, paste it in and click **Run**. You should see "Success. No rows returned".
4. Left sidebar → **Table Editor**. You should see `checkins`, `events`, `feedback`, `matches`, `briefs`, `experts`, `resources` and `history_sessions`.
5. **Project Settings → API Keys**. If you see a **Legacy API keys** tab, use it. Copy these three values:
   - **Project URL** (Project Settings → Data API, or the top of the API page) → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret** key → `SUPABASE_SERVICE_ROLE_KEY`. This one is secret: never paste it anywhere public.
6. *(Optional)* Seed the data tables. The app reads experts and resources from code and generates the insights history itself if the table is empty, so you can skip this. To seed anyway, on your laptop, inside the folder, create `.env.local` with the three values above (format as in `.env.example`), then run:

```bash
npm install
```

```bash
npm run seed
```

---

## 3. Anthropic API key

1. Go to console.anthropic.com → **Settings → Billing** and add credit. $5 is plenty: the app uses Claude Haiku 5.5, which costs well under a cent per journey.
2. Go to **Settings → API Keys** → **Create Key**, name it `next-step` and copy it (it starts with `sk-ant-`) → `ANTHROPIC_API_KEY`.

---

## 4. Vercel (hosting)

1. Go to vercel.com → **Sign up / Log in with GitHub**.
2. Click **Add New… → Project**. Find `next-step` and click **Import**. If it isn't listed, click *Adjust GitHub App Permissions* and give Vercel access to the repo.
3. Framework preset: **Next.js** (auto-detected). Leave the build settings alone.
4. Open **Environment Variables** and add these (name → value):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `ANTHROPIC_API_KEY` | your `sk-ant-…` key |
| `NEXT_PUBLIC_APP_URL` | optional for now; add your Vercel URL after the first deploy |

5. Click **Deploy** and wait about 1–2 minutes. You get a URL like `https://next-step-xyz.vercel.app`.
6. *(Nicer link)* Go to **Settings → Domains** and set something like `safespace-ai.vercel.app`.

Any later change to environment variables: **Deployments → ⋯ on the latest → Redeploy**.
Any later push to `main` deploys automatically.

---

## 5. Check it works (5 minutes)

1. Open `<your-url>/insights`. The grey line at the top should say **storage: supabase**.
2. Run **Riya** on `/start` (demo persona):
   - The *Here's what we understood* screen shows a real sentence ("It sounds like…"), **not** "We couldn't fully understand". That means the AI works.
   - The *Why we matched you* boxes are **mint** (AI-written). Beige means the template fallback.
   - Book → the summary toggle is on, with 3 lines → Confirm → *See what Kavya sees* opens the expert view.
3. Run **Arjun** (Hinglish): the summary should read naturally.
4. Run the **Crisis case**: it must land on *Get help now*.
5. In Supabase **Table Editor**, rows should appear in `checkins`, `events` and `briefs`. There's no column for the free text, by design.
6. Back on `/insights`, the live session count and *AI re-rank vs fallback* now include your runs.
7. *(Optional)* Automated smoke test from your laptop, with all 3 personas at phone and desktop widths:

```bash
BASE=https://<your-url> node scripts/smoke-test.js
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `/insights` says **storage: memory** | `schema.sql` wasn't run, or `SUPABASE_SERVICE_ROLE_KEY` / URL is wrong. Fix it, then **Redeploy**. |
| Every persona says "We couldn't fully understand" and every reason is beige | `ANTHROPIC_API_KEY` is missing or invalid, or the account has no credit. Check **Vercel → Logs**. Redeploy after fixing. |
| Expert view says "This brief isn't available" | Happens only without Supabase (memory mode on serverless). Connect Supabase. |
| Vercel build fails | Open the build log. Usually a typo in an env var name. Names must match exactly. |
