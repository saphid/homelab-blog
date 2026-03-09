import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import MarkdownIt from "markdown-it";

import { site } from "../site.config.ts";

type FrontMatter = {
  layout?: string;
  title?: string;
  date?: string | Date;
  tags?: string[];
};

type Post = {
  title: string;
  date: string;
  formattedDate: string;
  tags: string[];
  slug: string;
  url: string;
  html: string;
  excerpt: string;
};

type SiteTag = {
  tag: string;
  name: string;
  summary: string;
};

type BuildContext = {
  latestAudit?: Post;
  postsByTag: Map<string, Post[]>;
  systems: Array<SiteTag & { posts: Post[]; latest?: Post }>;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const siteRoot = path.join(distDir, site.baseUrl.replace(/^\/+/, ""));
const postsDir = path.join(rootDir, "_posts");
const assetsDir = path.join(rootDir, "assets");
const markdown = new MarkdownIt({ html: true, linkify: true, typographer: true });
const systemTags = site.systems as readonly SiteTag[];
const systemTagSet = new Set(systemTags.map((system) => system.tag));
const workflowTagSet = new Set(site.workflowTags);

function withBase(route: string): string {
  const base = site.baseUrl.replace(/\/$/, "");
  const normalized = route.startsWith("/") ? route : `/${route}`;
  return `${base}${normalized}`.replace(/\/{2,}/g, "/");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function preprocessLiquid(content: string): string {
  return content.replace(
    /\{\{\s*["']([^"']+)["']\s*\|\s*relative_url\s*\}\}/g,
    (_match, relativePath: string) => withBase(relativePath)
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripMarkdown(value: string): string {
  return value
    .replace(/^#+\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function stripLeadingTitleHeading(content: string, title: string): string {
  const match = content.match(/^\s*#\s+(.+?)\s*(?:\n|$)/);
  if (!match) {
    return content;
  }

  if (normalizeTitle(match[1]) !== normalizeTitle(title)) {
    return content;
  }

  return content.slice(match[0].length).replace(/^\s+/, "");
}

function excerptFromMarkdown(content: string): string {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => stripMarkdown(block))
    .filter(Boolean);
  return blocks[0] ?? "";
}

function truncate(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit).replace(/\s+\S*$/, "")}\u2026`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function normalizeDate(value: string | Date | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

function postUrl(slug: string): string {
  return withBase(`/${slug}/`);
}

function formatTagLabel(tag: string): string {
  const system = systemTags.find((candidate) => candidate.tag === tag);
  if (system) {
    return system.name;
  }

  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function groupTags(tags: string[]): { systems: string[]; workflows: string[]; other: string[] } {
  return tags.reduce(
    (groups, tag) => {
      if (systemTagSet.has(tag)) {
        groups.systems.push(tag);
      } else if (workflowTagSet.has(tag)) {
        groups.workflows.push(tag);
      } else {
        groups.other.push(tag);
      }

      return groups;
    },
    { systems: [] as string[], workflows: [] as string[], other: [] as string[] }
  );
}

function renderTagLinks(tags: string[]): string {
  if (tags.length === 0) {
    return "";
  }

  return `
  <div class="meta-links">
    ${tags
      .map(
        (tag) =>
          `<a class="meta-link" href="${withBase(`/tags/#${slugify(tag)}`)}">${escapeHtml(formatTagLabel(tag))}</a>`
      )
      .join("")}
  </div>`;
}

function renderNav(context: BuildContext): string {
  const links = [
    { label: "Home", href: withBase("/") },
    {
      label: "Latest audit",
      href: context.latestAudit?.url ?? withBase("/tags/#audit")
    },
    { label: "Tags", href: withBase("/tags/") },
    { label: "Links", href: withBase("/links.html") }
  ];

  return links
    .map((link) => `<a href="${link.href}" data-nav-link>${escapeHtml(link.label)}</a>`)
    .join("");
}

function pageShell(pageTitle: string, body: string, context: BuildContext): string {
  const title = pageTitle ? `${escapeHtml(pageTitle)} - ${escapeHtml(site.title)}` : escapeHtml(site.title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(site.description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${withBase("/assets/css/style.css")}">
</head>
<body>
  <header class="site-header">
    <div class="container site-header__inner">
      <div class="brand-block">
        <a class="site-title" href="${withBase("/")}">${escapeHtml(site.siteTitle)}</a>
        <p class="site-description">${escapeHtml(site.description)}</p>
      </div>
      <nav class="site-nav" aria-label="Primary">
        ${renderNav(context)}
      </nav>
    </div>
  </header>

  <main class="site-main">
    <div class="container">
      ${body}
    </div>
  </main>

  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p>Verified notes, setup guides, and audit snapshots.</p>
      <p><a href="https://github.com/saphid/homelab-blog">Source</a></p>
    </div>
  </footer>

  <script src="${withBase("/assets/js/site.js")}"></script>
</body>
</html>`;
}

function renderIntro(indexHtml: string, context: BuildContext): string {
  const latestAuditLink = context.latestAudit
    ? `<a href="${context.latestAudit.url}">${escapeHtml(context.latestAudit.title)}</a>`
    : `<a href="${withBase("/tags/#audit")}">Audit posts</a>`;

  return `
<section class="page-intro page-intro--home">
  <div class="page-intro__copy">
    ${indexHtml}
    <p class="intro-note">Start with ${latestAuditLink} if you want the clearest current snapshot before reading the individual system pages.</p>
  </div>
</section>`;
}

function renderSystemDirectory(context: BuildContext): string {
  return `
<section class="rail-section">
  <h2>Systems</h2>
  <div class="directory-list">
    ${context.systems
      .map((system) => {
        const latest = system.latest;
        return `
    <article class="directory-row directory-row--compact">
      <div class="directory-row__main">
        <h3><a href="${latest?.url ?? withBase(`/tags/#${slugify(system.tag)}`)}">${escapeHtml(system.name)}</a></h3>
        <p>${escapeHtml(system.summary)}</p>
      </div>
      <div class="directory-row__meta">
        <span>${escapeHtml(latest?.formattedDate ?? "Unpublished")}</span>
      </div>
    </article>`;
      })
      .join("")}
  </div>
</section>`;
}

function renderHomeRail(context: BuildContext): string {
  const workflowLinks = [...site.workflowTags]
    .filter((tag) => context.postsByTag.has(tag))
    .map(
      (tag) =>
        `<li><a href="${withBase(`/tags/#${slugify(tag)}`)}">${escapeHtml(formatTagLabel(tag))}</a></li>`
    )
    .join("");

  return `
<aside class="home-rail">
  <section class="rail-section">
    <h2>Start here</h2>
    <ul class="plain-list">
      <li><a href="${context.latestAudit?.url ?? withBase("/tags/#audit")}">${escapeHtml(context.latestAudit?.title ?? "Latest audit")}</a></li>
      <li><a href="${withBase("/tags/")}">Browse all tags</a></li>
      <li><a href="${withBase("/links.html")}">Reference links</a></li>
    </ul>
  </section>
  ${renderSystemDirectory(context)}
  <section class="rail-section">
    <h2>Browse by topic</h2>
    <ul class="plain-list">
      ${workflowLinks}
    </ul>
  </section>
</aside>`;
}

function renderArchive(posts: Post[]): string {
  return `
<section class="section-block">
  <div class="section-heading">
    <div>
      <h2>Archive</h2>
      <p>Newest posts first, with system and workflow tags attached.</p>
    </div>
  </div>
  <div class="post-rows">
    ${posts
      .map(
        (post) => `
    <article class="post-row">
      <div class="post-row__main">
        <h3><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
        <p>${escapeHtml(truncate(post.excerpt, 160))}</p>
      </div>
      <div class="post-row__meta">
        <p class="meta-date">${escapeHtml(post.formattedDate)}</p>
        ${renderTagLinks(post.tags)}
      </div>
    </article>`
      )
      .join("")}
  </div>
</section>`;
}

function renderHomePage(indexHtml: string, posts: Post[], context: BuildContext): string {
  return pageShell(
    "Home",
    `<div class="home-layout">
      <div class="home-main">
        ${renderIntro(indexHtml, context)}
        ${renderArchive(posts)}
      </div>
      ${renderHomeRail(context)}
    </div>`,
    context
  );
}

function renderTagRow(tag: string, posts: Post[]): string {
  return `
  <article class="tag-row" id="${slugify(tag)}">
    <div class="tag-row__main">
      <h3>${escapeHtml(formatTagLabel(tag))}</h3>
      <p>${posts.length} ${posts.length === 1 ? "post" : "posts"}</p>
    </div>
    <ul class="compact-list">
      ${posts
        .slice(0, 3)
        .map(
          (post) => `
      <li>
        <a href="${post.url}">${escapeHtml(post.title)}</a>
        <span>${escapeHtml(post.formattedDate)}</span>
      </li>`
        )
        .join("")}
    </ul>
  </article>`;
}

function renderTagGroup(title: string, description: string, tags: string[], postsByTag: Map<string, Post[]>): string {
  if (tags.length === 0) {
    return "";
  }

  return `
<section class="section-block">
  <div class="section-heading">
    <div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(description)}</p>
    </div>
  </div>
  <div class="tag-rows">
    ${tags.map((tag) => renderTagRow(tag, postsByTag.get(tag) ?? [])).join("")}
  </div>
</section>`;
}

function renderTagDirectory(context: BuildContext): string {
  const allTags = [...context.postsByTag.keys()].sort((left, right) => left.localeCompare(right));
  const otherTags = allTags.filter((tag) => !systemTagSet.has(tag) && !workflowTagSet.has(tag));
  const systemTagOrder = systemTags.map((system) => system.tag).filter((tag) => context.postsByTag.has(tag));
  const workflowTagOrder = [...site.workflowTags].filter((tag) => context.postsByTag.has(tag));

  return pageShell(
    "Tags",
    `
<section class="page-intro">
  <div class="page-intro__copy">
    <h1>Tags</h1>
    <p>Use tags to follow either a specific system or a type of work. System tags track hardware and services. Workflow tags separate audits, deployment notes, setup guides, and automation work.</p>
  </div>
</section>
${renderTagGroup("Systems", "Primary infrastructure and surfaces covered by the blog.", systemTagOrder, context.postsByTag)}
${renderTagGroup("Workflows", "How each post fits into the operating and writing process.", workflowTagOrder, context.postsByTag)}
${renderTagGroup("Other tags", "Additional categories that appear in the archive.", otherTags, context.postsByTag)}`,
    context
  );
}

function findRelatedPosts(post: Post, posts: Post[]): Post[] {
  const postTags = new Set(post.tags);

  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.filter((tag) => postTags.has(tag)).length
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.candidate.date.localeCompare(left.candidate.date);
    })
    .slice(0, 3)
    .map((entry) => entry.candidate);
}

function renderPostPage(post: Post, posts: Post[], context: BuildContext): string {
  const groupedTags = groupTags(post.tags);
  const relatedPosts = findRelatedPosts(post, posts);

  return pageShell(
    post.title,
    `
<article class="article-layout">
  <div class="article-main">
    <header class="article-header">
      <p class="meta-date">${escapeHtml(post.formattedDate)}</p>
      <h1>${escapeHtml(post.title)}</h1>
      ${renderTagLinks(post.tags)}
    </header>
    <div class="article-body">
      ${post.html}
    </div>
  </div>
  <aside class="article-aside">
    ${
      groupedTags.systems.length > 0
        ? `<section class="aside-section">
      <h2>Systems</h2>
      ${renderTagLinks(groupedTags.systems)}
    </section>`
        : ""
    }
    ${
      groupedTags.workflows.length > 0
        ? `<section class="aside-section">
      <h2>Workflows</h2>
      ${renderTagLinks(groupedTags.workflows)}
    </section>`
        : ""
    }
    ${
      relatedPosts.length > 0
        ? `<section class="aside-section">
      <h2>Related reading</h2>
      <ul class="compact-list">
        ${relatedPosts
          .map(
            (candidate) => `
        <li>
          <a href="${candidate.url}">${escapeHtml(candidate.title)}</a>
          <span>${escapeHtml(candidate.formattedDate)}</span>
        </li>`
          )
          .join("")}
      </ul>
    </section>`
        : ""
    }
    ${
      context.latestAudit && context.latestAudit.slug !== post.slug
        ? `<section class="aside-section">
      <h2>Audit reference</h2>
      <p><a href="${context.latestAudit.url}">${escapeHtml(context.latestAudit.title)}</a></p>
    </section>`
        : ""
    }
  </aside>
</article>`,
    context
  );
}

async function readFrontMatterFile(filePath: string): Promise<{
  frontMatter: FrontMatter;
  content: string;
}> {
  const raw = await readFile(filePath, "utf8");
  const parsed = matter(raw);

  return {
    frontMatter: parsed.data as FrontMatter,
    content: parsed.content
  };
}

async function loadPosts(): Promise<Post[]> {
  const files = (await readdir(postsDir)).filter((file) => file.endsWith(".md")).sort();
  const posts = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(postsDir, fileName);
      const { frontMatter, content } = await readFrontMatterFile(filePath);
      const slug = fileName.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
      const processedContent = preprocessLiquid(content);
      const title = frontMatter.title ?? slug;
      const bodyContent = stripLeadingTitleHeading(processedContent, title);
      const normalizedDate = normalizeDate(frontMatter.date, fileName.slice(0, 10));

      return {
        title,
        date: normalizedDate,
        formattedDate: formatDate(normalizedDate),
        tags: frontMatter.tags ?? [],
        slug,
        url: postUrl(slug),
        html: markdown.render(bodyContent),
        excerpt: excerptFromMarkdown(bodyContent)
      };
    })
  );

  return posts.sort((left, right) => right.date.localeCompare(left.date));
}

