import type { UserLearningDailyTime } from "~/types/models/user-learning-activity";

export interface LearningTimeApiResponse {
  date: string;
  duration: number;
}

const LEARNING_TIME_KEY = "earthworm-learning-time";

interface LearningTimeRecord {
  date: string;
  duration: number;
}

function loadTimes(): LearningTimeRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LEARNING_TIME_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTimes(times: LearningTimeRecord[]) {
  localStorage.setItem(LEARNING_TIME_KEY, JSON.stringify(times));
}

interface UpdateLearningTimeParams {
  date: string;
  duration: number;
}

export async function updateDailyLearningDailyTotalTime(
  params: UpdateLearningTimeParams,
): Promise<boolean> {
  const times = loadTimes();
  const existing = times.find((t) => t.date === params.date);
  if (existing) {
    existing.duration += params.duration;
  } else {
    times.push({ date: params.date, duration: params.duration });
  }
  saveTimes(times);
  return true;
}

export async function fetchTodayLearningTime(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const times = loadTimes();
  const todayRecord = times.find((t) => t.date === today);
  return todayRecord ? todayRecord.duration : 0;
}

export async function fetchAllLearningTime(): Promise<UserLearningDailyTime[]> {
  return loadTimes();
}

export async function fetchTotalLearningTime(): Promise<number> {
  const times = loadTimes();
  return times.reduce((sum, t) => sum + t.duration, 0);
}
