import type { MasteredElement, MasteredElementContent } from "~/types";

export interface ElementItemApiResponse {
  content: {
    english: string;
  };
  masteredAt: string;
  id: string;
}

const MASTERED_KEY = "earthworm-mastered-elements";

function loadElements(): MasteredElement[] {
  try {
    return JSON.parse(localStorage.getItem(MASTERED_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveElements(elements: MasteredElement[]) {
  localStorage.setItem(MASTERED_KEY, JSON.stringify(elements));
}

let idCounter = Date.now();

export async function fetchAddMasteredElement(
  content: MasteredElementContent,
): Promise<MasteredElement> {
  const elements = loadElements();

  // 检查是否已存在
  const existing = elements.find(
    (e) => e.content.english.toLowerCase() === content.english.toLowerCase(),
  );
  if (existing) return existing;

  const newElement: MasteredElement = {
    id: `local-${idCounter++}`,
    content: { english: content.english },
    masteredAt: new Date().toISOString(),
  };
  elements.unshift(newElement);
  saveElements(elements);
  return newElement;
}

export async function fetchGetMasteredElements(): Promise<MasteredElement[]> {
  return loadElements();
}

export async function fetchRemoveMasteredElements(elementId: string): Promise<boolean> {
  const elements = loadElements();
  const filtered = elements.filter((e) => e.id !== elementId);
  saveElements(filtered);
  return true;
}
