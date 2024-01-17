## 从Document开始

总的来说，OpenGL其实是一个通用的图形学规范，它只提供一个API接口，是一个中间层。具体的实现在显卡驱动上，这是为了更好的跨平台实现。所以为了成为一个OpenGL master，我们需要多看文档。

### 示例代码

```c++
#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <stdio.h>
#include <stdlib.h>
#include <iostream>

int main()
{
    if (glfwInit() == false)
    {
        return -1;
    }
    // set opengl version, here is 3.3
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    // set opengl config file
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    // make opengl forward compat, that means forbid some functions in opengl 2.x which area abandoned
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);

    GLFWwindow *window = glfwCreateWindow(800, 600, "MyFirstOpenGLWin", NULL, NULL);
    if (window == NULL)
    {
        std::cout << "fail to create a window" << std::endl;
        // release assets when window quits
        glfwTerminate();
        return -1;
    }
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

    // make cur thread context is the opengl context
    glfwMakeContextCurrent(window);
    // glad is a library which is used to manage function pointer of opengl
    // since opengl is cross-platform, it doesn't bind function to any specific platform
    // so we need to get pointers form opengl and manage them
    if (gladLoadGLLoader((GLADloadproc)glfwGetProcAddress) == false)
    {
        std::cout << "fail to load glad" << std::endl;
        return -1;
    }
    glViewport(0, 0, 800, 600);
   
    // start rendering
    while (glfwWindowShouldClose(window) == false)
    {
        // detect key escape event
        processInput(window);
        // set clear color
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        // clear color buffer
        glClear(GL_COLOR_BUFFER_BIT);
        // double buffer tech
        glfwSwapBuffers(window);
        // func call all the event since the last call
        glfwPollEvents();
    }
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}
```

上述代码的作用是用来构建一个窗口，首先我们需要调用到两个库，也就是`#include <glad/glad.h>`，`#include <GLFW/glfw3.h>`, 其中glad这个库是用来管理所有的OpenGL函数指针，就像上文所说的，因为OpenGL是一个跨平台的规范，所以他不会绑定任何函数在具体的平台上，我们需要通过glad来实现函数的动态加载。

接着看接下来的几行代码：
```c++
if (glfwInit() == false)
{
    return -1;
}
// set opengl version, here is 3.3
glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
// set opengl config file
glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
// make opengl forward compat, that means forbid some functions in opengl 2.x which area abandoned
glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
```

这些代码是用来初始化窗口的，首先初始化OpenGL，接着设置OpenGL的版本，配置文件，上面最后一行的作用是用来禁用OpenGL前置版本中一些已经被抛弃的方法。

然后创建窗口：
```c++
 GLFWwindow *window = glfwCreateWindow(800, 600, "MyFirstOpenGLWin", NULL, NULL);
if (window == NULL)
{
    std::cout << "fail to create a window" << std::endl;
    // release assets when window quits
    glfwTerminate();
    return -1;
}
glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
```

`glfwTerminate()` 是用来释放窗口占用的资源的，就像c++析构函数一样

接下来的几行代码用来设置当前窗口的上下文，并初始化glad
```c++
glfwMakeContextCurrent(window);
// glad is a library which is used to manage function pointer of opengl
// since opengl is cross-platform, it doesn't bind function to any specific platform
// so we need to get pointers form opengl and manage them
if (gladLoadGLLoader((GLADloadproc)glfwGetProcAddress) == false)
{
    std::cout << "fail to load glad" << std::endl;
    return -1;
}
glViewport(0, 0, 800, 600);
```

然后是渲染，我的理解是是就像unity editor中 `onGUI()` 一样，他会在一个循环中不断地渲染窗口中的要显示的内容：
```c++
// start rendering
while (glfwWindowShouldClose(window) == false)
{
    // detect key escape event
    processInput(window);
    // set clear color
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    // clear color buffer
    glClear(GL_COLOR_BUFFER_BIT);
    // double buffer tech
    glfwSwapBuffers(window);
    // func call all the event since the last call
    glfwPollEvents();
}
```

最后是关闭窗口并释放资源：
```c++
glfwDestroyWindow(window);
glfwTerminate();
```
以上就是对于该段代码的解释。