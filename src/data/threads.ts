export type Thread = {
  id: string;
  title: string;
  description?: string;
  tag: string;
};

export const threads: Thread[] = [
  {
    id: "godot",
    title: "Godot Engine",
    description: "",
    tag: "Godot",
  },
  {
    id: "programming",
    title: "编程",
    description: "数据库、TypeScript 和日常工具",
    tag: "编程",
  },
  {
    id: "embedded",
    title: "嵌入式",
    description: "STM32和外设驱动",
    tag: "嵌入式",
  },
];
