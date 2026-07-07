import { AIResearchTask } from './types';

// API 配置和接口封装
// 使用环境变量 VITE_API_BASE_URL，未设置时回落到本地默认
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:9000/api';

// 检查是否为开发模式（使用 VITE_APP_ENV 更可靠）
const isDevelopment = import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

console.log('🌐 API_BASE_URL:', API_BASE_URL, '| isDevelopment:', isDevelopment);

// ================== 模拟数据（无后端时使用） ==================
const MOCK_ENABLED = true; // 无后端时启用模拟数据

const mockUsers = [
  { id: '31784', name: '耿博琳', email: 'gengbolin@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/31784/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10001', name: '高琳', email: 'gaolin@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10001/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10002', name: '丁玉萍', email: 'dingyuping@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10002/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10003', name: '张灵玉', email: 'zhanglingyu@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10003/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10004', name: '傅中南', email: 'fuzhongnan@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10004/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10005', name: '程宇亮', email: 'chengyuliang@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10005/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10006', name: '聂茜茜', email: 'nieqianqian@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10006/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10007', name: '董诗昀', email: 'dongshiyun@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10007/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10008', name: '胡丽婷', email: 'huliting@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10008/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
  { id: '10009', name: '王琳琳', email: 'wanglinlin@kingsoft.com', avatarUrl: 'https://picsum.photos/seed/10009/40/40', deptId: 101, deptName: '市场和行政部/行政部' },
];

const mockOkrSets = [
  {
    periodId: '2026-H2',
    periodName: '2026下半年',
    okrs: [
      { id: 'okr1', objective: '提升行政管理效率与数字化水平', keyResults: [
        { id: 'okr1::kr1', sequence: 'kr1', description: '行政流程线上化率达到80%' },
        { id: 'okr1::kr2', sequence: 'kr2', description: '办公成本降低15%' },
        { id: 'okr1::kr3', sequence: 'kr3', description: '员工满意度评分提升至4.5/5' },
      ]},
      { id: 'okr2', objective: '优化办公环境与员工服务体验', keyResults: [
        { id: 'okr2::kr1', sequence: 'kr1', description: '办公空间利用率提升20%' },
        { id: 'okr2::kr2', sequence: 'kr2', description: '行政服务响应时间缩短至2小时内' },
      ]},
      { id: 'okr3', objective: '强化行政安全保障体系', keyResults: [
        { id: 'okr3::kr1', sequence: 'kr1', description: '安全管理零事故' },
        { id: 'okr3::kr2', sequence: 'kr2', description: '完成3次以上安全演练' },
      ]},
    ]
  }
];

const mockProjects = [
  { id: 'p1', name: '行政管理系统升级', priority: '部门OKR', businessBackground: '现有行政管理系统版本老旧，需升级至新一代平台', keyResultIds: ['okr1::kr1'], weeklyUpdate: '本周完成需求评审，进入开发阶段。前端页面已完成80%，后端接口对接中。', lastWeekUpdate: '上周完成技术方案设计', status: '开发中', owners: [{ userId: '10001', timeSlots: [{ id: 'ts1', startDate: '2026-07-01', endDate: '2026-08-15' }] }], proposedDate: '2026-07-01', completionDate: null, createdAt: '2026-06-01T00:00:00Z', followers: [], comments: [], changeLog: [], documents: [] },
  { id: 'p2', name: '办公成本优化项目', priority: '部门OKR', businessBackground: '通过数字化手段降低日常办公成本', keyResultIds: ['okr1::kr2'], weeklyUpdate: '完成供应商报价对比分析，已筛选出3家优质供应商。预计下月可节省采购成本约8%。', lastWeekUpdate: '收集供应商报价信息', status: '进行中', owners: [{ userId: '10002', timeSlots: [{ id: 'ts2', startDate: '2026-06-15', endDate: '2026-09-30' }] }], proposedDate: '2026-06-15', completionDate: null, createdAt: '2026-06-01T00:00:00Z', followers: [], comments: [], changeLog: [], documents: [] },
  { id: 'p3', name: '员工满意度调查系统', priority: '个人OKR', businessBackground: '建立定期员工满意度调查机制', keyResultIds: ['okr1::kr3'], weeklyUpdate: '问卷系统开发完成，已进行内部测试。下周计划在3个部门试点推广。', lastWeekUpdate: '完成问卷模板设计', status: '测试中', owners: [{ userId: '10003', timeSlots: [{ id: 'ts3', startDate: '2026-06-01', endDate: '2026-07-31' }] }], proposedDate: '2026-06-01', completionDate: null, createdAt: '2026-05-20T00:00:00Z', followers: [], comments: [], changeLog: [], documents: [] },
  { id: 'p4', name: '智能办公空间管理平台', priority: '部门OKR', businessBackground: '实现会议室和工位的智能化管理', keyResultIds: ['okr2::kr1'], weeklyUpdate: '完成传感器部署方案，与IoT团队对齐技术规范。预计下两周完成首层办公区设备安装。', lastWeekUpdate: '完成技术选型', status: '开发中', owners: [{ userId: '10004', timeSlots: [{ id: 'ts4', startDate: '2026-07-01', endDate: '2026-10-31' }] }], proposedDate: '2026-07-01', completionDate: null, createdAt: '2026-06-15T00:00:00Z', followers: [], comments: [], changeLog: [], documents: [] },
  { id: 'p5', name: '行政服务工单系统', priority: '部门OKR', businessBackground: '建立行政服务在线工单系统，提升响应效率', keyResultIds: ['okr2::kr2'], weeklyUpdate: '工单系统已上线试运行，首周收到52个工单，平均响应时间1.5小时，达标率95%。', lastWeekUpdate: '系统上线部署', status: '本周已上线', owners: [{ userId: '10005', timeSlots: [{ id: 'ts5', startDate: '2026-05-15', endDate: '2026-07-05' }] }], proposedDate: '2026-05-15', completionDate: '2026-07-05', createdAt: '2026-05-01T00:00:00Z', followers: [], comments: [], changeLog: [], documents: [] },
  { id: 'p6', name: '消防安全演练', priority: '部门OKR', businessBackground: '组织半年度消防安全演练', keyResultIds: ['okr3::kr1', 'okr3::kr2'], weeklyUpdate: '本周完成演练方案制定和人员分组安排。已联系消防大队确认指导事宜，暂定7月20日执行。', lastWeekUpdate: '确认演练时间', status: '讨论中', owners: [{ userId: '10001', timeSlots: [{ id: 'ts6', startDate: '2026-07-01', endDate: '2026-07-25' }] }], proposedDate: '2026-07-01', completionDate: null, createdAt: '2026-06-20T00:00:00Z', followers: [], comments: [], changeLog: [], documents: [] },
  { id: 'p7', name: '访客管理系统更新', priority: '临时重要需求', businessBackground: '配合安全合规要求，更新访客登记流程', keyResultIds: ['okr3::kr1'], weeklyUpdate: '新访客流程已完成开发，正在进行安全审查。预计下周可上线。', lastWeekUpdate: '开发访客登记功能', status: '测试中', owners: [{ userId: '10003', timeSlots: [{ id: 'ts7', startDate: '2026-06-20', endDate: '2026-07-15' }] }], proposedDate: '2026-06-20', completionDate: null, createdAt: '2026-06-10T00:00:00Z', followers: [], comments: [], changeLog: [], documents: [] },
  { id: 'p8', name: '办公绿植养护服务', priority: '日常需求', businessBackground: '优化办公区域绿植养护方案', keyResultIds: [], weeklyUpdate: '与新的绿植供应商签约，本周已更换3楼和5楼的绿植。', lastWeekUpdate: '供应商比选', status: '进行中', owners: [{ userId: '10002', timeSlots: [{ id: 'ts8', startDate: '2026-06-01', endDate: '2026-12-31' }] }], proposedDate: '2026-06-01', completionDate: null, createdAt: '2026-05-25T00:00:00Z', followers: [], comments: [], changeLog: [], documents: [] },
];

const mockWeeklyReports = [
  {
    id: 'wr-2026-w27',
    weekYear: 2026,
    weekNumber: 27,
    startDate: '2026-07-06',
    endDate: '2026-07-10',
    status: 'editing',
    summary: `第27周行政周报\n\n大行政模块重点：\n1. 2025双刊项目——整体进度：故事集全员征集阶段已结束，相册设计方案沟通确认中，持续优化素材细节\n2. 智能数据推送项目——需求文档已完成定稿并完成对接，数据接口调试通过，可视化小原型已产出\n3. 差旅制度修订——完成修订初稿，征集各部门反馈意见\n\n高管支持模块重点：\n1. 高管日程协调及访客接待\n2. 跨部门信息同步及周报收集\n3. 资产管理采购支持与学习`,
    content: {
      modules: [
        {
          moduleId: 'daxingzheng',
          moduleName: '大行政',
          entries: [
            {
              personId: '31784', personName: '耿博琳',
              responsibility: '职场管理（北京+异地）\n行政数字化、文化运营',
              supportedExecutives: '/',
              thisWeekTop3: [
                { number: 1, text: '2025双刊项目', subItems: [
                  '整体进度：故事集全员征集阶段已结束，相册设计优化过程中，持续优化设计及素材细节',
                  '时光相册：完成第二版设计方案的沟通与确认，补充五周年、十周年、全员大合影等核心素材',
                  '故事集：完成面向全员的征集环节，整体参与度较低，本周转向并完成了对管理层的定向约稿',
                ] },
                { number: 2, text: '智能数据推送项目', subItems: [
                  '需求文档已完成定稿并与BI中心、技术委员会完成对接',
                  '用车及差旅数据接口已调试通过，整体数据基础已打通',
                  '已产出可视化小原型，优化交互细节中',
                  '推送方式已确定为协作订阅号，可保证稳定性',
                ] },
                { number: 3, text: '其他跨部门沟通工作', subItems: [] },
              ],
              dailyRoutineWork: '行政制度审核\n会议安排协调',
              nextWeekTop3: [
                { number: 1, text: '2025双刊项目', subItems: ['继续优化相册设计细节', '推进故事集内容编辑'] },
                { number: 2, text: '智能数据推送项目', subItems: ['完成订阅号配置及测试', '推动更多数据源接入'] },
                { number: 3, text: '差旅制度修订', subItems: ['完成修订终稿', '提交审批'] },
              ],
              issuesAndCrossDept: '数据推送需IT部门协助API对接，已沟通排期',
            },
            {
              personId: '10001', personName: '高琳',
              responsibility: '行政数字化后台相关',
              supportedExecutives: '/',
              thisWeekTop3: [
                { number: 1, text: '儿童节礼品', subItems: ['登记补70套，收尾，申请预算'] },
                { number: 2, text: '甩肉大赛', subItems: ['收尾总结、发奖牌', '报名343人，总减重1411.2KG，目前单人减重率：16.18%，团队减重总数：62.8斤'] },
                { number: 3, text: '家庭日/端午/公益', subItems: ['家庭日收尾，活动回顾发出', '端午手工DIY活动', '整理北京公益内容'] },
              ],
              dailyRoutineWork: '行政服务台：本周创建工单数57个，其中人工工单数19，机器人拦截工单数38，100%',
              nextWeekTop3: [
                { number: 1, text: '家庭日活动', subItems: ['完成活动总结及宣发'] },
                { number: 2, text: '端午节活动', subItems: ['执行端午手工DIY活动'] },
                { number: 3, text: '公益内容整理', subItems: ['完成北京公益内容输出'] },
              ],
              issuesAndCrossDept: '/',
            },
            {
              personId: '10002', personName: '丁玉萍',
              responsibility: '行政数字化后台相关',
              supportedExecutives: '/',
              thisWeekTop3: [
                { number: 1, text: '费用结算', subItems: [
                  '月结凭证整理对账：机票费用完成对账提报中',
                  '顺丰IDC账单对账中、分贝通凭证问题跟进',
                  'AI账单发送配合对账、社团场地费充值',
                ] },
                { number: 2, text: '平台方面', subItems: [
                  '差旅平台问题处理、5月底员工三项额度录入',
                  '差旅问题处理、滴滴问题处理',
                ] },
                { number: 3, text: '其他', subItems: [
                  '协议酒店：单体签约覆盖5城19家，已全部托管上线',
                  '健康体检：预计630开启，配合供应链招标流程',
                  '相册素材优化：6.9素材全部提交完成',
                  '滴滴敏感订单手动定向推送，预计下月启用',
                ] },
              ],
              dailyRoutineWork: '日常费用对账及提报\n差旅平台问题处理',
              nextWeekTop3: [
                { number: 1, text: '费用结算', subItems: ['继续月结凭证整理', '完成机票费用提报'] },
                { number: 2, text: '健康体检', subItems: ['推进招标流程', '确认技术条款'] },
                { number: 3, text: '协议酒店', subItems: ['等设计稿输出年度协议酒店信息'] },
              ],
              issuesAndCrossDept: '分贝通凭证问题需财务部门配合跟进',
            },
            {
              personId: '10003', personName: '张灵玉',
              responsibility: '职场运营、文化运营',
              supportedExecutives: '/',
              thisWeekTop3: [
                { number: 1, text: '职场运营——北京', subItems: [
                  '维修部分：6-11层茶水间吊顶维修，6-8层连廊电路维修，已完成',
                  '车位：4.56月均预留3个访客车位，6月底大摇预计6月24号',
                ] },
                { number: 2, text: '职场运营——上海', subItems: [
                  '日常行政事务/下午茶等支持',
                  '职场相关费用提报付款',
                ] },
                { number: 3, text: '福利', subItems: [
                  '端午全员礼：北京武汉及异地已全部发放完毕',
                  '五周年金钞：年中大会暂未确定地点',
                  '下午茶：端午节粽子下午茶',
                ] },
              ],
              dailyRoutineWork: '北京上海两地职场日常维护\n费用提报付款',
              nextWeekTop3: [
                { number: 1, text: '北京职场维护', subItems: ['6月底大摇号', '日常维修跟进'] },
                { number: 2, text: '五周年金钞', subItems: ['跟进年中大会地点确认', '外包装邮寄至北京'] },
                { number: 3, text: '端午礼品', subItems: ['联系未登记默认领取的异地员工'] },
              ],
              issuesAndCrossDept: '/',
            },
            {
              personId: '10004', personName: '傅中南',
              responsibility: '行政：异地办公室管理\n总办支持',
              supportedExecutives: '/',
              thisWeekTop3: [
                { number: 1, text: '异地职场', subItems: [
                  '庆阳：文化墙已确定方案，待供应商施工，前台墙体方案已确认待施工',
                  '兰州：租赁合同商务条款沟通中，计划8月1起租，需在8.1前确定装修商',
                  '上海：整合最新资源情况，待政企反馈下周踏勘时间',
                  '异地职场费用提报',
                ] },
                { number: 2, text: '总办', subItems: [
                  '公务车：庆阳武汉公务车已上牌，兰州车款已付正在匹配车辆',
                  '流程：规章制度及责任承担协议已定稿，测试无问题后计划节前上线',
                  '运营：珠海园区停车位租赁，北京预留一个车位',
                ] },
                { number: 3, text: '一级班子及文化相关', subItems: [
                  '一级班子：本周凯博、韩博生日',
                  '文化衫：衣架、防尘罩定制大货已到，文化衫大货预计下周到',
                  'PR照：先行签署合作协议，时间待定',
                ] },
              ],
              dailyRoutineWork: '异地职场费用提报\n公务车管理跟进',
              nextWeekTop3: [
                { number: 1, text: '兰州租赁', subItems: ['催促邹总审批预算外邮件', '联系物业了解进场要求'] },
                { number: 2, text: '公务车', subItems: ['深圳公务车上牌', '流程节前上线'] },
                { number: 3, text: '文化衫', subItems: ['大货到货验收分发'] },
              ],
              issuesAndCrossDept: '兰州租赁预算需邹总审批，商务条款沟通中\n上海踏勘待政企反馈时间',
            },
            {
              personId: '10005', personName: '程宇亮',
              responsibility: '行政运营（武汉）',
              supportedExecutives: '/',
              thisWeekTop3: [
                { number: 1, text: '露台改造', subItems: [
                  '需求调整：确定集装箱、部分家具、舞台区域为高优先级',
                  '现有进度：已进入筹备供应商招标，确定供应商应标材料及评分标准',
                ] },
                { number: 2, text: '福利活动', subItems: [
                  '武汉家庭日：动员分工、现场搭建盯场、活动统筹执行',
                  '到场90组、报名120组家庭，限制前100组',
                  '集团运动会：活动现场支持',
                ] },
                { number: 3, text: '星云训练营/库存系统', subItems: [
                  '训练营：暂定7月10日入职，7月12日开营，人数初步90人',
                  '库存系统：完成PRD需求文档2.0版本，目前输出2.0产品原型',
                ] },
              ],
              dailyRoutineWork: '空调延时申请已发邮件\n定制类物品：矿泉水200件、抽纸盒、指示牌',
              nextWeekTop3: [
                { number: 1, text: '露台改造', subItems: ['完成供应商评标', '确定施工方案及排期'] },
                { number: 2, text: '星云训练营', subItems: ['办理新员工入职', '开营仪式准备'] },
                { number: 3, text: '库存系统', subItems: ['完成2.0产品原型输出'] },
              ],
              issuesAndCrossDept: '空调延时需集团回复，可能加能耗表计费',
            },
            {
              personId: '10006', personName: '聂茜茜',
              responsibility: '行政运营（武汉）',
              supportedExecutives: '/',
              thisWeekTop3: [
                { number: 1, text: '家庭日活动的落地完成及收尾工作', subItems: [
                  '前期分工宣贯、保险信息收集等',
                  '场地方合同确认中，无误后完成盖章和结算',
                  '微信公众号宣发收尾',
                ] },
                { number: 2, text: 'Q2生日会——minions party', subItems: [
                  '方案策划基本完成，小黄人ip搭建主题',
                  '礼品完成选品下单，覆盖季度寿星人数87%以上',
                ] },
                { number: 3, text: '公益活动输出', subItems: [
                  '武汉、北京已完成资料输出',
                  '端午手工活动物资已采买',
                ] },
              ],
              dailyRoutineWork: '月度费用整理\n服务台答疑',
              nextWeekTop3: [
                { number: 1, text: 'Q2生日会执行', subItems: ['活动现场统筹', '礼品发放'] },
                { number: 2, text: '端午手工活动', subItems: ['举办端午手工DIY活动'] },
                { number: 3, text: '公益活动完善', subItems: ['修改初版意见', '完成最终版'] },
              ],
              issuesAndCrossDept: '/',
            },
            {
              personId: '10007', personName: '董诗昀',
              responsibility: '行政运营（武汉）',
              supportedExecutives: '/',
              thisWeekTop3: [
                { number: 1, text: '职场相关', subItems: [
                  '武汉职场矿泉水定制已提PR流程',
                  '对电子流名片申请、工卡维护进行线上流程配置',
                  '一楼职场租赁合同集团已走完盖章，武汉续租合同由季付变为月付',
                  '端午节礼品发放，目前还有46位同学仍未领取',
                  '武汉职场2-5层工椅数量明细统计',
                ] },
                { number: 2, text: '物业相关', subItems: [
                  '统计截止目前职场所有报事报修问题',
                  '计划协同大小物业开展Q2季度报修进度拉起会',
                  '工区日常巡查',
                ] },
                { number: 3, text: '其他', subItems: [] },
              ],
              dailyRoutineWork: '工区日常巡查\n费用整理',
              nextWeekTop3: [
                { number: 1, text: 'Q2报修进度拉起会', subItems: ['协同大小物业召开会议'] },
                { number: 2, text: '端午礼品', subItems: ['催促46位未领取同学领取'] },
                { number: 3, text: '职场统计', subItems: ['完成工椅数量明细统计'] },
              ],
              issuesAndCrossDept: '/',
            },
            {
              personId: '10008', personName: '胡丽婷',
              responsibility: '行政运营（深圳）',
              supportedExecutives: '王羲桀（base深圳，非总办）',
              thisWeekTop3: [
                { number: 1, text: '职场运营相关', subItems: [
                  '深圳职场日常环境维护：环境巡检、每日下午茶准备，每月零食柜补充',
                  '职场装修：采购pr已提交，总预算10万，期望最晚交付时间7月底',
                  '续租租赁保证金差额75456已退回公司',
                  '端午礼盒款式一已全部发放完毕，款式二运输中预计下周一前发放完',
                ] },
                { number: 2, text: '政府项目申报&补贴相关', subItems: [
                  '高新技术企业认证：目前完成申报前期附件资料',
                  '技术转移项目：已公示进入拨款阶段，补贴金额25万',
                ] },
                { number: 3, text: '羲桀总日常事务支持 + 部门协助', subItems: [
                  '日常会议组织安排、访客接待、报销工作',
                  '企微申请及完成企业认证，协助AIPC部门加班餐食报销',
                ] },
              ],
              dailyRoutineWork: '人力侧：协助入职&办理工牌\n财务侧：百望云开票系统每日登录&开票\n法务侧：合同章管理',
              nextWeekTop3: [
                { number: 1, text: '职场装修', subItems: ['跟进采购审批流程'] },
                { number: 2, text: '政府补贴', subItems: ['技术转移项目资料提交'] },
                { number: 3, text: '端午礼盒', subItems: ['完成款式二发放'] },
              ],
              issuesAndCrossDept: '企微企业认证需AIPC部门协助',
            },
          ]
        },
        {
          moduleId: 'gaoguanzhichi',
          moduleName: '高管支持',
          entries: [
            {
              personId: '10009', personName: '王琳琳',
              responsibility: '/',
              supportedExecutives: '田开颜\n李翊\n王首虎\n崔丽',
              thisWeekTop3: [
                { number: 1, text: '高管支持', subItems: [
                  'Rex：出差规划与安排，招待安排；供应商拜访安排；部门例会以及其他重要代办事项进度跟进',
                  '李翊：日程安排、用餐安排、访客接待',
                  '崔丽：物品采购；用餐安排；其他临时安排的事项处理',
                  '王首虎：物品闪送邮寄，以及其他临时安排的事务',
                ] },
                { number: 2, text: '支持部门', subItems: [
                  '部门事务支持工作、部门其他事务安排与处理；部门内部聚餐安排',
                  '各部门例会支持，周报收集以及其他材料整理安排，部门事务支持协助',
                ] },
                { number: 3, text: '资产管理采购支持与学习', subItems: [] },
              ],
              dailyRoutineWork: '高管日程协调\n周报收集及材料整理\n访客接待安排',
              nextWeekTop3: [
                { number: 1, text: '高管日程排期', subItems: ['确认下周各高管行程'] },
                { number: 2, text: '部门例会支持', subItems: ['周报收集', '会议纪要整理'] },
                { number: 3, text: '资产管理采购', subItems: ['学习采购流程', '协助资产盘点'] },
              ],
              issuesAndCrossDept: '/',
            },
          ]
        }
      ]
    },
    generatedBy: 'system',
    createdAt: '2026-07-06T09:00:00Z',
    updatedAt: '2026-07-06T14:30:00Z'
  },
  {
    id: 'wr-2026-w26',
    weekYear: 2026,
    weekNumber: 26,
    startDate: '2026-06-29',
    endDate: '2026-07-03',
    status: 'finalized',
    summary: `第26周周报\n\n大行政模块：\n- 2025双刊项目：完成技术方案设计\n- 智能数据推送：数据接口调试中\n- 差旅制度：征集各部门反馈\n\n高管支持模块：\n- 高管日程协调\n- 部门例会支持`,
    content: { modules: [] },
    generatedBy: 'system',
    createdAt: '2026-06-29T09:00:00Z',
    updatedAt: '2026-06-29T14:00:00Z'
  }
];

const mockWeeklyReportVersions = [
  {
    id: 'wrv-2026-w27-v1',
    reportId: 'wr-2026-w27',
    weekYear: 2026,
    weekNumber: 27,
    versionNo: 1,
    content: { modules: [] },
    summary: `第27周周报（初版）\n\n大行政模块重点：\n- 双刊项目推进中\n- 智能数据推送开发中\n- 差旅制度修订进行中`,
    generatedBy: 'system',
    archivedAt: '2026-07-06T14:25:00Z'
  }
];

// 模拟数据拦截 - 当后端不可用时直接返回模拟数据（不尝试真实请求避免超时）
const withMockFallback = async <T>(endpoint: string, mockData: T, originalFn: () => Promise<T>): Promise<T> => {
  if (!MOCK_ENABLED) return originalFn();
  // 直接返回模拟数据，无需等待后端超时
  console.log(`📦 Using mock data for: ${endpoint}`);
  return mockData;
};

// 简单的内存缓存
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private cache = new Map<string, CacheItem<unknown>>();
  private readonly TTL = 5 * 60 * 1000; // 5分钟缓存

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  // 清除特定前缀的缓存
  clearPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // 删除特定缓存
  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const apiCache = new APICache();

// 获取JWT token
const getJWTToken = () => {
  return localStorage.getItem('jwt_token');
};

// 统一的请求处理函数
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // 添加JWT认证头（如果存在）
  const jwtToken = getJWTToken();
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // 如果是401错误，可能需要重新登录
    if (response.status === 401) {
      console.error('JWT token expired or invalid, redirecting to login...');
      // 清除过期的token
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('oidc_user');
      localStorage.removeItem('oidc_token');
      // 重新加载页面触发OIDC登录
      window.location.reload();
      throw new Error('Authentication expired, please log in again');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// API 请求封装
export const api = {
  // 获取用户信息
  async getUser() {
    return withMockFallback('/user', mockUsers[0], () => makeRequest('/user'));
  },

  // 获取用户列表（带缓存）
  async fetchUsers(useCache = true) {
    const cacheKey = 'users';
    if (useCache) {
      const cached = apiCache.get<unknown[]>(cacheKey);
      if (cached) {
        console.log('📦 Using cached users data');
        return cached;
      }
    }
    const endpoint = isDevelopment ? '/dev/users' : '/users';
    const data = await withMockFallback(endpoint, mockUsers, () => makeRequest(endpoint));
    const safeData = Array.isArray(data) ? data : (data ?? []);
    apiCache.set(cacheKey, safeData);
    return safeData;
  },

  // 获取项目列表（带缓存）
  async getProjects(useCache = true) {
    const cacheKey = 'projects';
    if (useCache) {
      const cached = apiCache.get<unknown[]>(cacheKey);
      if (cached) {
        console.log('📦 Using cached projects data');
        return cached;
      }
    }
    const endpoint = isDevelopment ? '/dev/projects' : '/projects';
    const data = await withMockFallback(endpoint, mockProjects, () => makeRequest(endpoint));
    const safeData = Array.isArray(data) ? data : (data ?? []);
    apiCache.set(cacheKey, safeData);
    return safeData;
  },

  // 获取项目列表（别名）
  async fetchProjects(useCache = true) {
    return this.getProjects(useCache);
  },

  // 获取项目详情（包含变更记录等完整信息）
  async getProjectDetail(projectId: string) {
    const endpoint = isDevelopment ? `/dev/projects/${projectId}` : `/projects/${projectId}`;
    const mockProject = mockProjects.find(p => p.id === projectId) || mockProjects[0];
    return withMockFallback(endpoint, mockProject, () => makeRequest(endpoint));
  },

  // 获取OKR集合（带缓存）
  async fetchOkrSets(useCache = true) {
    const cacheKey = 'okrSets';
    if (useCache) {
      const cached = apiCache.get<unknown[]>(cacheKey);
      if (cached) {
        console.log('📦 Using cached OKR sets data');
        return cached;
      }
    }
    const endpoint = isDevelopment ? '/dev/okr-sets' : '/okr-sets';
    const data = await withMockFallback(endpoint, mockOkrSets, () => makeRequest(endpoint));
    const safeData = Array.isArray(data) ? data : (data ?? []);
    apiCache.set(cacheKey, safeData);
    return safeData;
  },

  // 创建OKR集合
  async createOkrSet(okrSet: any) {
    const endpoint = isDevelopment ? '/dev/okr-sets' : '/okr-sets';
    const result = await makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(okrSet),
    });
    // 清除缓存
    apiCache.delete('okrSets');
    return result;
  },

  // 更新OKR集合
  async updateOkrSet(periodId: string, okrSet: any) {
    const endpoint = isDevelopment ? `/dev/okr-sets/${periodId}` : `/okr-sets/${periodId}`;
    const result = await makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(okrSet),
    });
    // 清除缓存
    apiCache.delete('okrSets');
    return result;
  },

  // 执行周度滚动
  async performWeeklyRollover() {
    const endpoint = isDevelopment ? '/dev/perform-weekly-rollover' : '/perform-weekly-rollover';
    return makeRequest(endpoint, {
      method: 'POST',
    });
  },

  // 用户登录
  async login(credentials: any) {
    return makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // 检查认证状态
  async checkAuth() {
    return makeRequest('/check-auth');
  },

  // OIDC令牌交换
  async oidcTokenExchange(token: any) {
    return makeRequest('/oidc-token', {
      method: 'POST',
      body: JSON.stringify(token),
    });
  },

  // 获取任务列表
  async getTasks() {
    return makeRequest('/tasks');
  },

  // 创建项目
  async createProject(project: any) {
    const endpoint = isDevelopment ? '/dev/projects' : '/projects';
    console.log('📡 API createProject - endpoint:', endpoint, 'isDevelopment:', isDevelopment);
    return makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  // 更新项目
  async updateProject(id: string, project: any) {
    const endpoint = isDevelopment ? `/dev/projects/${id}` : `/projects/${id}`;
    return makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(project),
    });
  },

  // 删除项目
  async deleteProject(id: string) {
    const endpoint = isDevelopment ? `/dev/projects/${id}` : `/projects/${id}`;
    return makeRequest(endpoint, {
      method: 'DELETE',
    });
  },

  // 创建任务
  async createTask(task: any) {
    return makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  // 更新任务
  async updateTask(id: string, task: any) {
    return makeRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  // 删除任务
  async deleteTask(id: string) {
    return makeRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // 刷新用户数据
  async refreshUsers() {
    return makeRequest('/refresh-users', {
      method: 'POST',
    });
  },

  // 同步员工数据
  async syncEmployees() {
    return makeRequest('/sync-employees', {
      method: 'POST',
    });
  },

  // AI研究任务相关API
  // 获取所有AI研究任务
  async fetchAIResearchTasks(): Promise<AIResearchTask[]> {
    const endpoint = isDevelopment ? '/dev/ai-research-tasks' : '/ai-research-tasks';
    return makeRequest(endpoint);
  },

  // 创建AI研究任务
  async createAIResearchTask(task: Omit<AIResearchTask, 'id'>): Promise<AIResearchTask> {
    const endpoint = isDevelopment ? '/dev/ai-research-tasks' : '/ai-research-tasks';
    return makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  // 更新AI研究任务
  async updateAIResearchTask(taskId: string, updates: Partial<AIResearchTask>): Promise<void> {
    const endpoint = isDevelopment
      ? `/dev/ai-research-tasks/${taskId}`
      : `/ai-research-tasks/${taskId}`;
    return makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // 删除AI研究任务
  async deleteAIResearchTask(taskId: string): Promise<void> {
    const endpoint = isDevelopment
      ? `/dev/ai-research-tasks/${taskId}`
      : `/ai-research-tasks/${taskId}`;
    return makeRequest(endpoint, {
      method: 'DELETE',
    });
  },

  // ================== 周报相关 API ==================

  // 获取周报列表
  async fetchWeeklyReports() {
    const endpoint = isDevelopment ? '/dev/weekly-reports' : '/weekly-reports';
    const data = await withMockFallback(endpoint, mockWeeklyReports, () => makeRequest(endpoint));
    return Array.isArray(data) ? data : [];
  },

  // 获取指定周的周报
  async fetchWeeklyReportByWeek(year: number, week: number) {
    const endpoint = isDevelopment
      ? `/dev/weekly-reports/${year}/${week}`
      : `/weekly-reports/${year}/${week}`;
    const mockReport = mockWeeklyReports.find(r => r.weekYear === year && r.weekNumber === week);
    return withMockFallback(endpoint, mockReport || mockWeeklyReports[0], () => makeRequest(endpoint));
  },

  // 生成周报
  async generateWeeklyReport() {
    const endpoint = isDevelopment ? '/dev/weekly-reports/generate' : '/weekly-reports/generate';
    return withMockFallback(endpoint, mockWeeklyReports[0], () => makeRequest(endpoint, { method: 'POST' }));
  },

  // 更新周报
  async updateWeeklyReport(reportId: string, updates: any) {
    const endpoint = isDevelopment
      ? `/dev/weekly-reports/${reportId}`
      : `/weekly-reports/${reportId}`;
    const mockReport = mockWeeklyReports.find(r => r.id === reportId) || mockWeeklyReports[0];
    return withMockFallback(endpoint, { ...mockReport, ...updates }, () => makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }));
  },

  // 重新生成周报
  async regenerateWeeklyReport(reportId: string) {
    const endpoint = isDevelopment
      ? `/dev/weekly-reports/regenerate/${reportId}`
      : `/weekly-reports/regenerate/${reportId}`;
    return withMockFallback(endpoint, mockWeeklyReports[0], () => makeRequest(endpoint, { method: 'POST' }));
  },

  // 获取周报的历史版本列表
  async fetchWeeklyReportVersions(reportId: string) {
    const endpoint = isDevelopment
      ? `/dev/weekly-reports/versions/${reportId}`
      : `/weekly-reports/versions/${reportId}`;
    const data = await withMockFallback(endpoint, mockWeeklyReportVersions, () => makeRequest(endpoint));
    return Array.isArray(data) ? data : [];
  },

  // 获取某个历史版本的完整内容
  async fetchWeeklyReportVersion(versionId: string) {
    const endpoint = isDevelopment
      ? `/dev/weekly-report-versions/${versionId}`
      : `/weekly-report-versions/${versionId}`;
    const mockVersion = mockWeeklyReportVersions.find(v => v.id === versionId) || mockWeeklyReportVersions[0];
    return withMockFallback(endpoint, mockVersion, () => makeRequest(endpoint));
  }
};

export default api;