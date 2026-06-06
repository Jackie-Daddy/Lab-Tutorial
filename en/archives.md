---
title: Archives
layout: page
---

<script setup>
import { data } from '../.vitepress/theme/loaders/en-posts.data.ts'
</script>

<div class="home-container">
  <div class="page-heading">
    <h1>Archives</h1>
  </div>
  <ArchiveList :posts="data" />
</div>
