# 绘制三角形

### 渲染管线

在绘制三角形之前，我们可以先对GPU的渲染管线有一个大致的了解，它大致分为以下几个步骤。

1. 准备顶点数据
2. 着色阶段（顶点着色器，曲面细分着色器，几何着色器）
3. 投影
4. 裁切
5. 屏幕映射
6. 图元组装
7. 三角形遍历
8. 抗锯齿
9. 片元着色
10. 逐片元操作
11. 各类测试（裁切，透明度，模板，深度测试）

其中6-11都属于光栅化阶段，也就是如何把1-5中处理好的图形绘制在窗口中。在这个渲染管线中，着色阶段和片元着色是可编程的，也就是通过shader。不过要注意的是，对于顶点着色器，它是有多少个顶点就执行多少次，而片元着色器是针对像素的，因为它要给像素上色，例如在绘制三角形的时候，三角形有三个顶点，那么顶点着色器就会执行三次，在这个三角形中可能覆盖有50个像素，那么片元着色器就会执行50次，所以一般情况下，在片元着色器中执行的行为会更加昂贵，大部分的操作会放到顶点着色器中去进行。

### 在OpenGL中写Shader

大致可以分为以下几个步骤，`CreateProgram`  `CreateShader()` `CompileShader()` `AttachShader` `LinkProgram()` `ValidateProgram()` 。
```c++
static unsigned int CreateShader(std::string &vertextShader, std::string &fragmentShader)
{
    unsigned int program = glCreateProgram();
    unsigned int vs = CompileShader(GL_VERTEX_SHADER,vertextShader);
    unsigned int fs = CompileShader(GL_FRAGMENT_SHADER,fragmentShader);
    glAttachShader(program,vs);
    glAttachShader(program,fs);
    glLinkProgram(program);
    glValidateProgram(program);
    glDeleteShader(vs);
    glDeleteShader(fs);
    return program;
}

static unsigned int CompileShader(unsigned int type, std::string &source)
{
    unsigned int id = glCreateShader(type);
    const char *str = source.c_str();
    glShaderSource(id, 1, &str, NULL);
    glCompileShader(id);

    //Error handing
    int success;
    glGetShaderiv(id,GL_COMPILE_STATUS,&success);
    if(success == GL_FALSE)
    {
        int length;
        glGetShaderiv(id,GL_INFO_LOG_LENGTH,&length);
        char* info = (char*)alloca(length*sizeof(char));
        glGetShaderInfoLog(id,length,&length,info);
        std::cout<< "Error: "<< (type == GL_VERTEX_SHADER ? "vertex shader" : "fragment shader") << "Shader Compiled Failed!"<< info << std::endl;
        glDeleteShader(id);
        return 0;
    }

    return id;
}
```

由于OpenGL是一个非常不稳定的API，细微的错误就可能导致无法绘制出图形，所以我们可以用一些方式来提供报错信息例如 `glGetShaderiv`  `glGetShaderInfoLog` 

另外还需注意，我们需要一个VAO（顶点数组对象），VBO（顶点缓存对象）来管理顶点数据
```c++
unsigned int VAO;
glGenVertexArrays(1,&VAO);
glBindVertexArray(VAO);
```

### 相关资料

OpenGL API：https://docs.gl/

渲染管线相关知识：https://zhuanlan.zhihu.com/p/137780634