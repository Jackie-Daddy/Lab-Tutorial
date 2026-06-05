---
title: Archives
layout: page
---

<script setup>
import { data } from '../.vitepress/theme/loaders/en-posts.data.ts'
</script>

<div class="page-heading">
  <h1>Archives</h1>
</div>

<ArchiveList :posts="data" />
