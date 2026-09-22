export type Data = {
  languages: {
    [key in Language]: Localization;
  };
};

export type Language =
  | "deuDE"
  | "engUS"
  | "freFR"
  | "itaIT"
  | "jpnJP"
  | "korKR"
  | "polPL"
  | "porBR"
  | "rusRU"
  | "spaAR"
  | "spaES"
  | "zhoCN"
  | "zhoTW";

export type Localization = {
  accessory: Entries;
  armor: Entries;
  containers: Containers;
  conversations: Conversations;
  item: Entries;
  magic: Entries;
  weapon: Entries;
};

export type Entries = Record<string, Entry>;

export type Entry = {
  id: string;
  dlc: DLC;
  name: string;
  description: string;
  knowledge: string;
};

export type DLC = 0 | 1 | 2;

export type Containers = Record<string, Container>;

export type Container = {
  content: Record<string, string>;
  name: string;
};

export type Conversations = Record<string, Conversation>;

export type Conversation = {
  dlc: DLC;
  id: string;
  text: string;
};
