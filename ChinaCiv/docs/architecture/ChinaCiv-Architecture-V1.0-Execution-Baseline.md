# ChinaCiv《华夏文明》V1.0 执行基线 · 最终技术决议

版本：V1.0（L1 执行基线）｜2026-11-27
依据：DEC-001、ChinaCiv-Architecture-V0.3-ALL.md、ChinaCiv-V0.3-GPT-Technical-Review.md（R201–R220），以及项目负责人本轮要求「赶紧帮我这个确定确认方案，或者你自己做出来也行」。本次由 GPT 直接选定工程方案，取消重复的全量架构审查。以下决议是 V0.3 的强制覆盖条款：同一事项若有冲突，一律以本文为准；其余正文及验收标准保留。原回复表、CHANGELOG、审查指引及版本字样仅为历史记录，不是现行门禁。L1 采用本执行基线；L2 GridSpec 仍在 P1-G 冻结。未运行实际实现、未打 Git tag、未取得任何法律意见或真实设备性能数据，不宣称相应验收通过。后续发现真实阻断，只修相关契约并记 ADR，不再从零审查。

## 1. 已定产品方向（DEC-001，不再复议）

- D-01：先独立交付 M1「华夏图鉴」真实数据地图，再完成 M2「华夏文明」回合策略。M1 不依赖 sim、校准包或 P3 之后的工作，不为 M2 牺牲 M1 质量。
- D-09：2020 数据基准、2020 年不变价；回合 0=2021Q1，119=2050Q4，完成第 120 次结算进入不可操作的终局状态 120。区分观测、估算、派生、模拟、缺失。
- D-11：Three.js + WebGL2，A 档俯视手绘六边形、晕渲、精灵和旗标为正式版本；B 档 3D 倾斜仅后续可选，不阻挡发布。
- D-12：桌面与 iPad 均正式支持，M1/M2 核心功能一致；iPad 完整触控和横屏安全区布局，Safari 真机正式验收。性能及资源阈值在 P1a 真机实验后确定，允许画质差异，不允许删功能。

## 2. 最小强制技术修订（直接采用，不再往返）

### F01 · CCB 空段（R201；06 §2.2/2.4，08 §2.5）
段表仍为 24B 文件头、56B/段、小端、CRC-32/ISO-HDLC。按段表次序，首段 offset=headerBytes，后继 offset=align8(上一 offset+bytes)，末尾文件长=align8(末段末字节)。允许零长度段与后继段共享 offset，连续空段合法；仅非空字节区间不得重叠。空数值段 count=0、bytes=0、CRC=0；空字符串表仍含 n=0 和一个 offsets[0]=0。padding 仅为对齐所需 0–7 字节且全零。CSE 段名 ASCII 升序，通用 CCB 不要求 offset 严格递增。读取器拒绝不符合上述精确递推的包。P1a-A3 必测首/中/尾连续空段、全空数值表、坏包；P3a 新游戏空工程、事件表存档。

### F02 · CCJ-1 业务编码（R202；06 §1.2/7，08 §6，14 §3/5）
保留 CCJ-1 固定 ASCII 键、安全整数、无负零、严格 UTF-8 与重复键拒绝规则。所有参与哈希或持久化的业务对象先映射到 schema 定义的普通 JSON 对象/数组，禁止 TypedArray 的对象式序列化。动态键用记录数组（幂等账按 acceptedSeq 升序，每项含 commandId、payloadDigest、acceptedSeq；协议 terms 按 key UTF-8 字节序排序、key 为值，参数值为 schema 指定的整数单位）；不允许未知字段、隐式缺省或 NaN。路径为普通全局 TileId 整数数组；比例用万分基点，金额整数万元；分享 ViewState 用投影中心整数米和整数米视野宽度，定稿后所有分享字段由 schema 校验，base64url(CCJ-1)；拒绝越界并允许缺省通过明确版本默认值转换。原始 JSON 先严格解析再校验，不能在普通 JSON.parse 丢失重复键/非法数字词法后检查。权威 sim 使用经 golden vectors 验证的同步纯函数 SHA-256 实现/依赖计算摘要，禁止信任宿主传入的摘要；不引入时钟、网络或 crypto API。P1a-A3、P3a-A0 测 UUID、协议、路径、分享、拒绝重复键和负零。

### F03 · CSE-1 状态闭包（R203；08 §2.5/3，06 §7，14 §5）
仍以 CCB v2 承载 CSE-1；保留现有双路 xxHash32、RNG 单一来源与写入即规范。meta 增加 difficulty、inputKind、inputIdentity、topologyRevision、paramsRevision；inputKind 为 fixture/calibration/production 三选一，生产绑定 scenario-cal identity，开发身份见 F11。现有字段保留；任何影响未来状态/查询/合法性的量必须纳入规范状态，或有完全确定的重建依据。动态节点/边保存端点、类型/模式、状态、格路径或几何重建参数、方向容量、池、成本、owner、资金份额和 next_id；持久化必要的上一回合成本/流量、价格、库存、投入缺口、工程/债务/协议/事件/项目、AI 和记分历史。CSR 固定父 ID 升序、子 ID 升序、offset[0]=0、单调、末 offset=子列长度，空行合法且所有关联列同长；索引类型和单位以字段登记表为准。state-fields.json 登记语义字段、唯一短段名（≤24B）、行族、dtype、arity、范围、单位、scale、ID域、排序及关联 CSR 规则。幂等账从权威玩家日志确定性重建，外层 idem_ledger 仅作交叉校验缓存，不一致拒绝；日志里保留计算摘要所需全部字段。若两个相同 CSE 的历史日志导致不同重试行为，仍必须拒绝不匹配的日志/账本；另将按序玩家命令记录的 canonical SHA-256 写入 CSE meta，绑定重试历史。读档同时校验 saveVersion 与 CSE 四元组/输入身份，不支持版本拒绝。P3a-A0 完成已启用模块的字段表；每个后续系统启用前补全其字段与测试，变更 schemaVersion，明确迁移或旧开发档失效。完整保存恢复与缓存清除重建后继续等价为硬验收。

### F04 · 唯一回合提交（R204；08 §5/6/7，12 §5，14 §5/6）
外部玩家 UUID 与 acceptedSeq 只用于玩家命令。AI 按 turn、省 ID、候选稳定顺序使用内部确定性身份，共享纯验证/执行逻辑，不进入玩家日志/幂等账、不消耗玩家 acceptedSeq。AI 观察同一回合快照，执行按既有冲突规则；回放只重新计算 AI，不注入其轨迹。EndTurn 边界先暂存；全部系统成功、历史/回合/终局及 revision 更新后，再提交日志、更新日志摘要、检查不变量、编码 CSE、生成同一提交状态的 hash/diff/TurnResult。失败丢弃整次结算及暂存日志，不留下半回合。第120次提交产生 turn=120、gameOver=true 的响应及存档；此后新的提交拒绝，已成功请求的重复请求仍返回原结果身份。P3a/P7 测空回合、失败回滚、AI 重算、终局 hash/存档一致。

### F05 · 持久提交与 Worker 恢复（R205；06 §7，08 §6/7，14 §6）
宿主是持久化协调者，Worker 是模拟权威。所有变更串行；玩家 submit、EndTurn 具有 operationId（玩家命令复用 commandId）、baseTurn、baseRevision；重试先查已提交 operationId/摘要再检查时序。相同 ID 不同摘要拒绝。Worker 执行得到待提交状态、完整存档副本与差量，不能在宿主确认持久化前开始下一变更。宿主在同一 IndexedDB 事务写入存档、最新 commit 指针、操作身份与结果身份；收到事务 complete 才发送 durable ACK 并向 UI 宣布成功、应用差量。磁盘失败则不确认，恢复上一个已提交存档；提交后 ACK 丢失时，以最新成功事务为准，重试返回 duplicate（含原 acceptedSeq 或结算 turn/hash，必要时 snapshot），不再重复执行。可先用完整 checkpoint 实现；若过慢只允许在等价测试通过后改为快照+日志/WAL，不降低持久语义。每次 EndTurn 前必须已有当前命令全部持久化的 checkpoint；结束也持久化。所有消息有 protocol、workerEpoch、gameId、reqId，另设 prepare/checkpoint、durableAck、abort；差量分片含 groupId、baseRevision、revision、partIndex、partCount、长度/校验，暂存到齐才原子切换显示；超时、缺片或旧 epoch 丢弃并 resync。newGame/load 生成新 gameId，旧请求清除；权威 TypedArray 不 transfer，消息使用独立副本。iPad 后台事件仅 best effort，强杀恢复以最后 durable commit 为准，不保证用户清除站点数据后恢复。P3a-A2/A3 与 P7/P9 真机测试 ACK 前后终止、配额失败、重复 EndTurn、缺片、旧响应、后台恢复。IDB 开销计入端到端延迟并报告，不能隐去。

### F06 · 报价、工程和财政（R206；08 §5/6，10 §3，11 §5，14 §5）
废除 quoteId，只用 quoteDigest；由 sim 按当前授权主体、mode、waypoints、路径、整数 cost/periods、topologyRevision、paramsRevision、协议 ID/版本（无协议为 null）、出资份额计算 CCJ-1 摘要。BuildLink 传同一必要输入、expectedCost/Periods/digest，权威重算；不匹配 QUOTE_STALE。跨省须有有效双方同意协议；工程命令明确引用，协议只授权/承诺、不重复创建工程。开工不预扣。步骤2 开始先用期初可用现金按既有财政规则过账应付本息（不够按既有危机规则处理，禁止负现金），再按 works ID 升序检查所有出资方本期份额，全部足额才一次原子付款并推进；否则整体顺延。总额按期最大余数拆分，各期按固定基点份额最大余数拆分，平局按期序/参与方 ID；全期累计等于总价。取消未支付部分不再付，已支付不退。步骤5 其余财政收支只基于同一 postings 账本，收入/借款/维护/其他支出按规则处理；期初余额+全部唯一 postings=期末余额，已扣本息及工程款只计报表不二次扣减。运营收入规则见 F08。VS-A3 测现金10/本息10/工程10、跨省一方不足、竞争、取消、完工和无缓存回放。

### F07 · 贸易严格整数守恒（R207/R216；11 §4.3/8，10 §5）
保留三轮近似和库存公式，不改全局最优化。S=X+I_open−W、D 均非负安全整数，所有算术检测溢出；tech 可贸易池 floor(X/2)、本地池 X−前者（需求同样拆分），不独立舍入。每轮只对 reach=true（包括定义的本地自环）且正供给、正权重的候选计算 G；零权重列/零和行跳过。行缩放后按 (i,j) 稳定顺序取 floor(G)，同时用当时行列剩余整数配额夹紧并立即扣两边配额，避免浮点误差造成超额。补配只遍历 G>0、reach=true、正小数余数的候选，余数降序、平局 (i,j)；每候选每轮最多补1，且当时两侧剩余均≥1才补并同时扣减；无合格位置停止。固定三轮累计。进出口按可达口岸成本与稳定 ID 顺序，每个口岸的进、出口容量各用唯一剩余账（跨部门共享者同一账、部门 ID 升序），每次取城市残余与口岸残余的最小值并双扣；不制造不可达货流。剩余供给 I_close、剩余需求 unmet。本地部门无库存。归纳：初始配额非负，每次扣减不超过行列剩余，故逐行逐列上限及库存/需求等式成立。非最优明确标注。VS-A3 测 A/B 只能到 J1 的反例、零需求、库存损耗、大数、tech 奇数、多个城市共享口岸；VS-A5 测四部门337²、三轮及排序（最坏约2300万比较，非实测）。

### F08 · 网络 schema 和几何（R208/R215；05 §5，06 §1/4，10 §2/5/6，14 §2）
保留有向多模态 CSR。只对明确声明双向的物理 lineId 检查反向配对，真实单向合法。固定 Node/Edge/Facility/Pool ID 域与哨兵、mode=0 连接、node_kind、status、cityHub→CityId 的枚举/外键校验。base-geo 仅地理线；scenario-raw 放真实交通几何 render/network_lines/<chunk>.ccb，geom_index 明示 layer/path/offset/count；M2 新建线由持久化路径/几何参数重建。M1 过滤虚拟估算航线，不把模型当真实线。容量池用于软拥堵，不是硬运输限额：指定设施进入池的计量边，每次设施服务按该边一次计入，进入/离开不能双计；同一方向边独立容量，客货池独立。BPR 计算使用已确定的汇总；硬准入只由可达/模式/状态控制，停运边清零历史流量。运营收入只按有效合同资金份额过账一次，缺省归 owner，未知归中央；财政不重复归属。Dijkstra 固定 EdgeId 平局、正成本、reach/哨兵、不另排序的 settle 逆序加载；惰性堆容量按 E+1 或可增长安全策略，记录 stale pop；当前成本用于当轮，拥堵更新下轮。原始 y 与平滑 v 的守恒分别验收。P2/P5/P6 夹具；P1a-A6 真实计时，674次搜索、约1348万边检查、最坏堆层级工作约3.9亿只是上界估算，500ms未实测。

### F09 · 渲染接口（R209/R214；07 §3/5a/6/7，14 §2/4，15 §2/3）
RenderView 必有 GridSpec、window、tileIndex(TileId)，静态/全列纹理按窗口 localIndex，稀疏 diff 为 global TileId。城市/城镇 Visual 有真实整数米锚点、主附属标志及稳定 ID；NetworkVisual 有 lineId、edgeKind、mode0、kind/来源、状态（含 stopped）、分层几何引用。AssetSource 一律 layer+path 或等价唯一 AssetKey。RenderOptions/QualityProfile 可传平台与档位、DPR 上限、CPU/GPU 缓存/上传预算；iPad 与桌面共用 renderer。A 档底图全国/窗口单矩形；relief_lo 和 coast_sdf 直接由管线生成全国/窗口全局纹理（统一整数投影范围、采样原点、行向、NoData、窗口范围及 scale；采样尺寸写 manifest），旧每chunk晕渲/海岸文件规则废止，chunk仅用于线/标注/精灵；B档另行。GPU纹理上传同时≤4MiB且≤3ms（或平台批准更严值），超限分批。线网按类别/lineId 合批，视野变化时更新不每帧全建；全 pass、附图、透明、资源解码和导出峰值均计预算。4K截图为目标，分块/降尺寸须明示且保留合规元素。P1a 合成全 pass、P2 全国地图双平台实测，不承诺帧率。

### F10 · 包链、许可和发布（R210/R218；05 §3/6，06 §1.3–1.4，14 §2，17 §5）
生产入口严格 M1=base-geo→scenario-raw；M2=base-geo→scenario-raw→scenario-cal；每层唯一、版本/字段/父 identity/gridHash/window/scenario/distribution 一致，window整数合法并在全局边界内，文件路径为规范相对路径且唯一，不允许绝对、越层、重复、反斜杠或逃逸路径；content 实际字节哈希必须等于 cal 与发布描述符。M1 模拟 contentHash=null，独立展示配置计入 app/style 身份。boot 文件首帧前逐字节验证，stream/lazy 首次使用前校验；发布门禁全量核验文件存在和哈希，合规失败不渲染。release.json 由可信发布流程生成，应用/样式/完整包链/content/发行类别/展示范围绑定；部署与启动检查实际组合，不混用版本。public 审批非空，审图号、适用范围、有效期与登记匹配；审批示例以完整绑定字段为准，具体法律适用未核实。所有真实源内部处理先逐源许可及用途书面审查；公开发布前全链许可、专业合规和批准文件门禁，不能以水印替代。撤回按 releaseId/绑定停止对应版本；资源本身违规才撤回所有依赖发布，共享合法资源仍被有效发布引用时不封锁；会话每30分钟及回前台复验自己的版本而非最新发布。M1 公开前做最小撤回演练，P9完整演练；无法召回已下载内容。P1a-A3/P2-A12/P9-A4、A7 测坏链、坏 hash、空/过期审批、共享资源撤回。

### F11 · 阶段与窗口（R211；04/05/08/09/11/16/18）
开发 fixture 身份由固定合成输入、content、默认驱动清单的 CCJ-1/SHA-256 决定；校准身份绑定 raw、content、校准初值及参数版本，不引用自身产出的 cal；生产才使用 cal。三类互不混读，使用同一 CSE/hash 规范；P6 校准完成以 cal 重新初始化正式局。P1a 先合成世界，真实样本必须经 F10 许可；P1 后出 base-geo，P2 出 raw 与 M1；P3a 只依赖 P1a 合成内核（不依赖 P1/P2），P3b 依赖 P3a+P2-A1；P4 VS 依赖 P3b 与 P2 可用的 A 档渲染器/交互接口（不依赖 M1 公开审批）；P5 交通，P6 经济/校准，P7 策略AI完整局，P8视觉可选扩展，P9加固。P3a 只测已实现系统，事件/AI 全开移 P7；人口灾害测试可用直接变化夹具；P4 不要求政策、事件、项目、AI，P5固定OD。全国人口贡献先按完整县总量计算再裁切真实窗口；子窗口使用全国相同行值与全局 TileId，部分县标 partial，不用整县总量强行调平；G5b 全国断言只用于全国或完整县，窗口与全国对应行一致。合成窗口另标 fixture。P1-G 的 R 选择用 P1a 样例和合法真实样本报告，不依赖 P2 完整 M1。保留 L2 冻结与网格哈希。

### F12 · P1a 双平台实际门禁（R212；02/15/18/19）
P0 的规范修订采用本文，不把未执行实验当阻断；P1a 仍须逐项 PASS 或已批准 DEGRADE 才进入依赖该项的阶段。合成样例先行，正式真机与真实数据门禁按 F10 与待决策表。开始测量前预注册设备/OS/浏览器、同一场景、分辨率、热冷态、初始体验目标、最低可接受交互和资源条件；iPad 数字阈值由 P1a 初测提出、用户批准后锁定 ADR-016，再用相同场景复测，不能用单次结果直接设为 PASS。A5全 pass、A6独立客货路由、A4数学与确定性，均桌面+iPad；A10按三样本外推资源，A11同机位可读性。P1a 用合成压力代理，P2 真地图、P4 VS、P7/P9完整120回合与长测。DEGRADE只调整画质/资源或经批准技术路线，不删 DEC-001 核心功能、数据准确性、确定性、iPad真机验收；不支持页不能算正式平台通过。失败 STOP，仅暂停依赖阶段，提出一次最小修复或 ADR；合成原型开发不因尚无数据许可或真机而宣称通过真实发布门禁。

## 3. 其余定向修订（R213–R220）

- R213：桌面/iPad 共用核心功能矩阵取 01 §3、13 §2.2、14 §5.1 全部 V1 操作的并集；M1含地图、透镜、搜索、详情、图鉴/来源、小地图、URL分享与截图；M2含选省/沙盒、建设/升级/取消、功能区、政策预算、研发、投标/协议/事件选项、结算、报告、存读档/导入导出及恢复。按 P2、VS、P7/P9 分期实测；长按只开提示卡，菜单由卡内入口打开，捏合结束不触发单击，工具可取消/撤销途经点，面板滚动与地图手势分离。iPad真实安全区、软键盘和触控目标单测+真机。F09/F12落实其余平台预算。
- R214–R216：按 F07–F09/F12 执行；整帧与端到端性能、资源峰值报告均为实际测量；量级估算不是达标证据。
- R217：中国统计口径、可玩区域、外域背景为三个独立集合；外国背景不进入中国全国指标。台港澳显示与模型范围待 D-03，不能把缺数据填0。lineage、UI、存档统一 observed/estimated/derived/simulated/fixture-default/unknown 枚举及 referencePeriod/method；县固定显示「2020基准」及真实 kind，而非一律「观测」。
- R218：按 F10，M1 无须等 M2 才撤回演练。
- R219：rhaz 对绝对值先取整数部分、比较剩余与0.5再恢复符号，归一负零；禁止 floor(abs+0.5)。±0.5/±1.5及其±1ULP向量；CPU固定double顺序为契约真值，mpmath仅作远离格边的数学真值检验。
- R220：V1.0 执行基线优先；L1 后以版本化机器 schema 实施本文及未覆盖正文，变更需 ADR；M1 P2 内测初审、独立公开前该版本最终视觉与数据准确性签核，不等 P8。P8 B档/战略视图/音频明确可选。

## 4. 关闭记录与剩余验证

以下为**本次直接选定的规范修订及计划验证**，不是另一模型的独立复核或实测签字。R201–R212 对应 F01–F12，规范修订已纳入执行基线；R213–R220 按 §3。原先 22 项复查的映射：

| 原项 | 规范处置 | 验证阶段 |
|---|---|---|
| R004 / R101 | 保留几何/人口分层，F11窗口 | P1/P2/P3b |
| R006 / R104 | 保留真实连通例外，F08 | P2/P5 |
| R008 / R102 | 保留gridCore、CCJ-1，F02/F10 | P1a/P1 |
| R012 / R105 | F01/F03/F04 | P1a/P3a |
| R013 / R106 | F02/F04/F05 | P3a/P7 |
| R014 / R107 | F06 | P3a/VS |
| R015 / R109 | F07 | VS/P6 |
| R016 / R110 | F08/F09 | P2/P5/P6 |
| R017 / R103 / R108 | F02/F05/F09/F10/F11 | P1a/P2/P3a |
| R111 | F10 | P2公开前/P9 |
| R112 | F12 | P1a及后续双平台 |
| R113 | F11 | P1a/P3a/P4/P6/P7 |

不再为相同事项开启全量纸面审查。未验证的代码、真实性、许可、审批、硬件与性能必须在上述对应门禁实测，任何失败不得标通过。

## 5. 未确认事项：暂用安全默认，不伪造用户决定

仅 DEC-001 四项已明确确认。本轮用户授权加速选定工程方案，不视为对其他具体选择的批准。

| 决策 | 执行默认及限制 |
|---|---|
| D-02 | 现代场景不含军事；后续历史扩展另定 |
| D-03 | M1 仅按实际覆盖标统计口径，缺失标注；M2暂按原默认不可经营/市场参与提案，P6前决定 |
| D-04/D-05/D-13/U1 | 合成世界先行；真实源须逐源书面许可与处理审查；具体合规来源、ODbL及法规专业意见未核实，公开前必须确认 |
| D-06 | 2020区划为候选默认，P1定稿 |
| D-07 | 开发受控内部环境；未选正式托管服务/地区 |
| D-08 | 按可能商业化从严筛选许可，不等同确定商业化 |
| D-10 | 单省主政+全国沙盒为默认提案，P3a正式功能前确认 |
| D-14 | A14级与M系列iPad为候选，实际型号/OS须在正式真机门禁前确认；现阶段允许先做合成样例，但不签双平台通过 |

## 6. 第一项开发任务：P1a-01（可立即执行，不再讨论架构）

目标：先完成可实际运行、可复现、可移交的 A 档合成地图技术样例。只做这一包，不同时开发全国数据和复杂回合系统。

1. 初始化 TypeScript/Vite/Three.js + React 工程与固定依赖版本，记录真实安装/构建环境；无法联网安装就明确障碍，不假装运行。
2. 以 V0.3 网格数学及 §3 的 R219 修订生成固定种子约8万格合成世界，展示山地、平原、河湖、海岸、精灵、旗标；不使用未审查真实中国地图数据，不把合成数值称真实统计。
3. 实现 A 档地图平移、锚点缩放、格拾取、至少一个合成透镜、旗标详情，鼠标与触控统一入口，适配 iPad 横屏；明显标注「合成技术样例，非真实地图」。
4. 验收：构建和单元测试实际运行；全格索引往返、边界拾取、透镜切换、拖拽/缩放、渲染统计、控制台错误检查；可用环境截图和性能报告。真机不可访问则标未验证，不用模拟器冒充。
5. 交付完整源文件/仓库、运行命令、实际终端日志、截图与验收清单。完成再进入 P1a 其他技术样例（CCB/CCJ、PRNG、路由、双平台正式基准）及合法数据源审计。

分工：GPT 可直接完成主执行；Claude 后续只审代码和验收，不再重复重写 L1。除实际发现的缺陷与需要负责人决定的门禁外，不开新一轮架构讨论。


---

# 附录：V0.3 原始架构全文（保留作基础规范）

> 本附录与前文的最终技术决议共同构成执行基线；发生冲突时以前文 F01–F12 及其余定向修订为准。附录的未冻结/禁止编码/下一轮审查字样为历史状态，不再作为本执行基线的指令。DEC-001 原文仍有效。

# ChinaCiv《华夏文明》工程架构 V0.3（合并版）

> 由 DEC-001、00–20 分册与 CHANGELOG 按顺序合并生成，内容以分册为准。

---

# DEC-001 项目负责人正式决策记录

- 日期：2026-11-27
- 适用版本：V0.2 → V0.3
- 阶段：P0 架构审查（未冻结，禁止正式编码）
- 来源：项目负责人在对话中提交的决策原文（下文为要点整理，措辞以原文为准）

## 批准事项（用户已确认）

| 编号 | 决策 | 要点 |
|---|---|---|
| D-01 | 产品形态：M1 数据地图 + M2 回合制策略 | M1 必须能独立运行、展示和验收；不得为了提前做 M2 而牺牲 M1 的视觉质量与数据准确性 |
| D-11 | 主渲染：A 档为主，B 档后续可选 | A 档是 V1 正式验收内容；B 档不是 V1 发布的强制条件；保留 three.js + WebGL2 路线 |
| D-09 | 时间与统计口径 | 2020 基准；回合 0 = 2021Q1 未结算；每回合一个季度；最后可操作回合 2050Q4；第 120 次结算后终局；2020 年不变价；观测、估算、模拟结果明确区分 |
| D-12 | 正式支持平台：桌面端 + iPad | 桌面端键鼠；iPad 完整触控（M1、M2 核心功能均可用，包括双指缩放、拖拽、点选格子、城市详情、线路规划、政策调整、回合结算、存读档）；悬停/右键的关键功能都要有触控等效操作；适配横屏、不同尺寸与安全区；iPadOS Safari 真机测试列入正式验收，不能用 Playwright WebKit 或桌面模拟代替；iPad 单独制定性能预算、画质降级与内存限制，具体指标由 P1a 实测确定；核心功能与桌面一致，画质与布局可以不同 |

## 修订要求
- 在 V0.3 中把上述四项标为「用户已确认」，并同步更新受影响的分册、ADR、性能预算、测试矩阵、风险与验收。
- 逐条处理 GPT 第二次审查的 R101–R129 及尚未关闭的旧阻断项。
- 本决策没有涉及的其他待决策项，不得标为已确认。

## 冻结规则
本决策只确认上述四项方向，不代表批准 V0.2 整体架构，也不授权编码。V0.3 → GPT 第三次审查 → 全部阻断关闭 → 项目负责人最终确认 → 冻结 V1.0 → 进入 P1a。

---

<!-- 文件：00-README.md -->

# ChinaCiv《华夏文明》工程架构 V0.2

| 字段 | 值 |
|---|---|
| 文档版本 | **V0.3（根据 GPT-6.2 第二次审查 R101–R129 与决策 DEC-001 修订，待第三次审查）** |
| 历史版本 | V0.1、V0.2（`docs/architecture/v0.1/`、`v0.2/`，保留不改） |
| 审查记录 | `docs/architecture/reviews/`（GPT-R0、GPT-R2 原文） |
| 用户决策 | `docs/architecture/decisions/DEC-001.md`（D-01、D-09、D-11、D-12 用户已确认） |
| 审查回复 | `20-review-response.md`（R001–R019 关闭表 + 复议 + R101–R129） |
| 变更记录 | `CHANGELOG.md`（V0.2→V0.3）；`CHANGELOG-v0.2.md`（V0.1→V0.2） |
| 状态 | 未冻结，**禁止进入编码** |
| 日期 | 2026-11-27 |

## 1. 一句话定义

一款浏览器端（桌面 + iPad，DEC-001 D-12）的、基于**真实中国地理与社会经济数据**的《文明》风格六边形策略地图。分两步交付（DEC-001 D-01，用户已确认）：

1. **M1「华夏图鉴」**：可探索的真实数据地图——文明风格手绘感六边形地形、城市旗标、数据透镜、省/市详情面板、数据来源（参照对象 USACiv 的功能形态，见 01 §1）。
2. **M2「华夏文明」**：在同一地图上加入回合制发展策略模拟——城市、交通、经济、政策、AI。

## 2. 文件清单

| # | 文件 | 内容 |
|---|---|---|
| 00 | `00-README.md` | 总览、约定、冻结规则、事实源层级、审查指引 |
| 01 | `01-product-scope.md` | 产品、参照对象、里程碑、平台 |
| 02 | `02-tech-stack.md` | 选型、版本锁定、能力矩阵 |
| 03 | `03-repo-structure.md` | 目录、模块职责、依赖规则、生成顺序 |
| 04 | `04-geo-grid.md` | 坐标系、网格、gridCore、取整、交叉表 |
| 05 | `05-data-pipeline.md` | 数据源审计、分层包、合规与许可、管线 |
| 06 | `06-data-formats.md` | 包身份与 CCJ-1、CCB、窗口、ID 域、字段字典、存档 |
| 07 | `07-rendering.md` | A 档（V1）、B 档（可选）、帧预算分配 |
| 08 | `08-sim-core.md` | 确定性、规范状态 CSE-1、PRNG、命令与回放 |
| 09 | `09-city-population.md` | 城市与人口（城市×格贡献） |
| 10 | `10-transport.md` | 有向多模态网络、不可达语义、分配 |
| 11 | `11-economy.md` | 增加值、库存守恒的贸易分配、财政账本 |
| 12 | `12-strategy-ai.md` | 政策、事件、AI、计分 |
| 13 | `13-visual-ui.md` | 美术方向、UI、桌面与 iPad 交互 |
| 14 | `14-interfaces.md` | 接口契约、包链加载、Worker 协议 |
| 15 | `15-performance.md` | 桌面与 iPad 预算 |
| 16 | `16-testing.md` | 测试矩阵（含 iPad 真机） |
| 17 | `17-build-deploy.md` | 构建、发布描述符、撤回 |
| 18 | `18-roadmap-acceptance.md` | 阶段、三态门禁、验收 |
| 19 | `19-risks-decisions.md` | 决策、风险、ADR |
| 20 | `20-review-response.md` | 审查回复表 |

## 3. 全局约定

- **语言**：文档中文；代码标识符、Schema 字段英文（TS `camelCase`，Python 与数据列 `snake_case`）。
- **关键字**：「必须 / 禁止」= 硬约束；「应当」= 默认做法，偏离需 ADR；「可以」= 可选。
- **单位**：长度 m、面积 km²、货币「万元，2020 年不变价」、时间「回合」（1 回合 = 1 季度）。字节单位统一用 **MiB / KiB（1024 进制）**，网络速率用 Mbps（10⁶ bit/s）。
- **事实标注**：外部事实标注「已核实（来源）」或「待核实」。待核实项在对应门禁前必须关闭，不得作为事实写入代码、数据说明或宣传材料。
- **估算标注**：所有性能与规模数字若非实测，标注「估算」；验收以参考设备实测为准。
- **ADR**：偏离默认或否决方案时写 `docs/adr/ADR-xxx.md`，索引见 19。
- **事实源层级（回应 R129）**：L1 冻结前，本架构文档为规范来源；L1 冻结后，`packages/core-types/schema/` 中版本化的机器可读 schema（Zod 源及其生成的 JSON Schema、`fields.json`、`ccb-sections.json`、`state-fields.json`）为**机器事实源**，本文档对应章节由 CI 检查与 schema 一致（不一致即失败）。生成方向唯一：`Zod → JSON Schema → fields.json / ccb-sections.json / TS 类型 / Pydantic`，不允许手改生成物。

## 4. 冻结规则（两层，回应 R002）

| 层 | 冻结内容 | 冻结时点 | 变更代价 |
|---|---|---|---|
| **L1 架构基准 V1.0** | 模块边界、接口契约（14）、格式规范（06）、确定性与状态编码规范（08）、管线阶段与数据分层（05）、验收与门禁体系（18） | 全部阻断项（旧 + 新）关闭或「方案关闭、指定后续实测」+ 项目负责人最终确认 | 走 ADR + 双方审查 |
| **L2 网格实例 GridSpec** | 投影、半径 R、原点、行列、范围 AOI、轴向约定、`gridHash` | P1 结束时（验收 P1-G） | 全部世界包重建、旧存档显式失效 |

- L2 冻结前：不承诺任何存档兼容；所有产物携带 `gridHash`，不匹配一律拒绝加载。
- 测试区（如 `test-sichuan`）使用全国 GridSpec 的子窗口（同一原点、同一 TileId 编号），不另建网格。

## 5. 架构总览

```
            ┌────────────────────────── 离线（构建期，Python + 少量 Node）──────────────────────────┐
 原始数据 ─▶│ fetch → license_gate → normalize → grid → zonal / hydro / admin_xwalk / settlements     │
            │   → classify → [base-geo 包]                                                            │
            │   → stats_attach → networks → [scenario-raw 包]                                         │
            │   → calibrate(Node, 调用 sim) → [scenario-cal 包]                                       │
            │   → validate → compliance → package                                                     │
            └───────────────────────────────────────────┬───────────────────────────────────────────┘
                                                        │ 对象存储 + CDN（internal / public 隔离）
            ┌──────────────────────── 运行时（浏览器）──┴───────────────────────────────────────────┐
            │  主线程：AppShell ── ViewModelStore ── UI(React) / Renderer(three.js)                  │
            │                 │                                                                     │
            │                 └── SimClient ⇄ Sim Worker（M2 才启用；M1 不需要模拟）                │
            │  Asset Worker：CCB 解析 / KTX2 / glTF 解码                                            │
            └──────────────────────────────────────────────────────────────────────────────────────┘
```

核心原则：数据离线化、模拟与表现分离、确定性、数据驱动、合规隔离、可度量验收（与 V0.1 相同，细则见各分册）。

## 6. 给 GPT-6.2 的第三次审查指引

1. 先读 `20-review-response.md`：核对 9 个未关闭旧阻断（R004、R006、R008、R012–R017）与 13 个新阻断（R101–R113）是否在所述章节真正关闭。
2. 读 `CHANGELOG.md` 与 `decisions/DEC-001.md`：D-01、D-09、D-11、D-12 已由用户确认，**不再复议方向**；请审查 iPad 正式支持带来的新增要求是否在 01、02、07、13、14、15、16、18、19 中一致落地。
3. 只需审查剩余阻断与新增矛盾；新意见编号从 **R201** 起，复议写 `R1xx-复议`。
4. 给出：是否同意冻结 L1 V1.0；若不同意，列最小剩余清单。

---

<!-- 文件：01-product-scope.md -->

# 01 产品定义与范围

## 1. 参照对象：USACiv（已核实）

2026-11-27 用无头浏览器实际打开 https://karpathy.ai/usaciv/ （页面标题 "usaciv — the United States as a strategy game"），观察与源码检查结论如下：

| 方面 | 观察结果 | 证据 |
|---|---|---|
| 形态 | **可探索的数据地图**，以策略游戏的视觉语言呈现美国；未发现回合/结束回合机制 | 页面交互、`main.js` 中无回合逻辑 |
| 网格 | 尖顶六边形、odd-r 偏移布局；R = 25 km；117×90 = 10,530 格；客户端与 Python 管线共用网格数学 | `js/hex.js` 注释 "Mirrors pipeline/core/hexgrid.py"、`data/world.json` 的 `grid` |
| 渲染 | Canvas 2D 俯视；地形以手绘风格的格子 + 植被/山体精灵表现；城市为带人口数字的旗标；海洋为深蓝渐变 | `getContext("2d")`、截图 |
| 功能 | 顶栏国家指标；数据透镜（人口、收入、学历等，按组：People / Prosperity / Knowledge / Daily life / Faith / Hazards / Land）；城市与州详情面板；搜索；小地图；百科（Almanac）；分享（URL 状态）；资源、基础设施、军事、奇观、贸易等图层 | 页面文本、`data/lenses.json`、请求列表 |
| 数据 | 约 30 个美国政府公开数据源（ACS、BEA、BLS、NLCD、ETOPO、FAF 等），每源记录 URL、版本、sha256、许可 | `data/sources.json` |
| 人口落格 | 县人口按「格覆盖县面积的比例」分摊到格 | `lenses.json` density 说明 |

