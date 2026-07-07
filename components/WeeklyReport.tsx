import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { LoadingSpinner } from './LoadingSpinner';
import { IconEdit2, IconCheck } from './Icons';

// ================== 新数据接口 ==================

/** 编号列表中的一个条目 */
interface RichItem {
  number: number;
  text: string;
  subItems?: string[];
  progress?: string;
}

/** 表格中一行 = 一个人的周报 */
interface PersonWeekEntry {
  personId: string;
  personName: string;
  responsibility: string;
  supportedExecutives: string;
  thisWeekTop3: RichItem[];
  dailyRoutineWork: string;
  nextWeekTop3: RichItem[];
  issuesAndCrossDept: string;
}

/** 模块分组 */
interface ModuleGroup {
  moduleId: string;
  moduleName: string;
  entries: PersonWeekEntry[];
}

/** 周报内容 */
interface AdminWeeklyContent {
  modules: ModuleGroup[];
}

interface WeeklyReport {
  id: string;
  weekYear: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  content: AdminWeeklyContent;
  summary: string;
  createdAt: string;
  updatedAt: string;
  generatedBy: string;
}

interface WeeklyReportVersion {
  id: string;
  reportId: string;
  weekYear: number;
  weekNumber: number;
  versionNo: number;
  content?: AdminWeeklyContent;
  summary: string;
  generatedBy: string;
  archivedAt: string;
}

// ================== 辅助函数 ==================

const pad2 = (n: number) => String(n).padStart(2, '0');
const shortDate = (s: string) => (s || '').slice(5);

const reportStatusMeta = (s: string) => {
  if (s === 'finalized') return { label: '已归档', cls: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10', dot: 'bg-emerald-500' };
  if (s === 'editing') return { label: '编辑中', cls: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10', dot: 'bg-amber-500' };
  return { label: '已生成', cls: 'text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-500/10', dot: 'bg-sky-500' };
};

const formatDateTime = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(+d)) return iso;
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const bj = new Date(utc + 8 * 3600000);
  const y = bj.getFullYear();
  const m = pad2(bj.getMonth() + 1);
  const day = pad2(bj.getDate());
  const h = pad2(bj.getHours());
  const min = pad2(bj.getMinutes());
  return `${y}-${m}-${day} ${h}:${min}`;
};

