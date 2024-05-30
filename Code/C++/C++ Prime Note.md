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

#### initialization

- const object must need to be initialized, and can't be changed
- const variable can't be accessed in another script, if you want to do that, add `extern`\
- reference to const can be read but cann't be changed
-  pointer to const: can't change the value of the object be pointed. (top-level const)
  `const double pi = 3.14; const double *cptr = &pi`
- const pointer: the address of the object can't be changed, but the value of the object can be changed (low-level const)
  `int i = 0; int *const ptr = &i`
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