结论与对本项目的影响：

1. USACiv 本身**不是**回合制模拟。用户要求在其基础上覆盖城市、交通、经济、策略模拟系统，因此本项目 = **USACiv 式数据地图（M1）+ 回合制策略模拟（M2）**。
2. M1 是独立、可展示的里程碑，也是 M2 的地基；先交付 M1 能尽早验证数据、网格、渲染与合规路径（回应 R036、R041）。
3. 视觉上，USACiv 证明了「俯视 + 手绘感六边形 + 精灵 + 旗标」即可达到《文明》式观感。**A 档俯视手绘地图为 V1 主渲染形态并作为正式验收内容；B 档 3D 倾斜为后续可选，不是 V1 发布条件（D-11，用户已确认，DEC-001）。**
4. 本项目只借鉴「真实数据 + 策略游戏视觉语言」这一形态，**不复制 USACiv 的代码、美术、图标、界面布局或文案**；其代码与资产许可未核实，一律不使用。

## 2. 设计支柱

| 支柱 | 含义 | 可检查的体现 |
|---|---|---|
| P1 真实 | 数据可溯源，估算与观测区分 | 每个发布字段有字段级来源与 `observed/estimated/derived` 标记（06 §6）；初始控制量误差见 05 §8 |
| P2 可读 | 复杂信息通过地图直接看懂 | 每个系统都有对应透镜，3 次点击内可达 |
| P3 有后果 | （M2）决策带来空间上可见的变化 | 垂直切片验收 VS-A4 |
| P4 好看 | 每个缩放级别都值得截图 | 12 机位参考截图评审（13 §6） |

## 3. 里程碑定义

### 3.1 M1「华夏图鉴」（数据地图；D-01 用户已确认）

- **独立性**：M1 必须能独立运行、展示和验收；**不得为提前实现 M2 而牺牲 M1 的视觉质量与数据准确性**（DEC-001）。M1 界面不出现回合、结束回合等 M2 元素。
- **M1 独立发布标准**：P2 全部验收 + 对应许可门禁 + 审批/发布描述符门禁（17）+ 桌面与 iPad 真机性能与功能验收；不依赖 P3 之后任何阶段（回应 R128）。

- 全国真实地形六边形地图（A 档渲染），覆盖中国全部领土（含台湾省、香港、澳门、南海诸岛），周边国家地区为背景。
- 数据透镜（首批 ≥ 12 个）：人口密度、城镇化、人均 GDP、产业结构、地形、高程、土地覆盖、气候（气温/降水）、河流水系、交通网络、行政区划、数据缺失度。
- 城市旗标（地级及以上，按缩放显示县级）；省、市详情面板（统计数据 + 来源）；搜索；小地图；数据来源页；URL 状态分享。
- 不含任何模拟、回合、AI。

### 3.2 M2「华夏文明」（策略模拟，V1 规则集：发展竞赛）

> **设计约束（不变）**：现代场景**不设计中国境内地区间的军事冲突、割据、独立**等内容（ADR-013）。军事玩法仅可能出现在后续历史场景，需单独评估（D-02）。

- **玩家身份**：选择一个省级行政区「主政」（主模式），或「全国沙盒」（统管全部省份，无胜负）。权限模型见 08 §6.1。
- **时间口径（D-09，用户已确认，DEC-001）**：场景 `modern-2020base` 是「**以 2020 年数据为基准的情景**」，不是严格的历史截面：
  - 存量（人口、城市、网络）取 2020 年观测：人口以第七次全国人口普查（标准时点 2020-11-01）为准；网络以可获得的 2020 年末快照为目标（05 §4）；
  - 流量（GDP、财政等）取 2020 年度值，按**年值 ÷ 4** 换算为季度流量，V1 不建季节性；
  - 货币为 2020 年不变价，V1 不模拟通胀。
  - **回合 0 = 2021 年第 1 季度（未结算状态）**；每回合一个季度；最后一个可操作回合为 2050Q4（回合 119）；**完成第 120 次回合结算后进入终局**。
  - 观测数据、估算数据、模拟结果在数据、UI 与存档中明确区分（`kind = observed | estimated | derived | simulated`）。
- **单回合闭环**：观察 → 决策（命令立即生效，08 §6）→ 结束回合 → 结算 → 反馈。
- **玩家动作**（V1）：交通建设、功能区设置、经济政策与预算、发展树、国家项目投标、区域协作。
- **胜负**：终局「综合发展指数」排名（进步幅度为主，12 §6）。

## 4. 场景分层

| 层 | 内容 | 世界包层（05 §5） |
|---|---|---|
| 地理基底 | 网格、地形、海陆掩膜、水系、气候、土地覆盖、行政交叉表、城镇位置、合规层、渲染资产 | `base-geo` |
| 场景数据 | 人口、经济统计、交通网络、设施 | `scenario-raw` |
| 场景校准 | 模型参数校准结果 | `scenario-cal`（仅 M2） |
| 规则集 | 系统参数、建筑、政策、事件、胜利条件 | `content.json` |

## 5. 范围

### 5.1 V1 必须包含
- M1 全部（§3.1）。
- M2：31 个省级行政区（不含港澳台）可选；台湾省、香港、澳门**地图表示与玩法处理分开**：地图上完整、正确表示；玩法上 V1 作为不可经营区域，统计口径与是否参与全国市场由 D-03 决定（默认：参与全国市场计算，不参与竞赛）。
- 实体：城市（地级及以上，约 337 个，管线统计）；城镇（县级行政中心，约 2,800 余个，管线统计，不写死）。
- M2 七个系统的 V1 版本，但**内容数量在垂直切片通过后再扩充**（18）。
- 存档/读档（M2）、设置、新手引导（基础）。简体中文完整；英文 UI 框架就绪。

### 5.2 V1 非目标
多人联机、账号、服务器端模拟；军事系统；模组编辑器 UI；实时模拟；街道级精度；完整手机布局；Service Worker 离线（推迟，17 §3）；音频（推迟到 P8，基础 UI 音效除外）。

## 6. 目标平台（D-12，用户已确认，DEC-001）

**桌面端与 iPad 均为正式支持平台。** 核心功能一致；允许按硬件采用不同画质档位与交互布局。

| 项 | 桌面端 | iPad |
|---|---|---|
| 浏览器 | Chrome/Edge、Firefox、Safari 当期稳定版及前一主版本（确切版本 P1a 锁定） | iPadOS Safari（当期及前一主版本，P1a 锁定）；WebGL2 必需 |
| 输入 | 键盘 + 鼠标（含快捷键、悬停、右键） | **完整触控**：拖拽、双指缩放、点选格子、长按替代悬停、触控等效菜单替代右键；外接键盘/触控板可选支持 |
| 功能范围 | M1、M2 全部 | **M1、M2 核心功能全部可用**：地图浏览、透镜、城市/省详情、搜索、线路规划、功能区、政策调整、预算、回合结算、存读档、设置 |
| 布局 | 1920×1080 基准，最小 1280×720 | 横屏为正式验收方向；适配不同尺寸与安全区；竖屏可用但不作为 V1 验收项 |
| 参考设备 | Apple M1 8GB；Intel Iris Xe 16GB；GTX 1650 级 | **候选**：入门档（A14 级芯片 iPad）与高档（M 系列芯片 iPad Pro/Air）各一台——**具体型号待用户确认**（D-14） |
| 性能与内存 | 15 §2 | 15 §3：单独预算，**具体指标由 P1a 真机实测确定** |
| 验收 | 桌面真机 + Playwright | **iPadOS Safari 真机测试为正式验收项**，不得以 Playwright WebKit 或桌面模拟代替 |

- 4K：不作为实时 60 fps 验收档；仅作为截图导出目标（设备不支持时分块渲染或降尺寸并明示，合规元素不变，07 §4）。
- 手机：V1 非目标。

---

<!-- 文件：02-tech-stack.md -->

# 02 技术选型

选型原则：优先成熟、可调试、AI 协作熟悉的技术；新技术需 ADR。V0.1 的基础选型经 GPT-6.2 审查认可保留（R022）；V0.2 补充版本锁定、能力矩阵与可行性门禁。

## 1. 选型总表

| 领域 | 选型 | 说明 |
|---|---|---|
| 客户端语言 | TypeScript（`strict`） | — |
| 包管理 / 构建 | pnpm workspaces + Vite | — |
| 渲染 | three.js（WebGLRenderer + 自定义 GLSL ES 3.0 着色器） | A 档俯视地图为 V1 主形态（07） |
| UI | React 18 + CSS Modules + 设计 tokens | — |
| UI 状态 | Zustand | — |
| 模拟内核（M2） | 纯 TypeScript，Web Worker | — |
| Worker 通信 | 自研 RPC（14 §5） | — |
| 数据管线 | Python 3.12 + GDAL/rasterio/geopandas/shapely 2/pyproj/numpy | 流式窗口处理（05 §5.4） |
| 规则数据 | YAML → JSON 编译，Zod 校验 + 导出 JSON Schema | — |
| 纹理 / 模型 | KTX2（Basis Universal）/ glTF 2.0 + meshopt | — |
| 字体 | 思源宋体 / 思源黑体（SIL OFL 1.1） | — |
| 地图文字 | MSDF 图集（构建期按用字子集生成） | — |
| 测试 | Vitest、Playwright（Chromium/Firefox/WebKit）、fast-check、pytest | — |
| 规范 | ESLint（含 boundaries）+ Prettier；ruff + mypy | — |
| CI | GitHub Actions | — |

### 1.1 版本锁定（回应 R022）

- **不使用版本区间**。P1a 结束时在 `docs/adr/ADR-016-dependency-lock.md` 记录确切版本：Node、pnpm、TypeScript、Vite、three、React、Zustand、Zod、Vitest、Playwright（含其浏览器构建号）、Python、GDAL、PROJ（含 proj-data 版本）、rasterio、geopandas、shapely、numpy、pyproj、uv。
- 锁文件（`pnpm-lock.yaml`、`uv.lock`）入库；管线 Docker 镜像以 digest 引用。
- 升级任何上述依赖 = 单独 PR + 回放测试 + 视觉回归 + 管线可复现性检查。

### 1.2 自研与依赖清单（回应 R022：明确「依赖还是自研」）

| 功能 | 决定 | 理由 |
|---|---|---|
| YAML 解析 | 依赖 `yaml`（开发依赖，仅构建期） | 成熟 |
| CRC-32 | 自研（~30 行，查表） | 规范简单，需与 Python `zlib.crc32` 对齐 |
| xxHash32 | 自研（~80 行），用官方测试向量验证 | sim 内需确定性、零依赖 |
| PCG32 | 自研（双 uint32 实现，08 §2.2） | 同上 |
| MSDF 生成 | 开发依赖 `msdf-atlas-gen`（命令行，构建期）——**许可与可用性待 P1a 核实** | 无则退回 SDF（单通道）方案 |
| KTX2 编码 | 开发依赖 Basis Universal 命令行（`basisu`）或 KTX-Software `toktx`——**P1a 二选一并核实许可** | — |
| KTX2 / meshopt 解码 | 运行时使用 three.js 附带的 KTX2Loader（Basis 转码器 WASM）与 meshopt 解码器 | 随 three 版本锁定 |
| JSON Schema → Pydantic | 开发依赖 `datamodel-code-generator` | — |

### 1.3 运行时依赖白名单

`three`（含其 examples 中的 KTX2Loader、GLTFLoader 与对应 WASM 解码器）、`react`、`react-dom`、`zustand`、`zod`。新增需 ADR。

## 2. 关键选型理由（ADR 摘要）

### ADR-001 Web 优先
浏览器 + WebGL2，链接即可分享，自动化验收方便；否决 Unity / Godot（首包、Web UI 集成、CJK、AI 协作可审查性）。

### ADR-002 three.js 自研渲染（V0.2 修订）
- USACiv 使用 Canvas 2D 即可达到文明式观感（01 §1）。本项目仍选 **WebGL（three.js）**，理由是规模与交互：中国可经营格约 2.6 万（USACiv 约 1 万格总量，估算），加上海洋与背景约 8 万格，叠加实时透镜切换、热力插值、数千标注、缩放平滑与后续 M2 的线路/流量动画，Canvas 2D 在 1080p@DPR2 下逐帧重绘的成本不可控（估算，未实测）；WebGL 以单着色器 + 数据纹理即可完成整图绘制（07 §3）。
- 否决 MapLibre/deck.gl（Web Mercator、风格化与六边形能力弱）、Babylon（无决定性优势）、裸 WebGL（工作量）。WebGPU 推迟。
- **WebGL2 不可用**：显示「浏览器不支持」页，**不提供运行时 Canvas 模式**。Canvas 2D 预渲染瓦片仅作为 P1a 门禁判定为 STOP 时的**架构级替代方案**（需 ADR 与用户批准），不是并行实现（回应 R124）。

### ADR-003 模拟内核 TypeScript
规模可控（R022 静态估算认可）；WASM 仅作单热点退路，需 ADR。

### ADR-004 表驱动状态，不引入通用 ECS。
### ADR-005 React DOM UI + GPU 地图文字。
### ADR-006 Python 管线，契约为世界包格式与 JSON Schema。
### ADR-015 V1 主渲染形态为 A 档俯视手绘地图，3D 倾斜为可选 B 档（07；D-11 用户已确认）。
### ADR-021（新）桌面 + iPad 双正式平台：iPadOS Safari 为一等目标浏览器，能力探针与性能预算分平台制定（01 §6、15 §3）。

## 3. GPU / 浏览器能力矩阵（回应 R023、R124；桌面与 iPad 分别探测）

V1 只依赖 **WebGL2 核心能力**；P1a 能力探针在全部参考设备（含 iPad 真机）上记录下列项，**数值门槛在 P1a 结束时写入 ADR-016**：

| 能力 | 用途 | 依赖方式 | 不满足时 |
|---|---|---|---|
| WebGL2 上下文 | 全部 | 必需 | 「浏览器不支持」页 |
| `MAX_TEXTURE_SIZE`（需 ≥ 4096） | 全国晕渲纹理（约 1040×1100）、图集 2048² | 必需 | 同上 |
| `MAX_ARRAY_TEXTURE_LAYERS`、`MAX_TEXTURE_IMAGE_UNITS`、`MAX_COMBINED_TEXTURE_IMAGE_UNITS` | 材质/精灵/字形数组的层数与同时绑定数 | 必需（按实测确定图集页数） | 拆分图集页或降低同屏材质数 |
| `MAX_RENDERBUFFER_SIZE`、`MAX_VIEWPORT_DIMS` | 渲染目标与导出 | 必需 | 导出改分块渲染 |
| 片元着色器整数与 `highp` 精度（`getShaderPrecisionFormat`） | `texelFetch`、格坐标反算 | 必需 highp | 「不支持」页 |
| 整数纹理 `R16UI/R8UI/RGBA8UI` + `texelFetch` | 格数据、高程 | 必需（WebGL2 核心） | — |
| `R32F`（不过滤） | 连续值透镜 | 必需（核心） | 回退 RGBA8 打包 |
| KTX2 转码目标（ASTC/ETC2/BC7/BC3） | 压缩纹理 | 运行时探测 | 回退未压缩低分辨率资源（体积预算单列） |
| `EXT_color_buffer_float` | 仅 B 档 | 可选 | 关闭对应效果 |
| 上下文丢失事件 | — | 必须处理 `webglcontextlost/restored` | — |
| `WEBGL_lose_context` | **仅测试用**，模拟上下文丢失 | 不作为生产依赖 | — |
| iPad：可用内存与热降频行为 | 资源上限与画质档 | P1a 真机实测 | 设定 iPad 专用档位（15 §3） |

着色器统一使用 GLSL ES 3.00，色彩空间约定：材质与 UI 颜色在 sRGB 中定义，渲染在线性空间，输出 sRGB（具体 three.js 设置在 P1a 按锁定版本确认）。

## 4. 开发环境

Node 22 LTS、pnpm 9、Python 3.12（uv）、GDAL/PROJ（Docker 镜像为准）。所有版本号以 ADR-016 为准。

---

<!-- 文件：03-repo-structure.md -->

# 03 仓库结构与模块职责

## 1. 目录结构（Monorepo）

```
chinaciv/
├── apps/
│   └── web/                         # 游戏客户端入口（Vite 应用）
│       ├── index.html
│       ├── src/
│       │   ├── main.tsx             # 启动：能力检测 → 加载世界包 → 挂载 AppShell
│       │   ├── shell/               # AppShell：协调 sim-worker / renderer / ui
│       │   │   ├── AppShell.ts
│       │   │   ├── SimClient.ts     # 主线程侧 RPC 客户端
│       │   │   ├── ViewModelStore.ts# 把 sim 差量折叠为只读视图（供 UI 与渲染）
│       │   │   └── InputRouter.ts   # 键鼠 → 相机 / 拾取 / 工具模式
│       │   ├── screens/             # 主菜单、新游戏、游戏中、读档、设置
│       │   └── dev/                 # 仅 dev 构建：调试面板、数据检视器、性能 HUD
│       └── vite.config.ts
│
├── packages/
│   ├── core-types/                  # 跨包共享：ID 类型、枚举、常量、Zod schema、生成的类型、纯值转换（如回合↔年季）
│   │   └── src/{ids.ts, enums.ts, time.ts, schema/, generated/}
│   │       └── schema/{ccb-sections.json, fields.json, state-fields.json, manifest.schema.json, …}   # L1 冻结后的机器事实源（00 §3）
│   ├── hexgrid/                     # 六边形网格数学（坐标转换、邻接、距离、线、环、区域）
│   ├── world-format/                # 世界包 / 存档二进制容器读写、版本迁移、校验
│   ├── sim/                         # 确定性模拟内核（无 DOM / 无 WebGL / 无 Date / 无 Math.random）
│   │   └── src/
│   │       ├── state/               # GameState 定义：TileStore、实体表、全局量
│   │       ├── commands/            # Command 定义、校验器、执行器
│   │       ├── systems/
│   │       │   ├── population/
│   │       │   ├── city/
│   │       │   ├── transport/       # 网络、建设、寻路、流量分配
│   │       │   ├── economy/         # 生产、贸易、价格、财政
│   │       │   ├── policy/          # 政策、发展树
│   │       │   ├── events/
│   │       │   ├── projects/        # 国家项目竞标
│   │       │   ├── ai/
│   │       │   └── scoring/
│   │       ├── turn/                # 回合管线编排（固定顺序）
│   │       ├── math/                # 定点数、确定性数学函数、PRNG
│   │       ├── diff/                # 状态差量生成
│   │       └── index.ts             # 公开 API：createGame / applyCommand / endTurn / snapshot
│   ├── sim-worker/                  # Worker 宿主：消息协议、调度、存档序列化
│   ├── renderer/                    # three.js 渲染层（只依赖 RenderView 接口）
│   │   └── src/
│   │       ├── core/                # Renderer 生命周期、帧循环、画质档位
│   │       ├── camera/              # 战略相机（俯仰、缩放、平移、惯性、边界）
│   │       ├── terrain/             # 地形 chunk、LOD、材质 splat
│   │       ├── water/               # 海洋、湖泊、海岸线
│   │       ├── rivers/              # 河流带状网格
│   │       ├── hexoverlay/          # 六边形网格线、选中高亮、区域着色
│   │       ├── overlays/            # 数据叠加层（人口、产业、货流等）
│   │       ├── features/            # 植被、城市建筑群、基础设施模型（实例化）
│   │       ├── network/             # 道路/铁路/航线的线型渲染、流量动画
│   │       ├── labels/              # MSDF 标注、碰撞避让
│   │       ├── fog/                 # 迷雾 / 未探索区（水墨风格）
│   │       ├── strategic/           # 战略视图（2D 舆图风格）
│   │       ├── post/                # 后处理：色调映射、AO、调色 LUT、描边
│   │       ├── picking/             # 屏幕坐标 → 六边形 ID
│   │       ├── assets/              # 资源加载、缓存、释放（KTX2/glTF/chunk）
│   │       └── gpu/                 # 着色器源、材质抽象（为 WebGPU 迁移预留）
│   ├── ui/                          # React 组件库 + 设计 tokens + 图表组件
│   │   └── src/{tokens/, primitives/, panels/, charts/, hud/, i18n/}
│   ├── content/                     # 规则数据源（YAML）与编译器
│   │   ├── rules/                   # buildings.yaml, policies.yaml, techtree.yaml, events.yaml, victory.yaml, sectors.yaml ...
│   │   ├── locales/                 # zh-CN.yaml, en.yaml
│   │   └── compiler/                # YAML → 校验 → content.json（附 hash）
│   ├── almanac/                     # M1 数据地图逻辑：透镜定义、统计汇总、搜索索引、URL 状态（无模拟）
│   └── test-utils/                  # 测试夹具：合成世界（含规定的默认驱动量）、确定性回放工具、golden vectors
│
├── pipeline/                        # Python 数据管线
│   ├── pyproject.toml
│   ├── chinaciv_pipeline/
│   │   ├── cli.py                   # `ccp run <stage|all> --scenario modern-2020base`
│   │   ├── registry.py              # 阶段注册、依赖、内容哈希缓存
│   │   ├── sources/                 # 每个数据源一个模块：下载、校验 checksum、许可元数据
│   │   ├── stages/                  # 10_fetch … 99_package（见 05）
│   │   ├── grid/                    # 六边形网格生成（与 packages/hexgrid 数学一致，见 04）
│   │   ├── compliance/              # 合规检查：必须要素清单、边界来源校验
│   │   ├── validate/                # 数据质量断言
│   │   └── io/                      # 世界包写出（与 world-format 契约一致）
│   ├── config/
│   │   ├── sources.yaml             # 数据源清单（URL、版本、checksum、许可）
│   │   ├── grid.yaml                # 投影与网格参数
│   │   └── scenarios/modern-2020base.yaml
│   └── tests/
│
├── assets-src/                      # 美术源文件（Git LFS）：.blend、PSD、参考图
├── assets/                          # 美术产物（glTF/KTX2），由 tools/ 从 assets-src 导出
├── data/                            # 不入库（.gitignore）：raw/、cache/、out/
├── tools/
│   ├── calibrate/                   # Node 脚本：加载 scenario-raw + sim，输出 calibration.json（05 §5.9）
│   ├── glyphs/                      # MSDF 字形图集生成（按用字子集）
│   ├── textures/                    # KTX2 批量转码
│   ├── bench/                       # 性能基准脚本（Playwright 驱动）
│   └── schema/                      # JSON Schema → TS 类型 / Pydantic 模型 代码生成
├── tests/
│   ├── e2e/                         # Playwright E2E
│   ├── visual/                      # 视觉回归（参考截图 + 阈值）
│   └── replays/                     # 确定性回放用例（命令日志 + 期望哈希）
├── docs/
│   ├── architecture/                # 本架构文档（按版本分目录）
│   ├── adr/                         # ADR-xxx.md
│   └── data-sources/                # 每个数据源的许可原文存档与使用说明
├── .github/workflows/
├── package.json / pnpm-workspace.yaml / tsconfig.base.json / .eslintrc.cjs
└── Makefile                         # 统一入口：make data / make dev / make test / make build
```

## 2. 模块职责与边界

| 包 | 职责 | 允许依赖 | 禁止 |
|---|---|---|---|
| `core-types` | 共享类型、ID、枚举、schema、纯值转换与 schema 校验 | 无（仅 zod） | 业务规则、I/O、状态 |
| `hexgrid` | 纯数学 | `core-types` | 状态、I/O |
| `world-format` | 二进制容器、世界包/存档读写、迁移 | `core-types` | three、react、sim |
| `almanac` | M1 透镜与统计汇总（纯函数） | `core-types`、`hexgrid`、`world-format` | three、react、sim |
| `sim` | 游戏规则与状态演化 | `core-types`、`hexgrid`、`world-format`（只读解码） | DOM、WebGL、`Date`、`Math.random`、`performance`、`setTimeout`、浮点超越函数（见 08）；计时由宿主通过 step 观察者完成（08 §5.1） |
| `sim-worker` | Worker 宿主与协议 | `sim`、`world-format`、`core-types` | three、react |
| `renderer` | 画面 | `core-types`、`hexgrid`、`world-format`、three | `sim`（只能通过 `RenderView` 接口） |
| `ui` | React 组件 | `core-types`、react、zustand | three、`sim` |
| `content` | 规则数据编译 | `core-types` | 运行时被 `sim` 以 JSON 形式加载，不被 import 代码 |
| `apps/web` | 组装 | 以上全部 | 在 shell 外直接调用 sim |

依赖方向（箭头 = 可依赖）：

```
apps/web ─▶ ui ───────────────┐
   │       renderer ──────────┤
   │       sim-worker ─▶ sim ─┼─▶ hexgrid ─▶ core-types
   │                          └─▶ world-format ─▶ core-types
   └─▶（所有包）
```

- **强制方式**：`eslint-plugin-boundaries` + CI `pnpm lint` 阻断合并。`sim` 包：`no-restricted-globals`（`Date`、`performance`、`setTimeout`、`setInterval`、`fetch`、`crypto`）+ `no-restricted-properties`（`Math.random` 与 08 §2 列出的全部超越函数）+ `no-restricted-syntax`（禁止对 `Math` 解构或别名赋值，如 `const M = Math`、`const { sin } = Math`）。
- **规则自测**：`packages/sim/test/lint-fixtures/` 放置故意违规文件（含别名绕过写法），CI 断言 ESLint 对每个文件都报错（ESLint 具体版本行为在 P1a 锁定后验证）。
- **构建验证**：`sim` 包必须能在纯 Node（无 DOM lib）下 `tsc --noEmit` 通过（tsconfig 中 `lib: ["ES2022"]`，不含 `DOM`）。

## 3. 命名约定

- 文件：TS 源 `PascalCase.ts`（类/组件）、`camelCase.ts`（函数模块）；Python `snake_case.py`。
- ID 类型使用品牌类型（branded type），如 `type CityId = number & { __brand: 'CityId' }`，禁止裸 `number` 混用（见 14）。
- 规则数据键：`snake_case` 字符串 ID，如 `building.industrial_park`、`tech.high_speed_rail`；运行时映射为紧凑整数索引（编译期生成，稳定排序）。

## 4. 分支与提交

- 主干开发：`main` 受保护；功能分支 `feat/<阶段>-<主题>`；每个 PR 对应一个任务包。
- 提交信息：Conventional Commits（`feat(sim): …`、`fix(renderer): …`、`data(pipeline): …`）。
- 每个 PR 必须附：任务包编号、验收项自检结果、相关命令的真实输出。

## 5. 生成与编译顺序（回应 R024）

```
1. core-types/schema（Zod 源）──▶ tools/schema 生成：JSON Schema、TS 类型、Pydantic 模型（生成文件入库，CI 检查是否过期）
2. content/compiler：YAML ──▶ content.json（依赖 1 的 schema）
3. pipeline：base-geo / scenario-raw 包（依赖 1 的 ccb-sections.json、fields.json）
4. tools/calibrate：scenario-raw + sim + content ──▶ calibration.json ──▶ scenario-cal 包（仅 M2）
5. apps/web 构建：引用世界包 identity（06 §1.2）与 contentHash
```
`make` 目标与上述顺序一一对应（17 §1）。

## 6. 工具与资产版本登记（回应 R129）
`tools/REGISTRY.yaml` 登记所有影响产物字节的工具与输入：字体文件（名称、版本、sha256）、MSDF/KTX2 工具（版本、命令行参数）、content 编译器版本、校准脚本版本、美术源文件 hash。每个阶段的缓存键（05 §7）与世界包 `licenseSetHash` 同级引用该登记的 hash。

---

<!-- 文件：04-geo-grid.md -->

# 04 坐标系、投影与六边形网格

本文件分两部分：**网格规范**（算法与约定，L1 冻结）与 **GridSpec 实例**（具体数值，L2 在 P1-G 冻结，见 00 §4）。

## 1. 坐标参考系

| 用途 | 坐标系 | 约定 |
|---|---|---|
| 原始数据基准 | WGS84 经纬度 | **轴序固定为 (lon, lat)**：pyproj 一律 `always_xy=True`；GeoJSON/GeoPackage 写出均为 (lon, lat) |
| 数据基准说明 | CGCS2000 与 WGS84 视为同一基准，不做转换 | 二者差异的量级在 P1 报告中按 PROJ 实际转换管道核实（V0.1 「厘米级」说法改为待核实，回应 R025） |
| 游戏平面坐标 | Albers 等积圆锥 | `+proj=aea +lat_0=0 +lon_0=105 +lat_1=25 +lat_2=47 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs`；x 向东、y 向北 |
| 渲染世界坐标 | 右手系，单位 km | `worldX = (x − sceneOriginX)/1000`，`worldZ = −(y − sceneOriginY)/1000`（**北 = −Z**），`worldY` = 高程（km × 夸张系数）；A 档相机沿 −Y 俯视、屏幕上方为北 |

- 投影选择理由与 V0.1 相同（等积）。中国范围内的最大角度畸变、最大线性比例误差在 P1 由 PROJ 计算写入 `reports/projection.md`（不预先声称数值）。
- **禁止** Web Mercator 作为游戏投影；**禁止**使用 GCJ-02/BD-09 加偏坐标源。

## 2. 网格规范（L1）

### 2.1 基本约定

| 项 | 约定 |
|---|---|
| 朝向 | 尖顶（pointy-top） |
| 存储布局 | 偏移坐标 odd-r（奇数行右移半格），行优先 |
| 算法坐标 | 轴向 `(q, r)`，立方 `s = −q − r` |
| 行方向 | `row` 随 y 增大（向北）递增；`row = 0` 为最南行 |
| 常量 | `R`（外接圆半径，**整数米**）；`SQRT3` = IEEE 754 双精度位模式 **`0x3FFBB67AE8584CAA`**（= 1.7320508075688772，两语言以位模式常量定义，不在运行时计算）；`W = SQRT3·R`；`H = 1.5·R`；`SQRT3_OVER_3 = SQRT3 / 3`（双精度一次除法，结果作为常量登记位模式） |
| 原点 | `(originX, originY)`：**整数米**，为第 (col 0, row 0) 格中心 |

### 2.2 公式（`packages/hexgrid` 与 `pipeline/grid` 必须逐位一致）

- 偏移 → 中心：`x = originX + W·(col + 0.5·(row & 1))`，`y = originY + H·row`
- 偏移 ↔ 轴向：`q = col − (row − (row & 1)) / 2`，`r = row`；`col = q + (r − (r & 1)) / 2`（整数除法，row 非负故无负数歧义）
- 轴向 → 中心：`x = originX + R·(√3·q + (√3/2)·r)`，`y = originY + 1.5·R·r`
- 邻接方向（轴向，逆时针，索引 0 = 东）：`0 (+1,0) 东；1 (0,+1) 东北；2 (−1,+1) 西北；3 (−1,0) 西；4 (0,−1) 西南；5 (+1,−1) 东南`。所有遍历邻居的代码按此顺序。
- 距离：`(|dq| + |dr| + |dq+dr|) / 2`

### 2.3 点 → 格（「CPU 契约真值」，回应 R025、R114）

区分两种真值：
- **数学几何真值**：以无理数 √3 定义的理想六边形。
- **CPU 契约真值**：下述双精度算法的输出，按规定的运算顺序逐步计算。**所有程序（TS、Python、测试）以 CPU 契约真值为准**；数学真值只用于检验算法在远离边界处正确。

```
输入：平面点 (x, y)（双精度）
1. px = (x − originX) / R ;  py = (y − originY) / R            （先减后除）
2. qf = SQRT3_OVER_3 * px − py / 3 ;  rf = (2 * py) / 3 ;  sf = (−qf) − rf
3. 初次取整 rq = rhaz(qf)，rr = rhaz(rf)，rs = rhaz(sf)
   rhaz(v)（round half away from zero，避免 floor(|v|+0.5) 的加法舍入误差）：
     f = floor(v); d = v − f            （d 在 [0,1) 内精确可得）
     d > 0.5 → f + 1 ； d < 0.5 → f ； d == 0.5 → (v > 0 ? f + 1 : f)
4. dq = |rq − qf|，dr = |rr − rf|，ds = |rs − sf|
5. 若 dq > dr 且 dq > ds → rq = −rr − rs
   否则若 dr > ds        → rr = −rq − rs
   否则                  → （重算 s，不存储）
   实际平局优先级：s 优先于 r 优先于 q 被重算（dq = dr > ds 时重算 r）
6. (col, row) = 轴向转偏移；越界 → null
```

- 禁止 Python `round()`、JS `Math.round()`；两语言都用上面的 `rhaz`。
- **golden vectors**（`hexgrid-vectors.json`，以输入的双精度位模式存储）：10 万随机点；全部格中心；顶点与边中点及其 **±1 ULP** 邻点；负坐标、负零；网格外；最远角；**每个候选 R（12/16/20 km）各一套**。
- **数学真值检验**：距最近格边 > 1e-6 km 的随机点，用 `mpmath`（100 位精度 √3）计算的结果必须与契约真值一致；边界附近只检验跨语言一致，不比数学真值。
- GPU（float32）重算同一公式仅用于视觉（格线、着色），边界 ±1 px 不一致可以接受；**拾取、模拟、统计只用 CPU 契约真值**。实体（旗标、线路）拾取按屏幕空间优先级单独验收（07 §5）。

### 2.4 ID 与 Chunk

- `TileId = row · cols + col`（uint32，**始终为全国 GridSpec 下的全局编号**）；越界无 ID。
- **窗口（回应 R103）**：测试区等子区域包使用 `window = {col0, row0, cols, rows}`（全国网格中的矩形偏移窗口）。窗口包内每格数组按窗口紧凑存储，长度 = `window.cols × window.rows`；`localIndex = (row − row0)·window.cols + (col − col0)`；TileId 不变。全国包的 window = 整个网格。所有读取器通过 `tileIndex(tileId)` 访问，禁止直接用 TileId 当数组下标。
- Chunk = 32×32 格（偏移对齐），`ChunkId = chunkRow · chunkCols + chunkCol`。

## 3. GridSpec 实例（L2，P1-G 冻结）

```jsonc
// gridCore：参与 gridHash 计算的全部字段（不含 gridHash 自身）
{
  "aoiId": "china-full-v1",
  "aoiSha256": "…",                 // AOI 多边形文件（GeoJSON，规范化后）的 SHA-256
  "chunkSize": 32,
  "cols": <int>, "rows": <int>,
  "layout": "odd-r",
  "orientation": "pointy",
  "originX": <int>, "originY": <int>,
  "proj": "+proj=aea …",
  "radiusM": 12000
}
// gridHash = "sha256:" + hex(SHA-256(CCJ-1(gridCore)))   CCJ-1 规范 JSON 见 06 §1.2
// GridSpec = gridCore + { gridHash }
```

### 3.1 半径 R 的选择（候选，P1 实测后定）

| R | 单格面积 | 中国陆地格数（估算） | 说明 |
|---|---|---|---|
| 12 km | 374.12 km² | ~2.6 万 | V0.1 默认；东部县级可区分 |
| 16 km | 665.1 km² | ~1.4 万 | 性能余量大 |
| 20 km | 1,039.2 km² | ~0.9 万 | 接近 USACiv（R=25 km、全美约 1 万格）的视觉密度 |

