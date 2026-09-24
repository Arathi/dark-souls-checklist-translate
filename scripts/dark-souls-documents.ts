/**
 * 语言
 */
export type Language = "eng" | "jap" | "chn";
export const LANGUAGES: Language[] = ["eng", "jap", "chn"];

/**
 * 游戏
 */
export type Game = 1 | 2 | 3;

/**
 * 分类
 */
export type Category = "armor" | "item" | "magic" | "ring" | "weapon";
export const CATEGORIES: Category[] = [
  "armor",
  "item",
  "magic",
  "ring",
  "weapon",
];

/**
 * 属性
 */
export type Property = "desc" | "name" | "remk";

/**
 * 条目
 */
export type Entry = {
  id: string;
  text: string;
};
