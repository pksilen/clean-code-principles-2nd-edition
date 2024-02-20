# Object-Oriented Design Principles

This chapter describes principles related to object-oriented design. The following principles are discussed:

- SOLID principles
- Uniform naming principle
- Encapsulation principle
- Composition principle
- Domain-driven design principle
- Use the design patterns principle
- Don't ask, tell principle
- Law of Demeter
- Avoid primitive type obsession principle
- Dependency injection principle
- Avoid duplication principle

## SOLID Principles

All five [SOLID principles](https://en.wikipedia.org/wiki/SOLID) are covered in this section. The _dependency inversion principle_ is generalized
as a _program against interfaces principle_. The five SOLID principles are the following:

- Single responsibility principle
- Open-closed principle
- Liskov's substitution principle
- Interface segregation principle
- Dependency inversion principle (Generalization: program against interfaces principle)

### Single Responsibility Principle

> Classes should have one responsibility, representing a thing or providing a single functionality.
> Functions should do one thing only.

Each class should have a single dedicated purpose. A class can represent a single thing, like
a bank account (`Account` class) or an employee (`Employee` class), or provide a single functionality
like parsing a configuration file (`ConfigFileParser` class) or calculating tax (`TaxCalculator` class).

We should not create a class representing a bank account and an employee. It is simply wrong.
Of course, an employee can _have_ a bank account. But that is a different thing. It is called object composition.
In object composition, an `Employee` class object contains an `Account` class object. The `Employee` class still represents one thing:
An employee (who can have a bank account). Object composition is covered later in this chapter in more detail.

At the function level, each function should perform a single task. The function name should describe what task the function
performs, meaning each function name should contain a verb. The function name should not contain the word _and_
because it can mean that the function is doing more than one thing or you haven't named the function on a correct abstraction level.
You should not name a function according to the steps it performs (e.g., doThisAndThatAndThenSomeThirdThing) but
instead, use wording on a higher level of abstraction.

When a class represents something, it can contain multiple methods. For example, in the `Account` class,
there can be methods like `deposit` and `withdraw`. It is still a single responsibility if these methods are simple enough
and if there are not too many methods in the class.

Below is a real-life code example where the _and_ word is used in the function name:

<div class="sourceCodeWithoutLabel">

```
void deletePageAndAllReferences(Page page) {
  deletePage(page);
  registry.deleteReference(page.name);
  configKeys.deleteKey(page.name.makeKey());
}
```
</div>

In the above example, the function seems to do two things: deleting a page and removing all the references to that page.
But if we look at the code inside the function, we can realize that it is doing a third thing also: deleting a page key from configuration keys.
So should the function be named `deletePageAndAllReferencesAndConfigKey`? It does not sound reasonable.
The problem with the function name is that it is at the same level of abstraction as the function statements.
The function name should be at a higher level of abstraction than the statements inside the function.

How should we then name the function? I cannot say for sure because I don't know the context of the function. We could name the function just `delete`. This would tell
the function caller that a page will be deleted. The caller does not need to know all the actions  
related to deleting a page. The caller just wants a page to be deleted. The function implementation should fulfill that
request and do the needed housekeeping actions, like removing all the references to the page being deleted and so on.

Another example of a function doing multiple things is JavaScript's `splice` method in the `Array` class.
The function name should describe what it does (more about that in the _uniform naming principle_ section
). But nobody would know what a `splice` function does if they just heard the name
for the first time. If the function name cannot tell what the function does, the function might do more than
one thing. The description of the `splice` method tells the following:

> The splice() method changes the contents of an array by removing or replacing existing elements and/or 
> adding new elements in place.

The above description indicates that the `splice` method does multiple things: removing,
replacing, and adding. This method should be split into multiple methods, each having a single
responsibility of removing, replacing, or adding.

Let's consider another example with React Hooks. React Hooks have a function named `useEffect` which can be used to enqueue
functions to be run after component rendering. The `useEffect` function can be used to run some code
after the initial render (after the component mount), after every render, or conditionally. This is quite much
responsibility for a single function. Also, the function's quite strange name does not reveal its purpose. The word _effect_
comes from the fact that this function is used to enqueue other functions with side effects to be run. The term _side effect_
might be familiar to functional language programmers. It indicates that a function is not pure (has side effects).

Below is an example React functional component:

_MyComponent.jsx_
```
import { useEffect } from "react";

export default function MyComponent() {
  useEffect(() => {
    function startFetchData() {
      // ...
    }
    
    function subscribeToDataUpdates() {
      // ...
    }
    
    function unsubscribeFromDataUpdates() {
      // ...
    }
    
    startFetchData();
    subscribeToDataUpdates();
    return function cleanup() { unsubscribeFromDataUpdates() };
  }, []);
  
  // JSX to render
  return ...;
}
```

In the above example, the `useEffect` call makes calls to functions `startFetchData` and `subscribeToDataUpdates`
to happen after the initial render because of the supplied empty array for dependencies
(the second parameter to the `useEffect` function). The cleanup function returned from the function supplied to `useEffect`
will be called before the effect will be run again or when the component is unmounted and in this case, only on unmount
because the effect will only run once after the initial render.

Let's imagine how we could improve the `useEffect` function. We could separate the functionality related to mounting and
unmounting into two different functions: `afterMount` and `beforeUnmount`. Then we could change the above example
to the following piece of code:

<div class="sourceCodeWithoutLabel">

```
export default function MyComponent() {
  function startFetchData() {
    // ...
  }
  
  function subscribeToDataUpdate() {
    // ...
  }
  
  function unsubscribeFromDataUpdate() {
    // ...
  }
   
  afterMount(startFetchData, subscribeToDataUpdates);
  beforeUnmount(unsubscribeFromDataUpdates)
  
  // JSX to render
  return ...;
}
```

</div>

The above example is cleaner and much easier for a reader to understand than the original example. There are no
multiple levels of nested functions. You don't have to return a function to be executed on component unmount, and you don't
have to supply an array of dependencies.

Let's have another example of a React functional component:

<div class="sourceCodeWithoutLabel">

```
import { useEffect, useState } from "react";

export default function ButtonClickCounter() {
  const [clickCount, setClickCount] = useState(0);
  
  useEffect(() => {
    function updateClickCountInDocumentTitle() {
      document.title = `Click count: ${clickCount}`;
    }
    
    updateClickCountInDocumentTitle();
  });
}
```

</div>

In the above example, the effect is called after every render (because no dependencies array is supplied
for the `useEffect` function). Nothing in the above code clearly states what will be executed and when. We
still use the same `useEffect` function, but now it behaves differently compared to the previous example. It
seems like the `useEffect` function is doing multiple things. How to solve this? Let's think hypothetically again.
We could introduce yet another new function that can be called when we want something to happen after every render:

<div class="sourceCodeWithoutLabel">

```
export default function ButtonClickCounter() {
  const [clickCount, setClickCount] = useState(0);
  
  afterEveryRender(function updateClickCountInDocumentTitle() {
    document.title = `Click count: ${clickCount}`;
  });
}
```
</div>

The intentions of the above React functional component are pretty clear: It will update the click count in the
document title after every render.

Let's optimize our example so that the click count update happens only if the click count has changed:

<div class="sourceCodeWithoutLabel">

```
import { useEffect, useState } from "react";

export default function ButtonClickCounter() {
  const [clickCount, setClickCount] = useState(0);
  
  useEffect(() => {
    function updateClickCountInDocumentTitle() {
      document.title = `Click count: ${clickCount}`;
    }
    
    updateClickCountInDocumentTitle();
  }, [clickCount]);
}
```

</div>

Notice how `clickCount` is now added to the dependencies array of the `useEffect` function. This means
the effect is not executed after every render but only when the click count is changed.

Let's imagine how we could improve the above example. We could introduce a new function that handles dependencies:
`afterEveryRenderIfChanged`. Our hypothetical example would now look like this:

<div class="sourceCodeWithoutLabel">

```
export default function ButtonClickCounter() {
  const [clickCount, setClickCount] = useState(0);
   
  afterEveryRenderIfChanged(
    [clickCount],
    function updateClickCountInDocumentTitle() {
      document.title = `Click count: ${clickCount}`;
  });
}
```

</div>

Making functions do a single thing also helped make the code more readable.
Regarding the original examples, a reader must look at the end of the `useEffect` function call to figure out in what
circumstances the effect function will be called. And it is cognitively challenging to understand and remember the difference between
a missing and empty dependencies array. Good code is such that it does not make the code reader think.
At best, code should read like prose: _after every render if changed "clickCount", update click count in document title_.

One idea behind the single responsibility principle is that it enables software development using the _open-closed principle_ described in the next section. When you follow the single responsibility principle and need
to add functionality, you add it to a new class, which means you don't need to modify an existing
class. You should avoid modifying existing code but extend it by adding new classes, each with a single responsibility.

### Open-Closed Principle

> Software code should be open for extension and closed for modification. Functionality in existing classes should not 
> be modified, but new classes should be introduced that either implement a new or existing interface or extend an existing class.

Any time you find yourself modifying some method in an existing class, you should first consider if
this principle could be followed and if the modification could be avoided. Every time you modify an existing class, you can
introduce a bug in the working code. The idea of this principle is to leave the working code untouched, so it does not get accidentally broken.

Let's have an example where this principle is not followed. We have the following existing and working code:

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
}

public class RectangleShape implements Shape {
  private int width;
  private int height;
  
  public RectangleShape(final int width, final int height) {
    this.width = width;
    this.height = height;
  }
  
  public int getWidth() {
    return width;
  }

  public int getHeight() {
    return height;
  }
  
  public void setWidth(final int newWidth) {
    width = newWidth;
  }

  public void setHeight(final int newHeight) {
    height = newHeight;
  }
}
```

</div>

Suppose we get an assignment to introduce support for square shapes. Let's try to modify the existing
`RectangleShape` class, because a square is also a rectangle:

<div class="sourceCodeWithoutLabel">

```
public class RectangleShape implements Shape {
  private int width;
  private int height;
    
  // Rectangle constructor
  public RectangleShape(final int width, final int height)  {
    this.width = width;
    this.height = height;
  }
    
  // Square constructor
  public RectangleShape(final int sideLength) {
    this.width = sideLength;
    this.height = sideLength;
  }
    
  public int getWidth() {
      return width;
  }

  public int getHeight() {
      return height;
  }

  public void setWidth(final int newWidth) {
    if (height == width) {
      //noinspection SuspiciousNameCombination
      height = newWidth;    
    }
    
    width = newWidth;
  }

  public void setHeight(final int newHeight) {
    if (height == width) {
      //noinspection SuspiciousNameCombination
      width = newHeight;
    }
    
    height = newHeight;
  }
}
```
</div>

We needed to add a new constructor and modify two methods in the class. Everything works okay when we run tests.
But we have introduced a subtle bug in the code: If we create a rectangle
with an equal height and width, the rectangle becomes a square, which is probably not what is wanted. This is
a bug that can be hard to find in unit tests. This example showed that modifying an existing class can be problematic.
We modified an existing class and accidentally broke it.

A better solution to introduce support for square shapes is to use the _open-closed principle_ and create a new class
that implements the `Shape` interface. Then we don't have to modify any existing class, and there is no risk of accidentally
breaking something in the existing code. Below is the new `SquareShape` class:

<div class="sourceCodeWithoutLabel">

```
public class SquareShape implements Shape {
  private int sideLength;
    
  public SquareShape(final int sideLength) {
    this.sideLength = sideLength;
  }
  
  public int getSideLength() {
    return sideLength;
  }

  public void setSideLength(final int newSideLength) {
    sideLength = newSideLength;
  }
}
```

</div>

An existing class can be safely modified by adding a new method in the following cases:

1) The added method is a pure function, i.e., it always returns the same value for the same arguments and does not have side effects, i.e., it does not modify the object's state.
2) The added method is read-only and tread-safe, i.e., it does not modify the object's state and accesses the object's state in a thread-safe manner in the case of multithreaded code. An example of a read-only method in a shape class would be a method that calculates the shape's area.
3) Class is immutable, i.e., the added method (or any other method) cannot modify the object's state

There are a couple of cases where the modification of existing code is needed. One example is factories. When you
introduce a new class, you need to modify the related factory to be able to create an instance of that new class. For example, if we had a `ShapeFactory` class, we would need to modify it to support the creation of `SquareShape` objects.
Factories are discussed later in this chapter.

Another case is adding a new enum constant. You typically need to modify existing code to handle the new enum constant.
If you forget to add the handling of the new enum constant somewhere in the existing code, typically, a bug will arise. For this reason,
you should always safeguard switch-case statements with a _default_ case that throws and if/else-if structures with an else branch that throws.
You can also enable your static code analysis tool to report an issue if a switch statement's default case is missing or
an else-branch is missing from an if/else-if structure. Also, some static code analysis tools can report an issue if you miss handling
an enum constant in a switch-case statement.

Here is an example of safeguarding an if/else-if structure in Java:

<div class="sourceCodeWithoutLabel">

```
public enum FilterType {
  INCLUDE,
  EXCLUDE
}

interface Filter { 
  boolean isFilteredOut(...);
}

public class FilterImpl implements Filter {
  private final FilterType filterType;
  
  public FilterImpl(final FilterType filterType, ...) {
    this.filterType = filterType;
    // ...
  }
  
  public boolean isFilteredOut(...) {
    if (filterType == FilterType.INCLUDE) {
      // ...
    } else if (filterType == FilterType.EXCLUDE) {
      // ..
    } else {
      // Safeguarding
      throw new IllegalArgumentException("Invalid filter type");
    }
  }
}
```

</div>

In TypeScript, safeguarding might be needed for union types also:

<div class="sourceCodeWithoutLabel">

```
type FilterType = 'include' | 'exclude';

if (filterType === 'include') {
  // ...
} else if (filterType === 'exclude') {
  // ...
} else {
  // Safeguarding
  throw new Error("Invalid filter type");
}
```

</div>

We can notice from the above examples that if/else-if structures could be avoided
with a better object-oriented design. For instance, we could create a `Filter` interface and two separate classes,
`IncludeFilter` and `ExcludeFilter`, that implement the `Filter` interface.
Using object-oriented design allows us to eliminate the `FilterType` enum and the if/else-if structure.
This is known as the _replace conditionals with polymorphism_ refactoring technique. Refactoring is discussed more
in the next chapter. Below is the above Java example refactored to be more object-oriented:

<div class="sourceCodeWithoutLabel">

```
interface Filter { 
  boolean isFilteredOut(...);
}

public class IncludeFilter implements Filter {
  
  // ...
  
  public boolean isFilteredOut(...) {
    // ...
  }
}

public class ExcludeFilter implements Filter {
  
  // ...
  
  public boolean isFilteredOut(...) {
    // ...
  }
}
```

</div>

### Liskov's Substitution Principle

> Objects of a superclass should be replaceable with objects of its subclasses without breaking the application. I.e., 
> objects of subclasses behave the same way as the objects of the superclass.

Following _Liskov's substitution principle_ guarantees semantic interoperability of types in a type hierarchy.

Let's have an example with a `RectangleShape` class and a derived `SquareShape` class:

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
  void draw();
}

public class RectangleShape implements Shape {
  private int width;
  private int height;

  public RectangleShape(final int width, final int height) {
    this.width = width;
    this.height = height;
  }

  public void draw() {
    // ...
  }

  public int getWidth() {
    return this.width;
  }

  public int getHeight() {
    return this.height;
  } 

  public void setWidth(final int newWidth) {
    width = newWidth;
  }

  public void setHeight(final int newHeight) {
    height = newHeight;
  }
}

public class SquareShape extends RectangleShape {
  public SquareShape(final int sideLength) {
    super(sideLength, sideLength);
  }

  @Override
  public void setWidth(final int newWidth) {
    super.setWidth(newWidth);
    //noinspection SuspiciousNameCombination
    super.setHeight(newWidth);
  }

  @Override
  public void setHeight(final int newHeight) {
    //noinspection SuspiciousNameCombination
    super.setWidth(newHeight);
    super.setHeight(newHeight);
  }
}
```

</div>

The above example does not follow Liskov's substitution principle because you cannot set a square's width and height separately. This means that a square is not a rectangle from an object-oriented point of view. Of course, mathematically, a square is a rectangle. But when
considering the above public API of the `RectangleShape` class, we can conclude that a square is not a rectangle because
a square cannot fully implement the API of the `RectangleShape` class.
We cannot substitute a square object for a rectangle object. What we need to do is to implement the `SquareShape` class without
deriving from the `RectangleShape` class:

<div class="sourceCodeWithoutLabel">

```
public class SquareShape implements Shape {
  private int sideLength;

  public SquareShape(final int sideLength) {
    this.sideLength = sideLength;
  }

  public void draw() {
    // ...
  }

  public int getSideLength() {
    return this.sideLength;
  }

  public void setSideLength(final int newSideLength) {
    sideLength = newSideLength;
  }
}
```
</div>

Liskov's substitution principle requires the following:

- A subclass must implement the superclass API and retain (or, in some cases, replace) the functionality of the superclass.
- A superclass should not have protected fields because it allows subclasses to modify the state of the superclass, which can lead to incorrect behavior in the superclass

Below is an example where a subclass extends the behavior of a superclass in the `doSomething` method. The functionality of the superclass is retained in the subclass
making a subclass object substitutable for a superclass object.

<div class="sourceCodeWithoutLabel">

```
public class SuperClass {
  // ...
  
  public void doSomething() {
    // ...
  }
}

public class SubClass extends SuperClass {
  // ...

  @Override
  public void doSomething() {
    super.doSomething();

    // Some additional behaviour...
  }
}
```
</div>

Let's have a concrete example of using the above strategy. We have the following `CircleShape` class defined:

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
  void draw();
}

public class CircleShape implements Shape {
  public void draw() {
    // draw the circle stroke
  }
}
```

</div>

Next, we introduce a class for filled circles:

<div class="sourceCodeWithoutLabel">

```
public class FilledCircleShape extends CircleShape {
  @Override
  public void draw() {
     super.draw(); // draws the circle stroke
     // Fill the circle
  }
}
```

</div>

The `FilledCircleShape` class fulfills the requirements of Liskov's substitution principle. We can use an instance of the
`FilledCircleShape` class everywhere where an instance of the `CircleShape` class is wanted. The `FilledCircleShape` class
does all that the `CircleShape` class does, plus adds some behavior (= filling the circle).

You can also completely replace the superclass functionality in a subclass:

_ReverseArrayList.java_
```
public class ReverseArrayList<T> extends ArrayList<T>
{
  @Override
  public Iterator<T> iterator() {
    return new ReverseListIterator<>(this);
  }
}
```

The above subclass implements the superclass API and retains its behavior: The `iterator` method still returns an iterator. It just returns a different iterator compared to the
superclass.

### Interface Segregation and Multiple Inheritance Principle

> Segregate a larger interface to micro interfaces with a single capability/behavior and construct larger interfaces by inheriting multiple micro interfaces.

Let's have an example with several automobile classes:

<div class="sourceCodeWithoutLabel">

```
public interface Automobile {
  void drive(Location start, Location destination);
  void carryCargo(double volumeInCubicMeters, double weightInKgs);
}

public class PassengerCar implements Automobile {
  // Implement drive and carryCargo
}

public class Van implements Automobile {
  // Implement drive and carryCargo
}

public class Truck implements Automobile {
  // Implement drive and carryCargo
}

public interface ExcavatingAutomobile extends Automobile {
  void excavate(...);
}

public class Excavator implements ExcavatingAutomobile {
  // Implement drive, carryCargo and excavate
}
```
</div>

Notice how the `Automobile` interface has two methods declared. This can limit our software if we
later want to introduce other vehicles that could be just driven but unable to carry cargo. In an early phase, we should
segregate two micro interfaces from the `Automobile` interface. A micro interface defines a single capability
or behavior. After segregation, we will have the following two micro interfaces:

<div class="sourceCodeWithoutLabel">

```
public interface Drivable {
  void drive(Location start, Location destination);
}

public interface CargoCarriable {
  void carryCargo(double volumeInCubicMeters, double weightInKgs);
}
```

</div>

Now that we have two interfaces, we can use these interfaces also separately in our codebase. For example, we can have a list of drivable objects or a list of objects that can carry cargo. We still want to have an interface
for automobiles, though. We can use _interface multiple inheritance_ to redefine the `Automobile` interface to extend the two micro interfaces:

<div class="sourceCodeWithoutLabel">

```
public interface Automobile extends Drivable, CargoCarriable {
}
```
</div>

If we look at the `ExcavatingAutomobile` interface, we can notice that it extends the `Automobile` interface and
adds excavating behavior. Once again, we have a problem if we want to have an excavating machine that is not
auto-mobile. The excavating behavior should be segregated into its own micro interface:

<div class="sourceCodeWithoutLabel">

```
public interface Excavating { 
  void excavate(...);
}
```
</div>

We can once again use the interface multiple inheritance to redefine the `ExcavatingAutomobile` interface as follows:

<div class="sourceCodeWithoutLabel">

```
public interface ExcavatingAutomobile 
                   extends Excavating, Automobile {
}
```

</div>

The `ExcavatingAutomobile` interface now extends three micro interfaces: `Excavating`, `Drivable`,
and `CargoCarriable`. Where-ever you need an excavating, drivable, or cargo-carriable object in your codebase,
you can use an instance of the `Excavator` class there.

Let's have another example with a generic collection interface with TypeScript. We should be able to
traverse a collection and also be able to compare two collections for equality. First, we define a generic `MyIterator`
interface for iterators. It has two methods, as described below:

<div class="sourceCodeWithoutLabel">

```
interface MyIterator<T> {
  hasNextElement(): boolean;
  getNextElement(): T;
}
```

</div>

Next, we can define the collection interface:

<div class="sourceCodeWithoutLabel">

```
interface Collection<T> {
  createIterator(): MyIterator<T>;
  equals(anotherCollection: Collection<T>): boolean;
}
```

</div>

`Collection<T>` is an interface with two unrelated methods. Let's segregate those methods
into two micro interfaces: `MyIterable` and `Equatable`. The `MyIterable` interface is for objects that you can iterate over.
It has one method for creating new iterators. The `Equatable` interface's `equals` method is more generic than
the `equals` method in the `Collection<T>` interface. You can equate an `Equatable<T>` object with
another object of type `T`:

<div class="sourceCodeWithoutLabel">

```
interface MyIterable<T> {
  createIterator(): MyIterator<T>;
}

interface Equatable<T> {
  equals(anotherObject: T): boolean;
}
```

</div>

We can use interface multiple inheritance to redefine the `Collection<T>` interface as follows:

<div class="sourceCodeWithoutLabel">

```
interface Collection<T> extends MyIterable<T>,
                                Equatable<Collection<T>> {
}
```

</div>

We can implement the `equals` method by iterating elements in two collections and checking if the elements are equal:

<div class="sourceCodeWithoutLabel">

```
abstract class AbstractCollection<T> implements Collection<T> {
  abstract createIterator(): MyIterator<T>;
  
  equals(anotherCollection: Collection<T>): boolean {
    const iterator = this.createIterator();
    const anotherIterator = anotherCollection.createIterator();
    let collectionsAreEqual = 
      this.areEqual(iterator, anotherIterator);
    
    if (anotherIterator.hasNextElement()) {
      collectionsAreEqual = false; 
    }
    
    return collectionsAreEqual;
  }
  
  private areEqual(
    iterator: MyIterator<T>,
    anotherIterator: MyIterator<T>
  ): boolean {
    while (iterator.hasNextElement()) {
      if (anotherIterator.hasNextElement()) {
        if (iterator.getNextElement() !== 
            anotherIterator.getNextElement()) {
         return false;
        }
      } else {
        return false;
      }
    }
    
    return true;
  }
}
```

</div>

Collections can also be compared. Let's introduce support for such collections. First, we define a generic `Comparable<T>`
interface for comparing an object with another object:

<div class="sourceCodeWithoutLabel">

```
type ComparisonResult = 'isLessThan' | 'areEqual' | 'isGreaterThan' | 'unspecified';

interface Comparable<T> {
  compareTo(anotherObject: T): ComparisonResult;
}
```

</div>

Now we can introduce a comparable collection interface that allows comparing two collections
of the same type:

<div class="sourceCodeWithoutLabel">

```
interface ComparableCollection<T> 
            extends Comparable<Collection<T>>, Collection<T> {
}
```

</div>

Let's define a generic sorting algorithm for collections whose elements are comparable:

<div class="sourceCodeWithoutLabel">

```
function sort<T, U extends Comparable<T>, V extends Collection<U>>(
  collection: V
): V {
  // ...
}
```

</div>

Let's create two interfaces, `Inserting<T>` and `InsertingIterable<T>` for classes whose instances elements can be inserted into:

<div class="sourceCodeWithoutLabel">

```
interface Inserting<T> {
  insert(element: T): void;
}

interface InsertingIterable<T> extends Inserting<T>,
                                       MyIterable<T> {
}
```

</div>

Let's redefine the `Collection` interface to extend the `InsertingIterable` interface because a collection is iterable,
and you can insert elements into a collection.

<div class="sourceCodeWithoutLabel">

```
interface Collection<T> extends InsertingIterable<T> {
}
```

</div>

Next, we introduce two generic algorithms for collections: `map` and `filter`. We can realize that those algorithms work
with more abstract objects than collections. We benefit from interface segregation because instead of
the `Collection<T>` interface, we can use the `MyIterable<T>` and
`InsertingIterable<T>` interfaces to create generic `map` and `filter` algorithms. Later it is possible to introduce some additional non-collection iterable
objects that can utilize the algorithms as well. Below is the implementation of the `map` and `filter` functions:

<div class="sourceCodeWithoutLabel">

```
function map<T, U>(
  source: MyIterable<T>,
  mapped: (sourceElement: T) => U,
  destination: InsertingIterable<U>
): InsertingIterable<U> {
  const sourceIterator = source.createIterator();
  
  while(sourceIterator.hasNextElement()) {
    const sourceElement = sourceIterator.getNextElement();
    destination.insert(mapped(sourceElement));
  }
  
  return destination;
}

function filter<T>(
  source: MyIterable<T>,
  isIncluded: (sourceElement: T) => boolean,
  destination: InsertingIterable<T>
): InsertingIterable<T> {
  const sourceIterator = source.createIterator();
  
  while (sourceIterator.hasNextElement()) {
    const sourceElement = sourceIterator.getNextElement();
    
    if (isIncluded(sourceElement)) {
      destination.insert(sourceElement);
    }
  }
  
  return destination;
}
```
</div>

Let's define the following concrete collection classes:

<div class="sourceCodeWithoutLabel">

```
class List<T> implements Collection<T> {
  constructor(...args: T[]) {
    // ...
  }

  // ...
}

class Stack<T> implements Collection<T> {
  // ...
}

class MySet<T> implements Collection<T> {
  // ...
}
```

</div>

Now we can use the `map` and `filter` algorithms with the above-defined collection classes:

<div class="sourceCodeWithoutLabel">

```
const numbers = new List<number>(1, 2, 3, 3, 3, 50, 60);
const isLessThan10 = (nbr: number) => nbr < 10;

const uniqueLessThan10Numbers =
  filter(numbers, isLessThan10, new MySet());

const doubled = (nbr: number) => 2 * nbr;
const stackOfDoubledNumbers = map(numbers, doubled, new Stack());
```

</div>

Let's create asynchronous version of the `map` algorithms:

<div class="sourceCodeWithoutLabel">

```
interface MaybeCloseable {
  tryClose(): Promise<void>;
}

interface MaybeInserting<T> {
  tryInsert(value: T): Promise<void>;
}

interface MaybeCloseableInserting<T> 
            extends MaybeCloseable, MaybeInserting<T> {
}

class MapError extends Error {
  // ...
}

async function tryMap<T, U>(
  source: MyIterable<T>,
  mapped: (sourceElement: T) => U,
  destination: MaybeCloseableInserting<U>
): Promise<void> {
  const sourceIterator = source.createIterator();
 
  try {
    while (sourceIterator.hasNextElement()) {
      const sourceElement = sourceIterator.getNextElement();
      await destination.tryInsert(mapped(sourceElement));
    }
      
    await destination.tryClose();
  } catch (error: any) {
    throw new MapError(error.message);
  }
}
```

</div>

Let's create a `FileLineInserter` class that implements the `MaybeCloseableInserting` interface:

<div class="sourceCodeWithoutLabel">

```
const fs = require('fs');