决策指标（P1-G）：(a) 县级中心落格冲突率（东部 6 省）；(b) 地级市中心冲突率（目标 0，冲突时按 §4.3 处理）；(c) **可读性**：用 P1a 样例渲染器（18 P1a-A5）在测试区以三个候选 R 各渲染同一组机位（桌面与 iPad 各一套），用户评审——**不依赖 P2 的完整 M1**（回应 R113）；(d) P1a 的渲染与模拟基准。以 (b)、(c) 为主。

规模估算（R = 12 km，AOI 包围盒约 5,400 × 5,700 km）：cols ≈ 260，rows ≈ 317，总格 ≈ 8.2 万（估算，P1 以实际 AOI 为准）。

## 4. 栅格 / 矢量 → 网格的映射规则

### 4.1 统计归属与管理归属分离（回应 R004、R101）

**分层**：
| 产物 | 所在包 | 内容 |
|---|---|---|
| 几何交叉表 `xwalk_geo` | `base-geo` | CSR：`(tile, county_idx, land_area_m2)`，仅几何，不含人口 |
| 人口交叉表 `xwalk_pop` | `scenario-raw` | **与 `xwalk_geo` 同一 CSR 索引对齐**：`pop_weight f64`、`pop_int i32`（该县在该格的**整数人口贡献**） |
| 管理归属 `manage_county_idx` | `base-geo` | 每格唯一：交集陆地面积最大的县；平局取区划代码较小者 |

**几何预处理**：县级多边形先做拓扑清理——重叠区域归区划代码较小的县，缝隙（落在陆海掩膜陆地内、不属于任何县）归入伪单元 `unassigned` 并输出报告；不强行填补。只与海洋相交的县记录为「无陆地交集」并报告（应为 0，非 0 时人工核对）。

**人口落格**（scenario-raw，`62_population`）：
1. `pop_weight(tile, county)` = 人口栅格在该交集区域内的总和（守恒重映射，不对计数做双线性重采样）。
2. 某县权重总和为 0 → 退回按 `land_area_m2` 分摊。
3. 每县按权重用**最大余数法**分配普查整数人口到 `pop_int`（余数相同按 TileId 升序），保证 `Σ_tiles pop_int(·, county) = 普查值`。
4. 格总人口 = `Σ_county pop_int(tile, ·)`。
5. 县、地、省汇总一律对 `pop_int` 按统计归属（交叉表）求和——**不按管理归属汇总**，因此共享格不会让县人口消失（审查 R101 的反例：A 60、B 40 共享一格，A、B 的县汇总仍分别为 60、40）。

**M2 中的动态归属**：模拟只维护「城市 × 格」人口贡献（09 §3.3），由县贡献按县所属地级市合并得到；县级数字在 M2 面板中固定显示「2020 观测」（标注），不做县级模拟。

**面积**：省级陆地面积 = Σ交叉表 `land_area_m2`；对照官方面积时只在口径相同时比较（05 §8 V1）。

### 4.2 连续与分类变量
- 连续值（高程、气温、降水）：面积加权统计，高程额外存 `min/max/std/p90`。
- 分类值（土地覆盖）：每格类别直方图 → 前 3 类及占比；另存各类面积。高分辨率分类栅格先在源 CRS 下按 100–250 m 窗口预聚合为「类别面积直方图」，再分区汇总（05 §5.4，回应 R029），精度对照报告随 P1 提交。

### 4.3 城镇点落格（回应 R005、R115）
- 锚点 = 行政中心真实坐标，持久化为整数米平面坐标 `anchor_x, anchor_y`（不挪动）；`anchorTile` 由 §2.3 计算。
- 冲突（多城镇同格）：主城镇绘制旗标，附属城镇仍为独立实体（人口与统计独立），旗标布局在锚点附近按固定规则错开（07 §3.4）。
- **锚点格的主视觉地形可以是 `ocean`**（如小岛城镇）；城镇与岛屿的有效性与绘制由 `has_land`、小岛要素表与锚点决定，**不改变格的视觉分类**（统一 V0.2 中 04 与 05 的矛盾，05 §5.3 相应删除「最低陆地类」规则）。

### 4.4 海陆与地形分层
| 字段 | 定义 |
|---|---|
| `has_land` | **独立有效位**（u8 0/1），来自陆海掩膜与小岛要素表；**不从量化后的面积推断**（量化可能把极小岛面积舍入为 0） |
| `land_area_m2` | 格内陆地面积（交叉表求和，m²，u32） |
| `inland_water_area` | 内陆水体面积 |
| `terrainClass` | 视觉/玩法主地形类（05 §5.6），可为 `ocean` 即使 `has_land = 1` |
| `domain` | 中国可经营 / 中国不可经营 / 外域背景 / 纯海域 |
| `islandFeature` | 小岛点/面要素（独立表；合规与渲染用） |

### 4.5 矢量线
- 渲染使用简化原始矢量；模拟使用格化结果（河流边掩码、网络格序列）。
- 国界、省界的**显示**必须来自合规矢量源（05 §6），格子归属边界只作为游戏叠加层（「政区格」示意）。

## 5. 渲染精度
渲染坐标 km、相对场景原点；全图约 ±2,900 km，float32 绝对精度约 2.4×10⁻⁴ km（≈0.24 m），满足需求。

## 6. 验收

| 编号 | 内容 | 阶段 |
|---|---|---|
| G1 | hexgrid TS 与 Python 对 §2.3 全部 golden vectors 结果 100% 一致 | P1a |
| G2 | 全格往返（TileId → 中心 → TileId）恒等 | P1a |
| G3 | 格多边形椭球面积与 `(3√3/2)R²` 相对误差 ≤ 0.1%（等积性）——抽样 1,000 格 | P1 |
| G4 | 投影畸变报告 | P1 |
| G5a | 几何交叉表：每县 Σ`land_area_m2` 与县多边形（拓扑清理后）陆地面积相对误差 ≤ 0.5%；`unassigned` 与无交集报告已人工核对 | P1 |
| G5b | 人口交叉表：每县 Σ`pop_int` = 普查值（整数相等）；共享格、零权重县、两县余数平局、无管理格县 fixture 通过 | P2 |
| G6 | 冲突率报告 + R 值决策 ADR + GridSpec 冻结（`gridHash` 写入 ADR） | P1-G |

---

<!-- 文件：05-data-pipeline.md -->

# 05 真实数据处理管线

## 1. 原则

1. **可复现（范围明确，回应 R009）**：在**锁定环境**（管线 Docker 镜像 digest）+ **完整输入清单**（§3.1）相同时，输出的规范化世界包文件逐字节一致；跨平台/跨环境只保证语义容差（数值差 ≤ 量化步长），不保证逐字节。
2. **可溯源**：字段级来源（06 §6）。观测值、估算值、派生值明确区分，**缺失不以 0 代替**。
3. **许可先行**：未核实许可的数据不进入任何对外分发产物；内部使用也遵守源许可条款（§3）。
4. **合规隔离**：合规图层独立来源、独立文件、独立校验与审批登记（§6）。
5. **增量与正确失效**：阶段缓存键覆盖全部上游依赖（§7）。

## 2. 数据源清单与覆盖审计（回应 R026）

V0.1 的 S01–S17 清单保留（许可状态列不变：除已核实项外均为「待核实」）。

> 「许可状态」：**已核实**＝已见许可原文/官方说明；**待核实**＝P1a 必须核实原文。

| ID | 数据 | 候选源 | 分辨率/粒度 | 用途 | 许可状态 |
|---|---|---|---|---|---|
| S01 | 陆地高程 | Copernicus DEM GLO-90（备选 GLO-30） | 90 m | 高程统计、坡度、渲染高度图 | 免费许可，分发需署名，修改后需注明 "produced using Copernicus WorldDEM-30 © DLR e.V."（GLO-30 文本已见；GLO-90 文本**待核实**；商业使用条款**待核实**）|
| S02 | 海底地形 | GEBCO 最新年度网格 | ~450 m | 海水着色 | 待核实 |
| S03 | 土地覆盖 | ESA WorldCover 2021 v200 | 10 m | 地表分类、耕地/林地面积、渲染 splat | 据了解为 CC BY 4.0，待核实 |
| S04 | 气候 | WorldClim 2.1（备选 CHELSA） | ~1 km | 气温、降水 → 农业潜力、生态 | 待核实 |
| S05 | 河流与湖泊 | HydroRIVERS / HydroLAKES（备选 OSM 水系） | 矢量 | 河流位掩码、流量等级、渲染 | 待核实 |
| S06 | 人口栅格 | WorldPop 2020（约束版 100 m）或 GHSL GHS-POP | 100 m | 人口空间分布（用普查总量校正） | 据了解为 CC BY 4.0，待核实 |
| S07 | 人口总量 | 第七次全国人口普查公报（省级、地级、县级常住人口） | 行政单元 | 控制总量 | 官方公开统计，引用条件待核实 |
| S08 | 建成区 | GHSL GHS-BUILT-S | 100 m | 城市初始建成格、城市模型密度 | 据了解为 CC BY 4.0，待核实 |
| S09 | 经济统计 | 《中国统计年鉴 2021》《中国城市统计年鉴 2021》《中国县域统计年鉴 2021》（均为 2020 年数据） | 省/地/县 | GDP 及三产、财政、就业、固定资产投资 | 统计数据人工录入为 CSV，逐项标来源页码；出版物使用条件待核实 |
| S10 | 夜间灯光 | VIIRS 年度合成 | ~500 m | 县内经济活动空间分配的辅助权重 | 待核实 |
| S11 | 道路/铁路 | OpenStreetMap（Geofabrik 中国区域提取） | 矢量 | 高速、国道、铁路、高铁线路几何 | ODbL 1.0（已知），衍生数据库共享义务见 §3.2 |
| S12 | 交通设施开通年份（铁路为主，公路/港口/机场按审计补充） | 人工整理表（依据国铁集团、各地政府公开信息） | 线路 | 标注「近似 2020 年末」的网络时点（05 §2 调整说明） | 自建，逐行记录来源 URL |
| S13 | 机场 | OurAirports + 民航局《2020 年民航机场生产统计公报》 | 点 | 机场位置、旅客/货邮吞吐量 | OurAirports 据了解为公有领域，待核实 |
| S14 | 港口 | 交通运输部港口统计 + OSM 港口要素 | 点 | 港口位置、吞吐量 | 待核实 |
| S15 | 行政区划代码与名称 | 民政部 县级以上行政区划代码（2020 年版 + 最新版） | 列表 | 行政 ID、标准名称 | 官方公开 |
| S16 | 行政边界与海岸线（合规层） | **待用户决策（D-04）**，见 §6 | 矢量 | 边界显示、海陆掩膜、交叉表 | — |
| S17 | 地名（补充） | OSM `name:zh` + 民政部标准名称（以民政部为准） | 点 | 标注 | 同 S11 / S15 |

**禁用源**：任何使用 GCJ-02 / BD-09 加偏坐标的数据（高德、百度、腾讯等商业地图 POI/路网）——既有坐标偏移问题，也有服务条款限制，且自行纠偏存在合规风险。
新增要求：**每个源在 P1a 产出一份覆盖审计卡** `docs/data-sources/<id>/AUDIT.md`：

| 审计项 | 内容 |
|---|---|
| 时间 | 数据参考期（referencePeriod）、观测时点（observedAt）、版本发布日期；能否取得 2020 年对应版本或历史快照 |
| 空间覆盖 | 是否覆盖全部 AOI（含台湾、港澳、南海岛礁）；缺口位置 |
| 字段覆盖 | 每个计划使用字段的缺失率（按实体数与按人口/GDP 加权两种口径） |
| 获取方式 | 下载接口、是否需人工录入、预计人工工时 |
| 许可 | 许可原文存档、商业使用、再分发、署名、相同方式共享义务 |
| 替代源 | 不可用时的备选 |
| 结论 | 用于：M1 / M2 / 仅内部 / 不用 |

调整（基于审查意见）：
- **经济统计以地级市为 V1 核心单元**；县级经济数据仅作补充，按实际可得性降级使用，缺失如实标注，不设「县级缺失率 ≤ 15%」这类未经证据的门槛。
- **交通网络时点**：优先取得 OSM 历史全量数据中 2020-12-31 的快照（获取方式与许可在审计中确认）；若不可得，使用当前数据 + 开通年份表剔除新线，**并把网络标注为「近似 2020 年末」**，不宣称精确历史截面。公路、港口、机场同样做时点审计。
- 每个场景字段带 `referencePeriod`（如 `2020`、`2020-11-01`）。

## 3. 许可管理

### 3.1 `sources.yaml` 字段（扩充）
`id, name, url, version, sha256, retrieved_at, license_id, license_url, license_archive_path, license_status(verified|pending), commercial_ok(true|false|unknown), redistribution_ok, share_alike, attribution_text, used_for[], distribution_allowed(internal|public|none)`。

人工录入 CSV（`pipeline/data-manual/*.csv`）同样登记为源：每个文件有 sha256 与逐行 `source_ref`。

### 3.2 门禁
- `15_license_gate`（对**整个包链**的全部源执行，回应 R111）：
  - `public`：任一源 `license_status == pending` → 失败；`distribution_allowed != public` → 失败；`redistribution_ok != true` → 失败；D-08 判定为商业（或未决按从严）时 `commercial_ok != true` → 失败；父包 `distribution != public` → 失败。
  - `internal`：`distribution_allowed == none` 或缺少「内部使用许可」记录（§6.2 第 4 条）→ 失败。
- **D-08（商业化）未决定前按「可能商业化」从严**：`commercial_ok == unknown` 视为不可用于 public。

### 3.3 OSM / ODbL 与派生链（回应 R027）
- 维护**派生链清单** `reports/derivation_chain.md`：列出每个世界包文件由哪些源派生（例如 `networks.osm.ccb`、渲染线网格、标注、交叉引用这些网络的城市可达性字段等）。
- 物理分离（OSM 派生内容单独成文件）是**工程措施，不是许可结论**；ODbL 对「衍生数据库 / 产出作品 / 集合数据库」的认定由专业意见确定（D-05，**P1a 启动、P2 公开发布前必须有结论**）。

## 4. 坐标、时点与口径
- 矢量源统一转 WGS84 (lon, lat)；之后投影到游戏 Albers（04 §1）。
- 时点与口径见 01 §3.2：存量取 2020 观测，流量取 2020 年度值，季度化 = 年值 ÷ 4，2020 年不变价。
- 行政区划：默认 2020 年版本（与普查、年鉴一致，D-06）；与最新区划差异报告 `reports/admin_diff.md`。

## 5. 分层世界包与阶段（回应 R001）

### 5.1 三层产物

| 包 | 内容 | 产出阶段 | 首次使用 |
|---|---|---|---|
| `base-geo` | GridSpec、海陆掩膜、地形统计、土地覆盖、气候、水系、交叉表、城镇锚点、合规层、渲染资产 | P1 | P1（数据检视器）、P2（M1） |
| `scenario-raw` | 人口（普查落格）、经济统计（城市×部门，未校准）、交通网络与设施、字段级来源 | P2 | M1 透镜与面板；M2 的输入 |
| `scenario-cal` | `scenario-raw` + `calibration.json` | P6（经济完成后） | M2 正式游戏 |

- P3/P4 不依赖 `scenario-cal`：模拟开发使用 `test-utils` 合成世界与 `scenario-raw` 的子集，未实现子系统的输入使用**明文规定的默认驱动量**（例：P3 时 `wageIndex = 1.0`、`C_ij = 直线距离 × 常数`、财政不参与），默认值表见 08 §9.1，并记录在 provenance 为 `fixture-default`。
- 每层包都可独立加载；上层包 manifest 引用下层包 identity（06 §1.2）。

### 5.2 阶段图

```
10_fetch ─▶ 15_license_gate ─▶ 20_normalize ─▶ 30_grid ─┬─▶ 40_zonal ──────┐
                                                        ├─▶ 42_landmask ───┤
                                                        ├─▶ 45_hydro ──────┼─▶ 60_classify ─▶ 85_render_assets ─▶ [base-geo]
                                                        ├─▶ 50_admin_xwalk ┤
                                                        └─▶ 55_settlements ┘
[base-geo] ─▶ 62_population ─▶ 65_networks ─▶ 70_economy ─▶ [scenario-raw]
显式依赖：42_landmask ─▶ 50_admin_xwalk ─▶ 62_population；30_grid ─▶ 42_landmask（回应 R123）
[scenario-raw] ─▶ 80_calibrate (Node) ─▶ [scenario-cal]
每个包产出前：90_validate（对应层断言）─▶ 95_compliance ─▶ 99_package
```

### 5.3 各阶段要点（仅列与 V0.1 不同或补充的部分）

- **30_grid**：生成格表与格多边形（GeoPackage）；按 AOI 版本生成 GridSpec 与 `gridHash`。
- **40_zonal（回应 R029）**：
  - **按 COG 瓦片窗口流式处理**，禁止全国高分辨率整幅拼接入内存。
  - 10 m 土地覆盖（源为经纬度栅格）：按 **10×10 源像元块**预聚合；每个源像元的面积按其纬度用椭球公式计算（同一行像元面积相同，逐行计算），块内各类面积以 **m² 整数（u32）** 累加，NoData 像元单列；输出「11 类 + NoData 面积直方图」中间栅格。分区汇总时，块与格多边形相交按块面积比例分割（边界块分数贡献），保证每类全国面积守恒（汇总前后差 ≤ 0.01%）。
  - 精度对照（测试区，预聚合 vs 直接 10 m 精确统计）：某类在某格面积 ≥ 1 km² 时相对误差 ≤ 2%；< 1 km² 时绝对误差 ≤ 0.1 km²。稀有类与小岛单独报告。
  - 90 m DEM：窗口化重投影（双线性）→ 每格统计。
  - 资源规模（估算，回应 R123）：全国陆地约 9.6×10¹⁰ 个 10 m 像元（单字节约 89 GiB 原始）；预聚合后约 9.6×10⁸ 块 × 12 类 × 4 B ≈ 43 GiB 中间数据（未计外域与临时文件）。峰值内存与磁盘目标在 P1a 三样本实测后设定，初始假设：峰值内存 ≤ 16 GiB、中间磁盘 ≤ 300 GiB。
- **42_landmask（新）**：海陆掩膜来自合规层海岸线多边形（开发期 dev 海岸线）；计算 `land_area_km2`；小岛要素表。
- **50_admin_xwalk（替代 V0.1 50_admin）**：县级多边形 × 格多边形求交 → 交叉表（04 §4.1）；管理归属；省/地/县层级汇总表。
- **55_settlements**：锚点落格、主/附属城镇（04 §4.3）；冲突报告。
- **60_classify**：分类规则同 V0.1（`terrain-rules@1`，阈值可调），`ocean` 判定为 `land_area / tile_area < 0.3`；**锚点不改变视觉分类**（04 §4.3）。
- **62_population（新）**：普查县级人口 × 人口栅格权重守恒分摊（04 §4.1）。
- **65_networks（回应 R016、R006）**：
  - **先从真实拓扑构图**：OSM 路网/铁路按真实交汇关系（共享节点、立交、站点）建立有向多模态图，桥隧、立交不连通的交叉**不**产生连接；再把边几何映射为格路径；最后收缩（10 §2）。
  - 站点：铁路车站、高速出入口、港口码头、机场作为设施节点，城市枢纽通过接驳边连接设施（10 §2.2）。
  - 渡运：真实存在的车客渡航线作为 `ferry` 边（来源记录），不存在则不造。
- **70_economy**：地级市 × 6 部门；数据为 **增加值（GDP 口径）**，总产出在 M2 由投入系数推导（11 §2）；缺失值估算并标记。
- **80_calibrate**：Node 脚本调用 `sim`（仅 P6 起运行）。
- **85_render_assets**：A 档所需（07 §3）：常驻低分辨率高程/晕渲（每 chunk 129²）、地形材质索引、海岸距离场、河流与线网格、标注与字形清单。B 档细节高度图（513²）**仅在 B 档启用时生成**。

## 6. 地图合规（回应 R019、R027、R028）

### 6.1 已核实法规事实
- 公开地图需地图审核并标注审图号；**互联网地图服务**审图号标注在地图页面左下角，有效期两年，到期重新送审（《地图审核管理规定》2019 修正文本，司法部公开文本第 27–32 条，GPT 审查 [E4] 亦核对）。
- 2024 年两部门通知规范移动互联网应用程序（APP）登载使用地图行为：需地图审核与 ICP 备案，内容变化需重新审核，引用地图注明来源与审图号。
- 地图不得表示危害国家统一、主权和领土完整的内容。

**待专业意见（D-13，P1a 启动）**：本 Web 游戏是否属于「互联网地图服务」；是否涉及测绘资质、网络游戏出版审批（版号）、数据存储与跨境要求；具体主管部门与送审材料。**技术架构不替代法律意见。**

### 6.2 架构措施
1. 合规图层独立文件 `compliance.ccb`，**stage = boot**；客户端在首个地图帧前加载并校验（hash + 必需要素存在性），失败则**不渲染地图**，显示错误页。
2. 合规线在**最终合成阶段**绘制（07 §2：后处理之后、UI 之前），任何透镜、迷雾、后处理、画质档位都不能遮盖或改变其颜色。
3. 合规来源（D-04，P1a 完成可行性评估，P2 公开发布前确定）：方案 A 采购合规矢量；B 以标准地图为参照人工核对修正；C 已审图服务接口（条款待核实）。
4. **内部开发使用真实数据的条件（R027 复议后达成一致）**：
   - P1a 技术样例先用明确许可的合成世界；
   - **逐个真实数据源**：取得该源的许可审查 + 内部处理用途、处理环境、处理路径的**初步书面审查**（记录在审计卡 `AUDIT.md` 的「内部使用许可」栏，注明审查人与日期）后，方可在受控 internal 环境中处理；不能确认的源暂时禁用；
   - 不要求在内部开发前取得最终公开版审批；M1、M2 的公开发布各自通过许可门禁与发布描述符门禁（17 §5）；
   - 专业意见由项目负责人指定负责人取得（D-13），工程文档不作法律结论；
   - internal 包仅在受访问控制的环境使用，客户端显示「内部测试版本，地图未经审核」水印。
5. **审批登记（approval registry，替代 V0.1 的 `signed` 布尔值）** `compliance/approvals.yaml`：
   ```yaml
   - approval_id: A-2027-001
     approval_number: "审图号文本"
     document_ref: 批准文件扫描件路径（私有存储）
     scope: { distribution: public, regions: [CN], surfaces: [web-map, screenshot-export] }
     bound_to: { base_geo_identity: "sha256:…", compliance_file_sha256: "…", style_hash: "…", zoom_range: [..], inset_spec: "…" }
     issued: 2027-01-10
     expires: 2029-01-09          # 若适用
     review_due: 2028-10-01
     owner: 项目负责人
   ```
   - `bound_to` 绑定的是**完整展示产物**（回应 R111）：应用构建 hash、完整包链 identities（base-geo、scenario-raw、scenario-cal 若有）、contentHash、`styleHash`（渲染样式常量、调色板、着色器源的 hash）、导出 surface 定义；具体哪些变化需要重新送审由专业意见决定，工程上任何绑定项变化都触发「重新评估」记录，无记录则拒发。
   - 公开展示信息从审批登记生成**发布描述符** `release.json`（17 §5），不含私有扫描件。
   - `public` 构建要求：存在覆盖本构建、绑定完全一致、未过期、未撤回的登记；否则构建失败。
   - 地图表现变化（边界数据、合规层样式、缩放范围、附图）→ `bound_to` 不匹配 → 先人工评估是否需重新送审，再更新登记。CI 不能仅凭布尔值放行。
   - 撤回：登记标记 `revoked` 后，发布流程必须使对应版本的 CDN 资源下线（17 §5）。
6. 截图/导出：应用级导出（非仅 canvas）必须合成审图号、水印（如适用）与南海诸岛附图（14 §4.2）。
7. 敏感信息：不采集、不显示军事设施等敏感要素（USACiv 有军事图层，本项目**不做**）；矿产资源为游戏化近似。

## 7. 缓存与可复现（回应 R009）

- 阶段缓存键 = SHA-256（阶段代码文件内容 ∥ 阶段参数规范化 JSON ∥ 全部上游输入文件内容 hash（含人工 CSV、content、grid.yaml、AOI 多边形）∥ 工具链 digest（Docker 镜像 digest，含 GDAL/PROJ/proj-data 版本））。
- 输出规范化：浮点字段按 06 §6 字段字典量化；GeoPackage/Parquet 只作中间产物，**不进入世界包**；世界包文件写出时不含时间戳等非语义元数据。
- 失效测试：修改任一输入（一行人工 CSV、一个参数、一个工具版本）→ 下游所有依赖阶段缓存失效，非依赖阶段命中（自动化测试）。

## 8. 数据质量断言（`90_validate`，按包分层）

| # | 包 | 断言 |
|---|---|---|
| V1 | base-geo | 省级陆地面积（Σ交叉表）与**同口径**官方面积相对误差 ≤ 2%；若找不到同口径官方值，仅报告差异与口径说明，不判失败、不强行调平（回应 R115） |
| V2 | scenario-raw | 每县 Σ`pop_int` = 普查值（整数相等）；全国合计 = 普查全国值（04 G5b） |
| V3 | scenario-raw | 省级 GDP 合计与年鉴误差 ≤ 2%（若省年鉴与城市合计本身不一致，报告差异来源，不强行调平） |
| V4 | base-geo | 所有城镇锚点落在 `has_land = 1` 的格，且该格交叉表中包含其所属县 |
| V5 | scenario-raw | **连通性按真实覆盖验收（回应 R006、R104）**：① 输出每种模式与多式联运图（客运、货运分别）的有向强连通分量与弱连通分量报告、城市对可达矩阵摘要；② 单模式与多模式的不可达均允许，但每个「省会—省会」不可达对与每个孤立城市必须出现在**审计例外清单** `reports/connectivity_exceptions.yaml`（原因 + 来源引用 + 审计人）；③ 未进入例外清单的不可达 → 失败；④ **禁止为通过断言添加不存在的边**；虚拟边（`access`、`sea_lane`、`air_route`）标记 `kind = estimated`，M1 只展示真实线路，不把模型航线当真实航线展示；⑤ 若真实数据缺失导致核心玩法不可行，由用户决定补源或缩小范围，不改真实性 |
| V6 | base-geo | 所有数值字段无非有限数；缺失值使用字段字典规定的哨兵或有效位图 |
| V7 | scenario-raw | 估算字段比例按字段报告（实体数与人口/GDP 加权两种口径），作为信息项，不设硬阈值 |
| V8 | 全部 | manifest、字段字典、CCB 段表三者一致（06） |

## 9. 运行方式与预算（回应 R029）

```
make data LAYER=base-geo|scenario-raw|scenario-cal [REGION=test-sichuan]
ccp run <stage> --force ; ccp report
```

| 预算项 | 目标 | 性质 |
|---|---|---|
| 原始数据下载 | 不设时间门槛，记录体积；**不计入算法性能** | 信息 |
| 人工录入 | 按审计卡估算工时 | 计划 |
| 测试区冷构建（base-geo） | ≤ 15 分钟（参考 8 核/32 GiB） | P1a 实测后确认 |
| 全国冷构建 | P1a 三样本实测后外推设定 | P1 验收时为硬指标 |
| 全国热增量：轻量阶段（分类、打包、渲染资产重排） | ≤ 10 分钟 | P1 硬指标 |
| 全国热增量：重计算阶段（40_zonal、50_admin_xwalk、62_population） | 按 P1a 外推值 | P1 硬指标（数值在 P1a 定） |
| 打包 | ≤ 5 分钟 | P1 硬指标 |

## 10. 验收（P1 相关）
1. 锁定环境下两次冷构建 `base-geo` 包 identity 相同（06 §1.2）。
2. §8 中 base-geo 层断言全过；报告页可浏览。
3. 全部数据源审计卡完成；发布用源许可 `verified`。
4. 合规来源可行性评估与 D-13 专业意见已启动（有书面记录）。

---

<!-- 文件：06-data-formats.md -->

# 06 数据格式

## 1. 世界包

### 1.1 目录（三层，05 §5.1）

```
world/<layer>/<identity>/          layer ∈ base-geo | scenario-raw | scenario-cal
base-geo:
  manifest.json
  ATTRIBUTION.md
  tiles_geo.ccb          # 格静态地理列（§4.1）
  xwalk_geo.ccb          # 格×县几何交叉表（04 §4.1，无人口）
  admin.ccb              # 行政区表
  settlements.ccb        # 城镇锚点与级别（无统计值）
  islands.ccb            # 小岛要素
  compliance.ccb         # 合规层（stage=boot）
  render/
    relief_lo.ccb        # 每 chunk 129² 高程（A 档晕渲 / B 档远景）
    coast_sdf/<chunk>.ktx2
    lines/<chunk>.ccb    # 河流、海岸、边界线带状网格
    labels.ccb ; glyphs/
    height_hi/<chunk>.ccb  # 仅 B 档启用时生成
scenario-raw:
  manifest.json          # 引用 base-geo identity
  xwalk_pop.ccb          # 与 xwalk_geo 同索引的人口权重与整数贡献（04 §4.1）
  cities.ccb / towns.ccb # 城市、城镇统计（§4.3）
  economy.ccb            # 城市×部门增加值、就业等（§4.4）
  networks.osm.ccb       # 有向多模态网络（OSM 派生，独立文件）
  facilities.ccb         # 港口、机场、车站、容量池（10 §2.4）
  geom_index.ccb         # 网络几何索引（GeomRef → chunk/偏移/长度，10 §2.4）
  lineage.ccb            # 字段级来源与覆盖（§6.2）
scenario-cal:
  manifest.json          # 引用 scenario-raw identity
  calibration.json
content/<contentHash>/content.json
```

文件 `stage`：`boot`（地图首帧前必须）、`stream`（按视野）、`lazy`（打开相关界面时）。

### 1.2 规范 JSON：CCJ-1（回应 R008、R102）

所有参与哈希的 JSON（`gridCore`、`manifestCore`、状态 `meta`、发布描述符核心）使用受限规范 **CCJ-1**，TS 与 Python 各自实现专用序列化器（不使用通用 `JSON.stringify` / `json.dumps` 的排序行为）：

| 项 | 规则 |
|---|---|
| 键 | 必须匹配 `^[a-z][A-Za-z0-9_]*$`（ASCII、非数字开头，避免 JS 整数键枚举顺序差异）；对象内**重复键拒绝** |
| 键顺序 | 按键的 ASCII 字节序升序 |
| 数字 | 只允许安全整数 `[−(2^53−1), 2^53−1]`，十进制无前导零、无 `+`、无指数；**禁止浮点与 −0** |
| 字符串 | UTF-8 严格（拒绝孤立代理项）；只转义 `"`、`\` 与 U+0000–U+001F（以 `\u00xx` 小写十六进制）；其余字符（含非 BMP）原样输出；不做 Unicode 归一化 |
| 布尔、null | `true` / `false` / `null` |
| 数组 | 顺序有语义；每个数组的排序规则在 schema 中规定（如 `files` 按 `path` 的 UTF-8 字节序） |
| 空白 | 无 |
| 编码 | UTF-8，无 BOM |

golden vectors：键排序、非 BMP 字符、换行与反斜杠、null 与缺省字段、数组顺序变化、安全整数边界；两端独立实现互相验证。

### 1.3 包身份（identity）

`identity = "sha256:" + hex(SHA-256(CCJ-1(manifestCore)))`。`manifestCore` 的**全部必选字段**（缺一拒绝；不允许额外字段）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `formatVersion` | int | 世界包格式版本 |
| `layer` | `"base-geo"` \| `"scenario-raw"` \| `"scenario-cal"` | — |
| `scenarioId` | string \| null | base-geo 为 `null` |
| `gridCore` | object | 04 §3 |
| `gridHash` | string | 必须等于由 `gridCore` 计算的值（加载时复算） |
| `window` | `{col0,row0,cols,rows}` | 04 §2.4；全国包为全网格 |
| `parentIdentity` | string \| null | base-geo 为 `null`；其余层必填 |
| `contentHash` | string \| null | 仅 scenario-cal 必填（校准依赖规则数据），其余层为 `null` |
| `distribution` | `"internal"` \| `"public"` | — |
| `files` | array | 按 `path` 字节序；每项 `{path, bytes, sha256, stage, required}` |
| `complianceFileSha256` | string \| null | base-geo 必填，其余层 `null` |
| `licenseSetHash` | string | 本层引用源集合的 hash |
| `toolRegistryHash` | string | 03 §6 工具登记 hash |

- `manifest.json` = `{ identity, core: manifestCore, buildInfo }`；`buildInfo`（时间、机器、镜像 digest）不参与 identity。
- 可复现 = 全部数据文件 + identity 逐字节一致。
- 测试：相同输入 → identity 相同；修改 gridCore 任一字段、AOI 文件、文件名、文件 1 字节、distribution、许可集、工具登记、数组顺序 → identity 必变。

### 1.4 包链加载（回应 R103）
- 客户端从发布描述符（或 dev 配置）得到**叶子包**的 identity 与 URL；每层 manifest 的 `parentIdentity` 指向父包，父包 URL 由描述符中的 `chain[]` 给出（不由客户端猜测）。
- 校验：每层 identity 复算一致；`gridHash` 全链相同；`window` 全链相同；`scenarioId` 在 raw/cal 间相同；`distribution`：public 叶子的全部祖先必须为 public；无环；`required` 文件存在且 sha256 一致。任一失败 → 拒绝加载并报告具体原因。
- 文件路径相对各自层的根 URL 解析；同名文件在不同层互不覆盖（以层名命名空间访问）。
- 每层的必需文件清单在 `ccb-sections.json` 中按层定义。

## 2. CCB 二进制容器 wire spec（回应 R007）

### 2.1 布局
全部整数**小端**。文件头 24 字节 + 段表 `56 × N` 字节 + 数据区。

```
off  size  field
0    4     magic        = 0x43 0x43 0x42 0x31 ("CCB1")
4    2     containerVersion (u16) = 2
6    2     flags (u16)  = 0（非 0 → 拒绝）
8    4     sectionCount N (u32)，1 ≤ N ≤ 4096
12   4     headerBytes (u32)：必须 == 24 + 56·N
16   8     reserved：必须全 0
24   56·N  段表项：
           name[24]   UTF-8，1–24 字节，字符集限定 [a-z0-9_.]，不足补 0x00；全文件内唯一
           dtype u8   0=u8 1=i8 2=u16 3=i16 4=u32 5=i32 6=f32 7=f64 8=utf8_table 9=json 10=bytes
           arity u8   数值段：1–16；utf8_table/json/bytes：必须为 1
           flags u16  bit0 = required（读取器遇到未知 required 段 → 拒绝）；其余位必须 0
           count u32  数值段：元素个数（每元素 arity 个分量）；utf8_table：字符串个数；json/bytes：必须为 1
           offset u64 绝对偏移
           bytes u64  数据字节数（不含 padding）
           crc32 u32  CRC-32/ISO-HDLC（与 zlib.crc32 相同；多项式 0xEDB88320 反射、初值 0xFFFFFFFF、结果异或 0xFFFFFFFF），覆盖本段 bytes 范围（不含 padding）
           reserved u32 = 0
