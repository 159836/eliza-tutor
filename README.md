# Eliza 英语学习平台

在 Vercel 导入 159836/eliza-tutor，Framework Preset 选择 Other，根目录保持默认，无需构建命令。

设置服务端环境变量 DEEPSEEK_API_KEY 后部署。请使用新建的密钥，历史源码中的旧密钥必须在 DeepSeek 后台作废。

首页为静态学习内容；AI 对话使用 /api/chat 服务端接口。未配置密钥时离线学习仍可使用，AI 会提示配置缺失。
