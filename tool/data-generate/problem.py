#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题目生成器
根据API接口生成10道编程题目
"""

import requests
import json
import time
import random
from typing import Dict, List, Any

# API配置
API_BASE_URL = "http://localhost:9090/api"
HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

class ProblemGenerator:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
    
    def create_problem(self, problem_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建题目"""
        url = f"{self.base_url}/problem/add"
        
        try:
            response = self.session.post(url, json=problem_data)
            response.raise_for_status()
            result = response.json()
            
            # 检查响应状态
            if result.get('code') in [0, 200]:
                print(f"✅ 成功创建题目: {problem_data['title']}")
                return result
            else:
                print(f"❌ 创建题目失败: {result.get('msg', '未知错误')}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 网络请求失败: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析失败: {e}")
            return None

    def generate_problems(self) -> List[Dict[str, Any]]:
        """生成10道题目的数据"""
        problems = [
            {
                "title": "两数之和",
                "description": """## 题目描述

给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出 **和为目标值** `target` 的那 **两个** 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。

## 示例

**示例 1：**

```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
```

**示例 2：**

```
输入：nums = [3,2,4], target = 6
输出：[1,2]
```

**示例 3：**

```
输入：nums = [3,3], target = 6
输出：[0,1]
```

## 提示

- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- -10⁹ ≤ target ≤ 10⁹
- **只会存在一个有效答案**

## 进阶

你可以想出一个时间复杂度小于 O(n²) 的算法吗？""",
                "difficulty": 1,
                "timeLimit": 1000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "[2,7,11,15]\n9",
                "testOutput": "[0,1]"
            },
            {
                "title": "回文数",
                "description": """## 题目描述

给你一个整数 `x` ，如果 `x` 是一个回文整数，返回 `true` ；否则，返回 `false` 。

回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。

例如，`121` 是回文，而 `123` 不是。

## 示例

**示例 1：**

```
输入：x = 121
输出：true
```

**示例 2：**

```
输入：x = -121
输出：false
解释：从左向右读, 为 -121 。 从右向左读, 为 121- 。因此它不是一个回文数。
```

**示例 3：**

```
输入：x = 10
输出：false
解释：从右向左读, 为 01 。因此它不是一个回文数。
```

## 提示

- -2³¹ ≤ x ≤ 2³¹ - 1

## 进阶

你能不将整数转为字符串来解决这个问题吗？""",
                "difficulty": 1,
                "timeLimit": 1000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "121",
                "testOutput": "true"
            },
            {
                "title": "最长公共前缀",
                "description": """## 题目描述

编写一个函数来查找字符串数组中的最长公共前缀。

如果不存在公共前缀，返回空字符串 `""`。

## 示例

**示例 1：**

```
输入：strs = ["flower","flow","flight"]
输出："fl"
```

**示例 2：**

```
输入：strs = ["dog","racecar","car"]
输出：""
解释：输入不存在公共前缀。
```

## 提示

- 1 ≤ strs.length ≤ 200
- 0 ≤ strs[i].length ≤ 200
- `strs[i]` 仅由小写英文字母组成""",
                "difficulty": 1,
                "timeLimit": 1000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "[\"flower\",\"flow\",\"flight\"]",
                "testOutput": "\"fl\""
            },
            {
                "title": "有效的括号",
                "description": """## 题目描述

给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串 `s` ，判断字符串是否有效。

有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。

## 示例

**示例 1：**

```
输入：s = "()"
输出：true
```

**示例 2：**

```
输入：s = "()[]{}"
输出：true
```

**示例 3：**

```
输入：s = "(]"
输出：false
```

## 提示

- 1 ≤ s.length ≤ 10⁴
- `s` 仅由括号 `'()[]{}'` 组成""",
                "difficulty": 1,
                "timeLimit": 1000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "()",
                "testOutput": "true"
            },
            {
                "title": "合并两个有序链表",
                "description": """## 题目描述

将两个升序链表合并为一个新的 **升序** 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

## 示例

**示例 1：**

```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

**示例 2：**

```
输入：l1 = [], l2 = []
输出：[]
```

**示例 3：**

```
输入：l1 = [], l2 = [0]
输出：[0]
```

## 提示

- 两个链表的节点数目范围是 `[0, 50]`
- `-100 ≤ Node.val ≤ 100`
- `l1` 和 `l2` 均按 **非递减顺序** 排列

## 链表定义

```cpp
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
```""",
                "difficulty": 1,
                "timeLimit": 1000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "[1,2,4]\n[1,3,4]",
                "testOutput": "[1,1,2,3,4,4]"
            },
            {
                "title": "无重复字符的最长子串",
                "description": """## 题目描述

给定一个字符串 `s` ，请你找出其中不含有重复字符的 **最长子串** 的长度。

## 示例

**示例 1:**

```
输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

**示例 2:**

```
输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。
```

**示例 3:**

```
输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
```

## 提示

- 0 ≤ s.length ≤ 5 * 10⁴
- `s` 由英文字母、数字、符号和空格组成""",
                "difficulty": 2,
                "timeLimit": 1000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "\"abcabcbb\"",
                "testOutput": "3"
            },
            {
                "title": "盛最多水的容器",
                "description": """## 题目描述

给定一个长度为 `n` 的整数数组 `height` 。有 `n` 条垂线，第 `i` 条线的两个端点是 `(i, 0)` 和 `(i, height[i])` 。

找出其中的两条线，使得它们与 `x` 轴共同构成的容器可以容纳最多的水。

返回容器可以储存的最大水量。

**说明：**你不能倾斜容器。

## 示例

**示例 1：**

```
输入：[1,8,6,2,5,4,8,3,7]
输出：49 
解释：图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49。
```

**示例 2：**

```
输入：height = [1,1]
输出：1
```

## 提示

- n == height.length
- 2 ≤ n ≤ 10⁵
- 0 ≤ height[i] ≤ 10⁴""",
                "difficulty": 2,
                "timeLimit": 1000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "[1,8,6,2,5,4,8,3,7]",
                "testOutput": "49"
            },
            {
                "title": "三数之和",
                "description": """## 题目描述

给你一个整数数组 `nums` ，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足 `i != j`、`i != k` 且 `j != k` ，同时还满足 `nums[i] + nums[j] + nums[k] == 0` 。

请你返回所有和为 `0` 且不重复的三元组。

**注意：**答案中不可以包含重复的三元组。

## 示例

**示例 1：**

```
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。
不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。
注意，输出的顺序和三元组的顺序并不重要。
```

**示例 2：**

```
输入：nums = [0,1,1]
输出：[]
解释：唯一可能的三元组和不为 0 。
```

**示例 3：**

```
输入：nums = [0,0,0]
输出：[[0,0,0]]
解释：唯一可能的三元组和为 0 。
```

## 提示

- 3 ≤ nums.length ≤ 3000
- -10⁵ ≤ nums[i] ≤ 10⁵""",
                "difficulty": 2,
                "timeLimit": 2000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "[-1,0,1,2,-1,-4]",
                "testOutput": "[[-1,-1,2],[-1,0,1]]"
            },
            {
                "title": "接雨水",
                "description": """## 题目描述

给定 `n` 个非负整数表示每个宽度为 `1` 的柱子的高度图，计算按此排列的柱子，下雨之后能够接多少雨水。

## 示例

**示例 1：**

```
输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6
解释：上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）。 
```

**示例 2：**

```
输入：height = [4,2,0,3,2,5]
输出：9
```

## 提示

- n == height.length
- 1 ≤ n ≤ 2 * 10⁴
- 0 ≤ height[i] ≤ 3 * 10⁴""",
                "difficulty": 3,
                "timeLimit": 2000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "[0,1,0,2,1,0,1,3,2,1,2,1]",
                "testOutput": "6"
            },
            {
                "title": "正则表达式匹配",
                "description": """## 题目描述

给你一个字符串 `s` 和一个字符规律 `p`，请你来实现一个支持 `'.'` 和 `'*'` 的正则表达式匹配。

- `'.'` 匹配任意单个字符
- `'*'` 匹配零个或多个前面的那一个元素

所谓匹配，是要涵盖 **整个** 字符串 `s` 的，而不是部分字符串。

## 示例

**示例 1：**

```
输入：s = "aa", p = "a"
输出：false
解释："a" 无法匹配 "aa" 整个字符串。
```

**示例 2:**

```
输入：s = "aa", p = "a*"
输出：true
解释：因为 '*' 代表可以匹配零个或多个前面的那一个元素, 在这里前面的元素就是 'a'。因此，字符串 "aa" 可被视为 'a' 重复了一次。
```

**示例 3：**

```
输入：s = "ab", p = ".*"
输出：true
解释：".*" 表示可匹配零个或多个（'*'）任意字符（'.'）。
```

## 提示

- 1 ≤ s.length ≤ 20
- 1 ≤ p.length ≤ 30
- `s` 只包含从 `a-z` 的小写字母。
- `p` 只包含从 `a-z` 的小写字母，以及字符 `.` 和 `*`。
- 保证每次出现字符 `*` 时，前面都匹配到有效的字符""",
                "difficulty": 3,
                "timeLimit": 2000,
                "memoryLimit": 256,
                "status": 1,
                "testInput": "\"aa\"\n\"a*\"",
                "testOutput": "true"
            }
        ]
        return problems
    
    def run(self):
        """运行题目生成器"""
        print("🚀 开始生成题目...")
        print(f"📡 API地址: {self.base_url}")
        print("-" * 50)
        
        problems = self.generate_problems()
        success_count = 0
        failed_count = 0
        
        for i, problem in enumerate(problems, 1):
            print(f"\n📝 正在创建第 {i} 道题目...")
            result = self.create_problem(problem)
            
            if result:
                success_count += 1
                if result.get('data'):
                    print(f"   题目ID: {result.get('data')}")
            else:
                failed_count += 1
            
            # 添加延迟，避免请求过于频繁
            if i < len(problems):
                time.sleep(0.5)
        
        print("\n" + "=" * 50)
        print(f"📊 生成完成统计:")
        print(f"   ✅ 成功: {success_count} 道题目")
        print(f"   ❌ 失败: {failed_count} 道题目")
        print(f"   📈 成功率: {success_count/(success_count+failed_count)*100:.1f}%")
        print("=" * 50)

def main():
    """主函数"""
    generator = ProblemGenerator()
    generator.run()

if __name__ == "__main__":
    main()