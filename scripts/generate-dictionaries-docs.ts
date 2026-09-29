import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DOMParser } from "@xmldom/xmldom";

import type {
  Category,
  Property,
  Game,
  Entry,
  Language,
} from "./dark-souls-documents";
import { LANGUAGES, CATEGORIES } from "./dark-souls-documents";

type Dictionary = Record<string, string>;
type Word = {
  game: Game;
  index: number;
  chinese: string;
  japanese: string;
  english: string;
};
type NPC = Word;
type Place = Word;

export async function loadDocument(
  baseDir: string,
  language: Language,
  game: Game,
  category: Category,
  property: Property,
): Promise<Entry[]> {
  const dir = `${language}${game}`;
  const fileName = `${category}_${property}.xml`;
  const path = resolve(baseDir, "text", dir, fileName);
  console.info(`正在加载: ${fileName}`);

  let xml = await readFile(path, { encoding: "utf-8" });
  if (xml.startsWith('\uFEFF')) {
    xml = xml.slice(1);
  }

  const parser = new DOMParser();
  const dom = parser.parseFromString(xml, "text/xml");
  console.info(`DOM加载成功:`, fileName);
  
  const entries: Entry[] = [];
  const roots = dom.getElementsByTagName("entries");
  if (roots.length != 1) {
    return entries;
  }

  const root = roots[0];
  const nodes = root.getElementsByTagName("text");
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];

    const id = node.getAttribute("id");
    if (id == null) continue;
    
    const text = node.textContent;
    if (text == null) continue;

    entries.push({
      id,
      text,
    });
  }

  return entries;
}

async function buildDictionary(
  baseDir: string,
  language: Language,
  game: Game,
  categories: Category[] = CATEGORIES,
  properties: Property[] = ["name"],
): Promise<Dictionary> {
  let dictionary: Record<string, string> = {};
  for (const category of categories) {
    for (const property of properties) {
      const entries = await loadDocument(
        baseDir,
        language,
        game,
        category,
        property,
      );

      entries.forEach((entry) => {
        const { id, text } = entry;
        if (text.startsWith("##")) return;
        const key = `${category}:${id}/${property}`;
        dictionary[key] = text;
      });
    }
  }
  const npcs = await loadNPCs(baseDir, language, game);
  const places = await loadPlaces(baseDir, language, game);
  dictionary = {
    ...dictionary,
    ...npcs,
    ...places,
  };
  return dictionary;
}

async function loadNPCs(
  baseDir: string,
  language: Language,
  game: Game,
  fileName: string = "npcs.json",
) {
  const path = resolve(baseDir, fileName);
  const json = await readFile(path, { encoding: 'utf-8' });
  const items = JSON.parse(json) as NPC[];
  const dictionary: Record<string, string> = {};

  for (const item of items) {
    if (item.game != game) continue;
    const key = `npc:${item.index}/name`;
    let name = `[NPC_${item.index}_NAME]`;
    switch (language) {
      case "chn":
        name = item.chinese;
        break;
      case "jap":
        name = item.japanese;
        break;
      case "eng":
        name = item.english;
        break;
    }
    dictionary[key] = name;
  }

  const amount = Object.keys(dictionary).length;
  console.info(`加载 DS${game} ${language} NPC名称 ${amount} 个`);
  return dictionary;
}

async function loadPlaces(
  baseDir: string,
  language: Language,
  game: Game,
  fileName: string = "maps.json",
) {
  const path = resolve(baseDir, fileName);
  const json = await readFile(path, { encoding: 'utf-8' });
  const items = JSON.parse(json) as Place[];
  const dictionary: Record<string, string> = {};

  for (const item of items) {
    if (item.game != game) continue;
    const key = `place:${item.index}/name`;
    let name = `[PLACE_${item.index}_NAME]`;
    switch (language) {
      case "chn":
        name = item.chinese;
        break;
      case "jap":
        name = item.japanese;
        break;
      case "eng":
        name = item.english;
        break;
    }
    dictionary[key] = name;
  }

  const amount = Object.keys(dictionary).length;
  console.info(`加载 DS${game} ${language} 地名 ${amount} 个`);
  return dictionary;
}

async function generateDictionary(
  baseDir: string,
  language: Language,
  game: Game,
) {
  let dictionary = await buildDictionary(
    baseDir,
    language,
    game,
  );

  let locate = "";
  switch (language) {
    case "eng":
      locate = "en-US";
      break;
    case "jap":
      locate = "ja-JP";
      break;
    case "chn":
      locate = "zh-CN";
      break;
  }
  if (locate == "") {
    console.warn("无效的语言：", locate);
    return;
  }

  let subDir = "dark-souls";
  switch (game) {
    case 1:
      subDir = "dark-souls";
      break;
    case 2:
      subDir = "dark-souls-2";
      break;
    case 3:
      subDir = "dark-souls-3";
      break;
  }

  const fileName = `${locate}.json`;
  const path = resolve(baseDir, subDir, fileName);
  const content = JSON.stringify(dictionary, null, '  ');
  await writeFile(path, content);
}

async function generateDictionaries(
  baseDir: string,
  game: Game,
  languages: Language[] = LANGUAGES,
) {
  for (const language of languages) {
    await generateDictionary(baseDir, language, game);
  }
}

async function main() {
  const workDir = process.cwd();
  const baseDir = resolve(workDir, "data");
  await generateDictionaries(baseDir, 1);
  await generateDictionaries(baseDir, 2);
}

main();
