// ============================================================
// FieldMap data — AI Agent Runtime (核心分歧)
// 复用 fieldMap.ts 中的类型定义
// ============================================================

import type { FieldMap } from './fieldMap';

const aiAgentRuntimeFieldMap: FieldMap = {
  field: 'AI Agent Runtime — 核心分歧',
  overview:
    'AI agent runtime 指代驱动 LLM agent 执行的运行时系统:负责把模型输出翻译成动作、管理 context/memory、协调 tool calls、处理多步循环、提供沙箱与权限。2023-2024 是 framework 战国(LangChain、AutoGPT、CrewAI 群雄混战),2025 是深层结构性 debate 浮出水面的一年(multi-agent 是否成立、code 还是 tool、memory 怎么做),2026 Q1-Q2 进入第一波明显的收敛 — Cognition 与 Anthropic 在 multi-agent 上各退一步并同向 orchestrator-worker 模式靠拢;MCP 转交 Linux Foundation 后协议层胜负基本定(97M monthly downloads);Anthropic Managed Agents (Apr 8) 与 OpenAI Agents SDK (Apr 15) 七天内独立向"control plane + execution plane"分裂收敛;Temporal $5B 估值证明 durable execution 在 AI 时代仍是基础设施层。剩下的活分歧多在协议层缺陷(MCP 安全)、状态架构(长 context vs memory middleware)、与商业模式(hosted vs SDK vs framework)。',
  lastUpdated: '2026-05-28',
  regions: [
    {
      id: 'code-vs-tools',
      title: '代码即动作 vs. 结构化工具调用',
      thesis:
        'agent runtime 把模型输出翻译成动作有两种范式。Code-as-Action 派让模型生成 Python,runtime 保证沙箱安全;Tool-calling 派暴露类型化 JSON schema,模型选其一调用。CodeAct (Wang et al.) 给出量化证据(+20% 成功率, -30% 步数),但生产 stack 仍以 tool calling 为主 — 这不是技术问题,是 schema 可审计性与 model 厂商优化方向共同决定的生态平衡。',
      intuitions: [
        { id: 'code-vs-tools-1', text: 'CodeAct 论文显示:代码生成动作比 JSON tool call 成功率高约 20%,完成同样任务平均少 30% 步数。理由是 composability(调任意 library)、control flow(loop/cond/var)与一次代码内串联多步的 efficiency。', type: 'fact', sources: [0, 1] },
        { id: 'code-vs-tools-2', text: 'Smolagents (HuggingFace) 文档原话:"primarily focuses on CodeAgents because they perform better overall",但同时提供 ToolCallingAgent 备选 — 承认在简单系统里 JSON 仍然合用。', type: 'fact', sources: [1, 2] },
        { id: 'code-vs-tools-3', text: 'Claude Code、Cursor 等主流生产 agent 采用 hybrid 策略:tool-first,但 Bash 是其中一个 tool — 把 code 当作 escape hatch 而非主要形态。', type: 'fact', sources: [3] },
        { id: 'code-vs-tools-4', text: 'Tool calling 在生产里赢的原因不是表达力,而是 schema 可审计+模型厂商 priority 都在 JSON 那边 — function calling 是 OpenAI/Anthropic native 的 first-class output mode,prompt cache、tool-format 优化都为它配套。', type: 'opinion', sources: [3, 4] },
        { id: 'code-vs-tools-5', text: '代码派的天然代价是沙箱要求更高:安全执行 LLM 生成的 Python 需要 microVM/container 隔离(E2B、Modal 等);而 JSON tool call 不需要执行任意代码,只需要 dispatch。这是 R5(控制面/执行面分裂)的驱动因素之一。', type: 'opinion', sources: [4] }
      ],
      pros: [
        '代码派:表达力上限高;一段代码内 loop/cond/data passing 比 N 次 JSON tool call 高效',
        '代码派:已有 quantitative evidence(CodeAct +20% success, -30% steps)',
        '工具派:schema 可静态分析,易审计、易限权、易并发',
        '工具派:与 model 厂商 prompt cache、tool format 优化原生兼容'
      ],
      cons: [
        '代码派:沙箱要求高,运行任意 LLM 生成代码是 attack surface',
        '代码派:模型厂商训练数据偏 JSON tool call,生成 Python 的 quality 与 JSON 的相对优势不稳定',
        '工具派:N 步 tool call 序列在 LLM 多步规划上比一段代码慢且更易出错'
      ],
      articles: [
        { title: 'Executable Code Actions Elicit Better LLM Agents (CodeAct)', url: 'https://arxiv.org/abs/2402.01030', relevance: 'Code-as-action 范式的实验基础', tier: 'primary' },
        { title: 'CodeAgents + Structure: A Better Way to Execute Actions — HuggingFace Blog', url: 'https://huggingface.co/blog/structured-codeagent', relevance: 'Smolagents 团队的 code-first 设计哲学', tier: 'primary' },
        { title: 'Writing actions as code snippets or JSON blobs — HuggingFace agents course', url: 'https://huggingface.co/learn/agents-course/en/unit2/smolagents/tool_calling_agents', relevance: '两种范式的并列对比与适用边界', tier: 'supporting' },
        { title: 'Agentic Coding Tools Compared (2026)', url: 'https://www.requesty.ai/blog/agentic-coding-tools-compared-2026-claude-code-cursor-codex-aider', relevance: '生产 agent 的工具调用范式现状', tier: 'supporting' },
        { title: 'AI Coding Harness Comparison 2026', url: 'https://thoughts.jock.pl/p/ai-coding-harness-agents-2026', relevance: '生产 stack 倾向 JSON tool call 的体感证据', tier: 'supporting' }
      ]
    },
    {
      id: 'workflow-vs-agent',
      title: 'Workflow vs. Agent — 控制权之争',
      thesis:
        'Anthropic 2024-12 的"Building Effective Agents"(Schluntz + Zhang)给出了行业最被广泛引用的二分法:workflow 是 "LLM and tools orchestrated through predefined code paths",agent 是 "LLM dynamically directs its own processes and tool usage"。这个区分变成了一个 framework — 不是选 single 或 multi,是在 workflow + agent 的组合里选。arxiv 2604.14228 对 Claude Code 的解构进一步说明:即使是 open loop 派,价值也在循环外的支撑系统。',
      intuitions: [
        { id: 'workflow-vs-agent-1', text: 'Anthropic 列出 5 个 workflow pattern:prompt chaining、routing、parallelization、orchestrator-workers、evaluator-optimizer。这些都是"predefined code paths"的具体形态。', type: 'fact', sources: [0] },
        { id: 'workflow-vs-agent-2', text: 'Anthropic 自己的指引(verbatim):"workflows offer predictability and consistency for well-defined tasks, whereas agents are the better option when flexibility and model-driven decision-making are needed at scale" — 不是非此即彼,是工具箱。', type: 'fact', sources: [0, 1] },
        { id: 'workflow-vs-agent-3', text: 'LangGraph、Temporal AI、Inngest、Restate 是 DAG/workflow 派代表;Claude Code、AutoGPT 谱系是开放 agent loop 派 — 这条轴向上的选择高度依赖任务确定性。', type: 'opinion', sources: [2] },
        { id: 'workflow-vs-agent-4', text: 'arxiv 2604.14228 "Dive into Claude Code" 总结:核心是 "simple while-loop that calls model, runs tools, repeats — but most of the code lives in the systems around this loop"。换言之 open-loop 派的胜负不在 loop 本身,而在 permission、context compaction、subagent isolation 这些循环外系统。', type: 'fact', sources: [3] },
        { id: 'workflow-vs-agent-5', text: 'Patrick McGuinness 评论:"Single Agent versus Multi-Agent is a False Dichotomy",并扩展到 workflow 与 agent — agent 能力来自 context 质量,不来自 control 形态。', type: 'opinion', sources: [4] }
      ],
      pros: [
        'Workflow:任务确定时给出确定性、可观测性、可重试边界',
        'Workflow:与 durable execution 平台天然 fit',
        'Agent:灵活性,适合 task 边界模糊或动态分支',
        'Agent:能利用模型的判断力做开放探索'
      ],
      cons: [
        'Workflow:任务边界变化时改 code,适应慢',
        'Agent:可预测性差,需要更强的 observability 和 fallback',
        '两者过早二选一导致系统僵硬 — Anthropic 自己强调"组合使用"'
      ],
      articles: [
        { title: 'Building Effective Agents — Anthropic', url: 'https://www.anthropic.com/engineering/building-effective-agents', relevance: '行业最被引用的 workflow vs agent 框架', tier: 'primary' },
        { title: "Simon Willison's notes on Building Effective Agents", url: 'https://simonwillison.net/2024/Dec/20/building-effective-agents/', relevance: 'Anthropic 文章的独立摘要与评论', tier: 'supporting' },
        { title: 'Durable Execution: The Key to Harnessing AI Agents in Production — Inngest', url: 'https://www.inngest.com/blog/durable-execution-key-to-harnessing-ai-agents', relevance: 'workflow 派对 agent 失败模式的反驳', tier: 'supporting' },
        { title: 'Dive into Claude Code: The Design Space of Today and Future AI Agent Systems', url: 'https://arxiv.org/abs/2604.14228', relevance: 'open-loop 派的核心是循环外的支撑系统', tier: 'primary' },
        { title: 'The AI Agent Architecture Debate — Patrick McGuinness', url: 'https://patmcguinness.substack.com/p/the-ai-agent-architecture-debate', relevance: '反对二分法的中立视角', tier: 'counterpoint' }
      ]
    },
    {
      id: 'context-vs-memory',
      title: 'Context Window vs. Memory Subsystem — 状态架构之争',
      thesis:
        '长上下文模型(Opus 4.7 1M、GPT-5 200K+)让一种立场成为可能:状态就是 context window 加上 compaction。另一派认为这远远不够 — 需要外置 memory 子系统(向量、图、时序图)。LongMemEval (ICLR 2025) 把这个分歧变成了可量化的争论:长 context LLM 在 sustained interaction 上有 30% accuracy drop。但与此同时,1M context flat-rate pricing 又在吃掉 memory middleware 在 <500K tokens 区间的底层市场。Anthropic 自己的长任务 harness 也用外置 memory artifacts — frontier 厂商也不全靠 context。',
      intuitions: [
        { id: 'context-vs-memory-1', text: 'MemGPT/Letta 的三层架构(OS analogy):Core Memory(in-context, RAM-like)、Recall Memory(history disk cache)、Archival Memory(vector store cold storage);agent 通过 tool call 主动 paging,不被动累积。', type: 'fact', sources: [0, 1] },
        { id: 'context-vs-memory-2', text: 'Mem0 是 bolt-on memory layer:hybrid storage(vector + graph + key-value),data model 是 fact-centric 而非 raw logs,每次 add 都跑一次 LLM 做 fact extraction;Pro tier $249/mo 加 graph 层。', type: 'fact', sources: [1, 2] },
        { id: 'context-vs-memory-3', text: 'Zep/Graphiti 的核心是 temporal knowledge graph — "fact validity windows":"我以前住伦敦,现在住东京"存为两个 state + transition,不是两条并存 fact;LongMemEval 上 63.8% vs Mem0 49.0% (GPT-4o)。', type: 'fact', sources: [3] },
        { id: 'context-vs-memory-4', text: 'LongMemEval (ICLR 2025) 测 5 个能力:information extraction、multi-session reasoning、temporal reasoning、knowledge updates、abstention;500 个 curated 问题,structurally require >1M tokens,使长 context "stuff in" 在结构上无效。', type: 'fact', sources: [4] },
        { id: 'context-vs-memory-5', text: 'LongMemEval 的 headline finding(verbatim):"commercial chat assistants and long-context LLMs showing a 30% accuracy drop on memorizing information across sustained interactions"。这是 memory middleware 阵营的核心证据。', type: 'fact', sources: [4] },
        { id: 'context-vs-memory-6', text: 'Anthropic 自己的长任务 harness 用外置 memory artifacts(claude-progress.txt、git history、feature files),并显式说"compaction isn\'t sufficient" — frontier model 厂商自己在多 session 场景下也不全靠 context。', type: 'fact', sources: [5] },
        { id: 'context-vs-memory-7', text: '反方证据:1M-token context flat pricing 让 stuff-in-context 在 <500K tokens 累积历史区间比 Mem0+Pinecone stack 还便宜 — 长 context 正在吃掉 memory category 的底部市场。', type: 'opinion', sources: [6] },
        { id: 'context-vs-memory-8', text: '经济性论据:在 100k context 假设下,memory 系统在大约 10 turn 后比 stuff-in-context 便宜;context length 越大,门槛 turn 数越低 — middleware 不是"会不会被取代",而是"在哪个 turn 临界点上有优势"。', type: 'opinion', sources: [7] }
      ],
      pros: [
        'Memory 派:多 session、多日运行场景下,benchmark 与经济性都支持',
        'Memory 派:Anthropic、OpenAI 都在自己的 long-running harness 里用外置 artifact',
        'Context 派:小规模 history 下零基础设施成本',
        'Context 派:开发者心智模型简单,无需理解额外的 memory abstraction'
      ],
      cons: [
        'Memory 派:增加一层中间件,调试和 latency 都更复杂',
        'Memory 派:与 model 厂商内部的 cache 优化潜在冲突',
        'Context 派:LongMemEval 显示在 sustained interaction 上有结构性失败',
        'Context 派:大 history 下 token 经济性差,且 compaction 容易丢关键信息'
      ],
      articles: [
        { title: 'MemGPT: Towards LLMs as Operating Systems', url: 'https://arxiv.org/abs/2310.08560', relevance: 'OS-inspired 三层 memory 架构的原始论文', tier: 'primary' },
        { title: 'Mem0 vs Letta (MemGPT) Comparison — Vectorize', url: 'https://vectorize.io/articles/mem0-vs-letta', relevance: '两派架构的对照阅读', tier: 'supporting' },
        { title: 'AI Agent Memory Comparison 2026 — Mem0 vs Zep vs Letta vs Cognee', url: 'https://explore.n1n.ai/blog/ai-agent-memory-comparison-2026-mem0-zep-letta-cognee-2026-04-23', relevance: '四家 memory 架构与 data model 对比', tier: 'supporting' },
        { title: 'Agent Memory at Scale 2026 — Letta/Zep/Mem0/LangMem', url: 'https://agentmarketcap.ai/blog/2026/04/10/agent-memory-vendor-landscape-2026-letta-zep-mem0-langmem', relevance: 'vendor landscape 与 benchmark 数据', tier: 'supporting' },
        { title: 'LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory (ICLR 2025)', url: 'https://arxiv.org/abs/2410.10813', relevance: '长 context 30% drop 的实验依据', tier: 'primary' },
        { title: 'Effective harnesses for long-running agents — Anthropic', url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents', relevance: '即 frontier 厂商也承认 compaction 不足', tier: 'counterpoint' },
        { title: 'AI Agent Memory: Vector, Graph, Episodic 2026', url: 'https://www.digitalapplied.com/blog/ai-agent-memory-vector-graph-episodic-2026', relevance: '长 context 吃掉 middleware 底部市场的对立论据', tier: 'counterpoint' },
        { title: 'State of AI Agent Memory 2026 — Mem0', url: 'https://mem0.ai/blog/state-of-ai-agent-memory-2026', relevance: 'memory vendor 自己的生存与定位论述', tier: 'primary' }
      ]
    },
    {
      id: 'single-vs-multi-agent',
      title: '单 captain vs. 多 agent peer — 协调论之争(已收敛)',
      thesis:
        '2025-06 一周内 Cognition (Walden Yan) 与 Anthropic 公开对喷,2026-04 Cognition 自己发文修正立场 — 这是 agent runtime 领域最有名的一场公开 debate,它的解决方式很有信息量。行业收敛到"严格 orchestrator-worker"模式(read-leaning subagent as tool-call-style delegation),抛弃了平权多 agent 写协作。Anthropic Agent SDK 2026-03 重命名后,subagent 设计与 Cognition 修正后的立场实质一致。',
      intuitions: [
        { id: 'single-vs-multi-agent-1', text: 'Walden Yan "Don\'t Build Multi-Agents" (cognition.ai, 2025-06-12) 给出两条原则(verbatim):"Share context, and share full agent traces, not just individual messages" 与 "Actions carry implicit decisions, and conflicting decisions carry bad results"。', type: 'fact', sources: [0] },
        { id: 'single-vs-multi-agent-2', text: '"Flappy Bird" 例子:任务被分给画背景与画鸟两个 subagent,subagent 1 误把"绿色管道背景"理解成 Mario 风格,最终合并失败 — context 分区导致 implicit decision 冲突。', type: 'fact', sources: [0] },
        { id: 'single-vs-multi-agent-3', text: 'Anthropic "How we built our multi-agent research system" (2025-06-13,次日)报告:Opus 4 lead + Sonnet 4 subagents 比 single-agent Opus 4 在内部 research eval 上高 90.2%;但同文承认 multi-agent 用 token 量约为 chat 的 15x。', type: 'fact', sources: [1] },
        { id: 'single-vs-multi-agent-4', text: 'Anthropic 同篇 verbatim:"domains that require all agents to share the same context or involve many dependencies between agents are not a good fit for multi-agent systems today. For instance, most coding tasks involve fewer truly parallelizable tasks than research" — Anthropic 主动承认 Cognition 的主场。', type: 'fact', sources: [1] },
        { id: 'single-vs-multi-agent-5', text: 'Cognition "Multi-Agents: What\'s Actually Working" (2026-04-22) 自我修正(verbatim):"10 months ago, I wrote Don\'t Build Multi-Agents... A lot has changed since then";新立场"setups where multiple agents contribute intelligence to a task while writes stay single-threaded";manager Devin 通过 internal MCP 协调 child Devins。', type: 'fact', sources: [2] },
        { id: 'single-vs-multi-agent-6', text: 'Anthropic Agent SDK (2026-03 重命名) subagent 设计(verbatim):"Each subagent runs in its own fresh conversation. Intermediate tool calls and results stay inside the subagent; only its final message returns to the parent";"Subagents cannot spawn their own subagents" — 严格 single-level fan-out,与 Cognition 修正后的立场实质一致。', type: 'fact', sources: [3] },
        { id: 'single-vs-multi-agent-7', text: '行业共识(双方都同意):read-leaning / tool-call-style subagent 可接受;平权多 agent 写协作不可行;真正的 hard problem 是 context engineering 而非 agent 数量(Patrick McGuinness:"False Dichotomy")。', type: 'opinion', sources: [4] }
      ],
      pros: [
        'Captain 派:Anthropic SDK + Cognition 修正后立场共识 — 行业沉淀稳定',
        'Captain 派:context 一致,coding 等紧耦合任务可靠',
        'Multi-agent 派(narrow form):research 等可分解的 breadth-first 任务有 90%+ 量化优势',
        'Multi-agent 派(narrow form):token 成本可承受时,可并行加速'
      ],
      cons: [
        'Captain 派:并行度受限',
        'Multi-agent 派(broad form):context 分区导致 implicit decision 冲突,fragile',
        'Multi-agent 派:token 用量 15x of chat — 成本结构对小团队不友好'
      ],
      articles: [
        { title: "Don't Build Multi-Agents — Walden Yan (Cognition)", url: 'https://cognition.ai/blog/dont-build-multi-agents', relevance: '原始 anti-multi-agent 论据,2025-06-12', tier: 'primary' },
        { title: 'How we built our multi-agent research system — Anthropic', url: 'https://www.anthropic.com/engineering/multi-agent-research-system', relevance: '次日发布的反向 case,含 90.2% 内部 eval', tier: 'primary' },
        { title: "Multi-Agents: What's Actually Working — Cognition", url: 'https://cognition.ai/blog/multi-agents-working', relevance: 'Cognition 2026-04-22 自我修正,debate 收敛点', tier: 'primary' },
        { title: 'Claude Agent SDK Subagents docs', url: 'https://code.claude.com/docs/en/agent-sdk/subagents', relevance: 'Anthropic 当前 SDK 的 strict orchestrator-worker 实现', tier: 'primary' },
        { title: 'The AI Agent Architecture Debate — Patrick McGuinness', url: 'https://patmcguinness.substack.com/p/the-ai-agent-architecture-debate', relevance: '"False Dichotomy" 视角与 common ground', tier: 'counterpoint' },
        { title: 'Why Cognition does not use multi-agent systems — Jason Liu', url: 'https://jxnl.co/writing/2025/09/11/why-cognition-does-not-use-multi-agent-systems/', relevance: '第三方对 Cognition 原立场的支持性综述', tier: 'supporting' },
        { title: 'Soloists to Ensembles — Piyush', url: 'https://www.piyush.cc/p/soloists-to-ensembles-the-evolving', relevance: '第三方对 multi-agent 阵营的支持', tier: 'counterpoint' }
      ]
    },
    {
      id: 'control-vs-execution-plane',
      title: '控制面 vs. 执行面 — production runtime 分裂 (2026 Q2 收敛)',
      thesis:
        '2026-04-08 Anthropic Managed Agents 与 2026-04-15 OpenAI Agents SDK 七天内独立向同一架构收敛 — control plane(harness:agent loop + state + permission)与 execution plane(sandbox:Bash/file/web 执行)干净分离。Durable execution(Temporal $5B、Inngest、Restate、Microsoft Durable Task)是这个架构的天然搭档。这是 agent runtime 在 2026 年最具决定性的结构性转变,从此 "production agent" 有了一个公认的 reference architecture。',
      intuitions: [
        { id: 'control-vs-execution-plane-1', text: 'Venkatesan Medium (2026-04-18) 命名时刻(verbatim):"Two of the largest frontier labs, independently, shipped the same answer to the same question within one week. Same core architecture, different packaging." 这是 control plane / execution plane 二分法的命名出处。', type: 'fact', sources: [0] },
        { id: 'control-vs-execution-plane-2', text: 'Anthropic Managed Agents (2026-04-08 public beta):3 个 REST endpoints (/v1/agents、/v1/environments、/v1/sessions);built-in tools 是 Bash、File 操作、Web search/fetch、MCP servers;SSE event-stream;beta header `managed-agents-2026-04-01`;不是 ZDR/HIPAA-BAA 资格因为 session 是服务端 stateful。', type: 'fact', sources: [1] },
        { id: 'control-vs-execution-plane-3', text: 'OpenAI Agents SDK 2026-04-15 update:model-native harness + 9 个 sandbox provider — Unix-local、Docker、Blaxel、Cloudflare、Daytona、E2B、Modal、Runloop、Vercel;Codex-style filesystem tools;显式 control plane / compute plane split。', type: 'fact', sources: [2] },
        { id: 'control-vs-execution-plane-4', text: 'Temporal $300M Series D 2026-02-17 by a16z (lead) + Lightspeed + Sapphire,$5B valuation 翻倍;380% revenue growth + 350% WAU growth YoY — durable execution 在 AI 时代仍是被资本认可的基础设施。', type: 'fact', sources: [3] },
        { id: 'control-vs-execution-plane-5', text: 'Microsoft Durable Task for AI Agents (Azure, 2026-05 文档)显式立场(verbatim):"isn\'t an agent framework — works with any AI agent framework, including Microsoft Agent Framework, LangChain, or direct LLM API calls" — 把自己定位为 framework-agnostic 的 execution backbone。', type: 'fact', sources: [4] },
        { id: 'control-vs-execution-plane-6', text: 'E2B 提供 Firecracker microVM-based sandbox-as-a-service:24h session、<200ms cold start、support Python/JS/Ruby/C++;BYOC/on-prem/self-host;客户含 Perplexity、Manus、HF、Groq、Lindy、GenSpark — 一个独立公司 viable 的 execution plane 供应商。', type: 'fact', sources: [5] },
        { id: 'control-vs-execution-plane-7', text: 'Restate 与 Temporal 同样 journal/replay,但 footprint 更轻(embedded RocksDB、单 binary)并且 "removes the determinism constraint by making side effects explicit via ctx.run()" — 是 Temporal 的 lighter alternative 而非平替。', type: 'fact', sources: [6] },
        { id: 'control-vs-execution-plane-8', text: 'Inngest 走 TS-first event-driven 路线:"choreography over orchestration","code that automatically persists its state at defined checkpoints and can resume from those checkpoints after any failure" — 同一空间内的另一种 design philosophy。', type: 'fact', sources: [7] },
        { id: 'control-vs-execution-plane-9', text: '所有这些设计的共同基础假设:AI agent 引入多个 failure point(orchestration、probabilistic LLM、tool calling、HITL)是 traditional retry 不能 handle 的 — durable execution 不是 nice-to-have 而是 baseline。', type: 'opinion', sources: [7, 8] }
      ],
      pros: [
        '分离 control / execution:工程纪律清晰,可独立优化 reliability vs capability',
        '与 durable execution 平台 fit:checkpointing、resume、retry 都有公认实现',
        '业内顶级实验室已收敛同向 — reference architecture 形成'
      ],
      cons: [
        '增加架构复杂度,简单 agent 用例可能 overkill',
        'hosted runtime 锁定供应商(Anthropic Managed Agents 不是 ZDR/HIPAA-BAA)',
        '业内尚无"durable execution 是 overkill"的严肃反论 — 风险是 group-think'
      ],
      articles: [
        { title: 'Anthropic and OpenAI Just Shipped the Same Answer to AI Agents, Seven Days Apart — Venkatesan', url: 'https://medium.com/@rajasekar-venkatesan/anthropic-and-openai-just-shipped-the-same-answer-to-ai-agents-seven-days-apart-c19f2dc03244', relevance: 'control/execution plane 二分法的命名出处', tier: 'primary' },
        { title: 'Anthropic Managed Agents overview', url: 'https://platform.claude.com/docs/en/managed-agents/overview', relevance: 'Anthropic hosted execution 官方文档', tier: 'primary' },
        { title: 'OpenAI Adds Sandboxing to Agents SDK — winbuzzer', url: 'https://winbuzzer.com/2026/04/17/openai-adds-sandboxing-agents-sdk-native-isolation-xcxwbn/', relevance: 'OpenAI 9 sandbox provider 与 control/compute plane split', tier: 'primary' },
        { title: 'Temporal raises $300M to make agentic AI real — GeekWire', url: 'https://www.geekwire.com/2026/temporal-raises-300m-hits-5b-valuation-as-seattle-infrastructure-startup-rides-ai-wave/', relevance: 'durable execution 资本认可的标志事件', tier: 'primary' },
        { title: 'Durable Task for AI Agents — Microsoft Learn', url: 'https://learn.microsoft.com/en-us/azure/durable-task/sdks/durable-task-for-ai-agents', relevance: 'framework-agnostic execution backbone 立场', tier: 'primary' },
        { title: 'E2B — Enterprise AI Agent Cloud', url: 'https://e2b.dev/', relevance: '独立 execution plane 供应商现状', tier: 'primary' },
        { title: 'Durable Execution meets AI — Temporal blog', url: 'https://temporal.io/blog/durable-execution-meets-ai-why-temporal-is-the-perfect-foundation-for-ai', relevance: 'durable execution 阵营核心论述', tier: 'supporting' },
        { title: 'Durable Execution: The Key to Harnessing AI Agents — Inngest', url: 'https://www.inngest.com/blog/durable-execution-key-to-harnessing-ai-agents', relevance: 'TS-first/event-driven 的另一种 design', tier: 'supporting' },
        { title: 'AI Agent Sandbox — Firecrawl Blog', url: 'https://www.firecrawl.dev/blog/ai-agent-sandbox', relevance: 'sandbox 生态的独立综述', tier: 'supporting' }
      ]
    },
    {
      id: 'runtime-model-coupling',
      title: 'Runtime ↔ Model 耦合度 — 商业模式之争',
      thesis:
        '一类 runtime 与特定 model 紧耦合 — 知道并优化它的 prompt cache 边界、tool 格式、output tokenization、interleaved thinking 信号(Claude Code、ChatGPT、Cursor);另一类 runtime 是 provider-agnostic 的胶水(LangChain、LiteLLM、Aider、Cline)。前者质量上限高但锁定,后者最大公约数但可移植。生产团队的实际选择往往是混合 stack 而非单一 framework — 这是 framework 派的隐性挫败。',
      intuitions: [
        { id: 'runtime-model-coupling-1', text: 'Claude Code 据 arxiv 2604.14228:"modular system prompt with cache-aware boundaries, approximately 40 tools in a plugin architecture, a 46,000-line query engine" — 这是深度 model-specific 优化,无法解耦合到任意 provider。', type: 'fact', sources: [0] },
        { id: 'runtime-model-coupling-2', text: 'Cursor 3 (2026-04) 添加 cloud agents on isolated VMs、/worktree、self-hosted agents、parallel Agent Tabs — 表面 multi-provider,实际每个 provider 都深度优化,接近紧耦合。', type: 'fact', sources: [1] },
        { id: 'runtime-model-coupling-3', text: 'Cline (原 Claude Dev)、Aider、LangChain、LiteLLM 走 provider-agnostic 路线 — 抽象掉 provider 差异,以可移植性为护城河。', type: 'fact', sources: [2] },
        { id: 'runtime-model-coupling-4', text: '生产团队的实际选择是混合 stack(verbatim observation):"Most production teams in 2026 use two or three together: Cursor for daily IDE flow, Codex for autonomous background tasks, and Claude Code for complex refactors needing deep codebase context" — 用户用脚投票多 runtime stack。', type: 'opinion', sources: [3] },
        { id: 'runtime-model-coupling-5', text: '紧耦合派的护城河是模型厂商提供的"内部 API"(prompt caching boundary、tool format 优化、interleaved thinking 信号);解耦合派的护城河是覆盖广度 — 但当顶级 model 之间 capability gap 缩小时,解耦合派的相对价值上升。', type: 'opinion', sources: [3] }
      ],
      pros: [
        '紧耦合:质量上限最高,prompt cache、tool format 优化与模型版本同步',
        '紧耦合:UX 一致,debug 时心智简单',
        '解耦合:可移植,避免单一供应商锁定',
        '解耦合:在多模型 stack 下 framework 适配成本低'
      ],
      cons: [
        '紧耦合:provider 决定 roadmap,客户被动',
        '紧耦合:多模型场景下重复造轮',
        '解耦合:永远在最大公约数上做事,无法用 provider 的 internal API',
        '解耦合:面对生产复杂度时 framework 本身变成负担(LangChain 早期教训)'
      ],
      articles: [
        { title: 'Dive into Claude Code: The Design Space of Today and Future AI Agent Systems', url: 'https://arxiv.org/abs/2604.14228', relevance: 'Claude Code 紧耦合优化的解构', tier: 'primary' },
        { title: 'Claude Code vs Cursor 2026: Terminal Autonomy vs IDE Velocity — WaveSpeed', url: 'https://wavespeed.ai/blog/posts/claude-code-vs-cursor-2026/', relevance: '紧耦合 runtime 的能力对比', tier: 'supporting' },
        { title: 'Agentic Coding Tools Compared (2026)', url: 'https://www.requesty.ai/blog/agentic-coding-tools-compared-2026-claude-code-cursor-codex-aider', relevance: '紧耦合与解耦合 stack 的横向对比', tier: 'supporting' },
        { title: 'AI Coding Harness Comparison 2026', url: 'https://thoughts.jock.pl/p/ai-coding-harness-agents-2026', relevance: '实际生产团队混合 stack 的体感证据', tier: 'supporting' }
      ]
    },
    {
      id: 'mcp-and-after',
      title: 'MCP 标准化 + 后胜利分歧 — 协议层',
      thesis:
        'Model Context Protocol 2024-11 发布,2025-12 转交 Linux Foundation 成立 Agentic AI Foundation(Anthropic+Block+OpenAI co-founders;Google/Microsoft/AWS/Cloudflare/Bloomberg supporting),2026-03 月度 SDK 下载达 97M(4,750% 增长 over 16 months)。MCP 已是事实标准。新分歧不是"哪个协议赢",而是 MCP 自身设计选择的代价在显现:安全模型脆弱(OX Security 揭 RCE 漏洞 Anthropic 拒补)、Apps 扩展可能利好 incumbent、注册表治理缺位。',
      intuitions: [
        { id: 'mcp-and-after-1', text: 'MCP 时间线:2024-11 launch → 2025-12 转交 AAIF(Linux Foundation 下);Platinum members:AWS、Anthropic、Block、Bloomberg、Cloudflare、Google、Microsoft、OpenAI — 几乎所有大玩家都签了。', type: 'fact', sources: [0, 1] },
        { id: 'mcp-and-after-2', text: '采用数据:97M monthly SDK downloads(March 2026,从 2024-11 的 ~2M 增长 4,750%);9,652 servers in registry(May 2026);15,926 GitHub repos with mcp-server topic。', type: 'fact', sources: [2] },
        { id: 'mcp-and-after-3', text: 'Stacklok State of MCP 2026:41% in production(29% limited + 12% broad),30% in pilot,29% planning — 真实生产采用比传闻的"78%"低,但仍然是行业明显的多数。', type: 'fact', sources: [2] },
        { id: 'mcp-and-after-4', text: 'MCP Apps(2026-01-26 announcement)是"first official MCP extension":tools 可返回 interactive UI components(dashboards、forms、visualizations、multi-step workflows);credits MCP-UI 和 OpenAI Apps SDK 作为预可行性证明。', type: 'fact', sources: [3] },
        { id: 'mcp-and-after-5', text: 'OpenAI Apps SDK 与 MCP 关系(verbatim from OpenAI docs):"With Apps SDK, MCP is the backbone that keeps server, model, and UI in sync"。OpenAI standardize on MCP 而非 wrap/replace。', type: 'fact', sources: [4] },
        { id: 'mcp-and-after-6', text: 'OX Security 2026-04-22 揭 RCE 漏洞:reference SDKs(Python、TS、Java、Rust)的 STDIO transport 允许 user-controlled input 流入 command execution without sanitization,影响 ~200K server instances;Anthropic 回应行为是"expected",拒绝在 protocol 层 patch。', type: 'fact', sources: [5] },
        { id: 'mcp-and-after-7', text: 'NSA + CoSAI white paper 立场:"protocol\'s focus is on simplicity and ease, not authentication and encryption" — MCP 设计哲学与企业安全要求有内在张力,这与 R2 的 workflow vs agent 类似:是 trade-off,不是 bug。', type: 'opinion', sources: [5] },
        { id: 'mcp-and-after-8', text: '"first official extension" 风险:MCP Apps 与最大 host 厂(Claude、ChatGPT、VS Code、JetBrains、AWS、Google DeepMind)co-developed,credits 专有 OpenAI Apps SDK — 标准化路径被 incumbent 主导,可能复制 LangChain 早期 abstraction over-fit 的错误。', type: 'opinion', sources: [3] },
        { id: 'mcp-and-after-9', text: '竞争协议:A2A(Google)50+ partners 但 "less than a year of production deployment vs MCP\'s 16-month track record",业内共识 "use MCP for tool access, add A2A for cross-vendor agent coordination" — 互补而非替代;ACP 已 deprecated 迁移到 A2A;UCP "designed for compatibility with MCP, A2A"。', type: 'fact', sources: [6] }
      ],
      pros: [
        'MCP 已是事实标准,生态网络效应巨大',
        '主流 client(Claude/ChatGPT/Gemini/Cursor/Windsurf/JetBrains/Vercel/OpenAI Agents SDK)全覆盖',
        'AAIF 由 Linux Foundation 托管,治理结构合法',
        'A2A、ACP 等替代品要么 complementary 要么 deprecated'
      ],
      cons: [
        '安全模型 protocol-level 缺陷(RCE)未 patch,生产风险',
        'MCP Apps 路径疑似 incumbent lock-in',
        'Registry 治理与质量控制未跟上(15,926 GitHub repos vs 9,652 registry entries)',
        'Anthropic 主导身位明显,即使 AAIF 化后影响力仍非对称'
      ],
      articles: [
        { title: 'MCP joins the Agentic AI Foundation (2025-12-09)', url: 'https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/', relevance: 'AAIF 成立官方公告', tier: 'primary' },
        { title: 'Linux Foundation announces AAIF', url: 'https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation', relevance: '完整 Platinum/Gold member 名单', tier: 'primary' },
        { title: 'MCP Adoption Statistics 2026 — DigitalApplied', url: 'https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol', relevance: '采用数据与 Stacklok 数据来源', tier: 'supporting' },
        { title: 'MCP Apps — Bringing UI Capabilities to MCP (2026-01-26)', url: 'https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/', relevance: 'first official MCP extension 与潜在 lock-in 路径', tier: 'primary' },
        { title: 'MCP — Apps SDK | OpenAI Developers', url: 'https://developers.openai.com/apps-sdk/concepts/mcp-server', relevance: 'OpenAI standardize on MCP 的官方声明', tier: 'primary' },
        { title: "Anthropic's Model Context Protocol has critical security flaw exposed — Tom's Hardware", url: 'https://www.tomshardware.com/tech-industry/artificial-intelligence/anthropics-model-context-protocol-has-critical-security-flaw-exposed', relevance: 'OX Security RCE 与 Anthropic 不补丁立场', tier: 'counterpoint' },
        { title: 'AI Agent Protocol Ecosystem Map 2026 — DigitalApplied', url: 'https://www.digitalapplied.com/blog/ai-agent-protocol-ecosystem-map-2026-mcp-a2a-acp-ucp', relevance: 'A2A/ACP/UCP 与 MCP 的关系定位', tier: 'supporting' }
      ]
    }
  ],
  tensions: [
    {
      id: 'tension-long-context-vs-memory',
      question: '长 context 模型(1M+)是否在杀死 memory middleware?',
      positions: [
        { side: 'Memory 中间件不死', argument: 'LongMemEval 显示长 context LLM 在 sustained interaction 上有 30% accuracy drop;经济性上 ~10 turn 后中间件更便宜;Anthropic 自己的长任务 harness 也用外置 memory artifacts — frontier 厂商也不全靠 context。' },
        { side: 'Middleware 底部被吃掉', argument: '1M-token context flat pricing 让 <500K tokens 累积历史区间 stuff-in-context 比 Mem0+Pinecone stack 还便宜;memory 中间件在小规模场景的相对价值正在 commoditize。' }
      ],
      status: 'active'
    },
    {
      id: 'tension-multi-agent-resolution',
      question: 'Multi-agent vs single-agent — 这场 debate 的实际共识是什么?',
      positions: [
        { side: 'Cognition 原立场(2025-06)', argument: '平权多 agent 让 context 分区,sub-agent implicit decision 冲突,系统 fragile。' },
        { side: 'Anthropic 立场(2025-06)', argument: 'Research-style 任务上多 agent 比 single-agent 高 90.2%,但承认 coding 等紧耦合任务不适用。' },
        { side: '收敛共识(2026-04+)', argument: 'Cognition 修正后:"narrower class of patterns that work" — manager + child Devins,writes single-threaded,subagent like tool calls;Anthropic Agent SDK 同样是 strict orchestrator-worker,subagent 不能 spawn 子 agent,只回 final message。平权写协作出局,read-leaning tool-call-style delegation 入局。' }
      ],
      status: 'resolved'
    },
    {
      id: 'tension-mcp-security',
      question: 'MCP 的安全模型应该在 protocol 层修补,还是这是 host application 的责任?',
      positions: [
        { side: 'OX Security + NSA + CoSAI', argument: 'STDIO transport 不做 input sanitization,reference SDK 设计层就允许 RCE;tool permission exploits、prompt injection、lookalike tool 替换 — 应在 protocol 层 fix(manifest-only execution、command allowlists)。' },
        { side: 'Anthropic', argument: '该行为是"expected" — protocol 哲学是 simplicity 与 ease,security 在 host application 层做;不打算 patch 协议。' }
      ],
      status: 'active'
    },
    {
      id: 'tension-code-vs-tools',
      question: '为什么 CodeAct 有量化优势,生产 stack 仍以 JSON tool calling 为主?',
      positions: [
        { side: 'Code-as-Action 派', argument: 'CodeAct +20% success rate, -30% steps;Smolagents 自述 "primarily focuses on CodeAgents because they perform better overall";表达力本质更高。' },
        { side: '生产派', argument: 'JSON tool calling 的护城河是 schema 可审计、可限权、易并发;模型厂商的 prompt cache、tool format 优化都为它配套 — 生态平衡决定生产选择,不是技术上限决定。' }
      ],
      status: 'active'
    },
    {
      id: 'tension-mcp-apps-lock-in',
      question: 'MCP Apps 是 standardization 还是 incumbent lock-in 路径?',
      positions: [
        { side: 'MCP Apps 阵营', argument: '"first official MCP extension",解决 chat-only tool 限制,让 agent UI 进入 conversation — 是社区共同需要的能力。' },
        { side: '担忧者', argument: 'Co-developed 与最大 host 厂(Claude、ChatGPT、VS Code、JetBrains、AWS、Google DeepMind);credits 专有 OpenAI Apps SDK 作为预可行性 — 标准化路径被 incumbent 主导,可能复制 LangChain 早期 abstraction over-fit 的错误。' }
      ],
      status: 'emerging'
    },
    {
      id: 'tension-runtime-form',
      question: 'production agent runtime 应该是 hosted product、SDK/library,还是 framework?',
      positions: [
        { side: 'Hosted product', argument: 'Anthropic Managed Agents、OpenAI Agents SDK 的 hosted execution — 厂商提供 agent harness as a service;客户不管 sandbox。质量上限最高,但锁定供应商且不是 ZDR/HIPAA-BAA。' },
        { side: 'SDK/library', argument: 'Claude Agent SDK、Anthropic Agent SDK Python/TS — 给开发者完整 building block,自己组装。灵活但需要自建 sandbox + observability。' },
        { side: 'Framework', argument: 'LangGraph、Temporal、Inngest、Restate — workflow framework + agent steps。最自由但要承担 framework 抽象的负担,被大型平台 hosted/SDK 双重挤压。' }
      ],
      status: 'active'
    }
  ],
  readingPath: {
    ifYouHave5Min: [
      'workflow-vs-agent-2',
      'single-vs-multi-agent-1',
      'single-vs-multi-agent-5',
      'single-vs-multi-agent-6',
      'control-vs-execution-plane-1',
      'mcp-and-after-2',
      'context-vs-memory-5'
    ],
    ifYouHave30Min: [
      'code-vs-tools-1',
      'code-vs-tools-3',
      'workflow-vs-agent-2',
      'workflow-vs-agent-4',
      'context-vs-memory-1',
      'context-vs-memory-5',
      'context-vs-memory-6',
      'context-vs-memory-7',
      'single-vs-multi-agent-1',
      'single-vs-multi-agent-3',
      'single-vs-multi-agent-5',
      'single-vs-multi-agent-6',
      'control-vs-execution-plane-1',
      'control-vs-execution-plane-2',
      'control-vs-execution-plane-3',
      'control-vs-execution-plane-4',
      'runtime-model-coupling-1',
      'runtime-model-coupling-4',
      'mcp-and-after-2',
      'mcp-and-after-5',
      'mcp-and-after-6',
      'mcp-and-after-8'
    ]
  }
};

export { aiAgentRuntimeFieldMap };
export default aiAgentRuntimeFieldMap;
