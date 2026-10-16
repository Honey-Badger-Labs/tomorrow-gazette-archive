#!/usr/bin/env bash
# Checks every link in the built site, internal and external (A-T4).
#
# Usage: bundle exec jekyll build && tools/check-links.sh [site-dir]
# Needs lychee on PATH: https://github.com/lycheeverse/lychee#installation
set -euo pipefail

site_dir="${1:-_site}"
repo_root="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v lychee >/dev/null; then
  echo "FAIL: lychee is not on PATH. Install it (see the link at the top of this script) and run again." >&2
  exit 1
fi
if [ ! -f "$site_dir/index.html" ]; then
  echo "FAIL: no built site in $site_dir. Run 'bundle exec jekyll build' first." >&2
  exit 1
fi

# Pages serves the site under /<baseurl>/, so internal links start with it.
# Mirror that layout on disk so lychee can resolve them as files.
baseurl="$(sed -n 's/^baseurl: *//p' "$repo_root/_config.yml")"
served_root="$(mktemp -d)"
trap 'rm -rf "$served_root"' EXIT
mkdir -p "$served_root$(dirname "$baseurl")"
cp -r "$site_dir" "$served_root$baseurl"

lychee --config "$repo_root/lychee.toml" --root-dir "$served_root" --no-progress "$served_root"