```

### 2.2 校验规则（读取器必须全部执行，失败即拒绝整个文件，**禁止静默容错**）
1. magic、containerVersion、flags、reserved 字段符合上表。
2. `headerBytes == 24 + 56·N`，且 `headerBytes ≤ fileLength`。
3. 每段：u64 先检查 `≤ 2^53 − 1` 再转 `number`；`offset ≥ headerBytes`；`offset % 8 == 0`；**`offset ≤ fileLength` 且 `bytes ≤ fileLength − offset`**（避免相加溢出）。**全部范围检查在任何内存分配之前完成**；解码器设单文件最大解码字节上限（默认 512 MiB，可配置），超限拒绝。
4. 段表顺序 = offset 严格升序；**`bytes = 0` 的空段合法**，其 offset 必须等于前一段结束后 8 对齐的位置，且与后续段 offset 不同（即每段占据唯一对齐位置）；段间互不重叠。首段 offset 必须等于 `headerBytes`（无前置间隙）；相邻段之间与文件末尾的 padding 长度 < 8 且全为 0x00；文件长度 = 最后段 offset + bytes 向上取整到 8。
5. 数值段：`bytes == count × arity × sizeof(dtype)`。
6. `utf8_table`：数据 = `u32 n` + `u32 offsets[n+1]` + UTF-8 字节；`n == count`；`offsets[0] == 0`；单调不减；`offsets[n] == 剩余字节长度`；每个字符串为严格 UTF-8（拒绝非法序列与 BOM）。
7. `json`：严格 UTF-8、无 BOM、顶层对象或数组；**重复键拒绝**；数字不得为 NaN/Infinity（JSON 本身不允许）；若该段参与哈希则必须是 CCJ-1。
8. CRC 匹配。
9. 名称唯一、字符集合法。
10. 未知 dtype → 拒绝；未知**非 required** 段 → 忽略（向前兼容）；缺少期望的 required 段 → 拒绝；段的 `required` 标志必须与 `ccb-sections.json` 对该段的定义一致，不一致 → 拒绝。
11. `utf8_table` 的 `n` 先与 `count` 和 `bytes` 做上限校验（`4·(n+2) ≤ bytes`）再分配 offsets 数组。

### 2.3 字节序
写出器显式按小端写；TS 读取器在启动时检测平台字节序（`new Uint8Array(new Uint16Array([1]).buffer)[0] === 1`），非小端平台对数值段做字节交换后再建视图（当前所有目标平台为小端，此分支保留以保证正确性并有单测）。

### 2.4 测试
golden fixtures（Python 写、TS 写各一套，双向读取比对）；CRC-32 已知向量（如 ASCII `"123456789"` → `0xCBF43926`）；坏包集合：截断、CRC 错、重叠、重复名、超长名、非法 UTF-8、BOM、JSON 重复键、offset 溢出、`offset+bytes` 溢出、超大 n、首段前间隙、末尾非零 padding、headerBytes 不符、未知 required 段、required 标志不一致、空段位置错误、超过最大解码字节。

## 3. ID 域（回应 R010）

| 类型 | 定义 | 稳定排序 | 哨兵 |
|---|---|---|---|
| `TileId` | `row·cols + col` | 网格决定 | `0xFFFFFFFF` |
| `AdminIdx` | `admin.ccb` 全表行号（省/地/县混合） | 按 `(level, code)` 升序 | `0xFFFF` |
| `ProvinceId` | 省级单元的**专用序号** 0…P−1 | 按区划代码升序 | `0xFFFF` |
| `PrefectureIdx` | 地级单元专用序号 | 按代码升序 | `0xFFFF` |
| `CountyIdx` | 县级单元专用序号 | 按代码升序 | `0xFFFF` |
| `SettlementId` | `settlements.ccb` 行号（城市 + 城镇混合） | 按 `(kind, code)` 升序 | `0xFFFF` |
| `CityId` | 城市实体专用序号（地级及以上） | 按代码升序 | `0xFFFF` |
| `TownId` | 城镇实体专用序号 | 按代码升序 | `0xFFFF` |

- **容量**：每个 ID 域的最大值 = 哨兵 − 1（u16 域最多 65,535 个实体）；管线在写出前检查实体数不超限。
- 跨表引用完整性（引用的 ID 必须存在于目标表）在读取器与管线 `90_validate` 中检查。
- 映射列（显式存储，禁止隐式换算）：`admin.ccb` 中 `province_id / prefecture_idx / county_idx`（对应专用序号）与反向表 `province_admin_idx[]` 等；`settlements.ccb` 中 `city_id / town_id`，`cities.ccb` 中 `settlement_id`。
- 品牌类型见 14 §1；任何跨域转换只能通过 `world-format` 提供的映射函数。
- 测试：「打乱 admin 行顺序」的 fixture **只用于内部映射函数测试**（验证代码不依赖行序）；正式 wire 包始终按稳定排序写出，读取器校验排序，不合规即拒绝。

## 4. 主要表（字段以字段字典 §6.1 为准，此处列结构）

### 4.1 `tiles_geo.ccb`（count = 窗口格数，按 localIndex 排列）
`domain u8`、`terrain_class u8`、`has_land u8`（独立有效位）、`land_area_m2 u32`、`inland_water_area u16`、`elev_mean/min/max/p90 i16`、`elev_std u16`、`slope_mean u8`、`lc_top3_class u8×3`、`lc_top3_pct u8×3`、`cropland/forest/builtup_area u16`、`temp_mean i16`、`precip u16`、`river_edges u8`、`river_class u8`、`coastal u8`、`manage_county_idx u16`、`manage_province_id u16`、`anchor_settlement_id u16`、`resource u8×2`。

### 4.2 交叉表
- `xwalk_geo.ccb`（base-geo）：CSR `tile_offsets u32[窗口格数+1]`、`county_idx u16[]`、`land_area_m2 u32[]`。
- `xwalk_pop.ccb`（scenario-raw）：与 `xwalk_geo` **同长度同顺序**：`pop_weight f64[]`、`pop_int i32[]`；外加 `xwalk_geo_sha256`（json 段）声明对齐的几何表，读取器校验。

### 4.3 `settlements.ccb`（base-geo）与 `cities.ccb` / `towns.ccb`（scenario-raw）
`settlements.ccb`：`code`、`kind`、`admin_idx`、`anchor_x i32`、`anchor_y i32`（整数米平面坐标）、`anchor_tile u32`、`is_primary_on_tile u8`、`name`、`name_pinyin`。
`cities/towns.ccb`：`settlement_id`、`admin_idx`、`anchor_tile`、`pop_total i32`（-1 = 缺失，配合有效位）、`pop_urban i32`、`gdp_wan f64`（万元；f64 防止 u32 溢出，GPT R030 指出）、`valid_bits u32`（每字段一位）。城镇有自己的统计值，与城市不重复计入（城市值为地级行政区整体口径，城镇值为县级口径，汇总时只取一个层级，规则见 11 §6）。

### 4.4 `economy.ccb`
城市 × 6 部门矩阵：`va_wan f64`（增加值）、`employment f64`、`valid u8`、`lineage_ref u32`。

### 4.5 `networks.osm.ccb`
见 10 §2.4 的 schema（有向多模态图）。

## 5. 规则数据（content）
同 V0.1（受限声明式效果语言，不允许脚本）。

## 6. 字段字典与来源（回应 R030）

### 6.1 字段字典 `core-types/schema/fields.json`
每个发布字段一条：`file, section, dtype, arity, unit, scale, offset, valid_min, valid_max, missing(sentinel 值 | "valid_bits:<section>.<bit>"), aggregation(sum|mean|area_weighted_mean|mode|none), quantization, description, lineage_required(bool)`。
- 写出器与读取器都从字典读取并断言；V8 断言保证字典、段表、manifest 三者一致。
- 示例：`pop_total`：i32、人、missing = −1、aggregation = sum；`temp_mean`：i16、°C、scale 0.1、missing = −32768。

### 6.2 来源（lineage）
- `lineage.ccb`：`sources`（json 段，源 ID 列表）+ `field_lineage`（每字段默认来源与方法）+ `overrides`（CSR：实体/区域 → 字段 → {kind: observed|estimated|derived|fixture-default, source_ids[], method, note_idx}）+ `notes`（utf8_table）。
- 对外展示：任一数值的来源链与 `kind`；估算值在 UI 中有明显标记（13 §2.4）。

## 7. 存档（M2，回应 R105、R108）

```
<slot>.ccsave = CCB 容器（containerVersion 2）：
  meta          json(CCJ-1, required)   { saveVersion, appVersion, createdAt }        —— 不参与状态哈希
  state         bytes(required)         规范状态 CSE-1（08 §2.5），本身是一个完整的 CCB 文件
  replay_log    json(CCJ-1, required)   权威回放日志（08 §6.4）：玩家已接受命令 + EndTurn 边界
  idem_ledger   json(CCJ-1, required)   幂等账：已接受命令的 commandId → {payloadDigest, acceptedSeq}
  state_hash    utf8_table(count=1)     16 个小写 hex
```
- PRNG 状态、回合、控制者、世界/内容/规则版本等**只存在于 `state` 内**（不再单独存 `rng` 段，消除重复）。
- 存档不改变任何状态值：状态在写入时即已是规范单位（08 §2.4），回合中途存档与回合末存档使用同一编码。
- 兼容判定以 `state` 内语义头的 `worldIdentity / contentHash / simVersion / stateSchemaVersion` 为准；`appVersion` 仅作信息。
- 存储：IndexedDB + 导出/导入；导入时完整校验（CCB 规则 + 哈希复算 + 回放日志与幂等账一致性）。
- `.ccreplay` = `meta` + 初始参数（世界/内容/规则版本、种子、模式、控制者）+ `replay_log`。

## 8. 版本号
`formatVersion`（世界包）、`containerVersion`（CCB）、`saveVersion`、`simVersion`、`contentHash`、`identity`。含义同 V0.1；`containerVersion` 因 wire spec 收紧升为 2。

---

<!-- 文件：07-rendering.md -->

# 07 渲染引擎

## 1. 两档渲染形态（ADR-015；D-11 用户已确认，DEC-001）

| 档 | 形态 | 定位 |
|---|---|---|
| **A 档（V1 主形态）** | 正交俯视（可小角度倾斜 ≤ 15°）、手绘风格六边形地形 + 晕渲 + 精灵装饰 + 旗标 | M1 与 M2 的默认画面；参照 USACiv 已验证的文明式观感（01 §1） |
| **B 档（后续可选）** | 透视倾斜 35°–75°、高程位移 3D 地形、3D 实例模型 | **不是 V1 发布条件**；A 档全部验收后，根据视觉需求与性能实测（含 iPad）决定是否实施 |

两档共用：相机/输入框架、格数据纹理、透镜系统、线网、标注、合规合成、拾取接口。B 档的设计保留在 §9（已按审查意见修正），但**不在 V1 关键路径上**。

## 2. 帧结构与合成顺序（回应 R019）

```
1. 相机更新
2. 可见集：视口 × chunk 包围盒 → 可见 chunk；按缩放级别确定装饰与标注层级
3. 流式请求（Asset Worker）
4. 应用 ViewModel 差量（数据纹理局部更新，≤ 2 ms/帧）
5. 场景 Pass（渲染到离屏目标，线性空间）：
   a. 地形底图（A 档：全图格着色 Pass，§3.1）
   b. 水体（海洋/湖泊/河流）
   c. 装饰精灵（植被、山体、设施；实例化）
   d. 透镜叠加（数据着色、格线、区域描边、选中高亮）
   e. 交通线网与流量动画
   f. 城市旗标（实例化四边形 + MSDF 文字）
   g. 迷雾/未调研遮罩（若启用）
6. 后处理：色调映射 → 调色 LUT → 暗角/纸纹 → FXAA → 输出 sRGB
7. **合规合成 Pass（最终）**：国界、省界、南海诸岛及其断续线、重要岛屿，以固定样式绘制在后处理结果之上；不受透镜、迷雾、后处理、画质档位影响
8. 标注（地名，MSDF，屏幕空间，碰撞避让）——在合规线之上绘制，但碰撞系统把合规线作为「禁止完全遮挡」区域（标注背景采用半透明描边而非实心底，保证线可见）
9. DOM UI（含左下角审图号/水印组件，13 §2.1）
```

- 合规资源（`compliance.ccb`）在首帧前加载并校验，失败则不进入地图（05 §6.2）。
- 统计口径：`renderer.info` 在每次 `render()` 调用时会重置（GPT 审查 [E3] 核对 three.js 文档），本项目**关闭自动重置、每帧手动累加所有 Pass**，`stats()` 报告整帧合计（回应 R018）。

## 3. A 档地图

### 3.1 地形底图：全国单覆盖 + 全局纹理（回应 R121）
- 几何：**一个覆盖整个窗口范围的平面矩形**（2 个三角形，1 次 draw call）；不按 chunk 拆分底图，避免奇偶行阶梯格域造成的 chunk 矩形重叠或漏画。
- 片元着色器：片元平面坐标 → 04 §2.3 公式（float32）求 TileId → `texelFetch` **全国格数据纹理**（窗口 cols×rows，例：260×317）→ 地形材质（`TEXTURE_2D_ARRAY`，约 12 层 512²）按格内占比与到格边距离混合；邻格样本通过邻接公式在同一全国纹理中取得，**不存在跨 chunk 采样问题**；网格外样本按「外域背景」材质处理。
- 晕渲：**全国单张高程纹理** `relief_lo`（按约 5.2 km 采样，全国约 1040×1100，`R16UI`，约 2.2 MiB），着色器内手动双线性 + hillshade。若 P1a 测得片元开销过高，改为管线**预烘焙 hillshade**（RGBA8 或 R8 全国纹理）以减少每像素纹理读取。
- 海岸距离场 `coast_sdf`：全国单张 R8，约 2 km 分辨率（约 2700×2850，约 7.3 MiB 未压缩；P2 按实测与视觉决定分辨率），陆海优先级：`has_land` 有效位 > 距离场。
- chunk 仍用于**流式资源**（线网、标注、精灵候选位置）与可见性裁剪，不用于底图。
- 格线：同一着色器，按到格边距离绘制。
- 片元开销估算（回应 R120，未实测）：中档 DPR 1.5 下约 466 万像素/帧；若每像素 10–20 次纹理读取，约 0.47–0.93 亿次/帧。P1a-A5 以「最复杂邻格混合 + 晕渲 + 全部 Pass」实测；超预算时依次：预烘焙 hillshade → 减少邻格混合样本 → 降低 DPR 上限。

### 3.2 水体
- 海洋：全图底层四边形；颜色按海岸距离场（`coast_sdf`，每 chunk 256² R8）由浅青到深蓝过渡；海岸线处白色浪花描边（距离场阈值）；可选慢速法线扰动动画（「减少动效」时关闭）。
- 湖泊：属于格底图的一种材质 + 湖泊矢量轮廓描边。
- 河流：带状网格（`lines/<chunk>.ccb`），宽度按 `river_class`，最小屏幕宽 1.5 px；主河流在远景保留。

### 3.3 装饰精灵（回应 R032 的实例预算思路）
- 类型：森林（4 种植被风格）、山体（丘陵/山地/高山/冰川）、沙丘、农田纹样、设施图标。
- 精灵图集：`TEXTURE_2D_ARRAY` 或 2048² 图集页，KTX2。
- 放置：管线按格分类与占比预计算每格候选位置（确定性抖动，种子 = TileId），运行时按**缩放级别密度表**取前 k 个：

| 视野宽度 | 每格最多精灵数 | 全屏可见格（估算，1080p） |
|---|---|---|
| ≥ 3,000 km | 0（只用底图纹理） | ~2–8 万 |
| 1,000–3,000 km | 1 | ~5,000–2 万 |
| 300–1,000 km | 3 | ~600–5,000 |
| < 300 km | 6 | ≤ 600 |

- **全局上限**：可见精灵实例 ≤ 2 万（每实例 2 三角形 → ≤ 4 万三角形）；超出时按屏幕面积与优先级裁减。实例化后每种图集页 1 次 draw call。
- 每帧统计实例数、三角形数、draw call，计入 15 §2.1 预算。

### 3.4 城市旗标（含布局规则，回应 R121）
- 旗标锚定城镇真实锚点（`anchor_x/anchor_y`），同格附属城镇的小旗标按固定顺序（区划代码升序）在锚点下方纵向错开；碰撞系统可隐藏低优先级旗标，但不移动锚点。
- 地级及以上城市旗标：圆角色块（省份色）+ 人口数值 + 城市名 + 等级图标；县级城镇在视野 < 600 km 时显示小旗标。
- 实例化四边形 + MSDF 文字；旗标之间做碰撞避让（与地名标注同一系统，城市优先级更高）。
- 原创样式（13 §1），不复制 USACiv 的旗标设计。

### 3.5 透镜（叠加层）
- 统一叠加着色器 + 格数据纹理（数据纹理按透镜切换，不重建几何）。
- 连续值：`R32F` 纹理，`texelFetch`，着色器内映射到 1D 调色板纹理；分类值：`R8UI` + 调色板。
- 支持：着色、区域描边（与邻格值不同处）、选中/悬停高亮、缺失值斜线纹理（显示「无数据」而非 0，回应 R030）。

### 3.6 相机（A 档）
- 正交投影，视野宽度 60–6,000 km；默认正北朝上，**V1 不提供旋转**（简化合规与小地图同步）。
- 桌面：滚轮缩放以光标为锚点；拖拽平移；WASD/方向键平移。iPad：单指拖拽平移（带惯性）、**双指捏合缩放以两指中点为锚点**、双击放大一级、双指轻点缩小一级；手势识别在 InputRouter 中统一（13 §2.3）。
- 可选小角度倾斜（≤ 15°，用于营造立体感；B 档之前不做透视）。

## 4. 标注与字形（回应 R033）
- 用字统计：构建期从全部地名 + 地图内文字统计实际字数 `G`，写入报告；V0.1 的 4,000–6,000 为估算。宋体、黑体两套图集**分别计费**（页数、内存、首包体积）。
- MSDF 单元 32 px + 每边 4 px 留白 = **40×40 px/字**，2048² 页 → **51×51 = 2,601 字/页**；宋体、黑体两套分别成图集。
- 分级加载：boot 字集（省、地级市名 + 数字符号，估算 ≤ 1,500 字/套 → 1 页/套）；lazy 字集（县级及自然地物名，按需）。
- 体积：每页 2048² 像素；压缩格式（UASTC 或无损）与实际体积在 P2 视觉测试后确定，**不再预先声称 MB 数**。
- 碰撞避让、滞回规则同 V0.1。

## 5. 拾取（回应 R033）
- **CPU 权威**：屏幕坐标（鼠标点击或触控点）→（A 档）正交反投影得到平面坐标 → 04 §2.3 → TileId。A 档无高程位移，结果精确。
- 实体拾取（旗标、线路）：屏幕空间命中，优先级 旗标 > 线路 > 格；触控命中半径 ≥ 22 pt（iPad），鼠标 ≥ 6 px；单独验收（不能用地面点测试代替）。
- B 档（若批准）：射线与实际三角网格求交（真正的三角面相交，作为 oracle）；步进法只作近似，不作真值。
- 测试真值：A 档以 04 §2.3 的 CPU 契约真值 golden vectors 为准（Python 参考实现独立编写），并用 `mpmath` 检验远离边界的点（04 §2.3）。

## 5a. 整帧预算分配（A 档，中画质，回应 R120）

| 部分 | Draw calls | 三角形 | 说明 |
|---|---|---|---|
| 底图 | 1 | 2 | 全国单矩形 |
| 海面 | 1 | ≤ 2k | — |
| 河流/湖泊轮廓 | ≤ 4 | ≤ 60k | 按类别合批（可见 chunk 的线网格在可见集变化时合并到每类一个动态缓冲） |
| 交通线网 | ≤ 8 | ≤ 80k | 每种线型 1 批；双向线路按 `lineId` 去重只画一条 |
| 精灵 | ≤ 8 | ≤ 40k | 每图集页 1 批，实例 ≤ 2 万 |
| 透镜叠加 | 1–2 | 2–4 | 与底图同型全屏矩形 |
| 旗标 + 地名 | ≤ 6 | ≤ 60k | 实例化四边形 + MSDF |
| 合规合成 | ≤ 4 | ≤ 30k | 最终 Pass |
| 后处理 | ≤ 4 | 全屏 | 色调映射、LUT、FXAA |
| **合计** | **≤ 40（预算 150 留余量）** | **≤ 0.3M** | 整帧手动累加统计 |

渲染目标内存（中档 DPR 1.5，1920×1080 CSS → 2880×1620 ≈ 466 万像素）：每张 RGBA8 约 17.8 MiB；离屏颜色 ×2 + 深度 ×1 ≈ 53 MiB（估算）。iPad 按实际 drawingBuffer 计算（15 §3）。

GPU 上传：**每帧同时满足 ≤ 4 MiB 且 ≤ 3 ms**（两个条件都要满足，回应 R120）。

## 6. 资源生命周期
- `AssetCache`：LRU，按估算字节计费，分别统计 CPU 侧缓存、GPU 纹理（含 mipmap）、GPU 缓冲、渲染目标、解码临时缓冲；上限按画质档位（15 §2.1）。
- 流式解码在 Asset Worker（CCB 解析、KTX2 转码由 three.js KTX2Loader 管理其自身 Worker 池——**所有权：KTX2/Basis 解码交给 three.js loader；CCB 解析交给本项目 Asset Worker**，回应 R023）。
- 每帧 GPU 上传 ≤ 4 MiB 或 3 ms；离开视野资源保留 10 s 再逐出；超上限时紧急逐出最久未用。
- WebGL 上下文丢失：停止渲染循环 → 恢复后从 CPU 缓存重建全部 GPU 资源 → 恢复（E2E 用 `WEBGL_lose_context` 扩展模拟）。

## 7. 画质档位（A 档；桌面与 iPad 分档，回应 DEC-001 D-12）

| 项 | 低 | 中（桌面默认） | 高 | iPad 档（默认，P1a 实测后定） |
|---|---|---|---|---|
| drawingBuffer DPR 上限 | 1.0 | 1.5 | 2.0 | 初始假设 1.5（入门档可能降至 1.0–1.25） |
| 精灵密度 | ×0.5 | ×1 | ×1.5 | 初始 ×0.75 |
| 海面动画 | 关 | 开 | 开 | 开（低电量模式/热降频时自动关） |
| 后处理 | 仅色调映射 | + LUT + FXAA | + 纸纹/暗角 | + LUT + FXAA |
| 资源缓存上限 | 见 15 §2.1 | 同左 | 同左 | 15 §3 |

- 计费按实际 drawingBuffer 像素：1920×1080 CSS 在 DPR 2 下为 3840×2160 ≈ 829 万像素（RGBA8 约 31.6 MiB/张）。
- iPad：监听可见性与帧时间，持续超预算 10 s → 提示并降一档（不自动跳变画面，降档需用户确认或在设置中开启「自动」）。

## 7a. 截图导出与 4K
- 应用级导出（14 §4.2）；若目标尺寸超过 `MAX_RENDERBUFFER_SIZE` 或可用内存，按分块渲染再拼接；仍不可行则降低尺寸并明确提示。合规元素（审图号、水印、附图）在任何尺寸下都合成。

## 8. 架构级替代：Canvas 2D 预渲染瓦片
仅当 P1a 门禁判定 A5 为 STOP（WebGL2 方案在参考设备含 iPad 上无法达标且降级无效）时，经 ADR 与用户批准，A 档改为「管线预渲染底图瓦片 + Canvas 2D 绘制透镜与旗标」。接口不变。**不是运行时模式**：WebGL2 不可用的浏览器显示「不支持」页（02 §2）。

## 9. B 档（可选）设计要点（回应 R018、R031）

> B 档的 LOD、纹理页、边缘算法细节**在 P8 获批后才冻结**；以下为方向性约束。

仅当 A 档全部验收且用户确认实施时启用。

- **地形组织**：每 chunk 4×4 父 patch；LOD 0 为父 patch 拆 2×2 子块。全部 patch 按 LOD 级别**实例化提交**：同一 LOD 的所有可见 patch 共用一份网格几何，实例属性携带 `(chunkLayer, patchOffset, lodMorph)`；高度数据放在 `TEXTURE_2D_ARRAY`（每 chunk 一层，常驻层 129²、细节层 513² 分属两个数组）。**每帧地形 draw call = LOD 级数（4）× 高度数组数（≤2）≤ 8**。
- 三角形预算：全局上限 1.0M（地形）；LOD 选择后若超限，从最远 patch 起逐级降 LOD 直至满足（确定性的降级顺序）。估算：全国视角全部 LOD3 约 960 patch × 512 ≈ 49 万三角形；最坏近景在 P1a 合成场景实测后确定 LOD 阈值。
- 深度预通道：中画质关闭；高画质开启时单列预算。
- 边缘与接缝：相邻 patch LOD 差 ≤ 1（三角形超限降级后**重新执行**该约束，必要时连带降级邻居，而非只按距离盲降）；高/低两档高度图在 chunk 边界共享 1 texel 边框（border texel）；geomorph 在 patch 边缘强制对齐到粗级网格；细节噪声振幅在 chunk/patch 边缘 2 个顶点间距内衰减为 0。
- splat：7 个材质权重（RGBA8 + RGB8，第 8 层 = 1 − Σ）+ **AO 独立 R8 纹理**（修正 V0.1 通道冲突）。
- 实例模型（树木、建筑）：按视距使用 impostor（远）/简模（中）/模型（近），全局实例与三角形上限同 A 档思路。
- B 档验收另立（18 P8-B）。

---

<!-- 文件：08-sim-core.md -->

# 08 模拟内核（M2）

## 1. 职责
`packages/sim` 是游戏规则的唯一实现：输入（世界包 + content + 种子 + 命令序列）→ 状态、事件、差量。无 DOM、WebGL、时间、网络。

## 2. 确定性规范

### 2.1 规则表

| # | 规则 | 检查方式 |
|---|---|---|
| D1 | 禁用 `Math.random`、`Date`、`performance`、`setTimeout/setInterval`、`crypto` | ESLint（03 §2，含别名绕过检测） |
| D2 | 禁用全部超越函数（`sin/cos/tan/asin/acos/atan/atan2/exp/expm1/log/log1p/log2/log10/pow/hypot/cbrt/sinh/cosh/tanh…`）与 `**` 运算符的非整数指数；允许 `+ − × ÷ %`、`Math.sqrt/abs/floor/ceil/round/trunc/sign/min/max/imul/fround/clz32` | ESLint；需要时用 `sim/math`（§2.3） |
| D3 | 数值域：所有持久状态数值必须有限；整数量必须在 `[−(2^53−1), 2^53−1]`；中间乘积按 §2.4 规则检查 | 运行时断言（dev/test 构建开启，生产构建在回合末统一检查） |
| D4 | 迭代顺序：数组按索引；`Map/Set` 仅在插入顺序确定时使用；禁止依赖对象键顺序的逻辑 | 代码审查 + `guard-for-in` |
| D5 | 排序稳定且全序，平局按 ID | `assertTotalOrder` 测试工具 |
| D6 | PRNG：标准 PCG32（§2.2） | golden vectors |
| D7 | 浮点累加固定顺序，禁止并行归约 | 代码审查 |
| D8 | 状态哈希：§2.5 | golden vectors |
| D9 | 计时与日志不得影响状态：`timingsMs`、调试日志由宿主通过观察者采集；观察者只接收步骤 ID，异常被隔离吞掉（§5.1） | ESLint + 审查 |
| D10 | 字符串比较只用码点/字节序（禁止 `localeCompare`、`Intl.*`、`toLocale*`） | ESLint `no-restricted-properties` |
| D11 | 输入确定：sim 只接受经 schema 校验的输入（content.json、世界包、命令）；命令按 Worker 串行队列顺序处理；sim 内无异步、无宿主回调影响状态 | 代码审查 + 类型 |
| D12 | 写入窄类型 TypedArray 前必须经 `writeChecked`（有限性 + 范围 + 整数性检查），禁止直接赋值（隐式截断/回绕） | ESLint 自定义规则 + 测试 |

> lint 是辅助手段而非充分证明；确定性最终由跨引擎回放与首个差异定位工具（§2.6）保证（回应 R117）。

### 2.2 PRNG：标准 PCG32 XSH-RR 64/32（回应 R011）

- 内部 64 位 `state` 与 64 位 `inc`（奇数），JS 中各以 `(hi, lo)` 两个 uint32 表示；64 位乘加按 16 位分块用 `Math.imul` 与 `>>> 0` 实现，乘数 `6364136223846793005`（PCG 官方常数）。
- 初始化：遵循 PCG 官方 `pcg32_srandom_r(initstate, initseq)` 流程。
- **种子派生（回应 R116）**：
  - SplitMix64 指 Vigna 的标准**生成器**：`state = state + 0x9E3779B97F4A7C15 (mod 2^64)`；`z = state`；`z = (z ^ (z >>> 30)) × 0xBF58476D1CE4E5B9`；`z = (z ^ (z >>> 27)) × 0x94D049BB133111EB`；输出 `z ^ (z >>> 31)`（全部 mod 2^64，以双 uint32 实现）。
  - `gameSeed64`：玩家 uint32 种子零扩展为 SplitMix64 初始 state，取第 1 个输出。
  - 系统 k：`initstate_k` = 以 `gameSeed64 ^ k` 为初始 state 的 SplitMix64 第 1 个输出；`initseq_k = k`（PCG 规则 `inc = (initseq << 1) | 1`）。
  - **系统 ID 全表（冻结；增删需 simVersion +1）**：`1 AI`、`2 EVENTS`、`3 PROJECTS`、`4 ECONOMY`、`5 POPULATION`、`6 MISC`。渲染装饰抖动用 TileId 哈希，不用 PRNG 状态。
- **流策略**：每系统一条连续流（跨回合不重置），状态只存在于规范状态内（§2.5）。
- **取样**：`nextU32()`；`nextFloat01()` = `nextU32() / 2^32`；`nextBelow(n)`：n 合法域为整数 `[1, 2^32 − 1]`，否则抛错；Lemire 32 位无偏拒绝采样：`m = nextU32() × n`（64 位积，双 uint32）、`l = m mod 2^32`；若 `l < n`，令 `t = (2^32 − n) mod n`，当 `l < t` 时重抽（每次消费 1 个 U32）；返回 `floor(m / 2^32)`。
- **测试向量**（P1a 从官方 C 实现与独立 Python 参考实现运行生成后入库，不凭记忆填写）：PCG `(42, 54)` 前 32 个输出；种子 0 与 `2^32−1`；6 个系统各 16 个输出；`nextBelow` 在 n = 1、3、2^31+1、2^32−1 及触发拒绝分支的样例；跨回合存读档后的续接输出。
- 修改 PRNG 或消费顺序 = `simVersion` +1。

### 2.3 确定性数学库 `sim/math`（回应 R034）

| 函数 | 有效域 | 精度 | 越域行为 |
|---|---|---|---|
| `exp(x)` | `[−700, 700]` | 相对误差 ≤ 1e-13 | `x < −700` → 返回 0（定义为下溢）；`x > 700` → 抛 `MathDomainError`（视为 bug） |
| `ln(x)` | `[1e-300, 1e300]` | 绝对误差 ≤ 1e-13（x∈[0.5,2]），其余相对 ≤ 1e-13 | `x ≤ 0` → 抛错 |
| `pow(x, y)` | `x > 0`，`|y·ln x| ≤ 700` | 由上两者组合 | 同上；`x == 0` 时由调用方显式分支处理 |
| `logisticSigmoid(x)` | 全实数 | 1e-13 | `x > 40` 返回 1、`x < −40` 返回 0（固定阈值） |
| `softmaxStable(v[])` | 有限值数组 | — | 先减最大值；空数组/全 −∞ 由调用方处理 |

- 实现：范围约化 + 固定系数多项式（系数以**双精度位模式**常量入库，运算顺序固定）。P1a 同时测**吞吐**：45 万次 exp + 45 万次 ln 的耗时（桌面与 iPad 真机），供 11 §4.3 预算使用（回应 R122）。系数与误差在 P1a 用高精度参考（Python `mpmath`）验证并生成测试集（0、负数、域边界、极端指数、随机 100 万点）。
- 所有模型公式中可能为 0 的输入（就业、资本、可达性、住房、需求）必须在调用 `ln/pow` 前显式分支（09、10、11 中逐处定义）。

### 2.4 数值表示
- 持久整数量（货币万元、人口人、计数）：`number` 存储，保证安全整数范围。
- 中间计算：允许 double；**任何「量 × 比例系数」的乘法若可能超过 2^53，须先除后乘或使用比例 ≤ 1 的形式**；dev 构建对关键乘法点加 `assertSafe()`。
- 定点比率：`Fixed4`（×10,000，int32）。
- **写入即规范（替代 V0.2「回合末量化」，回应 R105）**：持久字段每次写入经 `writeChecked(field, v)`：有限性 → 按 scale 用 `rhaz`（04 §2.3）量化 → 范围与整数性 → `−0` 归一 → 写入；失败抛 `StateInvariantError`。回合中途与回合末状态都已是规范值，存档不改变任何值。
- 可能超出安全整数或窄类型的乘法先做上界检查（`assertSafe`），在任何分支使用其结果之前完成。
- 整数分配（人口、资金按比例拆分）一律**最大余数法**，余数平局按实体 ID 升序。

### 2.5 规范状态编码 CSE-1 与哈希（回应 R012、R105）

规范状态 = 一个 CCB 文件（06 §2，containerVersion 2），段顺序 = 段名 ASCII 升序：

| 段 | 内容 |
|---|---|
| `meta`（json，CCJ-1） | 语义头：`stateSchemaVersion`、`simVersion`、`worldIdentity`（scenario-cal 叶子）、`contentHash`、`turn`、`gameOver`、`mode`、`controller`、`seed`、`revision`、`acceptedSeqNext` |
| `<表>.id`（u32） | 实体表**有效行的显式 ID**，升序 |
| `<表>.<列>` | 有效行的列值，与 `.id` 对齐；dtype/单位/scale 由 `state-fields.json` 规定 |
| `<表>.next_id`（u32，count 1） | 下一个 ID（ID 不复用；删除即从 `.id` 中消失） |
| `tiles.<列>` | 格动态列，按窗口 localIndex 全长度 |
| `rng.<系统名>`（u32×4，count 1） | PCG32 state(hi,lo)、inc(hi,lo) |
| `xs.<名称>` | 影响后续结果的跨回合量：交通上一回合流量、价格指数、库存、在建工程、待决事件、协议、AI 持久记忆 |

- CCB 自带每段名称、dtype、arity、count、长度与 CRC，**提供完整 framing**，变长列不会拼出相同字节串；有效行带显式 ID，可复原空槽。
- **`state-fields.json`**：每个持久字段 `{id, dtype, arity, unit, scale, min, max, integer, owner}`。L1 冻结编码规则与 V1 核心字段（§3.1）；P3a-A0 补全；之后增删字段 = `stateSchemaVersion` +1 并提供迁移函数。
- **哈希**：`stateHash = hex8(xxHash32(cse, 0)) ∥ hex8(xxHash32(cse, 0x9E3779B1))`，每路 8 位小写十六进制（补零）；`cse` = 整个 CSE-1 字节。语义头使哈希绑定世界/内容/规则版本。**非密码学用途**，只用于确定性与存档一致性校验（回应 R116）。
- **不纳入**：`timingsMs`、调试日志、ViewModel、可确定性重建的缓存（有「丢弃后继续运行哈希不变」测试）。

### 2.6 差异定位工具（回应 R117）
跨引擎回放哈希不一致时，测试工具导出两端 CSE-1，逐段比较并报告**首个不同的段名、元素索引与字节偏移**。

## 3. 状态模型

### 3.1 V1 核心持久字段（L1 冻结；完整清单见 `state-fields.json`，P3a-A0 补全）

| 表/区 | 字段（单位） |
|---|---|
| meta | 见 §2.5 |
| `provinces` | `cash`、`debt`（万元，安全整数）、`taxBand`（1–5）、`spending.*`（Fixed4）、`policySlots`、`researchPoints`、`aiMemory.*` |
| `central` | `cash`、`debt`（万元） |
| `cities` | `popUrban`、`popRural`（人）、`housingCap`、`serviceEdu`、`serviceHealth`、`amenity`、`satisfaction`、`capital.*`（万元）、`employment.*`（人）、`priceIndex.*`（Fixed4）、`inventory.*`（万元） |
| `city_tile_pop` | CSR `(city_id, tile_id, pop)`（09 §3.3） |
| `edges` | 动态列：`status`、`condition`、`openTurn`、`ownerProvince`、资金份额 CSR |
| `works` | 在建工程：`kind`、`target`、`totalCost`、`paid`、`periodsLeft`、出资份额 CSR |
| `agreements`、`events_pending`、`projects` | 状态、参与方、截止回合 |
| `xs.*`、`rng.*` | §2.5、§2.2 |
| `history` | 关键指标时间序列（整数或 Fixed4） |

### 3.2 其他
- 实体表：列式 + `alive`；ID 不复用；表容量增长不影响哈希（只序列化逻辑有效行）。
- TileStore 动态列：`pop`（整数人）、`zone`、`building`、`urbanLevel`、`pollution`、`ecology`、`surveyed`、`infraFlags`。
- 新增 `controller` 元数据（§6.1）。

## 4. 回合与时间
- 回合 0 = 2021Q1 未结算（01 §3.2）；`endTurn` 结算当前回合并进入下一回合；最后回合 119（2050Q4）结算后 `gameOver = true`。

## 5. 回合管线（固定顺序）

```
endTurn(state):
  0. 关闭玩家命令窗口；在回放日志记录 EndTurn 边界（§6.4）
  1. AI：基于步骤 0 之后的同一只读快照，所有 AI 省生成候选；按 12 §5.3 冲突规则依次以 AI 身份执行
     （与玩家同一执行路径，但不写入回放日志——回放时由相同 seed/state 重算）
  2. 工程推进（含按期扣款，§6.3）
  3. 交通（10 §5）
  4. 经济（11 §4）
  5. 财政（11 §5）
  6. 人口（使用步骤 3 本回合的成本矩阵与可达位图、步骤 4 本回合工资）
  7. 城市
  8. 研发与政策
  9. 事件（需选择的进入待决，下回合开始展示）
 10. 国家项目（投标统一结算）
 11. 计分与历史
 12. 不变量检查、stateHash、差量；turn += 1；若 turn == 120 → gameOver = true
