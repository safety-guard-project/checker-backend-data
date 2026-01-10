## IdentiSite Assets

This repository automatically generates and distributes filtering data used by the Chrome extension "IdentiSite."

## Update Schedule
Automatically updated every day at 01:00 (UTC) via GitHub Actions.

## What this repo does

- Fetches Tranco Top 1M list (daily)
- Builds Bloom filter whitelist (whitelist.bin)
- Intended for use by a Chrome extension

## What this repo does NOT do

- Does NOT build or distribute psl.mjs
- PSL logic is bundled in the Chrome extension via unpkg.org