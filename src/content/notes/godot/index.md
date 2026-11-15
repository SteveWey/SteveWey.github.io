---
title: "Godot Engine 入门"
description: "节点、场景、GDScript、信号和 2D 角色移动的最小练习。"
kind: "tech"
date: 2026-11-15
updated: 2026-11-15
tags: ["Godot", "游戏开发"]
status: "整理中"
draft: false
---

Godot 的核心不是“一个窗口 + 一堆控件”，而是**节点树**。先理解节点和场景，再写脚本，会顺很多。

## 节点与场景

- **节点（Node）**：最小功能单位，比如 `Sprite2D`、`CollisionShape2D`、`Camera2D`。
- **场景（Scene）**：一棵节点树，可以保存成 `.tscn`，也可以被另一个场景实例化。
- **根节点**：场景最上面的节点，决定这个场景的类型。

一个简单的 2D 角色场景：

```text
Player (CharacterBody2D)
├── Sprite2D
├── CollisionShape2D
└── Camera2D
```

`CharacterBody2D` 负责移动和碰撞，`Sprite2D` 负责显示，`CollisionShape2D` 负责碰撞形状。

## GDScript 基础

```gdscript
extends CharacterBody2D

@export var speed: float = 300.0

func _physics_process(delta: float) -> void:
    var direction := Input.get_vector(
        "move_left", "move_right", "move_up", "move_down"
    )
    velocity = direction * speed
    move_and_slide()
```

几个常用生命周期：

| 方法 | 用途 |
| --- | --- |
| `_ready()` | 节点进入场景树后调用一次 |
| `_process(delta)` | 每帧调用，适合动画、UI |
| `_physics_process(delta)` | 固定物理步长，适合移动和碰撞 |
| `_input(event)` | 处理输入事件 |

## 信号

信号用于解耦：子节点发出事件，父节点或其他节点响应。

```gdscript
signal health_changed(current: int, maximum: int)

func take_damage(amount: int) -> void:
    health = max(0, health - amount)
    health_changed.emit(health, max_health)
```

连接方式：

- 编辑器里点节点 → Signals 面板 → 连接；
- 代码里用 `node.signal_name.connect(callable)`。

## 场景组织

- 一个场景只做一件事：`Player`、`Enemy`、`HUD` 分开；
- 用 `@export` 暴露需要调的参数；
- 用 `@onready` 获取子节点引用：

```gdscript
@onready var sprite: Sprite2D = $Sprite2D
```

- 全局状态用 autoload，但不要把所有东西都塞进去。

## 输入映射

在 **Project Settings → Input Map** 里添加动作，比如：

```text
move_left  A / 左方向键
move_right D / 右方向键
move_up    W / 上方向键
move_down  S / 下方向键
```

代码里只引用动作名，不直接写按键，后面改键位更方便。

## 接下来

- 做一个能移动的角色；
- 加一个可拾取物，用信号通知 UI；
- 把角色、敌人、HUD 拆成独立场景；
- 再考虑 TileMap、动画树和保存系统。

> 当前状态：整理中。先把最小可运行场景跑起来，再补 Godot 4 的更多细节。
