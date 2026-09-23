import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import type {
  Container,
  Data,
  Entry,
  Entries,
  Language,
} from "./dark-souls-3-text-viewer";

export type Dictionary = Record<string, string>;
export type Dictionaries = {
  [key in Language]?: Dictionary;
};

function languageMapper(language: Language): string {
  let locate = "";
  switch (language) {
    case "engUS":
      locate = "en-US";
      break;
    case "jpnJP":
      locate = "ja-JP";
      break;
    case "zhoCN":
      locate = "zh-CN";
      break;
    case "zhoTW":
      locate = "zh-TW";
      break;
  }
  return locate;
}

async function generate(dir: string) {
  const dataPath = resolve(dir, "ds3.json");
  const content = await readFile(dataPath, "utf-8");
  console.info(`JSON 读取完成，长度：${content.length}`);

  const languages: Language[] = ["engUS", "jpnJP", "zhoCN", "zhoTW"];
  const dictionaries: Dictionaries = {};

  const patches: Dictionaries = {
    "engUS": {
      "magic/1740000": "Pestilent Mist",
    },
    "jpnJP": {
      "magic/1740000": "致死の白霧",
    },
    "zhoCN": {
      "magic/1740000": "致命白雾",
    },
    "zhoTW": {
      "magic/1740000": "致命白霧",
    },
  };

  const data: Data = JSON.parse(content);
  for (const language of languages) {
    console.info(`正在解析字典：${language}`);
    const l10n = data.languages[language];
    const containers = l10n.containers;

    const accessory = parseEntries(l10n.accessory, "name", "accessory");
    const armor = parseEntries(l10n.armor, "name", "armor");
    const item = parseEntries(l10n.item, "name", "item");
    const magic = parseEntries(l10n.magic, "name", "magic");
    const weapon = parseEntries(l10n.weapon, "name", "weapon");
    const npc0 = parseContainer(containers["NPC name"], "npc");
    const npc1 = parseContainer(containers["NPC name_dlc1"], "npc");
    const npc2 = parseContainer(containers["NPC name_dlc2"], "npc");
    const place0 = parseContainer(containers["Place name"], "place");
    const place1 = parseContainer(containers["Place name_dlc1"], "place");
    const place2 = parseContainer(containers["Place name_dlc2"], "place");
    const gestureIds = [
      "301001",
      "301002",
      "301003",
      "301004",
      "301005",
      "301006",
      "301007",
      "301008",
      "301009",
      "301010",
      "301011",
      "301012",
      "301013",
      "301014",
      "301015",
      "301016",
      "301117",
      "301118",
      "301119",
      "301120",
      "301121",
      "301122",
      "301123",
      "301124",
      "301125",
      "301126",
      "301127",
      "301128",
      "301129",
      "301130",
      "301131",
      "301132",
      "301133",
      "301134",
      "301136",
      "301137",
      "301138",
      "301139",
    ];
    const gesture = parseContainer(containers["FDP_menu text"], "gesture", gestureIds);

    const patch = patches[language] ?? {};

    const dictionary = {
      ...accessory,
      ...armor,
      ...item,
      ...magic,
      ...weapon,
      ...npc0,
      ...npc1,
      ...npc2,
      ...place0,
      ...place1,
      ...place2,
      ...gesture,
      ...patch,
    };
    dictionaries[language] = dictionary;
  }

  const keys = new Set<string>();
  for (const language of languages) {
    const locate = languageMapper(language);
    if (locate == "") continue;
    
    const dictionary = dictionaries[language];
    if (dictionary == null) continue;

    for (const key in dictionary) {
      keys.add(key);
    }

    // const outputFileName = `${locate}.json`;
    // await output(dir, outputFileName, dictionary);
    // console.info(`${outputFileName} 导出完成`);
  }

  keys.forEach((key) => {
    let counter = 0;
    for (const language of languages) {
      const dictionary = dictionaries[language];
      if (dictionary == null) continue;

      const value = dictionary[key];
      if (value != null) counter++;
    }

    if (counter != languages.length) {
      console.warn(`${key} 的数量与字典数量不符：${counter}`);

      for (const language of languages) {
        const dictionary = dictionaries[language];
        if (dictionary == null) continue;
        delete dictionary[key];
      }
    }
  });
  
  for (const language of languages) {
    const locate = languageMapper(language);
    if (locate == "") continue;
    
    const dictionary = dictionaries[language];
    if (dictionary == null) continue;

    const outputFileName = `${locate}.json`;
    await output(dir, outputFileName, dictionary);
    console.info(`${outputFileName} 导出完成`);
  }
}

type EntryProperty = keyof Entry;
function parseEntries(
  entries: Entries,
  property: EntryProperty,
  prefix: string,
  ids: string[] = [],
) {
  const dictionary: Record<string, string> = {};
  if (ids.length == 0) {
    console.info(`未提供 ${prefix} 的 id 列表`);
    ids = Object.keys(entries);
  }
  for (const id of ids) {
    const entry = entries[id];
    const key = `${prefix}/${id}/${property}`;
    const value = entry[property];
    dictionary[key] = `${value}`;
  }
  return dictionary;
}

function parseContainer(
  container: Container,
  prefix: string,
  ids: string[] = [],
) {
  const dictionary: Record<string, string> = {};
  if (ids.length == 0) {
    console.info(`未提供 ${prefix} 的 id 列表`);
    ids = Object.keys(container.content);
  }
  for (const id of ids) {
    const value = container.content[id];
    const key = `${prefix}/${id}`;
    dictionary[key] = `${value}`;
  }
  return dictionary;
}

async function output(dir: string, fileName: string, data: any) {
  await mkdir(dir, { recursive: true });
  const path = resolve(dir, fileName);
  const json = JSON.stringify(data);
  await writeFile(path, json);
}

async function main() {
  const workdir = process.cwd();
  const dir = resolve(workdir, "data");
  await generate(dir);
}

main();
