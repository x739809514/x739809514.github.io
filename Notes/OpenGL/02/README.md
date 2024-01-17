## 绘制三角形

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

### 如何处理这些Shader

上文写shader的方法，直接使用字符串形式会让编写过于复杂，所以我们可以在一个专门的文件中写shader脚本，最后用字符流的方式读写。在这里可以调用c++ stl库中的 `fstream` 和 `sstream` , 如下列代码：
```c++
static ShaderProgram ParseShader(const std::string filepath)
{
  std::ifstream inFile(filepath);
  std::string line;
  ShaderType type = ShaderType::None;
  std::stringstream ss[2];

  while (getline(inFile,line))
  {
      if(line.find("#Shader")!=std::string::npos)
      {
          if(line.find("vertex")!=std::string::npos)
          {
              // get vertex str
              type = ShaderType::Vertex;
          }else if(line.find("fragment")!=std::string::npos)
          {
              // get fragment str
              type = ShaderType::Fragment;
          }
      }else{
          ss[(int)type] << line << '\n';
      }
  }
  inFile.close();
  return {ss[0].str(),ss[1].str()};
}
```

### 索引数组

当我们想要绘制一个矩形时，我们可以看做他是有两个三角形构成，于是我们可以对我们的顶点数组做以下调整：
```c++
float positions[] = {
        -0.5f, -0.5f, //0
        0.5f, -0.5f,  //1
        0.5f, 0.5f,   //2
        0.5f, 0.5f,   //3
        -0.5f, 0.5f,  //4
        -0.5f, -0.5f, //5
        };

//同时修改draw call
glDrawArrays(GL_TRIANGLES,0,6);
```

但是观察上面的顶点数组，我们可以发现有许多顶点是重复的，当三角形的数量非常多时，会产生大量的计算浪费，为了解决这个问题，我们可以创建另一个数组——索引数组。

索引数组保存了三角形要用到的顶点在顶点数组中的索引，假如上述数组中，我给每个顶点进行标号，那么我的索引数组就可以是：
```c++
unsigned int indices[]={
        0,1,2,
        2,3,0
    };
```

同时修改顶点数组

```c++
float positions[] = {
        -0.5f, -0.5f,
        0.5f, -0.5f,
        0.5f, 0.5f,
        -0.5f, 0.5f,
        };
```

接下来跟前面一样，我们需要将索引数组保存到EBO当中
```c++
unsigned int ido;
glGenBuffers(1, &ido);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ido);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, 6 * sizeof(unsigned int), indices, GL_STATIC_DRAW);
```

这里需要注意，我们这次是用的是`GL_ELEMENT_ARRAY_BUFFER` 。同时在渲染循环中，我们需要将drawcall 改成：
```c++
glDrawElements(GL_TRIANGLES,6,GL_UNSIGNED_INT,nullptr);
```

这里尤其注意，必须使用unsigned int, 因为unsigned int是非负的，不会有负数的索引，并且由于unsigned int是32位，能够提供足够大的存储范围，但又不会像64位一样占过大的内存。

### 相关资料

OpenGL API：https://docs.gl/

渲染管线相关知识：https://zhuanlan.zhihu.com/p/137780634