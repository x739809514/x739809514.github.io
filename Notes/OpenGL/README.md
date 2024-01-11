# Mac下配置OpenGL
## 安装
首先需要安装三个东西, CMake, GLFW, GLEW。下面是下载路径

CMake： [CMake](https://cmake.org)

GLFW: [GLFW - Download](https://www.glfw.org/download.html)

GLEW: [http://glew.sourceforge.net](https://glew.sourceforge.net)

Xcode: go to MacAPPStore

### Cmake 安装

苹果app正常安装方式

### GLFW安装

打开CMake，source code 目录：CMakeLisis.txt 所在目录，build目录：自己新建一个文件夹。点configure ，选择Unixfile，其他默认，然后它就configure了，done之后，界面会有粉红色的，继续configure，消灭粉红色之后generate。done完了之后并没有结束！

![1](/Users/innovation/x739809514/Notes/images/1.png)

打开terminal，cd到刚才GLFW文件夹下的build文件夹，（直接把这个文件夹选中拖入终端即可）输入 make, 等待滚动条结束，继续输入sudo make install.

![image-20240110175118645](/Users/innovation/x739809514/Notes/images/image-20240110175118645.png)

### GLEW安装

打开终端，cd 到 glew所在的文件夹，还是直接把这个文件夹选中然后拖入终端即可，输入 sudo make install

### XCode配置

首先创建控制台项目，然后选择project的target：

###### 1.设置build phase

选择project的targets，点击Build phases，选择Link Binary With Libraries 点➕号，选择OpenGL.frameworks 。
继续添加，Add Other 我们要到/usr/local/下面找lib去（如果你在Xcode下配置过opencv，那么你很熟悉的，微笑...好的，那么怎么到/usr/local/下面去呢，出现那个finder文件目录界面的时候使用快捷键cmd+shift+G，就好了) 
在/usr/local/lib 找到libGLEW.dylib和libglfw.3.2.dylib 添加上就ok了。

###### 2. 来到build setting选项卡

设置search path：
Header Search Paths: /usr/local/include
Library Search Paths: /usr/local/lib
Always Search User Paths: YES

### 配置结束

接着进行测试，尝试在main.cpp中引入头文件：
#include <GL/glew.h>
#include <GLFW/glfw3.h>
如果变异没有问题则成功