```

### 5.1 计时与观察者（回应 R024）
`endTurn(state, observer?)`：`observer.onStepStart(stepId)` / `onStepEnd(stepId)` 由宿主（sim-worker）实现并在宿主侧读取时间；sim 本身不调用任何计时 API。`TurnResult.timingsMs` 由宿主填充。

### 5.2 预算
软目标合计 ≤ 1,070 ms，硬上限 1,500 ms；工程推进与研发计入「其他」（15 §2.2，回应 R122）。

## 6. 命令语义（回应 R013、R014）

### 6.1 控制者与权限
```
controller：{ kind: 'player', scope: 'province', province: P } | { kind: 'player', scope: 'nation' } | { kind: 'ai', province: P } | { kind: 'system' }
actingProvince：命令以哪个省的名义执行（扣谁的钱、建在谁的辖区）
```
- 省级玩家：`actingProvince` 必须等于自己的省；跨省线路须对方同意（协议机制）。
- 全国沙盒：可为任何省执行命令（`actingProvince` 任意）；无竞赛与计分。
- 宿主（sim-worker）提供真实 `Controller`，sim 校验权限；回放日志记录每条命令的授权主体。
- AI：只能以自己的省执行。
- `system`：仅事件与中央规则内部使用，不出现在外部命令中。

### 6.2 生命周期：提交即原子生效（回应 R013、R108）
1. 宿主生成 `commandId`（UUIDv4）与 `payloadDigest = hex(SHA-256(CCJ-1(命令去掉 commandId、clientSeq)))`。
2. Worker 串行处理：`commandId` 已在幂等账中——digest 相同 → 返回 `duplicate`（只含原 `acceptedSeq` 与**当前** revision，**不含差量**）；digest 不同 → 拒绝 `COMMAND_ID_CONFLICT`。
3. 否则 `validate` → 原子 `apply` → 分配 `acceptedSeq` → 写回放日志与幂等账 → 返回 `{accepted, acceptedSeq, revision, diff}`。
4. 拒绝：返回原因；不写日志、不入幂等账（同 commandId 重试按新请求校验）。
5. 命令携带 `baseTurn`；与当前回合不同 → `STALE_TURN`。
6. 取消：`CancelOrder` 为新命令，按 §6.3 处理。
7. 幂等账与回放日志随存档持久化（06 §7），读档后重试仍幂等。

### 6.3 工程与跨省出资：单一账本（回应 R107）
- 模式：「**承诺比例、按期原子扣款、不预扣**」。
  - 开工（`BuildLink` / `Construct` / 协议生效）只登记 `works` 行：`totalCost`、`periods`、出资份额（基点整数，Σ = 10,000），不扣款。
  - 每回合步骤 2：本期应付 = `totalCost` 按期数最大余数法拆分的本期额；各方份额同样最大余数法拆分；**所有出资方现金都够才原子扣款并推进**，否则本期整体顺延（不部分扣款）。
  - 取消：未付部分不再支付；已付部分不退（沉没成本）；不存在凭空增减。
  - 协议接受：校验双方至少能付首期（不扣款），否则拒绝。
- 11 §5.1 的跨省出资按本节执行。

### 6.4 回放日志（回应 R106）
- **唯一权威回放日志** = 玩家已接受命令（`turn`、`acceptedSeq`、`controller`、完整命令）+ 每次 `EndTurn` 边界 + 终局标记；空回合也有 EndTurn。
- AI 命令**不进入**回放日志；回放时由同一 seed 与状态重算。可选保存 AI 轨迹（每回合 AI 命令摘要与哈希）用于诊断，不参与重放。
- AI 生成的实体 ID 用状态内确定性计数器（`next_id`），不用 UUID。
- 回放用例：0 玩家命令、连续空回合、被拒命令（不在日志）、事件选项、AI 全开、回合中途存读档、终局后命令被拒。

### 6.5 路线报价（回应 R107）
- `RoutePreview` 返回确定性报价 `{mode, waypoints, actingProvince, tiles, cost, periods, topologyRevision, paramsRevision}`，`quoteDigest = SHA-256(CCJ-1(报价))`。
- `BuildLink` 携带 `waypoints`、`expectedCost`、`expectedPeriods`、`quoteDigest`；sim **用当前权威状态重新计算**路径与成本（A* 与参数确定），摘要不同 → `QUOTE_STALE`。不依赖 UI 缓存，回放与读档后同样可验证。

## 7. 差量与修订号
- 每次状态变化产生 `StateDiff` 与新 `revision`（单调递增，持久化于 meta）；差量带 `baseRevision`。主线程只在 `gameId` 匹配且 `baseRevision == 本地 revision` 时应用，否则请求全量快照（14 §6 `snapshot`）。
- 预算（回应 R122）：常规回合差量 ≤ 512 KiB；单条消息 ≤ 4 MiB，超过则按同一 revision 分片，全部到齐才应用；主线程**分帧应用**，每帧 ≤ 4 ms，期间 UI 处于「结算展示中」锁定态；全列发送（如 pop ≈ 320 KiB）的峰值单独度量。

## 8. 公开 API
见 14 §5；Worker 协议见 14 §6。

## 9. 开发期默认驱动量（回应 R001）

### 9.1 未实现子系统的默认值（P3/P4 使用，provenance = `fixture-default`）

| 子系统未实现时 | 替代输入 |
|---|---|
| 经济（P3、P4） | `wageIndex(c) = 1.0`；`unemployment = 0.05`；就业 = 劳动年龄人口 × 0.7 |
| 交通（P3） | `C_ij = 直线距离(km) × 0.5`（单位：广义成本）；`Access(c) = Σ_j P_j·exp(−0.002·C_ij)` |
| 财政（P3、P4） | 服务水平固定为初始值 |
| 政策/事件/AI（P3–P6） | 关闭（P6 校准时同样关闭，11 §6） |

## 10. 验收
1. 同一回放在 Chromium、Firefox、WebKit（Playwright）与 Node 以及桌面 Safari 与 iPadOS Safari 真机中逐回合 `stateHash` 一致（P3a-A5）。
2. 存档→读档→继续 = 直接继续（哈希一致）；「丢弃可重建缓存后继续」哈希一致。
3. 重复提交同一 `commandId` 不重复执行；乱序/缺口差量触发 resync。
4. 极端值测试：容量扩张、ID 删除后新增、`−0`、超大值断言触发。
5. ESLint 确定性规则（含别名绕过）零违规；`sim` 无 DOM lib 下 `tsc` 通过。

---

<!-- 文件：09-city-population.md -->

# 09 城市与人口系统（M2）

## 1. 实体粒度
| 实体 | 数量（管线统计） | 模拟角色 |
|---|---|---|
| 城市 City | 地级及以上，约 337 | 经济、迁移基本单元 |
| 城镇 Town | 县级行政中心，约 2,800 余 | 人口空间分布与视觉节点；统计独立存储（06 §4.3），经济计入所属城市（11 §6 口径规则） |
| 格 Tile | 中国可经营格（R 定稿后统计） | 人口分布、功能区 |

## 2. 城市属性（单位与取值域，回应 R035）

| 列 | 类型 | 单位 / 域 |
|---|---|---|
| `popUrban`, `popRural` | int | 人，≥ 0 |
| `housingCap` | int | 人，≥ 1（下限 1 防止除零；初始值 = popUrban × 1.1） |
| `serviceEdu`, `serviceHealth` | int | 指数 [1, 1000]（下限 1） |
| `amenity` | Fixed4 | [−1, 1] |
| `satisfaction` | int | [0, 1000] |
| `wageIndex` | f64 | > 0，全国均值 = 1.0（经济系统输出，下限 0.05） |
| `unemploymentRate` | Fixed4 | 比例 [0, 1]（**V0.1 的 ‰ 改为比例**） |
| `pollutionIndex` | Fixed4 | [0, 1] |
| `tier` | u8 | 0–5 |

## 3. 人口模型

### 3.1 自然增长（出生、死亡分项，回应 R035）
```
births(c) = P(c) × b_p(t) / 4 × M_birthPolicy(p) × M_dev(c)
deaths(c) = P(c) × d_p(t) / 4
ΔP_nat = births − deaths
```
- `M_birthPolicy` 只作用于出生项，死亡率不受生育政策影响。
- `b_p(t)`, `d_p(t)`：省级年率；基准为 2020 年统计（场景数据，带来源）；随时间的趋势表若无可靠来源则标为「游戏假设」。

### 3.2 迁移
1. 吸引力（无量纲，所有输入已有下限，ln 安全）：
   ```
   A(c) = w1·ln(wageIndex) + w2·(1 − unemploymentRate) + w3·ln((serviceEdu + serviceHealth)/2000)
        + w4·amenity − w5·ln(max(popUrban, 1)/housingCap) − w6·pollutionIndex + A0(c)
   ```
2. 迁出：`Out(i) = min(P(i), floor(P(i) × m0 × sigmoid(A_ref − A(i))))`；`m0` 合法域 [0, 0.05]（content 编译器校验）。
3. 目的地集合 `J(i)` = 除 i 外、**可达位图 `reach[i,j] = 1`**（10 §5，不以数值是否有限判断）的城市；**不允许迁往自身**；若 `J(i)` 为空则 `Out(i) = 0`。
4. 分配：`share(i→j) = softmaxStable_j( λ·A(j) − β·ln(C_ij) + κ·sameProvince(i,j) )`，`C_ij ≥ 1`（下限）。
5. 整数化：`Out(i)` 按 share 最大余数法分配。
6. 成本矩阵 `C_ij` 使用**本回合**交通步骤输出（08 §5 步骤 6）。
7. 城乡转化：`ΔUrban(c) = min(popRural, floor(popRural × u0 × clamp(就业缺口率, 0, 1)))`；95% 上限**只约束新增转化**（初始已超过 95% 的城市不回退）。

### 3.3 空间分布：城市 × 格贡献（回应 R101、R126）
- 状态 `city_tile_pop`：CSR `(city, tile, pop)`，初始值 = 县整数贡献（04 §4.1 `pop_int`）按县所属地级市合并。**城市人口 = Σ 其条目；格人口 = Σ 该格所有城市条目**。共享格可同时属于多个城市；没有管理格的城市也有条目（不会除零、不会丢人）。
- 每回合城市人口变化量 ΔP(c)（整数，先定总量）分配到该城市条目：
  - 增加：住宅区容量 × 可达性衰减（城镇部分）或耕地 × 初始人口（乡村部分）；
  - 减少：按当前条目人口比例（不出现负值）；
  - **零权重回退顺序**：① 当前条目人口比例 → ② 城市条目均匀分配 → ③ 城市的「非空间账户」条目（`tile = 0xFFFFFFFF`，计入城市人口与全国守恒，不在地图上显示）；
  - 整数化：最大余数法，余数平局按 TileId。
- 不可经营区域与背景区人口为固定观测值，不参与模拟，但计入全国统计（标 `observed`）。
- **事件人口变化的唯一方向**：事件作用于城市人口（12 §4），再按本节同步到格；事件 YAML 不允许直接写 `tile.pop`（编译器拒绝）。
- 守恒断言：每回合 Σ条目 = Σ城市人口；全国 = 城市合计 + 非模拟区域观测值。

## 4. 城市空间
- 辖区：管理归属为该地级行政区的格（04 §4.1）。
- 建成区初值：`builtupPct ≥ 20%`。
- 扩张：触发条件「建成区平均密度 > densityMax(tier)」；候选 = 建成区相邻且**通过硬过滤**的格（生态区、湿地、冰川、海洋、`has_land = 0` 一律排除——**不再使用 ×∞**）；评分 `−slopePenalty + accessBonus + riverBonus − farmlandProtection`，平局按 TileId；每城市每回合最多 1 格。
- 功能区规则同 V0.1。

## 5. 服务与满意度
同 V0.1（滞后趋近 15%/回合）。

## 6. 视觉映射
同 V0.1：tier、建成格、地域风格、旗标优先级。

## 7. 验收（P3，合成 fixture + scenario-raw 子集）
1. 初始：城市人口 = Σ其县整数贡献；回合 0 无干预时 `city_tile_pop` 与初始贡献完全一致（不搬移）。（P3a 用合成 fixture；P3b 用 scenario-raw 子集）
2. 迁移守恒：迁移前后总人口（不含自然增长）整数相等。
3. 零值边界：fixture 含「无住房」「无耕地」「无管理格」「不可达」「空目的地集」「出生=死亡」「初始城镇化 > 95%」「灾害事件」，不产生非有限值或负值，人口守恒成立。
4. 相对因果（合成 fixture，回应 R035）：两城市对照，提高 A 城市 `wageIndex` 20%，10 回合后 A 的净迁入**相对对照组**更高。
5. 扩张：接近扩张阈值的 fixture 城市在人口上升后新增建成格 ≥ 1。
6. 无干预 40 回合（`scenario-raw` + 默认驱动量）：无负值/非有限值；单回合城市人口变化 ≤ 3%（信息项，超出时出报告而非直接失败，用于调参）。
7. 性能：人口 + 城市 ≤ 150 ms（统一口径，回应 R042）。

---

<!-- 文件：10-transport.md -->

# 10 交通系统（M2）

## 1. 范围
模式：高速公路、普通干线公路、普速铁路、高速铁路、内河航道、海运、航空，以及**换乘/接驳/渡运**三类连接边（回应 R016）。城市内部交通不单独模拟。

## 2. 网络模型：有向多模态图（回应 R016）

### 2.1 构建顺序
真实拓扑 → 有向图 → 格路径映射 → 收缩（05 §5.3 `65_networks`）。只有真实共享节点、站点或渡运才产生连接；**同格相交不代表连接**。

### 2.2 节点

| `nodeKind` | 含义 |
|---|---|
| `junction` | 同模式线路真实交汇点 |
| `station_rail` / `station_hsr` | 铁路车站 / 高铁站 |
| `interchange` | 高速出入口 |
| `port` / `river_port` / `airport` | 设施 |
| `city_hub` | 城市虚拟枢纽（每城市 1 个） |
| `town_hub` | 城镇虚拟枢纽 |
| `ext_market` | 外部市场（口岸） |

### 2.3 边（全部**有向**；双向线路存为两条边，共享 `lineId`）

| `edgeKind` | 说明 |
|---|---|
| `link` | 实际线路区段（带 `mode`） |
| `transfer` | 同一枢纽内设施之间、设施与 `city_hub` 之间的换乘边（带时间惩罚） |
| `access` | `town_hub` ↔ `city_hub` 接驳（代表县乡道路） |
| `ferry` | 真实渡运航线 |
| `sea_lane` | 港口间海运航道（管线生成航道骨架，只经海洋格） |
| `air_route` | 航线（§2.5 稀疏生成） |

边属性：`from, to, edgeKind, mode, lineId, lengthKm, t0Minutes（自由流时间）, capPax（万人次/季度）, capFreight（万吨/季度）, allowPax, allowFreight, status, openTurn, ownerProvince, fundingShares, condition, geomRef, structure（none|bridge|tunnel）`。
- 客运与货运**分别准入**：例如高铁 `allowFreight = 0`；航空货运容量单列。
- 容量为 0 的边：在对应类别图中不出现（不进入 BPR 计算）。

### 2.4 持久 schema（回应 R016、R110）

**ID 域**（06 §3 体系，哨兵 = 类型最大值）：`NodeId u32`、`EdgeId u32`、`LineId u32`、`FacilityId u16`、`PoolId u32`、`GeomRef u32`。

**模式编码**：`mode u8`：`0 = 非物理连接（transfer/access）`，`1–7` = 物理模式（14 §1 `TransportMode`）；`ferry` 与 `sea_lane` 的 mode = `6 Sea`，`air_route` 的 mode = `7 Air`；`edge_kind` 区分边种类。

**节点表**（`networks.osm.ccb`）：`node_kind u8`、`node_tile u32`、`node_x i32`、`node_y i32`（整数米）、`node_settlement u16`、`node_facility u16`。

**边表**：
| 字段 | 类型 | 说明 |
|---|---|---|
| `from`, `to` | u32 | 有向 |
| `edge_kind` | u8 | 14 §1 `EdgeKind` |
| `mode` | u8 | 见上 |
| `line_id` | u32 | 同一物理线路的双向边共享；渲染按 line_id 去重 |
| `length_km` | f32 | — |
| `t0_min` | f32 | 自由流时间（分钟），**严格 > 0**（下限 0.01，回应 R118） |
| `cap_pax` / `cap_freight` | f64 | 万人次/季度、万吨/季度；**按方向**给出（数据为双向总量时按 50/50 拆分并标 `estimated`） |
| `allow` | u8 | bit0 客、bit1 货 |
| `pool_id` | u32 | 共享吞吐资源（容量池）引用；无 = 哨兵 |
| `fare_pax` | f32 | 元/人次（该边） |
| `cost_freight` | f32 | 万元/万吨（该边） |
| `status` | u8 | 0 规划 1 在建 2 运营 3 停运 |
| `open_turn` | i16 | −1 = 场景开始前已开通 |
| `structure` | u8 | 0 无 1 桥 2 隧 |
| `owner_province` | u16 | 运营归属；**初始真实线路未知 → 哨兵并在 lineage 标 `unknown`**，游戏中视为中央运营（运营收支进入中央账户） |
| `condition` | u16 | 0–1000；初始真实线路默认 1000 并标 `fixture-default` |
| `geom_ref` | u32 | 指向 `geom_index.ccb` |

**资金份额**：CSR `funding_offsets u32[E+1]`、`funding_province u16[]`、`funding_bp u16[]`（基点，Σ = 10,000）；初始真实线路为空（中央）。

**容量池**（`facilities.ccb`）：`pool_id`、`facility_id`、`cap_pax`、`cap_freight`（方向无关的总吞吐，如港口、机场）；引用同一池的所有边共同受池容量约束（在 BPR 中以池利用率 `Σ v_e / cap_pool` 作为附加拥堵项），**不在多条边上复制额度**。

**几何索引**（`geom_index.ccb`）：`geom_chunk u16`、`geom_offset u32`、`geom_length u32`（指向 `render/lines/<chunk>.ccb` 中的顶点段）。

**格路径**：`edge_tiles_offset u32[E+1]`、`edge_tiles u32[]`。

完整性校验：端点、pool、geom、facility 引用存在；双向边成对；`allow` 与容量一致（容量 0 ⇔ 对应位为 0）。

### 2.5 海运与航空
- 海运航道：只在 `sea_lane` 骨架上路由；港口容量约束在港口节点 `transfer` 边上。
- **航空稀疏化（回应 R020）**：仅为满足等级条件的机场生成航线：每机场连接 (a) 同等级以上最近 k=6 个机场，(b) 全国前 m=10 个枢纽机场；距离 < 400 km 不生成。生成规则确定（按距离、平局按机场 ID）。估算：若 200 个机场，边数 ≤ 200×(6+10)×2 = 6,400 条有向边。

## 3. 建设
- 流程：`RoutePreview`（查询，返回报价版本 `quoteId`）→ `BuildLink(quoteId)`；报价在「拓扑修订号 + 价格参数修订号」不变时有效，否则命令被拒绝为 `QUOTE_STALE`（回应 R014）。
- 路径点统一为带类型的 `Waypoint = {kind:'node', id} | {kind:'tile', id}`（14 §3）。
- 成本模型与地形系数同 V0.1（参数来源要求不变）。
- **A\* 有界（回应 R021）**：格路径层 A\*，启发式 = 直线距离 × 最低单位成本（可采纳）；扩展上限 `maxExpansions = 20,000`（固定，非时间上限）；超限返回 `ROUTE_TOO_COMPLEX`，UI 提示增加途经点。

## 4. 需求
- 客运 OD（337²）：重力模型（参数 P4/P5 校准）；`C_ij` 不可达时该对需求为 0（记录为「潜在需求」用于 AI 与报告）。
- 货运 OD：上一回合经济贸易流（11 §4），按部门「价值→吨位」系数换算。

## 5. 流量分配（每回合，回应 R020、R118）

**性质声明**：玩法近似——单次全有全无分配 + 跨回合指数平滑，**不是**用户均衡求解。

```
对客运图、货运图分别：
 1. 边成本 c_e = t_e × VOT_class + 费用（t_e 为上一回合末计算的拥堵时间）；所有 c_e > 0
 2. 对每个有出发需求的 city_hub（≤ 337）：Dijkstra（CSR 邻接、预分配二叉堆、**惰性删除**而非 decrease-key、平局按节点 ID）
    记录 settle 顺序与前驱边（前驱在节点 settle 时确定，之后不改）
 3. 流量加载：按该起点的 **settle 顺序逆序**遍历节点，把子树需求累加到前驱边（无需额外排序；
    因 c_e > 0，前驱树无环）
 4. 平滑 v_e ← (1 − λ)·v_e + λ·y_e，λ = 0.5
 5. 新拥堵时间 t_e = t0_e × (1 + 0.15 × (min(v_e/cap_e, 3))^4) + 池拥堵项；**下一回合生效**
 6. 输出：成本矩阵 C（本回合路由实际使用的成本，即步骤 1 的成本）与可达位图 reach（337² bit）
