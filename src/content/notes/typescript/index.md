---
title: "TypeScript"
description: "类型系统、泛型、联合类型和日常工程写法的整理。"
kind: "study"
date: 2026-11-15
updated: 2026-11-15
tags: ["编程", "TypeScript"]
status: "整理中"
draft: false
---

TypeScript 不是“给 JavaScript 加注解”这么简单，它真正有用的地方是：**把约束写进代码，让错误在编辑器里出现，而不是上线后出现。**

## 基础类型

```ts
let title: string = "hello";
let count: number = 1;
let enabled: boolean = true;
let tags: string[] = ["ts", "web"];
let pair: [string, number] = ["age", 18];
```

类型推断通常够用，不需要到处写注解：

```ts
const name = "Steve"; // string
const ids = [1, 2, 3]; // number[]
```

## interface 与 type

```ts
interface User {
  id: string;
  name: string;
  email?: string;
}

type Status = "draft" | "published" | "archived";
```

- `interface` 更适合描述对象结构，可扩展；
- `type` 更适合联合类型、映射类型和组合；
- 两者不是非此即彼，团队统一即可。

## 联合类型与收窄

```ts
type Result =
  | { ok: true; data: string }
  | { ok: false; error: Error };

function handle(result: Result) {
  if (result.ok) {
    console.log(result.data);
  } else {
    console.error(result.error.message);
  }
}
```

`result.ok` 的判断会自动收窄类型，不需要强制断言。

## 泛型

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

泛型的目的不是炫技，而是让“输入和输出之间的关系”被类型系统记住。

## 类型守卫

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function print(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase());
  }
}
```

`unknown` 比 `any` 安全：使用前必须收窄。

## 常用工具类型

| 工具类型 | 作用 |
| --- | --- |
| `Partial<T>` | 所有属性变可选 |
| `Required<T>` | 所有属性变必填 |
| `Pick<T, K>` | 选一部分属性 |
| `Omit<T, K>` | 去掉一部分属性 |
| `Record<K, V>` | 构造键值对象 |
| `ReturnType<F>` | 取函数返回值类型 |

```ts
type UserPreview = Pick<User, "id" | "name">;
type UserPatch = Partial<Omit<User, "id">>;
```

## 模块

```ts
export type { User } from "./types";
export { createUser } from "./user";
```

- 类型导入用 `import type`，避免运行时导入；
- 不要用 `namespace` 代替模块；
- 公共 API 明确导出，内部实现不要暴露。

## 日常建议

- 先写业务，再抽类型；不要一开始设计庞大的类型系统；
- 边界处（API、表单、localStorage）用 `unknown` + 校验；
- 能用联合类型表达的状态，不要用多个布尔值；
- `any` 只作为临时逃生口，并加注释；
- 类型不是测试，运行时校验仍然需要。

> 当前状态：整理中。后续补 `tsconfig`、装饰器和类型体操的笔记。