const timeAgo = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(+d)) return '';
  const nowUtc = Date.now() + (new Date().getTimezoneOffset() * 60000) + 8 * 3600000;
  const bjTime = d.getTime() + (d.getTimezoneOffset() * 60000) + 8 * 3600000;
  const diff = (nowUtc - bjTime) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`;
  return formatDateTime(iso).slice(0, 10);
};

// ================== 子组件 ==================

const Kicker: React.FC<{ en: string; zh?: string }> = ({ en, zh }) => (
  <div className="flex items-baseline gap-2">
    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
      {en}
    </span>
    {zh && (
      <>
        <span className="text-[11px] text-zinc-300 dark:text-zinc-600">·</span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{zh}</span>
      </>
    )}
  </div>
);

const MainSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-8">
    <div className="space-y-3">
      <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-[#2a2a2a]" />
      <div className="h-8 w-96 rounded bg-zinc-200 dark:bg-[#2a2a2a]" />
      <div className="h-3 w-48 rounded bg-zinc-200 dark:bg-[#2a2a2a]" />
    </div>
    <div className="h-px bg-zinc-200 dark:bg-[#363636]" />
    <div className="space-y-3">
      <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-[#2a2a2a]" />
      <div className="h-4 w-full rounded bg-zinc-200 dark:bg-[#2a2a2a]" />
      <div className="h-4 w-[92%] rounded bg-zinc-200 dark:bg-[#2a2a2a]" />
      <div className="h-4 w-[80%] rounded bg-zinc-200 dark:bg-[#2a2a2a]" />
    </div>
  </div>
);

/** 渲染编号列表（本周/下周重点3件事） */
const RichItemList: React.FC<{ items: RichItem[] }> = ({ items }) => (
  <div className="space-y-2.5">
    {items.map((item) => (
      <div key={item.number}>
        <div className="font-medium text-zinc-800 dark:text-zinc-200 text-[13px]">
          {item.number}. {item.text}
          {item.progress && (
            <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300">
              {item.progress}
            </span>
          )}
        </div>
        {item.subItems && item.subItems.length > 0 && (
          <ul className="ml-4 mt-1 space-y-0.5">
            {item.subItems.map((sub, idx) => (
              <li key={idx} className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-[1.6] list-disc marker:text-zinc-400 dark:marker:text-zinc-500">
                {sub}
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </div>
);

// ================== 表格列定义 ==================

const COL_WIDTHS = {
  module: '80px',
  person: '70px',
  responsibility: '140px',
  executives: '100px',
  thisWeek: '300px',
  dailyWork: '160px',
  nextWeek: '300px',
  issues: '160px',
};

const TABLE_HEADERS = [
  { key: 'module', label: '模块', width: COL_WIDTHS.module },
  { key: 'person', label: '人员', width: COL_WIDTHS.person },
  { key: 'responsibility', label: '职责', width: COL_WIDTHS.responsibility },
  { key: 'executives', label: '支持高管', width: COL_WIDTHS.executives },
  { key: 'thisWeek', label: '本周重点3件事', width: COL_WIDTHS.thisWeek },
  { key: 'dailyWork', label: '日常事务性工作', width: COL_WIDTHS.dailyWork },
  { key: 'nextWeek', label: '下周重点3件事', width: COL_WIDTHS.nextWeek },
  { key: 'issues', label: '问题及跨部门协同', width: COL_WIDTHS.issues },
];

// ================== 主组件 ==================

const WeeklyReportView: React.FC = () => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSummary, setEditSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<WeeklyReportVersion[]>([]);
  const [viewingVersion, setViewingVersion] = useState<WeeklyReportVersion | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const versionsMenuRef = useRef<HTMLDivElement | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchWeeklyReports();
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (err) {
      setError('获取周报列表失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReport]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    if (!selectedReport?.id) {
      setVersions([]); setViewingVersion(null); setVersionsOpen(false);
      return;
    }
    setViewingVersion(null); setVersionsOpen(false);
    api.fetchWeeklyReportVersions(selectedReport.id)
      .then((data: any) => setVersions(Array.isArray(data) ? data : []))
      .catch(() => setVersions([]));
  }, [selectedReport?.id]);

  useEffect(() => {
    if (!versionsOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!versionsMenuRef.current) return;
      if (!versionsMenuRef.current.contains(e.target as Node)) setVersionsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [versionsOpen]);

  const handleGenerate = async () => {
    if (isGenerating || isRegenerating) return;
    setIsGenerating(true); setError(null);
    try {
      const report = await api.generateWeeklyReport();
      setSelectedReport(report);
      await fetchReports();
    } catch (err) { setError('生成周报失败'); console.error(err); }
    finally { setIsGenerating(false); }
  };

  const handleRegenerate = async () => {
    if (!selectedReport) return;
    if (isGenerating || isRegenerating) return;
    setIsRegenerating(true); setError(null);
    try {
      const report = await api.regenerateWeeklyReport(selectedReport.id);
      const refreshed: WeeklyReport = { ...selectedReport, ...report, id: selectedReport.id };
      setSelectedReport(refreshed);
      const list = await api.fetchWeeklyReportVersions(selectedReport.id);
      setVersions(Array.isArray(list) ? list : []);
      await fetchReports();
    } catch (err) { setError('重新生成失败'); console.error(err); }
    finally { setIsRegenerating(false); }
  };

  const handleOpenVersion = async (versionId: string) => {
    try {
      const v = await api.fetchWeeklyReportVersion(versionId);
      setViewingVersion(v); setVersionsOpen(false); setIsEditing(false);
    } catch (err) { setError('加载历史版本失败'); console.error(err); }
  };

  const handleUpdateSummary = async () => {
    if (!selectedReport) return;
    try {
      const updated = await api.updateWeeklyReport(selectedReport.id, {
        summary: editSummary, status: 'editing',
      });
      setSelectedReport(updated); setIsEditing(false);
      await fetchReports();
    } catch (err) { setError('更新周报失败'); console.error(err); }
  };

  const getCurrentWeekInfo = () => {
    const now = new Date();
    return { year: now.getFullYear(), week: getWeekNumber(now) };
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayNum = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - dayNum);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((+d - +yearStart) / 86400000) + 1) / 7);
  };

  const currentWeek = getCurrentWeekInfo();
  const hasCurrentWeekReport = reports.some(r => r.weekYear === currentWeek.year && r.weekNumber === currentWeek.week);

  const sortedReports = [...reports].sort((a, b) => {
    if (a.weekYear !== b.weekYear) return b.weekYear - a.weekYear;
    return b.weekNumber - a.weekNumber;
  });

  // 获取当前应展示的 content（考虑历史版本预览）
  const activeContent = (viewingVersion?.content || selectedReport?.content) as AdminWeeklyContent | undefined;

  return (
    <div className="flex-1 h-full flex flex-col bg-zinc-50 dark:bg-[#181818] overflow-hidden">
      {/* ====== Header ====== */}
      <header className="bg-white dark:bg-[#222] border-b border-zinc-200 dark:border-[#333]">
        {/* Row 1: Title + Generate */}
        <div className="flex items-center justify-between gap-6 px-8 pt-5 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-white leading-none">
              周报
            </h1>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Weekly&nbsp;Report
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-baseline gap-2 text-[12px]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                This&nbsp;Week
              </span>
              <span className="font-mono text-zinc-900 dark:text-white tracking-tight">
                W{pad2(currentWeek.week)} / {currentWeek.year}
              </span>
            </div>
            <button
              onClick={hasCurrentWeekReport ? handleRegenerate : handleGenerate}
              disabled={!!viewingVersion}
              title={
                viewingVersion
                  ? '正在预览历史版本，请先返回当前版本'
                  : (isGenerating || isRegenerating)
                  ? '后台生成中，可继续操作其它页面'
                  : hasCurrentWeekReport
                  ? '重新生成，当前内容归档为历史版本'
                  : '生成本周周报'
              }
              className={`inline-flex items-center gap-2 h-9 px-4 rounded-md text-[13px] font-medium transition-all duration-200 active:translate-y-[1px] ${
                viewingVersion
                  ? 'bg-zinc-100 dark:bg-[#2a2a2a] text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-200 dark:border-[#363636]'
                  : hasCurrentWeekReport
                  ? 'border border-zinc-200 dark:border-[#363636] text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#222] hover:border-[#6C63FF] hover:text-[#6C63FF]'
                  : 'bg-[#6C63FF] text-white hover:bg-[#5a52d5] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]'
              }`}
            >
              {(isGenerating || isRegenerating) && <LoadingSpinner size="sm" />}
              {hasCurrentWeekReport
                ? isRegenerating ? '重新生成中…' : '重新生成'
                : isGenerating ? '生成中…' : '生成本周周报'}
            </button>
          </div>
        </div>

        {/* Row 2: Week Tabs */}
        {sortedReports.length > 0 && (
          <div
            ref={tabsRef}
            className="flex items-stretch gap-1 px-6 overflow-x-auto border-t border-zinc-100 dark:border-[#2a2a2a] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {sortedReports.map((r) => {
              const active = selectedReport?.id === r.id;
              const meta = reportStatusMeta(r.status);
              return (
                <button
                  key={r.id}
                  onClick={() => { setSelectedReport(r); setIsEditing(false); }}
                  className={`relative shrink-0 inline-flex items-center gap-2 h-10 px-3 text-[12.5px] transition-all duration-200 ${
                    active
                      ? 'text-[#6C63FF] dark:text-[#B4AEFF]'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span className={`font-mono tracking-tight ${active ? 'font-semibold' : ''}`}>
                    W{pad2(r.weekNumber)}
                  </span>
                  <span className="font-mono text-zinc-400 dark:text-zinc-500">·</span>
                  <span className="font-mono text-zinc-400 dark:text-zinc-500">
                    {shortDate(r.startDate)}
                  </span>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {active && (
                    <span className="absolute left-2 right-2 bottom-0 h-[2px] rounded-full bg-[#6C63FF]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ====== Main ====== */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full px-6 py-6 lg:px-10 xl:px-14 xl:py-8">

          {error && (
            <div className="mb-6 rounded-md border border-rose-200/70 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/5 px-4 py-2.5 text-[13px] text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {isLoading && !selectedReport ? (
            <MainSkeleton />
          ) : selectedReport ? (
            <div>
              {/* Historical Version Banner */}
              {viewingVersion && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/5 px-4 py-2.5">
                  <div className="flex items-baseline gap-3 text-[12.5px]">
                    <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-500/15">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                      历史版本 v{viewingVersion.versionNo}
                    </span>
                    <span className="font-mono text-amber-800 dark:text-amber-200">
                      归档于 {formatDateTime(viewingVersion.archivedAt)}
                    </span>
                    <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
                      {timeAgo(viewingVersion.archivedAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingVersion(null)}
                    className="inline-flex items-center h-8 px-3 rounded-md text-[12px] font-medium text-amber-700 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-100/60 dark:hover:bg-amber-500/10 transition-colors"
                  >
                    返回当前版本
                  </button>
                </div>
              )}

              {/* Hero — 元信息条 */}
              <section className="pb-5 border-b border-zinc-200 dark:border-[#333]">
                <div className="mb-3">
                  <Kicker en={`Week ${pad2(selectedReport.weekNumber)} / ${selectedReport.weekYear}`} zh="本期周报" />
                </div>
                <div className="flex items-end justify-between gap-6 flex-wrap">
                  <h2 className="flex items-baseline gap-3 font-mono tracking-tight text-zinc-900 dark:text-white leading-none">
                    <span className="text-[28px] md:text-[32px] font-semibold">
                      {selectedReport.startDate}
                    </span>
                    <span className="text-[22px] md:text-[24px] font-light text-zinc-300 dark:text-[#3a3a3a]">
                      →
                    </span>
                    <span className="text-[28px] md:text-[32px] font-semibold">
                      {selectedReport.endDate}
                    </span>
                  </h2>

                  <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-[12px]">
                    <div className="flex flex-col gap-1">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Status</dt>
                      <dd>
                        {viewingVersion ? (
                          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium h-6 px-2 rounded text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-500/15">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                            历史版本
                          </span>
                        ) : (() => {
                          const meta = reportStatusMeta(selectedReport.status);
                          return (
                            <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium h-6 px-2 rounded ${meta.cls}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          );
                        })()}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                        {viewingVersion ? 'Archived At' : 'Last Modified'}
                      </dt>
                      <dd className="flex items-baseline gap-2">
                        <span className="font-mono text-[12.5px] text-zinc-800 dark:text-zinc-200">
                          {formatDateTime(viewingVersion ? viewingVersion.archivedAt : selectedReport.updatedAt)}
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {timeAgo(viewingVersion ? viewingVersion.archivedAt : selectedReport.updatedAt)}
                        </span>
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Generated&nbsp;By</dt>
                      <dd className="font-mono text-[12.5px] text-zinc-600 dark:text-zinc-300">
                        {(() => {
                          const by = viewingVersion ? viewingVersion.generatedBy : selectedReport.generatedBy;
                          return by === 'system' ? 'GLM-5 · auto' : (by || '—');
                        })()}
                      </dd>
                    </div>
                    {/* Version dropdown */}
                    <div className="flex flex-col gap-1 relative" ref={versionsMenuRef}>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Version</dt>
                      <dd>
                        {(() => {
                          const currentVersionNo = versions.length + 1;
                          const showingVer = viewingVersion ? viewingVersion.versionNo : currentVersionNo;
                          const totalVersions = versions.length + 1;
                          const clickable = versions.length > 0 || !!viewingVersion;
                          return (
                            <button
                              type="button"
                              onClick={() => clickable && setVersionsOpen((v) => !v)}
                              className={`inline-flex items-center gap-1.5 h-6 px-2 rounded text-[11.5px] font-medium transition-colors ${
                                clickable
                                  ? 'text-[#6C63FF] dark:text-[#B4AEFF] bg-[#6C63FF]/[0.08] hover:bg-[#6C63FF]/[0.14] cursor-pointer'
                                  : 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-[#2a2a2a] cursor-default'
                              }`}
                            >
                              <span className="font-mono">v{showingVer}</span>
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">·</span>
                              <span className="text-[10.5px]">{totalVersions} 个版本</span>
                              {clickable && (
                                <svg className={`w-3 h-3 transition-transform ${versionsOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M3 5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          );
                        })()}
                        {versionsOpen && (
                          <div className="absolute right-0 top-full mt-2 z-20 w-[280px] rounded-md border border-zinc-200 dark:border-[#363636] bg-white dark:bg-[#1f1f1f] shadow-lg overflow-hidden">
                            <div className="px-3 py-2 border-b border-zinc-100 dark:border-[#2a2a2a]">
                              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Versions</div>
                            </div>
                            <ul className="max-h-[280px] overflow-y-auto">
                              <li>
                                <button
                                  type="button"
                                  onClick={() => { setViewingVersion(null); setVersionsOpen(false); }}
                                  className={`w-full text-left px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-[#262626] transition-colors ${!viewingVersion ? 'bg-[#6C63FF]/[0.06]' : ''}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-mono text-[12.5px] font-semibold text-[#6C63FF] dark:text-[#B4AEFF]">v{versions.length + 1}</span>
                                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-medium">当前</span>
                                    </div>
                                    <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{formatDateTime(selectedReport.updatedAt)}</span>
                                  </div>
                                </button>
                              </li>
                              {versions.map((v) => (
                                <li key={v.id} className="border-t border-zinc-100 dark:border-[#2a2a2a]">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenVersion(v.id)}
                                    className={`w-full text-left px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-[#262626] transition-colors ${viewingVersion?.id === v.id ? 'bg-amber-50 dark:bg-amber-500/5' : ''}`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-baseline gap-2">
                                        <span className="font-mono text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-200">v{v.versionNo}</span>
                                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-500/15 text-zinc-600 dark:text-zinc-300">历史</span>
                                      </div>
                                      <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{formatDateTime(v.archivedAt)}</span>
                                    </div>
                                    <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                      {v.generatedBy === 'system' ? 'GLM-5 · auto' : (v.generatedBy || '—')}
                                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
                                      {timeAgo(v.archivedAt)}
                                    </div>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              {/* AI Summary */}
              <section className="pt-6 pb-8 border-b border-zinc-200 dark:border-[#333]">
                <div className="flex items-baseline justify-between mb-5">
                  <Kicker en="Summary" zh={viewingVersion ? `AI 总结 · 历史版 v${viewingVersion.versionNo}` : 'AI 总结'} />
                  {!viewingVersion && (!isEditing ? (
                    <button
                      onClick={() => { setEditSummary(selectedReport.summary || ''); setIsEditing(true); }}
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] text-zinc-600 dark:text-zinc-300 hover:text-[#6C63FF] hover:bg-[#6C63FF]/[0.06] rounded-md transition-all"
                    >
                      <IconEdit2 className="w-3.5 h-3.5" />
                      编辑
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center h-8 px-3 text-[12px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition-all"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleUpdateSummary}
                        className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium bg-[#6C63FF] text-white hover:bg-[#5a52d5] rounded-md transition-all active:translate-y-[1px]"
                      >
                        <IconCheck className="w-3.5 h-3.5" />
                        保存
                      </button>
                    </div>
                  ))}
                </div>

                {(!viewingVersion && isEditing) ? (
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full min-h-[240px] p-4 rounded-md bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-[#363636] text-[14px] text-zinc-800 dark:text-zinc-100 leading-[1.75] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 transition-all"
                    placeholder="输入周报总结..."
                  />
                ) : (
                  <article className="max-w-[80ch] text-[14px] text-zinc-700 dark:text-zinc-300 leading-[1.8]">
                    {(() => {
                      const text = (viewingVersion ? viewingVersion.summary : selectedReport.summary) || '';
                      if (!text) return <span className="text-zinc-400 dark:text-zinc-500 italic">暂无总结</span>;
                      return text.split('\n').map((line: string, i: number) => {
                        if (line.trim() === '') return <div key={i} className="h-2" />;
                        return <div key={i} className="whitespace-pre-wrap">{line}</div>;
                      });
                    })()}
                  </article>
                )}
              </section>

              {/* ====== 行政周报表 ====== */}
              <section className="pt-8 pb-12">
                <div className="mb-6">
                  <Kicker en="Admin Weekly" zh="行政周报表" />
                </div>

                {activeContent && activeContent.modules && activeContent.modules.length > 0 ? (
                  <div className="overflow-x-auto border border-zinc-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#232323]">
                    <table
                      className="admin-report-table w-full"
                      style={{ tableLayout: 'fixed', minWidth: '1300px' }}
                    >
                      <colgroup>
                        {TABLE_HEADERS.map((h) => (
                          <col key={h.key} style={{ width: h.width }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-[#1a1a1a] border-b border-zinc-200 dark:border-[#333]">
                          {TABLE_HEADERS.map((h) => (
                            <th
                              key={h.key}
                              className="px-3 py-2.5 text-[11.5px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.1em] text-left align-top whitespace-nowrap"
                            >
                              {h.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeContent.modules.map((mod) => (
                          <React.Fragment key={mod.moduleId}>
                            {/* 模块分组行 */}
                            <tr>
                              <td
                                colSpan={8}
                                className="bg-[#6C63FF]/[0.06] dark:bg-[#6C63FF]/[0.12] px-4 py-2.5 text-[13px] font-semibold text-[#6C63FF] dark:text-[#B4AEFF] border-b border-zinc-200 dark:border-[#333]"
                              >
                                {mod.moduleName}
                              </td>
                            </tr>
                            {/* 人员行 */}
                            {mod.entries.map((entry, entryIdx) => (
                              <tr key={entry.personId} className="hover:bg-zinc-50/60 dark:hover:bg-[#1f1f1f]/40 transition-colors">
                                {/* 模块列 - 仅模块第一行显示 */}
                                <td className="px-3 py-3 text-[13px] text-zinc-400 dark:text-zinc-500 align-top border-b border-zinc-100 dark:border-[#2a2a2a]">
                                  {entryIdx === 0 ? mod.moduleName : ''}
                                </td>
                                {/* 人员 */}
                                <td className="px-3 py-3 text-[13px] font-medium text-zinc-800 dark:text-zinc-200 align-top border-b border-zinc-100 dark:border-[#2a2a2a]">
                                  {entry.personName}
                                </td>
                                {/* 职责 */}
                                <td className="px-3 py-3 text-[12.5px] text-zinc-600 dark:text-zinc-400 align-top whitespace-pre-wrap border-b border-zinc-100 dark:border-[#2a2a2a] leading-[1.6]">
                                  {entry.responsibility}
                                </td>
                                {/* 支持高管 */}
                                <td className="px-3 py-3 text-[12.5px] text-zinc-600 dark:text-zinc-400 align-top whitespace-pre-wrap border-b border-zinc-100 dark:border-[#2a2a2a] leading-[1.6]">
                                  {entry.supportedExecutives}
                                </td>
                                {/* 本周重点3件事 */}
                                <td className="px-3 py-3 align-top border-b border-zinc-100 dark:border-[#2a2a2a]">
                                  <RichItemList items={entry.thisWeekTop3} />
                                </td>
                                {/* 日常事务性工作 */}
                                <td className="px-3 py-3 text-[12.5px] text-zinc-600 dark:text-zinc-400 align-top whitespace-pre-wrap border-b border-zinc-100 dark:border-[#2a2a2a] leading-[1.6]">
                                  {entry.dailyRoutineWork || <span className="text-zinc-400 dark:text-zinc-500">/</span>}
                                </td>
                                {/* 下周重点3件事 */}
                                <td className="px-3 py-3 align-top border-b border-zinc-100 dark:border-[#2a2a2a]">
                                  <RichItemList items={entry.nextWeekTop3} />
                                </td>
                                {/* 问题及跨部门协同 */}
                                <td className="px-3 py-3 text-[12.5px] text-zinc-600 dark:text-zinc-400 align-top whitespace-pre-wrap border-b border-zinc-100 dark:border-[#2a2a2a] leading-[1.6]">
                                  {entry.issuesAndCrossDept || <span className="text-zinc-400 dark:text-zinc-500">/</span>}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400">暂无行政周报表数据</p>
                    <p className="mt-1 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                      No admin weekly table data available for this period
                    </p>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <div className="max-w-sm">
                <div className="mb-3">
                  <Kicker en="No Report" zh="暂无周报" />
                </div>
                <h2 className="text-[28px] font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight mb-3">
                  本周还没有周报
                </h2>
                <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  点击右上角<span className="mx-1 text-zinc-700 dark:text-zinc-300">生成本周周报</span>
                  自动汇总本周所有项目进展。
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WeeklyReportView;
