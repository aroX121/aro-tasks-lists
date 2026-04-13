# 🚀 How to Push Changes & Deploy

Every time you make changes to the app, follow these steps.
Vercel will **automatically redeploy** after every push — no extra steps needed.

---

## ✅ The 3 Commands You Need

Open the terminal in VS Code (`Ctrl + `` ` ``) and run:

```bash
git add .
git commit -m "describe what you changed"
git push
```

That's it! Your live site at **https://aro-tasks-lists.vercel.app/** will update in ~1 minute.

---

## 📝 Good Commit Message Examples

```bash
git commit -m "add dark mode toggle"
git commit -m "fix habit streak bug"
git commit -m "update dashboard layout"
git commit -m "add new finance category"
```

---

## 🔍 Useful Commands

| Command | What it does |
|---|---|
| `git status` | See which files have changed |
| `git add .` | Stage all changed files |
| `git add src/App.jsx` | Stage a specific file only |
| `git commit -m "message"` | Save a snapshot with a description |
| `git push` | Upload to GitHub (triggers Vercel deploy) |
| `git log --oneline` | See past commits |

---

## 🌐 Links

- **Live App:** https://aro-tasks-lists.vercel.app/
- **GitHub Repo:** https://github.com/aroX121/aro-tasks-lists
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 🔒 Files That Are Never Pushed (kept secret)

- `.env.local` — Supabase URL & anon key
- `aro-pass.md` — Database password

> These are listed in `.gitignore` so Git will always ignore them automatically.
> The environment variables are stored securely in Vercel instead.

---

## ⚠️ If You Add New Environment Variables

1. Add the new variable to your `.env.local` file locally
2. Go to **Vercel → Project → Settings → Environment Variables**
3. Add the same variable there too
4. Redeploy (or just push a change) for it to take effect
