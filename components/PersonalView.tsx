import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Project, User, OKR, ProjectStatus } from '../types';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailModal } from './ProjectDetailModal';
import { AnnualStats } from './AnnualStats';
import { IconEdit2, IconCheck, IconX, IconPlus, IconFileText } from './Icons';

// ================== 类型定义 ==================

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'file';
  url: string;       // data URL (base64) for images, blob URL for others
  mimeType: string;
  size: number;
  createdAt: string;
}

interface PersonalWeeklyReport {
  personId: string;
  personName: string;
  weekLabel: string;       // 如 "07-06 → 07-10"，可自定义
  weekYear: number;
  weekNumber: number;
  thisWeekTop3: string;
  dailyRoutineWork: string;
  nextWeekTop3: string;
  issuesAndCrossDept: string;
  attachments: Attachment[];
  updatedAt: string;
}

// ================== 辅助函数 ==================

const pad2 = (n: number) => String(n).padStart(2, '0');

const getWeekNumber = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((+d - +yearStart) / 86400000) + 1) / 7);
};

const getDefaultWeekLabel = (year: number, weekNum: number) => {
  // 计算指定周的周一和周五日期
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const isoWeekStart = new Date(jan4);
  isoWeekStart.setDate(jan4.getDate() - jan4Day + 1 + (weekNum - 1) * 7);
  const monday = new Date(isoWeekStart);
  const friday = new Date(isoWeekStart);
  friday.setDate(monday.getDate() + 4);
  const fmt = (d: Date) => `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return `${fmt(monday)} → ${fmt(friday)}`;
};

const getReportKey = (personId: string, weekNumber: number, year: number) =>
  `weekly-report-${personId}-W${pad2(weekNumber)}-${year}`;

const loadReport = (key: string): PersonalWeeklyReport | null => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveReport = (report: PersonalWeeklyReport) => {
  const key = getReportKey(report.personId, report.weekNumber, report.weekYear);
  localStorage.setItem(key, JSON.stringify(report));
};

const compressImage = (file: File, maxW = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject('No canvas'); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject('Image load failed');
    img.src = URL.createObjectURL(file);
  });
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ================== 子组件 ==================

/** 图片放大查看 Lightbox */
const ImageLightbox: React.FC<{
  src: string;
  alt: string;
  onClose: () => void;
}> = ({ src, alt, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
    >
      <IconX className="w-6 h-6" />
    </button>
    <img
      src={src}
      alt={alt}
      className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

/** 附件缩略图网格 */
const AttachmentGrid: React.FC<{
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  readonly?: boolean;
}> = ({ attachments, onRemove, readonly = false }) => {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  if (attachments.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="relative group rounded-lg border border-zinc-200 dark:border-[#363636] overflow-hidden bg-zinc-50 dark:bg-[#1a1a1a]"
          >
            {att.type === 'image' ? (
              <div
                className="aspect-[4/3] cursor-pointer overflow-hidden"
                onClick={() => setLightbox({ src: att.url, alt: att.name })}
              >
                <img src={att.url} alt={att.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ) : att.type === 'video' ? (
              <div className="aspect-[4/3] flex items-center justify-center bg-zinc-100 dark:bg-[#1f1f1f]">
                <div className="text-center p-2">
                  <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{att.name}</p>
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] flex items-center justify-center">
                <div className="text-center p-2">
                  <IconFileText className="w-8 h-8 mx-auto mb-1 text-zinc-400 dark:text-zinc-500" />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{att.name}</p>
                </div>
              </div>
            )}
            {/* 底部信息栏 */}
            <div className="px-2 py-1 border-t border-zinc-200 dark:border-[#2a2a2a] flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate flex-1">{att.name}</span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono">{formatSize(att.size)}</span>
            </div>
            {/* 删除按钮 */}
            {!readonly && onRemove && (
              <button
                onClick={() => onRemove(att.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                title="删除附件"
              >
                <IconX className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {/* 图片放大查看 */}
      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </>
  );
};

/** 附件上传区 */
const AttachmentUploader: React.FC<{
  onAddAttachment: (att: Attachment) => void;
}> = ({ onAddAttachment }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (isImage) {
        try {
          const dataUrl = await compressImage(file);
          onAddAttachment({
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            type: 'image',
            url: dataUrl,
            mimeType: file.type,
            size: file.size,
            createdAt: new Date().toISOString(),
          });
        } catch (e) {
          console.error('图片压缩失败:', e);
        }
      } else if (isVideo) {
        // 视频文件太大，只存 blob URL（当前会话有效）+ 文件名
        const blobUrl = URL.createObjectURL(file);
        onAddAttachment({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: 'video',
          url: blobUrl,
          mimeType: file.type,
          size: file.size,
          createdAt: new Date().toISOString(),
        });
      } else {
        // 其他文件也用 blob URL
        const blobUrl = URL.createObjectURL(file);
        onAddAttachment({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: 'file',
          url: blobUrl,
          mimeType: file.type,
          size: file.size,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }, [onAddAttachment]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }, [processFiles]);

  // 粘贴事件
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/') && item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        const dt = new DataTransfer();
        files.forEach(f => dt.items.add(f));
        processFiles(dt.files);
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`mt-4 border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${
        isDragOver
          ? 'border-[#6C63FF] bg-[#6C63FF]/[0.06] dark:bg-[#6C63FF]/[0.1]'
          : 'border-zinc-200 dark:border-[#363636] bg-zinc-50 dark:bg-[#1a1a1a] hover:border-zinc-300 dark:hover:border-[#444]'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="text-center py-3">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-[#6C63FF]/[0.1] dark:bg-[#6C63FF]/[0.15] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#6C63FF] dark:text-[#B4AEFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        </div>
        <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">
          拖拽图片/视频到此处，或 <span className="text-[#6C63FF] dark:text-[#B4AEFF] font-medium">点击上传</span>
        </p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
          支持 Ctrl+V 粘贴截图 · 图片自动压缩 · 视频建议链接形式
        </p>
      </div>
    </div>
  );
};

/** 可编辑的周期标签 */
const WeekLabelEditor: React.FC<{
  value: string;
  onChange: (v: string) => void;
  weekYear: number;
  weekNumber: number;
}> = ({ value, onChange, weekYear, weekNumber }) => {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(value);

  const handleConfirm = () => {
    onChange(editVal.trim() || value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="inline-flex items-center gap-2">
        <input
          type="text"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="h-7 px-2 text-[13px] font-mono bg-white dark:bg-[#1a1a1a] border border-[#6C63FF] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/20 w-[180px]"
          autoFocus
        />
        <button onClick={handleConfirm} className="p-1 rounded text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors">
          <IconCheck className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#2a2a2a] transition-colors">
          <IconX className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setEditVal(value); setEditing(true); }}
      className="inline-flex items-center gap-1.5 text-[13px] font-mono text-zinc-600 dark:text-zinc-300 hover:text-[#6C63FF] dark:hover:text-[#B4AEFF] transition-colors group"
      title="点击编辑周期（如某周不开周会可修改）"
    >
      <span>{value}</span>
      <span className="text-zinc-300 dark:text-zinc-500 font-light">/</span>
      <span>{weekYear}</span>
      <IconEdit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  );
};

