# IdentiSite Assets

This repository automatically generates and distributes filtering data used by the Chrome extension "IdentiSite."

## Distribution Data
- `bloom-filter.bin`: Bloom filter for Tranco's top 1M domains
- `psl-rules.json`: The latest Public Suffix List (PSL)

## Update Schedule
Automatically updated every Sunday at 0:00 (UTC) via GitHub Actions.

## Sources
- [Tranco List](https://tranco-list.eu/)
- [Public Suffix List](https://publicsuffix.org/)
