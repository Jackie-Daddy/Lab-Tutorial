# vscode & cursor & windsurf 如何远程 debug 代码

## 前言

在服务器上跑代码时，最难受的就是只能靠 `print` 调试。其实 VSCode / Cursor / Windsurf（它们都基于 VSCode，操作完全一致）都能**远程断点调试**：在本地编辑器里打断点、单步、看变量，而代码实际运行在服务器上。

核心工具是 `debugpy`：它在服务器上启动你的 Python 程序并开一个调试端口，编辑器再「attach（附加）」到这个端口，双方就连上了。

## 整体流程

1. 服务器上安装 `debugpy`
2. 找一个空闲端口
3. 编辑器里配置 `launch.json`
4. 服务器上用 `debugpy` 启动程序
5. 编辑器里按 F5 附加，开始调试

## 步骤一：安装 debugpy

在服务器上（确保是你跑代码用的那个 Python 环境）：

```bash
pip install debugpy
```

## 步骤二：找一个空闲端口

调试端口不能和别人撞。下面这条命令会在动态端口段（49152–65535）里随机挑一个当前没被占用的端口：

```bash
comm -23 <(seq 49152 65535 | sort) <(ss -tuln | awk '{print $4}' | cut -d':' -f2 | sort -u) | shuf | head -n 1
```

记下输出的端口号，下面统一用 `<PORT>` 代指。

## 步骤三：配置 launch.json

在编辑器里打开「运行和调试」面板（左侧虫子图标，或 `Ctrl+Shift+D`），点击「创建 launch.json 文件」，把内容替换为：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Attach",
            "type": "debugpy",
            "request": "attach",
            "connect": {
                "host": "localhost",
                "port": <PORT>
            }
        }
    ]
}
```

把 `<PORT>` 换成上一步选出的端口号。

> 说明：`"host": "localhost"` 适用于你通过 VSCode 的 Remote-SSH 直接连在服务器上（最常见的用法）。如果是本地编辑器连远程端口，需要先做 SSH 端口转发：`ssh -L <PORT>:localhost:<PORT> user@server`，编辑器仍然连 `localhost`。
> 新版插件 `type` 用 `debugpy`；老版本可能仍写 `python`，两者择一即可。

## 步骤四：以调试模式启动程序

在服务器上用 `debugpy` 启动你的脚本。`--wait-for-client` 让程序**暂停在启动处**，等编辑器附加上来再继续：

```bash
python -m debugpy --listen <PORT> --wait-for-client your_script.py \
    --arg1 value1 \
    --arg2 value2
```

`--listen` 后面的端口要和 `launch.json` 里的 `<PORT>` 完全一致。脚本本身的参数照常跟在文件名后面。

## 步骤五：附加并开始调试

1. 先在本地编辑器里给代码打好断点。
2. 在「运行和调试」面板选中 `Python: Attach`，按 F5（或点绿色三角）。
3. 连接成功后，服务器上暂停的程序会继续运行，命中断点时即可单步、查看变量、看调用栈。

## 常见问题

- **连不上 / 一直转圈：** 端口对不上，或服务器没真正监听。`ss -tuln | grep <PORT>` 看端口是否在 LISTEN。
- **本地编辑器连远程端口失败：** 多半没做 SSH 端口转发，补上 `ssh -L`。
- **断点变成灰色空心：** 编辑器里的文件路径和服务器上实际运行的文件不一致，确认是同一份代码。
- **程序没停在断点就跑完了：** 漏了 `--wait-for-client`，或附加得太晚（程序已经执行过断点位置）。

