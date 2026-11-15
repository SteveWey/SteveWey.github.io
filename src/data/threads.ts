export type Thread = {
  id: string;
  title: string;
  description?: string;
  notes: string[];
};

export const threads: Thread[] = [
  {
    id: "godot",
    title: "Godot Engine",
    description: "引擎基础、场景和脚本，慢慢补。",
    notes: [],
  },
  {
    id: "programming",
    title: "编程",
    description: "数据库、TypeScript 和日常工具。",
    notes: ["database", "typescript"],
  },
  {
    id: "embedded",
    title: "嵌入式",
    description: "STM32、I2C 和外设驱动。",
    notes: ["i2c", "oled"],
  },
];