class FileLineInserter<T extends { toString(): string }>
        implements MaybeCloseableInserting<T> {
  private writeStream: FS.WriteStream;

  constructor(private readonly filePathName: string) {
    this.writeStream = 
      fs.createWriteStream(this.filePathName, { flags: 'a' });
  }

  async tryInsert(value: T): Promise<void> {
    try {
      const writePromise = new Promise((resolve, reject) => {
        const line = value.toString() + '\n';
        
        this.writeStream.write(line, (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      });
      
      await writePromise;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  tryClose(): Promise<void> {
    this.writeStream.close();
    return Promise.resolve();
  }
}
```

</div>

Let's use the above-defined `tryMap` algorithm and the `FileLineInserter` class to write doubled numbers (one number per line) to
a file named _file.txt_:

<div class="sourceCodeWithoutLabel">

```
const numbers = new List<number>(1, 2, 3, 2, 1, 50, 60);
const doubled = (nbr: number) => 2 * nbr;

try {
  await tryMap(numbers, doubled, new FileLineInserter('file.txt'));
} catch(error: any) { // error will be always MapError type.
  console.log(error.message);
}
```

</div>

### Program Against Interfaces Principle (Generalized Dependency Inversion Principle)

> Do not write programs where internal dependencies are concrete object types—instead, program against interfaces. An exception to this rule is data classes with no behavior (not counting simple getters/setters).

An interface is used to define an abstract base type. Various implementations can be introduced that implement the interface.
When you want to change the behavior of a program, you create a new class that implements an interface
and then use an instance of that class. In this way, you can practice the _open-closed principle_. You can think of this principle as a prerequisite for using the _open-closed principle_ effectively. The _program against interfaces principle_ is a generalization of the _dependency inversion principle_ from the SOLID principles:

> The _dependency inversion principle_ is a methodology for loosely coupling software classes. When following the principle,
> the conventional dependency relationships from high-level classes to low-level classes are reversed, thus making the high-level
> classes independent of the low-level implementation details.

The _dependency inversion principle_ states:

1) High-level classes should not import anything from low-level classes
2) Abstractions (= interfaces) should not depend on concrete implementations (classes)
3) Concrete implementations (classes) should depend on abstractions (= interfaces)

![Fig 3.1 Dependency Inversion Principle](images/03-02.png)

An interface is always an abstract type and cannot be instantiated. Below is an example of an interface:

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
  void draw();
  double calculateArea();
}
```

</div>

The name of an interface describes something abstract, which you cannot create an object of.
In the above example, `Shape` is clearly something abstract. You cannot create an instance of `Shape` and then
draw it or calculate its area because you don't know what shape it is. But when a class implements an
interface, a concrete object of the class representing the interface can be created. Below is an example of three different classes
that implement the `Shape` interface:

<div class="sourceCodeWithoutLabel">

```
public class CircleShape implements Shape {
  private final int radius;
  
  public CircleShape(final int radius) {
    this.radius = radius;
  }
  
  public void draw() {
    // ...
  }
  
  public double calculateArea() {
    return Math.PI * radius * radius;
  }
}

public class RectangleShape implements Shape {
  private final int width;
  private final int height;

  public RectangleShape(final int width, final int height) {
    this.width = width;
    this.height = height;
  }

  public void draw() {
    // ...
  }

  public double calculateArea() {
    return width * height;
  }
}

public class SquareShape extends RectangleShape {
  public SquareShape(final int sideLength) {
   super(sideLength, sideLength);
  }
}
```

</div>

When using shapes in code, we should program against the `Shape` interface. In the below example, we make
a high-level class `Canvas` dependent on the `Shape` interface, not on any of the low-level classes (`CircleShape`,
`RectangleShape` or `SquareShape`). Now both the high-level `Canvas` class and all the low-level shape classes depend on abstraction only,
the `Shape` interface. We can also notice that the high-level class `Canvas` does not import anything from the
low-level classes. Also, the abstraction `Shape` does not depend on concrete implementations (classes).

<div class="sourceCodeWithoutLabel">

```
public class Canvas {
  private final List<Shape> shapes = new ArrayList<>(10);
  
  public Canvas() {
  }
  
  public void add(final Shape shape) {
    shapes.add(shape);
  }
  
  public void drawShapes() {
    for(final var shape : shapes) {
      shape.draw();    
    }
  }
}
```

</div>

A `Canvas` object can contain any shape and draw any shape. It can handle any of
the currently defined concrete shapes and any new shape defined in the future.

If you did not program against an interface and did not use the dependency inversion principle, your `Canvas` class would
look like the following:

<div class="sourceCodeWithoutLabel">

```
public class Circle {
  public void draw() {
    // ...
  }    
}

public class Rectangle {
  public void draw() {
    // ...
  }    
}

public class Square {
  public void draw() {
    // ...
  }    
}

public class Canvas {
  private final List<Circle> circles = new ArrayList<>(10);
  private final List<Rectangle> rectangles = new ArrayList<>(10);
  private final List<Square> squares = new ArrayList<>(10);
  
  public Canvas() {
  }
  
  public void addCircle(final Circle circle) {
    circles.add(circle);
  }

  public void addRectangle(final Rectangle rectangle) {
    rectangles.add(rectangle);
  }

  public void addSquare(final Square square) {
    squares.add(square);
  }
  
  public void drawShapes() {
    for(final var circle : circles) {
      circle.draw();    
    }
    
    for(final var rectangle : rectangles) {
      rectangle.draw();
    }

    for(final var square : squares) {
      square.draw();
    }
  }
}
```

</div>

The above high-level `Canvas` class is coupled with all the low-level classes (`Circle`, `Rectangle`, and `Square`). The `Canvas` class must be modified if a new shape type is needed. If something changes in the public API
of any low-level class, the `Canvas` class needs to be modified accordingly.

Let's have another example. If you have read books or articles about object-oriented design, you may have encountered
something similar as is presented in the below example:

<div class="sourceCodeWithoutLabel">

```
public class Dog {
  public void walk() {
    // ...
  }
  
  public void bark() {
    // ...
  }
}

public class Fish {
  public void swim() {
    // ...
  }
}

public class Bird {
  public void fly() {
    // ...
  }

  public void sing() {
    // ...
  }
}
```
</div>

Three concrete implementations are defined above, but no interface is defined. Let's say we are making
a game that has different animals. The first thing to do when coding the game is to remember to program
against interfaces and thus introduce an `Animal` interface that we can use as an abstract base type. Let's try to create
the `Animal` interface based on the above concrete implementations:

<div class="sourceCodeWithoutLabel">

```
public interface Animal {
  void walk();
  void bark();
  void swim();
  void fly();
  void sing();
}

public class Dog implements Animal {
  public void walk() {
    // ...
  }

  public void bark() {
    // ...
  }

  public void swim() {
    throw new RuntimeException("Illegal operation");
  }
  
  public void fly() {
    throw new RuntimeException("Illegal operation");
  }
  
  public void sing() {
    throw new RuntimeException("Illegal operation");
  }
}
```
</div>

The above approach is wrong. We declare that the `Dog` class implements the `Animal` interface, but
it does not do that. It implements only methods `walk` and `bark` while other methods throw an exception. We should be
able to substitute any concrete animal implementation where an animal is required. But it is impossible because
if we have a `Dog` object, we cannot safely call `swim`, `fly`, or `sing` methods because they will always throw.

The problem is that we defined the concrete classes before defining the interface. That approach is wrong.
We should specify the interface first and then the concrete implementations. What we did above was the other way around.

When defining an interface, we should remember that we are defining an abstract base type, so we must think in abstract terms. We must consider what we want the animals to do in the game. If we look
at the methods `walk`, `fly`, and `swim`, they are all concrete actions. But what is the abstract action common to these
three concrete actions? It is _move_. And walking, flying, and swimming are all ways
of moving. Similarly, if we look at the `bark` and `sing` methods, they are also concrete actions. What is the abstract action
common to these two concrete actions? It is _makeSound_. And barking and
singing are both ways to make a sound. If we use these abstract actions, our `Animal` interface looks like the following:

<div class="sourceCodeWithoutLabel">

```
public interface Animal {
  void move();
  void makeSound();
}
```

</div>

We can now redefine the animal classes to implement the new `Animal` interface:

<div class="sourceCodeWithoutLabel">

```
public class Dog implements Animal {
  public void move() {
    // walk
  }
  
  public void makeSound() {
    // bark
  }
}

public class Fish implements Animal {
  public void move() {
    // swim
  }

  public void makeSound() {
    // Intentionally no operation 
    // (Fishes typically don't make sounds)
  }
}

public class Bird implements Animal {
  public void move() {
    // fly
  }

  public void makeSound() {
    // sing
  }
}
```
</div>

Now we have a correct object-oriented design and can program against the `Animal` interface. We can call the `move` method
when we want an animal to move and the `makeSound` method when we want an animal to make a sound.

After realizing that some birds don't fly at all, we can easily enhance our design. We can introduce two different implementations:

<div class="sourceCodeWithoutLabel">

```
public abstract class AbstractBird implements Animal {
  public abstract void move();
  
  public void makeSound() {
    // sing
  }
}

public class FlyingBird extends AbstractBird {
  public void move() {
    // fly
  }
}

public class NonFlyingBird extends AbstractBird {
  public void move() {
    // walk
  }
}
```

</div>

We might also later realize that not all birds sing but make different sounds. Ducks quack, for example.
Instead of using inheritance as was done above, an even better alternative is to use _object composition_.
We compose the `Bird` class of behavioral classes for moving and making sounds:

<div class="sourceCodeWithoutLabel">

```
public interface Mover {
  void move();    
}

public interface SoundMaker {
  void makeSound();
}

public class Bird implements Animal {
  private final Mover mover;
  private final SoundMaker soundMaker;
  
  public Bird(
    final Mover mover,
    final SoundMaker soundMaker
  ) {
    this.mover = mover;
    this.soundMaker = soundMaker;
  }
  
  public void move() {
    mover.move();
  }
  
  public void makeSound() {
    soundMaker.makeSound();
  }
}
```
</div>

Now we can create birds with various behaviors for moving and making sounds. We can use the _factory pattern_ to
create different birds. The _factory pattern_ is described in more detail later in this chapter. Let's introduce
three different moving and sound-making behaviors and a factory to make three kinds of birds: goldfinches, ostriches,
and domestic ducks.

<div class="sourceCodeWithoutLabel">

```
public class Flyer implements Mover {
  public void move() {
    // fly
  }
}

public class Runner implements Mover {
  public void move() {
    // run
  }
}

public class Walker implements Mover {
  public void move() {
    // walk
  }
}

public class GoldfinchSoundMaker implements SoundMaker {
  public void makeSound() {
    // Sing goldfinch specific songs
  }
}

public class OstrichSoundMaker implements SoundMaker {
  public void makeSound() {
    // Make ostrich specific sounds like whistles,
    // hoots, hisses, growls, and deep booming growls
    // that sound like the roar of a lion
  }
}

public class Quacker implements SoundMaker {
  public void makeSound() {
    // quack
  }
}

public enum BirdType {
  GOLDFINCH,
  OSTRICH,
  DOMESTIC_DUCK
}

public class BirdFactory {
  public Bird createBird(final BirdType birdType) {
    return switch(birdType) {
      case GOLDFINCH ->
        new Bird(new Flyer(),
                 new GoldfinchSoundMaker());
      
      case OSTRICH -> 
        new Bird(new Runner(),
                 new OstrichSoundMaker());
      
      case DOMESTIC_DUCK ->
        new Bird(new Walker(),
                 new Quacker());
      
      default -> 
        throw new IllegalArgumentException("Unsupported type");
    };
  }
}
```

</div>

## Clean Microservice Design Principle

> The clean microservice design promotes object-oriented design with separation of concerns achieved
> by dividing software into layers using the dependency inversion principle (programming against interfaces).

Clean microservice design comes with the following benefits:

- Not tied to any single framework
- Not tied to any single API technology like REST or GraphQL
- Unit testable
- Not tied to a specific client (works with web, desktop, console, and mobile clients)
- Not tied to a specific database
- Not dependent on any specific external service implementation

A clean API microservice design consists of the following layers:

- Controller, Interface adapters
- Use cases
- (Business) Entities

Uses cases and entities together form the _model_ of the service, also called the _business logic_. 

![Fig 3.2 Clean Microservice Design](images/03-03.png)

The direction of dependencies in the above diagrams is shown with arrows. We can see that the microservice API depends
on the controller we create. The controller depends on the use cases. The use case layer depends on (business) entities. The purpose of the use case layer is to orchestrate operations
on the (business) entities.

Let's have a real-life example of creating an API microservice called _order-service_, which handles orders in an
e-commerce software system. First, we define a REST API controller using Java and Spring Boot:

<div class="sourceCodeWithoutLabel">

```
@RestController
@RequestMapping("/orders")
public class RestOrderController {
  @Autowired
  private OrderService orderService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public final Order createOrder(
    @RequestBody final OrderArg orderArg
  ) {
    return orderService.createOrder(orderArg);
  }
  
  // Other API methods...
}
```
</div>

The API offered by the microservice depends on the controller, as seen in the above diagram. The API is currently a REST API, but
we could create and use a GraphQL controller. Then our API, which depends on the controller, is a GraphQL API.
Below is a partial implementation of a GraphQL controller with Java and Spring Boot:

<div class="sourceCodeWithoutLabel">

```
@Controller
public class GraphQlOrderController {
  @Autowired
  private OrderService orderService;
  
  @MutationMapping
  public final Order createOrder(
    @Argument final OrderArg orderArg
  ) {
    return orderService.createOrder(orderArg);
  }
  
  // Other API methods...
}
```
</div>

The `RestOrderController` and `GraphQlOrderController` classes depend on the `OrderService` interface, which is
part of the use case layer. Notice that the controllers do not rely on a concrete implementation of the use
cases but depend on an interface according to the _dependency inversion principle_. Below is the definition for
the `OrderService` interface:

<div class="sourceCodeWithoutLabel">

```
public interface OrderService {
  Order createOrder(OrderArg orderArg);
  Order getOrderById(Long id);
  Iterable<Order> getOrderByUserAccountId(Long userAccountId);
  void updateOrder(Long id, OrderArg orderArg);
  void deleteOrderById(Long id);
}
```
</div>

The below `OrderServiceImpl` class implements the `OrderService` interface:

<div class="sourceCodeWithoutLabel">

```
@Service
public class OrderServiceImpl implements OrderService {
  private static final String ORDER = "Order";

  @Autowired
  private OrderRepository orderRepository;

  @Override
  public final Order createOrder(
    final OrderArg orderArg
  ) {
    final var order = Order.from(orderArg);
    return orderRepository.save(order);
  }

  @Override
  public final Order getOrderById(final Long id) {
    return orderRepository.findById(id)
             .orElseThrow(() -> 
               new EntityNotFoundError(ORDER, id));
  }
  
  // Rest of the methods...
}
```

</div>

The `OrderServiceImpl` class has a dependency on an order repository. This dependency is also inverted. The `OrderServiceImpl`
class depends only on the `OrderRepository` interface. The order repository is used to orchestrate the persistence of order entities. Note that there is not any direct dependency on a database.

Below is the `OrderRepository` interface:

<div class="sourceCodeWithoutLabel">

```
public interface OrderRepository {
  Order save(Order order);
  Order findById(Long id);
  // ...
}
```
</div>

The `OrderRepository` interface depends only on the `Order` entity class. You can introduce a class called an _interface adapter_ that implements the `OrderRepository` interface. A database interface adapter adapts a particular concrete database to the `OrderRepository` interface. Entity classes do not depend on anything except
other entities to create hierarchical entities. For example, the `Order` entity consists of `OrderItem` entities.

When implementing a clean microservice design, everything is wired together using configuration and dependency injection.
For example, an instance implementing the `OrderRepository` interface is created according to configuration and injected into an `OrderServiceImpl` instance by the Spring framework.
In the case of Spring, the dependency injector is configured using a configuration file and annotations. The configuration file
can be used to configure what database is used. Additionally, the Spring dependency injector creates an instance of the `OrderServiceImpl` class
and injects it where an `OrderService` object is wanted.

![Fig 3.3 Clean Microservice Design for Order Service](images/04-05.png)

The dependency injector is the only place in a microservice that contains references to concrete implementations. In many
frameworks, the dependency injector is not a visible component, but its usage is configured using a configuration file
and annotations. For example, in Spring, the `@Autowired` annotation tells the dependency injector to
inject a concrete implementation into the annotated class field or constructor parameter. The _dependency injection principle_ is
discussed more in a later section of this chapter. The dependency inversion principle and dependency injection principle
usually go hand in hand. Dependency injection is used for wiring interface dependencies so that those become dependencies on concrete implementations, as seen in the figure below.

![Fig 3.4 Dependency Injection](images/03-04.png)

Let's add a feature where the shopping cart is emptied when an order is created:

<div class="sourceCodeWithoutLabel">

```
@Service
public class OrderServiceImpl implements OrderService {
  @Autowired
  private OrderRepository orderRepository;
  
  @Autowired
  private ShoppingCartService shoppingCartService;

  @Override
  public final Order createOrder(
    final OrderArg orderArg
  ) {
    final var order = Order.from(orderArg);
    final var savedOrder = orderRepository.save(order);
    shoppingCartService.emptyCart(order.userAccountId);
    return savedOrder;
  }
}
```

</div>

As you can see from the above code, the `OrderServiceImpl` class is not depending on any concrete implementation of the
shopping cart service. We can create an _interface adapter_ class that is a concrete implementation of the `ShoppingCartService` interface. That interface adapter class connects to a particular external shopping cart service, for example, via REST API. Once again, the dependency injector will inject a concrete `ShoppingCartService` implementation to an instance of the `OrderServiceImpl` class.

Note that the above `createOrder` method is not production quality because it lacks a transaction.

## Uniform Naming Principle

> Use a uniform way to name interfaces, classes, and functions.

This section presents conventions for uniformly naming interfaces, classes, and functions.

### Naming Interfaces and Classes

> Classes represent a thing or an actor. They should be named consistently so that the class name ends with a noun. An interface represents an abstract thing, actor, or capability. Interfaces representing a thing or an actor should be named like classes but using an abstract noun. Interfaces representing a capability should be named according to the capability.

When an interface represents an abstract thing, name it according to that abstract thing. For example, if you have a drawing application with
various geometrical objects, name the geometrical object interface `Shape`. It is a simple abstract noun.
Names should always be the shortest, most descriptive ones. There is no reason to name the geometrical object interface
as `GeometricalObject` or `GeometricalShape`, if we can use simply `Shape`.

When an interface represents an abstract actor, name it according to that abstract actor.
The name of an interface should be derived from the functionality it provides. For example, if there is a `parseConfig`
method in the interface, the interface should be named `ConfigParser`, and if an interface has a `validateObject` method,
the interface should be named `ObjectValidator`. Don't use mismatching name combinations like a `ConfigReader`
interface with a `parseConfig` method or an `ObjectValidator` interface with a `validateData` method.

When an interface represents a capability, name it according to that capability. Capability is something that
a concrete class is capable of doing. For example, a class could be sortable, iterable, comparable, equitable,
etc. Name the respective interfaces according to the capability: `Sortable`, `Iterable`, `Comparable`, and `Equitable`. The name
of an interface representing a capability usually ends with _able_ or _ing_.

Don't name interfaces starting with _I_. Instead, use an _Impl_ postfix for class names to distinguish a class from an interface when needed. You should be programming against
interfaces, and if every interface has its name prefixed with _I_, it just adds unnecessary noise to the code. Use the _I_ prefix only if it is a programming language convention.

Some examples of class names representing a thing are: `Account`, `Order`, `RectangleShape`, and `CircleShape`. In a class
inheritance hierarchy, the names of classes usually refine the interface name or the base class name. For example,
if there is an `InputMessage` interface, then there can be different concrete implementations (= classes) of the `InputMessage`
interface. They can represent an input message from different sources, like `KafkaInputMessage` and `HttpInputMessage`.
And there could be different subclasses for different data formats:  `AvroBinaryKafkaInputMessage` or `JsonHttpInputMessage`.

The interface or base class name should be retained in the class or subclass name. Class names should follow the pattern:
`<class-purpose>` + `<interface-name>` or `<sub-class-purpose>` + `<super-class-name>`, e.g.,
`Kafka` + `InputMessage` = `KafkaInputMessage` and `AvroBinary` + `KafkaInputMessage` = `AvroBinaryKafkaInputMessage`.
Name abstract classes with the prefix `Abstract`.

Don't add a design pattern name to a class name if it does not bring any real benefit. For example, suppose we have
a `DataStore` interface, a `DataStoreImpl` class, and a class that is wrapping
a `DataStore` instance and uses the _proxy pattern_ to add caching functionality to the wrapped data store. We should not name the
caching class `CachingProxyDataStore` or `CachingDataStoreProxy` . The word _proxy_ does not add significant value,
so the class should be named simply `CachingDataStore`.

### Naming Functions

> Functions should do one thing, and the name of a function should describe what the function does. The function name must contain a verb that indicates what the function does. The function name should usually start with a verb, but exceptions exist. If a function returns a value, try to name the function so that the function name describes what it returns.

The general rule is to name a function so that the purpose of the function is clear. A good function name should not
make you think.

Below is an example of an interface containing two methods named with simple verbs only. It is not necessary to name the methods as
`startThread` and `stopThread` because the methods are already part of the `Thread` interface, and it is self-evident what the `start` method
starts and what the `end` method ends.

<div class="sourceCodeWithoutLabel">

```
public interface Thread {
  void start();
  void stop();
}
```

</div>

Let's have another Java example:

<div class="sourceCodeWithoutLabel">

```
grpcChannel.shutdown().awaitTermination(30, TimeUnit.SECONDS);
```
</div>

The above example has two issues with the `shutdown` function. Most people probably assume that calling the `shutdown` function will shut down the channel
and return after the channel is shut down without any return value. But now the `shutdown` function is returning something. It is not necessarily self-evident what it returns. But we can notice that the `shutdown` function does not wait for the channel termination.

It would be better to rename the `shutdown` function as `requestShutdown` because it better describes what the function does. Also, we should
name the `awaitTermination` to `awaitShutdown` because we should not use two different terms _shutdown_ and _termination_
to denote a single thing.

<div class="sourceCodeWithoutLabel">

```
final var shutdownPromise = grpcChannel.requestShutdown();
shutdownPromise.awaitShutdown(30, TimeUnit.SECONDS);
```
</div>

Let's have an example in JavaScript:

<div class="sourceCodeWithoutLabel">

```
fetch(url).then(response => response.json()).then(...);
```

</div>

In the above example, we have the following issue: the `fetch` function does not properly describe what it does.
According to the documentation, it fetches a resource. But it does not return a resource. It returns a response object. Whenever possible, the function name should indicate what the function returns. The `fetch` performs an action on a resource and does not always return a resource.
The action is specified by giving an HTTP verb as a parameter to the function (GET is the default HTTP verb). The most common
actions are `GET`, `POST`, `PUT` and `DELETE`. If you issue a `PUT` request for a REST API, you don't usually get the resource back.
The same is, of course, valid for a `DELETE` request. You cannot get the resource back because it was just deleted.

We could name the function `performActionOnResource,` but that is a pretty long name and does not communicate the return value type.
We should name the `fetch` function
`makeHttpRequest` (or `sendHttpRequest`) to indicate that it is making an HTTP request. The new function name also
communicates that it returns an HTTP response. Another possibility is introducing an actor class with static methods for different HTTP
methods, for example: `HttpClient.makeGetRequest(url)`.

In the above example, the `json` function name is missing a verb. It should contain the verb _parse_
because that is what it is doing. The function name should also tell what it parses: the response body. We should also add a _try_
prefix to indicate that the function can throw (more about the _try_ prefix and error handling in general in the next chapter).
Below is the example with renamed functions:

<div class="sourceCodeWithoutLabel">

```
makeHttpRequest(url).then(response => 
  response.tryParseBodyJson()).then(...);
```

</div>

Many languages offer streams that can be written to, like the standard output stream. Streams are
usually buffered, and the actual writing to the stream does not happen immediately. For example, the below
statement does not necessarily write to the standard output stream immediately. It buffers the text to be written later
when the buffer is flushed to the stream. This can happen when the buffer is full, when some
time has elapsed since the last flush or when the stream is closed.

<div class="sourceCodeWithoutLabel">

```
stdOutStream.write(...);
```
</div>

The above statement is misleading and could be corrected by renaming the function to describe what it actually does:

<div class="sourceCodeWithoutLabel">

```
stdOutStream.writeOnFlush(...);
```

</div>

The above function name immediately tells a developer that writing happens only on flush, and the developer can consult the function documentation to determine when the flushing happens.

You can introduce a convenience method to perform a write with an immediate flush:

<div class="sourceCodeWithoutLabel">

```
// Instead of this:
stdOutStream.writeOnFlush(...);
stdOutStream.flush();

// User can do this:
stdOutStream.writeWithFlush(...);
```

</div>

Many times function's action is associated with a target, for example:

<div class="sourceCodeWithoutLabel">

```
public interface ConfigParser {
  Configuration tryParseConfig(...);
}
```
</div>

When a function's action has a target, it is useful to name the function using the following pattern: `<action-verb>` +
`<action-target>`, for example, `parse` + `config` = `parseConfig`.

We can drop the action target from the function name if the function's first parameter describes the action target. It is not wrong to keep the action target in the function name, though. But if it can be dropped, it usually
makes the function call statements read better. In the below example, the word "config" appears repeated: `tryParseConfig(configJson)`,
which makes the function call statement read a bit clumsy.

<div class="sourceCodeWithoutLabel">

```
final var configuration = configParser.tryParseConfig(configJson);
```
</div>

We can drop the action target from the function name:

<div class="sourceCodeWithoutLabel">

```
public interface ConfigParser {
  Configuration tryParse(final String configJson);
}
```
</div>

As shown below, this change makes the code read better, presuming we use a descriptive variable name. And we should,
of course, always use a descriptive variable name.

<div class="sourceCodeWithoutLabel">

```
final var configuration = configParser.tryParse(configJson);
```
</div>

Here is another example:

<div class="sourceCodeWithoutLabel">

```
public class Vector<T> {
  void pushBack(final T value); // OK
  void pushBackValue(final T value); // Not ideal,
                                     // word "value" repeated
}
```
</div>

Let's imagine we have the following function:

<div class="sourceCodeWithoutLabel">

```
public class KafkaAdminClient {
  void create(final String topic);
}
```
</div>

The above function name should be used only when a topic is the only thing a Kafka admin client can create.
We cannot call the above function in the following way:

<div class="sourceCodeWithoutLabel">

```
kafkaAdminClient.create("xyz");
```
</div>

We need to introduce a properly named variable:

<div class="sourceCodeWithoutLabel">

```
final var topic = "xyz";
kafkaAdminClient.create(topic);
```
</div>

In languages where you can use named function parameters, the following is possible:

<div class="sourceCodeWithoutLabel">

```
// Python
kafkaAdminClient.create(topic = "xyz");

// Swift
kafkaAdminClient.create(topic: "xyz");
```
</div>

#### Preposition in Function Name

> Use a preposition in a function name when needed to clarify the function's purpose.

You don't need to add a preposition to a function name if the preposition can be assumed (i.e., the preposition is implicit).
In many cases, only one preposition can be assumed. If you have a function named `wait`, the preposition `for` can be assumed,
and if you have a function named `subscribe`, the preposition `to` can be assumed. We don't need to use function names `waitFor` and `subscribeTo`.

Suppose a function is named `laugh(person: Person)`. Now we have to add a preposition because none can be assumed.
We should name the function either `laughWith(person: Person)` or `laughAt(person: Person)`.

The following sections present examples of better naming some existing functions in programming languages.

#### Example 1: Renaming JavaScript Array Methods

Adding elements to a JavaScript array is done with the `push` method. Where does it push the elements? The method name
does not say anything. There are three possibilities:

1) At the beginning
2) Somewhere in the middle
3) At the end

Most definitely, it is not the second one, but it still leaves two possibilities. Most people correctly guess that it
pushes elements to the end. To make it 100% clear where the elements are pushed, this function should be named `pushBack`.
Then it does not make anybody think where the elements are pushed. Remember that a good function name does not make you think.

Popping an element from an array is done with the `pop` method. But where does it pop from? If you read the method description,
it tells that the element is popped at the back. To make it 100% clear, this method should be named `popBack`.

The `Array` class also contains methods `shift` and `unshift`. They are like `push` and `pop` but operate at the beginning of
an array. Those method names are extremely non-descriptive and should be named `popFront` and `pushFront`.

There are several methods in the JavaScript `Array` class for finding elements in an array. Here is the list of those methods:

- `find` (finds the first element where the given predicate is true)
- `findIndex` (find the index of the first element where the given predicate is true)
- `includes` (returns true or false based on if the given element is found in the array)
- `indexOf` (returns the first index where the given element is found)
- `lastIndexOf` (returns the last index where the given element is found)

Here are the suggested new names for the above functions:

- `find` ==> `findFirstWhere`
- `findIndex` ==> `findFirstIndexWhere`
- `includes` ==> `include`
- `indexOf` ==> `findFirstIndexOf`
- `lastIndexOf` ==> `findLastIndexOf`

Below are examples of these new function names in use:

<div class="sourceCodeWithoutLabel">

```
const numbers = [1, 2, 3, 4, 5, 5];
const numberIsEven = nbr => (nbr % 2) === 0;
const firstEvenNumber = numbers.findFirstWhere(numberIsEven);
const firstEvenNumberIndex = numbers.findFirstIndexWhere(numberIsEven);
const numbersIncludeFour = numbers.include(4);
const firstIndexOfFive = numbers.findFirstIndexOf(5);
const lastIndexOfFive = numbers.findLastIndexOf(5);
```
</div>

#### Example 2: Renaming C++ Casting Expressions

C++ contains several casting expressions. They are not functions per se, but they act and look a lot like
functions. Below is a list of C++ cast operations for which I am going to present some alternative names:

- `const_cast`
- `reinterpret_cast`
- `static_cast`
- `dynamic_cast`

The first cast, `const_cast`, performs possibly multiple things like adding/removing const-ness and/or volatility. The `const_cast` is often used to add or remove a single `const`.
It would be better to define separate operations for all the different cases: `remove_const`, `add_const`, `add_volatile`,
and `remove_volatile`.

The second cast, `reinterpret_cast`, converts between types by reinterpreting the underlying bit pattern. What it
does is that it forces the cast and could be named `force_cast`.

The third cast, `static_cast`, is a standard cast performed during the compilation phase. A compilation error will be given
if the cast cannot be performed. We could name this cast with an even simpler name: `cast`.

The fourth cast, `dynamic_cast`, does two different things: upcasting and down-casting in the class inheritance hierarchy.
We could name these operations: `try_cast_to_base_class` and `try_cast_to_derived_class`. A cast to a base class is always successful
if the given argument is an object of the derived class. I prefixed the operations with _try_ to tell that they can throw.
Alternative operations `cast_to_base_class` and `cast_to_derived_class` that return optional values could be introduced.

#### Naming Method Pairs

Methods in a class can come in pairs. A typical example is a pair of getter and setter methods. When you define
a method pair in a class, name the methods logically. The methods in a method pair often do two opposite things, like
getting or setting a value. If you are unsure how to name one of the methods, try to find an antonym for a word. For example, if you have a method whose name starts with "create" and
are unsure how to name the method for the opposite action, try a Google search: "create antonym".

Here is a non-comprehensive list of some method names that come in pairs:

- get/set (getters and setters)
  - Name a boolean getter with the same name as the respective field, e.g., `boolean isDone()`
  - Name a boolean setter with `set` + boolean field name, e.g., `void setIsDone(boolean isDone)`
- get/put (especially when accessing a collection)
- read/write
- add/remove
- store/retrieve
- open/close
- load/save
- initialize/destroy
- create/destroy
- insert/delete
- start/stop
- pause/resume
- start/finish
- increase/decrease
- increment/decrement
- construct/destruct
- encrypt/decrypt
- encode/decode
- obtain/relinquish
- acquire/release
- reserve/release
- startup/shutdown
- login/logout
- begin/end
- launch/terminate
- publish/subscribe
- join/detach
- &lt;something&gt;/un&lt;something&gt;, e.g. assign/unassign, install/uninstall, subscribe/unsubscribe, follow/unfollow
- &lt;something&gt;/de&lt;something&gt;, e.g. serialize/deserialize, allocate/deallocate
- &lt;something&gt;/dis&lt;something&gt;, e.g. connect/disconnect

The `apt` tool in Debian/Ubuntu-based Linux has an `install` command to install a package, but the
command for uninstalling a package is `remove`. It should be `uninstall`. The Kubernetes package manager Helm has this correct.
It has an `install` command to install a Helm release and an `uninstall` command to uninstall it.

#### Naming Boolean Functions (Predicates)

> The naming of boolean functions (predicates) should be such that when reading the function call statement, it reads as a boolean statement that can be true or false.

In this section, we consider naming functions that are predicates and return a boolean value. Here I don't mean functions that
return true or false based on the success of the executed action, but cases where the function call is used
to evaluate a statement as true or false. The naming of boolean functions should be such that when
reading the function call statement, it makes a statement that can be true or false. Below are some examples:

<div class="sourceCodeWithoutLabel">

```
public class Response {
  public boolean hasError() { 
    // ...
  }
}

public class String {
  public boolean isEmpty() { 
    //... 
  }
  
  public boolean startsWith(final String anotherString) { 
    //...
  }
  
  public boolean endsWith(final String anotherString) { 
    // ... 
  }
  
  public boolean contains(final String anotherString) {
    // ...
  }
}

// Here we have a statement: response has error? true or false?
if (response.hasError()) { 
  // ...
}

// Here we have a statement: line is empty? true or false?
final String line = fileReader.readLine();
if (line.isEmpty()) {
  // ...  
}

// Here we have statement: line starts with a space character?
// true or false?
if (line.startsWith(" ")) { 
    // ...
}

// Here we have statement: line ends with a semicolon?
// true or false?
if (line.endsWith(";")) { 
    // ...
}

public class Thread {
  public boolean shouldTerminate() {
    // ...
  }

  public boolean isPaused() {
    // ...
  }

  public boolean canResumeExecution() {
    // ...
  }

  public void run() {
    // ...

    // Here we have statement: [this] should terminate?
    // true or false?
    if (shouldTerminate()) { 
      return;
    }

    // Here we have statement: [this] is paused and
    // [this] can resume execution? true or false? 
    if (isPaused() && canResumeExecution()) { 
      // ...
    }
    
    // ...
  }
}
```
</div>

A boolean returning function is correctly named when you call the function in code and can read that function call statement
in plain English. Below is an example of incorrect and correct naming:

<div class="sourceCodeWithoutLabel">

```
public class Thread {
  public boolean stopped() { // Incorrect naming
    // ...
  } 
  
  public boolean isStopped() { // Correct naming
    // ...
  }
}

if (thread.stopped()) { 
  // Here we have: if thread stopped
  // This is not a statement with a true or false answer
  // It is a second conditional form, 
  // asking what would happen if thread stopped.
  // ...
}

// Here we have statement: if thread is stopped
// true or false?
if (thread.isStopped()) { 
  // ...   
}
```
</div>

From the above examples, we can notice that many names of boolean-returning functions start with either
_is_ or _has_ and follows the below pattern:

- is + &lt;adjective&gt;, e.g. isOpen, isRunning or isPaused
- has + &lt;noun&gt;

Also, these two forms can be relatively common:

- should + &lt;verb&gt;
- can + &lt;verb&gt;

But as we saw with the `startsWith`, `endsWith`, and `contains` functions, a boolean returning function name can start
with any verb in third-person singular form (i.e., ending with an _s_). If you have a collection class, its boolean method names
should have a verb in the plural form, for example: `numbers.include(...)` instead of `numbers.includes(...)`. Name your collection variables
always in plural form (e.g., `numbers` instead of `numberList`). We will discuss the uniform naming principles for variables in the next
chapter.

Do not include the _does_ word in a function name, like _doesStartWith_, _doesEndWith_, or _doesContain_.
Adding the _does_ word doesn't add any real value to the name, and such function names are awkward to read when used in code, for example:

<div class="sourceCodeWithoutLabel">

```
final String line = textFileReader.readLine();

// "If line does start with" sound awkward
if (!line.doesStartWith(" ")) { 
  // ...  
}
```
</div>

When you want to use the past tense in a function name, use a _did_ prefix in the function name, for example:

<div class="sourceCodeWithoutLabel">

```
public class DatabaseOperation {
  public void execute() {
    // ...
  }
  
  // Method name not OK. This is a second conditional form
  // if (dbOperation.startedTransaction())...
  public boolean startedTransaction() { 
    // ...
  }

  // Method name OK, no confusion possible
  public boolean didStartTransaction() { 
    // ...
  }
}
```
</div>

#### Naming Builder Methods

A builder class is used to create builder objects that build a new object of a particular type. If you wanted to
construct a URL, a _UrlBuilder_ class could be used for that purpose. Builder class methods add properties to the
built object. For this reason, it is recommended to name builder class methods starting with the verb _add_. The method that
finally builds the wanted object should be named simply _build_ or _build + &lt;build-target&gt;_, for example, _buildUrl_.
I prefer the longer form to remind the reader what is being built.
Below is an example of naming the methods in a builder class:

<div class="sourceCodeWithoutLabel">

```
public class UrlBuilder {
  public UrlBuilder() {
    // ...
  }
  
  public UrlBuilder addScheme(final String scheme) {
   // ...
   return this;
  }
  
  public UrlBuilder addHost(final String host) {
    // ...
    return this;
  }
  
  public UrlBuilder addPort(final int port) {
    // ...
    return this;
  }
  
  public UrlBuilder addPath(final String path) {
    // ...
    return this;
  }
  
  public UrlBuilder addQuery(final String query) {
    // ...
    return this;
  }
  
  public Url buildUrl() {
    // ...
  }
};

final var url = new UrlBuilder()
  .addScheme("https://")
  .addHost("google.com")
  .buildUrl();
```
</div>

#### Naming Methods with Implicit Verbs

Factory method names usually start with the verb _create_. Factory methods can be named so that the _create_ verb is implicit, for example:

<div class="sourceCodeWithoutLabel">

```
Optional.of(final T value)
Optional.empty() // Not optimal, 'empty' can be confused as a verb
Either.withLeft(final L value)
Either.withRight(final R value)
SalesItem.from(final SalesItemArg salesItemArg)
```
</div>

The explicit versions of the above method names would be:

<div class="sourceCodeWithoutLabel">

```
Optional.createOf(final T value)
Optional.createEmpty()
Either.createWithLeft(final L value)
Either.createWithRight(final L value)
SalesItem.createFrom(final SalesItemArg salesItemArg)
```
</div>

Similarly, conversion methods can be named so that the _convert_ verb is implicit. Conversion methods without a verb
usually start with the _to_ preposition, for example:

<div class="sourceCodeWithoutLabel">

```
value.toString();
object.toJson();
```
</div>

The explicitly named versions of the above methods would be:

<div class="sourceCodeWithoutLabel">

```
value.convertToString();
object.convertToJson();
```
</div>

You can access a collection element in some languages using the method `at(index)`.
Here the implicit verb is `get`. I recommend using method names with implicit verbs sparingly and only in circumstances where
the implicit verb is self-evident and does not force a developer to think.

#### Naming Property Getter Functions

Property getter functions are usually named `get` + `<property-name>`.
It is also possible to name a property getter that does not have a respective setter using just the property name. This is acceptable in cases where the property name cannot be confused with a verb.
Below is an example of property getters:

<div class="sourceCodeWithoutLabel">

```
final var list = new MyList();

list.size(); // OK
list.length(); // OK
list.empty(); // NOT OK, empty can be a verb. 
list.isEmpty(); // OK
```
</div>

#### Naming Lifecycle Methods

Lifecycle methods are called on certain occasions only. Lifecycle method names should answer the question:
When or "on what occasion" will this method be called? Examples of good names for lifecycle methods are: `onInit`, `onError`,
`onSuccess`, `afterMount`, `beforeUnmount`. In React, there are lifecycle methods in class components called `componentDidMount`,
`componentDidUpdate` and `componentWillUnmount`. There is no reason to repeat the class name in the lifecycle method names. Better
names would have been: `afterMount`, `afterUpdate`, and `beforeUnmount`.

#### Naming Function Parameters

Naming rules for function parameters are mostly the same as for variables. _Uniform naming principle_ for variables
is described in the next chapter in more detail.

There are some exceptions, like naming object parameters. When a function parameter is an object, the name of the object class can be left out from
the parameter name when the parameter name and the function name implicitly describe the class of the parameter. This exception is acceptable because the function parameter type
can always be easily checked by looking at the function signature.
And this should be easily done with a glance because a function should be short (a maximum of 5-7 statements).
Below is an example of naming object type parameters:

<div class="sourceCodeWithoutLabel">

```
// Word 'Location' repeated, not optimal, but allowed
drive(startLocation: Location, destinationLocation: Location): void

// Better way
// When we think about 'drive' and 'start' or 'destination',
// we can assume that 'start' and 'destination' mean locations
drive(start: Location, destination: Location): void
```
</div>

Some programming languages like Swift allow adding so-called _external names_ to function parameters. Using external names
can make a function call statement read better, as shown below:

<div class="sourceCodeWithoutLabel">

```
func drive(from start: Location, to destination: Location) {
  // ...
}

func send(
  message: String,
  from sender: Person,
  to recipient: Person
) {
  // ...
}


let startLocation = new Location(...);
let destLocation = new Location(...);
drive(from: startLocation, to: destLocation);

let message = "Some message";
let person = new Person(...);
let anotherPerson = new Person(...);
send(message, from: person, to: anotherPerson);
```
</div>

## Encapsulation Principle

> A class should encapsulate its state so that access to the state happens only via public class methods.

Encapsulation is achieved by declaring class fields private. You can create getter and setter methods if you need
the state to be modifiable outside the class. However, encapsulation is best ensured if you don't need to create getter
and setter methods for the class fields. Do not automatically implement getter and setter methods for every class.
Only create those accessor methods if needed, like when the class represents a modifiable data structure.
And only generate setter methods for class fields that need to be modified outside the class.

### Immutable Objects

The best way to ensure the encapsulation of an object's state is to make the object immutable. This means that once the object
is created, its state cannot be modified afterward. Immutability ensures you cannot accidentally or intentionally modify the object's state.
Modifying the object's state outside the object can be a source of bugs.

When creating an immutable object, you give the needed properties for the object in the constructor, and after that, those properties
cannot be modified. An immutable class has fields marked as `final`, `const`, or `readonly` (depending on the programming language), meaning no setter methods can be created for the class.

If you need to modify an immutable object, the only way is to create a new object with different values given to the constructor. The drawback of this approach is that a performance penalty is introduced when
creating new objects as compared to modifying existing objects' properties only. But in many cases, this penalty is negligible
compared to the benefits of immutability. For example, strings are immutable in many languages, like Java and JavaScript. Once you create a string, you cannot modify it. You can only create new strings.

Immutability also requires that getters and other methods returning a value may not return a modifiable class field, like an array.
If you returned such an array from a method, that array could be modified by adding or removing elements without
the "owning" object being aware of that.

### Don't Leak Modifiable Internal State Outside an Object Principle

Beware when you return values from your class methods. It is possible that a method accidentally returns some internal
state of the object that can be modified later by the method caller. Returning modifiable state from a class method breaks the encapsulation. Static code
analyzers for some languages, like Java, can warn you about situations where internal state leaks outside the object.

You can safely return primitive or so-called value types from class methods. Those types include types like
Java boolean, int, and long. You can also safely return an immutable object, like a Java string. But
you cannot safely return a mutable collection, for example.

There are two ways how to protect against leaking internal state outside an object:

1) Return a copy of the modifiable internal state
2) Return an unmodifiable version of the modifiable internal state

