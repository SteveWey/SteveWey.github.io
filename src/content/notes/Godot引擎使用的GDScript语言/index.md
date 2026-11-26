---
title: "Godot引擎使用的GDScript语言"
description: ""
kind: "study"
date: 2026-11-26
updated: 2026-11-26
tags: ["Godot Engine","GDScript", "编程"]
status: "待补全"
draft: false
---


# Godot引擎使用的GDScript语言

GDScript 的语法设计在直观性和灵活性之间做了平衡，它借鉴了 Python 的简洁，但又有自己独特的类型系统和控制流写法。

## 变量声明

GDScript 是一种渐进类型（Gradually Typed） 语言，这意味着可以自由选择写动态类型（更灵活）或静态类型（更安全、补全更好）。

### 1.基础声明与类型推断

使用 `var` 关键字声明变量。如果不指定类型，GDScript 会动态推断。

```gdscript

var a = 5              # 动态类型，自动推断为 int
var s = "Hello"        # 自动推断为 String
var arr = [1, 2, 3]    # 自动推断为 Array

```

也可以使用 `:=` 进行类型推断，这在想利用类型推断但又想明确表示意图时很有用，尤其是在配合静态类型检查时。


```gdscript
var inferred_type := "String" # 明确推断为 String 类型
```

### 2.显式静态类型声明

在变量名后加冒号和类型，可以强制变量始终保持该类型，这能极大改善代码补全和错误检测。

```gdscript
var health: int = 100
var speed: float = 200.0
var player: Node3D = null  # 类型化为 Node3D
var target: Node2D         # 类型化但未初始化，默认为 null
```

>GDScript 的静态类型是可选的，并且主要起到约束和辅助工具的作用，不会像 C++ 或 C# 那样在编译时进行严格的类型检查。

### 3.常量（`const`）与枚举（`enum`）

`const` 用于定义编译期已知的不可变值。注意，对于数组和字典这类引用类型，`const` 只保证引用不变，但其内部内容仍然可以修改。

```gdscript
const ANSWER = 42
const MOVE_SPEED: float = 50.0
const NAMES = ["Alice", "Bob"] # 引用不可变，但 NAMES.append("C") 是允许的
```
`enum` 本质上是常量的集合，非常适合表示状态或类别。

```gdscript

enum {UNIT_NEUTRAL, UNIT_ENEMY} # 匿名枚举，值分别为 0, 1
enum Named {THING_1, THING_2, ANOTHER_THING = -1} # 命名枚举，可自定义值

```

## 数据结构

### 1.数组（Array）

使用 `[]` 字面量声明，可以包含任意类型，也可以是类型化数组。

数组可以动态调整大小，其索引从 0 开始，索引为负整数时则表示从数组尾部开始计数。

类型化数组通过 `Array[Type]` 指定，其中类型 Type 可以是 Variant 类型、内置类型，也可以是用户自定义类型、枚举类型等。不支持类型化数组嵌套（如 `Array[Array[int]]`）。

```gdscript

var arr = [1, 2, 3]
var typed_arr: Array[String] = ["sword", "shield"] # 类型化数组

```

### 2.字典 (Dictionary)

键值对数据结构。

使用 `{}` 字面量声明，支持 `"key": value` 和 Lua 风格的 `key = value` 两种语法。

```gdscript
var dict = {"key": "value", 2: 3}
var lua_style = {key = "value", other_key = 2} # 字符串键无需引号
```
推荐使用 `get(key, default)` 方法安全访问，键不存在时返回默认值，避免报错。

## 判断结构

### 基本判断结构

```gdscript
if condition :
    pass
```

### 三元表达式

GDScript 没有 `()?():()` 这种语法，而是采用 `(value_if_true) if (condition) else (value_if_false)` 的形式，读起来更接近自然语言。

```gdscript
var label = "alive" if health > 0 else "dead"
var direction = -1 if facing_left else 1
velocity.x = speed * (1.5 if sprinting else 1.0)
```

### `match`语句

GDScript 使用 `match` 作为多分支结构，比传统 `switch` 更灵活，无需 `break`，且默认分支用 `_` 表示。

```gdscript
match typeof(x):
    TYPE_FLOAT:
        print("float")
    TYPE_STRING:
        print("string")
    _:
        print("unknown")
```

>注意，match 在类型上比 == 更严格，例如 1 不会匹配 1.0。

## 循环结构

### `for` 循环

GDScript 的 `for` 循环语法是 `for 变量 in 可迭代对象:` ，专门用于遍历序列。

```gdscript
# 遍历数组
for enemy in ["slime", "bat"]:
    print(enemy)

# 使用 range() 进行数值循环
for i in range(3):          # 0, 1, 2
for i in range(1, 4):       # 1, 2, 3
for i in range(0, 10, 2):   # 0, 2, 4, 6, 8
for i in range(10, 0, -2):  # 10, 8, 6, 4, 2

# 简写形式 (Godot 4 特性)
for i in 3:                 # 等同于 range(3)

# 需要同时获取索引时，遍历 size()
for i in array.size():
    array[i] = "new value" # 遍历索引是修改数组元素的正确方式
```

> 重要细节：直接遍历数组时，循环变量是元素的副本。修改它不会影响原数组；但遍历对象（如 Node）时，通过循环变量调用方法则会生效。

