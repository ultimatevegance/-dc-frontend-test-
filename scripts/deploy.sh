#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Push to GitHub (and optionally deploy to GitHub Pages manually)
#
# NOTE: Once the repo is on GitHub, the CI/CD workflow in
# .github/workflows/ci-cd.yml handles deployment automatically on every push
# to main. Use this script only for the initial push or as a manual fallback.
#
# Usage:
#   ./scripts/deploy.sh              # push + deploy
#   ./scripts/deploy.sh --push-only  # push code only, skip GitHub Pages
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

step()  { echo -e "\n${CYAN}▶ $1${RESET}"; }
ok()    { echo -e "${GREEN}✔ $1${RESET}"; }
warn()  { echo -e "${YELLOW}⚠ $1${RESET}"; }
fail()  { echo -e "${RED}✖ $1${RESET}"; exit 1; }

PUSH_ONLY=false
[[ "${1:-}" == "--push-only" ]] && PUSH_ONLY=true

# ── 1. Prerequisites ─────────────────────────────────────────────────────────
step "Checking prerequisites"

command -v git  >/dev/null 2>&1 || fail "git is not installed."
command -v gh   >/dev/null 2>&1 || fail "GitHub CLI (gh) is not installed. See https://cli.github.com"
command -v pnpm >/dev/null 2>&1 || fail "pnpm is not installed."

gh auth status >/dev/null 2>&1 || fail "Not logged in to GitHub. Run: gh auth login"
ok "All prerequisites met"

# ── 2. Determine repo info ────────────────────────────────────────────────────
REPO_NAME=$(basename "$(pwd)")
GH_USER=$(gh api user --jq '.login')
REPO_FULL="${GH_USER}/${REPO_NAME}"

step "Repository: ${REPO_FULL}"

# ── 3. Git initialise if needed ───────────────────────────────────────────────
step "Setting up git"

if [ ! -d ".git" ]; then
  git init
  git branch -M main
  ok "Initialised new git repository"
else
  ok "Git repository already initialised"
fi

# Stage & commit any uncommitted changes
if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "chore: update project files"
  ok "Committed local changes"
else
  ok "Nothing new to commit"
fi

# ── 4. Create GitHub repo if needed, then push ────────────────────────────────
step "Pushing to GitHub"

if gh repo view "${REPO_FULL}" >/dev/null 2>&1; then
  warn "Repo ${REPO_FULL} already exists — skipping creation"
  # Ensure remote is set
  git remote get-url origin >/dev/null 2>&1 || \
    git remote add origin "https://github.com/${REPO_FULL}.git"
else
  gh repo create "${REPO_NAME}" --public --source=. --remote=origin --push
  ok "Created and pushed ${REPO_FULL}"
fi

git push origin main 2>/dev/null || git push --set-upstream origin main
ok "Code pushed → https://github.com/${REPO_FULL}"

[[ "$PUSH_ONLY" == true ]] && { echo -e "\n${GREEN}Done (push only).${RESET}"; exit 0; }

# ── 5. Build for GitHub Pages ─────────────────────────────────────────────────
step "Building production bundle"

# Vite needs base path set to /<repo-name>/ for GitHub Pages
VITE_BASE="/${REPO_NAME}/" pnpm build
ok "Build complete → dist/"

# ── 6. Deploy dist/ to gh-pages branch ───────────────────────────────────────
step "Deploying to GitHub Pages"

DEPLOY_DIR=$(mktemp -d)
trap 'rm -rf "$DEPLOY_DIR"' EXIT

# Copy build output into a fresh git repo pointing at gh-pages branch
cp -r dist/. "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

git init -q
git checkout -b gh-pages
git add .
git commit -q -m "deploy: $(date -u '+%Y-%m-%d %H:%M UTC')"
git remote add origin "https://github.com/${REPO_FULL}.git"
git push origin gh-pages --force -q

cd - >/dev/null
ok "Deployed to gh-pages branch"

# ── 7. Enable GitHub Pages (idempotent) ───────────────────────────────────────
step "Enabling GitHub Pages"

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO_FULL}/pages" \
  -f "source[branch]=gh-pages" \
  -f "source[path]=/" \
  >/dev/null 2>&1 || true   # silently skip if already enabled

PAGES_URL="https://${GH_USER}.github.io/${REPO_NAME}/"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  Deployment complete!${RESET}"
echo ""
echo -e "  Repository : https://github.com/${REPO_FULL}"
echo -e "  Live URL   : ${PAGES_URL}"
echo -e "  ${YELLOW}(GitHub Pages may take ~30 s to go live on first deploy)${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