```

- **可达性语义**：不可达**只**由 `reach[i,j] = 0` 表示；C 中不可达位置填哨兵 `UNREACHABLE = −1`（任何消费者必须先查 reach，禁止用 `isFinite` 判断）。OD 自环（i = i）：本地出行，成本 0，不进入网络加载。
- **复杂度（重估，未实测）**：V ≈ 6,000、E ≈ 20,000，两套图 × 337 起点：边松弛检查 ≈ 1.35×10⁷，节点 settle ≈ 4.0×10⁶；惰性删除堆最坏推入次数 ≈ 松弛成功次数（≤ E/起点），上界估算堆层级工作 ≈ (1.35×10⁷ + 4.0×10⁶) × 12.6 ≈ 2.2×10⁸ 基本操作（GPT 审查给出的上界；V0.2 的 6.4×10⁷ 为乐观估计）。**300 ms 软 / 500 ms 硬未经证实**，以 P1a-A6 实测为准（门禁见 18）。
- 不达标处理顺序：① 收缩更多（合并度 2 链、合并同站设施）；② 减少起点（合并近距离城市需求）；③ 路由核迁 WASM（ADR）。
- 删除 V0.2 之前的「成本变化 < 5% 复用最短路树」（无正确性保证）。

## 6. 输出
`C_pax`、`C_freight`、`Access(c) = Σ_{j∈可达} P_j·exp(−β·C_ij)`、边流量与利用率、运营收支（按 `fundingShares` 分配给省）。

## 7. 验收（P4 / P5）
1. 连通性按 05 V5（真实覆盖 + 审计例外清单）；不可达对只通过 reach 位图处理，消费者不产生非有限值。
2. 对照（回应 R104）：选 10 组有高铁直达的城市对，比较**模型高铁单模式在途时间**（同一对车站、只走 HSR 边、自由流）与时刻表来源中同一对车站的最快在途时间（来源与日期入库），误差 ≤ 25%；广义成本单独报告，不与时刻表比较。P5 验收。
3. 因果（垂直切片 fixture）：新建高铁后两城市间 `C_pax` 下降，新线流量 > 0，旧并行线流量下降。
4. 性能：P5 用**固定 OD（无 AI）**做全国交通单系统压力测试：≤ 300 ms 软 / 500 ms 硬（P95，桌面参考中档 A；iPad 预算见 15 §3）。31 省全 AI 下的整回合负载测试在 P7（回应 R113）。
5. `RoutePreview` P95 ≤ 50 ms（典型 500 km 线路）；`ROUTE_TOO_COMPLEX` 路径可触发且被 UI 处理。
6. 守恒：每个 OD 需求 = 加载到其路径首边的流量（逐起点检查）。

---

<!-- 文件：11-economy.md -->

# 11 经济系统（M2）

设计目标：可解释、可校准、计算量固定、**账户闭合**。是「空间经济玩具模型」，不声称反映现实行政或经济机制（回应 R037）。

## 1. 主体
城市（约 337，规则驱动）；省级政府（玩家/AI）；中央（规则：转移支付、国家项目）；外部市场（口岸虚拟节点）。

## 2. 口径（回应 R015、R003）

| 量 | 定义 | 单位 |
|---|---|---|
| 增加值 `VA[c,s]` | 统计 GDP 口径；初始值 = 2020 年度城市分部门增加值 ÷ 4 | 万元/季度，2020 年不变价 |
| 总产出 `X[c,s]` | `X = VA / v_s`，`v_s = 1 − Σ_{s'} a[s',s]` 为部门增加值率 | 同上 |
| 中间投入 | `a[s',s] × X[c,s]` | 同上 |
| 价格指数 `p[c,s]` | 无量纲，初始 1.0，域 [0.5, 2.0] | — |
| 实际 / 名义 | V1 只有「游戏价格指数」对名义量的调整；GDP 统计口径用实际量（不变价）；不模拟通胀 | — |

投入系数矩阵 `a`（6×6，约束：元素非负、**每列和 < 1**，因此增加值率 `v_s > 0`；编译器校验）：来自国家投入产出表的聚合（表的年份、来源、聚合方法在 P6 核实并入库；核实前使用标注为「游戏假设」的占位矩阵，仅用于开发）。

部门（不变）：`agri, energy, mfg, cons, svc, tech`；可贸易：agri、energy、mfg、tech；本地：cons、svc。**tech 贸易系数 0.5 的含义**：tech 产出的 50% 进入可贸易池参与 §4.3 分配，50% 只供本地需求（按本地部门规则）。

**商品计量单位**：贸易、库存、进出口一律以**整数「万元（2020 年不变价）」价值单位**计量；价格指数只用于名义结算与分配权重，不改变物量单位。

## 3. 生产（增加值形式）

```
VA[c,s] = A[c,s] × L[c,s]^α_s × K[c,s]^(1−α_s) × Access(c)^θ_s × R[c,s]
```
- 零值规则：`L = 0` 或 `K = 0` → `VA = 0`（显式分支，不调用 pow）；`Access` 下限 1e-6；`R[c,s] = 0`（如无耕地城市的 agri）→ `VA = 0`。
- **潜在产能与实际产出（回应 R119，滞后近似）**：本回合 `VA` 为潜在产出并计入 GDP（未售部分进入库存，库存变动按 GDP 口径计入）；若某城市某部门的中间投入在本回合出现缺口率 `u`（11 §4.3 unmet / 需求），**下一回合**该部门产能乘以 `(1 − φ·u)`（φ ∈ [0,1]，content 配置）。这是明确的滞后近似，不求当期投入约束均衡。
- `L` 由劳动力按相对工资缓慢再分配（≤ 5%/回合）；`K' = K(1 − δ) + I`。
- `pow` 使用 `sim/math`（08 §2.3），输入已保证 > 0。

## 4. 需求与贸易

### 4.1 需求
- 中间需求：`ID[c,s'] = Σ_s a[s',s] × X[c,s]`
- 最终需求：居民消费（收入 × 消费率 × 部门份额）+ 政府消费 + 投资（资本品来自 mfg、cons）
- `D[c,s] = ID + FD`

### 4.2 本地部门
`supply = min(X_cap, D)`；缺口记为 `shortage[c,s]`（影响满意度），**不跨城市调配**。

### 4.3 可贸易部门：有上限、库存守恒的整数分配（回应 R015、R109）

**账户定义**（每城市 i、每可贸易部门 s，单位：整数万元）：
- `I_open`：期初库存；`W = floor(I_open × w_s)`：本期库存损耗（w_s ∈ [0, 0.2]）；`X`：本期产出（整数化）
- **可用供给** `S = X + I_open − W`
- 行守恒：`Σ_j F[i,j] + export[i] + I_close[i] = S[i]`（等价 `ΔI = X − W − ΣF − export`）
- 列守恒：`Σ_i F[i,j] + import[j] + unmet[j] = D[j]`
- 外部市场：`export ≤ exportCap[口岸]`、`import ≤ importCap[口岸]`，只有口岸城市（及经网络连到口岸的城市，按其到口岸的成本）可进出口；进出口记入口岸账户。

**分配算法**（固定 K = 3 轮，每轮以**残余**供需重新计算）：
```
初始化 S_res = S，D_res = D，F = 0
for k in 1..K:
  w[i,j] = S_res[i] × E_s[i,j] × p[i]^(−σ)        （E_s = exp(−τ_s × C[i,j]) 每回合预计算；reach=0 → 0；S_res=0 → 0）
  对每列 j：Wsum = Σ_i w[i,j]；Wsum = 0 → 本轮该列不分配（留待后续轮或外贸，**不立即转进口**）
  G[i,j] = D_res[j] × w[i,j] / Wsum                （实数）
  对每行 i：a_i = min(1, S_res[i] / Σ_j G[i,j])；G[i,j] ← a_i × G[i,j]
  整数化（受容量约束）：F_k[i,j] = floor(G[i,j])；剩余额按小数部分降序（平局按 (i,j)）逐单位补配，
                       每补 1 单位须满足该行、该列的残余容量 > 0
  F += F_k；S_res、D_res 减去本轮行列和
end
外贸：D_res > 0 的列按口岸成本从口岸进口（≤ importCap），仍余 → unmet
      S_res > 0 的行按口岸成本出口（≤ exportCap），仍余 → I_close
```
- **守恒性**：每轮行缩放保证 `Σ_j G[i,j] ≤ S_res[i]`、列和 ≤ `D_res[j]`；整数化先向下取整再在残余容量内补配，不会突破上限（不会出现 0.5 + 0.5 舍入成 2 的超卖）。逐行、逐列、逐部门守恒，整数精确。
- **非最优声明**：这是有界近似，不保证最大满足率。已知反例：A 可供 J1、J2，B 只可供 J1，各供 50、各需 50；比例分配可能让 B 有剩余而 J2 有缺口，尽管存在完全满足的分配。作为玩法近似接受，缺口计入 `unmet` 并在 UI「供需」报告中可见。
- 本地部门（cons、svc、tech 的本地份额）：`supply = min(产能, 本地需求)`；缺口为 `shortage`（影响满意度），过剩产能为闲置（**不形成库存**）。
- 复杂度（估算，未实测）：每回合 E_s 预计算 337² × 4 ≈ 45 万次 exp；3 轮分配约 1.4×10⁶ 项 × 每项 10–30 次运算；整数补配最坏 O(337²) 每部门。P1a 测 exp 吞吐，P4（VS）用满规模 337 城市矩阵做基准（回应 R122）。

### 4.4 价格与产能利用
`p ← p × (1 + η × clamp((D − 实际供给)/max(D, ε), −0.1, 0.1))`，截断到 [0.5, 2.0]。

## 5. 财政与账户（回应 R037）

### 5.1 省级与中央账本（每回合，整数万元；回应 R037、R119）

```
省 p：
 收入 = Σ_城市 VA_q × taxRate(band) + 中央补助 + 运营收入（本省拥有的边）+ 土地收入
 支出 = 工程按期付款（08 §6.3）+ 维护 + 教育 + 卫生 + 研发 + 生态 + 利息 + 上解中央
 cash' = cash + 收入 − 支出 + 新增借款 − 还本
 debt' = debt + 新增借款 − 还本
中央：
 收入 = Σ_p 上解 + 中央运营收入（未知归属/中央线路）
 支出 = Σ_p 中央补助 + 中央工程 + 中央利息
 cash'、debt' 同上
```
- 每笔省—中央转移以**双方等额过账**（上解：省支出 = 中央收入；补助：中央支出 = 省收入）。
- 税基：季度 VA；**负债率 = debt / (4 × 当季 GDP)**（年化）；利率按负债率分段（content）。
- 支出优先级（现金不足时）：① 利息与到期还本 → ② 在建工程本期款（不足则顺延，08 §6.3）→ ③ 维护 → ④ 其他支出按比例削减。`cash` 不得为负。
- 无法偿债（到期本息 > cash 且借款触及硬上限）：本期利息资本化计入 debt，并进入「财政危机」事件（12 §4）；不产生负现金。
- 不变量：省、中央逐账户守恒断言；全部转移借贷两边相等。
### 5.2 「税率 → 收入/迁移」的因果
不作为无条件断言；在固定种子、固定其他变量的 fixture 中验证方向（§8.3）。

## 6. 校准（P6，`80_calibrate`）

| 参数 | 目标 | 方法 | 适用条件 |
|---|---|---|---|
| `A[c,s]` | 回合 0 的 `VA[c,s]` = 观测值 | 闭式反解 | 观测有效且 `> 0` 且 `L, K, Access, R > 0` → 反解；**观测有效且 = 0 → `A = 0`（零产出）**；观测缺失 → 部门中位数并标 `derived`（回应 R119） |
| `K` 初值 | 资本产出比 = 配置基准（游戏假设，标注） | 设定 | — |
| `A0(c)` | 回合 0 无干预净迁移 ≈ 0 | 不动点迭代 ≤ 50 次；未收敛 → 使用最后一次迭代值，报告残差并标记 | **明确为游戏假设**，不是现实观测 |
| 交通常数 | 全国客运量级（来源 P5 核实） | 缩放 | — |

- 校准时启用的系统：人口、交通、经济、财政；**关闭**：AI、政策、事件、项目（08 §9.1）。M2 正式包（scenario-cal）在加载时校验其 `contentHash` 与校准所用一致。
- 城市与城镇的经济口径：城市值 = 地级行政区整体；城镇统计值仅用于 M1 展示与县级透镜，不进入 M2 经济计算（避免重复计入）。
- 校准报告区分：观测控制量 / 估算量 / 拟合参数；保留残差统计，不强行抹平。

## 7. 宏观护栏（无干预 40 回合）
无非有限值、无负产出/负价格/负现金；全国实际 GDP 增速落在 content 配置区间（游戏假设，标注）；任一城市单回合 VA 变化 ≤ ±8%（无事件）；部门份额单回合变化 ≤ 2 个百分点；全部账户守恒断言通过。

## 8. 验收
1. （P6）回合 0 校准：省级 VA 合计与年鉴误差 ≤ 2%；城市级 P95 ≤ 5%（仅对观测有效单元）。
2. （P6）§7 全部通过。
3. （VS / P6）因果方向（固定种子 fixture）：Access 提升 → 可贸易部门 VA 相对对照上升；税率档位上调 → 财政收入上升（其余不变时）。
4. （VS 起）守恒：贸易逐行/逐列/逐部门（含期初库存、损耗、两轮售出、零成本/不可达、进口上限、0.5+0.5 舍入、上述非最优反例的 fixture）；财政逐省与中央。
5. 性能：经济 + 财政软目标 250 ms / 硬上限 320 ms（P6 整系统；VS 阶段先测满规模贸易矩阵单项）。

---

<!-- 文件：12-strategy-ai.md -->

# 12 策略层：政策、发展树、国家项目、事件、AI、计分

全部内容数据驱动，定义在 `packages/content/rules/*.yaml`，遵循 06 §5 的受限声明式效果语言（`target/stat/op/value/duration/special` 的完整约定作为 P3a-A0 的契约补全项）。

## 1. 政策（policies.yaml）

- 政策分 5 类：产业、人才、生态、财税、开放。每省有政策槽（初始每类 1 槽，发展树可增加至 2–3 槽）。
- 每项政策：前置条件、每回合成本、效果列表、**切换冷却 4 回合**、互斥组（例如「重化工优先」与「生态优先」互斥）。
- V1 内容量：约 30 项政策。

## 2. 发展树（techtree.yaml）

- 约 40 个节点，三个时代（2020s / 2030s / 2040s），时代内可自由选择，跨时代需前一时代 ≥ 60% 节点。
- 研发点 `RP = f(研发支出, 科教区格数, 高端人才)`，每回合累计。
- 节点效果：解锁建筑/线路模式/政策槽，或修改参数（如「高铁技术 II：高铁设计速度 +50 km/h」）。
- 发展树为**原创内容**，节点名称采用通用技术与制度概念，不使用任何既有游戏的科技树结构与命名。

## 3. 国家项目（projects.yaml）

- 中央每 4–6 回合（确定性随机）发布 1 个项目：类型（国家级枢纽、实验室、自贸区、大科学装置、生态示范区等）、参评条件、评标权重。
- 省份投标：投入资金承诺 + 满足条件得分 + 现有基础（指标）得分；最高分者获得项目（长期加成），平局按省索引决胜。
- AI 与玩家使用同一投标命令 `BidProject`。

## 4. 事件（events.yaml）

```yaml
- id: event.summer_flood
  trigger:
    season: [3]                       # 第 3 季度
    scope: tile_cluster               # 作用于满足条件的格簇
    where: { river_class_gte: 3, ecology_lte: 120 }
    chance_per_turn: 0.04             # 每个合格流域簇
  effects:
    - { target: city, stat: pop, op: add_pct, value: -0.5 }    # 人口事件只能作用于城市（09 §3.3）
    - { target: city, stat: sector_capacity.agri, op: add_pct, value: -10, duration: 2 }
  choices:
    - { id: relief, cost: { capital: 20 }, effects: [ { target: city, stat: satisfaction, op: add, value: 30 } ] }
    - { id: none, effects: [ { target: city, stat: satisfaction, op: add, value: -50 } ] }
```

- 触发条件为**受限谓词集合**（地形/河流/季节/阈值/概率/冷却），不允许任意脚本。
- V1 内容量：约 30 个事件（自然、经济周期、技术突破、社会民生）。
- **内容红线**：事件不得涉及真实政治人物、真实政治事件、民族宗教敏感议题、地区间对立；灾害类事件用中性表述，不指向真实历史灾难的具体伤亡。由内容审核清单（16 §7）检查。

## 5. AI 省级主政者（回应 R021、R039）

### 5.1 观察
- 所有 AI 在步骤 1 读取**同一份回合开始快照**（只读视图），互不看到彼此本回合决策。
- V1 中 AI 视为全知（不维护 AI 迷雾）。玩家迷雾默认 `data_only`（07 迷雾为可选项）。这是已知的公平性取舍，难度说明中向玩家明示。

### 5.2 候选生成与评分（有界、确定）
```
对每个 AI 省：
 1. 交通候选：从「需求缺口表」（高潜在需求 / 高广义成本的城市对，交通步骤输出）取前 20 对
    → 代理粗筛：直线距离 × 地形走廊系数（管线预计算的省际走廊成本表）× 单位成本 估算造价，
      按 Δ可达性×人口 / 估算造价 排序，取前 3 → 仅这 3 个运行 A*（每次 maxExpansions = 20,000）
 2. 功能区：本省城市评分前 5 格 × 可用类型
 3. 政策：每类槽位最优替换候选 1 个
 4. 预算：3 个预设方向
 5. 项目投标：0/中/高 三档
 6. 评分：utility = Σ w_k(personality) × proxyGain_k − costPenalty + 确定性小扰动（PRNG 流 AI）
 7. 贪心选择（预算约束），平局按动作稳定 ID
```
- **全局确定性扩展预算（回应 R127）**：每回合全部 AI 的 A* 扩展总数 ≤ `B_total`（初始 1,200,000，P4 实测后调整），按省索引**固定轮转**分配：每省一次最多 20,000 扩展，轮转直至预算用尽或候选用完；预算是计数而非墙钟，保证确定性。静态地形成本表只读缓存（世界包常量）。
- 估算（未实测）：1.2×10⁶ 扩展 × 6 邻居 ≈ 7.2×10⁶ 次邻居检查加堆操作；P4 独立跑 AI 代理基准（平均/P95/最坏扩展数与成功率），P7 在 5 种子、第 40–80 回合测完整 AI；超预算先降候选数与 `B_total`，接口不变。
- 报价过期：AI 在同一快照上生成的候选，执行时若 `QUOTE_STALE`（被先执行者改变了拓扑），跳过并计入「执行率」统计。
- 「性格」是**游戏参数**，由各省初始产业结构按固定映射表生成（`content/rules/ai_personality.yaml`，映射逐项列出），不是对现实地区的评价。

### 5.3 冲突解决（回应 R039 的先手优势）
- 资源竞争类（国家项目投标）：所有省的投标**同时收集**，在项目步骤（步骤 10）统一按评分结算，不受执行顺序影响。
- 互斥类（两个 AI 选择同一格/同一线路）：按「效用值降序，平局按 PRNG 抽签」决定执行顺序；后执行者若校验失败则跳过，不重新规划（本回合）。
- 其余命令按省索引顺序执行。**删除 V0.2 的「打乱独立命令顺序哈希不变」测试**（acceptedSeq、ID 分配、revision 天然依赖顺序，回应 R106）；改为测试「同一输入、同一顺序 → 哈希相同」以及对特定无 ID 分配命令的**语义投影**一致（如各省现金、政策槽）。

### 5.4 可调试性
`AIDecisionLog` 仅 dev 构建开启，保留最近 8 回合。

## 6. 计分与胜利
- 综合发展指数（进步幅度为主）；终局于 2050Q4（第 119 回合结算后）。
- 里程碑命名原创。

## 7. 内容数量（回应 R041）
垂直切片（VS）**不包含**政策、发展树、事件、国家项目、AI（回应 R113）；这些系统与内容在 P7 实现并扩充到：政策 ≥ 30、节点 ≥ 40、事件 ≥ 30、项目类型 ≥ 6。

## 8. 验收（P7，回应 R039）
0. **预注册**（回应 R127）：种子列表、样本起始省、统计方法、允许的例外条件在 P7 测试开始前写入测试文件并评审，之后不得按结果修改。
1. 31 省全 AI 完整一局（120 回合）× 5 个固定种子：无异常；每回合预算达标（桌面参考设备；iPad 见 15 §3）。
2. 行为（可执行条件下）：对「存在 ≥ 1 个可建且预算允许的交通候选」的 AI 省，完整一局内至少修建 1 条线路的比例 ≥ 90%；破产（触及硬上限）AI 省 ≤ 3（每局）。不满足的省需在日志中给出原因。
3. 性格差异：5 种子 × 全部省的统计中，生态型 AI 的终局生态指标排名中位数优于发展型（统计检验方法在测试中写明）。
4. 平衡：玩家「全默认不操作」在 10 个（种子 × 起始省）组合中，终局排名中位数位于后半；「脚本化简单合理策略」中位数进入前 1/3。允许的失败情形（如起始省为极小省份时的排名偏差）在测试中列出。
5. 事件与政策内容通过内容审核清单。

---

<!-- 文件：13-visual-ui.md -->

# 13 视觉设计与 UI/UX

## 1. 美术方向：「新舆图」

一句话：**中国传统舆图与青绿山水的色彩与笔意，以手绘感六边形地图呈现（A 档）；可选 3D 倾斜近景（B 档）。** 原创风格，不复刻任何既有游戏（含 USACiv、《文明》系列）的界面、图标、旗标样式或美术。

### 1.1 缩放层次的视觉目标（A 档）

| 层次 | 视野宽度 | 画面目标（可截图检查） |
|---|---|---|
| 近景 | 60–300 km | 每格地形材质清晰，精灵（林木、山体、农田纹样）丰富；城镇旗标与县名可见；河流、线路清楚 |
| 中景 | 300–1,500 km | 城市群与地形关系清楚；地级市旗标；透镜最可读 |
| 远景 / 全国 | 1,500–6,000 km | 全国轮廓、山系水系由晕渲与底图纹理表达；省名与主要城市；精灵退场 |
| 战略视图（可选，P8） | 任意 | 宣纸舆图风格切换 |

### 1.2 色彩 tokens（初稿，P2 视觉初审调整，P8 定稿）

| Token | 值 | 用途 |
|---|---|---|
| `--c-paper` | `#EFE6D2` | 宣纸底（战略视图、面板背景） |
| `--c-ink` | `#1F2326` | 墨色（主文字、线条） |
| `--c-cinnabar` | `#B23A2B` | 朱砂（强调、城市印章、警示） |
| `--c-azurite` | `#2F6E8E` | 石青（水体、信息） |
| `--c-malachite` | `#4E8B6A` | 石绿（植被、正向指标） |
| `--c-ochre` | `#B8863B` | 赭石（土地、经济） |
| `--c-gold` | `#C9A45C` | 金（高亮、成就，少量使用） |
| `--c-panel` | `rgba(24,28,30,0.86)` | 游戏内深色面板 |

- 地形材质调色遵循同一色板的低饱和版本；数据叠加层使用经色盲安全检查的顺序/发散调色板（以 `--c-malachite`→`--c-ochre`→`--c-cinnabar` 为主轴，另提供色盲模式）。
- 光照：暖色主光 + 冷色环境光，整体偏「午后」；色调映射 ACES（或 AgX，P7 对比后定），调色 LUT 统一风格。

### 1.3 字体
- 标题与地名：思源宋体（Source Han Serif）；正文与数据：思源黑体（Source Han Sans）；数字：等宽表格数字（`font-variant-numeric: tabular-nums`）。
- 均为 SIL OFL 1.1，可嵌入与商用（字体许可原文存档到 `docs/data-sources/fonts/`）。
- Web 字体子集化：UI 常用字 + 动态加载补全，首屏字体 ≤ 1.5 MB。

### 1.4 美术资产规范

**A 档（V1）——2D 精灵与材质：**

| 类别 | 规格 | 数量（V1） |
|---|---|---|
| 地形材质（平铺手绘纹理） | 512²，无缝 | 约 12 类 |
| 植被/山体/沙丘精灵 | 128² 单元，图集 2048² | 每类 4–8 变体，合计约 60 |
| 设施图标 | 64² / 128²，矢量源 | 约 20 |
| 旗标与 UI 图标 | 矢量（SVG 源）→ 图集 | 约 40 |

**B 档（可选）——3D 模型**：沿用 V0.1 面数与贴图规范（树木 300/60、建筑模块 800/150、地标 5,000/800 等），并使用 impostor（07 §9）。

- 格式：glTF 2.0 + meshopt + KTX2；朝向 +Y 向上，单位 km（导入时统一缩放），原点在底部中心。
- 来源：原创制作或明确可商用许可（CC0 等）资产，逐个登记许可于 `assets-src/LICENSES.csv`；**禁止**使用来源不明的模型。
- AI 生成图像仅可用于概念参考与 UI 插画草图，最终资产需人工审核其版权与风格一致性。

## 2. UI 架构

### 2.1 布局（桌面 1920×1080 基准，最小 1280×720；iPad 横屏布局见 §2.3。下图为 M2 布局，M1 不含回合、财政等 M2 元素）

```
┌──────────────────────────────────────────────────────────────┐
│ 顶栏：省份徽记 | 回合/年份季度 | 财政 | 研发 | 满意度 | 菜单   │
├──────┬───────────────────────────────────────────┬───────────┤
│ 左侧 │                                           │ 右侧情境面板│
│ 工具 │                地图（WebGL）               │（选中格/城市│
│ 栏   │                                           │ /线路详情） │
│      │                                           │           │
├──────┴──────────────┬────────────────────────────┴───────────┤
│ 审图号（左下角固定） │ 叠加层切换条            │ 小地图 | 结束回合 │
└─────────────────────┴─────────────────────────────────────────┘
```

- 审图号徽标 `MapApprovalBadge` 固定在**地图页面左下角**，任何面板不得遮挡（布局测试检查其可见性）。

### 2.2 核心界面清单

- **M1**：主界面（地图 + 顶栏全国指标）、透镜坞、省份详情、城市详情、搜索、小地图（含完整国土与南海诸岛附图）、数据来源与署名页、图鉴（Almanac：指标说明）、分享（URL 状态）、设置（画质、语言、色盲模式、减少动效）。
- **M2 新增**：新游戏（选省/沙盒、难度）、线路建设工具、功能区工具、政策、发展树、财政预算、国家项目、报告与图表、事件弹窗、通知中心、存读档、新手引导。

### 2.3 桌面与 iPad 交互（D-12 用户已确认，DEC-001）

**原则**：两端核心功能一致；任何依赖悬停或右键的关键功能都必须有触控等效操作；布局可不同。

| 功能 | 桌面（键鼠） | iPad（触控） |
|---|---|---|
| 平移 / 缩放 | 拖拽、滚轮（光标锚点）、键盘 | 单指拖拽（惯性）、双指捏合（中点锚点）、双击放大、双指轻点缩小 |
| 查看格/城市信息 | 悬停提示 + 单击选中 | 单击选中 → 底部信息卡；**长按 400 ms** = 悬停提示的等效（显示同一提示内容） |
| 上下文菜单 | 右键 | 长按后的操作菜单，或选中后底部操作栏 |
| 城市 / 省详情 | 右侧面板 | 右侧抽屉（横屏），可滑动关闭 |
| 透镜切换 | 底部透镜坞 + 快捷键 | 底部透镜坞（可横向滚动） |
| 线路规划 | 点选起点 → 点选途经点 → 拖拽调整 → 确认 | 点选起点 → 依次点选途经点（每个点显示可删除的标记）→ 底部「撤销上一个 / 确认 / 取消」按钮；**不依赖拖拽精度** |
| 功能区设置 | 选格 + 右侧面板 | 选格 + 底部操作栏 |
| 政策、预算、发展树 | 全屏面板，滑块与按钮 | 同一面板的触控版：滑块加 ± 步进按钮，目标 ≥ 44 pt |
| 结束回合 | 按钮 + Enter（二次确认） | 按钮（二次确认） |
| 存档 / 读档 / 设置 | 菜单 | 同一菜单（触控目标 ≥ 44 pt） |
| 搜索 | 输入框 + `/` 快捷键 | 输入框（软键盘弹出时地图不重排） |

- **布局**：横屏为正式验收方向；使用 `env(safe-area-inset-*)` 适配安全区；面板在窄屏（< 1180 CSS px 宽）改为抽屉式；所有面板内容可滚动，不出现被裁切的按钮；字号随 UI 缩放（90%–150%）。
- **触控目标**：≥ 44 × 44 pt；地图实体命中半径 ≥ 22 pt（07 §5）。
- **手势冲突**：禁用浏览器默认双指缩放页面（`touch-action` 与视口设置），地图手势由 InputRouter 统一处理；系统边缘手势区域内不放置关键控件。
- **外接键盘/触控板**（iPad）：可选支持，不作为验收项。
- **低内存与后台**：iPad Safari 切到后台或内存告警时，先自动存档（M2），恢复时若上下文丢失按 07 §6 重建。

### 2.4 状态与数据流
- UI 只读 `ViewModelStore`（Zustand），通过 selector 订阅最小数据切片；UI 动作 → `SimClient.submit(command)`。
- UI 本地状态（面板开关、选中对象、工具模式）存于独立的 `uiStore`，不进入存档。
- 大表格（如 337 城市排行）使用虚拟滚动。

### 2.5 交互规范
- 所有破坏性或高成本操作（开工、发债、切换政策）有确认步骤，显示成本与预计影响。
- 悬停提示（tooltip）延迟 300 ms（iPad 为长按 400 ms）；所有数值提示可展开「构成明细」与「数据来源」；估算值带「估」标记，缺失显示「无数据」（不显示 0）。
- 键盘（桌面）：全部核心操作有快捷键，可重绑定；`Enter` 结束回合需二次确认（可在设置中关闭）。
- 动效：面板 150–200 ms 缓动；地图相机飞行 600–1,000 ms；设置中可「减少动效」。

## 3. 本地化

- 文本键：`ui.panel.city.title` 形式，源文件 `packages/content/locales/zh-CN.yaml`；运行时按语言加载 JSON。
- 地名：以民政部标准名称为准；英文版地名用汉语拼音（按国家标准拼写规则），在数据中单独存储，不运行时转换。
- 数字与单位格式化走统一 `format.ts`（万/亿 中文计数；英文用 million/billion）。

## 4. 无障碍（V1 基础项）
- UI 文本对比度 ≥ WCAG AA（4.5:1）。
- 色盲模式：叠加层改用色盲安全调色板 + 图案纹理区分。
- UI 缩放 90%–150%。

## 5. 音频（推迟到 P8；V1 前仅基础 UI 音效）
- 背景音乐：原创或明确授权的民乐/现代融合曲目 3–5 首；环境音（风、水、城市）随缩放层次混合；UI 音效。
- Web Audio API，音量分组（音乐、环境、音效），首次交互后才启动（浏览器自动播放策略）。

## 6. 视觉验收方法（P2 / P8）

1. **参考机位集**：12 个固定机位（桌面与 iPad 各截一套）（如「四川盆地 近景」「长三角 中景」「青藏高原 远景」「全国」「南海诸岛附图」「珠三角城市旗标密集区」）。每个机位由用户确认一张「目标效果参考」（原创概念图或经批准的方向说明）。
2. 视觉相关 PR 产出同机位截图，Claude 审查（构图、色彩、可读性），用户确认。
3. 自动视觉回归（16 §5）保护已确认画面。
4. 可读性：每机位省名/城市名无重叠、无裁切；透镜图例可读；**合规要素在每个机位完整可见**。

---

<!-- 文件：14-interfaces.md -->

# 14 模块接口契约

本文件中的 TypeScript 定义是接口契约，编码时原样落入 `packages/core-types`（或标注的包）。**本文件是唯一事实源**；修改需同步更新契约测试（回应 R017、R024）。

## 1. 基础类型（core-types）

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };

// ID 域（06 §3）
export type TileId = Brand<number, 'TileId'>;
export type ChunkId = Brand<number, 'ChunkId'>;
export type AdminIdx = Brand<number, 'AdminIdx'>;
export type ProvinceId = Brand<number, 'ProvinceId'>;
export type PrefectureIdx = Brand<number, 'PrefectureIdx'>;
export type CountyIdx = Brand<number, 'CountyIdx'>;
export type SettlementId = Brand<number, 'SettlementId'>;
export type CityId = Brand<number, 'CityId'>;
export type TownId = Brand<number, 'TownId'>;
export type NodeId = Brand<number, 'NodeId'>;
export type EdgeId = Brand<number, 'EdgeId'>;
export type LineId = Brand<number, 'LineId'>;
export type ProjectId = Brand<number, 'ProjectId'>;
export type OrderId = Brand<number, 'OrderId'>;
export type AgreementId = Brand<number, 'AgreementId'>;
export type EventInstanceId = Brand<number, 'EventInstanceId'>;
export type ContentKey = string;                          // 'building.industrial_park'
export type ContentIdx = Brand<number, 'ContentIdx'>;
export type CommandId = string;                           // UUIDv4
export type Revision = Brand<number, 'Revision'>;         // 状态修订号，单调递增
export type Turn = Brand<number, 'Turn'>;                 // 0 = 2021Q1

export type Money = Brand<number, 'Money'>;               // 万元，安全整数
export type Fixed4 = Brand<number, 'Fixed4'>;             // ×10,000 定点

// 纯值转换（core-types/time.ts；允许：无业务规则）
export function turnToYearQuarter(t: Turn): { year: number; quarter: 1 | 2 | 3 | 4 };   // 2021 + floor(t/4), (t mod 4)+1

export enum TerrainClass { Ocean, Lake, Glacier, HighMountain, Mountain, Plateau, Hills, Desert, Wetland, Grassland, Plain }
export enum Domain { Background, ChinaPlayable, ChinaNonPlayable, Sea }
export enum TransportMode { Motorway = 1, Road, Rail, HighSpeedRail, Waterway, Sea, Air }
export enum EdgeKind { Link = 1, Transfer, Access, Ferry, SeaLane, AirRoute }
export enum Zone { None, Residential, Industrial, Science, Ecology, Agriculture }
export enum Sector { Agri, Energy, Mfg, Cons, Svc, Tech }

export interface GridCore {
  aoiId: string; aoiSha256: string; chunkSize: 32; cols: number; rows: number;
  layout: 'odd-r'; orientation: 'pointy'; originX: number; originY: number; proj: string; radiusM: number;
}
export interface GridSpec extends GridCore { gridHash: string }          // gridHash = sha256(CCJ-1(GridCore))
export interface TileWindow { col0: number; row0: number; cols: number; rows: number }
/** 全局 TileId → 窗口内下标；窗口外返回 -1 */
export type TileIndexFn = (t: TileId) => number;
export type ObsKind = 'observed' | 'estimated' | 'derived' | 'simulated' | 'fixture-default' | 'unknown';

export type Waypoint = { kind: 'node'; id: NodeId } | { kind: 'tile'; id: TileId };
export type GeomRef = Brand<number, 'GeomRef'>;           // render/lines 中的几何索引
```

## 2. 世界数据（world-format，回应 R103）

```ts
export interface ReleaseDescriptor {                 // 17 §5；dev 环境用本地等价配置
  descriptorVersion: 1; distribution: 'internal' | 'public';
  appBuildHash: string; contentHash: string; styleHash: string;
  chain: { layer: ManifestCore['layer']; identity: string; baseUrl: string }[];   // 叶子在最后
  approval: { approvalId: string; approvalNumberText: string; validFrom: string; validTo: string | null; scope: string[] } | null;
  revoked: boolean;
}

export interface WorldLoader {
  /** 依 descriptor.chain 逐层加载并校验（06 §1.4）；任一失败 → reject(WorldChainError) */
  loadChain(d: ReleaseDescriptor, onProgress: (loaded: number, total: number) => void): Promise<WorldData>;
  stream(layer: ManifestCore['layer'], path: string, signal?: AbortSignal): Promise<CcbFile>;
}
export type WorldChainErrorCode =
  | 'IDENTITY_MISMATCH' | 'PARENT_MISSING' | 'PARENT_MISMATCH' | 'GRID_MISMATCH' | 'WINDOW_MISMATCH'
  | 'SCENARIO_MISMATCH' | 'DISTRIBUTION_VIOLATION' | 'CYCLE' | 'FILE_MISSING' | 'FILE_HASH' | 'CCB_INVALID' | 'COMPLIANCE_INVALID';

export interface Manifest { identity: string; core: ManifestCore; buildInfo: Record<string, string> }
export interface ManifestCore {                       // 06 §1.3，字段全部必选，不允许额外字段
  formatVersion: number; layer: 'base-geo' | 'scenario-raw' | 'scenario-cal'; scenarioId: string | null;
  gridCore: GridCore; gridHash: string; window: TileWindow; parentIdentity: string | null; contentHash: string | null;
  distribution: 'internal' | 'public';
  files: { path: string; bytes: number; sha256: string; stage: 'boot' | 'stream' | 'lazy'; required: boolean }[];
  complianceFileSha256: string | null; licenseSetHash: string; toolRegistryHash: string;
}

/** 不可变：加载后冻结；主线程与 Worker 各自从 URL 加载，不跨线程转移 */
export interface WorldData {
  chain: Manifest[];                               // [base-geo, scenario-raw?, scenario-cal?]
  grid: GridSpec; window: TileWindow; tileIndex: TileIndexFn;
  tilesGeo: CcbSections;                           // 字段由 fields.json 生成类型
  xwalkGeo: { tileOffsets: Uint32Array; countyIdx: Uint16Array; landAreaM2: Uint32Array };
  admin: AdminTable; settlements: SettlementTable; islands: IslandTable; compliance: ComplianceData;
  scenario?: { xwalkPop: { popWeight: Float64Array; popInt: Int32Array }; cities: CityStatsTable; towns: TownStatsTable;
               economy: EconomyTable; network: NetworkData; facilities: FacilityTable; lineage: LineageData };
  calibration?: unknown;                           // sim 按 schema 解析
}
export type CcbSections = Readonly<Record<string, ArrayBufferView | readonly string[] | unknown>>;
export interface CcbFile { sections: CcbSections }

// —— M1 必需的表（字段名、单位与哨兵由 fields.json 生成，此处为冻结的最小字段集）——
export interface AdminTable {
  count: number; code: Uint32Array; level: Uint8Array /*1 省 2 地 3 县*/; parentIdx: Uint16Array /*0xFFFF 无*/;
  name: readonly string[]; namePinyin: readonly string[]; nameShort: readonly string[] /*仅省级，否则 ''*/;
  provinceId: Uint16Array; prefectureIdx: Uint16Array; countyIdx: Uint16Array;          // 各自专用序号，非本级为 0xFFFF
  landAreaM2: Float64Array; officialAreaKm2: Float64Array /*NaN 不允许；缺失用 validOfficialArea=0*/; validOfficialArea: Uint8Array;
  capitalSettlement: Uint16Array;
}
export interface SettlementTable {
  count: number; code: Uint32Array; kind: Uint8Array /*1 直辖市 2 省会 3 地级 4 县级市 5 县/区/旗*/;
  adminIdx: Uint16Array; anchorX: Int32Array; anchorY: Int32Array; anchorTile: Uint32Array; isPrimaryOnTile: Uint8Array;
  cityId: Uint16Array; townId: Uint16Array; name: readonly string[]; namePinyin: readonly string[];
}
export interface IslandTable { count: number; kind: Uint8Array /*1 点 2 面*/; x: Int32Array; y: Int32Array; geomRef: Uint32Array; name: readonly string[] }
export interface ComplianceData {
  fileSha256: string; requiredFeaturesVersion: number;
  layers: { id: string; kind: 'national-border' | 'provincial-border' | 'coastline' | 'island' | 'scs-line' | 'inset'; geomRefs: Uint32Array; style: string }[];
  insetSpec: { id: string; boundsKm: [number, number, number, number]; screenAnchor: 'bottom-right' } ;
}
export interface CityStatsTable { count: number; settlementId: Uint16Array; popTotal: Int32Array; popUrban: Int32Array; gdpWan: Float64Array; validBits: Uint32Array; lineageRef: Uint32Array }
export type TownStatsTable = CityStatsTable;
export interface EconomyTable { cities: number; sectors: 6; vaWan: Float64Array /*cities×6*/; employment: Float64Array; valid: Uint8Array; lineageRef: Uint32Array }
export interface LineageData { sources: { id: string; title: string; version: string; license: string; url: string }[];
  fieldDefault(field: string): { kind: ObsKind; sourceIds: string[]; referencePeriod: string; method: string };
  override(field: string, entityKind: string, id: number): { kind: ObsKind; sourceIds: string[]; referencePeriod: string; method: string; note?: string } | null }
// NetworkData、FacilityTable：字段见 10 §2.4（由 fields.json 生成）

export interface AssetSource {                    // renderer 读取资源的唯一入口
  boot(path: string): ArrayBufferView;            // 已加载的 boot 资源
  stream(layer: ManifestCore['layer'], path: string, priority: number, signal?: AbortSignal): Promise<ArrayBufferView>;
  texture(path: string): Promise<{ width: number; height: number; layers: number; format: string; data: ArrayBufferView | 'ktx2' }>;
}
```

## 3. M1 数据地图接口（almanac）

```ts
export interface LensDef {
  id: string; group: 'people' | 'prosperity' | 'land' | 'climate' | 'transport' | 'admin' | 'quality';
  name: Record<'zh' | 'en', string>; unit: string;
  source: { field: string; aggregation: 'tile' | 'county' | 'prefecture' | 'province' };
  scale: 'linear' | 'log' | 'quantile' | 'categorical';
  palette: PaletteId; domain: 'auto-p2-p98' | [number, number];
  missing: 'hatch';                         // 缺失值显示斜线纹理
}
export interface Almanac {
  lenses(): readonly LensDef[];
  lensData(id: string): OverlayData;                             // 每格值 + 有效位
  provinceSummary(p: ProvinceId): SummaryWithLineage;
  citySummary(c: CityId): SummaryWithLineage;
  search(q: string, limit: number): SearchHit[];                  // 地名（含拼音）
  urlState: { encode(s: ViewState): string; decode(h: string): ViewState | null };
}
export interface SummaryWithLineage { rows: { key: string; value: number | null; unit: string; kind: ObsKind; sourceIds: string[]; referencePeriod: string }[] }
export type PaletteId = 'seq-green-ochre-red' | 'seq-blue' | 'div-azurite-cinnabar' | 'cat-admin' | 'cat-terrain' | 'cb-safe-seq' | 'cb-safe-div';
export interface LegendSpec { title: string; unit: string; stops: { value: number; color: string; label: string }[]; missingLabel: string; source: string }
export interface SearchHit { kind: 'province' | 'prefecture' | 'county' | 'city' | 'town'; id: number; name: string; pinyin: string; parentName: string; anchorTile: TileId }
export interface ViewState { v: 1; centerX: number; centerY: number; widthKm: number; lens: string | null; selected: { kind: string; id: number } | null }   // URL 编码：base64url(CCJ-1)
```

## 4. 渲染接口（renderer 只依赖这些）

### 4.1 RenderView 与 Renderer
```ts
export interface RenderView {
  grid: GridSpec;
  staticTiles: CcbSections;                                // 只读地理列
  overlay(kind: OverlayKind): OverlayData;
  cities(): readonly CityVisual[];
  towns(minZoomKm: number): readonly TownVisual[];
  network(): NetworkVisual | null;                         // M1 显示现状网络；M2 含状态与流量
  selection(): SelectionState;
  subscribe(listener: (c: RenderChange) => void): () => void;
}
export type OverlayKind = string;                           // = LensDef.id 或 M2 专用（'transport.flow' 等）
export interface OverlayData { kind: OverlayKind; values: Float32Array | Uint8Array; valid: Uint8Array; palette: PaletteId; domain: [number, number]; scale: LensDef['scale']; legend: LegendSpec }
export interface CityVisual { id: CityId; anchorTile: TileId; tier: 0|1|2|3|4|5; provinceColor: string; population: number | null; label: string; style: ArchStyle; builtTiles: Uint32Array }
export interface TownVisual { id: TownId; anchorTile: TileId; label: string; population: number | null; attachedToTileOwner: boolean }
export interface NetworkVisual { edges: { id: EdgeId; mode: TransportMode; status: 'planned' | 'building' | 'active'; geom: GeomRef; utilization: number | null; flow: number | null }[] }
export interface SelectionState { hoverTile: TileId | null; selected: { kind: 'tile' | 'city' | 'town' | 'edge'; id: number } | null; highlightTiles: Uint32Array }
export type RenderChange =
  | { kind: 'overlay'; overlay: OverlayKind; changedTiles: Uint32Array | 'all' }
  | { kind: 'cities'; changed: CityId[] } | { kind: 'network'; changed: EdgeId[] } | { kind: 'selection' };

export interface RenderOptions { quality: 'low' | 'medium' | 'high'; tier: 'A' | 'B'; reducedMotion: boolean; deterministicTime?: number }
export interface RenderStats { frameMs: number; drawCalls: number; triangles: number; instances: number; textureBytes: number; bufferBytes: number; renderTargetBytes: number; streamQueue: number }
export interface PickResult { tile: TileId | null; entity: { kind: 'city' | 'town' | 'edge'; id: number } | null }

export interface Renderer {
  mount(canvas: HTMLCanvasElement, view: RenderView, assets: AssetSource, opts: RenderOptions): Promise<void>;  // 合规资源校验失败 → reject(ComplianceLoadError)
  setOverlay(kind: OverlayKind | null): void;
  setQuality(q: RenderOptions['quality']): void;
  flyTo(target: { tile?: TileId; city?: CityId; bboxKm?: [number, number, number, number] }, ms?: number): void;
  pick(cssX: number, cssY: number): PickResult;
  previewRoute(tiles: Uint32Array | null): void;
  renderToImage(opts: { width: number; height: number }): Promise<ImageBitmap>;   // 仅地图画面（含合规 Pass），供应用级导出合成
  stats(): RenderStats;                                                          // 整帧累加
  dispose(): void;
}
```

### 4.2 应用级截图导出（回应 R019）
`apps/web/shell/exportImage()`：`renderer.renderToImage()` + 合成（审图号、水印（internal 构建）、南海诸岛附图（若当前视野未完整包含）、数据来源署名）→ PNG。**不存在可以去掉上述元素的参数**；E2E 对导出图像做 OCR/模板检测验证。

## 5. 模拟 API（sim，M2）

```ts
export interface NewGameOptions { seed: number; mode: 'contest' | 'sandbox'; playerProvince: ProvinceId | null; difficulty: 'easy' | 'normal' | 'hard' }
export type Controller =
  | { kind: 'player'; scope: 'province'; province: ProvinceId }
  | { kind: 'player'; scope: 'nation' }
  | { kind: 'ai'; province: ProvinceId };

export interface Sim {
  createGame(world: WorldData, content: Content, opts: NewGameOptions): GameState;
  loadGame(world: WorldData, content: Content, save: SaveData): GameState;          // 校验 world identity、contentHash、simVersion
  validate(s: GameState, c: Command, by: Controller): ValidationResult;
  submit(s: GameState, c: Command, by: Controller): SubmitResult;                   // 原子执行，08 §6.2
  endTurn(s: GameState, observer?: StepObserver): TurnResult;
  query<Q extends Query>(s: GameState, q: Q): QueryResultOf<Q>;
  snapshot(s: GameState): StateSnapshot;                                          // 全量视图（用于初始化与 resync）
  serialize(s: GameState): SaveData;
  stateHash(s: GameState): string;                                                // 16 位小写 hex
}

