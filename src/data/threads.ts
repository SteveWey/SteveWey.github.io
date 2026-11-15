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
    description: "节点、场景和 GDScript。",
    notes: ["godot"],
  },
  {
    id: "programming",
    title: "编程",
    description: "数据库、TypeScript 和日常工具",
    notes: ["database", "typescript"],
  },
  {
    id: "embedded",
    title: "嵌入式",
    description: "STM32和外设驱动",
    notes: ["i2c", "oled"],
  },
];
