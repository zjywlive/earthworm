import { type Course } from "~/types";

export interface StatementApiResponse {
  id: string;
  order: number;
  chinese: string;
  english: string;
  soundmark: string;
  isMastered: boolean;
}

export interface CourseApiResponse {
  id: string;
  title: string;
  description: string;
  order: number;
  statements: StatementApiResponse[];
  coursePackId: string;
  completionCount: number;
  statementIndex: number;
  video: string;
}

// 使用 import.meta.glob 批量导入所有课程 JSON
const courseModules = import.meta.glob<{ default: Array<{ chinese: string; english: string; soundmark: string }> }>(
  "~/data/courses/*.json",
  { eager: false },
);

// 课程包元数据
let coursePacksCache: any[] | null = null;
async function loadCoursePacks() {
  if (coursePacksCache) return coursePacksCache;
  const mod = await import("~/data/course-packs.json");
  coursePacksCache = mod.default;
  return coursePacksCache!;
}

// 加载单个课程的 statements
async function loadCourseStatements(fileName: string) {
  // import.meta.glob 的 key 形如 "/data/courses/01.json"
  const key = `/data/courses/${fileName}`;
  // 匹配可能的路径格式
  const loader = courseModules[key] || courseModules[`~/data/courses/${fileName}`];
  if (loader) {
    const mod = await loader();
    return mod.default;
  }
  // fallback: 遍历 keys 寻找匹配
  for (const [k, v] of Object.entries(courseModules)) {
    if (k.endsWith(`/${fileName}`)) {
      const mod = await v();
      return mod.default;
    }
  }
  throw new Error(`Course file ${fileName} not found in glob`);
}

// localStorage key for progress
const PROGRESS_KEY = "earthworm-progress";
const HISTORY_KEY = "earthworm-course-history";

function getProgress(): Record<string, { courseId: string; statementIndex: number }> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function getHistory(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveHistory(history: Record<string, number>) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export async function fetchCourse(coursePackId: string, courseId: string): Promise<Course> {
  const packs = await loadCoursePacks();
  const pack = packs.find((p: any) => p.id === coursePackId);
  if (!pack) throw new Error(`Course pack ${coursePackId} not found`);

  const courseInfo = pack.courses.find((c: any) => c.id === courseId);
  if (!courseInfo) throw new Error(`Course ${courseId} not found in pack ${coursePackId}`);

  const rawStatements = await loadCourseStatements(courseInfo.file);

  const statements: StatementApiResponse[] = rawStatements.map(
    (item: { chinese: string; english: string; soundmark: string }, index: number) => ({
      id: `${courseId}-stmt-${index}`,
      order: index + 1,
      chinese: item.chinese,
      english: item.english,
      soundmark: item.soundmark,
      isMastered: false,
    }),
  );

  // 从 localStorage 恢复进度
  const progress = getProgress();
  const progressKey = `${coursePackId}`;
  const savedProgress = progress[progressKey];
  const statementIndex =
    savedProgress && savedProgress.courseId === courseId ? savedProgress.statementIndex : 0;

  // 完成次数
  const history = getHistory();
  const historyKey = `${coursePackId}:${courseId}`;
  const completionCount = history[historyKey] || 0;

  return {
    id: courseId,
    title: courseInfo.title,
    description: `${pack.title} - ${courseInfo.title}`,
    order: courseInfo.order,
    statements,
    coursePackId,
    completionCount,
    statementIndex,
    video: "",
  } as Course;
}

export async function fetchCompleteCourse(
  coursePackId: string,
  courseId: string,
): Promise<{ nextCourse: Course | undefined }> {
  const packs = await loadCoursePacks();
  const pack = packs.find((p: any) => p.id === coursePackId);
  if (!pack) return { nextCourse: undefined };

  const currentIndex = pack.courses.findIndex((c: any) => c.id === courseId);

  // 记录完成历史
  const history = getHistory();
  const historyKey = `${coursePackId}:${courseId}`;
  history[historyKey] = (history[historyKey] || 0) + 1;
  saveHistory(history);

  // 查找下一课
  if (currentIndex >= 0 && currentIndex < pack.courses.length - 1) {
    const nextCourseInfo = pack.courses[currentIndex + 1];
    // 更新进度到下一课
    const progress = getProgress();
    progress[coursePackId] = { courseId: nextCourseInfo.id, statementIndex: 0 };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

    return { nextCourse: await fetchCourse(coursePackId, nextCourseInfo.id) };
  }

  return { nextCourse: undefined };
}
