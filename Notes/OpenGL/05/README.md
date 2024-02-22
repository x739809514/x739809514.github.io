## OOP in OpenGL(2) - Shader & Texture

In the previous code, We've encapsulated some classes to make the code easier to maintain，in this section, we start to process shader and texture.

### Shader

In OpenGL , we convert shader scripts to string and then use some API to load them into GPU. Generally, we use these API below:

```c++
glCreateShader() 	// to create a shader object
glShaderSource() 	// attach shader code to shader object
glCompileShader() // compile shader object
glGetShaderiv() & glGetShaderInfoLog()		//check compile error for shader
glCreateProgram() // create a shader program
glAttachShader()	// attach shader object to program
glLinkProgram()		// link all shader attach to program to a whole program
glGetProgramiv() & glGetProgramInfoLog()	// check link error for shader program
glUseProgram()		//Make your application part of the current rendering state
glDeleteProgram()	//delete shader program when shader and program don't be need anymore
```

So we should create a class to encapsulate these functions. First,  we can define a function to implement `glCreateShader`, `glShaderSource`, `glCompileShader` `glGetShaderiv` & `glGetShaderInfoLog`, then define a function to implement shader program. 

Here, we create to function `CompileShader` and `CreateShader`:

```c++
unsigned int Shader::CompileShader(unsigned int type, std::string &source)
{
    unsigned int id = glCreateShader(type);
    const char *str = source.c_str();
    glShaderSource(id, 1, &str, NULL);
    glCompileShader(id);

    // Error handing
    int success;
    glGetShaderiv(id, GL_COMPILE_STATUS, &success);
    if (success == GL_FALSE)
    {
        int length;
        glGetShaderiv(id, GL_INFO_LOG_LENGTH, &length);
        char *info = (char *)alloca(length * sizeof(char));
        glGetShaderInfoLog(id, length, &length, info);
        std::cout << "Error: " << (type == GL_VERTEX_SHADER ? "vertex shader" : "fragment shader") << "Shader Compiled Failed!" << info << std::endl;
        glDeleteShader(id);
        return 0;
    }

    return id;
}

unsigned int Shader::CreateShader(std::string &vertextShader, std::string &fragmentShader)
{
    unsigned int program = glCreateProgram();
    unsigned int vs = CompileShader(GL_VERTEX_SHADER, vertextShader);
    unsigned int fs = CompileShader(GL_FRAGMENT_SHADER, fragmentShader);
    glAttachShader(program, vs);
    glAttachShader(program, fs);
    glLinkProgram(program);
    glValidateProgram(program);
    glDeleteShader(vs);
    glDeleteShader(fs);
    return program;
}
```

Also, we need a function to parse the shader script:

```c++
ShaderProgram Shader::ParseShader()
{
    std::ifstream inFile(filePath);
    std::string line;
    ShaderType type = ShaderType::None;
    std::stringstream ss[2];

    while (getline(inFile, line))
    {
        if (line.find("#Shader") != std::string::npos)
        {
            if (line.find("vertex") != std::string::npos)
            {
                // get vertex str
                type = ShaderType::Vertex;
            }
            else if (line.find("fragment") != std::string::npos)
            {
                // get fragment str
                type = ShaderType::Fragment;
            }
        }
        else
        {
            ss[(int)type] << line << '\n';
        }
    }
    inFile.close();
    return {ss[0].str(), ss[1].str()};
}
```

What's more, in this class,  we expect to convey data to GPU, so we need some functions to convey data to uniform in shader:

```c++
int Shader::GetLocationOfUniform(const std::string &name)
{
    if (m_uniformLocationMap.find(name) != m_uniformLocationMap.end())
    {
        return m_uniformLocationMap[name];
    }
    int location = glGetUniformLocation(renderID, name.c_str());
    if (location == -1)
    {
        std::cout << "warning: uniform" << name << "doesn't exits !" << std::endl;
    }
    else
    {
        m_uniformLocationMap[name] = location;
    }

    return location;
}

void Shader::SetUniform4f(const std::string &name, float v0, float f0, float f1, float f2)
{
    glUniform4f(GetLocationOfUniform(name), v0, f0, f1, f2);
}

void Shader::SetUniform1i(const std::string &name, int value)
{
    glUniform1i(GetLocationOfUniform(name), value);
}

void Shader::SetUniform1f(const std::string &name, float value)
{
    glUniform1f(GetLocationOfUniform(name), value);
}

void Shader::SetUniformMat4f(const std::string &name, const glm::mat4 &matrix)
{
    glUniformMatrix4fv(GetLocationOfUniform(name), 1, GL_FALSE, &matrix[0][0]);
}
```

