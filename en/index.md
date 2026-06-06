---
title: Lab Tutorial
description: Lab Tips for working on shared/remote lab servers
layout: page
---

<script setup>
import { data } from '../.vitepress/theme/loaders/en-posts.data.ts'
</script>

<div class="home-container">
  <div class="page-heading">
    <h1>Lab Tutorial</h1>
    <p class="home-description">Short, standalone, hands-on tutorials from working on shared/remote lab servers. Each tutorial is self-contained and ready to apply.</p>
  </div>
  <PostList :posts="data" lang="en" />
</div>
