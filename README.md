# 晋行 2026 · 山西自驾互动手册

4 人共享编辑的山西旅行网页，行程为 8 月 8 日至 12 日，路线覆盖太原和大同。

## 已实现

- D1–D5 行程浏览与完成状态
- 免口令共享数据
- 4 位成员选择
- 旅行清单协作勾选
- 公共费用记录与人均统计
- Cloudflare D1 持久化
- 手机和桌面端响应式布局

## 正式地址

<https://shanxi-four-person-trip.xspike0104.workers.dev>

> `workers.dev` 在部分中国大陆网络可能出现 DNS 污染或访问不稳定。生产部署和 D1 数据库均已创建成功；如需国内网络稳定访问，建议后续绑定自有域名。

## EdgeOne 版本

项目同时包含腾讯 EdgeOne Makers 版本：

- 静态 React 前端构建目录：`edgeone-app`
- EdgeOne API：`edge-functions/api/trip.js`
- 持久化存储：EdgeOne Blob `shanxi-trip-state`
- 构建命令：`pnpm build:edgeone`

由于 EdgeOne 对包含中国大陆加速区域的平台默认域名实行内容合规限制，在没有自有域名时，控制台生成的预览链接有效期为 3 小时。绑定自有域名后可获得长期固定地址。

## 本地开发

需要 Node.js 22.13 或更高版本。

```bash
pnpm install
pnpm dev
```

构建与检查：

```bash
pnpm build
pnpm test
```

## 部署结构

- Web/Server：Cloudflare Workers
- 数据库：Cloudflare D1 `shanxi-trip-db`
- D1 binding：`DB`
- 数据表：`trip_itinerary`、`trip_checklist`、`trip_expenses`
