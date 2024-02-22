## Math in OpenGL

In CG, in order to render a graphic , we always need to translate object's position, or translate their coordinate system, so in CG, there is somrthing called MVP matrix, MVP matrix is multiply by three matrixes, which is model * view * projection. In order to process matrix multiple, we need to import a library, which is called glm.

First we can define there base matrix we want：

```c++
// here we define projection model as orthogonal
glm::mat4 proj = glm::ortho(0.0f, 960.0f, 0.0f, 540.0f, -1.0f, 1.0f);
glm::mat4 view = glm::translate(glm::mat4(1.0f), glm::vec3(-100, 0, 0));
glm::mat4 model = glm::translate(glm::mat4(1.0f), translateA);
```

then multiple them:

```c++
glm::mat4 mvp = proj * view * model;
```

Of course, we need to convey this mvp matrix to gpu, we need to define a uniform to accept data in shader:

```glsl
#Shader vertex
#version 330 core

layout(location=0) in vec4 position;
layout(location=1) in vec2 texCoord;

out vec2 v_TexCoord;
uniform mat4 u_MVP; // I'm here!

void main()
{
    gl_Position = u_MVP * position;
    v_TexCoord = texCoord;
}
```

Then convey data:

```c++
shader.SetUniformMat4f("u_MVP", mvp);
```

Here is the whole code:

```c++
{
    glm::mat4 model = glm::translate(glm::mat4(1.0f), translateA);
    glm::mat4 mvp = proj * view * model;
    shader.SetUniformMat4f("u_MVP", mvp);
    renderer.Draw(va, indexBuffer, shader);
}
```

