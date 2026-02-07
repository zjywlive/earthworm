import type { DailySentence } from "~/types";

export interface DailySentenceApiResponse {
  zh: string;
  en: string;
}

// 内置名句库，本地轮换
const sentences: DailySentenceApiResponse[] = [
  { en: "The only way to do great work is to love what you do.", zh: "做出伟大工作的唯一方法就是热爱你所做的事。" },
  { en: "In the middle of difficulty lies opportunity.", zh: "困难之中蕴含着机遇。" },
  { en: "Life is what happens when you're busy making other plans.", zh: "生活就是当你忙于制定其他计划时所发生的事。" },
  { en: "The journey of a thousand miles begins with a single step.", zh: "千里之行，始于足下。" },
  { en: "To be, or not to be, that is the question.", zh: "生存还是毁灭，这是一个问题。" },
  { en: "Knowledge is power.", zh: "知识就是力量。" },
  { en: "Practice makes perfect.", zh: "熟能生巧。" },
  { en: "Where there is a will, there is a way.", zh: "有志者事竟成。" },
  { en: "Actions speak louder than words.", zh: "行动胜于言语。" },
  { en: "Every moment is a fresh beginning.", zh: "每一刻都是崭新的开始。" },
  { en: "Believe you can and you're halfway there.", zh: "相信你能做到，你就已经成功了一半。" },
  { en: "The best time to plant a tree was 20 years ago. The second best time is now.", zh: "种一棵树最好的时间是20年前，其次是现在。" },
];

export async function fetchDailySentence(): Promise<DailySentence> {
  // 每天返回不同的句子
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % sentences.length;
  return sentences[dayIndex];
}
