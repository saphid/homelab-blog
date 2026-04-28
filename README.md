# Homelab Blog

Verified homelab notes, setup guides, and audit snapshots for home infrastructure experiments.

Live site: https://saphid.github.io/homelab-blog/

## What's here

- System write-ups for a small self-hosted home lab.
- Setup guides for repeatable rebuilds.
- Audit snapshots that separate verified facts from assumptions.
- A small links page for useful infrastructure references.

## Stack

This is a lightweight static site built from Markdown:

- TypeScript build script (`scripts/build-site.ts`)
- Markdown front matter via `gray-matter`
- Markdown rendering via `markdown-it`
- Site metadata in `site.config.ts`
- Posts in `_posts/`

## Development

```bash
pnpm install
pnpm build
pnpm preview
```

The build writes the static site to `dist/`.

## Writing posts

Add posts to `_posts/` using dated filenames:

```text
_posts/YYYY-MM-DD-post-slug.md
```

Front matter should include at least:

```yaml
---
title: "Post title"
date: "2026-04-28"
tags:
  - audit
  - nursedroid
---
```

Useful commands:

```bash
pnpm build
pnpm stage:approved -- /absolute/path/to/draft.md
```

## Verification habit

This repo is public documentation for real infrastructure. Prefer precise, verified notes over aspirational architecture. If a fact came from an audit, include enough context to re-check it later.