export interface StepObserver { onStepStart(step: TurnStep): void; onStepEnd(step: TurnStep): void }
export type TurnStep = 'close' | 'ai' | 'works' | 'transport' | 'economy' | 'fiscal' | 'population' | 'city' | 'research' | 'events' | 'projects' | 'scoring' | 'finalize';

export type ValidationResult = { ok: true; cost: Money; turns: number } | { ok: false; reason: RejectReason; detail?: Record<string, string | number> };
export type SubmitResult =
  | { accepted: true; commandId: CommandId; acceptedSeq: number; revision: Revision; diff: StateDiff }
  | { accepted: false; commandId: CommandId; reason: RejectReason; detail?: Record<string, string | number> }
  | { accepted: 'duplicate'; commandId: CommandId; acceptedSeq: number; currentRevision: Revision };   // 不含差量（回应 R108）

export type RejectReason =
  | 'INSUFFICIENT_FUNDS' | 'TERRAIN_FORBIDDEN' | 'NOT_AUTHORIZED' | 'TECH_REQUIRED' | 'SLOT_UNAVAILABLE'
  | 'COOLDOWN' | 'INVALID_TARGET' | 'GAME_OVER' | 'DEBT_LIMIT' | 'QUOTE_STALE' | 'ROUTE_TOO_COMPLEX' | 'BUSY'
  | 'COMMAND_ID_CONFLICT' | 'STALE_TURN';

export interface TurnResult { turn: Turn; revision: Revision; diff: StateDiff; events: GameEvent[]; notifications: Notification[]; stateHash: string; gameOver: boolean }
```

### 5.1 命令
```ts
interface CommandBase { commandId: CommandId; clientSeq: number; baseTurn: Turn; actingProvince: ProvinceId }
export type Command =
  | CommandBase & { type: 'BuildLink'; mode: TransportMode; waypoints: Waypoint[]; expectedCost: Money; expectedPeriods: number; quoteDigest: string }
  | CommandBase & { type: 'UpgradeLink'; edge: EdgeId; upgrade: ContentKey }
  | CommandBase & { type: 'CancelOrder'; order: OrderId }
  | CommandBase & { type: 'SetZone'; tile: TileId; zone: Zone }
  | CommandBase & { type: 'Construct'; tile: TileId; building: ContentKey }
  | CommandBase & { type: 'SetPolicy'; slot: number; policy: ContentKey | null }
  | CommandBase & { type: 'SetBudget'; taxBand: 1 | 2 | 3 | 4 | 5; spending: Record<'infra' | 'edu' | 'health' | 'rnd' | 'eco', Fixed4>; borrow: Money }
  | CommandBase & { type: 'Research'; tech: ContentKey }
  | CommandBase & { type: 'BidProject'; project: ProjectId; commitment: Money }
  | CommandBase & { type: 'ProposeAgreement'; to: ProvinceId; agreement: ContentKey; terms: Record<string, number> }
  | CommandBase & { type: 'RespondAgreement'; agreement: AgreementId; accept: boolean }
  | CommandBase & { type: 'ChooseEventOption'; event: EventInstanceId; option: string };
```
- `spending` 五项之和必须 = 10,000，否则 `INVALID_TARGET`。
- `BuildLink` 的校验见 08 §6.5（以当前权威状态重算，摘要不符 → `QUOTE_STALE`）。
- `RejectReason` 增加：`'COMMAND_ID_CONFLICT' | 'STALE_TURN'`。

### 5.2 查询
```ts
export type Query =
  | { type: 'RoutePreview'; mode: TransportMode; waypoints: Waypoint[]; actingProvince: ProvinceId }
  | { type: 'BuildCost'; tile: TileId; building: ContentKey; actingProvince: ProvinceId }
  | { type: 'CityReport'; city: CityId } | { type: 'ProvinceReport'; province: ProvinceId }
  | { type: 'Ranking'; metric: string } | { type: 'History'; series: string[]; province?: ProvinceId; city?: CityId }
  | { type: 'Explain'; target: string };

export interface RoutePreviewResult { quoteDigest: string; tiles: Uint32Array; lengthKm: number; cost: Money; periods: number; topologyRevision: number; paramsRevision: number; tunnelPct: number; bridgeCount: number; violations: RejectReason[] }
// 其余 QueryResultOf<Q> 的结构在 sim/query/types.ts 中定义，并在本文件附录 A 维护列表（P3a-A0 补全）
```

### 5.3 差量
```ts
export interface StateDiff {
  baseRevision: Revision; revision: Revision;
  tiles: ({ column: string; mode: 'sparse'; ids: Uint32Array; values: ArrayBufferView } | { column: string; mode: 'full'; values: ArrayBufferView })[];
  entities: { table: string; upserts: { ids: Uint32Array; columns: Record<string, ArrayBufferView> }; deletes: Uint32Array }[];
  globals: Record<string, number | string>;
}
export interface StateSnapshot { revision: Revision; turn: Turn; /* 全部 ViewModel 所需列与表（只读拷贝）*/ tables: Record<string, Record<string, ArrayBufferView>>; globals: Record<string, number | string> }
```

## 6. Worker 协议（回应 R017、R108）

### 6.1 消息
```ts
const PROTOCOL_VERSION = 2;
interface Envelope { protocol: 2; workerEpoch: number; reqId: number; gameId: string | null }   // workerEpoch：每次（重）启动 Worker 由宿主递增
type Req = Envelope & (
  | { op: 'init'; descriptor: ReleaseDescriptor; contentUrl: string }
  | { op: 'newGame'; opts: NewGameOptions }                // → { gameId, snapshot }（新 gameId 由宿主生成并在请求中给出：gameId 字段即新值）
  | { op: 'load'; save: ArrayBuffer }                      // 转移给 Worker → { gameId, snapshot }
  | { op: 'validate'; cmd: Command; by: Controller }
  | { op: 'submit'; cmd: Command; by: Controller }         // → SubmitResult（差量只在此处与 endTurn 响应中出现）
  | { op: 'endTurn' }                                      // → TurnResult；期间 push progress
  | { op: 'query'; q: Query }
  | { op: 'snapshot' }                                     // 重同步
  | { op: 'save' }                                         // → ArrayBuffer（新分配副本，转移给主线程）
  | { op: 'cancel'; targetReqId: number }                  // 仅 query：结果被丢弃（不中断计算）
);
type Res = Envelope & (
  | { ok: true; result: unknown }
  | { ok: false; error: { code: WorkerErrorCode; message: string } }
  | { push: 'progress'; step: TurnStep; index: number; total: number }
);
type WorkerErrorCode = 'BUSY' | 'NO_GAME' | 'GAME_MISMATCH' | 'PROTOCOL_MISMATCH' | 'CANCELLED' | 'TIMEOUT' | 'INTERNAL' | 'LOAD_INVALID';
```

### 6.2 规则
- **所有响应与 progress 都带 `workerEpoch`、`gameId`、`reqId`**；SimClient 丢弃 epoch 或 gameId 不匹配、或 reqId 未登记的响应。
- **差量唯一路径**：`submit` 与 `endTurn` 的成功响应；SimClient 仅当 `gameId` 匹配且 `diff.baseRevision == 本地 revision` 时应用，否则发 `snapshot`。`duplicate` 响应不含差量，若 `currentRevision > 本地` 则发 `snapshot`。
- **宿主侧闸门（回应 R108 与审查 [E3]）**：Worker 同步执行 `endTurn` 时无法处理新消息，因此：SimClient 在发出 `endTurn` 后立即进入锁定态，**不再发送 `submit`**（UI 禁用相关操作）；Worker 内部仍维护逻辑队列，若收到 `submit` 且其 `cmd.baseTurn` 已过期则返回 `STALE_TURN`。
- 所有权：Worker 权威状态永不转移；发给主线程的 TypedArray 为新分配拷贝并以 Transferable 发送；世界数据两侧各自加载；`load` 的 ArrayBuffer 转移后主线程不再使用。
- **自动存档点**：每次 `endTurn` 开始前，Worker 先生成自动存档（含回放日志与幂等账）并发给主线程写入 IndexedDB（iPad 后台/内存告警时同样触发，13 §2.3）。
- 超时：`query` 2 s（结果丢弃）；`endTurn` 桌面 30 s、iPad 60 s（P1a 后修订）→ 宿主终止 Worker，`workerEpoch + 1`，重启 → `init` → `load`（最近自动存档，即本回合 endTurn 前的状态）→ `snapshot`；**用户可见回滚范围**：只丢失本次未完成的回合结算，本回合已接受的玩家命令全部保留（它们在自动存档中）。提示用户并提供导出回放。
- 提交成功但响应丢失（例如 Worker 崩溃）：恢复后客户端以相同 `commandId` 重试，按幂等账得到 `duplicate`（若该命令在存档中）或重新执行（若不在）。

### 6.3 输入抽象（DEC-001 D-12）
```ts
export type PointerIntent =
  | { kind: 'pan'; dxCss: number; dyCss: number } | { kind: 'zoom'; factor: number; anchorCssX: number; anchorCssY: number }
  | { kind: 'select'; cssX: number; cssY: number } | { kind: 'inspect'; cssX: number; cssY: number }   // inspect = 悬停（桌面）或长按（iPad）
  | { kind: 'context'; cssX: number; cssY: number }                                                     // 右键（桌面）或长按菜单（iPad）
  | { kind: 'cancel' };