Regarding the first approach, when a copy is returned, the caller can use it as they like.
Changes made to the copied object don't affect the original object. I am primarily talking about making a shallow copy.
In many cases, a shallow copy is enough. For example, a list of primitive values, immutable strings, or immutable objects does
not require a deep copy of the list. But you should make a deep copy when needed.

The copying approach can cause a performance penalty, but in many cases, that penalty is insignificant.
In JavaScript, you can easily create a copy of an array:

<div class="sourceCodeWithoutLabel">

```
const values = [1, 2, 3, 4, 5];
const copyOfValues = [...values];
``` 
</div>

The second approach requires you to create an unmodifiable version of a modifiable object and return
that unmodifiable object. Some languages offer an easy way to create unmodifiable versions of certain objects.
In Java, you can create an unmodifiable version of a `List`, `Map`, or `Set` using `Collections.unmodifiableList`,
`Collections.unmodifiableMap`, or `Collections.unmodifiableSet` factory method, respectively.

You can also create an unmodifiable version of a class by yourself. Below is an example in Java:

<div class="sourceCodeWithoutLabel">

```
public interface MyList<T> {
  void addToEnd(T item);
  Optional<T> getItem(int index);
}

public class UnmodifiableMyList<T> implements MyList<T> {
  private final MyList<T> list;
  
  public UnmodifiableMyList(final MyList<T> list) {
    this.list = list;
  }
  
  public void addToEnd(final T item) {
    throw new UnsupportedOperationException(...);
  }

  public Optional<T> getItem(final int index) {
    return list.getItem(index);
  }
}
```
</div>

In the above example, the unmodifiable list class takes another list (a modifiable list) as a constructor argument. It
only implements the `MyList` interface methods that don't attempt to modify the wrapped list. In this case, it implements only the
`getItem` method that delegates to the respective method in the `MyList` class. The `UnmodifiableMyList` class methods that attempt to modify
the wrapped list should throw an error. The `UnmodifiableMyList` class utilizes the _proxy pattern_ by wrapping an object of the `MyList` class
and partially allowing access to the `MyList` class methods.

In C++, you can return an unmodifiable version by declaring the return type as _const_, for example:

<div class="sourceCodeWithoutLabel">

```
std::shared_ptr<const std::vector<std::string>>
getStringValues() const;
```
</div>

Now callers of the `getStringValues` method cannot modify the returned vector of strings because it is declared
const.

Unmodifiable and immutable objects are slightly different. No one can modify an immutable object, but when you return an
unmodifiable object from a class method, that object can still be modified by the owning class, and modifications are visible to
everyone that has received an unmodifiable version of the object. If this is something undesirable, you should use
a copy instead.

### Don't Assign From a Method Parameter to a Modifiable Field

If a class receives modifiable objects as constructor or method arguments, it is typically best practice not to
assign those arguments to the internal state directly. If they are assigned directly, the class can,
on purpose or accidentally modify those argument objects, which is probably not what the constructor or method caller
expects.

There are two ways to handle this situation:

1) Store a copy of the modifiable argument object to the class's internal state
2) Store an unmodifiable version of the modifiable argument object to the class's internal state

Below is an example of the second approach:

<div class="sourceCodeWithoutLabel">

```
public class MyClass {
  private final List<Integer> values;
  
  public MyClass(final List<Integer> values) {
    this.values = Collections.unmodifiableList(values);
  }
}
```
</div>

### Real-life Example of Encapsulation Violation: React Class Component's State

React class component's state is not properly encapsulated. React documentation instructs that the `state` property should be modified directly using `this.state` in a `Component` subclass constructor. For example:

<div class="sourceCodeWithoutLabel">

```
import { Component } from 'react';

class ButtonClickCounter extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      clickCount: 0
    };
  }
}
```
</div>

It is not good object-oriented design that the `state` property is public or protected in the `Component` class.
You should not modify the base class's `state` property in the `ButtonClickCounter` subclass.
The proper way to initialize the state in an object-oriented manner would be to give the initial state as a parameter to the `Component` class constructor using `super`.
However, the following is not supported by React:

<div class="sourceCodeWithoutLabel">

```
import { Component } from 'react';

export default class ButtonClickCounter extends Component {
  constructor(props) {
    // This is not possible in real life
    super(props, {
      clickCount: 0
    });
  }
}
```
</div>

Setting the state is done with the `setState` method defined in the `Component` class, but accessing the state happens
directly through the `state` property. This leads to a problem where you cannot use `this.state` when calling the `setState`
method because that can lead to erroneous behavior, according to the React documentation. So the following is not allowed:

<div class="sourceCodeWithoutLabel">

```
incrementClickCount = () =>
  this.setState({
    clickCount: this.state.clickCount + 1
  });
```

</div>

Below is an example of using the `setState` method correctly in a React class component:

<div class="sourceCodeWithoutLabel">

```
import { Component } from 'react';

export default class ButtonClickCounter extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      clickCount: 0
    };
  }
  
  incrementClickCount = () =>
    this.setState(({ clickCount }) => ({
      clickCount: clickCount + 1
    }));

  render() {
    return (
      <>
        Click count: {this.state.clickCount}
        <button onClick={this.incrementClickCount} />
      </>
    );
  }
}
```
</div>

Accessing the state in the `Component` subclasses should be done using a getter `getState`, not directly accessing
the `state` property. Below is the above example modified to use the _imaginary_ `getState` method:

<div class="sourceCodeWithoutLabel">

```
import { Component, Fragment } from 'react';

export default class ButtonClickCounter extends Component {
  constructor(props) {
    super(props, {
      clickCount: 0
    });
  }
   
  incrementClickCount = () =>
    this.setState({
      clickCount: this.getState().clickCount + 1
    });
  
  render() {
    return (
      <>
        Click count: {this.getState().clickCount}
        <button onClick={this.incrementClickCount} />
      </>
    );
  }
}
```
</div>

## Object Composition Principle

> In object-oriented design, like in real life, objects are constructed by constructing larger objects from smaller objects.
> This is called object composition. Prefer object composition over inheritance.

For example, a car object can be composed of an engine and transmission object (to name a few).
Objects are rarely "composed" by deriving from another object, i.e., using inheritance. But first, let's try to specify
classes that implement the below `Car` interface using inheritance:

<div class="sourceCodeWithoutLabel">

```
public interface Car {
  void drive(
    Location start,
    Location destination
 );
}

public class CombustionEngineCar implements Car {
  public void drive(
    final Location start,
    final Location destination
  ) {
    // ...
  }
}

public class ElectricEngineCar implements Car {
  public void drive(
    final Location start,
    final Location destination
  ) {
    // ...
  }
}

public class ManualTransmissionCombustionEngineCar 
         extends CombustionEngineCar {
  public void drive(
    final Location start,
    final Location destination
  ) {
    // ...
  }
}

public class AutomaticTransmissionCombustionEngineCar
         extends CombustionEngineCar {
  public void drive(
    final Location start,
    final Location destination
  ) {
    // ...
  }
}
```
</div>

If we wanted to add other components to a car, like a two or four-wheel drive, the number of classes
needed would increase by three. If we wanted to add a design property (sedan, hatchback, wagon, or SUV) to a car,
the number of needed classes would explode, and the class names would become ridiculously long. We can notice that inheritance is not the correct way to build more
complex classes.

Class inheritance creates an _is-a_ relationship between a superclass and its subclasses. Object composition creates a _has-a_ relationship. We can claim that `ManualTransmissionCombustionEngineCar` _is a_ kind of `CombustionEngineCar`, so basically, we
are not doing anything wrong here, one might think. But when designing classes, you should first determine if object composition
could be used: is there a _has-a_ relationship? Can you declare a class as a property of another class?
If the answer is yes, then composition should be used instead of inheritance.

All the above things related to a car are actually properties of a car. A car _has an_ engine.
A car _has a_ transmission. It _has a_ two or four-wheel drive and design. We can turn the inheritance-based solution into a composition-based solution:

<div class="sourceCodeWithoutLabel">

```
public interface Drivable {
  void drive(
    Location start, 
    Location destination
  );
}

public interface Engine {
  // Methods like start, stop ...
}

public class CombustionEngine implements Engine {
  // Methods like start, stop ...
}

public class ElectricEngine implements Engine {
  // Methods like start, stop ...
}

public interface Transmission {
  // Methods like changeGear ...
}

public class AutomaticTransmission implements Transmission {
  // Methods like changeGear ...
}

public class ManualTransmission implements Transmission {
  // Methods like changeGear ...
}

// Define DriveType here...
// Define Design here...

public class Car implements Drivable {
  private final Engine engine;
  private final Transmission transmission;
  private final DriveType driveType;
  private final Design design;
  
  public Car(
    final Engine engine,
    final Transmission transmission,
    final DriveType driveType,
    final Design design
  ) {
    this.engine = engine;
    this.transmission = transmission;
    this.driveType = driveType;
    this.design = design;
  }
    
  public void drive(
    final Location start,
    final Location destination
  ) {
    // To implement functionality, delegate to 
    // component classes, for example:
    
    // engine.start();
    // transmission.shiftGear(...);
    // ...
    // engine.stop();
  }
}
```
</div>

Let's have a more realistic example with different chart types in TypeScript. At first, this sounds
like a case where inheritance could be used: We have some abstract base charts that different concrete charts extend, for example:

<div class="sourceCodeWithoutLabel">

```
interface Chart {
  renderView(): JSX.Element;
  updateData(...): void;
}

abstract class AbstractChart implements Chart {
  abstract renderView(): JSX.Element;
  abstract updateData(...): void;

  // Implement some common functionality
  // shared by all chart types
}

abstract class XAxisChart extends AbstractChart {
  abstract renderView(): JSX.Element;
    
  updateData(...): void {
    // This is common for all x-axis charts,
    // like ColumnChart, LineChart and AreaChart
  }
}

class ColumnChart extends XAxisChart {
  renderView(): JSX.Element {
    // ...

    return (
      <XYZChart 
        type="column"
        data={data}
        options={options}... 
      />;
    );
  }
}

// LineChart class definition here...
// AreaChart class definition here...

abstract class NonAxisChart extends AbstractChart {
  abstract renderView(): JSX.Element;
  
  updateData(...): void {
    // This is common for all non-x-axis charts,
    // like PieChart and DonutChart
  }
}

class PieChart extends NonAxisChart {
  renderView(): JSX.Element {
    // ...

    return (
      <XYZChart
        type="pie"
        data={data}
        options={options}...
      />;
    );
  }
}

class DonutChart extends PieChart {
  renderView(): JSX.Element {
    // ...

    return (
      <XYZChart
        type="donut"
        data={data}
        options={options}...
      />;
    );
  }
}
```
</div>

The above class hierarchy looks manageable: there should not be too many subclasses that need to be defined. We can, of course, think of new chart types, like a geographical map or data table
for which we could add subclasses. One problem with a deep class hierarchy arises when you need to change or
correct something related to a particular chart type. Let's say you want to change or correct some behavior
related to a pie chart. You will first check the `PieChart` class if the behavior is defined there. If
you can't find what you are looking for, you need to navigate to the base class of the `PieChart` class (`NonAxisChart`) and look there. And
you might need to continue this navigation until you reach the base class where the behavior you want to
change or correct is located. Of course, if you are incredibly familiar with the codebase, you might be able to locate the
correct subclass on the first try. But in general, this is not a straightforward task.

Using class inheritance can
introduce class hierarchies where some classes have significantly more methods than other classes.
For example, in the chart inheritance chain, the `AbstractChart` class probably has significantly more methods than
classes at the end of the inheritance chain. This class size difference creates an imbalance between classes making it hard to reason about
what functionality each class provides.

Even if the above class hierarchy might look okay at first sight, currently, there lies one problem. We have
hardcoded what kind of chart view we are rendering. We are using the _XYZ_ chart library and rendering `XYZChart`
views. Let's say we would like to introduce another chart library called _ABC_. We want to use both chart libraries
in parallel so that the open-source version of our data visualization application uses the _XYZ_ chart library, which is open
source. The paid version of our application uses the commercial _ABC_ chart library. When using class inheritance,
we must create new classes for each concrete chart type for the _ABC_ chart library.
So, we would have two classes for each concrete chart type, like here for the pie chart:

<div class="sourceCodeWithoutLabel">

```
class XYZPieChart extends XyzNonAxisChart {
  renderView(): JSX.Element {
    // ...

    return (
      <XYZChart
        type="pie"
        data={data}
        options={options}...
      />;
    );
  }
}

class ABCPieChart extends AbcNonAxisChart {
  renderView(): JSX.Element {
    // ...

    return (
      <ABCPieChart
        dataSeries={dataSeries}
        chartOptions={chartOptions}...
      />;
    );
  }
}
```
</div>

Implementing the above functionality using composition instead of inheritance has several benefits:

- It is more apparent what behavior each class contains
- There is no significant size imbalance between classes, where some classes are huge and others relatively small
- You can split chart behaviors into classes as you find fit, and is in accordance with the _single responsibility principle_

In the below example, we have split some chart behavior into two types of classes: chart view renderers and chart data factories:

<div class="sourceCodeWithoutLabel">

```
interface Chart {
  renderView(): JSX.Element;
  updateData(...): void;
}

interface ChartViewRenderer {
  renderView(data: ChartData, options: ChartOptions): JSX.Element;
}

interface ChartDataFactory {
  createData(...): ChartData
}

// ChartData...
// ChartOptions...

class ChartImpl implements Chart {
  private data: ChartData;
  private options: ChartOptions;

  constructor(
    private readonly viewRenderer: ChartViewRenderer,
    private readonly dataFactory: ChartDataFactory
  ) {
    // ...
  }
  
  renderView(): JSX.Element {
    return this.viewRenderer.renderView(this.data, this.options);
  }
  
  updateData(...): void {
    this.data = this.dataFactory.createData(...);
  }
}

class XYZPieChartViewRenderer implements ChartViewRenderer {
  renderView(data: ChartData, options: ChartOptions): JSX.Element {
    // ...

    return (
      <XYZPieChart
        data={dataInXyzChartLibFormat}
        options={optionsInXyzChartLibFormat}...
      />;
    );
  }
}

class ABCPieChartViewRenderer implements ChartViewRenderer {
   renderView(data: ChartData, options: ChartOptions): JSX.Element {
     // ...
    
     return (
       <ABCPieChart
         dataSeries={dataInAbcChartLibFormat}
         chartOptions={optionsInAbcChartLibFormat}...
       />;
     );
   }
}

// ABCColumnChartViewRenderer...
// XYZColumnChartViewRenderer...

type ChartType = 'column' | 'pie';

interface ChartFactory {
  createChart(chartType: ChartType): Chart;
}

class ABCChartFactory implements ChartFactory {
  createChart(chartType: ChartType): Chart {
    switch(chartType) {
      case 'column':
        return new ChartImpl(new ABCColumnChartViewRenderer(),
                             new XAxisChartDataFactory());
      case 'pie':
        return new ChartImpl(new ABCPieChartViewRenderer(),
                             new NonAxisChartDataFactory());
      
      default:
        throw new Error('Invalid chart type');
    }
  }
}

class XYZChartFactory implements ChartFactory {
  createChart(chartType: ChartType): Chart {
    switch(chartType) {
      case 'column':
        return new ChartImpl(new XYZColumnChartViewRenderer(),
                             new XAxisChartDataFactory());
      case 'pie':
        return new ChartImpl(new XYZPieChartViewRenderer(),
                             new NonAxisChartDataFactory());

      default:
        throw new Error('Invalid chart type');
    }
  }
}
```
</div>

The `XYZPieChartViewRenderer` and `ABCPieChartViewRenderer` classes use the _adapter pattern_ as they convert
the supplied data and options to an implementation (ABC or XYZ chart library) specific interface.

We can easily add more functionality by composing the `ChartImpl` class of more classes. There could be, for example, a title
formatter, tooltip formatter class, y/x-axis label formatter, and event handler classes.

<div class="sourceCodeWithoutLabel">

