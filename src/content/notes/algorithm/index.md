---
title: "算法学习笔记"
description: "复杂度、排序、查找、递归和动态规划的整理。"
kind: "study"
date: 2026-06-21
updated: 2026-11-15
tags: ["算法", "学习"]
status: "整理中"
draft: false
---

算法笔记不追求覆盖所有题，而是把**分析问题的框架**记下来。

## 复杂度

- 时间复杂度：输入规模增长时，操作次数的增长量级；
- 空间复杂度：额外使用的内存；
- 只保留最高阶项，忽略常数。

常见量级：

```text
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
```

## 二分查找

前提：数据有序。

```ts
function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}
```

易错点：

- `left <= right` 还是 `<`；
- `mid` 是否越界；
- 边界收缩是否正确。

## 排序

| 算法 | 平均时间 | 最坏 | 空间 | 稳定 |
| --- | --- | --- | --- | --- |
| 冒泡 | O(n²) | O(n²) | O(1) | 是 |
| 插入 | O(n²) | O(n²) | O(1) | 是 |
| 归并 | O(n log n) | O(n log n) | O(n) | 是 |
| 快速 | O(n log n) | O(n²) | O(log n) | 否 |
| 堆排 | O(n log n) | O(n log n) | O(1) | 否 |

工程里通常直接用语言内置排序；学习时重点理解分治和 partition。

## 递归

```ts
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
```

写递归先明确：

1. 终止条件；
2. 当前层做什么；
3. 返回值怎么合并。

## 动态规划

以爬楼梯为例：

```ts
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev = 1;
  let curr = 2;
  for (let i = 3; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}
```

步骤：

- 定义状态 `dp[i]`；
- 找转移方程；
- 确定初始值；
- 确定遍历顺序；
- 必要时压缩空间。

## 图遍历

- BFS：队列，适合最短步数；
- DFS：栈/递归，适合连通性、回溯；
- 拓扑排序：有向无环图的任务顺序；
- 并查集：动态连通性。

## 做题方法

1. 先写暴力解，确认理解题意；
2. 分析重复计算或单调性；
3. 再优化；
4. 写完手动跑边界：空数组、单元素、重复值、极值；
5. 记录错因，不只记录答案。

> 当前状态：整理中。后续补链表、树、堆和图的具体题型。
