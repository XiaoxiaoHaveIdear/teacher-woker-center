# 教师工作台（教师个人智能工作台 v2）

班主任的本地小工具：双课表 + 调课留痕、作业收缴管理、学生档案（标签+随记）、排座位（带约束一键生成）、成绩录入 + 趋势对比、值日排班、班委通讯录、待办、多班级。纯本地存储，不注册不联网。单文件 HTML + Capacitor 打包成安卓 APK。

## 目录结构

```
教师工作台/
├── app/                  # Web 源码（改这里）
│   ├── index.html        # 单文件应用（全部功能都在这）
│   └── vendor/tailwind.js# 本地化 Tailwind（离线可用）
├── android/              # Capacitor 生成的安卓工程
├── assets/               # 图标/启动页源图（tools/gen-icons.js 生成）
├── keystore/             # 发布签名（勿泄漏、勿丢失，丢失后无法覆盖更新）
├── tools/gen-icons.js    # 图标生成脚本
├── capacitor.config.json # webDir = app
└── package.json
```

## 改了 app/index.html 之后

```bash
npx cap sync android        # 把 Web 代码同步进安卓工程
cd android && ./gradlew assembleDebug    # 出 debug 包
```

> 本机注意：工程路径含中文，AGP 不允许直接构建。构建时把整个文件夹复制到 ASCII 路径（如 F:\twb-build）再执行 gradlew。

## 出正式 APK（release + 签名）

```bash
cd android
./gradlew assembleRelease                 # 产出未签名包
# 用 build-tools 签名（keystore 在 keystore/teacher-workbench.keystore）
zipalign -f 4 app-release-unsigned.apk aligned.apk
apksigner sign --ks keystore/teacher-workbench.keystore --out 教师工作台.apk aligned.apk
```

本机构建环境（已配好）：

- JDK 21：`C:\dev\jdk-21`（Gradle 构建用，Capacitor 7.6 插件要求 Java 21）
- Android SDK：`C:\Users\Administrator\AppData\Local\Android\Sdk`（platform-35 + build-tools 34.0.0，全部来自腾讯镜像）
- 镜像：npm 用 `registry.npmmirror.com`；Gradle 发行版用腾讯镜像；Maven 依赖走阿里云镜像（已写进 android/build.gradle）

## 安装到手机

- 方法一：手机开 USB 调试，连电脑后 `adb install 教师工作台.apk`
- 方法二：把 APK 拷到手机（微信文件传输/数据线），点击安装，允许"安装未知来源应用"

## 数据说明

- 所有数据只存在手机本机（App 内 localStorage），卸载或"清除数据"会全部丢失
- 换手机/清理前，先在 App 内「待办」页底部导出备份 JSON；恢复也在那里