```
class ChartImpl implements Chart {
  private data: ChartData;
  private options: ChartOptions;

  constructor(
    private readonly viewRenderer: ChartViewRenderer,
    private readonly dataFactory: ChartDataFactory,
    private readonly titleFormatter: ChartTitleFormatter,
    private readonly tooltipFormatter: ChartTooltipFormatter,
    private readonly xAxisLabelFormatter: ChartXAxisLabelFormatter,
    private readonly eventHandler: ChartEventHandler
  ) {
    // ...
  }
  
  renderView(): JSX.Element {
    return this.viewRenderer.renderView(this.data, this.options);
  }
  
  updateData(...): void {
    this.data = this.dataFactory.createData(...);
  }
}

class ABCChartFactory implements ChartFactory {
  createChart(chartType: ChartType): Chart {
    switch(chartType) {
      case 'column':
        return new ChartImpl(new ABCColumnChartViewRenderer(),
                             new XAxisChartDataFactory(),
                             new ChartTitleFormatterImpl(),
                             new XAxisChartTooltipFormatter(),
                             new ChartXAxisLabelFormatterImpl(),
                             new ColumnChartEventHandler());
                             
     case 'pie':
       return new ChartImpl(new ABCColumnChartViewRenderer(),
                            new NonAxisChartDataFactory(),
                            new ChartTitleFormatterImpl(),
                            new NonAxisChartTooltipFormatter(),
                            new NullXAxisLabelFormatter(),
                            new NonAxisChartEventHandler());

      default:
        throw new Error('Invalid chart type');
    }
  }
}
```
</div>

## Domain-Driven Design Principle

> Domain-driven design (DDD) is a software design approach where software is modeled to match the language of the problem domain
> that the software tries to solve. DDD is hierarchical. The top-level domain can be divided into subdomains which can be
> further divided into subdomains.

DDD means that the structure of software, and the names appearing in the code (interface, class, function, and variable names)
should match the domain. For example, in a banking software system, names like _Account_, _withdraw_, _deposit_,
_makePayment_ and _LoanApplication_ should be used. The top-level domain of a software system should be divided into smaller subdomains.
And each subdomain should be implemented as a separate application or software component.
For example, a development team can be dedicated to the loan applications subdomain and another team to payments.
Developers in a team need to know about their team's subdomain. And when interfacing with other domains, they need to
know enough about the other domains to understand the interfaces. In this way, a single team will have a smaller set of
concepts to comprehend and remember. Product managers and the chief architect should have a good grasp of the top-level
domain, i.e., they should understand _the big picture_.

### Domain-Driven Design Example: Data Exporter Microservice

Let's have a DDD example with a microservice for exporting data. Data exporting will be our top-level
domain. The development team should participate in the DDD and
object-oriented design (OOD) process. It is very likely that an expert-level software developer,
e.g., the team tech lead, could do the DDD and OOD alone, but it is not how it should be done. Other team members,
especially the junior ones, should be involved to learn and develop their skills further.

The DDD process is started by first defining the big picture (top-level domain) based on requirements from the product management and the architecture team:

> Data exporter handles data that consists of messages that contain multiple fields. Data exporting should happen from 
> an input system to an output system. During the export, various transformations to the data can be made, and 
> the data formats in the input and output systems can differ.

We can specify four subdomains for the data exporter microservice
based on the requirements above:

- Consume messages from the input system and decode them into an internal message
- Internal message
- Transform internal messages
- Encode transformed messages to a wanted format and produce them to the output system

We can name the subdomains as shown in the below picture:

![Figure 3.4 Data Exporter Subdomains](images/04-01.png)

When considering the _Input_ domain in more detail, we can figure out that it consists of the following subdomains,
interfaces and classes:

- Input message
    - Contains the message consumed from the input data source
    - `InputMessage` is an interface that can have several concrete implementations, like `KafkaInputMessage` representing
      an input message consumed from a Kafka data source
- Input message consumer
    - Consumes messages from the input data source and creates `InputMessage` instances
    - `InputMessageConsumer` is an interface that can have several concrete implementations, like `KafkaInputMessageConsumer`
      for consuming messages from a Kafka data source
- Input Message decoder
    - Decodes input messages into internal messages
    - `InputMessageDecoder` is an interface that can have several concrete implementations, like `AvroBinaryInputMessageDecoder`,
      which decodes input messages encoded in Avro binary format
- Input configuration
    - Input configuration reader
        - Reads the domain's configuration
        - `InputConfigReader` is an interface that can have several concrete implementations, like
          `LocalFileSystemInputConfigReader` or `HttpRemoteInputConfigReader`
    - Input configuration parser
        - Parses the read configuration to produce an `InputConfig`
        - `InputConfigParser` is an interface that can have several concrete implementations, like `JsonInputConfigParser`
          or `YamlInputConfigParser`
    - `InputConfig` instance contains parsed configuration for the domain, like the input data source type, host, port, and input data format.

![Figure 3.5 Input Subdomain](images/04-02.png)

When considering the _Internal Message_ domain in more detail, we can figure out that it consists of the following
interfaces and classes:

- Internal Message
  - Internal message consists of one or more internal message fields
  - `InternalMessage` is an interface for a class that provides an internal representation of an input message
- Internal Message Field
  - `InternalMessageField` is an interface for classes representing a single field of an internal message

![Figure 3.6 Internal Message Subdomain](images/04-08.png)

When considering the _Transformer_ domain in more detail, we can figure out that it consists of the following
subdomains, interfaces, and classes:

- Field transformer
    - `FieldTransformers` is a collection of `FieldTransformer` objects
    -  A Field transformer transforms the value of an input message field into a value of an output message field
    - `FieldTransformer` is an interface that can have several concrete implementations, like
      `FilterFieldTransformer`, `CopyFieldTransformer`, `TypeConversionFieldTransformer` and `ExpressionTransformer`
- Message Transformer
    - `MessageTransformer` takes an internal message and transforms it using field transformers
- Transformer configuration
    - Transformer configuration reader
        - Reads the domain's configuration
        - `TransformerConfigReader` is an interface that can have several concrete implementations,
          like `LocalFileSystemTransformerConfigReader`
    - Transformer configuration parser
        - Parses read configuration to produce a `TransformerConfig`
        - `TransformerConfigParser` is an interface that can have several concrete implementations,
          like `JsonTransformerConfigParser`
    - `TransformerConfig` instance contains parsed configuration for the _Transformer_ domain

![Figure 3.7 Transformer Subdomain](images/04-03.png)

When considering the _Output_ domain in more detail, we can figure out that it consists of the following subdomains,
interfaces and classes:

- Output Message encoder
    - Encodes transformed message to an output message with a specific data format
    - `OutputMessageEncoder` is an interface that can have several concrete implementations, like `CsvOutputMessageEncoder`,
      `JsonOutputMessageEncoder`, `AvroBinaryOutputMessageEncoder`
- Output message
    - `OutputMessage` is an interface for container objects to hold output messages as a byte sequence
- Output message producer
    - Produces output messages to the output destination
    - `OutputMessageProducer` is an interface that can have several concrete implementations, like `KafkaMessageProducer`
- Output configuration
    - Output configuration reader
        - Reads the domain's configuration
        - `OutputConfigReader` is an interface that can have several concrete implementations,
          like `LocalFileSystemOutputConfigReader`
    - Output configuration parser
        - Parse the read configuration to an `OutputConfig`
        - `OutputConfigParser` is an interface that can have several concrete implementations, like `JsonOutputConfigParser`
    - `OutputConfig` instance contains parsed configuration for the domain, like output destination type, host, port, and the output data format

![Figure 3.8 Output Subdomain](images/04-04.png)

If you combine the above design diagrams, they form a data processing pipeline that can be implemented in the following way:

<div class="sourceCodeWithoutLabel">

```
void DataExporterApp::run() 
{
  while(m_isRunning)
  {
    const auto inputMessage =
      m_inputMessageConsumer.consumeInputMessage();
      
    const auto internalMessage =
      m_inputMessageDecoder.decodeToInternalMessage(inputMessage);
      
    const auto transformedMessage = 
      m_messageTransformer.transform(*internalMessage);
      
    const auto outputMessage = 
      m_outputMessageEncoder.encode(transformedMessage);
      
    m_outputMessageProducer.produce(outputMessage);
  }
}
```

</div>

And the `MessageTransformer::transform` method can be implemented in the following way:

<div class="sourceCodeWithoutLabel">

```
std::unique_ptr<InternalMessage> MessageTrasformer::transform(
  const InternalMessage& internalMessage
) 
{
  const auto transformedMessage =
    std::make_unique<InternalMessageImpl>();
  
  std::ranges::for_each(m_fieldTransformers,
                        [&internalMessage, &transformedMessage]
                        (const auto& fieldTransformer) {
    fieldTransformer.transform(internalMessage,
                               transformedMessage);
  }); 
    
  return transformedMessage;
}
```

</div>

### Domain-Driven Design Example: Anomaly Detection Microservice

Let's have another DDD example with an anomaly detection microservice. The purpose of the microservice is to detect anomalies
in measurement data. This concise description of the microservice's purpose reveals the two subdomains of the microservice:

- Anomaly
- Measurement

Let's first analyze the _Measurement_ subdomain in more detail. We can identify the following subdomains for it:

- Measurement configuration
    - Loads and parses the following configuration
        - Measurement data sources
        - Measurements
- Measurement query
    - Represents a query for fetching measurement data
- Measurement data source
    - Represents a data source against which measurement queries can be executed
- Measurement data
    - Represents a result of an executed measurement query
    - Measurement data scaler
        - Scales the measurement data using a particular technique
- Measurement
    - Represents a measurement (contains properties like name, measurement query, etc.)

The _Anomaly_ subdomain contains the following subdomains:

- Anomaly detection
    - Anomaly detection configuration
        - Loads and parses anomaly detection rules
    - Anomaly detection rule
        - Specifies how anomalies should be detected for a measurement
    - Anomaly detector
        - Detects anomalies in a measurement according to the anomaly detection rule using a trained anomaly model
    - Anomaly detection engine
        - A thread for detecting anomalies for the given anomaly detection configuration
- Anomaly model
    - Trained anomaly model
    - Anomaly model trainer
        - Trains an anomaly model using a specific AI technique, like self-organizing maps
    - Anomaly model training engine
        - A thread for training an anomaly model
- Anomaly indicator
    - Anomaly indicator representation
    - Anomaly indicator serializer
        - Serializes an anomaly indicator representation
        - Different serializers can be implemented, like JSON
    - Anomaly indicator publisher
        - Publishes a serialized anomaly indicator
        - Different publishers can be implemented, like Kafka or REST API

The two domains, anomaly and measurement, can be developed in parallel. The anomaly domain interfaces with the measurement domain
to fetch data for a particular measurement from a particular data source. The development effort of both the
anomaly and measurement domains can be further split to achieve even more development parallelization. For example,
one developer could work with anomaly detection, another with anomaly model training, and the third with anomaly indicators.

## Design Patterns

The following sections present 25 design patterns, most of which are made famous by the _Gang of Four_ and their book _Design Patterns_.
Design patterns are divided into creational, structural, and behavioral patterns.

### Design Patterns for Creating Objects

This section describes design patterns for creating objects. The following design patterns will be presented:

- Factory pattern
- Abstract factory pattern
- Factory method pattern
- Builder pattern
- Singleton pattern
- Prototype pattern
- Object pool pattern

#### Factory Pattern

> Factory pattern allows deferring what kind of object will be created to the point of calling the _create_
> method of the factory.

A factory typically consists of precisely one or several methods for creating objects of a particular type.

Below is an example `ConfigParserFactory` that has a single `create` method for creating different kinds of
`ConfigParser` objects. In the case of a single create method, the method usually contains a switch-case statement or
an if/else-if structure. Factories are the only place where extensive switch-case statements or if/else-if structures
are allowed in object-oriented programming. If you have a lengthy switch-case statement or long if/else-if structure somewhere
else in code, that is typically a sign of a non-object-oriented design.

<div class="sourceCodeWithoutLabel">

```
public interface ConfigParser {
  // ...
}

public class JsonConfigParser implements ConfigParser {
  // ...
}

public class YamlConfigParser implements ConfigParser {
  // ...
}

public enum ConfigFormat {
  JSON,
  YAML
}

public final class ConfigParserFactory {
  public static ConfigParser createConfigParser(
    final ConfigFormat configFormat
  ) {
    return switch(configFormat) {
      case JSON -> new JsonConfigParser();
      case YAML -> new YamlConfigParser();
      default -> 
        throw new IllegalArgumentException(
          "Unsupported config format"
        );
    };
  }
}
```
</div>

Below is an example of a factory with multiple _create_ methods:

<div class="sourceCodeWithoutLabel">

```
public final class ShapeFactory {
  public static Shape createCircleShape(final int radius) {
    return new CircleShape(radius);
  }
  
  public static Shape createRectangleShape(
    final int width,
    final int height
  ) {
    return new RectangleShape(width, height);
  }
  
  public static Shape createSquareShape(final int sideLength) {
    return new SquareShape(sideLength);
  }
}
```
</div>

#### Abstract Factory Pattern

> In the abstract factory pattern, there is an abstract factor (= factory interface) and one or more concrete factories (factory classes that implement the factory interface).

The abstract factory pattern is an extension of the earlier described _factory pattern_. Usually, the abstract factory pattern should be
used instead of the plain factory pattern. Below is an example of an abstract `ConfigParserFactory` with one concrete implementation:

<div class="sourceCodeWithoutLabel">

```
public interface ConfigParserFactory {
  ConfigParser createConfigParser(ConfigFormat configFormat);
}

public class ConfigParserFactoryImpl implements 
               ConfigParserFactory {
   public final ConfigParser createConfigParser(
     final ConfigFormat configFormat
   ) {
     return switch(configFormat) {
       case JSON -> new JsonConfigParser();
       case YAML -> new YamlConfigParser();
       default ->
         throw new IllegalArgumentException(
           "Unsupported config format"
         );
    };
  }
}
```
</div>

You should follow the _program against interfaces principle_ and use the abstract `ConfigParserFactory` in your code instead of
a concrete factory. Then using the _dependency injection principle_, you can inject the wanted factory
implementation, like `ConfigParserFactoryImpl`.

When unit testing code, you should create mock objects instead of real ones with a
factory. The abstract factory pattern comes to your help because you can inject a mock instance of the `ConfigParserFactory`
in the tested code. Then you can expect the mocked `createConfigParser` method to be called and return a mock instance
of the `ConfigParser` interface. And then, you can expect the `parse` method to be called on the `ConfigParser` mock and return
a mocked configuration. Below is an example unit test that uses JUnit5 and JMockit library. We test the `initialize` method in an `Application` class containing a `ConfigParserFactory` field. The `Application` class uses the `ConfigParserFactory` instance to create a `ConfigParser` to parse the application configuration. In the below test, we
inject a `ConfigParserFactory` mock to an `Application` instance using the `@Injectable` annotation
from JMockit. Unit testing and mocking are better described later in the _testing principles_ chapter.

<div class="sourceCodeWithoutLabel">

```
public class Application {
  private ConfigParserFactory configParserFactory;
  private Config config;

  public Application(final ConfigParserFactory configParserFactory) {
    this.configParserFactory = configParserFactory;
  }

  public void initialize() {
    // ...

    final var configParser = configParserFactory.createConfigParser(...);
    config = configParser.parse(...);

    // ...
  }

  public Config getConfig() {
    return config;
  }
}

public class ApplicationTests {
  @Tested
  Application application;
  
  @Injectable
  ConfigParserFactory configParserFactoryMock;
  
  @Mocked
  ConfigParser configParserMock;
  
  @Mocked
  Config configMock;
  
  @Test
  public void testInitialize() {
    // GIVEN
    new Expectations() {{
      configParserFactoryMock.createConfigParser(...);
      result = configParserMock;
      configParserMock.parse(...);
      result = configMock;
    }};
  
    // WHEN
    application.initialize();

    // THEN
    assertEquals(application.getConfig(), configMock);
  }
}
```
</div>

#### Factory Method Pattern

> In the factory method pattern, objects are created using one or more static factory methods in a class, and the class constructor is made private.

If you want to validate parameters in a constructor,
the constructor may throw. You cannot return an error value from a constructor unless you use an _out_ parameter, but that pattern is generally discouraged. Creating constructors that cannot throw is recommended because it is relatively easy
to forget to catch errors thrown from a constructor if nothing in the constructor signature tells it can throw.
Java is an exception to this rule when you throw a checked exception from a constructor. It is impossible to forget to handle checked
exceptions. See the next chapter for a discussion about the _error/exception handling principle_.

Below is an example of a constructor that can throw:

<div class="sourceCodeWithoutLabel">

```
class Url {
  constructor(
    scheme: string,
    port: number,
    host: string,
    path: string,
    query: string
  ) {
    // Validate the arguments and throw if invalid
  }
}
```
</div>

You can use the factory method pattern to overcome the problem of throwing an error from a constructor.
You can make a factory method to return an optional value (if you don't need to return an error cause) or
make the factory method throw. We can add a _try_ prefix to the factory method name
to signify that it can throw. Then, the function signature (function name) communicates to readers
that the function can throw.

Below is an example class with two factory methods and a private constructor:

_Url.ts_
```
class Url {
  private constructor(
    scheme: string,
    port: number,
    host: string,
    path: string,
    query: string
  ) {
    // ...
  }
  
  static createUrl(
    scheme: string,
    port: number,
    host: string,
    path: string,
    query: string
 ): Url | null {
    // Validate the arguments and return 'null' if invalid
  }
  
  static tryCreateUrl(
    scheme: string,
    port: number,
    host: string,
    path: string,
    query: string
  ): Url {
    // Validate the arguments and throw if invalid
  }
}
```

Returning an optional value from a factory method allows utilizing functional programming techniques. Here is an
example in Java:

<div class="sourceCodeWithoutLabel">

```
public class Url {
  private Url(
    final String scheme,
    final String host,
    final int port,
    final String path,
    final String query
  ) {
    // ...
  }
  
  public static Optional<Url> createUrl(
    final String scheme,
    final String host,
    final int port,
    final String path,
    final String query
  ) {
    // ...
  }
}

final var maybeUrl = Url.createUrl(...);
maybeUrl.ifPresent(url -> {
  // Do something with the validated and correct 'url'
});
```
</div>

#### Builder Pattern

> Builder pattern allows you to construct objects piece by piece.

In the builder pattern, you add properties to the built object with _addXXX_
methods of the builder class. After adding all the needed properties, you can build the final object using
the _build_ or _buildXXX_ method of the builder class.

For example, you can construct a URL from parts of the URL. Below is a Java example of using a `UrlBuilder` class:

<div class="sourceCodeWithoutLabel">

```
final Optional<Url> url = new UrlBuilder()
  .addScheme("https")
  .addHost("www.google.com")
  .buildUrl();
```
</div>

The builder pattern has the benefit that properties given for the builder can be validated in the build method. You can make the
builder's build method return an optional indicating whether the building was successful. Or, you can make the build method throw if you need to return
an error. Then you should name the build method using a _try_ prefix, for example, `tryBuildUrl`.
The builder pattern also has the benefit of not needing to add default properties to the builder. For example, _https_ could be
the default scheme, and if you are building an HTTPS URL, the `addScheme` is not needed to be called. The only problem is
that you must consult the builder documentation to determine the default values.

One drawback with the builder pattern is that you can give the parameters logically in the wrong order like this:

<div class="sourceCodeWithoutLabel">

```
final Optional<Url> url = new UrlBuilder()
  .addHost("www.google.com")
  .addScheme("https")
  .buildUrl();
```
</div>

It works but does not look so nice. So if you are using a builder, always try to give the parameters for the builder in a logically correct order if such order exists. The builder pattern works well when there isn't any inherent order among the parameters.
Below is an example of such a case: A house built with a `HouseBuilder` class.

<div class="sourceCodeWithoutLabel">

```
final House house = new HouseBuilder()
  .addKitchen()
  .addLivingRoom()
  .addBedrooms(3)
  .addBathRooms(2)
  .addGarage()
  .buildHouse();
```
</div>

You can achieve functionality similar to a builder with a factory method with default parameters:

_Url.ts_
```
class Url {
  private constructor(
    host: string,
    path?: string,
    query?: string,
    scheme = 'https',
    port = 443
  ) {
    // ...
  }
  
  static createUrl(
    host: string,
    path?: string,
    query?: string,
    scheme = 'https',
    port = 443
  ): Url | null {
    // Validate the arguments and return 'null' if invalid
  }
}
```

In the factory method above, there is clear visibility of what the default values are. Of course, you cannot now
give the parameters in a logical order. There is also a greater possibility that you accidentally provide some parameters
in the wrong order because many of them are of the same type (string). This won't be a potential issue with
a builder where you use a method with a specific name to give a specific parameter. In modern development environments,
giving parameters in the wrong order is less probable because IDEs offer inlay parameter hints. It is easy to see
if you provide a particular parameter in the wrong position. As shown below, giving parameters in the wrong order can also be avoided using
semantically validated function parameter types. Semantically validated function parameters will be discussed later in this chapter.

_Url.ts_
```
class Url {
  static createUrl(
    host: Host,
    path?: Path,
    query?: Query,
    scheme = Scheme.createScheme('https'),
    port = Port.createPort(443)
 ): Url | null {
    // ...
  }
}
```

You can also use factory method overloading in languages like Java, where default parameters are not supported.
But that solution, for example, in the `Url` class case, can not be easily implemented and requires quite many
overloaded methods to be introduced, which can be overwhelming for a developer.

You can always use a parameter object, not only in Java but in many other languages, too. Below is an
example in Java:

<div class="sourceCodeWithoutLabel">

```
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UrlParams {
  private String scheme = "https";
  private String host;
  private int port = 443;
  private String path = "";
  private String query = "";
  
  UrlParams(final String host) {
    this.host = host;
  }
}

public class Url {
  private Url(final UrlParams urlParams) {
    // ...
  }

  public static Optional<Url> createUrl(
    final UrlParams urlParams
  ) {
    // ...
  }
}

final var urlParams = new UrlParams("www.google.com");
urlParams.setQuery("query=design+patterns");
final var maybeUrl = Url.createUrl(urlParams);
```
</div>

The above solution is quite similar to using a builder, only slightly more verbose, of course.

#### Singleton Pattern

> Singleton pattern defines that a class can have only one instance.

Singletons are very common in pure object-oriented languages like Java. In many cases, a singleton class can be identified as not having any state. And this is why only one instance of the class is needed. There is no point in creating
multiple instances that are the same. In some non-pure object-oriented languages, singletons are not as common as in pure object-oriented languages and
can often be replaced by just defining functions.

In JavaScript/TypeScript, a singleton instance can be created in a module and exported. When you import the instance from the module
in other modules, the other modules will always get the same exported instance, not a new instance every time.
Below is an example of such a singleton:

_myClassSingleton.ts_
```
class MyClass {
  // ...
}

export const myClassSingleton = new MyClass();
```

_otherModule.ts_
```
import { myClassSingleton } from 'myClassSingleton';

// ...
```

The singleton pattern can be implemented using a static class because it cannot be instantiated. The problem with a static class is that
the singleton class is then hardcoded, and static classes can be hard or impossible to mock in unit testing. We should remember to _program against interfaces_. The best way to implement
the singleton pattern is by using the _dependency inversion principle_ and the _dependency injection principle_. Below is an example in Java using the _Google Guice_ library for handling dependency
injection. The constructor of the `FileConfigReader` class expects a `ConfigParser`.
We annotate the constructor with the `@Inject` annotation to inject an instance implementing the `ConfigParser` interface:

<div class="sourceCodeWithoutLabel">

```
import com.google.inject.Inject;

public interface ConfigReader {
  Configuration tryRead(...);
}

public class FileConfigReader
         implements ConfigReader {
  private ConfigParser configParser;
  
  @Inject
  public FileConfigReader(
    final ConfigParser configParser
  ) {
    this.configParser = configParser;
  }
  
  public Configuration tryRead(
    final String configFilePathName
  ) {
    final String configFileContents = // Read configuration file
    
    final var configuration = 
      configParser.tryParse(configFileContents);
      
    return configuration;
  }
}
```
</div>

In the below DI module, we configure a singleton with a lazy binding.
In the lazy binding, the `JsonConfigParser` class is only created
when needed to be used.

<div class="sourceCodeWithoutLabel">

```
import com.google.inject.AbstractModule;

public class DiModule extends AbstractModule {
  @Override
  protected void configure() {
    bind(ConfigParser.class)
      .to(JsonConfigParser.class)
      .in(Scopes.SINGLETON);
  }
}
```
</div>

Alternatively, we can define an eager singleton:

<div class="sourceCodeWithoutLabel">

```
import com.google.inject.AbstractModule;

public class DiModule extends AbstractModule {
  @Override
  protected void configure() {
    bind(ConfigParser.class)
      .to(JsonConfigParser.class)
      .asEagerSingleton();
  }
}
```
</div>

#### Prototype Pattern

> The prototype pattern lets you create a new object using an existing object as a prototype.

Let's have an example with a `DrawnShape` class:

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
  // ...
}

// Implement concrete shapes...

public interface Position {
  int getX();
  int getY();
}

public class DrawnShape {
  private final Position position;
  private final Shape shape;
  
  public DrawnShape(
    final Position position,
    final Shape shape
  ) {
    this.position = position;
    this.shape = shape;
  }
  
  public DrawnShape(
    final Position position,
    final DrawnShape drawnShape
  ) {
    this.position = position;
    shape = drawnShape.getShape();
  }
  
  public DrawnShape cloneTo(
    final Position position
  ) {
    return new DrawnShape(position, this);
  }
  
  public Shape getShape() {
    return this.shape;
  }
}
```
</div>

In the second constructor, we are using the prototype pattern. A new `DrawnShape` object is created from
an existing `DrawnShape` object. An alternative way to use the prototype pattern is to call the `cloneTo` method on
a prototype object and give the position parameter to specify where the new shape should be positioned.

The prototype pattern is also used in JavaScript to implement prototypal inheritance. Since EcmaScript version 6,
class-based inheritance has been available, and prototypal inheritance is not needed to be used.

The idea of prototypal inheritance is that the common parts for the same class objects are stored in a
prototype instance. These common parts typically mean the shared methods. There is no sense in storing the methods multiple times in each object. That would be a waste of resources because Javascript functions are objects themselves.

When you create a new object with the `Object.create` method, you give the prototype as a parameter. After that, you can set properties for the newly created object. When you call a method on the created object, and if that method
is not found in the object's properties, the prototype object will be looked up for the method. Prototypes can be chained
so that a prototype object contains another prototype object. This chaining is used to implement an inheritance chain.
Below is a simple example of prototypal inheritance:

<div class="sourceCodeWithoutLabel">

```
const pet = {
  name: '',
  getName: function() { return this.name; }
};

// Creates a new object with 'pet' object as a prototype
const petNamedBella = Object.create(pet);

petNamedBella.name = 'Bella';
console.log(petNamedBella.getName()); // Prints 'Bella'

// Prototype of a dog which contains 'pet' as nested prototype
const dog = {
  bark: function() { console.log('bark'); },
  __proto__: pet
}

// Creates a new object with 'dog' object as prototype
const dogNamedLuna = Object.create(dog);

dogNamedLuna.name = 'Luna';
console.log(dogNamedLuna.getName()); // Prints 'Luna'
dogNamedLuna.bark(); // Prints 'bark'
```
</div>

#### Object Pool Pattern

> In the object pool pattern, created objects are stored in a pool where objects can be acquired from and returned for reuse.
> The object pool pattern is an optimization pattern because it allows the reuse of created objects.

If you need to create many short-lived objects, you should utilize an object pool and reduce the need
for memory allocation and de-allocation, which takes time. In garbage-collected languages, frequent object creation and
deletion cause extra work for the garbage collector, which consumes CPU time.

Below is an example object pool implementation in C++. The below `LimitedSizeObjectPool` class implementation uses a spin lock in
its methods to achieve thread safety. More about thread safety in the coming _concurrent programming principles_ chapter.

_ObjectPool.h_
```
#include <memory>

template <typename T>
class ObjectPool
{
public:
  virtual ~ObjectPool() = default;

  virtual std::shared_ptr<T> acquireObject() = 0;
  virtual void returnObject(std::shared_ptr<T> object) = 0;
};
```

_LimitedSizeObjectPool.h_
```
#include <deque>
#include "ScopedSpinlock.h"
#include "Spinlock.h"
#include "ObjectPool.h"

template <typename T>
class LimitedSizeObjectPool : public ObjectPool<T>
{
public:
  explicit LimitedSizeObjectPool(const size_t maxPoolSize):
    m_maxPoolSize(maxPoolSize) 
  {}

  std::shared_ptr<T> acquireObject()
  {
    std::shared_ptr<T> object;
    const ScopedSpinlock scopedLock{m_lock};

    if (m_pooledObjects.empty())
    {
      object = std::make_shared<T>();
    }
    else
    {
      object = m_pooledObjects.front();
      m_pooledObjects.pop_front();
    }

    return object;
  }

  void returnObject(std::shared_ptr<T> object)
  {
    const ScopedSpinlock scopedLock{m_lock};

    const bool poolIsFull = 
      m_pooledObjects.size() >= m_maxPoolSize;

    if (poolIsFull)
    {
      object.reset();
    }
    else
    {
      m_pooledObjects.push_back(object);
    }
  }

private:
  Spinlock m_lock;
  size_t m_maxPoolSize;
  std::deque<std::shared_ptr<T>> m_pooledObjects;
};
```

Below is a slightly different implementation of an object pool. The below implementation accepts clearable objects, meaning
objects returned to the pool are cleared before reusing. The below implementation allows you to define
whether the allocated objects are wrapped inside a shared or unique pointer. You can also supply parameters used when constructing an object.

_ObjectPool.h_
```
#include <concepts>
#include <deque>
#include <memory>

template<typename T>
concept ClearableObject =
requires(T object)
{
  { object.clear() } -> std::convertible_to<void>;
};

