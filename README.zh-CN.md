# Topic Navigator

<p align="center">
  <a href="./README.md">English</a>
  &nbsp;·&nbsp;
  <strong>简体中文</strong>
</p>

在 ChatGPT、Gemini、Claude、Onyx（含自建）等对话页面上，提供**按轮次导航**的侧边时间轴：快速跳转用户/助手消息、查看大纲列表并搜索轮次，并可通过扩展弹窗自定义胶囊轨道与时间点的配色。

---

## 功能概览

### 对话轮次导航

- **右侧时间轴（胶囊轨道）**：按对话顺序生成可滚动的时间点；当前可见轮次会高亮对应节点。
- **悬停提示**：鼠标悬停在时间点上可预览该轮摘要。
- **点击跳转**：点击某一节点，页面会滚动到对应用户或助手消息位置。
- **列表面板**：点击时间轴旁的浮动按钮，打开侧栏「会话大纲」面板。
- **搜索**：在面板内按关键词筛选轮次（过滤大纲文案）。

### 外观与语言

- **工具栏弹窗**：点击浏览器工具栏中的扩展图标，可调整轨道宽度、底色与描边、时间点形状（实心/空心/描边强调）、未选中与选中状态的配色与透明度等；设置保存在 `chrome.storage.sync`，会同步到已打开的同类标签页。
- **恢复默认**：弹窗内可一键清除自定义主题，回到扩展内置默认样式。
- **界面语言**：支持 English / 中文 / Français，以及「自动（跟随系统）」。语言偏好可在弹窗或选项页中设置。

### 自托管 Onyx（可选）

- 扩展对官方 Onyx 域名已内置匹配；若你在自有域名部署 Onyx，需在 **选项页** 中按 [Chrome 匹配模式](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns) 填写 URL 模式（每行一条），保存后浏览器会请求对应主机权限，并在这些 URL 上注入与本扩展相同的内容脚本。

---

## 支持的站点（内置）

内容脚本在以下模式匹配下运行（见 `manifest.json`）：

| 平台 | 说明 |
|------|------|
| ChatGPT | `chatgpt.com`、`chat.openai.com` |
| Gemini | `gemini.google.com`、`business.gemini.google` |
| Google AI Studio | `aistudio.google.com`、`aistudio.google.cn` |
| Claude | `claude.ai` |
| Onyx（云） | `cloud.onyx.app` |

其他 Onyx 实例通过 **选项页** 添加自定义匹配模式；扩展使用 `optional_host_permissions`（`*://*/*`）以便按需授权。

---

## 安装（从源码加载）

1. 克隆本仓库，在项目根目录执行：
   ```bash
   npm install
   npm run build
   ```
2. 打开 Chrome（或基于 Chromium 的浏览器），进入 `chrome://extensions`。
3. 开启「开发者模式」，点击「加载已解压的扩展程序」，选择仓库中的 **`dist`** 目录（不是项目根目录）。
4. 打开上述任一支持的聊天页面，刷新后即可看到右侧导航 UI。

开发时可单独监听内容脚本构建：

```bash
npm run dev
```

随后仍可对 `dist` 重新执行完整 `npm run build` 以生成弹窗、后台与选项页。

---

## 使用说明

1. **首次使用**：进入支持的对话页面；若页面结构变更导致无法识别，可能需要等待扩展更新适配。
2. **调整样式**：点击扩展图标 → 修改滑块与颜色 → 点击 **保存并应用**；已打开的标签页会通过存储变更自动应用新样式。
3. **自托管 Onyx**：右键扩展 → **选项**（或弹窗内入口）→ 填写 Onyx 页面的 URL 匹配模式 → 保存并授予权限。
4. **配色预设槽位（可选功能）**：代码中保留了最多 3 个配色槽位与内置默认的载入/保存逻辑；当前弹窗中该区块默认 **不展示**。若需再次启用，可在 `popup.html` 中将 `#presetSection` 的 `display: none` 改为 `display: grid`（参见文件内注释）。

---

## 权限说明

| 权限 | 用途 |
|------|------|
| `storage` | 保存界面语言、外观与 Onyx 匹配列表（`chrome.storage.sync`）。 |
| `scripting` | 根据选项页配置动态注册/注销自定义主机上的内容脚本。 |
| 主机权限 | 仅在已匹配的聊天域名（及用户授权的自定义模式）上注入脚本与读取页面结构以构建轮次索引；不向第三方服务器上传对话内容。 |

---

## 开发与测试

```bash
npm run build   # TypeScript 检查 + 打包 content / background / popup / options
npm run test    # Vitest 单元测试
```

---

## 开源许可

本仓库以 **[MIT License](./LICENSE)** 发布。

**为何选用 MIT（相对 Apache-2.0）**

- **MIT**：条文简短，常见要求仅为保留版权声明与许可全文；适合个人或小团队发布的浏览器扩展，与社区惯例一致，使用者易于理解与合规。
- **Apache-2.0**：同样宽松，但额外包含**明确的专利授权**条款，正文更长；若项目涉及多方专利贡献或企业合规明确要求 Apache，可考虑迁移。

若你希望改为 Apache-2.0，只需替换根目录 `LICENSE` 并在本 README 中更新许可章节即可。
