## OOP in OpenGL

Directly writing logic in `main.cpp` can be complex and difficult to maintain. So we can  use classes and object to make code cleaner.

#### Vertex Layout

In the previous code, in order to draw two triangles, we define 4 groups of coordinates (in order to save space), so now we need to define a layout which can tell gpu how to manage our data. 

So first, we need to create a class which is called `VertexLayout`,  in this part, we should define a stride, as one coordinate needs two value to represent, x and y, so here we define stride as 2. In addition, in order to make the function normalised, we can make the function be templated. 

In addition, we also need to define a struct, which contains some parameters, such as type, count(stride in array) and  a bool parameter which represents if it is normalized. Here is the code:

```c++
struct VertexLayoutElement
{
    unsigned int type;
    unsigned int count;
    unsigned char isNormalise;

    static unsigned int GetSizeOfType(unsigned int  type)
    {
        switch (type)
        {
        case GL_FLOAT: return 4; 
        case GL_UNSIGNED_INT: return 4;
        case GL_UNSIGNED_BYTE: return 1;
        }
        return 0;
    }
};

class VertexLayout
{
private:
    std::vector<VertexLayoutElement> m_elements;
    unsigned int m_stride;
public:
    VertexLayout(/* args */);
    ~VertexLayout();

    template <typename T>
    void Push(unsigned int type)
    {
    }

    std::vector<VertexLayoutElement> GetLayoutElements();
    unsigned int GetStride();
};


VertexLayout::VertexLayout():m_stride(0)
{

}

VertexLayout::~VertexLayout()
{
}

std::vector<VertexLayoutElement> VertexLayout::GetLayoutElements()
{
    return m_elements;
}

unsigned int VertexLayout::GetStride()
{
    return m_stride;
}

template<>
void VertexLayout::Push<float>(unsigned int count) // here count is stride for array
{
    m_elements.push_back({GL_FLOAT,count,GL_FALSE});
    m_stride+=count * VertexLayoutElement::GetSizeOfType(GL_FLOAT); //stride * size of type is the real stirde
}

template<>
void VertexLayout::Push<unsigned char>(unsigned int count)
{
    m_elements.push_back({GL_UNSIGNED_BYTE,count,GL_TRUE});
    m_stride+=count * VertexLayoutElement::GetSizeOfType(GL_UNSIGNED_BYTE);
}

template<>
void VertexLayout::Push<unsigned int>(unsigned int count)
{
    m_elements.push_back({GL_UNSIGNED_INT,count,GL_FALSE});
    m_stride+= count * VertexLayoutElement::GetSizeOfType(GL_UNSIGNED_INT);
}
```



#### Vertex Array & Vertex Buffer

Then, we deal with the vertexes, in our previous code, we do something like this:
```c++
glBindVertexArray(VAO);

unsigned int buffer;
glGenBuffers(1, &buffer);
glBindBuffer(GL_ARRAY_BUFFER, buffer);
glBufferData(GL_ARRAY_BUFFER, 6 * 2 * sizeof(float), positions, GL_STATIC_DRAW);

glEnableVertexAttribArray(0);
glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), 0);

glBindVertexArray(0);
```

Now, we can create two  classes to wrap it, according to the code, we need to classes: `VertexArray` and  `VertexBuffer` and in `VertextArray` , we need 3 basic methods, `Bind()`, `UnBind()`, `AddBuffer()`, of course, we also need `Constructor()`. Here is the code.

```c++
class VertexArray
{
private:
    unsigned int renderId;
public:
    VertexArray(unsigned int renderID);
    ~VertexArray();
    void AddBuffer(VertexBuffer& buffer,VertexLayout& layout);
    void Bind() const;
    void UnBind() const;
};

VertexArray::VertexArray(unsigned int id) : renderId(id)
{
    glGenVertexArrays(1,&renderId);
}

VertexArray::~VertexArray()
{
    glDeleteVertexArrays(1,&renderId);
}
// here we need to bind buffer before we set vertex array, since we need input our data to buffer, so we need to create an another class VeretxBuffer.
void VertexArray::AddBuffer(VertexBuffer &buffer, VertexLayout &layout)
{
    Bind();
    buffer.Bind();
    const auto lyVec = layout.GetLayoutElements();
    unsigned int offset = 0;
    for (unsigned int i = 0; i < lyVec.size(); i++)
    {
        std::cout << i << std::endl;
        auto ele = lyVec[i];
        glEnableVertexAttribArray(i);
        auto size = ele.GetSizeOfType(ele.type);
        glVertexAttribPointer(i, ele.count, ele.type, ele.isNormalise, layout.GetStride(), (const void *)offset);
        offset += ele.count * VertexLayoutElement::GetSizeOfType(ele.type);
    }
}

void VertexArray::Bind() const
{
    glBindVertexArray(renderId);
}

void VertexArray::UnBind() const
{
    glBindVertexArray(0);
}
```

