## Batch Render

### what is Batch Rendering

Batch rendering is a technique used in computer graphics to minimize the number of rendering calls made to the graphics API (like OpenGL or DirectX) and, as a result, improve the performance of a graphics application, especially when rendering a large number of objects. The idea is to combine many smaller draw calls into a larger, single draw call. This is particularly effective because making a draw call is a relatively expensive operation due to the state changes and communication overhead between the CPU and GPU.

### How Batch Rendering Works

Instead of rendering each object individually with its own draw call, batch rendering involves grouping multiple objects that share similar properties, such as textures, shaders, or vertex data, and then rendering them all at once. Here’s a simplified overview of how it works:

1. **Collecting Objects**: Determine which objects can be rendered together based on their properties. For example, all objects using the same texture and shader program can be grouped into a single batch.
2. **Creating a Batch**: Combine the vertex data (and possibly index data) of all the objects in the batch into a single set of buffers. This usually involves appending the data of each object into a large vertex buffer and index buffer.
3. **Uploading Data**: The combined data is uploaded to the GPU memory once, reducing the number of state changes and data transfers between the CPU and GPU.
4. **Rendering**: Issue a single draw call to the GPU to render the entire batch of objects. The GPU then renders all objects in the batch in one go, which is much faster than rendering each object with a separate draw call.

### Batch Rendering in Color

Batch rendering in different colour is easy, the main thing we need to put two groups of data in one vertex buffer. For example, now we have two quads with different colors:

```c++
float vertices_1[] = {
    // 第一个四边形的位置     // 颜色
    -0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f, // 左上
    -0.5f, -0.5f, 0.0f,   1.0f, 0.0f, 0.0f, // 左下
     0.5f, -0.5f, 0.0f,   1.0f, 0.0f, 0.0f, // 右下
     0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f
}
```

```c++
float vertices_2[] = {
    // 第二个四边形的位置     // 颜色
    -0.25f,  0.25f, 0.0f,  0.0f, 1.0f, 0.0f, // 左上
    -0.25f, -0.75f, 0.0f,  0.0f, 1.0f, 0.0f, // 左下
     0.75f, -0.75f, 0.0f,  0.0f, 1.0f, 0.0f, // 右下
     0.75f,  0.25f, 0.0f,  0.0f, 1.0f, 0.0f  // 右上
}
```

In order to reduce draw call to one, we can combine these two vertex arrays:

```c++
float vertices[] = {
    // 第一个四边形的位置     // 颜色
    -0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f, // 左上
    -0.5f, -0.5f, 0.0f,   1.0f, 0.0f, 0.0f, // 左下
     0.5f, -0.5f, 0.0f,   1.0f, 0.0f, 0.0f, // 右下
     0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f, // 右上

    // 第二个四边形的位置     // 颜色
    -0.25f,  0.25f, 0.0f,  0.0f, 1.0f, 0.0f, // 左上
    -0.25f, -0.75f, 0.0f,  0.0f, 1.0f, 0.0f, // 左下
     0.75f, -0.75f, 0.0f,  0.0f, 1.0f, 0.0f, // 右下
     0.75f,  0.25f, 0.0f,  0.0f, 1.0f, 0.0f  // 右上
};

unsigned int indices[] = {
    0, 1, 3, // 第一个四边形的第一个三角形
    1, 2, 3, // 第一个四边形的第二个三角形
    4, 5, 7, // 第二个四边形的第一个三角形
    5, 6, 7  // 第二个四边形的第二个三角形
};

// 顶点位置属性
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// 顶点颜色属性 Add a new vertex properties
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
glEnableVertexAttribArray(1);
```

### Batch Rendering in Texture

##### Step 1: Shader Setup

First, let's set up the shaders to support multi-texturing. Your fragment shader needs to be able to sample from two different texture units.

```glsl
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D texture1;
uniform sampler2D texture2;

void main() {
    FragColor = mix(texture(texture1, TexCoords), texture(texture2, TexCoords), 0.5);
}
```

This shader mixes the colors from two textures using a 50/50 mix.

##### Step 2: Preparing Texture Data

Ensure you have two textures loaded and bound to different texture units. Here's a simplified way to load and bind textures to two texture units:

```cpp
// Load textures
unsigned int texture1, texture2;
glGenTextures(1, &texture1);
glBindTexture(GL_TEXTURE_2D, texture1);

glGenTextures(2, &texture2);
glBindTexture(GL_TEXTURE_2D, texture2);

// Activate the first texture unit before binding texture
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, texture1);

// Activate the second texture unit before binding texture
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, texture2);
```

##### Step 3: Vertex Data and Attribute Pointers

You'll need a vertex array object (VAO), vertex buffer object (VBO), and optionally an element buffer object (EBO) for the indices. Here's an example of setting those up for two quads:

```cpp
float vertices[] = {
    // positions    // texture coords
    0.5f,  0.5f, 0.0f,   1.0f, 1.0f, // top right
    0.5f, -0.5f, 0.0f,   1.0f, 0.0f, // bottom right
    -0.5f, -0.5f, 0.0f,  0.0f, 0.0f, // bottom left
    -0.5f,  0.5f, 0.0f,  0.0f, 1.0f  // top left 
};

unsigned int indices[] = {  
    0, 1, 3, // first triangle
    1, 2, 3  // second triangle
};

unsigned int VBO, VAO, EBO;
glGenVertexArrays(1, &VAO);
glGenBuffers(1, &VBO);
glGenBuffers(1, &EBO);
// Bind and set VBO and EBO...
```

##### Step 4: Linking Vertex Attributes

Bind the vertex array object (VAO) and set vertex attribute pointers:

```cpp
glBindVertexArray(VAO);

glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

// Position attribute
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// Texture coord attribute
glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));
glEnableVertexAttribArray(1);
```

##### Step 5: Drawing

In your rendering loop, activate the shader and draw the quads:

```cpp
glUseProgram(shaderProgram);
// set the sampler to the correct texture unit
glUniform1i(glGetUniformLocation(shaderProgram, "texture1"), 0);
glUniform1i(glGetUniformLocation(shaderProgram, "texture2"), 1);

glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

This approach uses a single VAO to store the quad's vertex attributes and EBO for indices, allowing us to draw two textured quads in one draw call. The key here is using two texture units and sampling from both in the fragment shader, blending their output. Depending on your specific needs, you might adjust the mixing ratio or use more sophisticated shaders for different effects.

### Dynamic Batching

In the above code, we combine vertex data into one array, but this is still static, if we want to make it dynamic, we can define a struct, for example, we have the vertex array:

```c++
float vertices[] = {
    // 第一个四边形的位置     // 颜色					 			// texture coordinate
    -0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f, 1.0f, 1.0f, 1.0f,
    -0.5f, -0.5f, 0.0f,   1.0f, 0.0f, 0.0f, 1.0f, 1.0f, 0.0f,
     0.5f, -0.5f, 0.0f,   1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f,
     0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f, 1,0f, 0.0f, 1.0f
};
```

Here we have three attributes: position, color and coordinate, so can define a struct:

```c++
struct vertice{
	float position[3];
	float color[4];
	float coordinate[2];
}
```

then add to buffer:

```c++
glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(float), vertices.data(), GL_DYNAMIC_DRAW);
```

But we don't need to change index buffer, we just use loop to use indices array.

```c++
unsigned int indices[] = {
  0, 1, 2,
  2, 3, 0
};
```