template<typename T, typename U>
concept Pointer = std::derived_from<T, std::shared_ptr<U>> ||
                  std::derived_from<T, std::unique_ptr<U>>;

template<
  ClearableObject O,
  typename ObjectInterface,
  Pointer<ObjectInterface> OP,
  typename ...Args
>
class ObjectPool
{
public:
  virtual ~ObjectPool() = default;

  virtual OP acquireObject(Args&& ...args) = 0;
  
  virtual void acquireObjects(
    std::deque<OP>& objects,
    size_t objectCount,
    Args&& ...args
   ) = 0;
   
  virtual void returnObject(OP object) = 0;
  virtual void returnObjects(std::deque<OP>& objects) = 0;
};
```

_LimitedSizeObjectPool.h_
```
#include "ScopedLock.h"
#include "Spinlock.h"
#include "ObjectPool.h"

template<
  ClearableObject O,
  typename ObjectInterface,
  Pointer<ObjectInterface> OP,
  typename ...Args
>
class LimitedSizeObjectPool :
   public ObjectPool<O, ObjectInterface, OP, Args...>
{
public:
  explicit LimitedSizeObjectPool(const size_t maxPoolSize) :
    m_maxPoolSize(maxPoolSize)
  {}

  OP acquireObject(Args&& ...args) override
  {
    const ScopedLock scopedLock(m_lock);
    OP acquiredObject;

    if (const bool poolIsEmpty = m_pooledObjects.empty();
            poolIsEmpty)
    {
      acquiredObject = OP{new O{std::forward<Args>(args)...}};
    }
    else
    {
      acquiredObject = m_pooledObjects.front();
      m_pooledObjects.pop_front();
    }

    return acquiredObject;
  }

  void acquireObjects(
    std::deque<OP>& objects,
    const size_t objectCount,
    Args&& ...args
  ) override
  {
    for (size_t n{1U}; n <= objectCount; ++n)
    {
      objects.push_back(acquireObject(std::forward<Args>(args)...));
    }
  }

  void returnObject(OP object) override
  {
    const ScopedLock scopedLock(m_lock);

    if (const bool poolIsFull = m_pooledObjects.size() >=
                                m_maxPoolSize;
            poolIsFull)
    {
        object.reset();
    }
    else
    {
        object->clear();
        m_pooledObjects.push_back(object);
    }
  }

  void returnObjects(std::deque<OP>& objects) override
  {
    while (!objects.empty())
    {
      returnObject(objects.front());
      objects.pop_front();
    }
  }

private:
  size_t m_maxPoolSize;
  Spinlock m_lock;
  std::deque<OP> m_pooledObjects;
};
```

In the below example, we create a message pool for a maximum of 5000 output messages.
We get a shared pointer to an output message from the pool. The pool's concrete class to create
new objects is `OutputMessageImpl`. When we acquire an output message from the pool, we provide a `size_t` type value (= output message length)
to the constructor of the `OutputMessageImpl` class. The `OutputMessageImpl` class must be clearable, i.e.,
it must have a `clear` method returning `void`.

<div class="sourceCodeWithoutLabel">

```
LimitedSizeObjectPool<
  OutputMessageImpl,
  OutputMessage,
  std::shared_ptr<OutputMessage>,
  size_t
> outputMessagePool{5000U};

// Acquire an output message of 1024 bytes from the pool.
const auto outputMessage = outputMessagePool.acquireObject(1024U);
```

</div>

### Structural Design Patterns 

This section describes structural design patterns. Most patterns use object composition as the primary method
to achieve a particular design. The following design patterns are presented:

- Composite pattern
- Facade pattern
- Bridge pattern
- Strategy pattern
- Adapter pattern
- Proxy pattern
- Decorator pattern
- Flyweight pattern

#### Composite Pattern

> In the composite pattern, a class can be composed of itself, i.e., the composition is recursive.

Recursive object composition can be depicted by how a user interface can be composed of different widgets.
In the example below, we have a `Pane` class that is a `Widget`. A `Pane` object can contain several other `Widget` objects,
meaning a `Pane` object can contain other `Pane` objects.

<div class="sourceCodeWithoutLabel">

```
interface Widget {
  void render();
}

public class Pane implements Widget {
  private final List<Widget> widgets;

  public void render() {
    // Render each widget inside pane
  }
}

public class StaticText implements Widget {
  public void render() {
   // Render static text widget
  }

  // ...
}

public class TextInput implements Widget {
  public void render() {
    // Render text input widget
  }
}

public class Button implements Widget {
  public void render() {
    // Render button widget
  }
}

public class UIWindow {
  private final List<Widget> widgets = new ArrayList<>(10);
  
  public void render() {
    widgets.forEach(Widget::render);
  }
}
```
</div>

Objects that form a tree structure are composed of themselves recursively.
Below is an Avro record field schema with a nested record field:

<div class="sourceCodeWithoutLabel">

```
{
  "type": "record", 
  "name": "sampleMessage",
  "fields": [
    { 
      "name": "field1",
      "type": "string"
    },
    { 
      "name": "nestedRecordField",
      "namespace": "nestedRecordField",
      "type": "record",
      "fields": [
        {
          "name": "nestedField1",
          "type": "int",
          "signed": "false"
        }
      ]
    }
  ]
}
```
</div>

For parsing an Avro schema, we could define classes for different sub-schemas by the field type. When analyzing the below example, we can
notice that the `RecordAvroFieldSchema` class can contain any `AvroFieldSchema` object, also
other `RecordAvroFieldSchema` objects, making a `RecordAvroFieldSchema` object a composite object.

<div class="sourceCodeWithoutLabel">

```
public interface AvroFieldSchema {
  // ...
}

public class RecordAvroFieldSchema implements AvroFieldSchema {
  private final List<AvroFieldSchema> subFieldSchemas;
  
  // ...
}

public class StringAvroFieldSchema implements AvroFieldSchema {
  // ...
}

public class IntAvroFieldSchema implements AvroFieldSchema {
  // ...
}
```
</div>

#### Facade Pattern

> In the facade pattern, an object on a higher level of abstraction is composed of objects on a lower level of abstraction. The higher-level object acts as a facade in front of the lower-level objects. Lower-level objects behind the facade are either only or mainly only accessible by the facade.

Let's use the data exporter microservice as an example. For that microservice, we could create a `Configuration` interface that can be used to obtain configuration for the different parts (input,
transformer, and output) of the data exporter microservice. The `Configuration` interface acts as a facade. Users of
the facade need not see behind the facade. They don't know what happens behind the facade. And they shouldn't care
because they are just using the interface provided by the facade.

There can be various classes doing the actual work behind the facade. In the below example, there is a `ConfigReader` that reads configuration from possibly different sources (from a local file or a remote service, for example)
and there are configuration parsers that can parse a specific part of the configuration, possibly in different data formats like
JSON or YAML. None of these implementations and details are visible to the user of the facade. Any of these implementations
behind the facade can change at any time without affecting the users of the facade because facade users are not coupled to the lower-level implementations.

Below is the implementation of the `Configuration` facade in Java:

<div class="sourceCodeWithoutLabel">

```
import com.google.inject.Inject;

public interface Configuration {
  InputConfig tryGetInputConfig();
  TransformerConfig tryGetTransformerConfig();
  OutputConfig tryGetOutputConfig();
}

public class ConfigurationImpl implements Configuration {
  private final ConfigReader configReader;
  private final InputConfigParser inputConfigParser;
  private final TransformerConfigParser transformerConfigParser;
  private final OutputConfigParser outputConfigParser;
  private String configString = "";  
  private Optional<InputConfig> inputConfig = Optional.empty();
  private Optional<OutputConfig> outputConfig = Optional.empty();
  
  private Optional<TransformerConfig> transformerConfig =
    Optional.empty();

  @Inject
  public ConfigurationImpl(
    final ConfigReader configReader, 
    final InputConfigParser inputConfigParser,
    final TransformerConfigParser transformerConfigParser,
    final OutputConfigParser outputConfigParser
  ) {
    // ...
  }
  
  public InputConfig tryGetInputConfig() {
    return inputConfig.orElseGet(() -> {
      tryReadConfigIfNeeded();
      
      inputConfig =
        inputConfigParser.tryParseInputConfig(configString);
      
      return inputConfig;
    });
  }
  
  public TransformerConfig tryGetTransformerConfig() {
    // ...
  }
  
  public OutputConfig tryGetOutputConfig() {
    // ...
  }
  
  private void tryReadConfigIfNeeded() {
    if (configString.isEmpty()) {
      configString =
        configReader.tryRead(...);
    }
  }
}
```
</div>

There is a unique alternative available when implementing the above facade in Java: only the
`Configuration` interface and the `ConfigurationImpl` class could be made public, and all the configuration reading and
parsing related interfaces and classes could be package-private. This would make the usage of the facade mandatory.
No one else except the `ConfigurationImpl` class could use the lower-level implementation classes related to configuration reading and parsing.

#### Bridge Pattern

> In the bridge pattern, the implementation of a class is _delegated_ to another class. The original class is "abstract" 
> in the sense that it does not have any behavior except the delegation to another class, or it can have some higher level
> control logic on how it delegates to another class.

Don't confuse the word "abstract" here with an abstract class. In an abstract class, some behavior is not implemented at all,
but the implementation is deferred to subclasses of the abstract class. Here, instead of the term "abstraction class", we could use the term
_delegating class_ instead.

![Fig 3.5 Bridge Pattern](images/03-05.png)

Let's have an example with shapes and drawings capable of drawing different shapes:

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
  void render(final ShapeRenderer renderer);
}

public class RectangleShape implements Shape {
  private final Point upperLeftCorner;
  private final int width;
  private final int height;
  
  public RectangleShape(
    final Point upperLeftCorner,
    final int width,
    final int height
    ) {
    this.upperLeftCorner = upperLeftCorner;
    this.width = width;
    this.height = height;
  }
  
  public void render(final ShapeRenderer renderer) {
    renderer.renderRectangleShape(upperLeftCorner, width, height);
  }
}

public class CircleShape implements Shape {
  private final Point center;
  private final int radius;
  
  public CircleShape(final Point center, final int radius) {
    this.center = center;
    this.radius = radius;
  }
  
  public void render(final ShapeRenderer renderer) {
    renderer.renderCircleShape(center, radius);
  }
}
```
</div>

The above `RectangleShape` and `CircleShape` classes are abstractions because they delegate their functionality (rendering)
to an external class (implementation class) of the `ShapeRenderer` type. We can provide different rendering implementations for
the shape classes. Let's define two shape renderers, one for rendering raster shapes and another for rendering vector
shapes:

<div class="sourceCodeWithoutLabel">

```
public interface ShapeRenderer {
  void renderCircleShape(final Point center, final int radius);
  
  void renderRectangleShape(
    final Point upperLeftCorner,
    final int width,
    final int height
  );
  
  // Methods for rendering other shapes...
}

public class RasterShapeRenderer implements ShapeRenderer {
  private final Canvas canvas;
  
  public RasterShapeRenderer(final Canvas canvas) {
    this.canvas = canvas;
  }
    
  public void renderCircleShape(
    final Point center,
    final int radius
  ) {
    // Renders circle to canvas
  }
  
  public void renderRectangleShape(
    final Point upperLeftCorner,
    final int width,
    final int height
  ) {
    // Renders a rectangle to canvas
  }
  
  // Methods for rendering other shapes to the canvas
}

public class VectorShapeRenderer implements ShapeRenderer {
  private final SvgElement svgRoot;

  public VectorShapeRenderer(final SvgElement svgRoot) {
    this.svgRoot = svgRoot;
  }

  public void renderCircleShape(
    final Point center,
    final int radius
  ) {
    // Render circle as SVG element and attach as child to SVG root
  }
  
  public void renderRectangleShape(
    final Point upperLeftCorner,
    final int width,
    final int height
  ) {
    // Render rectangle as SVG element
    // and attach as child to SVG root
  }

  // Methods for rendering other shapes 
}
```
</div>

Let's implement two different drawings, a raster, and a vector drawing:

<div class="sourceCodeWithoutLabel">

```
public interface Drawing {
  ShapeRenderer getShapeRenderer();
  void draw();
  void save();
}

public abstract class AbstractDrawing implements Drawing {
  private final String name;
  
  public AbstractDrawing(final String name) {
    this.name = name;
  }

  public abstract ShapeRenderer getShapeRenderer();
  public abstract String getFileExtension();
  public abstract byte[] getData();
  
  public void save() {
    final var fileName = name + getFileExtension();
    final var data = getData();
    
    // Save the 'data' to 'fileName'
  }

  public void draw(final List<Shape> shapes) {
    for (final var shape: shapes) {
      shape.render(getShapeRenderer());
    }
  }
}

public class RasterDrawing extends AbstractDrawing {
  private final Canvas canvas = new Canvas();

  private final RasterShapeRenderer shapeRenderer =
    new RasterShapeRenderer(canvas);

  public RasterDrawing(final String name) {
    super(name);
  }

  public ShapeRenderer getShapeRenderer() {
    return shapeRenderer;
  } 

  public String getFileExtension() {
    return ".png";
  }

  public byte[] getData() {
    // get data from the 'canvas' object
  }
}

public class VectorDrawing extends AbstractDrawing {
  private final SvgElement svgRoot = new SvgElement();

  private final VectorShapeRenderer shapeRenderer = 
    new VectorShapeRenderer(svgRoot);

  public VectorDrawing(final String name) {
    super(name);
  }

  public ShapeRenderer getShapeRenderer() {
    return shapeRenderer;
  }

  public String getFileExtension() {
    return ".svg";
  }

  public byte[] getData() {
    // get data from the 'svgRoot' object
  }
}
```
</div>

In the above example, we have delegated the rendering behavior of the shape classes to concrete classes implementing the `ShapeRenderer` interface.
The `Shape` classes only represent a shape but don't render the shape. They have a single responsibility of representing
a shape. Regarding rendering, the shape classes are "abstractions" because they delegate the rendering to other classes responsible for rendering different shapes.

Now we can have a list of shapes and render them differently. We can do this as shown below because we did not couple the shape classes with
any specific rendering behavior.

<div class="sourceCodeWithoutLabel">

```
final List<Shape> shapes = new ArrayList<>(50);
// Add various shapes to 'shapes' list here...

final var rasterDrawing = new RasterDrawing("raster-drawing-1");
rasterDrawing.draw(shapes);
rasterDrawing.save();

final var vectorDrawing = new VectorDrawing("vector-drawing-1");
vectorDrawing.draw(shapes);
vectorDrawing.save();
```
</div>

#### Strategy Pattern

> In the strategy pattern, the functionality of an object can be changed by changing an instance of a composed type to a different instance of that type.

Below is an example where the behavior of a `ConfigReader` class can be changed by changing the value of the `configParser` field to an instance of a different class. The default behavior is to parse the configuration in JSON format,
which can be achieved using the default constructor.

<div class="sourceCodeWithoutLabel">

```
public class ConfigReader {
  private final ConfigParser configParser;
    
  public ConfigReader() {
    configParser = new JsonConfigParser();
  }

  public ConfigReader(final ConfigParser configParser) {
    this.configParser = configParser;
  }
  
  public Configuration tryRead(final String configFilePathName) {
    // Try read the configuration file contents to a string
    // variable named 'configFileContents'
    
    final Configuration configuration =
      configParser.tryParse(configFileContents);
    
    return configuration;
  }
}
```
</div>

Using the strategy pattern, we can change the functionality of a `ConfigReader` class object by changing
the `configParser` field value. For example, there could be the following classes available that
implement the `ConfigParser` interface:

- `JsonConfigParser`
- `YamlConfigParser`
- `TomlConfigParser`

We can dynamically change the behavior of the `ConfigReader` class to use a YAML parsing strategy
by giving an instance of the `YamlConfigParser` class as a parameter for the `ConfigReader` constructor.

#### Adapter Pattern

> The adapter pattern changes one interface to another interface. The adapter pattern allows you to adapt different interfaces to a single interface.

In the below example, we have defined a `Message` interface for messages that can be consumed from a data source
using a `MessageConsumer`.

_Message.h_
```
#include <cstdint>

class Message
{
public:
  Message() = default;
  virtual ~Message() = default;
  
  virtual uint8_t* getData() const = 0;
  virtual std::size_t getDataLengthInBytes() const = 0;
};
```

_MessageConsumer.h_
```
#include <memory>
#include "Message.h"

class MessageConsumer 
{
public:
  MessageConsumer() = default;
  virtual ~MessageConsumer() = default;
  
  virtual std::shared_ptr<Message> consumeMessage() = 0;
};
```

Next, we can define the message and message consumer adapter classes for Apache Kafka and Apache Pulsar:

_KafkaMessageConsumer.h_
```
#include "MessageConsumer.h"

class KafkaMessageConsumer : public MessageConsumer
{
public:
  KafkaMessageConsumer(...);
  ~KafkaMessageConsumer() override;
  
  std::shared_ptr<Message> consumeMessage() override {
    // Consume a message from Kafka using a 3rd party
    // Kafka library, e.g. LibRdKafka
    // Wrap the consumed LibRdKafka message inside an instance
    // of KafkaMessage class
    // Return the KafkaMessage instance
  }
};
```

_KafkaMessage.h_
```
#include <bit>
#include <librdkafka/rdkafkacpp.h>
#include "Message.h"

class KafkaMessage : public Message
{
public:
  explicit KafkaMessage(RdKafka::Message* const message):
    m_message(message)
  {}
  
  ~KafkaMessage() override
  {
    delete m_message;
  }

  uint8_t* getData() const override
  {
    return std::bit_cast<uint8_t*>(m_message->payload());
  }

  std::size_t getDataLengthInBytes() const override
  {
    return m_message->len();
  }

private:
  RdKafka::Message* m_message;
};
```

_PulsarMessageConsumer.h_
```
#include "MessageConsumer.h"

class PulsarMessageConsumer : public MessageConsumer
{
public:
  PulsarMessageConsumer(...);
  ~PulsarMessageConsumer() override;
  
  std::shared_ptr<Message> consumeMessage() override {
    // Consume a message from Pulsar using the Pulsar C++ client
    // Wrap the consumed Pulsar message inside an instance
    // of PulsarMessage
    // Return the PulsarMessage instance
  }
};
```

_PulsarMessage.h_
```
#include "Message.h"

class PulsarMessage : public Message
{
public:
  // ...
};
```

Now we can use Kafka or Pulsar data sources with identical consumer and message interfaces.
In the future, it will be easy to integrate a new data source into the system.
We only need to implement appropriate adapter classes (message and consumer classes) for the new data source. No other code changes are required.
Thus, we would be following the _open-closed principle_ correctly.

Let's imagine that the API of the used _LibRdKafka_ library changed. We don't need to make changes in many
places in the code. We need to create new adapter classes (message and consumer classes) for the new LibRdKafka API and use those new adapter classes
in place of the old adapter classes. All this work is again following the _open-closed principle_.

Consider using the adapter pattern even if there is nothing to adapt to, especially when working with 3rd party libraries.
Because then you will be prepared for the future when changes can come. It might be possible that a 3rd party library interface
changes or there is a need to take a different library into use. If you have not used the adapter pattern, taking a new library or library version into use could mean that you must make many small
changes in several places in the codebase, which is error-prone and against the _open-closed principle_.

Let's have an example of using a 3rd party logging library. Initially, our adapter for the _abc-logging-library_ is just a
wrapper around the `abcLogger` instance from the library. There is not any actual adapting done.

_logger.ts_
```
import abcLogger from 'abc-logging-library';
import { LogLevel } from 'LogLevel';

interface Logger {
  log(logLevel: LogLevel, logMessage: string): void;
}

class AbcLogger implements Logger {
  log(logLevel: LogLevel, logMessage: string): void {
    abcLogger.log(logLevel, logMessage);
  }
}

export default new AbcLogger();
```

Suppose that in the future, a better logging library is available called _xyz-logging-library_, and we
would like to take that into use, but it has a bit different interface. Its logging instance is called `xyzLogWriter`, the logging method is named differently, and the parameters are given in different order compared to the _abc-logging-library_.
We can create an adapter for the new logging library, and no other code changes are required elsewhere in the codebase:

_logger.ts_
```
import xyzLogWriter from 'xyz-logging-library';
import { LogLevel } from 'LogLevel';

interface Logger {
  log(logLevel: LogLevel, logMessage: string): void;
}

class XyzLogger implements Logger {
  log(logLevel: LogLevel, logMessage: string): void {
    xyzLogWriter.writeLogEntry(logMessage, logLevel);
  }
}

export default new XyzLogger();
```

We don't have to modify all the places in the code where logging is used. And usually, logging is used in many places.
We have saved ourselves from a lot of error-prone and unnecessary work, and once again, we have followed the _open-closed principle_.

#### Proxy Pattern

> The proxy pattern enables conditionally modifying or augmenting the behavior of an object.

When using the proxy pattern, you define a proxy class that wraps another class (the proxied class). The proxy class conditionally delegates
to the wrapped class. The proxy class implements the interface of the wrapped class and is used in place of the wrapped
class in the code.

Below is an example of a TypeScript proxy class, `CachingEntityStore`, that caches the results of entity store operations:

<div class="sourceCodeWithoutLabel">

```
class MemoryCache<K, V> {
  // ...
  
  retrieveBy(key: K): V {
    // ...
  }

  store(key: K, value: V, timeToLiveInSecs?: number): void {
    // ...
  }
}

interface EntityStore<T> {
  getEntityById(id: number): Promise<T>;
}

class DbEntityStore<T> implements EntityStore<T> {
  getEntityById(id: number): Promise<T> {
    // Try get entity from database
  }
}

class CachingEntityStore<T> implements EntityStore<T> {
  private readonly entityCache = new MemoryCache<number, T>();
  
  constructor(private readonly entityStore: EntityStore<T>) 
  {}
  
  async getEntityById(id: number): Promise<T> {
    let entity = this.entityCache.retrieveBy(id);
    
    if (entity === undefined) {
      entity = await this.entityStore.getEntityById(id);
      const timeToLiveInSecs = 60;
      this.entityCache.store(id, entity, timeToLiveInSecs);
    }

    return entity;
  }
}
```
</div>

In the above example, the `CachingEntityStore` class is the proxy class wrapping an `EntityStore`.
The proxy class is modifying the wrapped class behavior by conditionally delegating to the wrapped class. It
delegates to the wrapped class only if an entity is not found in the cache.

Below is another TypeScript example of a proxy class that authorizes a user before performing a service operation:

<div class="sourceCodeWithoutLabel">

```
interface UserService {
  getUserById(id: number): Promise<User>;
}

class UserServiceImpl implements UserService {
  getUserById(id: number): Promise<User> {
    // Try get user by id
  }
}

class AuthorizingUserService implements UserService {
  constructor(
    private readonly userService: UserService,
    private readonly userAuthorizer: UserAuthorizer
  ) {}
  
  async getUserById(id: number): Promise<User> {
    try {
      await this.userAuthorizer.tryAuthorizeUser(id);
    } catch (error: any) {
      throw new UserServiceError(error.message);
    }

    return this.userService.getUserById(id);
  }
}
```
</div>

In the above example, the `AuthorizingUserService` class is a proxy class that wraps a
`UserService`. The proxy class is modifying the wrapped class behavior by conditionally delegating to the wrapped
class. It will delegate to the wrapped class only if authorization is successful.

#### Decorator Pattern

> The decorator pattern enables augmenting the functionality of a class method(s) without the need to modify the class method(s).

A decorator class wraps another class whose functionality will be augmented. The decorator class implements the interface
of the wrapped class and is used in place of the wrapped class in the code. The decorator pattern is useful when you
cannot modify an existing class, e.g., the existing class is in a 3rd party library. The decorator pattern also helps to follow the _open-closed principle_ because you don't have to modify an existing
method to augment its functionality. You can create a decorator class that contains the new functionality.

Below is a TypeScript example of the decorator pattern. There is a standard SQL statement executor implementation and
two decorated SQL statement executor implementations: one that adds logging functionality and one that adds SQL statement
execution timing functionality. Finally, a double-decorated SQL statement executor is created that logs an SQL statement and times its execution.

<div class="sourceCodeWithoutLabel">

```
import logger from 'logger';
import { LogLevel } from 'LogLevel';

interface SqlStatementExecutor {
  tryExecute(
    sqlStatement: string,
    parameterValues?: any[]
  ): Promise<any>;
}

class SqlStatementExecutorImpl implements SqlStatementExecutor {
  // Implement getConnection()

  tryExecute(
    sqlStatement: string,
    parameterValues?: any[]
  ): Promise<any> {
    return this.getConnection().execute(sqlStatement,
                                        parameterValues);
  }
}

class LoggingSqlStatementExecutor 
        implements SqlStatementExecutor {
  constructor(
    private readonly sqlStatementExecutor: SqlStatementExecutor
  ) {}
  
  tryExecute(
    sqlStatement: string,
    parameterValues?: any[]
  ): Promise<any> {
    logger.log(LogLevel.Debug,
               `Executing SQL statement: ${sqlStatement}`);
               
    return this.sqlStatementExecutor
      .tryExecute(sqlStatement, parameterValues);
  }
}

class TimingSqlStatementExecutor
        implements SqlStatementExecutor {
  constructor(
    private readonly sqlStatementExecutor: SqlStatementExecutor
  ) {}
  
  async tryExecute(
    sqlStatement: string,
    parameterValues?: any[]
  ): Promise<any> {
    const startTimeInMs = Date.now();
    
    const result = 
      await this.sqlStatementExecutor
        .tryExecute(sqlStatement, parameterValues);
                                
    const endTimeInMs = Date.now();
    const durationInMs = endTimeInMs - startTimeInMs;
    
    logger.log(LogLevel.Debug, 
    `SQL statement execution duration: ${durationInMs} ms`);
      
    return result;
  }
}

const timingAndLoggingSqlStatementExecutor = 
  new LoggingSqlStatementExecutor(
    new TimingSqlStatementExecutor(
      new SqlStatementExecutorImpl()));
```
</div>

#### Flyweight Pattern

> The flyweight pattern is a memory-saving optimization pattern where flyweight objects reuse objects.

Let's have a simple example with a game where different shapes are drawn at different positions. Let's assume
that the game draws a lot of similar shapes but in different positions so that we can notice the difference
in memory consumption after applying this pattern.

Shapes that the game draws have the following properties: size, form, fill color, stroke color, stroke width, and stroke style.

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
  // ...
}

// Color...
// StrokeStyle...

public class AbstractShape implements Shape {
  private final Color fillColor;
  private final Color strokeColor;
  private final int strokeWidth;
  private final StrokeStyle strokeStyle;
  
  // ...
}

public class CircleShape extends AbstractShape {
  private final int radius;

  // ...
}

// LineSegment...

public class PolygonShape extends AbstractShape {
  private final List<LineSegment> lineSegments;

  // ...
}
```
</div>

When analyzing the `PolygonShape` class, we can notice that it contains many properties
that consume memory. Especially a polygon that has many line segments can consume a noticeable amount of memory. If the game draws many identical polygons
in different screen positions and always creates a new `PolygonShape` object, there would be a lot of identical `PolygonShape` objects in the memory. To remediate this, we can introduce a flyweight class, `DrawnShapeImpl`,
which contains the position of a shape and a reference to the actual shape. In this way, we can draw a lot of
`DrawnShapeImpl` objects that all contain a reference to the same `PolygonShape` object:

<div class="sourceCodeWithoutLabel">

```
public interface DrawnShape {
  // ...
}

public class DrawnShapeImpl implements DrawnShape {
  private final Shape shape;
  private Position screenPosition;
  
  public DrawnShapeImpl(
    final Shape shape,
    final Position screenPosition
  ) {
    this.shape = shape;
    this.screenPosition = screenPosition;
  }
  
  // ...
}

final Shape polygon = new PolygonShape(...);
final List<Position> positions = generateLotsOfPositions();

final var drawnPolygons = positions.stream().map(position -> 
  new DrawnShapeImpl(polygon, position)
);
```
</div>

### Behavioral Design Patterns 

Behavioral design patterns describe ways to implement new behavior using object-oriented design.
The following behavioral design patterns will be presented in the following sections:

- Chain of responsibility pattern
- Observer pattern
- Command/Action pattern
- Iterator pattern
- State pattern
- Mediator pattern
- Template method pattern
- Memento pattern
- Visitor pattern
- Null object pattern

#### Chain of Responsibility Pattern

> The chain of responsibility pattern lets you pass requests along a chain of handlers.

When receiving a request, each handler can decide what to do:

- Process the request and then pass it to the next handler in the chain
- Process the request without passing it to the subsequent handlers (terminating the chain)
- Leave the request unprocessed and pass it to the next handler

One of the most famous implementations of this pattern is Java servlet filters. A servlet filter processes
incoming HTTP requests before passing them to the actual servlet for handling. Servlet filters can be used to implement
various functionality like logging, compression, encryption/decryption, input validation, etc.

Let's have an example of a servlet filter that adds logging before and after each HTTP request is processed:

_LoggingFilter.java_
```
import java.io.IOException;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;

@WebFilter(urlPatterns = {"/*"})
public class LoggingFilter implements Filter {
  // No initialization needed, thus empty method  
  public void init(final FilterConfig filterConfig)
    throws ServletException
  {}

  // No cleanup needed, thus empty method
  public void destroy()
  {}

