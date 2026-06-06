---
title: Lab Tutorial
description: 一些小技巧 · Lab Tips
layout: page
---

<script setup>
import { data } from '../.vitepress/theme/loaders/zh-posts.data.ts'
</script>

<div class="home-container">
  <div class="page-heading">
    <h1>Lab Tutorial</h1>
    <p class="home-description">在共享/远程实验室服务器上干活时攒下的小技巧，每篇都是独立、可直接上手的短教程。</p>
  </div>
  <PostList :posts="data" lang="zh" />
</div>
