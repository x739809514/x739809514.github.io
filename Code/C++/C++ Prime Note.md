## Variable & Basic Type

### Variable Size

| type              | size                                                         |
| ----------------- | ------------------------------------------------------------ |
| bool              | 8bits                                                        |
| char              | 8bits                                                        |
| wchar_t           | 16bits                                                       |
| char16_t(unicode) | 16bits                                                       |
| char32_t(unicode) | 32bits                                                       |
| short             | 16bits                                                       |
| int               | 16bits                                                       |
| long              | 32bits                                                       |
| long long         | 64bits                                                       |
| float             | 32bits, 6 significant figures, like 123.456, 0.00123456, 123456 |
| double            | 64bits, 10 significant figures                               |
| long double       | 64 bits, 10 significant figures                              |

1. if we know the varible is non-negative, choose unsign type
2. using `int` for integer calculation, mostly, the size of `long` is same as `int`, if the size is larger than `int`, choose `long long`
3. double and float:
   1. float is 4 bytes, double is 8 bytes, so `double` offers higher precision than `float`
   2. Mordern processor are optimized for `double`, so they are not  usually slower than `float`
   3. In most case, using `double`, but in game development, graphic processing, using `float` since precision requirement is lower in these cases.

```
(a) 'a', L'a', "a", L"a"
(b) 10, 10u, 10L, 10uL, 012, 0xC
(c) 3.14, 3.14f, 3.14L
(d) 10, 10u, 10., 10e-2
```

a. Character literal value, wide character literal value, string literal value, wide string literal value
b. decimal integer, unsigned decimal integer, long decimal integer, unsigned decimal integer, octal integer, hexadecimal integer
c. Double, float, long double
d. Decimal integer, unsigned decimal integer, double, double

### Variable Define & declaration

1. Initialization is not assignment
2. assignment = clear initial value + give new value
3. initial list: `int units_sold{0}`
4. you can multiple declaration a variable but you only can define it once, declare a variable: `extern int i`

### Reference

A reference is essentially an alias for another object. When you create a reference to a variable, you are creating a new name that refers to the same memory location as the original variable.

```c++
int val = 42;
int &refVal = val; 	// refVal is now a reference to val
```

reference must be initialized at decelaration.

#### Binding

- Once a reference is initialized to an object, it becomes bound to that object. This means that the reference will always refer to the same object for its entire lifetime.

- You cannot rebind a reference to refer to another object after it has been initialized.

- Example:

  ```c++
  cpp复制代码int a = 5;
  int b = 10;
  int &refA = a; // refA is now bound to a
  refA = b; // This does not rebind refA to b; it assigns the value of b to a
  ```

### Pointer

Pointer is a value which stores the address of the variable.

Get variable address:
```c++
int i = 42;
int *p = &i;
```

output an object: `cout << *p` , `*` is used to dereference

Empty pointer doesn't point to any objects, int *p = nullptr.

pointer `void*` can store any objects' address, that is non-type pointer, it only process memory space, can't access the object, so it need to cast a specific type pointer.

### Const

### Top-level & Low-level

Top-level const means the variable is const itself, low-level const means the pointer points a const variable

```c++
const int v2 = 0; int v1 = v2;
int *p1 = &v1, &r1 = v1;
const int *p2 = &v2, *const p3 = &i, &r2 = v2;
```

V2 is top-level const, p2 is low-level, p3 is both top-level and low-level(since p3 is a const pointer and it points to a const variable), r2 is low-level.

#### initialization

- const object must need to be initialized, and can't be changed
- const variable can't be accessed in another script, if you want to do that, add `extern`\
- reference to const can be read but cann't be changed
-  pointer to const: can't change the value of the object be pointed. (top-level const)
  `const double pi = 3.14; const double *cptr = &pi`
- const pointer: the address of the object can't be changed, but the value of the object can be changed (low-level const)
  `int i = 0; int *const ptr = &i`
- for top-level const, copy won't influence that, but for low-level const, we need add const by ourselves.
- constexpr: the object can be know at compile step

### Type Processing

`using` for alias, `using SI = Sales_item`

#### decltype

`decltype` can infer type from an expression

```c++
int a = 0;
decltype(a) b = 5;	// type of is int, since a is int
```

```c++
int f() {return 42;}
decltype(f()) sum = 10; // type of sum is int, since f() returns int
```

**decltype won't ignore top-level const, if the expression in decltype contains const, the infer type also contains const**

```c++
int i = 0;
decltype((i)) j = i; // type of j is int&，since (i) is lvalue expression
```

```c++
int x = 0;
int y = 0;
decltype(x = y) z = x; // type of z is int&，since x = y is a lvalue expression
```

in real working life, `decltype` often used for **Generic programming**, **template programming**, and **type inference**

```c++
template <typename T, typename U>
auto add(T t, U u) -> decltype(t + u) {
    return t + u;
}
```

### Preprocessor

```c++
#ifndef SALES_DATA_H  //SALES_DATA_H未定义时为真
#define SALES_DATA_H
strct Sale_data{
    ...
}
#endif
```

## String, Vector & Array

### Using 

- using namespace
- don't use "using" in the head file, since other code uses this head file will use this "using" meantime.

### String

A string is a variable-length character sequence.

Copy Initialization: using `=` copy an existing object to another
Direct Initialization: using `()` assign value to object

for (auto c : str) or for (auto &c : str)

### Vector

Vector is a template 

