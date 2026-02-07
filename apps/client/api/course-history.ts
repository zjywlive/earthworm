import type { CourseHistory } from "~/types";

export interface CourseHistoryApiResponse {
  courseId: string;
  completionCount: number;
}

const HISTORY_KEY = "earthworm-course-history";

function getHistory(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
  } catch {
    return {};
  }
}

export async function fetchCourseHistory(coursePackId: string): Promise<CourseHistory[]> {
  const history = getHistory();
  const results: CourseHistory[] = [];

  for (const [key, count] of Object.entries(history)) {
    if (key.startsWith(`${coursePackId}:`)) {
      const courseId = key.split(":")[1];
      results.push({ courseId, completionCount: count });
    }
  }

  return results;
}
