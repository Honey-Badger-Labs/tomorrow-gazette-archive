#!/usr/bin/env bash
# Everything CI checks, in one command: episode-check tests, episode pages,
# the Jekyll build and every link. Run from anywhere: tools/check.sh
set -euo pipefail
cd "$(dirname "$0")/.."

ruby test/check_episodes_test.rb
ruby tools/check_episodes.rb
bundle exec jekyll build
tools/check-links.sh _site
