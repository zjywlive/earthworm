import type { CourseApiResponse } from "./course";
import type { CoursePack, CoursePacksItem } from "~/types";

export type CoursePacksItemApiResponse = {
  id: string;
  title: string;
  isFree: boolean;
  description: string;
  cover: string;
};

export interface CoursePackApiResponse {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  cover: string;
  courses: CourseApiResponse[];
}

// 使用 import.meta.glob 批量导入课程数据
const courseModules = import.meta.glob<{
  default: Array<{ chinese: string; english: string; soundmark: string }>;
}>("~/data/courses/*.json", { eager: false });

let coursePacksCache: any[] | null = null;
async function loadCoursePacks() {
  if (coursePacksCache) return coursePacksCache;
  const mod = await import("~/data/course-packs.json");
  coursePacksCache = mod.default;
  return coursePacksCache!;
}

async function loadCourseStatements(fileName: string) {
  for (const [k, v] of Object.entries(courseModules)) {
    if (k.endsWith(`/${fileName}`)) {
      const mod = await v();
      return mod.default;
    }
  }
  throw new Error(`Course file ${fileName} not found`);
}

export async function fetchCoursePacks(): Promise<CoursePacksItem[]> {
  const packs = await loadCoursePacks();
  return packs.map((pack: any) => ({
    id: pack.id,
    title: pack.title,
    isFree: pack.isFree,
    description: pack.description,
    cover: pack.cover,
  }));
}

export async function fetchCoursePack(coursePackId: string): Promise<CoursePack> {
  const packs = await loadCoursePacks();
  const packInfo = packs.find((p: any) => p.id === coursePackId);
  if (!packInfo) throw new Error(`Course pack ${coursePackId} not found`);

  const courses: CourseApiResponse[] = await Promise.all(
    packInfo.courses.map(async (courseInfo: any) => {
      const rawStatements = await loadCourseStatements(courseInfo.file);
      return {
        id: courseInfo.id,
        title: courseInfo.title,
        description: `${packInfo.title} - ${courseInfo.title}`,
        order: courseInfo.order,
        statements: rawStatements.map(
          (item: { chinese: string; english: string; soundmark: string }, index: number) => ({
            id: `${courseInfo.id}-stmt-${index}`,
            order: index + 1,
            chinese: item.chinese,
            english: item.english,
            soundmark: item.soundmark,
            isMastered: false,
          }),
        ),
        coursePackId,
        completionCount: 0,
        statementIndex: 0,
        video: "",
      };
    }),
  );

  return {
    id: packInfo.id,
    title: packInfo.title,
    description: packInfo.description,
    isFree: packInfo.isFree,
    cover: packInfo.cover,
    courses: courses as any,
  };
}
