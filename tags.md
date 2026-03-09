---
layout: default
title: Tags
permalink: /tags/
---

<section class="page-intro">
  <div class="page-intro__copy">
    <h1>Tags</h1>
    <p>Use tags to follow either a specific system or a type of work. System tags track hardware and services. Workflow tags separate audits, deployment notes, setup guides, and automation work.</p>
  </div>
</section>

<section class="section-block">
  <div class="section-heading">
    <div>
      <h2>Archive by tag</h2>
      <p>Every post should be reachable through a system or workflow tag.</p>
    </div>
  </div>
  <div class="tag-rows">
    {% assign sorted_tags = site.tags | sort %}
    {% for tag in sorted_tags %}
    <article class="tag-row" id="{{ tag[0] | slugify }}">
      <div class="tag-row__main">
        <h3>{{ tag[0] }}</h3>
        <p>{{ tag[1].size }} posts</p>
      </div>
      <ul class="compact-list">
        {% assign posts = tag[1] | sort: 'date' | reverse %}
        {% for post in posts limit:3 %}
        <li>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          <span>{{ post.date | date: "%b %-d, %Y" }}</span>
        </li>
        {% endfor %}
      </ul>
    </article>
    {% endfor %}
  </div>
</section>
