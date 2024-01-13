# Mac下配置OpenGL
## 安装
首先需要安装几个东西, CMake, GLFW, GLAD, Vscode。下面是下载路径

CMake： [CMake](https://cmake.org)

GLFW: [GLFW-Download](https://www.glfw.org/download.html)

Glad: [glad](https://glad.dav1d.de)

VsCode 就正常安装

在项目文件下创建三个目录， src，include，lib。

## Cmake 安装

苹果app正常安装方式

### GLFW安装

首先在官网下载mac的二进制文件，下载之后的文件格式是这样的：
```
├── LICENSE.md
├── README.md
├── docs
├── include
├── lib-arm64
├── lib-universal
└── lib-x86_64
```

该目录下主要用到两个目录。
首先，根据自己的芯片型号选择lib-xxx，如果你是intel（x86）的芯片，那么就选择lib-x86-64，如果你是新版的m1或者m2芯片（arm）那么就选择lib-arm64。除此之外，lib-universal据说是两种芯片类型都能兼容，但由于没有机器，作者并未进行测试，有兴趣的同学可以自行测试一下。
其次，除了lib-xxx外，还需要用到的一个目录是include目录中的文件，剩下的文件和目录可以删除，不予保留。
至此，GLFW的下载结束。

### Glad安装

首先到glad的下载页面，下载glad文件，这里需要选择几个选项
![image](./images/2023-06-22-014549.png ':size=30%') 

选完之后点击generate，随后下载一个.zip文件，解压缩后，文件目录是这样的：
```
  glad
  ├── include
  │   ├── KHR
  │   │   └── khrplatform.h
  │   └── glad
  │       └── glad.h
  └── src
      └── glad.c
```

至此，GLAD的下载结束.

## 项目结构配置

创建工作目录new_openGL，并创建include、lib和src三个文件夹，并将GLAD和GLFW目录下的文件移动到相应的目录下：
```
glfw-3.3.8.bin.MACOS/include/GLFW/  ->  new_openGL/include/GLFW/
glfw-3.3.8.bin.MACOS/lib-arm64/*   ->  new_openGL/lib/
glad/include/glad/  ->  new_openGL/include/glad/
glad/include/KHR/   ->  new_openGL/include/KHR/
glad/src/glad.c  ->. new_openGL/src/glad.c
```

移动完成后，目录结构是这样的：
```
new_openGL
├── include
│   ├── GLFW
│   │   ├── glfw3.h
│   │   └── glfw3native.h
│   ├── KHR
│   │   └── khrplatform.h
│   └── glad
│       └── glad.h
├── lib
│   ├── libglfw.3.dylib
│   └── libglfw3.a
└── src
    └── glad.c
```

## 项目测试和编译

1. 项目的src/目录下创建文件main.cpp，并写入以下程序：

```c++
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <stdio.h>
#include <stdlib.h>
#include <iostream>

void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    glViewport(0, 0, width, height);
} 

void processInput(GLFWwindow *window)
{
    if(glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);
}
int main()
{
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); //MAC OSX needs

    GLFWwindow* window = glfwCreateWindow(800, 600, "LearnOpenGL", NULL, NULL);
    if (window == NULL)
    {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);

    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "Failed to initialize GLAD" << std::endl;
        return -1;
    }   

    glViewport(0, 0, 800, 600);
    while(!glfwWindowShouldClose(window))
    {
        processInput(window);

        glClearColor(0.9f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        glfwSwapBuffers(window);
        glfwPollEvents();    
    }
    glfwTerminate();
    
    return 0;
}
```

2. 项目的根目录下创建CMakeLists.txt文件，并将下面的语句复制进去：

```Cmake
cmake_minimum_required(VERSION 3.0.0)
project(HelloGL VERSION 0.1.0)

# 使用 C++ 17 标准
set(CMAKE_CXX_STANDARD 17)

# 设置代码文件
set(SRC_DIR ${PROJECT_SOURCE_DIR}/src/)

# 添加头文件
set(HEADER_DIR ${PROJECT_SOURCE_DIR}/include/)
set(LIB_DIR ${PROJECT_SOURCE_DIR}/lib/)
include_directories(${HEADER_DIR} ${LIB_DIR})

# 添加目标链接
set(GLFW_LINK ${LIB_DIR}libglfw.3.dylib)
link_libraries(${GLFW_LINK})

# 执行编译命令
set(SOURCES ${SRC_DIR}glad.c ${SRC_DIR}main.cpp)
add_executable(HelloGL ${SOURCES})

# 链接系统的 OpenGL 框架
if (APPLE)
    target_link_libraries(HelloGL "-framework OpenGL")
endif()

include(CTest)
enable_testing()

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
```

此时的文件目录是：
```
new_openGL
├── CMakeLists.txt
├── include
│   ├── GLFW
│   │   ├── glfw3.h
│   │   └── glfw3native.h
│   ├── KHR
│   │   └── khrplatform.h
│   └── glad
│       └── glad.h
├── lib
│   ├── libglfw.3.dylib
│   └── libglfw3.a
└── src
    ├── glad.c
    └── main.cpp
```

3. 项目根目录下创建build目录，进入build目录并执行:

```
mkdir build
cd build
cmake ..
```

随后会看到在build文件夹下生成很多的文件，其中最主要的是makefile，有了这个文件后，我们就可以在build文件夹下输入命令make，接着可以在命令行下看到一下输出：
```
(base) liushanlin@192 build % make
[ 33%] Building C object CMakeFiles/HelloGL.dir/src/glad.c.o
[ 66%] Building CXX object CMakeFiles/HelloGL.dir/src/main.cpp.o
[100%] Linking CXX executable HelloGL
[100%] Built target HelloGL
```

最后输入命令./HelloGL，就可以看到一个红色窗口。