# AOP平台 V1 — 行政运营管理平台

> Admin Operations Platform · 完整可交互原型

## 📋 项目概述

AOP（行政运营平台）是一个统一的行政工作管理平台，核心数据模型为 **Work Item（工作事项）**，所有页面均为该单一数据模型的不同投影视图。

### 设计原则

- **Single Source of Truth** — 统一数据源，消除多系统信息孤岛
- **Minimal Input / Max Output** — 最小输入，最大输出
- **Push Over Pull** — 推送优于拉取
- **Type-Driven Templates** — 类型驱动模板
- **Role-Based Views** — 基于角色的视图
- **Linear-Style Aesthetics** — Linear 风格极简美学

## 🚀 快速体验

**👉 打开 [aop-full.html](aop-full.html) 即可体验完整平台！**

单文件包含所有 10 个面板，支持导航切换、事项详情滑出面板、周会演示模式等完整交互。

## 📄 页面清单

| 序号 | 页面 | 单独文件 | 说明 |
|:---:|------|------|------|
| 01 | 信息架构与导航 | [01-ia-navigation.html](01-ia-navigation.html) | IA 设计规范、数据模型、权限模型、路由定义 |
| 02 | 我的工作 | [02-my-work.html](02-my-work.html) | 员工首页/默认落地页，填写周更新 |
| 03 | 事项详情 | — | 右侧滑出面板（嵌入 aop-full.html 中） |
| 04 | 行政总览 | [04-admin-overview.html](04-admin-overview.html) | 按业务模块聚合的全量管理视图 |
| 05 | 重点专项 | [05-key-projects.html](05-key-projects.html) | 项目类型事项筛选，甘特图/时间线/列表 |
| 06 | 运营仪表盘 | [06-ops-dashboard.html](06-ops-dashboard.html) | 管理层运营健康度概览 |
| 07 | 周会视图 | [07-weekly-meeting.html](07-weekly-meeting.html) | 按人聚合的周会展示视图，含 PPT 模式 |
| 08 | 周报 | [08-weekly-report.html](08-weekly-report.html) | AI 自动生成的周报文档，支持导出 |
| 09 | 数据驾驶舱 | [09-data-cockpit.html](09-data-cockpit.html) | KPI 仪表盘（预算、差旅、满意度等） |
| 10 | OKR | [10-okr.html](10-okr.html) | 目标与关键结果管理（唯一手动导入数据） |

## 🧭 侧边栏导航结构

```
AOP · Beta
行政运营管理平台
▼ 行政部
├── 个人
│   ├── 🏠 我的工作 [3]
│   └── 🎯 OKR 手动导入
├── 管理
│   ├── 📋 行政总览
│   ├── ⭐ 重点专项
│   ├── 📊 运营看板
│   ├── 👥 周会视图
│   └── 📝 周报
├── 分析
│   └── 📈 数据驾驶舱
└── 业务模块
    ├── 职场运营 (北京/武汉/异地)
    ├── 文化运营 (活动/福利)
    └── 数字化运营 (服务台/后台)
```

## 🎨 技术特点

- **纯 HTML + CSS 原型** — 无第三方依赖，单文件即可运行
- **CSS 变量系统** — 统一色彩/间距/圆角设计令牌
- **Linear 风格 UI** — 极简、留白、精致的信息密度控制
- **内嵌数据集** — JS 数据驱动渲染，演示真实数据效果
- **完整交互** — 导航切换、甘特图/时间线切换、事项详情滑出、周会PPT演示模式

## 🔗 完整版 vs 单页版

| 特性 | aop-full.html | 单独 HTML 文件 |
|------|:---:|:---:|
| 一键打开全部功能 | ✅ | ❌ 需逐页切换 |
| 侧边栏导航跳转 | ✅ | ❌ 仅超链接 |
| 事项详情滑出面板 | ✅ | 仅 03 页面 |
| 周会 PPT 演示模式 | ✅ | 仅 07 页面 |
| 数据联动 | ✅ 共享数据 | ❌ 各页独立 |

---

*V1 版本 · 2026.07*
