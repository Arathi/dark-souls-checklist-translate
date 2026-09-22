import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import type {
  Container,
  Data,
  Entry,
  Entries,
  Language,
} from "./dark-souls-3-text-viewer";

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

async function generate() {
  const dir = "D:\\temp\\souls";
  const dataPath = resolve(dir, "ds3.json");
  const content = await readFile(dataPath, "utf-8");
  console.info(`JSON 读取完成，长度：${content.length}`);

  const data: Data = JSON.parse(content);
  for (const key in data.languages) {
    const language = key as Language;
    console.info(`获取语言：${language}`);
    const locate = languageMapper(language);
    if (locate == "") continue;

    const localization = data.languages[language];

    const accessory = parseEntries(localization.accessory, "name", "accessory");
    const armor = parseEntries(localization.armor, "name", "armor");
    const item = parseEntries(localization.item, "name", "item");
    const magic = parseEntries(localization.magic, "name", "magic");
    const weapon = parseEntries(localization.weapon, "name", "weapon");

    const containers = localization.containers;

    const npc0 = parseContainer(containers["NPC name"], "npc");
    const npc1 = parseContainer(containers["NPC name_dlc1"], "npc");
    const npc2 = parseContainer(containers["NPC name_dlc2"], "npc");

    const dictionary = {
      ...accessory,
      ...armor,
      ...item,
      ...magic,
      ...weapon,
      ...npc0,
      ...npc1,
      ...npc2,
    };
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
) {
  const dictionary: Record<string, string> = {};
  const ids = Object.keys(entries);
  for (const id of ids) {
    const entry = entries[id];
    const key = `${prefix}/${id}/${property}`;
    const value = entry[property];
    dictionary[key] = `${value}`;
  }
  return dictionary;
}

function parseContainer(container: Container, prefix: string) {
  const dictionary: Record<string, string> = {};
  for (const id in container.content) {
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
  await generate();
}

main();
