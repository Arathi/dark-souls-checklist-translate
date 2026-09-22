import { CSSProperties } from "preact";
import styles from "./index.module.scss";

type Values = string | number;

type Props<V extends Values = Values> = {
  options?: Option<V>[];
  value?: V;
  onChange?: (value: V) => void;
  style?: CSSProperties;
};

type Option<V extends Values = Values> = {
  value: V;
  label: string;
  disabled?: boolean;
};

export function Select<V extends Values = Values>({
  options = [],
  value,
  onChange,
  style,
}: Props<V>) {
  const optionNodes: any[] = [];
  options.forEach((option, index) => {
    const { value, label, disabled } = option;
    optionNodes.push(
      <option key={`${index}:${value}`} value={value} disabled={disabled}>
        { label }
      </option>
    );
  });

  return (
    <select
      className={styles.select}
      style={style}
      value={value}
      onChange={(e) => {
        const value = e.currentTarget.value;
        if (onChange != null) {
          onChange(value as V);
        }
      }}
    >
      { optionNodes }
    </select>
  );
};

export type { Props as SelectProps };