function createContext(posts: Post[]): BuildContext {
  const postsByTag = new Map<string, Post[]>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const existing = postsByTag.get(tag) ?? [];
      existing.push(post);
      postsByTag.set(tag, existing);
    }
  }

  return {
    latestAudit: postsByTag.get("audit")?.[0],
    postsByTag,
    systems: systemTags.map((system) => {
      const taggedPosts = postsByTag.get(system.tag) ?? [];
      return {
        ...system,
        posts: taggedPosts,
        latest: taggedPosts[0]
      };
    })
  };
}

async function writePage(relativeFilePath: string, html: string): Promise<void> {
  const outputPath = path.join(siteRoot, relativeFilePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

async function build(): Promise<void> {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(siteRoot, { recursive: true });
  await cp(assetsDir, path.join(siteRoot, "assets"), { recursive: true });

  const posts = await loadPosts();
  const context = createContext(posts);
  const { content: indexContent } = await readFrontMatterFile(path.join(rootDir, "index.md"));
  const { content: linksContent, frontMatter: linksMatter } = await readFrontMatterFile(path.join(rootDir, "links.html"));

  await writePage("index.html", renderHomePage(markdown.render(preprocessLiquid(indexContent)), posts, context));
  await writePage("links.html", pageShell(linksMatter.title ?? "Links", preprocessLiquid(linksContent), context));
  await writePage(path.join("tags", "index.html"), renderTagDirectory(context));

  for (const post of posts) {
    await writePage(path.join(post.slug, "index.html"), renderPostPage(post, posts, context));
  }
}

await build();
console.log(`Built ${site.title} to ${path.relative(rootDir, siteRoot)}`);