| Method                    | Explain                                                      |
| ------------------------- | ------------------------------------------------------------ |
| vector<T> v1              | v1 is a empty vector, the potential element is T type, excute default initialization |
| vector<T> v2 = v1         | v2 contains all elements in v1                               |
| vector<T> v2(v1)          | same as vector<T> v2=v1                                      |
| vector<T> v3(n, val)      | v3 contains duplicate elements, each one is val              |
| vector<T> v4(n)           | v4 contains duplicate elements which are initialized         |
| vector<T> v5{a, b, c...}  | v5 contains several initialized value                        |
| vector<T> v5={a, b, c...} | same as vector<T> v5{a, b, c...}                             |

C++11, vector<string> initialize: vector<string> v{"a", "an", "the"};

#### Add Elements

push_back()
push_back() may cause memory allocation(when there are no enough space), and call copy constructor. So it's better to use `Reserve()` allocating some memory space previously.

Notice thread security.

### Iterator

iterator can traverse a container.

- `auto b = v.begin();` returns an iterator pointing to the first element.
- `auto e = v.end();` returns an iterator pointing to the element past the last one (sentinel, past-the-end, one past the end) (off the end).
- If the container is empty, `begin()` and `end()` return the same iterator, which is the past-the-end iterator. 
- Use the dereference operator `*` to access the element pointed to by the iterator. Make a habit of using iterators and `!=` (for generic programming).
- `const_iterator`: can only read elements in the container but cannot modify them. 
- Arrow operator: dereference + member access, `it->mem` is equivalent to `(*it).mem`. 

**whenever a loop uses iterators, do not add elements to the container that the iterator belongs to.**

### C style string

Using stl string is better than this in most of time

### Pointer VS Reference

1. Reference always points to one of object
2. if the reference is not initialized, it would be wrong

### Pointer to pointer

a pointer to a pointer is a variable that stores the address of another pointer.

#### Declaration and Usage

```c++
int x = 5;
int *p = &x;    // Pointer to int
int **pp = &p;  // Pointer to pointer to int
```

#### Use Case

```c++
#include <iostream>
using namespace std;

void allocateMemory(int **p) {
    *p = new int;  // Allocates memory for an integer
    **p = 100;     // Sets the value to 100
}

int main() {
    int *p = nullptr;
    allocateMemory(&p);

    if (p != nullptr) {
        cout << "Value of allocated memory: " << *p << endl; // Output: 100
        delete p; // Free the allocated memory
    }

    return 0;
}
```

Multidimensional arrays

```c++
#include <iostream>
using namespace std;

int main() {
    int rows = 3;
    int cols = 4;

    // Allocate memory for a 2D array
    int **matrix = new int*[rows];
    for (int i = 0; i < rows; ++i) {
        matrix[i] = new int[cols];
    }

    // Initialize and print the matrix
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            matrix[i][j] = i * cols + j;
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }

    // Deallocate memory
    for (int i = 0; i < rows; ++i) {
        delete[] matrix[i];
    }
    delete[] matrix;

    return 0;
}
```

### Dynamic Array

- using `new` and `delete` , allocate in the heap
- int *pia = new int[10];
- delete [ ] pia;

## Expression

### Lvalue & Rvalue

The left value refers to an expression that can appear on the left of the assignment operator, indicating a memory position that can obtain the value of the location or store the new value in the  position.
	1. Addressable
	1. Durability: It exist with its scope and will not disappear because of the end of the expression

The right value can't appear on the left of the assignment operator, it represents a temporary value or literal quantity.
	1. non-addressable
	1. temporary

### Arithmetic operator

**overflow**: when calculation result exceeds the range of the type, it can overflow
**remainder operation**: m%n, the symbol of the result same as the m

### Short-circuit evaluation

it conditionally decides if need to calculate right-hand operand, accordfing to the value of the left-hand operand.
like `&&` , it calculate right-hand operand only when left operand is true.

using reference can avoid copy for element:
```c++
vector<string> text;
for(const auto &s: text){
  cout<<s;
}
```

### Incremental decrement operator

++i and i++，priority use ++i, i++ will store original value

*iter++ euqals to *(iter++), incremental operator has higher priority.

### Member access operaor

ptr->mem equals to (*ptr).mem, `.` has higher operator than `*`, so remember adding `( )` 

### Bitwise  operator

The bit operator acts on an integer type.
`<<`: move to left
`>>`: move to right
`~`: inverse
`&`: and
`|`: or
`^`: XOR

### Implicit type conversion

This is known as automatic type conversion or type promotion, refers to  the process where the compiler automatically converts a value from one data type to another without explicit instruction.

1. **Avoid precision loss**
   Implicit type conversion is designed to avoid precision loss whenever possible. This means that values are usually converted to a more precise or higher precision type.

   ```c++
   int i = 42;
   double d = i; // int is converted to double, avoiding precision loss
   ```

2. **Promotion of integers smaller than int**
   During calculations, integer types smaller than `int` (such as `char` and `short`) are promoted to `int` or `unsigned int` to prevent overflow or precision loss.

   ```c++
   char c = 'A';
   int i = c + 1; // char is promoted to int for arithmetic operations
   ```

3. **Non-boolean types in conditional statements**
   In conditional statements, non-Boolean types are implicitly converted to Boolean types. Non-zero values are converted to `true`, while zero values are converted to `false`.

   ```c++
   int x = 10;
   if (x) {
       // x is implicitly converted to a Boolean true
   }
   ```

4. **Type conversion in Arithmetic or Relational Operations**
   In arithmetic or relational operations, if the operands have different types, they are converted to the same type for the calculation. Typically, they are converted to the type with the highest precision in the expression.

   ```c++
   int a = 5;
   double b = 6.7;
   double result = a + b; // int is converted to double, then the addition is performed
   ```

5. Type conversion in Function calls
   During function calls, the actual parameter's type is converted to the type of the function parameter.

   ```c++
   void func(double d) {
       // ...
   }
   
   int i = 42;
   func(i); // int is converted to double
   ```

   
