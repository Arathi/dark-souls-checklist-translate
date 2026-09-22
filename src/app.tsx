import { useEffect, useState } from "preact/hooks";
import { Select, SelectProps } from "./components/select";
import { version } from "../package.json";

import enUS from "./i18n/dark-souls-3/en-US.json";
import jaJP from "./i18n/dark-souls-3/ja-JP.json";
import zhCN from "./i18n/dark-souls-3/zh-CN.json";
import zhTW from "./i18n/dark-souls-3/zh-TW.json";

import flex from "./components/flex.module.scss";
import styles from "./app.module.scss";
import { Dictionaries } from "./domains";
import { Language } from "./domains/language";

const { host, pathname: path } = location;
const site = `${host}${path}`;
let mode = "";
switch (site) {
  case "smcnabb.github.io/dark-souls-cheat-sheet/":
    mode = "DS";
    break;
  case "smcnabb.github.io/dark-souls-2-cheat-sheet/":
    mode = "DS2";
    break;
  case "zkjellberg.github.io/dark-souls-3-cheat-sheet/":
    mode = "DS3";
    break;
}

export function App() {
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>("en-US");
  const [secondaryLanguage, setSecondaryLanguage] = useState<Language | "">("");

  const dictionaries: Dictionaries = {
    "en-US": enUS,
    "ja-JP": jaJP,
    "zh-CN": zhCN,
    "zh-TW": zhTW,
  };

  const languageOptions: SelectProps<Language>["options"] = [
    {
      value: "en-US",
      label: "English",
    },
    {
      value: "ja-JP",
      label: "日本語",
    },
    {
      value: "zh-CN",
      label: "简体中文",
    },
    {
      value: "zh-TW",
      label: "正體中文",
    },
  ];

  const secondaryLanguageOptions: SelectProps<Language | "">["options"] = [
    {
      value: "",
      label: "无",
    },
    ...languageOptions,
  ];

  const classNames: string[] = [styles.app];

  switch (mode) {
    case "DS":
    case "DS2":
      classNames.push(styles["dark-souls"]);
      break;
    case "DS3":
      classNames.push(styles["dark-souls-3"]);
      break;
  }

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    translate();
  }, [primaryLanguage, secondaryLanguage]);

  async function initialize() {
    switch (mode) {
      case "DS":
        await initializeDarkSouls();
        break;
      case "DS2":
        await initializeDarkSouls2();
        break;
      case "DS3":
        await initializeDarkSouls3();
        break;
    }
  }

  async function initializeDarkSouls() {
    console.info("正在初始化 Dark Souls Cheat Sheet");
  }

  async function initializeDarkSouls2() {
    console.info("正在初始化 Dark Souls 2 Cheat Sheet");
  }

  async function initializeDarkSouls3() {
    console.info("正在初始化 Dark Souls 3 Cheat Sheet");

    const dictionary = dictionaries["en-US"];
    if (dictionary == null) {
      console.error("英文字典加載失败！");
      return;
    }

    const mapper: Record<string, string> = {};
    for (const [key, value] of Object.entries(dictionary)) {
      const text = value.trim();
      mapper[text] = key;
    }

    const links = document.querySelectorAll<HTMLAnchorElement>("a");
    for (const link of links) {
      const value = link.textContent ?? "";
      const text = value.trim();
      const key = mapper[text];
      if (key != null) {
        link.setAttribute("data-dict-key", key);
      }
    }
  }

  async function translate() {
    const texts = document.querySelectorAll("[data-dict-key]");
    for (const text of texts) {
      const key = text.getAttribute("data-dict-key");
      if (key == null) {
        continue;
      }

      let content = `${key}`;

      const primaryDictionary = dictionaries[primaryLanguage];

      if (primaryDictionary != null) {
        const translated = primaryDictionary[key];
        if (translated != null) {
          content = translated;
        }
      }

      if (secondaryLanguage != "") {
        const secondaryDictionary = dictionaries[secondaryLanguage];
        if (secondaryDictionary != null) {
          const translated = secondaryDictionary[key];
          if (translated != null) {
            content = `${content} (${translated})`;
          }
        }
      }

      text.textContent = content;
    }
  }

  return (
    <div className={classNames.join(" ")}>
      <div className={flex.row}>
        <div className={styles.mode}>{mode}</div>
        <div className={styles.version}>v{version}</div>
      </div>

      <div className={styles["form-item"]}>
        <label className={styles["form-item-label"]}>主要语言</label>
        <div className={styles["form-item-value"]}>
          <Select<Language>
            value={primaryLanguage}
            options={languageOptions}
            onChange={(value) => {
              setPrimaryLanguage(value);
            }}
          />
        </div>
      </div>

      <div className={styles["form-item"]}>
        <label className={styles["form-item-label"]}>次要语言</label>
        <div className={styles["form-item-value"]}>
          <Select
            value={secondaryLanguage}
            options={secondaryLanguageOptions}
            onChange={(value) => {
              setSecondaryLanguage(value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
