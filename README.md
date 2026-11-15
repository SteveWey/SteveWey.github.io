# 个人博客

一个自用的个人博客，使用 Astro 构建，部署到 GitHub Pages。

- 仓库：<https://github.com/SteveWey/SteveWey.github.io>
- 线上地址：<https://SteveWey.github.io/>

## 页面

- `/`：主页（主线、主线之外、音乐、摘抄、收藏、笔记）
- `/notes/`：笔记总览（标签筛选）
- `/notes/[slug]/`：笔记详情（Markdown、KaTeX、代码、图片、TOC）
- `/excerpts/`：摘录总览（标签筛选）
- `/excerpts/[slug]/`：摘录详情
- `/collections/`：收藏总览（标签筛选）
- `/music/`：音乐库（标签筛选、歌手/专辑/类型分类、播放器、圆形悬浮窗）
- `/music/[slug]/`：单曲详情

## 内容结构

一个内容 = 一个文件夹。

```text
src/content/
├── notes/
│   └── i2c/
│       ├── index.md
│       └── image/
├── excerpts/
│   └── meihua/
│       └── index.md
├── collections/
│   └── zhai-interview/
│       └── index.md
└── music/
    └── if-love/
        └── index.md
```

源文件是 `index.md`，构建后生成 `dist/.../index.html`。  
Markdown 里的图片用相对路径：

```md
![I2C 连接图](./image/bus.png)
```

## 新增内容

### 笔记

1. 新建 `src/content/notes/<slug>/index.md`；
2. 图片放到同目录 `image/`；
3. 填写 frontmatter：

```yaml
---
title: "标题"
description: "一句简介"
kind: "tech"        # tech | study
date: 2026-11-15
tags: ["嵌入式", "I2C"]
status: "已整理"
---
```

4. 如果它属于某条主线，把 slug 加进 `src/data/threads.ts`。

### 摘录

新建 `src/content/excerpts/<slug>/index.md`：

```yaml
---
title: "标题"
text: "摘录正文"
source: "出处"
tags: ["古诗文"]
status: "已归档"
date: 2026-11-15
order: 1
---
```

### 收藏

新建 `src/content/collections/<slug>/index.md`：

```yaml
---
title: "标题"
type: "访谈 / 演讲"
platform: "Bilibili"
url: "https://..."
people: ["作者"]
tags: ["访谈"]
date: 2026-11-15
status: "已收藏"
---
```

### 音乐

1. 音频放到 `public/audio/<slug>.mp3`；
2. 新建 `src/content/music/<slug>/index.md`：

```yaml
---
title: "曲名"
artist: "作者"
album: "专辑"
genre: "类型"
audio: "/audio/<slug>.mp3"
lyrics: "/lyrics/<slug>.lrc"
duration: "5:03"
tags: ["李健"]
favorite: true
date: 2026-11-15
order: 1
---
```

`favorite: true` 的音乐会出现在首页“我的音乐库”，首页最多显示 2 首。

## 主线

主线配置在 `src/data/threads.ts`：

- 增加：数组加一个对象；
- 删除：数组删一个对象；
- 调整顺序：移动对象。

空主线的 `notes: []` 会显示“待添加”。

## 配色

颜色 token 在 `src/styles/tokens.css`，侧栏提供 5 套预设：赤陶、松墨、靛青、赭石、胭脂。

## 部署

推送到 `main` 后，GitHub Actions 自动构建并发布到 Pages。

- 仓库 Settings → Pages → Source 选择 **GitHub Actions**；
- 项目页会自动使用 `/<repo>/` 作为 base path；
- 用户页仓库（`<user>.github.io`）自动使用 `/`；
- 如需自定义域名，设置 Actions 的 `SITE_URL` 并配置 Pages 域名。

站点默认带 `noindex`，不会主动被搜索引擎收录；但 GitHub Pages 仍是公开托管，不要放敏感内容。

## 音频

原始 FLAC 放在 `music/`，已在 `.gitignore` 中排除。  
网页使用 320 kbps MP3，放在 `public/audio/`，会被提交到仓库。

### 导入音乐

1. 把你合法拥有的音频放进 `music/`，比如 `music/传奇.flac`；
2. 用 ffmpeg 转成网页格式：

```bash
ffmpeg -i "music/传奇.flac" -vn -codec:a libmp3lame -b:a 320k "public/audio/chuanqi.mp3"
```

3. 新建 `src/content/music/chuanqi/index.md`，填写 title、artist、album、genre、audio、duration；
4. 在音乐库页面会自动按歌手、专辑、类型分类。

> 不把第三方平台的受版权保护歌曲直接抓取进仓库。请使用自己购买、下载或拥有授权的声音文件。

### 歌词

歌词文件放到：

```text
public/lyrics/<slug>.lrc
```

然后在单曲 frontmatter 里加：

```yaml
lyrics: "/lyrics/<slug>.lrc"
```

播放器会解析 `[mm:ss.xx]` 时间轴，显示三行：上一句、当前句、下一句，首尾两行做渐变处理。没有歌词文件时不显示歌词区域。
