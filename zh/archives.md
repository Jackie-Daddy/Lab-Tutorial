---
title: 归档
layout: page
---

<script setup>
import { data } from '../.vitepress/theme/loaders/zh-posts.data.ts'
</script>

<main class="home-container">
  <div class="page-heading">
    <h1>归档</h1>
  </div>
  <ArchiveList :posts="data" />
</main>
