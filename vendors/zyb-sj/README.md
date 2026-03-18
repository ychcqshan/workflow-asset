外部供应商集成：zyb-sj（Claude Sonnet 4-6，Anthropic 框架）
- 目标：通过指定的 baseURL 将 Claude Sonnet 4-6 模型接入到现有 AI SDK 中
- 认证方式：通过环境变量注入 apiKey，避免写入代码库
- 需要的环境变量
  - AI_BASE_URL：代理服务基地址，默认值已在配置中提供
  - AI_API_KEY：API Key，必填
- 集成步骤要点
  1) 将以下配置文件加入到你的供应商配置目录：
     vendors/zyb-sj/config.js
  2) 确保部署环境变量 AI_BASE_URL、AI_API_KEY 已正确设置
  3) 在应用初始化阶段，读取该配置并通过你的 AI SDK 加载供应商
- 安全注意
  - 不要将 AI_API_KEY 写入源码、commit 或日志
  - 生产环境建议使用更安全的密钥管理方案
- 测试建议
  - 本地测试：以 AI_BASE_URL、AI_API_KEY 的测试值启动，确保请求头正常构造
  - 集成测试：通过代理发起一次简单请求，校验响应结构