/** 周报字段标签 */
const FieldLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <div className="flex items-baseline gap-2 mb-1.5">
    <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
      {children}
    </h4>
    {hint && (
      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{hint}</span>
    )}
  </div>
);

// ================== 主组件 ==================

interface PersonalViewProps {
  projects: Project[];
  allUsers: User[];
  activeOkrs: OKR[];
  currentUser: User;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onOpenModal: (type: 'role' | 'comments' | 'changelog', projectId: string, details?: any) => void;
  onToggleFollow: (projectId: string) => void;
  onReply: (project: Project, user: User) => void;
  isLoadingUsers?: boolean;
  isLoadingOkrs?: boolean;
}

const Section: React.FC<{ title: string; count: number; children: React.ReactNode }> = React.memo(
  ({ title, count, children }) => {
    const hasItems = React.Children.count(children) > 0;
    return (
      <section>
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">({count})</span>
        </div>
        {hasItems ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {children}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 dark:border-[#363636] rounded-xl p-8 text-center text-gray-400 dark:text-gray-500">
            <p>暂无相关项目</p>
          </div>
        )}
      </section>
    );
  }
);

const PersonalViewComp: React.FC<PersonalViewProps> = ({
  projects,
  allUsers,
  activeOkrs,
  currentUser,
  onUpdateProject,
  onOpenModal,
  onToggleFollow,
  onReply,
  isLoadingUsers,
  isLoadingOkrs,
}) => {
  const [detailModalProject, setDetailModalProject] = useState<Project | null>(null);

  // ===== 周期计算 =====
  const now = new Date();
  const currentWeekNum = getWeekNumber(now);
  const currentYear = now.getFullYear();
  const lastWeekNum = currentWeekNum > 1 ? currentWeekNum - 1 : 52;
  const lastWeekYear = currentWeekNum > 1 ? currentYear : currentYear - 1;

  // ===== 本周周报状态 =====
  const currentKey = getReportKey(currentUser.id, currentWeekNum, currentYear);
  const [currentReport, setCurrentReport] = useState<PersonalWeeklyReport | null>(() => loadReport(currentKey));
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    weekLabel: '',
    thisWeekTop3: '',
    dailyRoutineWork: '',
    nextWeekTop3: '',
    issuesAndCrossDept: '',
  });
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);

  // ===== 上周周报状态 =====
  const lastKey = getReportKey(currentUser.id, lastWeekNum, lastWeekYear);
  const [lastReport] = useState<PersonalWeeklyReport | null>(() => loadReport(lastKey));

  // ===== 首次初始化 =====
  useEffect(() => {
    const loaded = loadReport(currentKey);
    setCurrentReport(loaded);
  }, [currentKey]);

  // ===== 同步 detailModal =====
  useEffect(() => {
    if (detailModalProject) {
      const updated = projects.find(p => p.id === detailModalProject.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(detailModalProject)) {
        setDetailModalProject(updated);
      }
    }
  }, [projects, detailModalProject]);

  // ===== 项目列表计算 =====
  const { myActiveProjects, followedProjects } = useMemo(() => {
    if (!projects || projects.length === 0) {
      return { myActiveProjects: [], followedProjects: [] };
    }
    const userId = currentUser.id;
    const statusOrder: Record<string, number> = {
      '开发中': 1, '测试中': 2, '评审完成': 3, '需求完成': 4,
      '产品设计': 5, '讨论中': 6, '本周已上线': 7, '未开始': 8
    };
    const priorityOrder: Record<string, number> = {
      '部门OKR': 1, '个人OKR': 2, '临时重要需求': 3, '日常需求': 4
    };

    const myActive = projects
      .filter(p => p.owners.some(m => m?.userId === userId) && p.status !== '已暂停' && p.status !== '已完成')
      .sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
                    || (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));

    const followed = projects.filter(p => p.followers?.includes(userId));

    return { myActiveProjects: myActive, followedProjects: followed };
  }, [projects, currentUser.id]);

  // ===== 开始编辑 =====
  const handleStartEdit = useCallback(() => {
    const existing = currentReport || {
      weekLabel: getDefaultWeekLabel(currentYear, currentWeekNum),
      thisWeekTop3: '',
      dailyRoutineWork: '',
      nextWeekTop3: '',
      issuesAndCrossDept: '',
      attachments: [],
    };
    setEditData({
      weekLabel: existing.weekLabel,
      thisWeekTop3: existing.thisWeekTop3,
      dailyRoutineWork: existing.dailyRoutineWork,
      nextWeekTop3: existing.nextWeekTop3,
      issuesAndCrossDept: existing.issuesAndCrossDept,
    });
    setEditAttachments(existing.attachments || []);
    setIsEditing(true);
  }, [currentReport, currentYear, currentWeekNum]);

  // ===== 保存 =====
  const handleSave = useCallback(() => {
    const report: PersonalWeeklyReport = {
      personId: currentUser.id,
      personName: currentUser.name,
      weekLabel: editData.weekLabel,
      weekYear: currentYear,
      weekNumber: currentWeekNum,
      thisWeekTop3: editData.thisWeekTop3,
      dailyRoutineWork: editData.dailyRoutineWork,
      nextWeekTop3: editData.nextWeekTop3,
      issuesAndCrossDept: editData.issuesAndCrossDept,
      attachments: editAttachments,
      updatedAt: new Date().toISOString(),
    };
    saveReport(report);
    setCurrentReport(report);
    setIsEditing(false);
  }, [editData, editAttachments, currentUser, currentYear, currentWeekNum]);

  // ===== 附件管理 =====
  const handleAddAttachment = useCallback((att: Attachment) => {
    setEditAttachments(prev => [...prev, att]);
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setEditAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // ===== 渲染 =====
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-[#1f1f1f]">
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {(isLoadingUsers || isLoadingOkrs) && (
          <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-lg px-3 py-2 w-fit">
            <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 border-t-indigo-500 rounded-full animate-spin" />
            <span>{isLoadingOkrs ? '正在加载 OKR 数据...' : '正在加载用户数据...'}</span>
          </div>
        )}
        <AnnualStats projects={projects} currentUser={currentUser} activeOkrs={activeOkrs} />

        {/* ===== 个人周报区域 ===== */}
        <section className="mb-8 bg-white dark:bg-[#232323] border border-zinc-200 dark:border-[#333] rounded-xl overflow-hidden shadow-sm">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-[#2a2a2a]">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[18px] font-semibold text-gray-900 dark:text-white">
                {currentUser.name}的周报
              </span>
              {isEditing ? (
                <WeekLabelEditor
                  value={editData.weekLabel}
                  onChange={(v) => setEditData({ ...editData, weekLabel: v })}
                  weekYear={currentYear}
                  weekNumber={currentWeekNum}
                />
              ) : currentReport ? (
                <button
                  onClick={() => {
                    setEditData({
                      weekLabel: currentReport.weekLabel,
                      thisWeekTop3: currentReport.thisWeekTop3,
                      dailyRoutineWork: currentReport.dailyRoutineWork,
                      nextWeekTop3: currentReport.nextWeekTop3,
                      issuesAndCrossDept: currentReport.issuesAndCrossDept,
                    });
                    setEditAttachments(currentReport.attachments || []);
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center gap-1 text-[13px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-[#6C63FF] dark:hover:text-[#B4AEFF] transition-colors group"
                >
                  <span>{currentReport.weekLabel}</span>
                  <span className="text-zinc-300 dark:text-zinc-600 font-light">/</span>
                  <span>{currentYear}</span>
                  <IconEdit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              ) : (
                <span className="text-[13px] font-mono text-zinc-400 dark:text-zinc-500">
                  {getDefaultWeekLabel(currentYear, currentWeekNum)} / {currentYear}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[12px]">
              {currentReport && !isEditing && (
                <span className="font-mono text-zinc-400 dark:text-zinc-500">
                  上次编辑：{new Date(currentReport.updatedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {!isEditing ? (
                currentReport ? (
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#6C63FF] hover:bg-[#6C63FF]/[0.06] rounded-md transition-all"
                  >
                    <IconEdit2 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                ) : null
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center h-8 px-3 text-[12px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 text-[12px] font-medium bg-[#6C63FF] text-white hover:bg-[#5a52d5] rounded-md transition-all active:translate-y-[1px]"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    保存
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 双栏内容区：本周 vs 上周 */}
          <div className="px-5 py-5">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* ===== 左栏：本周周报（编辑/展示） ===== */}
              <div className="border border-zinc-200 dark:border-[#333] rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-zinc-50 dark:bg-[#1e1e1e] border-b border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.12em]">
                    本周周报
                  </span>
                  {!currentReport && !isEditing && (
                    <button
                      onClick={handleStartEdit}
                      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[11.5px] font-medium bg-[#6C63FF] text-white hover:bg-[#5a52d5] transition-all active:translate-y-[1px]"
                    >
                      <IconEdit2 className="w-3 h-3" />
                      开始填写
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  {isEditing ? (
                    /* 编辑模式 */
                    <>
                      <div>
                        <FieldLabel>本周重点3件事</FieldLabel>
                        <textarea
                          value={editData.thisWeekTop3}
                          onChange={(e) => setEditData({ ...editData, thisWeekTop3: e.target.value })}
                          rows={5}
                          className="w-full p-3 rounded-md bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-[#363636] text-[13.5px] text-zinc-800 dark:text-zinc-100 leading-[1.75] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                          placeholder={"1. xxx\n2. xxx\n3. xxx"}
                        />
                      </div>
                      <div>
                        <FieldLabel>日常事务性工作</FieldLabel>
                        <textarea
                          value={editData.dailyRoutineWork}
                          onChange={(e) => setEditData({ ...editData, dailyRoutineWork: e.target.value })}
                          rows={3}
                          className="w-full p-3 rounded-md bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-[#363636] text-[13.5px] text-zinc-800 dark:text-zinc-100 leading-[1.75] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                          placeholder="日常巡检、费用对账等..."
                        />
                      </div>
                      <div>
                        <FieldLabel>下周重点3件事</FieldLabel>
                        <textarea
                          value={editData.nextWeekTop3}
                          onChange={(e) => setEditData({ ...editData, nextWeekTop3: e.target.value })}
                          rows={5}
                          className="w-full p-3 rounded-md bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-[#363636] text-[13.5px] text-zinc-800 dark:text-zinc-100 leading-[1.75] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                          placeholder={"1. xxx\n2. xxx\n3. xxx"}
                        />
                      </div>
                      <div>
                        <FieldLabel>问题及跨部门协同</FieldLabel>
                        <textarea
                          value={editData.issuesAndCrossDept}
                          onChange={(e) => setEditData({ ...editData, issuesAndCrossDept: e.target.value })}
                          rows={3}
                          className="w-full p-3 rounded-md bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-[#363636] text-[13.5px] text-zinc-800 dark:text-zinc-100 leading-[1.75] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                          placeholder="需要跨部门协助的事项..."
                        />
                      </div>
                      <div>
                        <FieldLabel>附件</FieldLabel>
                        <AttachmentUploader onAddAttachment={handleAddAttachment} />
                        <AttachmentGrid attachments={editAttachments} onRemove={handleRemoveAttachment} />
                      </div>
                    </>
                  ) : currentReport ? (
                    /* 展示模式 */
                    <>
                      <div>
                        <FieldLabel>本周重点3件事</FieldLabel>
                        <div className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-[1.8] whitespace-pre-wrap">
                          {currentReport.thisWeekTop3 || <span className="italic text-zinc-400 dark:text-zinc-500">暂未填写</span>}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>日常事务性工作</FieldLabel>
                        <div className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-[1.8] whitespace-pre-wrap">
                          {currentReport.dailyRoutineWork || <span className="italic text-zinc-400 dark:text-zinc-500">暂未填写</span>}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>下周重点3件事</FieldLabel>
                        <div className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-[1.8] whitespace-pre-wrap">
                          {currentReport.nextWeekTop3 || <span className="italic text-zinc-400 dark:text-zinc-500">暂未填写</span>}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>问题及跨部门协同</FieldLabel>
                        <div className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-[1.8] whitespace-pre-wrap">
                          {currentReport.issuesAndCrossDept || <span className="italic text-zinc-400 dark:text-zinc-500">暂未填写</span>}
                        </div>
                      </div>
                      {currentReport.attachments && currentReport.attachments.length > 0 && (
                        <div>
                          <FieldLabel>附件</FieldLabel>
                          <AttachmentGrid attachments={currentReport.attachments} readonly />
                        </div>
                      )}
                    </>
                  ) : (
                    /* 空状态 */
                    <div className="py-8 text-center">
                      <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mb-3">本周还没有填写周报</p>
                      <button
                        onClick={handleStartEdit}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-[13px] font-medium bg-[#6C63FF] text-white hover:bg-[#5a52d5] transition-all active:translate-y-[1px]"
                      >
                        <IconEdit2 className="w-3.5 h-3.5" />
                        开始填写
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== 右栏：上周周报（只读参考） ===== */}
              <div className="border border-zinc-200 dark:border-[#333] rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-zinc-50 dark:bg-[#1e1e1e] border-b border-zinc-200 dark:border-[#2e2e2e]">
                  <span className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.12em]">
                    上周周报参考
                  </span>
                  {lastReport && (
                    <span className="ml-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                      {lastReport.weekLabel} / {lastWeekYear}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  {lastReport ? (
                    <>
                      <div>
                        <FieldLabel>上周重点3件事</FieldLabel>
                        <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-[1.8] whitespace-pre-wrap">
                          {lastReport.thisWeekTop3 || <span className="italic text-zinc-400 dark:text-zinc-500">未填写</span>}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>日常事务性工作</FieldLabel>
                        <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-[1.8] whitespace-pre-wrap">
                          {lastReport.dailyRoutineWork || <span className="italic text-zinc-400 dark:text-zinc-500">未填写</span>}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>下周重点3件事（即本周计划）</FieldLabel>
                        <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-[1.8] whitespace-pre-wrap">
                          {lastReport.nextWeekTop3 || <span className="italic text-zinc-400 dark:text-zinc-500">未填写</span>}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>问题及跨部门协同</FieldLabel>
                        <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-[1.8] whitespace-pre-wrap">
                          {lastReport.issuesAndCrossDept || <span className="italic text-zinc-400 dark:text-zinc-500">未填写</span>}
                        </div>
                      </div>
                      {lastReport.attachments && lastReport.attachments.length > 0 && (
                        <div>
                          <FieldLabel>附件</FieldLabel>
                          <AttachmentGrid attachments={lastReport.attachments} readonly />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500">上周暂无周报记录</p>
                      <p className="text-[11px] text-zinc-300 dark:text-zinc-600 mt-1">填写本周周报时可参考上周内容</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 项目列表 ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-3 space-y-8">
            <Section title="我参与的正在进行的项目" count={myActiveProjects.length}>
              {myActiveProjects.map(project => (
                <ProjectCard key={`my-${project.id}`} project={project} allUsers={allUsers} onClick={() => setDetailModalProject(project)} />
              ))}
            </Section>
            <Section title="我关注的项目" count={followedProjects.length}>
              {followedProjects.map(project => (
                <ProjectCard key={`followed-${project.id}`} project={project} allUsers={allUsers} onClick={() => setDetailModalProject(project)} />
              ))}
            </Section>
          </div>
        </div>
      </div>

      {/* 项目详情弹窗 */}
      {detailModalProject && (
        <ProjectDetailModal
          project={detailModalProject}
          allUsers={allUsers}
          activeOkrs={activeOkrs}
          onClose={() => setDetailModalProject(null)}
          onUpdateProject={onUpdateProject}
          onOpenRoleModal={(roleKey, roleName) => onOpenModal('role', detailModalProject.id, { roleKey, roleName })}
          onToggleFollow={onToggleFollow}
        />
      )}
    </main>
  );
};

export const PersonalView = PersonalViewComp;
export default PersonalViewComp;