Meanwhile,  we also need a class `VertexBuffer`,  in this class, we need `Bind()`, `UnBind()` and `Constructor`. Here is the code:

```c++
class VertexBuffer
{
private:
    unsigned int bufferId;

public:
    VertexBuffer(unsigned int size, const void *data);
    virtual ~VertexBuffer();
    void Bind();
    void UnBind();
};

VertexBuffer::VertexBuffer(unsigned int size, const void *data)
{
    glGenBuffers(1, &bufferId);
    glBindBuffer(GL_ARRAY_BUFFER, bufferId);
    glBufferData(GL_ARRAY_BUFFER, size, data, GL_STATIC_DRAW);
}

VertexBuffer::~VertexBuffer()
{
    glDeleteBuffers(1, &bufferId);
}

void VertexBuffer::Bind()
{
    glBindBuffer(GL_ARRAY_BUFFER, bufferId);
}

void VertexBuffer::UnBind()
{
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}
```

Finally, we can modify our `main.cpp`, firstly, we can use `VertexLayout` to add coordinates, then we can use  `VertexArray` and `VertexBuffer` to save data into GPU. Here is the code:

```c++
VertexBuffer vb(4 * 4 * sizeof(float), positions);

VertexLayout vl;
vl.Push<float>(2);
vl.Push<float>(2);
VertexArray va(VAO);
va.Bind();
va.AddBuffer(vb, vl);
```

### IndexBuffer

An Index Buffer Object (IBO), also known as an Element Buffer Object (EBO) in some contexts, is used in OpenGL and other graphics APIs to optimize the rendering of geometric shapes by reducing the amount of duplicated vertex data. It allows for the reuse of vertices to draw multiple polygons, which is particularly beneficial when rendering complex models or shapes.

When drawing shapes like a square or cube, some vertices are shared between multiple faces. Without an IBO/EBO, each face of the shape would need to be defined separately, including the vertices that are shared between faces, leading to a larger amount of vertex data than is actually necessary. By using an IBO, you can define the unique vertices of the shape once in a Vertex Buffer Object (VBO), and then use the IBO to specify the indices of these vertices in the order they should be drawn. This means shared vertices are stored once and reused, making the data more compact and the rendering process more efficient.

The process of using an IBO involves:
1. **Creating and binding an IBO**: Similar to other buffer objects in OpenGL, you create an IBO using `glGenBuffers`, and bind it with `glBindBuffer` using the target `GL_ELEMENT_ARRAY_BUFFER`.
2. **Uploading index data to the IBO**: After binding, index data is uploaded to the IBO using `glBufferData`. This data represents the order in which vertices in the VBO should be drawn.
3. **Drawing with the IBO**: Instead of using `glDrawArrays` to draw the vertices, `glDrawElements` is used. This function reads the indices from the currently bound IBO and uses them to fetch the vertex data from the currently bound VBO, drawing the shapes accordingly.

IBOs make the rendering process more memory-efficient and can significantly improve performance, especially for complex 3D models where many vertices are shared across faces.

```c++
class IndexBuffer
{
private:
    unsigned int bufferId;
public:
    IndexBuffer(unsigned int size, const void *data);
    virtual ~IndexBuffer();
    void Bind() const;
    void UnBind() const;
};

IndexBuffer::IndexBuffer(unsigned int size, const void *data)
{
    glGenBuffers(1, &bufferId);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, bufferId);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, size, data, GL_STATIC_DRAW);
}

IndexBuffer::~IndexBuffer()
{
    glDeleteBuffers(1, &bufferId);
}

void IndexBuffer::Bind() const
{
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, bufferId  );
}

void IndexBuffer::UnBind() const
{
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
}
```

### Renderer

About renderer, we also can encapsulate it into a class, in this class, we can define a method which can process drawing, we can just move all drawing code form `glfwWindowShouldClose` in `main.cpp`. This is the final result:

```c++
class Renderer
{
public:
        Renderer(/* args */);
        ~Renderer();
        void Clear();
        void Draw(const VertexArray& va, const IndexBuffer& ib, const Shader& Shader) const;
};

Renderer::Renderer()
{
}

Renderer::~Renderer()
{
}

void Renderer::Clear()
{
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
}

void Renderer::Draw(const VertexArray &va, const IndexBuffer &ib, const Shader &shader) const
{
    va.Bind();
    ib.Bind();
    shader.Bind();
    glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, nullptr);
}

//in main.cpp
Renderer renderer;
/* doing something */
while (glfwWindowShouldClose(window) == false)
{
  // ....
  renderer.Draw(va, indexBuffer, shader);
  // ...
}
```