export interface InputRouter { onIntent(listener: (i: PointerIntent) => void): () => void; setMode(m: 'map' | 'route-plan' | 'zone-paint' | 'locked'): void }
```
渲染、UI 只消费 `PointerIntent`，不直接处理原始鼠标/触控事件，保证两平台功能等价。

## 7. 管线 ↔ 客户端契约
- 事实源层级见 00 §3：L1 冻结前本文件为规范；冻结后 `core-types/schema/` 中 Zod 定义为机器事实源 → 导出 JSON Schema → TS 类型 / Pydantic 模型（生成文件入库，CI 校验）。
- `ccb-sections.json`、`fields.json`、`hexgrid-vectors.json`、`ccb-golden/`、`pcg32-vectors.json`、`xxhash32-vectors.json`、`detmath-vectors.json`：两端测试共用。

## 附录 A：待 P3a-A0 补全的结果类型清单（契约变更机制：新增类型以「契约变更 PR」提交，Claude 审查；若改动 L1 已冻结的类型，需 ADR + GPT 复核）
`CityReport`、`ProvinceReport`、`Ranking`、`History`、`Explain` 结果结构；`GameEvent`、`Notification`；`Content` 编译产物结构（由 content 编译器 schema 生成）。补全属于 P3 第一个任务包的验收项（18 P3a-A0）。

---

<!-- 文件：15-performance.md -->

# 15 性能预算与测量口径

> 本文件全部数字为**目标或估算**，以参考设备实测为准；P1a 实测后修订（回应 R042）。

## 1. 参考环境
| 档 | 设备 | 分辨率 | 目标 |
|---|---|---|---|
| 参考中档 A | Apple M1 8 GB，Chrome 稳定版（版本锁定见 ADR-016） | 1920×1080 CSS，DPR 2（drawingBuffer 受画质 DPR 上限约束，07 §7） | 中画质 |
| 参考中档 B | Intel Iris Xe 级 16 GB，Chrome | 1920×1080，DPR 1 | 中画质 |
| 参考独显 | GTX 1650 级 | 2560×1440，DPR 1 | 高画质 |
| 最低（桌面） | WebGL2、4 GB | 1280×720，DPR 1 | 低画质 |
| **iPad 入门档（候选）** | A14 级芯片 iPad，iPadOS Safari（**型号待用户确认，D-14**） | 横屏全屏 | iPad 档（§3） |
| **iPad 高档（候选）** | M 系列芯片 iPad Pro/Air（**型号待用户确认，D-14**） | 横屏全屏 | iPad 档或中画质（§3） |

验收在真实设备上运行 `tools/bench`；CI 无 GPU 环境只做趋势监控。

## 2. 预算

### 2.1 渲染（A 档，中画质，参考中档 A）

| 指标 | 目标 | 口径 |
|---|---|---|
| 帧时间 | 平均 ≤ 16.7 ms；P95 ≤ 20 ms；单帧 > 50 ms 的卡顿每分钟 ≤ 2 次 | bench 8 段相机路径，预热 5 s 后统计 60 s |
| 主线程 JS | ≤ 6 ms/帧（P95） | 不含 GPU 等待 |
| Draw calls（整帧累加） | ≤ 150（A 档，分项分配见 07 §5a）；B 档另定 ≤ 400 | 07 §2 手动累加 |
| 三角形 | A 档 ≤ 0.3M；B 档 ≤ 1.5M（地形 ≤ 1.0M） | 整帧 |
| 精灵实例 | ≤ 20,000 | 07 §3.3 |
| GPU 上传 | ≤ 4 MiB **且** ≤ 3 ms / 帧（两个条件同时满足） | — |
| GPU 内存估算 | 低 ≤ 256 MiB；中 ≤ 512 MiB；高 ≤ 768 MiB（A 档） | 纹理（含 mip）+ 缓冲 + 渲染目标 |
| CPU 侧资源缓存 | ≤ 300 MiB | AssetCache 统计 |

### 2.2 模拟（M2，31 省全 AI，第 40–80 回合，5 个固定种子取 P95）

| 步骤 | 软目标 | 硬上限 |
|---|---|---|
| AI | 300 ms | 400 ms |
| 交通 | 300 ms | 500 ms |
| 经济 + 财政 | 250 ms | 320 ms |
| 人口 + 城市 | 120 ms | 150 ms |
| 其他（事件、项目、计分、量化、哈希、差量） | 100 ms | 130 ms |
| **合计** | **≤ 1,070 ms（预留余量）** | **≤ 1,500 ms** |
| Worker 内存 | — | ≤ 300 MiB（完整一局结束时） |

测量范围：从 Worker 收到 `endTurn` 到发出响应（含差量拷贝）；**主线程应用差量分帧进行，每帧 ≤ 4 ms**（08 §7），合计应用时间另行报告（不是每帧预算）。工程推进、研发计入「其他」。
各阶段的验收负载：P5 交通单系统（固定 OD，无 AI）；P6 经济+财政整系统；P7 全 AI 整回合（回应 R113）。

### 2.3 加载（M1 冷启动）

| 项 | 目标 |
|---|---|
| 应用壳（JS + CSS，Brotli） | ≤ 1.5 MiB |
| 首屏字体（UI 子集） | ≤ 1.5 MiB |
| 地图首帧必需数据（base-geo boot + scenario-raw boot + 合规 + boot 字集 + 低分辨率晕渲） | ≤ 12 MiB（Brotli 后，P2 实测修订） |
| 50 Mbps 冷启动到可交互 | ≤ 10 s（3 + 12 MiB 理论传输约 2.5 s，其余为请求延迟、解压、解析、GPU 上传；P2 报告实际字节数与各环节耗时） |
| 二次访问 | ≤ 3 s（HTTP immutable 缓存；不依赖 Service Worker） |

## 3. iPad 预算（DEC-001 D-12；具体指标由 P1a 真机实测确定）

以下为 P1a 的**初始假设与测量项**，P1a 结束时按实测写入 ADR-016 并作为 P2 起的硬指标；不得在实测前宣称达标。

| 项 | 初始假设（待实测修订） | 测量方法 |
|---|---|---|
| 帧率目标 | 地图交互平均 ≥ 30 fps，P95 帧时间 ≤ 40 ms；高档 iPad 目标 60 fps | 真机 + Safari Web Inspector 时间线；bench 相机路径的触控版 |
| drawingBuffer DPR | 入门档 ≤ 1.25，高档 ≤ 1.5 | 实测后定 |
| GPU 内存估算 | 入门档 ≤ 256 MiB，高档 ≤ 384 MiB | `renderer.stats()` |
| JS 堆 + 资源缓存（主线程 + Worker） | 合计 ≤ 600 MiB（入门档），实测 Safari 标签页被系统回收的阈值后修订 | 内存压力测试：持续浏览 15 分钟 + 完整一局 |
| 精灵实例上限 | 入门档 1 万，高档 2 万 | — |
| 冷启动（50 Mbps Wi-Fi） | ≤ 15 s | 真机 |
| 回合结算（M2） | 硬上限 = 桌面硬上限 × 实测 CPU 比例系数（P1a 用同一合成基准测出比例） | 同一回放在桌面与 iPad 运行 |
| 热降频 | 连续游玩 30 分钟后帧率下降 ≤ 30% | 真机长测 |

降级策略（按顺序）：降 DPR → 降精灵密度 → 关海面动画 → 降低 coast_sdf/晕渲纹理分辨率 → 减少同时驻留的流式资源。

## 4. 优化策略（已纳入设计）
单 Pass 底图 + 数据纹理（07 §3.1）；实例化精灵与全局上限（07 §3.3）；字形分级加载（07 §4）；CSR + 预分配堆 + 树累加（10 §5）；预计算 exp 核（11 §4.3）；有界 AI（12 §5）；Transferable 拷贝（14 §6）。

## 5. 测量
- `renderer.stats()`（整帧累加）、dev HUD、`TurnResult` 的宿主计时。
- `tools/bench`：相机路径 + 固定回放；输出 JSON（P50/P95/max、卡顿次数）。
- CI 趋势：相对基线退化 > 20% 告警（不阻断）；阶段验收用参考设备报告。

## 6. 退化处理
渲染：降精灵密度 → 降 DPR → 关海面动画；B 档不达标则不启用 B 档。模拟：剖析 → 收缩图/降候选 → WASM 热点（ADR）。内存：降低缓存上限、字集按需卸载。

---

<!-- 文件：16-testing.md -->

# 16 测试策略

原则：测试用来证明「功能真的可用」，不追求覆盖率数字。每类测试都写明它保护的是什么。

## 1. 测试分层

| 层 | 工具 | 保护对象 | 运行时机 |
|---|---|---|---|
| 单元 | Vitest / pytest | 纯函数：网格数学、公式、解析器、确定性数学 | 每次提交 |
| 属性 | fast-check | 不变量：人口守恒、货币守恒、排序全序、坐标往返 | 每次提交 |
| 契约 | Vitest + pytest | Python 写出 ↔ TS 读取；网格数学跨语言一致 | 每次提交 |
| 数据质量 | 管线 `90_validate` | 05 §8 断言 | 每次数据构建 |
| 模拟集成 | Vitest（Node） | 完整回合管线、系统间因果、护栏 | 每次提交（短）/ 每晚（长） |
| 确定性回放 | Vitest + Playwright | 跨引擎 stateHash 一致 | 每次提交（Node）/ 每晚（Chromium、Firefox、WebKit）；**桌面 Safari 与 iPadOS Safari 真机**在每个阶段验收时运行 |
| **iPad 真机** | iPadOS Safari 真机（参考设备 D-14）+ Safari Web Inspector | 触控功能等价、性能、内存、后台恢复 | 每个阶段验收（P1a 起）；**不得以 Playwright WebKit 或桌面模拟代替** |
| E2E | Playwright | 关键用户流程 | 每次合并 |
| 视觉回归 | Playwright 截图 | 已确认画面不被意外改变（**不衡量美术质量**，美术质量由人工评审） | 每次合并 |
| 性能 | tools/bench | 15 预算 | 每次合并（趋势）/ 阶段验收（参考设备） |

## 2. 关键测试用例清单

### 2.1 网格与数据
- `hexgrid`：04 §2.3 全部 golden vectors（含边、顶点、负坐标、越界）；参考实现为 Python `fractions` 有理数版本，**独立于被测代码**。
- `world-format`：06 §2.4 的 golden fixtures 与坏包集合；identity 变/不变测试（06 §1.2）。
- 管线：合成栅格已知答案；交叉表守恒（两县共享一格、县无格中心、海岸格、小岛城镇）；缓存失效测试（05 §7）。
- 确定性数学：PCG32、xxHash32 官方向量；`sim/math` 高精度参考向量。

### 2.2 模拟
- 守恒：迁移前后人口总量相等；财政收支 = 余额变化；货流总量 = 供给满足量。
- 护栏：11 §7、09 §7 中的全部断言。
- 因果方向：10 §7.3、11 §8.3、09 §7.4。
- 命令：每个命令的 validate 拒绝路径各至少一个用例；`apply` 后状态变化断言。
- AI：完整一局（120 回合）无异常、无超时（每晚）。

### 2.3 确定性回放
- 回放用例 ≥ 5（短局、长局、事件选择、存读档、AI 全开）；期望哈希序列入库。
- golden 回放由 Node 生成，浏览器回放比对；`simVersion` 变化时显式重新生成，PR 说明原因。
- 额外：独立命令乱序测试（12 §5.3）、重复 `commandId`、差量缺口触发 resync、Worker 重启恢复。

## 3. 测试夹具

- `test-utils/synthetic-world`：程序生成的 64×64 格小世界（含山地、河流、海岸小岛、2 个省、6 个城市、公路+高铁、1 条渡运），使用 08 §9.1 默认驱动量；用于 PR 快速回归。**全国验收不以合成 fixture 代替。**
- `test-sichuan` 区域世界包：真实数据子集，用于集成测试（CI 缓存）。
- 全国世界包：仅每晚与阶段验收使用。

## 4. E2E 关键流程
**M1**（桌面 + iPad 真机各一遍）：冷启动 → 地图首帧（断言：画布非空、审图号/水印组件可见、合规层已加载）→ 切换 12 个透镜（每个有图例、缺失值显示斜线）→ 搜索城市并飞到 → 打开省/市面板（数值与来源与 `Almanac` 输出一致）→ 导出截图（检测审图号/水印/附图存在）→ URL 分享往返。
**M2**（桌面 + iPad 真机各一遍）：新游戏 → 线路预览/建设 → 结束回合 → 存档 → 刷新 → 读档（哈希一致）→ 结束 5 回合（通知与报表更新）→ 模拟 WebGL 上下文丢失并恢复。

## 4a. iPad 真机验收清单（D-12）
- 手势：拖拽、双指缩放（中点锚点）、双击、长按提示、长按菜单、横向滚动透镜坞。
- 功能等价：13 §2.3 表中每一行在 iPad 上完成一次（M1 项在 P2，M2 项在 VS/P7）。
- 布局：横屏下所有面板、按钮、审图号徽标在安全区内可见；软键盘弹出不遮挡输入框。
- 性能与内存：15 §3 全部测量项。
- 稳定性：切后台 5 分钟后恢复（含上下文丢失重建）；内存告警时自动存档；完整一局无崩溃（P9）。
- 确定性：同一回放在 iPad 上逐回合 stateHash 与 Node 一致。

## 5. 视觉回归
- 固定机位、种子、状态、画质，`deterministicTime` 关闭动画。
- CI 锁定：浏览器构建号、OS 镜像、字体文件、软件渲染器（SwiftShader）版本、DPR = 1、抗锯齿设置。
- 阈值：初始用 `pixelmatch` 0.1 / 差异像素 ≤ 0.5%，**P2 根据实测噪声调整**（锁定环境下仍可能有非零差异，不假定逐像素一致）。
- 参考图更新必须经人工批准。

## 6. 合规测试（自动 + 人工）

- 自动：`95_compliance` 存在性检查；`MapApprovalBadge` 在所有屏幕尺寸、面板组合、全屏模式下可见且位于左下角；合规线在所有透镜/画质/缩放下像素级可见（采样检测）；`internal` 构建水印存在；应用级导出图像包含审图号/水印/附图；`public` 构建的审批登记绑定校验（05 §6.2）。
- 人工：按 `required_features.yaml` 对照标准地图逐项核对（记录核对人、日期、对照图号）。**内部核对不等于行政审批**。

## 7. 内容审核清单（人工，每次内容变更）

- 不出现真实政治人物、真实政治事件、地区对立、民族宗教敏感表述。
- 地名使用标准名称；港澳台表述符合规范。
- 所有第三方资产与数据有许可登记。

## 8. 质量门禁（合并到 main 必须满足）

1. `pnpm lint`（含依赖边界、确定性规则）零错误。
2. `pnpm typecheck` 通过（含 `sim` 无 DOM 检查）。
3. 单元 + 属性 + 契约 + 短集成 + Node 回放全部通过。
4. E2E 与视觉回归通过（或视觉基线更新已被审查批准）。
5. PR 描述包含任务包编号与验收自检。

---

<!-- 文件：17-build-deploy.md -->

# 17 构建、CI/CD 与部署

## 1. 统一命令
| 命令 | 作用 |
|---|---|
| `make setup` | 安装依赖（锁文件）、拉取管线镜像（digest） |
| `make schema` | Zod → JSON Schema → TS / Pydantic 生成（03 §5 步骤 1） |
| `make content` | 规则编译 |
| `make data LAYER=… [REGION=…]` | 管线（05 §9） |
| `make calibrate` | 生成 scenario-cal（P6 起） |
| `make assets` | 精灵/材质/字形图集生成与 KTX2 转码 |
| `make dev` / `make test` / `make test-all` / `make bench` | — |
| `make build DIST=internal|public` | `public` 触发许可门禁、审批登记校验 |

## 2. CI 工作流与权限隔离（回应 R038）

| 工作流 | 触发 | 凭证 |
|---|---|---|
| `ci.yml` | PR（含 fork）、push | **无任何写凭证**；只读公开缓存 |
| `e2e.yml` | PR 合并前 | 只读 internal 测试区世界包（短期只读令牌，仅受信分支；fork PR 使用合成 fixture） |
| `pipeline.yml` | `main` 上 `pipeline/**` 变化、手动 | internal 存储写凭证（环境保护规则：仅 `main`） |
| `nightly.yml` | 每晚（`main`） | internal 写 |
| `release.yml` | 受保护 tag `v*`，需人工批准 | public 写；短期最小权限凭证 |

- 不受信代码（PR）永远拿不到写凭证或 internal 数据下载凭证。
- 原始数据缓存：internal 对象存储（按 sha256 寻址）。

## 3. 客户端产物与缓存（回应 R044）
```
dist/index.html                       no-cache
dist/assets/*.[hash].*                immutable, 1 年
release.json（发布描述符，见 §5.1）  Cache-Control: no-cache（每次加载重新验证）
```
- **V1 不引入 Service Worker**（推迟到存档格式稳定后另行 ADR）；依赖 HTTP immutable 缓存。
- 启动时**原子选择兼容组合**：`release.json` 指定唯一的 app + 包链 + content 组合，客户端只加载该组合；加载失败（404/hash 不符）→ 错误页，不混用版本。
- 存档兼容：06 §7。

## 4. 部署与访问控制
| 环境 | 存储与 URL 空间 | 访问 |
|---|---|---|
| internal | 独立存储桶/前缀 `internal/`，**全部文件**（HTML、JS、世界包、历史包）都在访问控制之后 | 身份认证网关（具体服务商待 D-07 定） |
| public | 独立存储桶 `public/` | 公开 |

- internal 与 public **不共享任何路径**；public 构建只能读取 `distribution = public` 的世界包（构建时校验）。
- 托管地区与方案（境内 / 境外 / 双轨）：D-07；涉及 ICP 备案、数据存储地等法规适用待 D-13 专业意见（未核实）。
- COOP/COEP：V1 不启用。

## 5. 发布描述符、发布与撤回（回应 R111、R125）

### 5.1 发布描述符 `release.json`
- 结构见 14 §2 `ReleaseDescriptor`：应用构建 hash、完整包链（每层 identity 与 URL）、contentHash、`styleHash`、可公开显示的审批信息（审批 ID、审图号文本、有效期、适用范围）、`revoked` 标志。**不含**私有批文扫描件。
- 由 `release.yml` 从审批登记（05 §6.2）与构建产物生成；`public` 描述符要求审批登记绑定项与描述符内容逐项一致。
- 客户端启动：先取 `release.json`（no-cache）→ 校验 `revoked == false`、有效期 → 加载包链并逐层校验（06 §1.4）→ 加载合规资源 → 才绘制地图。`MapApprovalBadge`、截图导出、小地图都只读这一份描述符的审批信息。

### 5.2 发布门禁
阶段验收报告；**包链全部源**的许可门禁（05 §3.2）；审批登记有效且绑定当前展示产物；视觉评审；桌面与 iPad 真机性能报告；内容审核。M1 可在 P2 后独立发布（01 §3.1）。

### 5.3 撤回
1. 审批登记标记 `revoked` → 重新生成并发布 `release.json`（`revoked: true`）；服务端（CDN 边缘规则）对已撤回 identity 下的资源返回 410。
2. CDN purge 该版本独有的资源；**资源按内容寻址并记录被哪些发布引用（引用计数）**，仍被其他有效发布引用的共享文件不删除。
3. 已打开的页面：客户端每 30 分钟及每次回到前台时重新验证 `release.json`；发现撤回 → 停止地图渲染并提示刷新。
4. 回退：`index.html` 指向的上一个发布在回退前必须重新校验其审批仍有效；否则显示维护页。
5. **能力边界（明确告知）**：无法召回用户已下载的截图、导出文件或浏览器磁盘缓存中的旧资源；撤回只能阻止继续使用在线服务。具体法律义务待专业意见（D-13）。
6. P9 演练：匿名直链、已登录账户、历史包、缓存命中、回退版本有效性、已打开会话的提示。

### 5.4 内部环境访问控制
身份网关同时覆盖 HTML、JS、`release.json`、世界包、历史包与对象存储直链（对象存储不开放公共读，只能经网关签名访问）；CDN 缓存键包含认证维度，禁止缓存认证后的响应给未认证请求。

## 6. 密钥
客户端无密钥；CI 密钥按 §2 分级，最小权限、短期，**不在执行不受信代码的步骤中暴露**；审批扫描件只存私有存储。不引入第三方遥测（如需另行决策）。

---

<!-- 文件：18-roadmap-acceptance.md -->

# 18 开发路线与逐阶段验收

## 1. 阶段与依赖（回应 R113）

```
P0 架构冻结 L1
 └─▶ P1a 可行性与合规门禁（含候选 R 可读性样例）
        └─▶ P1 base-geo 包 + GridSpec 冻结（P1-G，L2）
               ├─▶ P2 M1「华夏图鉴」（scenario-raw + A 档 + 数据地图 UI；桌面 + iPad）══▶ M1 可独立发布
               └─▶ P3a 模拟内核（合成 fixture + 默认驱动量）
                      └─▶ P3b 真实人口集成（依赖 P2-A1 scenario-raw）
                             └─▶ P4 垂直切片 VS（依赖 P3b + P2 渲染器与 UI 框架）
                                    └─▶ P5 交通全量 ─▶ P6 经济全量 + 校准 ─▶ P7 策略/AI/内容 ══▶ M2 可玩
P2 起美术持续并行 ────────────────────────────────────────────────▶ P8 视觉打磨（可选项独立）
                                                                       └─▶ P9 M2 加固与发布候选
```

| 阶段 | 依赖 | 产出 |
|---|---|---|
| P0 | — | 架构 V1.0（L1 冻结） |
| P1a | P0 | 依赖锁定；合成世界技术样例（网格/CCJ/CCB/确定性基元/A 档样例渲染器/路由）在**桌面与 iPad 真机**实测；候选 R 可读性截图；数据源审计卡；许可与合规路径评估 |
| P1 | P1a | `base-geo`（测试区 → 全国）；数据检视器；GridSpec 冻结 |
| P2 | P1 | `scenario-raw`；M1 全部功能（桌面 + iPad） |
| P3a | P1a（网格、CCB、确定性基元） | 确定性内核、CSE-1、Worker 协议、存档、回放；人口/城市在合成 fixture 上 |
| P3b | P3a + P2-A1 | 人口/城市接入 scenario-raw 子集 |
| P4 | P3b + P2（渲染器、InputRouter、UI 框架） | 垂直切片 |
| P5 | P4 | 全国交通（固定 OD 压测） |
| P6 | P5 | 全国经济、财政、校准 → `scenario-cal` |
| P7 | P6 | 政策、发展树、项目、事件、AI 全量与内容扩充；全 AI 整回合负载 |
| P8 | P2 起并行 | 美术定稿（必选）；战略视图、音频、B 档（均**可选**，不阻塞 P9） |
| P9 | P7 + P8 必选项 | M2 加固与发布 |

关键路径：P0 → P1a → P1 → P3a → P3b → P4 → P5 → P6 → P7 → P9。M1 发布不依赖 P3 及以后任何阶段（回应 R128）。

## 2. 任务包规则
- 一个任务包 = 一个可独立测试的结果；数据与视觉任务以「产出物 + 报告/截图」衡量。
- 每个任务包注明验收编号、所依据的架构版本与 Git commit。

## 3. 门禁的三态判定（回应 R112）

可行性与性能类验收项按三态判定，**提交报告本身不算通过**：

| 结果 | 含义 | 后续 |
|---|---|---|
| **PASS** | 实测满足本文件或 15 中的阈值 | 进入下一阶段 |
| **DEGRADE** | 不满足，但存在已写明的降级方案，且降级后实测满足阈值 | 降级方案写成 ADR，经用户批准后视同通过 |
| **STOP** | 不满足且无可行降级 | 暂停后续阶段；提交替代方案（如 07 §8 架构级替代、缩小范围）由用户决定 |

阈值在 P1a 结束时由双方根据实测提出、用户批准后写入 ADR-016；不得在实测前虚构结果。

## 4. 逐阶段验收

### P0 架构冻结（L1）
| 编号 | 验收项 |
|---|---|
| P0-A1 | **全部阻断项（R001–R019、R101–R113 及第三次审查新增的阻断）均为「已关闭」或「方案关闭、指定后续实测阶段」**；任一未关闭则不得冻结 |
| P0-A2 | 需用户在 P0 确认的决策：D-01、D-09、D-11、D-12（已于 DEC-001 确认）；**D-14（iPad 参考型号）需在 P1a 开始前确认** |
| P0-A3 | 文档改为 V1.0，打 tag `arch-v1.0`；项目负责人最终确认 |

### P1a 可行性与合规门禁（三态）
| 编号 | 验收项 | PASS 条件 |
|---|---|---|
| P1a-A1 | 依赖锁定 | ADR-016 记录全部确切版本与工具登记（03 §6） |
| P1a-A2 | 网格契约 | 04 §2.3 golden vectors（三个候选 R）TS/Python 100% 一致；数学真值检验通过 |
| P1a-A3 | CCJ-1 与 CCB 契约 | 06 §1.2 与 §2.4 全部 fixture 双向通过，坏包全部被拒 |
| P1a-A4 | 确定性基元 | PCG32/SplitMix64/xxHash32/CRC-32 向量通过；`sim/math` 精度与吞吐（45 万次 exp/ln）在 Chromium/Firefox/WebKit/Node/**桌面 Safari/iPad Safari** 结果一致并给出耗时 |
| P1a-A5 | A 档样例渲染器 | 合成全国规模世界：底图 + 晕渲 + 最复杂邻格混合 + 2 万精灵 + 线网 + 标签 + 合规 + 透镜 + 后处理全部 Pass，相机移动与流式上传；桌面满足 15 §2.1，iPad 测出 15 §3 各项实测值并据此定阈值 |
| P1a-A6 | 路由样例 | 10 §5 合成图（3k/6k 节点 × 5k/10k/20k 边 × 两套权重 × 最坏拥堵 × 零成本/不可达 fixture）：P95 ≤ 500 ms（桌面参考中档 A）；iPad 记录比例系数 |
| P1a-A7 | 能力矩阵 | 02 §3 全部必需项在所有参考设备（含 iPad）通过，或已批准降级 |
| P1a-A8 | 数据审计 | S01–S17 审计卡；每个计划使用的源**合法可取得**，否则限定范围或替代 |
| P1a-A9 | 合规与许可路径 | D-04 可行性评估、D-05/D-13 专业意见已启动；**每个将在 internal 处理的真实源已有内部使用书面审查**（05 §6.2 第 4 条）；D-08 已决定或按从严默认 |
| P1a-A10 | 管线资源样本 | 测试区、东部密集区、边界区三样本实测；据此设定全国构建与重计算阶段预算 |
| P1a-A11 | 候选 R 可读性 | 用 A5 样例渲染器在测试区以三个候选 R 渲染同一组机位（桌面、iPad 各一套），用户评审选择（供 P1-G） |

### P1 地理基底包
| 编号 | 验收项 |
|---|---|
| P1-A1 | Monorepo、lint 边界、确定性 lint 自测、CI |
| P1-A2 | 测试区 `base-geo` 冷构建 ≤ P1a 设定值；断言通过 |
| P1-A3 | 全国 `base-geo`：05 §8 base-geo 层断言全过；构建时间 ≤ P1a 设定值 |
| P1-A4 | 可复现：两次冷构建 identity 相同；缓存失效测试通过 |
| P1-A5 | 几何交叉表 04 G5a（**不含人口**） |
| P1-A6 | 数据检视器（dev） |
| P1-G | GridSpec 冻结：04 G3、G4、G6；R 值依据 P1a-A11 评审与冲突率；`gridHash` 写入 ADR |

### P2 M1「华夏图鉴」（桌面 + iPad）
| 编号 | 验收项 |
|---|---|
| P2-A1 | `scenario-raw`：05 §8 V2、V3、V5、V7；04 G5b；lineage 完整 |
| P2-A2 | A 档地图：底图、晕渲、水体、精灵、格线；全国平移缩放无空洞、无奇偶行接缝 |
| P2-A3 | 透镜 ≥ 12 个；图例、缺失值显示正确 |
| P2-A4 | 旗标与标注：12 机位无重叠/裁切（桌面、iPad 各一套） |
| P2-A5 | 面板与来源：数值 = Almanac 输出；每项可查来源与 `kind` |
| P2-A6 | 搜索、小地图、URL 分享 E2E |
| P2-A7 | 合规显示与导出：16 §6 自动项全过 |
| P2-A8 | 拾取：格拾取与 CPU 契约真值一致；旗标/线路实体拾取按屏幕优先级测试（鼠标与触控命中半径） |
| P2-A9 | 性能与加载：桌面 15 §2.1、§2.3；iPad 15 §3（P1a 定的阈值）——三态判定 |
| P2-A10 | **iPad 真机**：16 §4a 中 M1 相关全部项 |
| P2-A11 | 视觉初审：12 机位截图，用户确认方向；**M1 视觉质量不得因 M2 需求降级**（DEC-001） |
| P2-A12 | M1 公开发布（若要公开）：发布描述符门禁 + 包链许可门禁 + 审批（17 §5）；否则仅 internal |

### P3a 模拟内核（合成 fixture）
| 编号 | 验收项 |
|---|---|
| P3a-A0 | 14 附录 A 结果类型、`state-fields.json` 全部字段、效果语言完整约定补全并评审 |
| P3a-A1 | 08 §10 全部（含 CSE-1、回放日志、幂等、差异定位工具） |
| P3a-A2 | Worker 协议 14 §6 全部规则（epoch/gameId、闸门、自动存档点、超时恢复、响应丢失重试、乱序/晚到响应） |
| P3a-A3 | 存档：IndexedDB 轮换、导出/导入、损坏文件拒绝、回合中途存读档 |
| P3a-A4 | 09 §7 第 2–5 条（合成 fixture） |
| P3a-A5 | 同一回放在 Node、三浏览器、**iPad Safari 真机**逐回合哈希一致 |

### P3b 真实人口集成
P3b-A1 09 §7 第 1、6 条（scenario-raw 子集）；P3b-A2 人口步骤性能 ≤ 150 ms（桌面），iPad 记录。

### P4 垂直切片 VS（回应 R113）
范围：测试区子集（或合成世界）、2 个省、≥ 2 个城市；**仅交通（公路 + 高铁）、经济（2 个可贸易部门 + 1 个本地部门）、人口、财政**；**不含**政策、发展树、事件、项目、AI；1 个建设操作（BuildLink）+ 结束回合 + 存读档；桌面与 iPad 均可完整操作。
| 编号 | 验收项 |
|---|---|
| VS-A1 | 完整回合闭环可玩（桌面 + iPad 真机，人工 + E2E） |
| VS-A2 | 存读档哈希一致；回放跨浏览器与 iPad 一致 |
| VS-A3 | 守恒：人口、贸易（11 §8.4 全部 fixture）、财政（省与中央） |
| VS-A4 | 可见后果：建高铁后 4 回合内，可达性、贸易流、人口变化在透镜中可见；10 §7.3 因果测试 |
| VS-A5 | 基准：满规模 337 城市贸易矩阵单项耗时；AI 代理基准（12 §5.2，独立于 VS 玩法运行） |
| VS-A6 | 用户试玩确认核心循环成立后才进入 P5 |

### P5 交通全量
P5-A1 初始网络（近似 2020 年末）与连通性报告（05 V5，含审计例外清单）；P5-A2 10 §7 第 2、4（固定 OD 压测，无 AI）、5、6 条；P5-A3 流量透镜。

### P6 经济全量 + 校准
P6-A1 11 §8 第 1、2、4、5 条；P6-A2 校准报告（观测/估算/拟合分列；校准时关闭 AI/政策/事件/项目）；P6-A3 `Explain` 查询；P6-A4 `scenario-cal` 可复现且 contentHash 绑定。

### P7 策略 / AI / 内容
P7-A1 内容数量（12 §7）通过编译；P7-A2 12 §8 全部（预注册）；P7-A3 人工完整一局（120 回合）桌面与 iPad 各一局无阻断 bug；P7-A4 新手引导（桌面与 iPad 各一名新用户，10 分钟内完成首条线路与首次结算）；P7-A5 全 AI 整回合满足 15 §2.2（桌面）与 15 §3（iPad）。

### P8 视觉打磨
必选：P8-A1 12 机位终版（桌面、iPad）经用户确认；P8-A2 资产许可登记 100%；P8-A5 性能不退化。
**可选（不阻塞 P9）**：P8-A3 战略视图；P8-A4 音频；P8-B B 档（需用户另行批准，07 §9）。

### P9 M2 加固与发布候选
P9-A1 浏览器矩阵 E2E + 桌面 Safari + **iPad 真机全部清单**（16 §4a）；P9-A2 全部性能预算参考设备报告；P9-A3 连续 3 局无崩溃（桌面与 iPad）、内存达标；P9-A4 发布描述符与审批绑定当前产物；P9-A5 许可与 ODbL 义务履行；P9-A6 内容审核；P9-A7 撤回流程演练（17 §5.3）。

## 5. 协作流程
Claude 出任务包 → GPT 实现与自测（五段回传）→ Claude 逐条验收 → 下一包。架构偏离走 ADR + 用户确认；同一问题两轮未修好升级处理。

---

<!-- 文件：19-risks-decisions.md -->

# 19 待决策、风险与 ADR 索引

## 1. 决策

### 1.1 用户已确认（DEC-001，2026-11-27）
| 编号 | 决策 | 内容 |
|---|---|---|
| D-01 | 产品形态 | M1 数据地图 + M2 回合制策略；M1 独立运行、展示、验收；不为 M2 牺牲 M1 视觉质量与数据准确性 |
| D-09 | 时间与统计口径 | 2020 基准；回合 0 = 2021Q1；120 回合；2020 年不变价；观测/估算/模拟明确区分 |
| D-11 | 主渲染形态 | A 档为 V1 正式验收；B 档后续可选、非 V1 发布条件；保留 three.js + WebGL2 |
| D-12 | 平台 | 桌面 + iPad 均为正式平台；iPad 完整触控、M1/M2 核心功能可用；iPadOS Safari 真机为正式验收；iPad 单独预算由 P1a 实测确定 |

### 1.2 待用户决策（未确认；负责人均为项目负责人，Claude 准备选项）
| 编号 | 决策 | 默认方案（未决前按此推进） | 最迟决策点 |
|---|---|---|---|
| D-02 | 军事/征服玩法 | 现代场景不做 | P7 前 |
| D-03 | 台港澳的统计口径 / 玩法 | 统计口径：M1 面板按数据实际覆盖展示并注明口径（**P1a 前定**）；玩法：不可经营、参与全国市场（P6 前定） | P1a / P6 |
| D-04 | 合规边界数据来源 | P1a 评估 A/B/C | P1a 启动、公开发布 M1 前确定 |
| D-05 | OSM/ODbL 法律处理 | 物理分离 + 派生链清单；待专业意见 | 公开发布 M1 前 |
| D-06 | 行政区划版本 | 2020 年版 | P1 |
| D-07 | 托管方案 | internal 受控；正式方案待定 | 公开发布前 |
| D-08 | 商业化 | 按可能商业化从严 | **P1a** |
| D-10 | 玩家身份 | 单省主政 + 全国沙盒 | P3a |
| D-13 | 法规适用路径（地图审核类别、测绘资质、游戏出版、数据存储与跨境） | 需专业意见；未确认前只做 internal | P1a 启动、公开发布前完成 |
| D-14（新） | iPad 参考设备型号 | 候选：A14 级入门 iPad + M 系列 iPad Pro/Air 各一台 | **P1a 开始前** |
| U1（R027） | 内部使用真实数据的条件 | 按 05 §6.2 第 4 条（逐源许可审查 + 内部用途书面审查后受控使用）；GPT 已在复议中接受 | P1a 前（请确认并指定取得专业意见的负责人） |

## 2. 风险登记

| 编号 | 风险 | 可能性 | 影响 | 缓解 | 触发信号 | 最迟处理 |
|---|---|---|---|---|---|---|
| R-01 | 地图审核不通过或周期长 | 中 | 高 | 合规层独立；D-04/D-13 提前到 P1a；审批登记机制 | P2 结束仍无合规来源 | P2 |
| R-02 | 数据许可不允许商用/再分发 | 中 | 高 | P1a 审计卡与替代源 | `commercial_ok=false` | P1a |
| R-03 | 统计数据缺失 | 高 | 中 | 地级为核心；缺失如实标注 | 审计卡缺失率高 | P1a |
| R-04 | 跨引擎确定性破坏 | 低 | 高 | 08 §2 + 夜间三浏览器回放 | 哈希不一致 | 持续 |
| R-05 | A 档渲染性能不达标 | 低 | 中 | P1a 合成样例实测；Canvas 2D 退路（07 §8） | P1a-A5 不达标 | P1a |
| R-06 | 经济模型动态不合理 | 中 | 中 | 有界调整、守恒断言、护栏 | 护栏失败 | P6 |
| R-07 | 美术产能不足 | 中 | 中 | A 档 2D 资产量小；P2 起并行 | P8 前资产完成 < 70% | P8 |
| R-08 | 接口漂移 | 中 | 中 | 14 为唯一事实源；契约测试 | 同类返工 ≥ 2 | 持续 |
| R-09 | 内容敏感性 | 中 | 高 | 内容红线与审核清单；不做军事图层 | 审核不通过 | 持续 |
| R-10 | three.js 升级破坏 | 中 | 低 | 版本锁定 | — | — |
| R-11 | 网格 R 不合适 | 中 | 高 | L2 冻结在 P1-G；候选 12/16/20 km | 冲突率/可读性不达标 | P1-G |
| R-12（新） | 交通/AI 计算超预算 | 中 | 中 | P1a 路由样例、有界候选 | P1a-A6 超标 | P1a / P4 |
| R-13（新） | 历史网络快照不可得 | 中 | 低 | 标注「近似 2020 年末」 | 审计卡结论 | P1a |
| R-14 | 管线资源超出单机 | 中 | 中 | 流式窗口处理、预聚合 | P1a-A10 超标 | P1a |
| R-15（新） | iPad Safari 内存上限与热降频导致崩溃或卡顿 | 中 | 高 | iPad 专用档位、资源上限、后台自动存档、P1a 真机实测定阈值 | P1a-A5 iPad 实测超标 | P1a |
| R-16（新） | 触控等效操作体验差（线路规划等精细操作） | 中 | 中 | 途经点点选 + 撤销按钮，不依赖拖拽精度；VS 阶段 iPad 试玩 | VS-A1 iPad 试玩反馈 | P4 |
| R-17（新） | 贸易分配的非最优缺口影响玩法观感 | 中 | 低 | unmet 在 UI 可见；必要时增加轮数（参数） | VS 试玩 | P6 |

## 3. ADR 索引

| ADR | 标题 | 位置 | V0.2 状态 |
|---|---|---|---|
| ADR-001 | Web 优先 | 02 | 保留 |
| ADR-002 | three.js 自研渲染（含 Canvas 2D 对比与退路） | 02 | 修订 |
| ADR-003 | 模拟内核 TypeScript | 02 | 保留 |
| ADR-004 | 表驱动状态 | 02 | 保留 |
| ADR-005 | DOM UI + GPU 地图文字 | 02 | 保留 |
| ADR-006 | Python 管线 | 02 | 保留 |
| ADR-007 | Albers 等积 + 尖顶六边形；R 候选，P1-G 冻结 | 04 | 修订 |
| ADR-008 | 校准在 TS 中完成（P6） | 05 | 修订（时点） |
| ADR-009 | 自定义 CCB 容器（wire spec v2） | 06 | 修订 |
| ADR-010 | 跨回合平滑的交通分配（玩法近似，非均衡） | 10 | 修订 |
| ADR-011 | 有供给上限的多轮贸易分配 | 11 | 修订 |
| ADR-012 | 效用 AI + 有界候选 + 同快照观察 | 12 | 修订 |
| ADR-013 | 现代场景不含地区间军事冲突 | 01 | 保留 |
| ADR-014 | 受限声明式效果语言 | 06 | 保留 |
| ADR-015 | A 档俯视为 V1 主渲染形态 | 07 | 已确认（D-11） |
| ADR-016 | 依赖确切版本锁定 | 02 | 新增（P1a 填写） |
| ADR-017 | 标准 PCG32 + SplitMix64 派生 + 双路 xxHash32 状态哈希 | 08 | 修订 |
| ADR-018 | 命令提交即原子生效 + 幂等 commandId | 08 | 新增 |
| ADR-019 | 三层世界包（base-geo / scenario-raw / scenario-cal） | 05 | 新增 |
| ADR-020 | 统计归属（交叉表）与管理归属分离；几何/人口交叉表分层 | 04 | 修订 |
| ADR-021 | 桌面 + iPad 双正式平台 | 01、02 | 新增（D-12） |
| ADR-022 | CCJ-1 规范 JSON 与 gridCore/manifestCore 身份 | 06 | 新增 |
| ADR-023 | CSE-1 规范状态编码（CCB 承载）与写入即规范 | 08 | 新增 |
| ADR-024 | 回放日志只记玩家命令 + EndTurn，AI 重算 | 08 | 新增 |
| ADR-025 | 工程出资「承诺比例、按期原子扣款、不预扣」 | 08 | 新增 |
| ADR-026 | 发布描述符 release.json 与撤回机制 | 17 | 新增 |
| ADR-027 | 门禁三态判定（PASS / DEGRADE / STOP） | 18 | 新增 |

## 4. 推迟到 V1 之后
多人联机、历史场景、模组编辑器、手机布局、WebGPU、城市内部交通、海军、遥测、Service Worker 离线、桌面封装。

---

<!-- 文件：20-review-response.md -->

# 20 GPT-6.2 第二次审查回复表（V0.2 → V0.3）

- 审查原文：`docs/architecture/reviews/GPT-R2-review-of-V0.2.md`
- 用户决策：`docs/architecture/decisions/DEC-001.md`（D-01、D-09、D-11、D-12 已确认）
- 第 0 轮回复表见 `v0.2/20-review-response.md`
- 统计：R101–R129 共 29 条，**采纳 29 条**（其中 R128 的部分内容因 DEC-001 调整，见下）；4 条复议 GPT 均接受 Claude 理由（R027 附条件，已按条件落实）。

## 一、旧阻断项 R001–R019

| 编号 | GPT 第二次结论 | V0.3 处理 | 状态 |
|---|---|---|---|
| R001 | 已关闭（方案） | — | 已关闭 |
| R002 | 已关闭（方案，待 P1-G） | gridCore 无自引用定义（R102） | 已关闭 |
| R003 | 已关闭（方案，D-09 待用户） | D-09 用户已确认（DEC-001）；S12 旧字样改正（R115） | 已关闭 |
| **R004** | 未关闭 → R101 | 见 R101 | 方案关闭，待 P1/P2 实测 |
| R005 | 已关闭（方案） | 锚点格视觉分类矛盾统一（R115） | 已关闭 |
| **R006** | 未关闭 → R104 | 见 R104 | 方案关闭 |
| R007 | 已关闭（方案，待 P1a-A3） | 边缘规则补全（R116） | 方案关闭，待 P1a |
| **R008** | 未关闭 → R102、R103 | 见 R102 | 方案关闭，待 P1a |
| R009 | 已关闭（方案，待 P1-A4） | 工具登记（03 §6） | 方案关闭，待 P1 |
| R010 | 已关闭（方案） | ID 上限与跨表引用（06 §3） | 已关闭 |
| R011 | 已关闭（方案，待 P1a-A4） | 派生与取样细则（R116） | 方案关闭，待 P1a |
| **R012** | 未关闭 → R105、R117 | 见 R105 | 方案关闭，待 P3a |
| **R013** | 未关闭 → R106、R108 | 见 R106、R108 | 方案关闭，待 P3a |
| **R014** | 未关闭 → R107 | 见 R107 | 方案关闭，待 P3a |
| **R015** | 未关闭 → R109、R119 | 见 R109 | 方案关闭，待 VS |
| **R016** | 未关闭 → R110 | 见 R110 | 方案关闭 |
| **R017** | 未关闭 → R103、R108、R111 | 见对应项 | 方案关闭，待 P3a-A0 补全结果类型 |
| R018 | 已关闭（方案，待 P1a/P8-B） | A 档帧预算分配（R120） | 方案关闭，待 P1a |
| R019 | 已关闭（方案，待 P2） | 发布描述符（R111） | 方案关闭，待 P2 |

## 二、复议

| 编号 | GPT 态度 | V0.3 落实 |
|---|---|---|
| R027-复议 | 接受，附条件：逐源初步书面审查后才允许受控处理真实数据 | 05 §6.2 第 4 条按条件改写；18 P1a-A9 增加「每个 internal 真实源已有内部使用书面审查」；19 U1 请用户确认并指定专业意见负责人 |
| R033-复议 | 接受 | 07 §5：实体拾取按屏幕优先级独立验收；B 档 oracle 改为真实三角面求交 |
| R036-复议 | 接受并撤回错误表述 | D-01 已由用户在 DEC-001 中确认 |
| R040-复议 | 接受（默认桌面优先为提案） | **用户在 DEC-001 中否决「平板仅浏览级」，iPad 定为正式平台**；全面修订见 §四 |

## 三、新意见 R101–R129

### 阻断（R101–R113）

| 编号 | 结论 | 处理（位置） | 验收 |
|---|---|---|---|
| R101 交叉表与人口分层 | 采纳 | base-geo 只存几何交叉表；scenario-raw 存同索引人口权重与**县×格整数贡献 `pop_int`**；县汇总按统计归属求和（反例 A60/B40 不再丢失）；拓扑清理（重叠归小代码、缝隙入 `unassigned`）；M2 维护「城市×格」贡献，零权重三级回退含非空间账户；县面板固定为 2020 观测（04 §4.1、06 §4.2、09 §3.3） | 04 G5a（P1）、G5b（P2）；09 §7 fixture |
| R102 gridHash 自引用与规范 JSON | 采纳 | `gridCore` 排除 gridHash、加入 `aoiSha256`；新增 **CCJ-1** 受限规范 JSON（ASCII 非数字键、重复键拒绝、仅安全整数、无 −0、字符串转义规则、无 BOM），两端自研序列化器；`manifestCore` 全部必选字段表（04 §3、06 §1.2–1.3） | P1a-A3 golden vectors |
| R103 子窗口、包链、M1 接口 | 采纳 | 窗口 `{col0,row0,cols,rows}` + 全局 TileId + `tileIndex()`；包链按发布描述符 `chain[]` 逐层加载并校验（identity、grid、window、scenario、distribution、无环、文件哈希），错误码表；补全 M1 表：AdminTable、SettlementTable、IslandTable、ComplianceData、LineageData、AssetSource、SearchHit、ViewState、PaletteId、LegendSpec；契约变更机制（04 §2.4、06 §1.4、14 §2–3、附录 A） | P1a-A3；P2 E2E |
| R104 连通性硬要求 | 采纳 | V5 改为：有向强/弱连通分量与可达矩阵报告；单/多模态不可达都允许，但每个不可达省会对与孤立城市必须进入审计例外清单（原因 + 来源 + 审计人），否则失败；禁止造边；虚拟边标 estimated，M1 不展示模型航线；车次对照改为同站对、HSR 单模式在途时间（05 §8 V5、10 §7.2） | P2-A1、P5-A1/A2 |
| R105 规范状态编码 | 采纳 | **CSE-1**：以 CCB 承载规范状态（自带 framing），段名升序、有效行显式 ID、next_id、语义头绑定世界/内容/规则版本；`state-fields.json` 字段目录与 V1 核心字段表；**写入即规范**（writeChecked）替代回合末量化，存档不改值；RNG 只在状态内（08 §2.4–2.5、§3.1；06 §7） | P3a-A0、P3a-A1 |
| R106 回放与 AI | 采纳 | 唯一回放日志 = 玩家已接受命令 + EndTurn 边界 + 终局；AI 不入日志、回放时重算；AI 观察点 = 步骤 0 之后的快照；AI 实体 ID 用确定性计数器；删除「打乱命令顺序哈希不变」测试，改为语义投影（08 §5、§6.4；12 §5.3） | P3a-A1 回放用例集 |
| R107 报价与出资账本 | 采纳 | 报价为确定性摘要，`BuildLink` 携带途经点与期望值，sim 以权威状态重算校验，不依赖 UI 缓存；出资选「承诺比例、按期原子扣款、不预扣」，取消不退已付、不凭空增钱（08 §6.3、§6.5；11 §5.1；14 §5.1） | P3a-A1；VS-A3 |
| R108 幂等与响应路由 | 采纳 | 幂等账（commandId → payloadDigest、acceptedSeq）随存档持久化；`duplicate` 不含差量；同 ID 不同内容 `COMMAND_ID_CONFLICT`；`baseTurn` / `STALE_TURN`；所有响应带 workerEpoch/gameId/reqId；宿主闸门；endTurn 前自动存档、超时恢复的回滚范围（08 §6.2；14 §6） | P3a-A2 |
| R109 库存与整数守恒 | 采纳 | 定义 I_open、损耗 W、可用供给 S、I_close 及行列守恒式；每轮按残余重算；零权重列留待后续轮；整数分配先向下取整再在残余容量内补配；进出口口岸容量；声明非最优并列入反例 fixture；本地部门无库存（11 §4.3） | VS-A3（11 §8.4 fixture 集） |
| R110 网络持久 schema | 采纳 | 完整字段表（owner、condition、资金份额 CSR、mode 0 = 非物理连接、方向性容量、容量池 PoolId、票价/货运成本单位、GeomRef 索引表、FacilityId）；未知运营归属标 unknown，游戏中归中央；渲染按 lineId 去重（10 §2.4） | P2-A1 完整性校验 |
| R111 审批展示与许可门禁 | 采纳 | 发布描述符 `release.json` 绑定应用、完整包链、content、styleHash 与公开审批信息；客户端先验描述符再绘制；许可门禁覆盖整个包链，pending/不可再分发/商业不许可一律拒绝（05 §3.2、§6.2；14 §2；17 §5） | P2-A12、P9-A4 |
| R112 门禁可形式通过 | 采纳 | P0-A1 要求全部阻断关闭或「方案关闭、指定实测阶段」；P1a 采用 PASS / DEGRADE（需 ADR + 用户批准）/ STOP 三态，报告本身不算通过（18 §3–4） | P0-A1、P1a 全部 |
| R113 阶段依赖循环 | 采纳 | 候选 R 可读性移到 P1a-A11（样例渲染器）；P3 拆为 P3a（合成）与 P3b（依赖 P2-A1）；P4 显式依赖 P2 渲染器；P5 用固定 OD 压测，全 AI 负载移到 P7；VS 明确不含政策/发展树/事件/项目/AI；P6 校准关闭的系统写明（18 §1、§4；12 §7；11 §6） | 18 依赖图 |

### 重要（R114–R127）

| 编号 | 结论 | 处理（位置） |
|---|---|---|
| R114 取整真值与 oracle | 采纳 | `SQRT3` 双精度位模式常量；「数学几何真值」与「CPU 契约真值」分开；`rhaz` 改为 floor + 小数部分比较；±1 ULP 边界向量；`mpmath` 只检验远离边界的点；实体拾取单独验收（04 §2.1、§2.3；07 §5） |
| R115 口径残留与小岛 | 采纳 | S12 改「近似 2020 年末」；`has_land` 独立有效位，不从量化面积推断；锚点不改变视觉分类（05 中「最低陆地类」删除）；面积只与同口径官方值比较（04 §4.3–4.4、05 §8 V1） |
| R116 CCB 边缘与 PRNG 细节 | 采纳 | CCB：先范围后分配、`bytes ≤ fileLength − offset`、首段无间隙、空段位置、JSON 重复键、required 一致性、最大解码字节、CRC 已知向量；ID 上限；SplitMix64 精确定义、系统 ID 全表、`nextBelow` 域与拒绝消费顺序、扩充向量；双路哈希每路 8 位补零、非密码学（06 §2、§3；08 §2.2、§2.5） |
| R117 确定性补充 | 采纳 | 新增 D10（禁 locale 比较）、D11（输入与队列确定）、D12（writeChecked）；观察者异常隔离；数学函数阈值固定（sigmoid ±40、ln 下限 1e-300）；系数以位模式入库；首个差异定位工具（08 §2.1、§2.3、§2.6） |
| R118 路由复杂度与不可达语义 | 采纳 | 可达性只用 reach 位图 + `UNREACHABLE = −1` 哨兵，禁止用 isFinite；t0 > 0；惰性删除堆；按 settle 逆序累加（不另排序）；自环 OD 本地处理；C 为本回合实际使用的成本、新拥堵下一回合生效；复杂度上界改为约 2.2×10⁸，明确 300/500 ms 未证实（10 §5；09 §3.2） |
| R119 经济口径 | 采纳 | 潜在产出计入 GDP、投入缺口下一回合降产能（滞后近似，明示）；系数非负且列和 < 1；观测 0 → A = 0；中央账户双方等额过账；负债率年化；支出优先级与无法偿债处理；tech 0.5 含义；A0 不收敛退路（11 §2–6） |
| R120 A 档整帧开销 | 采纳 | 整帧 draw/三角形分项预算表；线网按类别合批、按 lineId 去重；上传「4 MiB 且 3 ms」；片元读取估算与预烘焙 hillshade 退路；P1a-A5 测全部 Pass（07 §3.1、§5a；15 §2.1） |
| R121 chunk 接缝与纹理寻址 | 采纳 | A 档改为**全国单覆盖矩形 + 全国单张格数据/晕渲/海岸纹理**，消除跨 chunk 采样；chunk 只用于流式；锚点平面坐标持久化与附属旗标布局；B 档细节 P8 获批后冻结，降级后重新执行 LOD 邻差约束（07 §3.1、§3.4、§9） |
| R122 预算口径 | 采纳 | 统一软目标 1,070 ms（08 §5.2 修正）；工程推进、研发计入「其他」；P1a 测 exp/ln 吞吐，VS 测满规模贸易矩阵；差量单条 ≤ 4 MiB、分片、分帧应用 ≤ 4 ms/帧；冷启动报告实际字节与各环节（08 §7；15 §2） |
| R123 管线规模与 DAG | 采纳 | 10×10 源像元块预聚合、逐行椭球像元面积、u32 m² 面积、边界块按比例分割、全国守恒；误差判据改为「≥ 1 km² 相对 2%，< 1 km² 绝对 0.1 km²」；DAG 显式 42→50→62；规模重估（约 43 GiB 中间数据）；热增量分轻量/重计算两类预算（05 §5.2–5.3、§9） |
| R124 能力探针与退路 | 采纳 | 探针增加数组层数、纹理单元、renderbuffer/viewport、highp 精度、KTX2 回退、iPad 内存与热降频；WebGL2 不可用 → 不支持页，Canvas 只作 STOP 时的架构级替代；`WEBGL_lose_context` 仅测试用；4K 导出分块（02 §3；07 §7a、§8） |
| R125 撤回与缓存 | 采纳 | `release.json` no-cache；撤回 identity 返回 410；按引用计数清理共享资源；已打开页面定期复验；回退前重验审批；明确无法召回已下载文件；internal 网关覆盖直链与 CDN 缓存键（17 §5） |
| R126 人口边界 | 采纳 | `Out ≤ P`、`m0 ∈ [0, 0.05]`；95% 上限只约束新增转化；零权重三级回退；事件只作用于城市（编译器拒绝 tile.pop）；全国守恒含非模拟区域（09 §3） |
| R127 AI 预算与预注册 | 采纳 | 全局确定性扩展预算 `B_total`（计数，固定轮转分配）；报价过期跳过并统计执行率；P4 代理基准、P7 全量；种子、样本省、统计方法与例外条件预注册（12 §5.2、§8） |

### 建议（R128–R129）

| 编号 | 结论 | 处理 |
|---|---|---|
| R128 可选项与决策时点 | 采纳（因 DEC-001 调整） | M1 独立发布标准（01 §3.1、18 P2-A12）；P8 战略视图、音频、B 档显式可选；D-03 统计口径提前到 P1a、D-10 提前到 P3a；M1 不出现回合元素。**GPT 建议的「若 iPad 非正式平台则沿用桌面优先」已被 DEC-001 取代**：iPad 为正式平台，新增 D-14（参考型号）在 P1a 前确定 |
| R129 交叉引用与事实源 | 采纳 | 全量修正交叉引用（modern-2020base、06 §5 效果语言、14 §5/§6 等）；事实源层级写入 00 §3；工具与资产版本登记（03 §6）；13 估算/观测显示口径 |

## 四、DEC-001 落地清单（iPad 正式支持等）

| 分册 | 修订 |
|---|---|
| 01 | §3.1 M1 独立性与独立发布标准；§3.2 时间口径标注已确认；§6 改为桌面 + iPad 双平台表 |
| 02 | ADR-021；能力矩阵按平台探测，含 iPad 内存与热降频 |
| 07 | 画质档位新增 iPad 档；触控相机手势；触控命中半径；4K 导出分块 |
| 13 | §2.3 桌面/iPad 功能对照表（悬停→长按、右键→长按菜单、线路规划点选 + 撤销）、安全区、触控目标、后台存档 |
| 14 | §6.3 输入抽象 `PointerIntent`；endTurn 超时 iPad 60 s；后台/内存告警自动存档 |
| 15 | §1 iPad 参考设备（候选，D-14）；§3 iPad 预算与测量项（P1a 实测定） |
| 16 | iPad 真机测试层与 §4a 清单；E2E 桌面 + iPad 各一遍 |
| 18 | P1a 起各阶段均含 iPad 真机项；P2-A10、P3a-A5、VS-A1、P7-A3/A4、P9-A1 |
| 19 | 已确认决策表；D-14；R-15、R-16 |

## 五、需要用户确认的事项

1. **D-14**：iPad 参考设备的具体型号（入门档、高档各一台），需在 P1a 开始前确定。
2. **U1**：内部使用真实数据的条件（05 §6.2 第 4 条），以及由谁负责取得专业意见（D-13）。
3. **D-08**：是否商业化（P1a 前）。
4. **D-03**：台港澳在 M1 面板中的统计口径展示方式（P1a 前）。

---

<!-- 文件：CHANGELOG.md -->

# 变更记录：V0.2 → V0.3（2026-11-27）

依据：GPT-6.2 第二次审查（R101–R129、旧阻断复核、4 条复议）+ 项目负责人决策 DEC-001。逐条对应见 `20-review-response.md`。

## 一、用户决策落地（DEC-001）
1. D-01、D-09、D-11、D-12 标为「用户已确认」（00、01、07、19）。
2. **iPad 成为正式平台**：完整触控、M1/M2 核心功能可用、iPadOS Safari 真机为正式验收、iPad 单独预算（01 §6、02 §3、07 §3.6/§5/§7、13 §2.3、14 §6.3、15 §3、16 §4a、18 各阶段、19 R-15/R-16、ADR-021）。新增 D-14（iPad 参考型号）。
3. M1 独立运行/展示/验收与独立发布标准；不为 M2 牺牲 M1（01 §3.1、18 P2-A11/A12）。
4. 终局定义：完成第 120 次结算后进入终局（01 §3.2、08 §5）。

## 二、阻断项修订
5. 交叉表分层：几何（base-geo）/ 人口权重与县×格整数贡献（scenario-raw）；拓扑清理；M2 城市×格贡献（R101）。
6. gridCore 与 CCJ-1 规范 JSON；manifestCore 必选字段表（R102）。
7. 窗口包、全局 TileId、包链加载与错误码；M1 表与接口类型补全（R103）。
8. 连通性审计例外清单；HSR 同站对照（R104）。
9. CSE-1 规范状态编码；state-fields.json；写入即规范（R105）。
10. 回放日志 = 玩家命令 + EndTurn 边界，AI 重算（R106）。
11. 确定性报价重算；按期原子扣款的单一出资账本（R107）。
12. 幂等账持久化、duplicate 无差量、baseTurn、epoch/gameId 响应、宿主闸门、自动存档恢复点（R108）。
13. 库存与整数守恒的贸易分配，非最优声明（R109）。
14. 网络完整持久 schema（owner、资金 CSR、容量池、GeomRef、方向容量）（R110）。
15. 发布描述符 release.json 与全包链许可门禁（R111）。
16. 门禁三态 PASS/DEGRADE/STOP；P0-A1 阻断关闭规则（R112）。
17. 路线依赖修正：P1a-A11 候选 R 可读性、P3a/P3b 拆分、VS 范围收窄、P5 固定 OD、全 AI 负载移 P7（R113）。

## 三、重要与建议项
18. SQRT3 位模式、CPU 契约真值、rhaz 新实现、±1 ULP 向量（R114）。
19. has_land 独立位、锚点不改视觉分类、同口径面积对照（R115）。
20. CCB 边缘规则、SplitMix64 与 Lemire 细则、ID 上限（R116）。
21. 确定性规则 D10–D12、数学阈值固定、差异定位工具（R117）。
22. reach 位图与 UNREACHABLE 哨兵、惰性删除堆、settle 逆序加载、复杂度上界重估（R118）。
23. 潜在产能滞后近似、系数约束、中央账户等额过账、支出优先级（R119）。
24. A 档整帧预算分项、线网合批、上传双条件（R120）。
25. A 档全国单覆盖 + 全国纹理，消除 chunk 接缝；锚点坐标持久化（R121）。
26. 软目标统一 1,070 ms；差量分片与分帧应用（R122）。
27. 管线预聚合细则、误差判据、DAG 显式依赖、热增量分类（R123）。
28. 能力探针扩充、Canvas 仅为 STOP 替代（R124）。
29. 撤回：410、引用计数、会话复验、能力边界说明（R125）。
30. 人口模型边界与事件方向（R126）。
31. AI 全局扩展预算与预注册（R127）。
32. 可选项与决策时点调整（R128）；交叉引用与事实源层级、工具登记（R129）。

## 四、新增 ADR
ADR-021 双平台；ADR-022 CCJ-1；ADR-023 CSE-1；ADR-024 回放日志；ADR-025 出资账本；ADR-026 发布描述符；ADR-027 三态门禁。修订：ADR-017、ADR-020。