Now, the shader class is finished, let's see the definition of `shader.h':

```c++
struct ShaderProgram
{
    std::string vertex;
    std::string fragment;
};

class Shader
{
private:
    unsigned int renderID;
    std::string filePath;
    std::unordered_map<std::string, int> m_uniformLocationMap;

public:
    Shader(std::string path);
    ~Shader();

    void Bind() const;
    void UnBind() const;

    void SetUniform4f(const std::string &name, float v0, float v1, float f0, float f1);
    void SetUniform1i(const std::string &name, int value);
    void SetUniform1f(const std::string &name, float value);
    void SetUniformMat4f(const std::string &name, const glm::mat4& matrix);
    int GetLocationOfUniform(const std::string &name);
private:
    unsigned int CompileShader(unsigned int type, std::string &source);
    unsigned int CreateShader(std::string &vertextShader, std::string &fragmentShader);
    ShaderProgram ParseShader();
};
```

### Texture

In OpenGL, using textures typically involves the following steps:

1. **Load Texture Image**: First, you need to load the texture image from a file into memory. This is usually done using an external library (like stb_image.h or SOIL) because OpenGL does not provide image loading capabilities by itself.
2. **Generate Texture Object**: Use the `glGenTextures` function to generate a texture object.
3. **Bind Texture Object**: Use the `glBindTexture` function to bind the texture object so that OpenGL knows the subsequent texture instructions are for this texture. You can bind different types of textures with this function, such as 2D textures (`GL_TEXTURE_2D`).
4. **Set Texture Parameters**: Use the `glTexParameteri` or `glTexParameterf` function to set various texture parameters, such as texture wrapping mode (`GL_TEXTURE_WRAP_S`, `GL_TEXTURE_WRAP_T`), texture filtering mode (`GL_TEXTURE_MIN_FILTER`, `GL_TEXTURE_MAG_FILTER`), etc.
5. **Upload Texture to GPU**: Use the `glTexImage2D` function to upload the texture data to the GPU. This function sets the texture's format and size, as well as the format and data type of the texture image.
6. **Generate Mipmap (Optional)**: If you plan to use Mipmaps (a texture scaling technique), you can call the `glGenerateMipmap` function to generate Mipmaps for the texture.
7. **Use Texture in Shader**: In the GLSL shader program, you need to declare a uniform sampler (`sampler2D` for 2D textures) to access the texture. Use the `glUniform1i` function to pass the texture unit location to the shader.
8. **Activate Texture Unit**: Before drawing, use the `glActiveTexture` function to activate a specific texture unit and then bind the corresponding texture to this unit.
9. **Cleanup**: When the texture is no longer needed, use the `glDeleteTextures` function to delete the texture object and free up resources.

 `Texture.h` is easier, we can just implement these functions above in `constructor`. Show code:

```c++
class Texture
{
private:
    unsigned int textureID;
    std::string filePath;
    unsigned char *m_LocalBuffer;
    int m_Width, m_Height, m_BPP;

public:
    Texture(const std::string& path);
    ~Texture();

    void Bind(unsigned int slot = 0) const;
    void UnBind() const;

    inline int GetWidth() const {return m_Width;}
    inline int GetHeight() const {return m_Height;}
};


Texture::Texture(const std::string &path) : textureID(0), filePath(path), m_LocalBuffer(nullptr), m_Width(0), m_Height(0), m_BPP(0)
{
    stbi_set_flip_vertically_on_load(1);                                     // flip our texture, make it up side down
    m_LocalBuffer = stbi_load(path.c_str(), &m_Width, &m_Height, &m_BPP, 4); // m_BPP 是每个像素的位数
    // generate a texture id
    glGenTextures(1, &textureID);
    glBindTexture(GL_TEXTURE_2D, textureID);
    // set parameters
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    // submit Image data to GPU
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA8, m_Width, m_Height, 0, GL_RGBA, GL_UNSIGNED_BYTE, m_LocalBuffer);
    // clear it after all
    glBindTexture(GL_TEXTURE_2D, 0);
    if (m_LocalBuffer)
    {
        stbi_image_free(m_LocalBuffer);
    }
}

Texture::~Texture()
{
    glDeleteTextures(1, &textureID);
}

void Texture::Bind(unsigned int slot) const
{
    glActiveTexture(GL_TEXTURE0 + slot);
    glBindTexture(GL_TEXTURE_2D, textureID);
}

void Texture::UnBind() const
{
    glBindTexture(GL_TEXTURE_2D, 0);
}
```

