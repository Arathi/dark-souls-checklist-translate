const BASE_URL = "https://leminerva.github.io/Dark-Souls-Documents";

async function parseEntries(baseUrl, language, game, category, property, keyGenerator) {
  const dir = `${language}${game}`;
  const fileName = `${category}_${property}.xml`;
  const url = `${baseUrl}/text/${dir}/${fileName}`;
  const res = await fetch(url);
  const xml = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const nodes = doc.querySelectorAll("entries > text[id]");
  const entries = {};
  nodes.forEach((node, index) => {
    const id = node.getAttribute("id");
    if (id == null) return;
    const text = node.textContent;
    if (text == null) return;
    if (text.startsWith("##")) return;
    const key = keyGenerator(id, index);
    entries[key] = text;
  });
  return entries;
}

async function generateDictionary(baseUrl, language) {
  const armors = await parseEntries(baseUrl, language, 3, "armor", "name", (id, index) => `armor/${id}#${index}/name`);
  const items = await parseEntries(baseUrl, language, 3, "item", "name", (id, index) => `item/${id}#${index}/name`);
  const rings = await parseEntries(baseUrl, language, 3, "ring", "name", (id, index) => `ring/${id}#${index}/name`);
  const spells = await parseEntries(baseUrl, language, 3, "magic", "name", (id, index) => `spell/${id}#${index}/name`);
  const weapons = await parseEntries(baseUrl, language, 3, "weapon", "name", (id, index) => `weapon/${id}#${index}/name`);

  const dictionary = {
    ...armors,
    ...items,
    ...rings,
    ...spells,
    ...weapons,
  };

  const content = JSON.stringify(dictionary);
  return content;
}

function parseGenericGroup(group, property, prefix) {
  const entries = {};
  Object.keys(group).forEach((key) => {
    const id = `${prefix}/${key}/${property}`;
    const entry = group[key];
    entries[id] = entry[property];
  });
  return entries;
}

function parseContainer(container, prefix) {
  const entries = {};
  Object.keys(container.content).forEach((key) => {
    const id = `${prefix}/${key}`;
    const entry = container.content[key];
    entries[id] = entry;
  });
  return entries;
}

function generateDictionary(data, language) {
  const groups = data.languages[language];
  const { accessory, armor, item, magic, weapon, containers } = groups;
  const names = {
    ...parseGenericGroup(accessory, "name", "accessory"),
    ...parseGenericGroup(armor, "name", "armor"),
    ...parseGenericGroup(item, "name", "item"),
    ...parseGenericGroup(magic, "name", "magic"),
    ...parseGenericGroup(weapon, "name", "weapon"),
    ...parseContainer(containers['NPC name'], "npc"),
    ...parseContainer(containers['NPC name_dlc1'], "npc"),
    ...parseContainer(containers['NPC name_dlc2'], "npc"),
  };
  return names;
}
