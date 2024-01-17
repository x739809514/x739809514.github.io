## 在OpenGL中处理错误

在使用OpenGL制作图形的时候很容易因为一些错误而最后输出一块黑色窗口，所以我们需要一些方法来像平时的代码一样来调试错误。OpenGL给我们提供了一些方法，接下来介绍两种方法

1. glGetError()
   glGetError() 会返回一个错误码，我们需要文档中或者代码中对照错误码才能找到具体的错误，这看起来有点麻烦，但是我们可以结合c++宏命令来让调试变得好用。大致的思路是，我们现在我们怀疑有问题的代码前面先清空所有先前检测出来的错误，然后在该代码后再次调用glGetError()来检测错误。例如：

   ```c++
   //清除错误
   static void ClearError()
   {
       while (glGetError()!=GL_NO_ERROR);
   }
   //重新检测错误
   static bool CheckError(const char* func, const char* file, int line)
   {
       while (GLenum error = glGetError())
       {
           std::cout << "[OpenGL error:]" << error << file << ": " << line << std::endl;
           return false;
       }
       return true;
   }
   ```

   ```c++
   ClearError();//清空错误
   glDrawElements(GL_TRIANGLES,6,GL_INT,nullptr);//改行代码是有问题的
   CheckError();//检测错误
   ```

   上面的代码已经可以输出出错的文件所在位置和出错的行数，但是还不够好，我们希望当某行代码出错时，让程序自动停止在该行，这样便于我们直接进行修改。要实现这个功能，我们可以使用宏命令。

   ```c++
   #define ASSERT(x) if(!(x)) __debugbreak();
   #define GLCALL(x) ClearError();\ //这里的反斜杠是为了忽视换行
           x;\
           ASSERT(CheckError(#x, __FILE__,__LINE__))
   ```

   上面的__debugbreak()函数貌似是仅限windows平台的，在Mac中我没有找到该函数，目前还不知道在Mac下该调用什么函数来达到同效果。。。。悲！紧接着我们只要在我们想调用的地方用宏包裹就可以使用了，喜！

2. 错误回调函数：在OpenGL 4.3及以上版本中，可以使用glDebugMessageCallback函数来设置错误回调函数，以便在发生错误时自动调用回调函数进行处理。这样可以更方便地捕捉和处理OpenGL错误。
   ```c++
   void GLAPIENTRY errorCallback(GLenum source, GLenum type, GLuint id, GLenum severity, GLsizei length, const GLchar* message, const void* userParam) {
       // 处理错误信息
   }
   
   // 设置错误回调函数
   glDebugMessageCallback(errorCallback, nullptr);
   ```

## OpenGL中的uniform

OpenGL中的uniform是一种特殊修饰（就像static，readonly），它的主要作用是在着色器程序之间传递数据，例如在vertex shader和fragment shader之间。

uniform有几个特性：

1. 他是全局的，也就是说几个不同的shader都可以访问
2. 他是只读的，在着色器中定义之后，就无法被修改
3. 根据2，如果想修改这个uniform变量，我们就要在CPU中去设置他，传值进去
4. 他可以是各种类型，例如float, int, vector, matrix

接下来放一段代码，展示如何定义一个uniform变量，并在CPU中设置他：

```glsl
//.shader
layout(location=0) out vec4 color;

uniform vec4 u_color;

void main()
{
    color = u_color;
}
```

```c++
//.cpp
int location = glGetUniformLocation(shader,"u_color");
float r=0.0f;
float increment=0.0f;

while (glfwWindowShouldClose(window) == false)
{
		//other operation
		if(location!=-1)
    {
        glUniform4f(location,r,0.8f,0.5f,1.0f);
    }
    if (r>=1.0f)
    {
        increment-=0.2f;
    }else if(r<=0.0f)
    {
        increment+=0.2f;
    }
    r+=increment;
		//other operation
}
```

## Vertex Array Object

当我们使用`glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE)` 时我们需要自己手动设置一个VAO，如果使用`GLFW_OPENGL_COMPAT_PROFILE` 则会有一个拥有默认值的VAO。让我们先看设立VAO的代码。
```	c++
//1
unsigned int VAO;
glGenVertexArrays(1,&VAO);
glBindVertexArray(VAO);
//2
unsigned int buffer;
glGenBuffers(1, &buffer);
glBindBuffer(GL_ARRAY_BUFFER, buffer);
glBufferData(GL_ARRAY_BUFFER, 6 * 2 * sizeof(float), positions, GL_STATIC_DRAW);
//3
glEnableVertexAttribArray(0);
//4
glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), 0);
```

这么看有点抽象，还是很难看出VAO是如何被赋值的，它的流程大致是这样，首先2处的代码创建了一个VBO (Vertex Buffer Object), 然后4处的代码它将2处的buffer和1处的VAO联系起来，另外如果我们要绑定另一个不同的buffer，我们只需要将4处函数的第一个参数+1即可，接着新的buffer又会联系到VAO。

另外Chatgpt给出的解释是这样的：
*使用`glBindVertexArray`函数将这个生成的VAO绑定为当前的顶点数组对象。这意味着接下来的OpenGL函数调用都会影响到这个绑定的VAO。*