  public void doFilter(
    final ServletRequest request,
    final ServletResponse response,
    final FilterChain filterChain
  ) throws IOException, ServletException 
  {
    final var responseWriter = response.getWriter();
    responseWriter.print("Before response\n");
    
    // Sends request to the next filter 
    // or when no more filters to the servlet
    filterChain.doFilter(request, response); 
    
    responseWriter.print("\nAfter response");
  }
}  
```

_HelloWorldServlet.java_
```
import java.io.IOException;  
  
import javax.servlet.ServletException;  
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/helloworld")
public class HelloWorldServlet extends HttpServlet {  
  public void doGet(
    HttpServletRequest request,
    HttpServletResponse response
  ) throws ServletException, IOException {
    response.setContentType("text/plain");  
    final var responseWriter = response.getWriter();
    responseWriter.print("Hello, world!");
  }
}  
```

When we send an HTTP GET request to the `/helloworld` endpoint, we should get the following response:

<div class="sourceCodeWithoutLabel">

```
Before response
Hello, world!
After response
```
</div>

Let's implement a JWT authorization filter:

_JwtAuthorizationFilter.java_
```
import java.io.IOException;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletResponse;

@WebFilter(urlPatterns = {"/*"})
public class AuthorizationFilter implements Filter {
  public void init(final FilterConfig filterConfig) 
    throws ServletException 
  {}
  
  public void destroy()
  {}

  public void doFilter(
    final ServletRequest request,
    final ServletResponse response,
    final FilterChain filterChain
  ) throws IOException, ServletException {
      
    // From request's 'Authorization' header,
    // extract the bearer JWT
    // Set 'tokenIsPresent' variable value
    // to true or false
    // Verify the validity of JWT and assign result
    // to 'tokenIsValid' variable
    
    HttpServletResponse httpResponse = 
      (HttpServletResponse) response;

    if (tokenIsValid) {
      filterChain.doFilter(request, response);
    } else if (tokenIsPresent) {
      // NOTE! filterChain is not invoked,
      // this will terminate the request
      httpResponse.setStatus(403);
      final var responseWriter = response.getWriter();
      responseWriter.print("Unauthorized");
      responseWriter.close();
    } else {
    // NOTE! filterChain is not invoked,
    // this will terminate the request  
    httpResponse.setStatus(401);
    final var responseWriter = response.getWriter();
    responseWriter.print("Unauthenticated");
    responseWriter.close();
    }
  }
}  
```

The Express framework for Node.js utilizes the chain of responsibility pattern for handling requests.
In the Express framework, you can write pluggable behavior using _middlewares_, a concept similar to
servlet filters in Java. Below is the same logging and authorization example as above, but written using JavaScript and
the Express framework:

<div class="sourceCodeWithoutLabel">

```
const express = require('express')
const app = express()

// Authorization middleware
function authorize(request, response, next) {
  // From request's 'Authorization' header,
  // extract the bearer JWT, if present 
  // Set 'tokenIsPresent' variable value
  // Verify the validity of JWT and assign result
  // to 'tokenIsValid' variable
      
  if (tokenIsValid) {
    next();
  } else if (tokenIsPresent) {
    // NOTE! next is not invoked,
    // this will terminate the request
    response.writeHead(403);
    response.end('Unauthorized');
  } else {
    // NOTE! next is not invoked,
    // this will terminate the request  
    response.writeHead(401);
    response.end('Unauthenticated');
  }
}

// Logging before middleware
function logBefore(request, response, next) {
  response.write('Before response\n');
  next();
}

// Use authorization and logging middlewares
app.use(authorize, logBefore);

app.get('/helloworld', (request, response, next) => {
  response.write('Hello World!\n');
  next();
});

// Logging after middleware
function logAfter(request, response, next) {
  response.write('After response\n');
  response.end();
  next();
}

app.use(logAfter);

app.listen(4000);
```
</div>

We cannot use Express middlewares as described below:

<div class="sourceCodeWithoutLabel">

```
// Logging middleware
async function log(request, response, next) {
  response.write('Before response\n');
  await next();
  response.write('After response\n');

  // You cannot use response.end('After response\n')
  // because that would close the response stream
  // before Hello World! is written and the output
  // would be just:
  // Before response
  // After response
}

// Use authorization and logging middlewares
app.use(authorize, log);

app.get('/helloworld', (request, response) => {
  setTimeout(() => response.end('Hello World!\n'), 1000);
});
```
</div>

The reason is that the `next` function does not return a promise we could await.
For this reason, the output from the `/helloworld` endpoint would be in the wrong order:

<div class="sourceCodeWithoutLabel">

```
Before response
After response
Hello World!
```

</div>

ESLint plugins utilize the chain of responsibility pattern, too. Below is code for defining one rule in an
ESLint plugin:

<div class="sourceCodeWithoutLabel">

```
create(context) {
  return {
    NewExpression(newExpr) {
      if (
        newExpr.callee.name === "SqlFilter" &&
        newExpr.arguments &&
        newExpr.arguments[0] &&
        newExpr.arguments[0].type !== "Literal"
      ) {
        context.report(
          newExpr,
          `SqlFilter constructor's 1st parameter must be a string literal`
        );
      }
    }
  };
}
```
</div>

ESLint plugin framework will call the `create` function and supply the `context` parameter. The `create` function should return an
object of functions to analyze different _abstract syntax tree_ (AST) nodes. In the above example, we are only interested
in `NewExpression` nodes and analyze the creation of a new `SqlFilter` object. The first parameter supplied for
the `SqlFilter` constructor should be a literal. If not, we report an issue using the `context.report` method.

When running ESLint with the above plugin and rule enabled, whenever ESLint encounters a _new_ expression in a code file, the above-supplied `NewExpression` handler function will be called to check if the _new_ expression in the code is valid.

The following code will pass the above ESLint rule:

<div class="sourceCodeWithoutLabel">

```
const sqlFilter = new SqlFilter('field1 > 0');
```
</div>

And the following code won't:

<div class="sourceCodeWithoutLabel">

```
const sqlExpression = 'field1 > 0';
const sqlFilter = new SqlFilter(sqlExpression);
```
</div>

#### Observer Pattern

> The observer pattern lets you define an observe-notify (or publish-subscribe) mechanism to notify one or more objects about events that happen to the observed object.

One typical example of using the observer pattern is a UI view observing a model. The UI view will be notified whenever the model changes and can redraw itself. Let's have an example with Java:

<div class="sourceCodeWithoutLabel">

```
public interface Observer {
  void notifyAboutChange();
}

public interface Observable {
  void observeBy(Observer observer);
}

public class ObservableImpl {
  private final List<Observer> observers = new ArrayList<>();

  public void observeBy(final Observer observer) {
    observers.add(observer);
  }

  protected void notifyObservers() {
    observers.forEach(Observer::notifyAboutChange);
  }
}

public class TodosModel extends ObservableImpl {
  private List<Todo> todos = new ArrayList<>(25);

  // ...

  public void addTodo(final Todo todo) {
    todos.add(todo);
    notifyObservers();
  }

  public void removeTodo(final Todo todo) {
    todos.remove(todo);
    notifyObservers();
  }
}

public class TodosView implements Observer {
  private final TodosModel todosModel;

  public TodosView(final TodosModel todosModel) {
    this.todosModel = todosModel;
    todosModel.observeBy(this);
  }
  
  public void notifyAboutChange() {
    // Will be called when todos model change
    render();
  }

  public void render() {
    // Renders todos...
  }
}
```

</div>

Let's have another example that utilizes the publish-subscribe pattern. Below we define a `MessageBroker` class that contains the following methods: `publish`, `subscribe`, and `unsubscribe`.

<div class="sourceCodeWithoutLabel">

```
public interface MessagePublisher<T> {
  void publish(String topic, T message);
}

@FunctionalInterface
public interface MessageHandler<T> {
  void handle(T message);
}

public interface MessageSubscriber<T> {
  void subscribe(String topic,
                 MessageHandler<T> messageHandler);
}

public class MessageBroker<T> implements
               MessagePublisher<T>, MessageSubscriber<T> {
  private final Map<String, List<MessageHandler<T>>>
    topicToMessageHandlersMap = new HashMap<>();
  
  public void publish(
    final String topic,
    final T message
  ) {
    final var messageHandlers =
      topicToMessageHandlersMap.get(topic);
    
    if (messageHandlers != null) {
      messageHandlers.forEach(messageHandler ->
        messageHandler.handle(message));
    }
  }
  
  public void subscribe(
    final String topic,
    final MessageHandler<T> messageHandler
  ) {
    final var messageHandlers =
      topicToMessageHandlersMap.get(topic);

      if (messageHandlers == null) {
        topicToMessageHandlersMap.put(topic,
                                      List.of(messageHandler));
      } else {
        messageHandlers.add(messageHandler);
      }
  }
  
   public void unsubscribe(
    final String topic,
    final MessageHandler<T> messageHandlerToRemove
  ) {
    final var messageHandlers =
      topicToMessageHandlersMap.get(topic);
      
    messageHandlers.removeIf(messageHandler ->
      messageHandler == messageHandlerToRemove);
  }
}
```
</div>

In the above example, we could have used the built-in Java `Consumer<T>` interface instead of the custom `MessageHandler<T>` interface.

#### Command/Action Pattern

> Command or action pattern is used to define commands or actions as objects which can be given as parameters
> to other functions for later execution.

Let's have an example using the _Redux_ library well-known by many React developers. Below is a Redux reducer:

_todosReducer.js_
```
function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: action.payload.id,
          name: action.payload.name,
          isDone: false
        }]
      };
    case 'MARK_TODO_DONE':
      const newTodos = state.todos.map(todo => {
        if (todo.id !== action.payload.id) {
          return todo;
        }
        
        return {
          ...todo,
          isDone: true
        };
      });
     
      return {
        ...state,
        todos: newTodos
      };
    default:
      return state;
  }
}
```

In the above example, we define a `todosReducer` which can handle two different actions: `ADD_TODO` and
`MARK_TODO_DONE`. The implementation of the actions is inlined inside the switch statement, which makes the code somewhat
hard to read. We can refactor the above code so that we introduce two classes for action objects:

_AddTodoAction.ts_
```
export default class AddTodoAction {
  constructor(
    private readonly id: number,
    private readonly name: string
  ) {}
  
  perform(state: TodoState): TodoState {
    return {
      ...state,
      todos: [...state.todos, {
        id: this.id,
        name: this.name,
        isDone: false
      }]
   };
  }
}
```

_MarkDoneTodoAction.ts_
```
export default class MarkDoneTodoAction {
  constructor(private readonly id: number) {}
  
  perform(state: TodoState): TodoState {
    const newTodos = state.todos.map(todo => {
      if (todo.id !== this.id) {
        return todo;
      }
      
      return {
        ...todo,
        isDone: true
      };
    });
     
    return {
      ...state,
      todos: newTodos
    };
  }
}
```

Now we can redesign the `todosReducer` to look like the following:

_todosReducer.ts_
```
import AddTodoAction from './AddTodoAction';
import MarkDoneTodoAction from './MarkDoneTodoAction';

function todosReducer(
  state: TodoState = initialState,
  { payload: { id, name }, type }: any
) {
  switch (type) {
    case 'ADD_TODO':
      return new AddTodoAction(id, name).perform(state);      
    case 'MARK_TODO_DONE':
      return new MarkDoneTodoAction(id).perform(state);
    default:
      return state;
  }
}
```

We have separated actions into classes, and the `todosReducer` function becomes simpler.
However, we should make the code object-oriented by replacing the conditionals (switch-case) with polymorphism.
Let's do the following modifications: introduce a generic base class for actions and a base class for
todo-related actions:

_AbstractAction.ts_
```
export default abstract class AbstractAction<S> {
  abstract perform(state: S): S;
}
```

_AbstractTodoAction.ts_
```
import AbstractAction from './AbstractAction';

export default abstract class AbstractTodoAction extends 
  AbstractAction<TodoState> {}
```

The todo action classes must be modified to extend the `AbstractTodoAction` class:

_AddTodoAction.ts_
```
import AbstractTodoAction from './AbstractTodoAction';

export default class AddTodoAction extends AbstractTodoAction {
  // ...
}
```

_MarkDoneTodoAction.ts_
```
import AbstractTodoAction from './AbstractTodoAction';

export default class MarkDoneTodoAction extends AbstractTodoAction {
  // ...
}
```

Then we can introduce a generic function to create a reducer. This function will create a reducer function
that perform actions for a given action base class:

_createReducer.ts_
```
import AbstractAction from './AbstractAction';

export default function createReducer<S>(
  initialState: S,
  ActionBaseClass:
    abstract new (...args: any[]) => AbstractAction<S>
) {
  return function(
    state: S = initialState,
    action: { type: AbstractAction<S> }
   ) {
     return action.type instanceof ActionBaseClass
       ? action.type.perform(state)
       : state;
  };
}
```

Let's create the initial state for todos:

_Todo.ts_
```
export type Todo = {
  id: number,
  name: string,
  isDone: boolean
}
```

_initialTodosState.ts_
```
import { Todo } from './Todo';

export type TodoState = {
  todos: Todo[];
}

const initialTodosState = {
  todos: []
} as TodoState

export default initialTodosState;
```

Next, we can create a Redux store using the `createReducer` function, the initial todo state, and the base action class for
todo-related actions:

_store.ts_
```
import { combineReducers, createStore } from "redux";
import createReducer from "./createReducer";
import initialTodosState from "./initialTodoState";
import AbstractTodoAction from "./AbstractTodoAction";

const rootReducer = combineReducers({
  todoState: createReducer(initialTodosState, AbstractTodoAction)
});

export default createStore(rootReducer);
```

Now we have an object-oriented solution for dispatching actions in the following way: 

<div class="sourceCodeWithoutLabel">

```
dispatch({ type: new AddTodoAction(id, name) });
dispatch({ type: new MarkTodoDoneAction(id) });
```
</div>

Let's modify the `AbstractAction` class to support undoable actions. By default, an action is not undoable:

_AbstractAction.ts_
```
export default abstract class AbstractAction<S> {
  abstract perform(state: S): S;

  getName(): string {
    return this.constructor.name;
  }
  
  isUndoable(): boolean {
    return false;
  }
}
```

Let's also create a new class to serve as a base class for undoable actions:

_AbstractUndoableAction.ts_
```
import AbstractAction from "./AbstractAction";

export default abstract class AbstractUndoableAction<S> extends
         AbstractAction<S> {
  override isUndoable(): boolean {
    return true;
  }
}
```

Let's define a class for undo-actions. An undo-action
sets the state as it was before performing the actual action.

_UndoAction.ts_
```
import AbstractAction from "./AbstractAction";

export default class UndoAction<S> extends AbstractAction<S> {
  constructor(
    private readonly actionName: string,
    private readonly ActionBaseClass: 
      abstract new (...args: any[]) => AbstractAction<S>,
    private readonly state: S
  ) {
    super();
  }
  
  override getName(): string {
    return this.actionName;
  }

  override perform(state: S): S {
    return this.state;
  }
  
  getActionBaseClass():
    abstract new (...args: any[]) => AbstractAction<S>
  {
    return this.ActionBaseClass;
  }
}
```

Let's modify the `createReducer` function to create undo-actions for undoable actions and store them in a stack named `undoActions`.
When a user wants to perform an undo of the last action, the topmost element from the `undoActions` stack can be popped and executed.

_undoActions.ts_
```
import UndoAction from "./UndoAction";

const undoActions = [] as UndoAction<any>[];
export default undoActions;
```

_createReducer.ts_
```
// ...
import undoActions from './undoActions';
import AbstractAction from "./AbstractAction";
import UndoAction from "./UndoAction";

function createReducer<S>(
  initialState: S,
  ActionBaseClass:
    abstract new (...args : any[]) => AbstractAction<S>
) {
  return function(
    state: S = initialState,
    action: { type: AbstractAction<S> }
  ) {
    let newState;

    if (action.type instanceof UndoAction &&
        action.type.getActionBaseClass() === ActionBaseClass) {
      newState = action.type.perform(state);
    } else if (action.type instanceof ActionBaseClass) {
      if (action.type.isUndoable()) {
          undoActions.unshift(new UndoAction(
            action.type.getName(),
            ActionBaseClass,
            state));
      }
    
      newState = action.type.perform(state);
    } else {
      newState = state;
    }

    return newState;
  };
}
```

Commands/Actions can also be defined without an object-oriented approach using a newly created function with a closure.
In the below example, the function `() => toggleTodoDone(id)` is redefined for each todo. The function redefinition will
always create a new closure that stores the current `id` variable value. We can treat the `() => toggleTodoDone(id)` as an
action or command because it "encapsulates" the `id` value in the closure.

_TodosTableView.tsx_
```
// type Props = ...

export default function TodosTableView(
  { toggleTodoDone, todos }: Props
) {
  const todoElements = todos.map(({ id, name }) => (
    <tr>
      <td>{id}</td>
      <td>{name}</td>
      <td>
        <input 
          type="checkbox"
          onChange={() => toggleTodoDone(id)}
        />
      </td>
    </tr>
  ));
  
  return <table><tbody>{todoElements}</tbody></table>;
}
```

#### Iterator Pattern

> The iterator pattern can be used to add iteration capabilities to a sequence class.

Let's create a reverse iterator for Java's `List` class. We implement the `Iterator` interface by supplying implementations
for the `hasNext` and the `next` methods:

_ReverseListIterator.java_
```
public class ReverseListIterator<T> implements Iterator<T> {
  private final List<T> values;
  private int iteratorPosition;
  
  public ReverseListIterator(final List<T> values) {
    this.values = Collections.unmodifiableList(values);
    iteratorPosition = values.size() - 1;
  }
  
  @Override
  public boolean hasNext() {
    return iteratorPosition >= 0;
  }
  
  @Override
  public T next() {
    // Note! We don't check the iteratorPosition
    // validity here, it is checked in hasNext() method,
    // which must be called before calling next() method
    // and only call next() method if hasNext() method
    // returned true
    final var nextValue = values.get(iteratorPosition);
    iteratorPosition--;
    return nextValue;
  }
}
```

We can put the `ReverseListIterator` class into use in a `ReverseArrayList` class defined below:

_ReverseArrayList.java_
```
public class ReverseArrayList<T> extends ArrayList<T>
{
  @Override
  public Iterator<T> iterator() {
    return new ReverseListIterator<>(this);
  }
}
```

Now we can use the new iterator to iterate over a list in reverse order:

<div class="sourceCodeWithoutLabel">

```
final var reversedNumbers = new ReverseArrayList<Integer>();
reversedNumbers.addAll(List.of(1,2,3,4,5));

for (final var number : reversedNumbers) {
  System.out.println(number);
}

// Prints:
// 5
// 4
// 3
// 2
// 1
```
</div>
  
#### State Pattern

> The state pattern lets an object change its behavior depending on its current state.

Developers don't often treat an object's state as an object but as an enumerated value (enum), for example.
Below is an example where we have defined a `UserStory` class representing a user story that can be
rendered on screen. An enum value represents the state of a `UserStory` object.

<div class="sourceCodeWithoutLabel">

```
public enum UserStoryState {
  TODO, IN_DEVELOPMENT, IN_VERIFICATION, READY_FOR_REVIEW, DONE
}

public class UserStory {
  private String name;
  private UserStoryState state = UserStoryState.TODO;
  // Other properties...
  
  public UserStory(final String name, ...) {
    this.name = name;
    // ...
  }

  public void setState(
    final UserStoryState newState
  ) {
    state = newState;
  }
  
  public void render() {
    final var icon = switch(state) {
      case TODO -> new TodoIcon();
      case IN_DEVELOPMENT -> new InDevelopmentIcon(); 
      case IN_VERIFICATION -> new InVerificationIcon();
      case READY_FOR_REVIEW -> new ReadyForReviewIcon();
      case DONE -> new DoneIcon();
      default -> throw new IllegalArgumentException(...);
    };
    
    // Draw a UI elements on screen representing the user story
    // using the given 'icon'
  }
}
```
</div>

The above solution is not an object-oriented one. We should replace the conditionals (switch-case statement) with a polymorphic design.
This can be done by introducing state objects. In the state pattern, the state of an object is represented with an object instead of an enum value.
Below is the above code modified to use the state pattern:

<div class="sourceCodeWithoutLabel">

```
public interface UserStoryState {
  Icon getIcon();
}

public class TodoUserStoryState implements UserStoryState {
  public Icon getIcon() {
    return new TodoIcon();
  }
}

public class InDevelopmentUserStoryState
         implements UserStoryState {
  public Icon getIcon() {
    return new InDevelopmentIcon();
  }
}

public class InVerificationUserStoryState
         implements UserStoryState {
  public Icon getIcon() {
    return new InVerificationIcon();
  }
}

public class ReadyForReviewUserStoryState
         implements UserStoryState {
  public Icon getIcon() {
    return new ReadyForReviewIcon();
  }
}

public class DoneUserStoryState
         implements UserStoryState {
  public Icon getIcon() {
    return new DoneIcon();
  }
}

public class UserStory {
  private String name;
  private UserStoryState state = new TodoUserStoryState();
  // Other properties...
  
  public UserStory(final String name, ...) {
    this.name = name;
    // ...
  }

  public void setState(
    final UserStoryState newState
  ) {
    state = newState;
  }
  
  public void render() {
    final Icon icon = state.getIcon();
    // Draw a UI element on screen representing
    // the user story using the given 'icon' 
  }
}
```
</div>

Let's have another example with an `Order` class. An order can have a state, like paid, packaged, delivered, etc.
Below we implement the order states as classes:

<div class="sourceCodeWithoutLabel">

```
public interface OrderState {
  String getMessage(String orderId);
}

public class PaidOrderState implements OrderState {
  public String getMessage(final String orderId) {
    return "Order " + orderId + " is successfully paid";
  }
}

public class DeliveredOrderState implements OrderState {
  public String getMessage(final String orderId) {
    return "Order " + orderId + " is delivered";
  }
}

// Implement the rest of possible order states here...

public class Order {
  private String id;
  private OrderState state;
  private Customer customer;
  
  // ...
  
  public String getCustomerEmailAddress() {
    return customer.getEmailAddress();
  }

  public String getStateMessage() {
    return state.getMessage(id);
  }
}

emailService.sendEmail(order.getCustomerEmailAddress(),
                       order.getStateMessage());
```
</div>

#### Mediator Pattern

> The mediator pattern lets you reduce dependencies between objects. It restricts direct communication between
> two different layers of objects and forces them to collaborate only via a mediator object or objects.

The mediator pattern eliminates the coupling of two different layers of objects. So changes to one layer of objects can be
made without the need to change the objects in the other layer.

A typical example of the mediator pattern is Model-View-Controller (MVC) pattern. In the MVC pattern, model and view
objects do not communicate directly but only via mediator objects (controllers). Next, several different ways to use the MVC
pattern in frontend clients are presented. Traditionally MVC pattern was used in the backend when the backend also generated
the view to be shown in the client device (web browser). With the advent of single-page web clients, a modern backend is a simple API containing only a model and controller (MC).

![Fig 3.6 Model-View-Controller](images/03-06.png)

In the below picture, you can see how dependency inversion is used, and none of the implementation classes depend on concrete implementations.
You can easily change any implementation class to a different one without the need to modify any other implementation class. Notice how the `ControllerImpl` class uses the _bridge pattern_ and implements two bridges, one towards the model and the other towards the view.

![Fig 3.7 Dependencies in MVC pattern](images/04-06.png)

As shown in the below picture, the controller can also be used as a bridge-adapter: The controller can be modified to adapt to changes in the view layer (`View2` instead of `View`) without needing to change the model layer. The modified modules are shown with a gray background in the picture. Similarly, the controller can be modified to adapt to changes in the model layer without needing to change the view layer (not shown in the picture).

![Fig 3.8 Adapting to Changes in MVC pattern](images/04-07.png)

The following examples use a specialization of the MVC pattern called Model-View-Presenter (MVP). In the MVP pattern, the controller is
called the presenter. I use the more generic term _controller_ in all examples, though. A Presenter act as a middle-man
between a view and a model. A presenter-type controller object has a reference to a view object and a model object. A view object
commands the presenter to perform actions on the model. And the model object asks the presenter to update the view object.

In the past, making desktop UI applications using Java Swing as the UI layer was popular. Let's have
a simple todo application as an example:

First, we implement the `Todo` class, which is part of the model.

_Todo.java_
```
public class Todo {
  private int id;
  private String name;
  private boolean isDone;
  
  // Constructor...
  
  public int getId() {
    return id;
  }

  public void setId(final int id) {
    this.id = id;
  }
  
  public String getName() {
    return name;
  }

  public void setName(final String name) {
    this.name = name;
  }
  
  public boolean isDone() {
    return isDone;
  }

  public void setIsDone(final boolean isDone) {
    this.isDone = isDone;
  }
} 
```

Next, we implement the view layer:

_TodoView.java_
```
public interface TodoView {
  void show(List<Todo> todos);
  void show(String message);
}
```

_TodoViewImpl.java_
```
public class TodoViewImpl implements TodoView {
  private final TodoController controller;
  
  public TodoViewImpl(final TodoController controller) {
    this.controller = controller;
    controller.setView(this);
    controller.startFetchTodos();
  }
  
  public void show(final List<Todo> todos) {
    // Update the view to show the given todos
    // Add listener for each todo checkbox.
    // Listener should call: controller.toggleTodoDone(todo.id)
  }
  
  public void show(final String errorMessage) {
    // Update the view to show error message
  }
}
```

Then we implement a generic `Controller` class that acts as a base class for concrete controllers:

_Controller.java_
```
public class Controller<M, V> {
  private M model;
  private V view;

  public M getModel() {
    return model;
  }

  public void setModel(final M model) {
    this.model = model;
  }
  
  public V getView() {
    return view;
  }
  
  public void setView(final V view) {
    this.view = view;
  }
}
```

The below `TodoControllerImpl` class implements two actions, `startFetchTodos` and `toggleTodoDone`, which
delegate to the model layer. It also implements two actions, `updateViewWith(todos)` and `updateViewWith(errorMessage)`, that delegate to the view layer.
The latter two actions are executed in the Swing UI thread using `SwingUtilities.invokeLater`.

_TodoController.java_
```
public interface TodoController {
  void startFetchTodos();
  void toggleTodoDone(final int id);
  void updateViewWith(final List<Todo> todos);
  void updateViewWith(final String errorMessage);
}
```

_TodoControllerImpl.java_
```
public class TodoControllerImpl 
         extends Controller<TodoModel, TodoView>
         implements TodoController {
  
  public void startFetchTodos() {
    getModel().fetchTodos();
  }
  
  public void toggleTodoDone(final int id) {
    getModel().toggleTodoDone(id);
  }
  
  public void updateViewWith(final List<Todo> todos) {
    SwingUtilities.invokeLater(() ->
      getView().show(todos));
  }

  public void updateViewWith(final String errorMessage) {
    SwingUtilities.invokeLater(() ->
      getView().show(errorMessage));
  }
}
```

The below `TodoModelImpl` class implements the fetching of todos (`fetchTodos`) using the supplied `todoService`.
The `todoService` accesses the backend to read todos from a database, for example.
When todos are successfully fetched, the controller is told to update the view. If fetching
of the todos fails, the view is updated to show an error. Toggling a todo done is implemented
using the `todoService` and its `updateTodo` method.

_TodoService.java_
```
public interface TodoService {
  public List<Todo> getTodos();
  public void updateTodo(Todo todo);
}
```

_TodoModel.java_
```
public interface TodoModel {
  public void fetchTodos();
  public void toggleTodoDone(int id);
}
```

_TodoModelImpl.java_
```
public class TodoModelImpl implements TodoModel {
  private final TodoController controller;
  private final TodoService todoService;
  private List<Todo> todos = new ArrayList<>();

  public TodoModelImpl(
    final TodoController controller,
    final TodoService todoService
  ) {
    this.controller = controller;
    controller.setModel(this);
    this.todoService = todoService;
  }
  
  public void fetchTodos() {
    CompletableFuture
      .supplyAsync(todoService::getTodos)
      .thenAccept(todos -> {
        this.todos = todos;
        controller.updateViewWith(todos);
      })
      .exceptionally((error) -> {
        controller.updateViewWith(error.getMessage());
        return null;
      });
  }
  
  public void toggleTodoDone(final int id) {
    todos.stream()
      .filter(todo -> todo.getId() == id)
      .findAny()
      .ifPresent(todo -> {
          todo.setIsDone(!todo.isDone());
          
          CompletableFuture
            .runAsync(() ->
              todoService.updateTodo(todo))
            .exceptionally((error) -> {
              controller.updateViewWith(error.getMessage());
              return null;
            });
      });
  }
}
```

Let's have the same example using _Web Components_. The web component view should extend the `HTMLElement` class.
The `connectedCallback` method of the view will be called on the component mount. It starts fetching todos.
The `showTodos` method renders the given todos as HTML elements. It also adds event listeners for
the _Mark done_ buttons. The `showError` method updates the inner HTML of the view to show an error
message.

_Todo.ts_
```
export type Todo = {
  id: number;
  name: string;
  isDone: boolean;
};
```

_TodoView.ts_
```
interface TodoView {
  showTodos(todos: Todo[]): void;
  showError(errorMessage: string): void;
}
```

_TodoViewImpl.ts_
```
import controller from './todoController';
import { Todo } from './Todo';

