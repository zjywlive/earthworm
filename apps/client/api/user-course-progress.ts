import type { UserProgress, UserRecentCoursePack } from "~/types";

export interface UserProgressApiResponse {
  courseId: string;
}
export interface UserRecentCoursePackApiResponse {
  id: number;
  coursePackId: string;
  courseId: string;
  title: string;
  description: string;
  cover: string;
  isFree: boolean;
}

export interface UserProgressUpdate {
  coursePackId: string;
  courseId: string;
  statementIndex: number;
}

const PROGRESS_KEY = "earthworm-progress";
const RECENT_KEY = "earthworm-recent-packs";

function getProgress(): Record<string, { courseId: string; statementIndex: number }> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

export async function fetchUpdateCourseProgress(
  userProgressUpdate: UserProgressUpdate,
): Promise<UserProgress> {
  const progress = getProgress();
  progress[userProgressUpdate.coursePackId] = {
    courseId: userProgressUpdate.courseId,
    statementIndex: userProgressUpdate.statementIndex,
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

  // 更新最近使用记录
  updateRecent(userProgressUpdate.coursePackId, userProgressUpdate.courseId);

  return { courseId: userProgressUpdate.courseId };
}

function updateRecent(coursePackId: string, courseId: string) {
  try {
    const recent: any[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const filtered = recent.filter((r) => r.coursePackId !== coursePackId);
    filtered.unshift({ coursePackId, courseId, updatedAt: new Date().toISOString() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 10)));
  } catch {
    // ignore
  }
}

export async function fetchUserRecentCoursePacks(): Promise<UserRecentCoursePack[]> {
  try {
    const recent: any[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return recent.map((r, i) => ({
      id: i,
      coursePackId: r.coursePackId,
      courseId: r.courseId,
      title: "",
      description: "",
      cover: "",
      isFree: true,
    }));
  } catch {
    return [];
  }
}
