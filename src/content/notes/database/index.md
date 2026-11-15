---
title: "数据库原理"
description: "关系模型、SQL、索引、事务和查询优化的整理。"
kind: "study"
date: 2026-06-27
updated: 2026-11-15
tags: ["数据库", "SQL"]
status: "整理中"
draft: false
---

数据库课最容易变成“背 SQL 语法”，但真正需要理解的是：**数据怎么组织、查询怎么执行、并发和故障时怎么保证正确。**

## 关系模型

- 表（relation）= 行 + 列；
- 行（tuple）= 一条记录；
- 列（attribute）= 一个字段；
- 主键：唯一标识一行；
- 外键：引用另一张表的主键。

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  published_at TEXT,
  author_id INTEGER REFERENCES users(id)
);
```

## 范式

- **1NF**：字段原子化，不把多个值塞进一个字段；
- **2NF**：非主属性完全依赖主键，而不是部分依赖；
- **3NF**：非主属性不传递依赖其他非主属性。

范式不是越高越好。读多写少的分析场景，适当反范式可以减少 join。

## SQL 执行顺序

```sql
SELECT author_id, COUNT(*) AS total
FROM posts
WHERE published_at IS NOT NULL
GROUP BY author_id
HAVING COUNT(*) > 3
ORDER BY total DESC
LIMIT 10;
```

逻辑执行顺序大致是：

```text
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

所以 `WHERE` 里不能直接用 `SELECT` 的别名，而 `ORDER BY` 通常可以。

## 索引

索引的本质是用额外空间换查找速度。常见结构是 B+ 树：

- 等值查询：`WHERE id = 1`；
- 范围查询：`WHERE created_at > '2026-01-01'`；
- 排序：`ORDER BY created_at`；
- 联合索引遵循最左前缀。

```sql
CREATE INDEX idx_posts_author_time
ON posts(author_id, published_at);
```

注意：

- 索引不是越多越好，写入也要维护索引；
- 对列做函数运算可能让索引失效；
- 低选择性字段（比如性别）单独建索引通常收益不大；
- 用 `EXPLAIN` 看执行计划，不要凭感觉优化。

## 事务

ACID：

| 特性 | 含义 |
| --- | --- |
| Atomicity | 要么全成功，要么全失败 |
| Consistency | 事务前后约束一致 |
| Isolation | 并发事务互不干扰 |
| Durability | 提交后即使崩溃也不丢 |

常见隔离级别：

- Read Uncommitted；
- Read Committed；
- Repeatable Read；
- Serializable。

隔离级别越高，并发性能通常越低。需要根据业务选择，而不是一律用最高。

## 常见问题

- **N+1 查询**：循环里查数据库，改成批量查询；
- **大事务**：锁持有太久，拆小；
- **深分页**：`OFFSET` 很大时变慢，考虑基于游标；
- **热点更新**：同一行频繁更新，考虑拆分或排队；
- **没有监控**：慢查询日志和执行计划比“猜”可靠。

## 接下来

- 用 SQLite 建一张表，插入数据；
- 对比有索引 / 无索引的 `EXPLAIN`；
- 写一个事务，模拟失败回滚；
- 再看 MVCC 和锁。

> 当前状态：整理中。先把关系模型、索引和事务串起来。