export default class TodoViewImpl 
         extends HTMLElement implements TodoView {
  constructor() {
    super();
    controller.setView(this);
  }
  
  connectedCallback() {
    controller.startFetchTodos();
    this.innerHTML = '<div>Loading todos...</div>';
  }
  
  showTodos(todos: Todo[]) {
    const todoElements = todos.map(({ id, name, isDone }) => `
      <li id="todo-${id}">
        ${id}&nbsp;${name}&nbsp;
        ${isDone ? '' : '<button>Mark done</button>'}
      </li>
    `);
    
    this.innerHTML = `<ul>${todoElements}</ul>`;

    todos.map(({ id }) => this
      .querySelector(`#todo-${id} button`)?
      .addEventListener('click',
                        () => controller.toggleTodoDone(id)));
  }
  
  showError(errorMessage: string) {
    this.innerHTML = `
      <div>
        Failure: ${errorMessage}
      </div>
    `;
  }
}
```

We can use the same controller and model APIs for this web component example as in the Java Swing example. We just need to convert the Java code to TypeScript code:

_Controller.ts_
```
export default class Controller<M, V> {
  private model: M | undefined;
  private view: V | undefined;
 
  getModel(): M | undefined {
    return this.model;
  }
  
  setModel(model: M): void {
    this.model = model;
  }
  
  getView(): V | undefined {
    return this.view;
  }

  setView(view: V): void {
    this.view = view;
  }
}
```

_TodoController.ts_
```
import { Todo } from "./Todo";

export interface TodoController {
  startFetchTodos(): void;
  toggleTodoDone(id: number): void;
  updateViewWithTodos(todos: Todo[]): void;
  updateViewWithError(message: string): void;
}
```

_todoController.ts_
```
import TodoView from './TodoView';
import Controller from "./Controller";
import { TodoController } from './TodoController';
import { Todo } from "./Todo";
import TodoModel from './TodoModel';

class TodoControllerImpl 
         extends Controller<TodoModel, TodoView>
         implements TodoController {
  
  startFetchTodos(): void {
    this.getModel()?.fetchTodos();
  }

  toggleTodoDone(id: number): void {
    this.getModel()?.toggleTodoDone(id);
  }

  updateViewWithTodos(todos: Todo[]): void {
    this.getView()?.showTodos(todos);
  }

  updateViewWithError(message: string): void {
    this.getView()?.showError(message);
  }
}

const controller = new TodoControllerImpl();
export default controller;
```

_TodoService.ts_
```
export interface TodoService {
  getTodos(): Promise<Todo[]>;
  updateTodo(todo: Todo): Promise<void>;
}
```

_TodoModel.ts_
```
export interface TodoModel {  
  fetchTodos(): void;
  toggleTodoDone(id: number): void;
}
```

_TodoModelImpl.ts_
```
import controller, { TodoController } from './todoController';
import { TodoModel } from './TodoModel';
import { Todo } from "./Todo";

export default class TodoModelImpl implements TodoModel {
  private todos: Todo[] = [];

  constructor(
    private readonly controller: TodoController,
    private readonly todoService: TodoService
  ) {
    controller.setModel(this);
  }
  
  fetchTodos(): void {
    this.todoService.getTodos()
      .then((todos) => { 
        this.todos = todos;
        controller.updateViewWithTodos(todos);
      })
      .catch((error) =>
        controller.updateViewWithError(error.message));
  }
  
  toggleTodoDone(id: number): void {
    const foundTodo = this.todos.find(todo => todo.id === id);
      
    if (foundTodo) {
      foundTodo.isDone = !foundTodo.isDone;
      this.todoService
          .updateTodo(foundTodo)
          .catch((error: any) =>
            controller.updateViewWithError(error.message));
    }
  }
}
```

We could use the above-defined controller and model as such with a React view component:

_ReactTodoView.tsx_
```
// ...
import controller from './todoController';

// ...

export default class ReactTodoView 
        extends Component<Props, State>
        implements TodoView {

  constructor(props: Props) {
    super(props);
    controller.setView(this);
    
    this.state = {
      todos: []
    }
  }

  componentDidMount() {
    controller.startFetchTodos();
  }
  
  showTodos(todos: Todo[]) {
    this.setState({ ...this.state, todos });
  }
  
  showError(errorMessage: string) {
     this.setState({ ...this.state, errorMessage });
  }
  
  render() {
    // Render todos from 'this.state.todos' here
    // Or show 'this.state.errorMessage' here
  }
}
```

If you have multiple views using the same controller, you can derive your controller from the below-defined `MultiViewController` class:

_MultiViewController.ts_
```
export default class MultiViewController<M, V> {
  private model: M | undefined;
  private views: V[] = [];
 
  getModel(): M | undefined {
    return this.model;
  }
  
  setModel(model: M): void {
    this.model = model;
  }
  
  getViews(): V[]  {
    return this.views;
  }

  addView(view: V): void {
    this.views.push(view);
  }
}
```

Let's say we want to have two views for todos, one for the actual todos and one viewing the todo count.
We need to modify the controller slightly to support multiple views:

_todoController.ts_
```
import TodoView from './TodoView';
import MultiViewController from './MultiViewController';
import { Todo } from "./Todo";
import { TodoController } from './TodoController';
import TodoModel from './TodoModel';

class TodoControllerImpl 
         extends MultiViewController<TodoModel, TodoView>
         implement TodoController {
  startFetchTodos(): void {
    this.getModel()?.fetchTodos();
  }

  toggleTodoDone(id: number): void {
    this.getModel()?.toggleTodoDone(id);
  }

  updateViewsWithTodos(todos: Todo[]): void {
    this.getViews().forEach(view => view.showTodos(todos));
  }

  updateViewWithError(message: string): void {
    this.getViews().forEach(view => view.showError(message));
  }
}

const controller = new TodoController();
export default controller;
```

Many modern UI frameworks and state management libraries implement a specialization of the MVC pattern called,
Model-View-ViewModel (MVVM). In the MVVM pattern, the controller is called the view model. I use the more
generic term _controller_ in the below example, though. The main difference between the view model and the presenter
in the MVP pattern is that in the MVP pattern, the presenter has a reference to the view, but the view model does not.
The view model provides bindings between the view's events and actions in the model. This can happen so that the view model
adds action dispatcher functions as properties of the view. And in the other direction, the view model
maps the model's state to the properties of the view. When using React and Redux, for example, you can connect the view to the model
using the `mapDispatchToProps` function and connect the model to the view using the `mapStateToProps` function. These two mapping functions form the view model (or the controller) that binds the view and model together.

Let's first implement the todo example with React and Redux and later show how the React view can be replaced
with an Angular view without any modification to the controller or the model layer. Note that the code for some classes
is not listed below. You can assume those classes are the same as defined in _command/action pattern_ examples.

Let's implement a list view for todos:

_TodosListView.tsx_
```
import { connect } from 'react-redux';
import { useEffect } from "react";
import { controller, ActionDispatchers, State } 
  from './todosController';

type Props = ActionDispatchers & State;

function TodosListView({
  toggleTodoDone,
  startFetchTodos,
  todos
}: Props) {

  useEffect(() => {
    startFetchTodos();
  }, [startFetchTodos]);

  const todoElements = todos.map(({ id, name, isDone }) => (
    <li key={id}>
      {id}&nbsp;
      {name}&nbsp;
      {isDone
        ? undefined
        : <button onClick={() => toggleTodoDone(id)}>
            Mark done
          </button>
      }
    </li>
  ));

  return <ul>{todoElements}</ul>;
}

// Here we connect the view to the model using the controller
export default connect(
  controller.getState,
  () => controller.actionDispatchers
)(TodosListView);
```

Below is the base class for controllers:

_Controller.ts_
```
import AbstractAction from "./AbstractAction";

export type ReduxDispatch =
 (reduxActionObject: { type: AbstractAction<any> }) => void;

export default class Controller {
  protected readonly dispatch:
    (action: AbstractAction<any>) => void;

  constructor(reduxDispatch: ReduxDispatch) {
    this.dispatch = (action: AbstractAction<any>) =>
      reduxDispatch({ type: action });
  }
}
```

Below is the controller for todos:

_todosController.ts_
```
import store from './store';
import { AppState } from "./AppState";
import ToggleDoneTodoAction from "./ToggleDoneTodoAction";
import StartFetchTodosAction from "./StartFetchTodosAction";
import Controller from "./Controller";

class TodosController extends Controller {
  readonly actionDispatchers = {
    toggleTodoDone: (id: number) =>
      this.dispatch(new ToggleDoneTodoAction(id)),

    startFetchTodos: () =>
      this.dispatch(new StartFetchTodosAction())
  }
  
  getState(appState: AppState) {
    return {
      todos: appState.todosState.todos,
    }
  }
}

export const controller = new TodosController(store.dispatch);
export type State = ReturnType<typeof controller.getState>;
export type ActionDispatchers = typeof controller.actionDispatchers;
```

In the development phase, we can use the following temporary
implementation of the `StartFetchTodosAction` class:

_StartFetchTodosAction.ts_
```
import { TodoState } from "./TodoState";
import AbstractTodoAction from "./AbstractTodoAction";

export default class StartFetchTodosAction extends
                       AbstractTodoAction {
  perform(state: TodoState): TodoState {
    return {
      todos: [
        {
          id: 1,
          name: "Todo 1",
          isDone: false,
        },
        {
          id: 2,
          name: "Todo 2",
          isDone: false,
        },
      ],
    };
  }
}
```

Now we can introduce a new view for todos, a `TodosTableView` which can utilize the same controller as the
`TodosListView`.

_TodosTableView.tsx_
```
import { connect } from 'react-redux';
import { useEffect } from "react";
import { controller, ActionDispatchers, State }
  from './todosController';

type Props = ActionDispatchers & State;

function TodosListView({
  toggleTodoDone,
  startFetchTodos,
  todos
}: Props) {
  useEffect(() => {
    startFetchTodos();
  }, [startFetchTodos]);

  const todoElements = todos.map(({ id, isDone, name }) => (
    <tr key={id}>
      <td>{id}</td>
      <td>{name}</td>
        <td>
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => toggleTodoDone(id)}
          />
        </td>
    </tr>
  ));

  return <table><tbody>{todoElements}</tbody></table>;
}

export default connect(
  controller.getState,
  () => controller.actionDispatchers
)(TodosListView);
```

We can notice some duplication in the `TodosListView` and `TodosTableView` components.
For example, both are using the same effect. We can create a `TodosView` for which we can give
as parameter the type of a single todo view, either a list item or a table row view:

_TodosView.tsx_
```
import { useEffect } from "react";
import { connect } from "react-redux";
import ListItemTodoView from './ListItemTodoView';
import TableRowTodoView from './TableRowTodoView';
import { controller, ActionDispatchers, State }
  from './todosController';

type Props = ActionDispatchers & State & {
    TodoView: typeof ListItemTodoView | typeof TableRowTodoView;
};

function TodosView({
  toggleTodoDone,
  startFetchTodos,
  todos,
  TodoView
}: Props) {
  useEffect(() => {
    startFetchTodos()
  }, [startFetchTodos]);

  const todoViews = todos.map((todo) =>
    <TodoView 
      key={todo.id}
      todo={todo}
      toggleTodoDone={toggleTodoDone} 
    />
  );

  return TodoView === ListItemTodoView
      ? <ul>{todoViews}</ul>
      : <table><tbody>{todoViews}</tbody></table>;
}

export default connect(
  controller.getState,
  () => controller.actionDispatchers
)(TodosView);
```

Below is the view for showing a single todo as a list item:

_TodoViewProps.ts_
```
import { Todo } from "./Todo";

export type TodoViewProps = {
  toggleTodoDone: (id: number) => void,
  todo: Todo
}
```

_ListItemTodoView.tsx_
```
import { TodoViewProps } from './TodoViewProps';

export default function ListItemTodoView({
  toggleTodoDone,
  todo: { id, name, isDone } 
}: TodoViewProps) {
  return (
    <li>
      {id}&nbsp;
      {name}&nbsp;
      { isDone ?
        undefined :
        <button onClick={() => toggleTodoDone(id)}>
          Mark done
        </button> }
    </li>
  );
}
```

Below is the view for showing a single todo as a table row:

_TableRowTodoView.tsx_
```
import { TodoViewProps } from './TodoViewProps';

export default function TableRowTodoView({
  toggleTodoDone,
  todo: { id, name, isDone } 
}: TodoViewProps) {
  return (
    <tr>
      <td>{id}</td>
      <td>{name}</td>
      <td>
        <input 
          type="checkbox"
          checked={isDone}
          onChange={() => toggleTodoDone(id)}
        />
      </td>
    </tr>);
}
```

![Figure 3.9 Frontend MVC Architecture with Redux](images/03-07.png)

![Figure 3.10 Frontend MVC Architecture with Redux + Backend](images/03-08.png)

In most cases, you should not store state in a view even if the state is for that particular view only. Instead, when you store it in the model, it brings
the following benefits:

- Possibility to easily persist state either in the browser or in the backend
- Possibility to easily implement undo-actions
- State can be easily shared with another view(s) later if needed
- Migrating views to use a different view technology is more straightforward
- Easier debugging of state-related problems, e.g., using the Redux DevTools browser extension

We can also change the view implementation from React to Angular without modifying the controller
or model layer. This can be done, for example, using the _@angular-redux2/store_ library.
Below is a todos table view implemented as an Angular component:

_todos-table-view.component.ts_
```
import { Component, OnInit } from "@angular/core";
import { NgRedux, Select } from '@angular-redux2/store';
import { Observable } from "rxjs";
import { controller } from './todosController';
import { TodoState } from "./TodoState";
import { AppState } from "./AppState";

const { startFetchTodos,
        toggleTodoDone } = controller.actionDispatchers;

@Component({
  selector: 'todos-table-view',
  template: `
    <table>
      <tr *ngFor="let todo of (todoState | async)?.todos">
        <td>{{ todo.id }}</td>
        <td>{{ todo.name }}</td>
        <td>
          <input
            type="checkbox"
            [checked]="todo.isDone"
            (change)="toggleTodoDone(todo.id)"
          />
        </td>
      </tr>
    </table>
  `
})
export class TodosTableView implements OnInit {
  @Select(controller.getState) todoState: Observable<TodoState>;

  constructor(private ngRedux: NgRedux<AppState>) {}

  ngOnInit(): void {
    startFetchTodos();
  }

  toggleTodoDone(id: number) {
    toggleTodoDone(id);
  }
}
```

_app.component.ts_
```
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <todos-table-view></todos-table-view>
  </div>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-test';
}
```

_app.module.ts_
```
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgReduxModule, NgRedux } from '@angular-redux2/store';

import { AppComponent } from './app.component';
import store from './store';
import { AppState } from "./AppState";
import { TodosTableView } from "./todos-table-view.component";

