import type { Language } from "./language";

export type Dictionary = Record<string, string>;

export type Dictionaries = {
  [language in Language]?: Dictionary;
};