@NgModule({
  declarations: [
    AppComponent, TodosTableView
  ],
  imports: [
    BrowserModule,
    NgReduxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(ngRedux: NgRedux<AppState>) {
    ngRedux.provideStore(store);
  }
}
```

#### Template Method Pattern

> Template method pattern allows you to define a _template method_ in a base class, and subclasses define the final implementation of that method. The template method contains one or more calls to abstract methods implemented in the subclasses.

In the below example, the `AbstractDrawing` class contains a template method, `draw`. This method includes a call to the `getShapeRenderer` method,
an abstract method implemented in the subclasses of the `AbstractDrawing` class. The `draw` method is a template method, and a subclass defines how to draw a single shape.

<div class="sourceCodeWithoutLabel">

```
public interface Drawing {
  ShapeRenderer getShapeRenderer();
  void draw();
}

public abstract class AbstractDrawing implements Drawing {
  private final List<Shape> shapes;
  
  public AbstractDrawing(final List<Shape> shapes) {
    this.shapes = shapes;
  }

  public final void draw() {
    for (final Shape shape: shapes) {
      shape.render(getShapeRenderer());
    }
  }
  
  protected abstract ShapeRenderer getShapeRenderer();
}
```
</div>

We can now implement two subclasses of the `AbstractDrawing` class, which define the final behavior of
the templated `draw` method. We mark the template method `draw` as `final` because subclasses should not override it. It is best practice to declare a template method as final. They
should only provide an implementation for the abstract `getShapeRenderer` method.

<div class="sourceCodeWithoutLabel">

```
public class RasterDrawing extends AbstractDrawing {
  private final Canvas canvas = new Canvas();
  
  private final ShapeRenderer shapeRenderer =
    new RasterShapeRenderer(canvas);

  public RasterDrawing(final List<Shape> shapes) {
    super(shapes);
  }

  protected ShapeRenderer getShapeRenderer() {
    return shapeRenderer;
  }
}

public class VectorDrawing extends AbstractDrawing {
  private final SVGElement svgRoot = new SVGElement();
  
  private final ShapeRenderer shapeRenderer =
    new VectorShapeRenderer(svgRoot);

  public VectorDrawing(final List<Shape> shapes) {
    super(shapes);
  }

  protected ShapeRenderer getShapeRenderer() {
    return shapeRenderer;
  }
}
```

</div>

#### Memento Pattern

> The memento pattern can be used to save the internal state of an object to another object called the _memento_ object.

Let's have an example with a `TextEditor` class. First, we define a `TextEditorState` interface and its implementation.
Then we define a `TextEditorStateMemento` class for storing a memento of the text editor's state.

<div class="sourceCodeWithoutLabel">

```
public interface TextEditorState {
  TextEditorState clone();
}

public class TextEditorStateImpl implements TextEditorState {
  // Implement text editor state here
}

public class TextEditorStateMemento {
  private final TextEditorState state;

  public TextEditorStateMemento(final TextEditorState state) {
    this.state = state.clone();
  }
  
  public TextEditorState getState() {
    return state;
  }
}
```
</div>

The `TextEditor` class stores mementos of the text editor's state. It provides methods
to save a state, restore a state, or restore the previous state:

_TextEditor.java_
```
class TextEditor {
  private final List<TextEditorStateMemento> stateMementos =
    new ArrayList<>(20);
    
  private TextEditorState currentState;
  private int currentVersion = 1;

  public void saveState() {
    stateMementos.add(new TextEditorStateMemento(currentState));
    currentVersion += 1;
  }

  public void restoreState(final int version) {
    if (version >= 1 && version <= stateMementos.size()) {
      currentState = stateMementos.get(version - 1).getState();
      currentVersion += 1;
    }
  }

  public void restorePreviousState() {
    if (currentVersion > 1) {
      restoreState(currentVersion - 1);
    }
  }
}
```

In the above example, we can add a memento
for the text editor's state by calling the `saveState` method. We can recall the previous version
of the text editor's state with the `restorePreviousState` method, and we can recall any version of the text editor's state
using the `restoreState` method.

#### Visitor Pattern

> Visitor pattern allows adding functionality to a class (like adding new methods) without modifying the class. This is useful, for example, with library classes that you cannot modify.

First, let's have an example with classes that we can modify:

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
  void draw();
}

public class CircleShape implements Shape {
  private final int radius;

  // ...

  public void draw() {
    // ...
  }
  
  public int getRadius() {
    return radius;
  }
}

public class RectangleShape implements Shape {
  private final int width;
  private final int height;

  // ...
  
  public void draw() {
    // ...
  }
  
  public int getWidth() {
    return width;
  }
  
  public int getHeight() {
    return height;
  }
}
```
</div>

Let's assume we need to calculate the total area of shapes in a drawing. Currently, we are in a situation where
we can modify the shape classes, so let's add `calculateArea` methods to the classes:

<div class="sourceCodeWithoutLabel">

```
public interface Shape {
  // ...
  
  double calculateArea();
}

public class CircleShape implements Shape {
  // ...
  
  public double calculateArea() {
    return Math.PI * radius * radius;
  }
}

class RectangleShape implements Shape {
  // ...
  
  public double calculateArea() {
    return width * height;
  }
}
```
</div>

Adding a new method to an existing class may be against the _open-closed principle_.
In the above case, adding the `calculateArea` methods
is safe because the shape classes are immutable. And even if they were not, adding the `calculateArea` methods would be safe because
they are read-only methods, i.e., they don't modify the object's state, and we don't have to worry about thread safety because
we can agree that our example application is not multithreaded.

Now we have the area calculation methods added, and we can use a common algorithm to calculate the total area of shapes
in a drawing:

<div class="sourceCodeWithoutLabel">

```
final var totalAreaOfShapes = drawing
  .getShapes()
  .stream()
  .reduce(0.0, (subTotalArea, shape) ->
     subTotalArea + shape.calculateArea(), Double::sum);
```
</div>

But what if the shape classes, without the area calculation capability, were in a 3rd party library that we cannot modify?
We would have to do something like this:

<div class="sourceCodeWithoutLabel">

```
final var totalAreaOfShapes = drawing
  .getShapes()
  .stream()
  .reduce(0.0, (subTotalArea, shape) -> {
    double shapeArea;
    
    if (shape instanceof CircleShape) {
      shapeArea = Math.PI *
                  Math.pow(((CircleShape)shape).getRadius(), 2);
    } else if (shape instanceof RectangleShape){
      shapeArea = ((RectangleShape)shape).getWidth() *
                  ((RectangleShape)shape).getHeight();
    }
    else {
      throw new IllegalArgumentException("Invalid shape");
    }
    
    return subTotalArea + shapeArea;
  }, Double::sum);
```
</div>

The above solution is complicated and needs updating every time a new type of shape is introduced.
The above example does not follow object-oriented design principles: it contains an if/else-if structure with `instanceof` checks.

We can use the visitor pattern to replace the above conditionals with polymorphism. First, we introduce a visitor interface that can be used to provide
additional behavior to the shape classes. Then we introduce an `execute` method in the `Shape` interface. And in the shape classes, we implement the `execute` methods so that additional
behavior provided by a concrete visitor can be executed:

<div class="sourceCodeWithoutLabel">

```
// This is our visitor interface that
// provides additional behaviour to the shape classes
public interface ShapeBehavior {
  Object executeForCircle(final CircleShape circle);
  Object executeForRectangle(final RectangleShape rectangle);
  
  // Add methods for possible other shape classes here...
}

public interface Shape {
  // ...

  Object execute(final ShapeBehavior behavior);
}

public class CircleShape implements Shape {
  public Object execute(final ShapeBehavior behavior) {
    return behavior.executeForCircle(this);
  }
}

public class RectangleShape implements Shape {
  public Object execute(final ShapeBehavior behavior) {
    return behavior.executeForRectangle(this);
  }
}
```

</div>

Suppose that the shape classes were mutable and made thread-safe. We would have to define the `execute` methods with appropriate
synchronization to make them also thread-safe:

<div class="sourceCodeWithoutLabel">

```
public class CircleShape implements Shape {
  public synchronized Object execute(
    final ShapeBehavior behavior
  ) {
    return behavior.executeForCircle(this);
  }
}

public class RectangleShape implements Shape {
  public synchronized Object execute(
    final ShapeBehavior behavior
  ) {
    return behavior.executeForRectangle(this);
  }
}
```

</div>

Let's implement a concrete visitor for calculating areas of different shapes:

<div class="sourceCodeWithoutLabel">

```
public class AreaCalculationShapeBehavior implements
               ShapeBehavior {
  public Object executeForCircle(final CircleShape circle) {
    return (Double)(Math.PI *
                    Math.pow(circle.getRadius(), 2));
  }

  public Object executeForRectangle(
    final RectangleShape rectangle
  ) {
    return (Double)(double)(rectangle.getWidth() *
                            rectangle.getHeight());
  }
}
```
</div>

Now we can implement the calculation of shapes' total area using a common algorithm, and we get rid of the
conditionals. We execute the `areaCalculation` behavior for each shape and convert the result of behavior execution
to `Double`. Methods in a visitor usually return some common type like `Object`. This enables various
operations to be performed. After executing a visitor, the return value should be cast to the right type.

<div class="sourceCodeWithoutLabel">

```
final var areaCalculation = new AreaCalculationShapeBehavior();

final var totalAreaOfShapes = drawing
  .getShapes()
  .stream()
  .reduce(0.0, (subTotalArea, shape) ->
    subTotalArea + (Double)shape.execute(areaCalculation),
      Double::sum);
```
</div>

You can add more behavior to the shape classes by defining a new visitor. Let's define a
`PerimeterCalculationShapeBehaviour` class:

<div class="sourceCodeWithoutLabel">

```
public class PerimeterCalculationShapeBehavior 
               implements ShapeBehavior {
  public Object executeForCircle(final CircleShape circle) {
    return (Double)(2 * Math.PI * circle.getRadius());
  }

  public Object executeForRectangle(
    final RectangleShape rectangle
  ) {
    return (Double)(double)(2 * rectangle.getWidth() +
                            2 * rectangle.getHeight());
  }
}
```
</div>

Notice that we did not need to use the _visitor_ term in our code examples. Adding the design pattern name to the names of
software entities (class/function names, etc.) often does not bring any real benefit but makes the names longer. However, there are some design patterns,
like the _factory pattern_ and _builder pattern_ where you always use the design pattern name in a class name.

If you develop a third-party library and would like the behavior of its classes to be extended by its users, you should
make your library classes accept visitors that can perform additional behavior.

#### Null Object Pattern

> A null object is an object that does nothing.

Use the null object pattern to implement a class for null objects that don't do anything. A null object can be used in place of a real object that
does something.

Let's have an example with a `Shape` interface:

_Shape.java_
```
public interface Shape {
  void draw();
}
```

We can easily define a class for null shape objects:

_NullShape.java_
```
public class NullShape implements Shape {
  void draw() {
    // Intentionally no operation
  }
}
```

We can use an instance of the `NullShape` class everywhere where a concrete implementation of the `Shape` interface is wanted.

## Don't Ask, Tell Principle

> Don't ask, tell principle defines that in your object, you should _tell_ another object what to do, and not ask about
> the other object's state and then do the work by yourself in your object.

If your object asks many things from another object using, e.g., multiple getters, you might be guilty of the _feature envy_ design smell.
Your object is envious of a feature that the other object should have.

Let's have an example and define a cube shape class:

<div class="sourceCodeWithoutLabel">

```
public interface ThreeDShape {
  // ...
}

public class Cube3DShape implements ThreeDShape {
  private final int width;
  private final int height;
  private final int depth;
  
  // Constructor...
  
  public int getWidth() {
    return width;
  }

  public int getHeight() {
    return height;    
  }

  public int getDepth() {
    return depth;
  }
}
```
</div>

Next, we define another class, `CubeUtils,` that contains a method for calculating the total volume of cubes:

<div class="sourceCodeWithoutLabel">

```
public class CubeUtils {
  public int calculateTotalVolume(
    final List<Cube3DShape> cubes
  ) {
    int totalVolume = 0;
    
    for (final Cube3DShape cube : cubes) {
      final var width = cube.getWidth();
      final var height = cube.getHeight();
      final var depth = cube.getDepth();
      totalVolume += width * height * depth;
    }
    
    return totalVolume;
  }
}
```
</div>

In the `calculateTotalVolume` method, we ask three times about a cube object's state. This is
against the _don't ask, tell principle_. Our method is envious of the volume calculation feature
and wants to do it by itself rather than telling a `Cube3DShape` object to calculate its volume.

Let's correct the above code so that it follows the _don't ask, tell principle_:

<div class="sourceCodeWithoutLabel">

```
public interface ThreeDShape {
  int calculateVolume();    
}

public class Cube3DShape implements ThreeDShape {
  private final int width;
  private final int height;
  private final int depth;
  
  // Constructor
  
  public int calculateVolume() {
    return height * width * depth;
  }
}

public class ThreeDShapeUtils {
  public int calculateTotalVolume(
    final List<ThreeDShape> threeDShapes
  ) {
    int totalVolume = 0;

    for (final var threeDShape : threeDShapes) {
      totalVolume += threeDShape.calculateVolume();
    }

    return totalVolume;
  }
}
```
</div>

Now our `calculateTotalVolume` method is not asking anything about a cube object. It just tells a cube object
to calculate its volume. We also removed the _asking_ methods (getters) from the `Cube3DShape` class because
they are no longer needed.

Below is another example of asking instead of telling:

<div class="sourceCodeWithoutLabel">

```
using namespace std::chrono_literals;
using std::chrono::system_clock;

void AnomalyDetectionEngine::runEngine()
{
  while (m_isRunning)
  {
    const auto now = system_clock::now();
    
    if (m_anomalyDetector->shouldDetectAnomalies(now)) 
    {
      const auto anomalies = m_anomalyDetector->detectAnomalies();
      // Do something with the detected anomalies
    }
    
    std::this_thread::sleep_for(1s);
  }
}
```
</div>

In the above example, we ask the anomaly detector if we should detect anomalies now. Then, depending
on the result, we call another method on the anomaly detector to detect anomalies. This could be simplified by making the `detectAnomalies` method to check if anomalies should be detected using the `shouldDetectAnomalies` method. Then the `shouldDetectAnomalies` method can be made private, and we can simplify the above code as follows:

<div class="sourceCodeWithoutLabel">

```
using namespace std::chrono_literals;

void AnomalyDetectionEngine::runEngine()
{
  while (m_isRunning)
  {
    const auto anomalies = m_anomalyDetector->detectAnomalies();
    // Do something with the detected anomalies
    std::this_thread::sleep_for(1s);
  }
}
```
</div>

## Law of Demeter

> A method on an object received from another object's method call should not be called.

The below statements are considered to break the law:

<div class="sourceCodeWithoutLabel">

```
user.getAccount().getBalance();
user.getAccount().withdraw(...);  
```

</div>

The above statements can be corrected either by moving functionality to a different class or by making
the second object to act as a facade between the first and the third object.

Below is an example of the latter solution, where we introduce two new methods in the `User` class and remove the
`getAccount` method:

<div class="sourceCodeWithoutLabel">

```
user.getAccountBalance();
user.withdrawFromAccount(...);
```

</div>

In the above example, the `User` class is a facade in front of the `Account` class that we should not
access directly from our object.

However, you should always check if the first solution alternative could be used instead. It makes the
code more object-oriented and does not require creating additional methods.

Below is a Java example that uses `User` and `SalesItem` entities and is not obeying the law of Demeter:

<div class="sourceCodeWithoutLabel">

```
void purchase(final User user, final SalesItem salesItem) {
  final var account = user.getAccount();
  
  // Breaks the law
  final var accountBalance = account.getBalance(); 
  
  final var salesItemPrice = salesItem.getPrice();
  
  if (accountBalance >= salesItemPrice) {
    account.withdraw(salesItemPrice); // Breaks the law
  }

  // ...
}
```

</div>

We can resolve the problem in the above example by moving the `purchase` method
to the correct class, in this case, the `User` class:

<div class="sourceCodeWithoutLabel">

```
class User {
  private Account account;

  // ...

  void purchase(final SalesItem salesItem) {
    final var accountBalance = account.getBalance(); 
    final var salesItemPrice = salesItem.getPrice();
    
    if (accountBalance >= salesItemPrice) {
      account.withdraw(salesItemPrice);
    }

    // ...
  }
}
```

</div>

## Avoid Primitive Type Obsession Principle

> Avoid primitive type obsession by defining semantic types for function parameters and function return value.

Many of us have experienced situations where we have supplied arguments to a function in the wrong order.
This is easy if the function, for example, takes two integer parameters, but you accidentally give those two integer parameters
in the wrong order. You don't get a compilation error.

Another problem with primitive types as function arguments is that the argument values are not necessarily validated.
You have to implement the validation logic in your function.

Suppose you accept an integer parameter for a port number in a function.
In that case, you might get any integer value as the parameter value,
even though the valid port numbers are from 1 to 65535. Suppose you also had other functions in the same codebase
accepting a port number as a parameter. In that case, you could end up doing the same validation logic in multiple places and have
thus duplicate code in your codebase.

Let's have a simple example of using this principle:

_RectangleShape.java_
```
public class RectangleShape implements Shape {
  private int width;
  private int height;
  
  public RectangleShape(final int width, final int height) {
    this.width = width;
    this.height = height;
  }
}
```

In the above example, the constructor has two parameters with the same primitive type (int). It is possible
to give `width` and `height` in the wrong order. But if we refactor the code to use objects instead of primitive
values, we can make the likelihood of giving the arguments in the wrong order much smaller:

<div class="sourceCodeWithoutLabel">

```
public class Value<T> {
  private final T value;
  
  public Value(final T value) {
    this.value = checkNotNull(value);
  }
  
  T get() {
    return value;
  }
}

public class Width extends Value<Integer> {
  public Width(final int width) {
    super(width);
  }
}

public class Height extends Value<Integer> {
  public Height(final int height) {
    super(height);
  }
}

public class RectangleShape implements Shape {
  private final int width;
  private final int height;
  
  public RectangleShape(final Width width, final Height height) {
    this.width = width.get();
    this.height = height.get();
  }
}

final var width = new Width(20);
final var height = new Height(50);

// OK
final Shape rectangle = new RectangleShape(width, height);

// Does not compile, parameters are in wrong order
final Shape rectangle2 = new RectangleShape(height, width);

// Does not compile, first parameter is not a width
final Shape rectangle3 = new RectangleShape(height, height);

// Does not compile, second parameter is not a height
final Shape rectangle4 = new RectangleShape(width, width);

// Does not compile, Width and Height objects must be used
// instead of primitive types
final Shape rectangle5 = new RectangleShape(20, 50); 
```
</div>

In the above example, `Width` and `Height` are simple data classes. They don't contain any behavior. You
can use concrete data classes as function parameter types. There is no need to create an interface for a data class. So, the _program against interfaces_ principle does not apply here.

Let's have another simple example where we have the following function signature:

<div class="sourceCodeWithoutLabel">

```
public void doSomething(final String namespacedName, ...) {
  // ...
}
```
</div>

The above function signature allows function callers to supply a non-namespaced name accidentally.
By using a custom type for the namespaced name, we can formulate the above function signature to the following:

<div class="sourceCodeWithoutLabel">

```
public class NamespacedName {
  private final String namespacedName;

  public NamespacedName(
    final String namespace,
    final String name
  ) {
    this.namespacedName = namespace.isEmpty() 
                            ? name 
                            : (namespace + '.' + name);
  }

  public String get() {
    return this.namespacedName;
  }
}

public void doSomething(final NamespacedName namespacedName, ...) {
  // ...
}
```
</div>

Let's have a more comprehensive example with an `HttpUrl` class. The class constructor has several parameters
that should be validated upon creating an HTTP URL:

_HttpUrl.java_
```
public class HttpUrl {
  private final String httpUrl;
  
  public HttpUrl(
    final String scheme,
    final String host,
    final int port,
    final String path,
    final String query
  ) {
    httpUrl = scheme + 
              "://" +
              host +
              ":" +
              port +
              path +
              "?" +
              query;
  }
}
```

Let's introduce an abstract class for validated values:

_AbstractValidatedValue.java_
```
public abstract class AbstractValidatedValue<T> {
  protected final T value;

  public AbstractValidatedValue(final T value) {
    this.value = checkNotNull(value);
  }
  
  abstract boolean valueIsValid();

  Optional<T> get() {
    return valueIsValid() 
             ? Optional.of(value) 
             : Optional.empty();
  }
  
  T tryGet() {
    if (valueIsValid()) {
      return value;
    } else {
      throw new ValidatedValueGetError(...);
    }
  }
}
```

Let's create a class for validated HTTP scheme objects:

_HttpScheme.java_
```
public class HttpScheme extends AbstractValidatedValue<String> {
  public HttpScheme(final String value) {
    super(value);
  }

  public boolean valueIsValid() {
    // Because the AbstractValidatedValue<String> is immutable,
    // if you had complex validation logic, you could cache
    // the validation result and store it to a class attribute.
    
    return "https".equalsIgnoreCase(value) ||
           "http".equalsIgnoreCase(value);
  }
}
```

Let's create a `Port` class (and similar classes for the host, path, and query should be created):

<div class="sourceCodeWithoutLabel">

```
public class Port extends AbstractValidatedValue<Integer> {
  public Port(final Integer value) {
    super(value);
  }

  public boolean valueIsValid() {
    return value >= 1 && value <= 65535;
  }
}

// public class Host ...
// public class Path ...
// public class Query ...
```
</div>

Let's create a utility class, `OptionalUtils`, with a method for mapping a result for five optional values:

<div class="sourceCodeWithoutLabel">

```
@FunctionalInterface
public interface Mapper<T, U, V, X, Y, R> {
  R map(T value,
        U value2,
        V value3,
        X value4,
        Y value5);  
}

public final class OptionalUtils {
  public static <T, U, V, X, Y, R> Optional<R>
    mapAll(
      final Optional<T> opt1,
      final Optional<U> opt2,
      final Optional<V> opt3,
      final Optional<X> opt4,
      final Optional<Y> opt5,
      final Mapper<T, U, V, X, Y, R> mapper
  ) {
    if (opt1.isPresent() && 
        opt2.isPresent() &&
        opt3.isPresent() &&
        opt4.isPresent() &&
        opt5.isPresent()
    ) {
      return Optional.of(mapper.map(opt1.get(),
                                    opt2.get(),
                                    opt3.get(),
                                    opt4.get(),
                                    opt5.get()));
    } else {
      return Optional.empty();
    }
  } 
}
```
</div>

Next, we can reimplement the `HttpUrl` class to contain two alternative factory methods for creating an HTTP URL:

_HttpUrl.java_
```
public class HttpUrl {
  private final String httpUrl;
  
  // Constructor is private because factory methods
  // should be used to create instances of this class
  private HttpUrl(final String httpUrl) {
    this.httpUrl = httpUrl;
  }
  
  // Factory method that returns an optional HttpUrl
  public static Optional<HttpUrl> create(
    final HttpScheme scheme,
    final Host host,
    final Port port,
    final Path path,
    final Query query
  ) {
    return OptionalUtils.mapAll(scheme.get(),
                                host.get(),
                                port.get(),
                                path.get(),
                                query.get(),
            (schemeValue,
             hostValue,
             portValue,
             pathValue,
             queryValue) ->
                    new HttpUrl(schemeValue +
                                "://" + 
                                hostValue + 
                                ":" + 
                                portValue +
                                pathValue + 
                                "?" + 
                                queryValue));
  }

  // Factory method that returns a valid HttpUrl or
  // throws an error
  public static HttpUrl tryCreate(
    final HttpScheme scheme,
    final Host host,
    final Port port,
    final Path path,
    final Query query
  ) {
    try {
      return new HttpUrl(scheme.tryGet() +
                          "://" +
                          host.tryGet() +
                          ":" + 
                          port.tryGet() +
                          path.tryGet() +
                          "?" +
                          query.tryGet());
    } catch (final ValidatedValueGetError error) {
      throw new HttpUrlCreateError(error);
    }
  }
}
```

Notice how we did not hardcode the URL validation inside the `HttpUrl` class, but we created
small validated value classes: `HttpScheme`, `Host`, `Port`, `Path`, and `Query`. These classes can be further utilized
in other parts of the codebase if needed and can even be put into a common validation library for broader usage.

For TypeScript, I have created a library called _validated-types_ for easily creating and using semantically validated types.
The library is available at [https://github.com/pksilen/validated-types](https://github.com/pksilen/validated-types).
The library's idea is to validate data when the data is received from the input. You can then pass already
validated, strongly typed data to the rest of the functions in your software component.

An application typically receives unvalidated input data from external sources in the following ways:

- Reading command line arguments
- Reading environment variables
- Reading standard input
- Reading files from the file system
- Reading data from a socket (network input)
- Receiving input from a user interface (UI)

Below is an example of using the _validated-types_ library to create a validated integer type that allows values between 1 and 10.
The `VInt` generic type takes a type argument of string type, which defines the allowed value range in the following format:
`<min-value>,<max-value>`

<div class="sourceCodeWithoutLabel">

```
import { VInt } from 'validated-types';

function useInt(int: VInt<'1,10'>) {
  // The wrapped integer value can be accessed
  // through the 'value' property 
  console.log(int.value);
}

const int: VInt<'1,10'> = VInt.tryCreate('1,10', 5);
useInt(int); // prints to console: 5

// Returns null, because 12 is not between 1 and 10
const maybeInt: VInt<'1,10'> | null = VInt.create('1,10', 12); 

// Prints to console: 10
useInt(maybeInt ?? VInt.tryCreate('1,10', 10));

// Throws, because 500 is not between 1 and 10
const int2: VInt<'1,10'> = VInt.tryCreate('1,10', 500); 
```
</div>

The below example defines a `Url` type which contains six validations that validate a string matching the following criteria:

- is at least one character long
- is at most 1024 characters long
- is a lowercase string
- is a valid URL
- URL starts with 'https'
- URL ends with '.html'

<code>

```
import { SpecOf, VString } from 'validated-types';

// First element in the VString type parameter array validates
// a lowercase string between 1-1024 characters long

// Second element in the VString type parameter array validates
// an URL

// Third element in the VString type parameter array validates
// a string that starts with "https"

// Fourth element in the VString type parameter array validates
// a string that ends with ".html"

type Url = VString<['1,1024,lowercase',
                    'url',
                    'startsWith,https',
                    'endsWith,.html']>;
                    
const urlVSpec: VSpecOf<Url> = ['1,1024,lowercase',
                                'url',
                                'startsWith,https',
                                'endsWith,.html'];

function useUrl(url: Url) {
  console.log(url.value);
}

const url: Url = VString.tryCreate(
  urlVSpec,
  'https://server.domain.com:8080/index.html'
);

// Prints to console: https://server.domain.com:8080/index.html
useUrl(url); 
                 
// 'maybeUrl' will be null
const maybeUrl: Url | null = VString.create(urlVSpec,
                                            'invalid URL'); 

const defaultUrl: Url = VString.tryCreate(
  urlVSpec,
  'https://default.domain.com:8080/index.html'
);

// Prints to console: https://default.domain.com:8080/index.html                 
useUrl(maybeUrl ?? defaultUrl); 
```

</code>

If you don't need validation but would like to create a semantic type, you can
use the `SemType` class from the _validated-types_ library:

<code>

```
import { SemType } from 'validated-types';

// Defines a semantic boolean type with name 'isRecursiveCall'
type IsRecursiveCall = SemType<boolean, 'isRecursiveCall'>

// Defines a semantic boolean type with name 'isInternalCall'
type IsInternalCall = SemType<boolean, 'isInternalCall'>;

function myFunc(isRecursiveCall: IsRecursiveCall,
                isInternalCall: IsInternalCall) {
  // The value of a semantic type variable
  // can be obtained from the 'value' property
  console.log(isRecursiveCall.value);
  console.log(isInternalCall.value);
}

const isRecursiveCall = false;
const isInternalCall = true;

// This will succeed
myFunc(new SemType({ isRecursiveCall }),
       new SemType({ isInternalCall }));

// All the below myFunc calls will fail during 
// the compilation
myFunc(new SemType({ isInternalCall }),
       new SemType({ isRecursiveCall }));
       
myFunc(true, true);

myFunc(new SemType('isSomethingElse', true),
       new SemType('isInternalCall', true));
       
myFunc(new SemType('isRecursiveCall', false),
       new SemType('isSomethingElse', true));
       
myFunc(new SemType('isSomethingElse', true),
       new SemType('isSomethingElse', true));
```
</code>
 
## Dependency Injection (DI) Principle

> Dependency injection (DI) allows changing the behavior of an application based on static or dynamic configuration. When using dependency injection, the dependencies are injected only upon the application startup. The application can first read its configuration and then decide what objects are created for the application. In many languages, dependency injection is crucial for unit tests also. When executing a unit test using DI, you can inject mock dependencies into the tested code instead of using the standard dependencies of the application.

Below is a C++ example of using the singleton pattern without dependency injection:

_main.cpp_
```
int main()
{
  Logger::initialize("Exporter");

  Logger::writeLogEntry(LogLevel::Info,
                        std::source_location::current(),
                        "Starting application");
  
  // ...
}
```

A developer must remember to call the `initialize` method before calling any other method on the `Logger` class. This kind of coupling
between methods should be avoided. Also, it is hard to unit test the static methods of the `Logger` class.

We should refactor the above code to use dependency injection:

_main.cpp_
```
int main()
{
  DependencyInjectorFactory::createDependencyInjector(...)
    ->injectDependencies();

  Logger::getInstance()->writeLogEntry(
    LogLevel::Info,
    std::source_location::current(),
    "Starting application"
  );
  
  // ...
}
```

_Singleton.h_
```
template<typename T>
class Singleton
{
public:
  Singleton() = default;

  virtual ~Singleton()
  {
    m_instance.reset();
  };

  static inline std::shared_ptr<T>& getInstance()
  {
    return m_instance;
  }

  static void setInstance(const std::shared_ptr<T>& instance)
  {
    m_instance = instance;
  }

private:
  static inline std::shared_ptr<T> m_instance;
};
```

_Logger.h_
```
class Logger : public Singleton<Logger>
{
public:
  virtual void writeLogEntry(...) = 0;
};
```

_StdOutSyslogLogger.h_
```
class StdOutSyslogLogger : public Logger
{
public:
  void writeLogEntry(...) override 
  {
    // Write the log entry
    // in Syslog format to the standard output
  }
};
```

_DependencyInjectorFactory.h_
```
class DependencyInjectorFactory {
public:
  static std::shared_ptr<DependencyInjector>
  createDependencyInjector(...) 
  {
    // You can use a switch-case here to create
    // different kinds of dependency injectors
    // that inject different kinds of dependencies
    return std::make_shared<DefaultDependencyInjector>();
  }
}
```

_DependencyInjector.h_
```
class DependencyInjector {
public:
  virtual ~DependencyInjector = default;
  virtual void injectDependencies() = 0;
}
```

_DefaultDependencyInjector.h_
```
class DefaultDependencyInjector : public DependencyInjector {
public:
  void injectDependencies() override;
}
```

_DefaultDependencyInjector.cpp_

<code class="sourceCodeWithoutLabel">

```
void DefaultDependencyInjector::injectDependencies()
{
  // Inject other dependencies...

  Logger::setInstance(
    std::make_shared<StdOutSyslogLogger>("Exporter")
  );
}
```

</code>

Below is an example of a _data-visualization-web-client_ where the _noicejs_ NPM library is used for
dependency injection. This library is similar to the _Google Guice_ library. Below is a `FakeServicesModule` class that configures dependencies for different backend services that the web client uses.
As you can notice, all the services are configured to use fake implementations because this DI module is used when
the backend services are not yet available. A `RealServicesModule` class
can be implemented and used when the backend services become available. In the `RealServicesModule` class, the
services are bound to their actual implementation classes instead of fake implementations.

_FakeServicesModule.ts_
```
import { Module } from 'noicejs';
import FakeDataSourceService from ...;
import FakeMeasureService from ...;
import FakeDimensionService from ...;
import FakeChartDataService from ...;

export default class FakeServicesModule extends Module {
  override async configure(): Promise<void> {
    this.bind('dataSourceService')
      .toInstance(new FakeDataSourceService());
      
    this.bind('measureService')
      .toInstance(new FakeMeasureService());
      
    this.bind('dimensionService')
      .toInstance(new FakeDimensionService());
      
    this.bind('chartDataService')
      .toInstance(new FakeChartDataService());
    );
  }
}
```

With the _noicejs_ library, you can configure several DI modules and create a DI container from the wanted modules.
The module approach lets you divide dependencies into multiple modules, so you don't have a single big
module. It also lets you instantiate a different module or modules based on the application configuration.

In the below example, the DI container is created from a single module, an instance of the `FakeServicesModule` class:

_diContainer.ts_
```
import { Container } from 'noicejs';
import FakeServicesModule from './FakeServicesModule';

const diContainer = Container.from(new FakeServicesModule());

export default diContainer;
```

In the development phase, we could create two separate modules, one for fake services and another one for real services,
and control the application behavior based on the web page's URL query parameter:

_diContainer.ts_
```
import { Container } from 'noicejs';
import FakeServicesModule from './FakeServicesModule';
import RealServicesModule from './RealServicesModule';

const diContainer = (() => {
  if (location.href.includes('useFakeServices=true')) {
    // Use fake services if web page URL
    // contains 'useFakeServices=true'
    return Container.from(new FakeServiceModule());
  } else {
    // Otherwise use real services
    return Container.from(new RealServicesModule());
  }
})();

export default diContainer;
```

Then you must configure the `diContainer` before dependency injection can be used.
In the below example, the `diContainer` is configured before a React application is rendered:

_index.tsx_
```
import React from 'react';
import ReactDOM from 'react-dom';
import diContainer from './diContainer';
import AppView from './app/view/AppView';

diContainer.configure().then(() => {
  ReactDOM.render(<AppView />, document.getElementById('root'));
});
```

Then, in Redux actions, where you need a service, you can inject the required service with
the `@Inject` decorator. You specify the name of the service you want to inject. The service
will be injected as the class constructor argument's property (with the same name).

_StartFetchChartDataAction.ts_

<code class="sourceCodeWithoutLabel">

```
// Imports ...

type ConstructorArgs = {
  chartDataService: ChartDataService,
  chart: Chart,
  dispatch: Dispatch;
};

export default
@Inject('chartDataService')
class StartFetchChartDataAction extends AbstractChartAreaAction {
  private readonly chartDataService: ChartDataService;
  private readonly chart: Chart;

  constructor({ chart,
                chartDataService,
                dispatch }: ConstructorArgs) {
    super(dispatch);
    this.chartDataService = chartDataService;
    this.chart = chart;
  }
  
  perform(currentState: ChartAreaState): ChartAreaState {
    this.chartDataService
      .fetchChartData(
        this.chart.dataSource,
        this.chart.getColumns(),
        this.chart.getSelectedFilters(),
        this.chart.getSelectedSortBys()
      )
      .then((columnNameToValuesMap: ColumnNameToValuesMap) => {
        this.dispatch(
          new FinishFetchChartDataAction(columnNameToValuesMap,
                                         this.chart.id)
        );
      })
      .catch((error) => {
        // Handle error
      });

    this.chart.isFetchingChartData = true;
    return ChartAreaStateUpdater
            .getNewStateForChangedChart(currentState, this.chart);
  }
}
```

</code>

And to be able to dispatch the above action, a controller should be implemented:

_ChartAreaController.ts_

<code class="sourceCodeWithoutLabel">

```
import diContainer from './diContainer';
import StartFetchChartDataAction from './StartFetchChartDataAction';
import Controller from './Controller';
import store from './store';

class ChartAreaController extends Controller {
  readonly actionDispatchers = {
    startFetchChartData: (chart: Chart) =>
      // the 'chart' is given as a property to
      // StartFetchChartDataAction class constructor
      this.dispatchWithDi(diContainer,
                         StartFetchChartDataAction,
                         { chart });
  }
}

export const controller = new ChartAreaController(store.dispatch);
export type ActionDispatchers = typeof controller.actionDispatchers;
```

</code>

The following base classes are also defined:

_AbstractAction.ts_
```
export default abstract class AbstractAction<S> {
  abstract perform(state: S): S;
}
```

_AbstractDispatchingAction.ts_
```
// Imports...

export default abstract class AbstractDispatchingAction<S>
    extends AbstractAction<S> {
  constructor(protected readonly dispatch: Dispatch) {}
}
```

_AbstractChartAreaAction.ts_
```
// Imports...

export default abstract class AbstractChartAreaAction 
         extends AbstractDispatchingAction<ChartAreaState> {
}
```

_Controller.ts_

<code class="sourceCodeWithoutLabel">

```
export type ReduxDispatch =
  (reduxActionObject: { type: AbstractAction<any> }) => void;

export default class Controller {
  protected readonly dispatch:
    (action: AbstractAction<any>) => void;

  constructor(reduxDispatch: ReduxDispatch) {
    this.dispatch = (action: AbstractAction<any>) =>
      reduxDispatch({ type: action });
  }

  dispatchWithDi(
    diContainer: { create: (...args: any[]) => Promise<any> },
    ActionClass: 
      abstract new (...args: any[]) => AbstractAction<any>,
    otherArgs: {}
  ) {
    // diContainer.create will create a new object of 
    // class ActionClass.
    // The second parameter of the create function defines
    // additional properties supplied to ActionClass constructor.
    // The create method is asynchronous. When it succeeds,
    // the created action object is available in the 'then'
    // function and it can be now dispatched
    
    diContainer
      .create(ActionClass, {
        dispatch: this.dispatch,
        ...otherArgs
      })
      .then((action: any) => this.dispatch(action));
  }
}
```

</code>

## Avoid Code Duplication Principle

> At the class level, when you spot duplicated code in two different classes implementing the same interface, you should
> create a new base class to accommodate the common functionality and make the classes extend the new base class.

Below is an `AvroBinaryKafkaInputMessage` class that implements the `InputMessage` interface:

_InputMessage.h_
```
class InputMessage 
{
public:
  virtual ~InputMessage() = default;
  
  virtual uint32_t tryDecodeSchemaId() const = 0;
  
  virtual std::shared_ptr<DecodedMessage>
  tryDecodeMessage(const std::shared_ptr<Schema>& schema)
  const = 0;
};
```

_AvroBinaryKafkaInputMessage.h_

<code class="sourceCodeWithoutLabel">

```
class AvroBinaryKafkaInputMessage : public InputMessage
{
public:
  AvroBinaryKafkaInputMessage(
    std::unique_ptr<RdKafka::Message> kafkaMessage
  ) : m_kafkaMessage(std::move(kafkaMessage))
  {}

  uint32_t tryDecodeSchemaId() const override;
  
  std::shared_ptr<DecodedMessage>
  tryDecodeMessage(const std::shared_ptr<Schema>& schema)
  const override;
  
private:
  std::unique_ptr<RdKafka::Message> m_kafkaMessage;
};

uint32_t AvroBinaryKafkaInputMessage::tryDecodeSchemaId() const 
{
  // Try decode schema id from the beginning of
  // the Avro binary Kafka message
}

std::shared_ptr<DecodedMessage>
AvroBinaryKafkaInputMessage::tryDecodeMessage(
  const std::shared_ptr<Schema>& schema
) const
{
  return schema->tryDecodeMessage(m_kafkaMessage->payload(),
                                  m_kafkaMessage->len());
}
```

</code>

If we wanted to introduce a new Kafka input message class for JSON, CSV, or XML format, we could create a class like the `AvroBinaryKafkaInputMessage` class. But then we can notice the duplication of code in the
`tryDecodeMessage` method. We can notice that the `tryDecodeMessage` method is the same regardless of the input message source and format.
According to this principle, we should move the duplicate code to a common base class, `BaseInputMessage`. We could make
the `tryDecodeMessage` method a template method according to the _template method pattern_ and create abstract methods for getting the message data and
its length:

_BaseInputMessage.h_
```
class BaseInputMessage : public InputMessage
{
public:
  std::shared_ptr<DecodedMessage> 
  tryDecodeMessage(const std::shared_ptr<Schema>& schema)
  const final;
  
protected:
  // Abstract methods
  virtual uint8_t* getData() const = 0;
  virtual size_t getLengthInBytes() const = 0;
};

// This is a template method
// 'getData' and 'getLengthInBytes' will be 
// implemented in subclasses
std::shared_ptr<DecodedMessage>
BaseInputMessage::tryDecodeMessage(
  const std::shared_ptr<Schema>& schema
) const
{
  return schema->tryDecodeMessage(getData(), getLengthInBytes());
}
```

Next, we should refactor the `AvroBinaryKafkaInputMessage` class to extend the new `BaseInputMessage` class and implement the `getData` and `getLengthInBytes` methods.
But we can realize these two methods are the same for all Kafka input message data formats.
We should not implement those two methods in the `AvroBinaryKafkaInputMessage` class because
we would need to implement them as duplicates if we needed to add a Kafka input message class for another data format.
Once again, we can utilize this principle and create a new base class for Kafka input messages:

_KafkaInputMessage.h_
```
class KafkaInputMessage : public BaseInputMessage
{
public:
  KafkaInputMessage(
    std::unique_ptr<RdKafka::Message> kafkaMessage
  ) : m_kafkaMessage(std::move(kafkaMessage))
  {} 

protected:
  uint8_t* getData() const final;
  size_t getLengthInBytes() const final;
  
private:
  std::unique_ptr<RdKafka::Message> m_kafkaMessage;  
};

uint8_t* KafkaInputMessage::getData() const 
{
  return std::bit_cast<uint8_t*>(m_kafkaMessage->payload());
}

size_t KafkaInputMessage::getLengthInBytes() const 
{
  return m_kafkaMessage->len();
}
```

Finally, we can refactor the `AvroBinaryKafkaInputMessage` class to contain no duplicated code:

_AvroBinaryKafkaInputMessage.h_
```
class AvroBinaryKafkaInputMessage : public KafkaInputMessage
{
public:
  uint32_t tryDecodeSchemaId() const final;
};

uint32_t AvroBinaryKafkaInputMessage::tryDecodeSchemaId() const 
{
  // Try decode the schema id from the beginning of 
  // the Avro binary Kafka message
  // Use base class getData() and getDataLengthInBytes()
  // methods to achieve that
}
```

## Inheritance in Cascading Style Sheets (CSS)

In HTML, you can define classes (class names) for HTML elements:

<div class="sourceCodeWithoutLabel">

```
<span class="icon pie-chart-icon">...</span>
```
</div>

In a CSS file, you define CSS properties for CSS classes, for example:

<div class="sourceCodeWithoutLabel">

```
.icon {
  background-repeat: no-repeat;
  background-size: 1.9rem 1.9rem;
  display: inline-block;
  height: 2rem;
  margin-bottom: 0.2rem;
  margin-right: 0.2rem;
  width: 2rem;
}
  
.pie-chart-icon {
  background-image: url('pie_chart_icon.svg');
}
```
</div>

The problem with the above approach is that it is not correctly object-oriented. In the HTML code, you
must list all the class names to achieve a mixin of all the needed CSS properties. It is easy to forget
to add a class name. For example, you could specify `pie-chart-icon` only and forget to specify the `icon`.

It is also difficult to change the inheritance hierarchy afterward. Suppose you wanted to add a new
class `chart-icon` for all the chart icons:

<div class="sourceCodeWithoutLabel">

```
.chart-icon {
  // Define properties here...
}
```
</div>

You would have to remember to add the `chart-icon` class name to all places in the HTML code where you are rendering chart icons:

<div class="sourceCodeWithoutLabel">

```
<span class="icon chart-icon pie-chart-icon">...</span>
```
</div>

The above-described approach is very error-prone. What you should do is introduce proper object-oriented design. You need a CSS preprocessor that makes extending CSS classes possible. In the below example, I am using SCSS:

<div class="sourceCodeWithoutLabel">

```
<span class="pieChartIcon">...</span>
```
</div>

<div class="sourceCodeWithoutLabel">

```
.icon {
  background-repeat: no-repeat;
  background-size: 1.9rem 1.9rem;
  display: inline-block;
  height: 2rem;
  margin-bottom: 0.2rem;
  margin-right: 0.2rem;
  width: 2rem;
}

.chartIcon {
  @extend .icon;
  
  // Other chart icon related properties...
}

.pieChartIcon {
  @extend .chartIcon;

  background-image: url('../../../../../assets/images/icons/chart/pie_chart_icon.svg');
}
```
</div>

In the above example, we define only one class for the HTML element. The inheritance hierarchy is defined in the SCSS file using the
`@extend` directive. We are now free to change the inheritance hierarchy in the future without
any modification needed in the HTML code.
