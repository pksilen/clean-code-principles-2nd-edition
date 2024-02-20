# Coding Principles

This chapter presents principles for coding. The following principles are presented:

- Uniform variable naming principle
- Uniform source code repository structure principle
- Source code directory tree structure principle
- Avoid comments principle
- Function single return statement principle
- Prefer statically typed language principle
- Refactoring principle
- Static code analysis principle
- Error/Exception handling principle
- Don't pass or return null principle
- Avoid off-by-one errors principle
- Be critical when googling principle
- Optimization principle

## Uniform Variable Naming Principle

> A good variable name should describe the variable's purpose and its type.

At best, having your code written with great names makes it read like prose. And remember that code is more
often read than written, so code must be easy to read and understand.

Naming variables with names that also convey information about the variable's type is crucial in untyped languages
and beneficial in typed languages, too, because modern typed languages use automatic type deduction, and you won't always see the
actual type of a variable. But when the variable's name tells its type, it does not matter if the type name is not visible.

In the following sections, naming conventions for different types of variables are proposed.

### Naming Integer Variables

Some variables are intrinsically integers, like _age_ or _year_. Everybody understands immediately that the type of
an _age_ or _year_ variable is a number and, to be more specific, an integer. So you don't have to add anything to the variable's
name to indicate its type. It already tells you its type.

One of the most used categories of integer variables is a count or number of something. You see those kinds of variables in every piece
of code. I recommend using the following convention for naming those variables: _numberOf&lt;something&gt;_ or alternatively
_&lt;something&gt;Count_. For example, _numberOfFailures_ or _failureCount_. You should not use a variable name _failures_
to designate a failure count. The problem with that variable name is it does not clearly specify the type of the variable
and thus can cause some confusion. This is because a variable named _failures_ can be misunderstood as a collection variable
(e.g., a list of failures).

If the unit of a variable is not self-evident, always add information about the unit to the end of the variable name. For example, instead of
naming a variable _tooltipShowDelay_, you should name it _tooltipShowDelayInMillis_ or _tooltipShowDelayInMillisecs_. If you have a variable
whose unit is self-evident, unit information is not needed. So, there is no need to name an _age_ variable as _ageInYears_. But if you are
measuring age in months, you must name the respective variable as _ageInMonths_ so that people don't assume that age is measured in
years.

### Naming Floating-Point Number Variables

Floating-point numbers are not as common as integers, but sometimes you need them too. Some values are intrinsically floating-point numbers,
like most un-rounded measures (e.g., price, height, width, or weight). If you need to store a measured value, it would be a safe
bet to have a floating-point variable.

If you need to store an amount of something that is not an integer, use a variable named _&lt;something&gt;Amount_, like _rainfallAmount_. When you see “amount of something” in code, you can automatically think it is a floating-point number. If you need to use a number in arithmetic,
depending on the application, you might want to use either floating-point or integer arithmetic. In the case of money, you should use
integer arithmetic to avoid rounding errors. Instead of a floating-point _moneyAmount_ variable, you should have an integer variable, like _moneyInCents_, for example.

If the unit of a variable is not self-evident, add information about the unit to the end of the variable name, like _rainfallAmountInMillimeters_, _widthInInches_,
_angleInDegrees_ (values 0-360), _failurePercent_ (values 0-100), or _failureRatio_ (values 0-1).

### Naming Boolean Variables

Boolean variables can have only one of two values: true or false. The name of a boolean variable should form a statement where the answer is
true or false, or yes or no. Typical boolean variable naming patterns are: _is&lt;something&gt;_, _has&lt;something&gt;_, _did&lt;something&gt;_,
_should&lt;something&gt;_, _can&lt;something&gt;, or _will&lt;something&gt;_. Some examples of variable names following the above patterns are _isDisabled_, _hasErrors_, _didUpdate_, _shouldUpdate_, and _willUpdate_.

The verb in the boolean variable name does not have to be at the beginning. It can and should be in the middle if it makes the code read better. Boolean variables are often used in if-statements where changing the word order in the variable name can make the code read
better. Remember that, at best, code reads like beautiful prose, and code is read more often than written.

Below is a code snippet where we have a boolean variable named `isPoolFull`:

<div class="sourceCodeWithoutLabel">

```
if (const bool isPoolFull = m_pooledMessages.size() >= 200U;
      isPoolFull)
{
  // ...
}
else
{
  // ...
}
```
</div>

We can change the variable name to `poolIsFull` to make the if-statement read more fluently. In the below example, the if-statements
reads "if poolIsFull" instead of "if isPoolFull":

<div class="sourceCodeWithoutLabel">

```
if (const bool poolIsFull = m_pooledMessages.size() >= 200U;
      poolIsFull)
{
  // ...
```
</div>

Don't use boolean variable names in the form of _&lt;passive-verb&gt;Something_, like _insertedField_, because this can confuse the reader.
It is unclear if the variable name is a noun that names an object or a boolean statement.
Instead, use either _didInsertField_ or _fieldWasInserted_.

Below is a Go language example of the incorrect naming of a variable used to store a function return value. Someone might think
that `tablesDropped` means a list of dropped table names. So, the name of the variable is obscure and should be changed.

<div class="sourceCodeWithoutLabel">

```
tablesDropped := dropRedundantTables(prefix,
                                     vmsdata,
                                     cfg.HiveDatabase,
                                     hiveClient,
                                     logger)
if tablesDropped {
  // ...
}
```
</div>

Below is the above example modified so that the variable name is changed to indicate a boolean statement:

<div class="sourceCodeWithoutLabel">

```
tablesWereDropped := dropRedundantTables(prefix,
                                         vmsdata,
                                         cfg.HiveDatabase,
                                         hiveClient,
                                         logger)
if tablesWereDropped {
  // ...
}
```

You could have used a variable named `didDropTables`, but the `tablesWereDropped` makes the if-statement more readable.

</div>

### Naming String Variables

String variables are prevalent, and many things are intrinsically strings, like _name_, _title_, _city_, _country_, or _topic_.
When you need to store numerical data in a string variable, tell the code reader clearly that it is a question about a number in
string format, and use a variable name in the following format: _&lt;someValue&gt;String_ or _&lt;someValue&gt;AsString_. It makes
the code more prominent and easier to understand. For example:

<div class="sourceCodeWithoutLabel">

```
const year = parseInt(yearAsString, 10); 
```
</div>

### Naming Enum Variables

Name enum variables with the same name as the enum type. E.g., a `CarType` enum variable should be named `carType`.
If the name of an enum type is very generic, like `Result`, you might benefit from declaring an enum variable with some
detail added to the variable name. Below is an example of a very generic enum type name:

_PulsarProducer.cpp_
```
// Returns enum type 'Result'
const auto result = pulsar::createProducer(...); 

if (result == Result.Ok) {
  // ...
}
```

Let's add some detail and context to the `result` variable name:

_PulsarProducer.cpp_
```
const auto producerCreationResult = pulsar::createProducer(...);

if (producerCreationResult == Result.Ok) {
  // ...
}
```

### Naming Collection (Array, List, and Set) Variables

When naming arrays, lists, and sets, you should use the plural form of a noun, like _customers_, _errors_, or _tasks_.
In most cases, this is enough because you don't necessarily need to know the underlying collection implementation. Using this naming convention
allows you to change the type of a collection variable without needing to change the variable name.
If you are iterating over a collection, it does not matter if it is an array, list, or set. Thus, it does not bring any
benefit if you add the collection type name to the variable name, for example, _customerList_ or _taskSet_. Those names are just longer.
You might want to specify the collection type in some special cases. Then, you can use the following kind of variable names:
_queueOfTasks_, _stackOfCards_, or _orderedSetOfTimestamps_.

Below is an example in Go language, where the function is named correctly to return a collection (of categories), but the variable
receiving the return value is not named according to the collection variable naming convention:

<div class="sourceCodeWithoutLabel">

```
vmsdata, error = vmsClient.GetCategories(vmsUrl, logger)
```
</div>

Correct naming would be:

<div class="sourceCodeWithoutLabel">

```
vmsCategories, error = vmsClient.GetCategories(vmsUrl, logger)
```
</div>


### Naming Map Variables

Maps are accessed by requesting a _value_ for a certain _key_. This is why I recommend naming maps using the pattern _keyToValueMap_.
Let’s say we have a map containing order counts for customer ids. This map should be named `customerIdToOrderCountMap`.
Or if we have a list of suppliers for product names, the map variable should be named `productNameToSuppliersMap`.
Below is an example of accessing maps in Java:

<div class="sourceCodeWithoutLabel">

```
final var orderCount = customerIdToOrderCountMap.get(customerId);
final var suppliers = productNameToSuppliersMap.get(productName);
```
</div>

Below is an example of iterating over a map in JavaScript:

<div class="sourceCodeWithoutLabel">

```
Object.entries(customerIdToOrderCountMap)
      .map(([customerId, orderCount]) => ...);
```
</div>

### Naming Pair and Tuple Variables

A variable containing a pair should be named using the pattern _variable1AndVariable2_. For example: `heightAndWidth`. And for tuples,
the recommended naming pattern is _variable1Variable2...andVariableN_. For instance: `heightWidthAndDepth`.

Below is an example of using pairs and tuples in JavaScript:

<div class="sourceCodeWithoutLabel">

```
const heightAndWidth = [100, 200];
const heightWidthAndDepth = [100, 200, 40];
const [height, , depth] = heightWidthAndDepth;
```
</div>

### Naming Object Variables

Object variables refer to an instance of a class. Class names are nouns written with the first letter capitalized, like
_Person_, _Account_, or _Task_. Object variable names should contain the related class name: a _person_ object of
the _Person_ class, an _account_ object of the _Account_ class, etc. You can freely decorate the object’s name, for example, with
an adjective: _completedTask_. It is important to include the class name or at least some significant part of it
at the end of the variable name. Then looking at the end of the variable name tells what kind of object is in question.

Sometimes you might want to name an object variable so that the name of its class is implicit, for example:

<div class="sourceCodeWithoutLabel">

```
// The class of the function parameters, 'Location', is implicit
drive(home, destination);
```
</div>

In the above example, the classes of `home` and `destination` objects are not explicit. In most cases, it is preferable to make the class name
explicit in the variable name when it does not make the variable name too long. This is because of the variable type deduction.
The types of variables are not necessarily visible in the code, so the type of a variable should be communicated by the
variable name. Below is an example where the types of function parameters are explicit.

<div class="sourceCodeWithoutLabel">

```
// The class of the function parameters, 'Location', is now explicit
drive(homeLocation, destLocation);
```
</div>

### Naming Optional Variables

How to name optional variables depends on the programming language and how the optional types are implemented. An optional
variable name should be prefixed with _maybe_ in languages where you need to unwrap the possible value from an optional object.

In Java, when using Optional&lt;T&gt;, name variables of this type using the following pattern: _maybe&lt;Something&gt;_:

<div class="sourceCodeWithoutLabel">

```
maybeLoggedInUser.ifPresent(loggedInUser -> loggedInUser.logout());
final User currentUser = maybeLoggedInUser.orElse(guestUser);
```
</div>

In TypeScript and other languages where optional types are created using type unions, you don’t need any prefixes
in optional variable names. In the below example, the `discount` parameter is optional, and its type is `number | undefined`:

<div class="sourceCodeWithoutLabel">

```
function addTax(
  price: number,
  discount?: number
): number {
  return 1.2 * (price — (discount ?? 0));
}

const priceWithTax = addTax(priceWithoutTax);
```
</div>

### Naming Function Variables (Callbacks)

Callback functions are functions supplied to other functions to be called at some point. If a callback function returns a value,
it can be named according to the returned value, but it should still contain a verb.
If the callback function does not return a value, you should name the callback function like any other function:
Indicating what the function does. Suppose you have a variable storing a function object, like a Java `Function` instance. In that case, you need to name the variable according to the rules for an object variable, i.e., the variable name should be a noun. For example, if you have a Java `Function` object currently named `map`, you should correct the name to be a noun, like `mapper`.

<div class="sourceCodeWithoutLabel">

```
const doubledValue = value => 2 * value;
const squaredValue = value => value * value;
const valueIsEven = nbr => (nbr % 2) === 0;
const values = [1, 2, 3, 4, 5]
const doubledValues = values.map(doubledValue);
const squaredValues = values.map(squaredValue);
const evenValues = values.filter(valueIsEven);

const strings = [" string1", "string2 "];
const trimmedString = str => str.trim();
const trimmedStrings = strings.map(trimmedString);

const sumOfValues = (sum, value) => sum + value;
values.reduce(sumOfValues, 0);
```

</div>

The above example would be even more apparent if the `map` function was renamed to `mapEach` and the `reduce` function
was renamed to `reduceTo`:

<div class="sourceCodeWithoutLabel">

```
const doubledValues = values.mapEach(doubledValue);
const trimmedStrings = strings.mapEach(trimmedString);
values.reduceTo(sumOfValues, 0);
```

</div>

Let's have an example written in Clojure:

<div class="sourceCodeWithoutLabel">

```
(defn print-first-n-doubled-integers [n]
  (println (take n (map (fn [x] (* 2 x)) (range)))))
```
</div>

To understand what happens in the above code, you should start reading from the innermost function call and
proceed toward the outermost function call. When traversing the function call hierarchy, the difficulty lies in storing
and retaining information about all the nested function calls in short-term memory.

We could simplify reading the above example by giving a name to the anonymous function and introducing variables (constants) for intermediate
function call results. Of course, our code becomes more prolonged, but coding is not a competition to write the shortest possible code
but to write the shortest, most readable, and understandable code for other people and your future self. It is a compiler's job
to compile the below longer code into as efficient code as the above shorter code.

Below is the above code refactored:

<div class="sourceCodeWithoutLabel">

```
(defn print-first-n-doubled-integers [n]
  (let [doubled (fn [x] (* 2 x))
        doubled-integers (map doubled (range))
        first-n-doubled-integers (take n doubled-integers)]
          (println first-n-doubled-integers)))
```
</div>

Let's think hypothetically: if Clojure's `map` function took parameters in a different order and the `range` function was
named `integers` and the `take` function was named `take-first` (like `take-last`), we would have an even more explicit version
of the original code:

<div class="sourceCodeWithoutLabel">

```
(defn print-first-n-doubled-integers [n]
  (let [doubled (fn [x] (* 2 x))
        doubled-integers (map (integers) doubled)
        first-n-doubled-integers (take-first n doubled-integers)]
          (println first-n-doubled-integers)))
```
</div>

### Naming Class Properties

Class properties (i.e., class attributes, fields, or member variables) should be named so that the class name is not repeated in the
property names. Below is an example of incorrect naming:

<div class="sourceCodeWithoutLabel">

```
public class Order {
  private long orderId;
  private OrderState orderState;
}
```

</div>

Below is the above code with corrected names:

<div class="sourceCodeWithoutLabel">

```
public class Order {
  private long id;
  private OrderState state;
}
```

</div>

If you have a class property to store a callback function (e.g., event handler or lifecycle callback), you should name it so that it tells on what occasion the stored
callback function is called. Name properties storing event handlers using the
following pattern: `on` + `<event-type>`, e.g., `onClick` or `onSubmit`. Name properties storing lifecycle callbacks in a similar way you
would name a lifecycle method, for example: `onInit`, `afterMount`, or `beforeMount`.

### General Naming Rules

#### Use Short, Common Names

When picking a name for something, use the most common shortest name. If you have a function named _relinquishSomething_, consider a shorter and more common name for the function. You could rename the function to _releaseSomething_, for example. The word "release" is
shorter and more common than the "relinquish" word. Use
Google to search for word synonyms, e.g., "relinquish synonym", to find the shortest and most common similar term.
 
#### Pick One Name And Use It Consistently

Let's assume that you are building a data exporter microservice and you are currently using the following terms in the code:
_message_, _report_, _record_ and _data_. Instead of using four different terms to describe the same thing, you should pick just one term,
like _message_, for example, and use it consistently throughout the microservice code.

Suppose you need to figure out a term to indicate a property of a class. You should pick just
one term, like _property_, and use it consistently everywhere. You should not use multiple terms like
_attribute_, _field_, and _member_ to describe a property of a class.

#### Avoid Obscure Abbreviations

Many abbreviations are commonly used, like _str_ for a string, _num/nbr_ for a number, _prop_ for a property, or _val_ for a value.
Most programmers use these, and I use them to make long names shorter. If a variable name is short, the full name should be used instead,
like _numberOfItems_ instead of _nbrOfItems_. Use abbreviations in cases where the variable name otherwise becomes too long. What I especially
try to avoid is using uncommon abbreviations. For example, I would never abbreviate _amount_ to _amnt_ or _discount_ to _dscnt_ because
I haven't seen those abbreviations used much in real life.

#### Avoid Too Short Or Meaningless Names

Names that are too short do not communicate what the variable is about. As loop counters, use a variable name like _index_ or _&lt;something&gt;Index_ if the loop variable is used to index something, like
an array, for example. An indexing variable should start from zero. If the loop variable is counting the number of things, use _number_ or
_&lt;something&gt;Number_ as the variable name, and start the loop counter from value one instead of zero. For example,
a loop to start five threads should be written in C++ in the following way:

<div class="sourceCodeWithoutLabel">

```
for (size_t threadNumber{1U}; threadNumber <= 5U; ++threadNumber)
{
  startThread(threadNumber);
}
```
</div>

If you don't need to use the loop counter value inside the loop, you can use a loop variable named _count_:

<div class="sourceCodeWithoutLabel">

```
for (size_t count{1U}; count <= objectCount; ++count)
{
  objects.push_back(acquireObject(std::forward<Args>(args)...));
}
```
</div>

## Uniform Source Code Repository Structure Principle

> Structuring code in a source code repository systematically in a certain way makes it easy for other developers to discover wanted information quickly.

Below are examples of ways to structure source code repositories for Java, C++, and JavaScript/TypeScript microservices.
In the below examples, a containerized (Docker) microservice deployed to a Kubernetes cluster is assumed. Your CI tool might require
that the CI/CD pipeline code must reside in a specific directory. But if not, place the CI/CD pipeline code in a _ci-cd_ directory.

### Java Source Code Repository Structure

Below is the proposed source code repository structure for a Java microservice (Gradle build tool is used):

<div class="sourceCodeWithoutLabel">

```
java-service
├── ci-cd
│   └── Jenkinsfile
├── docker
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs
├── env
│   ├── .env.dev
│   └── .env.ci
├── gradle
│   └── wrapper
│       └── ...
├── helm
│   └── java-service
│       ├── templates
│       ├── .helmignore
│       ├── Chart.yaml
│       ├── values.schema.json
│       └── values.yaml
├── integration-tests
│   ├── features
│   │   └── feature1.feature
│   └── steps
├── scripts
│   └── // Bash scripts here...
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com.domain.java-service
│   │   │       └── // source code
│   │   └── resources
│   └── test
│       ├── java
│       │   └── com.domain.java-service
│       │       └── // unit test code
│       └── resources
├── .gitignore
├── build.gradle
├── gradlew
├── gradlew.bat
├── README.MD
└── settings.gradle
```
</div>

### C++ Source Code Repository Structure

Below is the proposed source code repository structure for a C++ microservice (CMake build tool is used):

&nbsp;

```
cpp-service
├── ci-cd
│   └── Jenkinsfile
├── docker
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs
├── env
│   ├── .env.dev
│   └── .env.ci
├── helm
│   └── cpp-service
│       ├── templates
│       ├── .helmignore
│       ├── Chart.yaml
│       ├── values.schema.json
│       └── values.yaml
├── integration-tests
│   ├── features
│   │   └── feature1.feature
│   └── steps
├── scripts
│   └── // Bash scripts here...
├── src
│   ├── // source code here
│   │   main.cpp
│   └── CMakeLists.txt
├── test
│   ├── // unit test code
│   │   main.cpp
│   └── CMakeLists.txt
├── .gitignore
├── CMakeLists.txt
└── README.MD
```

### JavaScript/TypeScript Source Code Repository Structure

Below is the proposed source code repository structure for a JavaScript/TypeScript microservice:

&nbsp;

```
ts-service
├── ci-cd
│   └── Jenkinsfile
├── docker
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs
├── env
│   ├── .env.dev
│   └── .env.ci
├── helm
│   └── ts-service
│       ├── templates
│       ├── .helmignore
│       ├── Chart.yaml
│       ├── values.schema.json
│       └── values.yaml
├── integration-tests
│   ├── features
│   │   └── feature1.feature
│   └── steps
├── scripts
│   └── // Bash scripts here...
├── src
│   └── // source code here
├── test
│   └── // unit test code here 
├── .gitignore
├── .eslintrc.json
├── .prettier.rc
├── package.json
├── package-lock.json
├── README.MD
└── tsconfig.json
```

## Domain-Based Source Code Structure Principle

> Structure source code tree primarily by domains, not by technical details. Each source code directory should have a
> single responsibility at its abstraction level.

Below is an example of a Spring Boot microservice's _src_ directory that is not organized by domains but is
incorrectly organized according to technical details:

<div class="sourceCodeWithoutLabel">

```
spring-example-service/
└── src/
    └── java/
        └── com.silensoft.springexampleservice/
            ├── controllers/
            │   ├── AController.java
            │   └── BController.java
            ├── entities/
            │   ├── AEntity.java
            │   └── BEntity.java
            ├── errors/
            │   ├── AError.java
            │   └── BError.java
            ├── dtos/
            │   ├── ADto.java
            │   └── BDto.java
            ├── repositories/
            │   ├── ARepository.java
            │   └── BRepository.java
            └── services/
                ├── AService.java
                └── BService.java
```
</div>

Below is the above example modified so that directories are organized by domains:

<div class="sourceCodeWithoutLabel">

```
spring-example-service/
└── src/
    └── java/
        └── com.silensoft.springexampleservice/
            ├── domainA/
            │   ├── AController.java
            │   ├── ADto.java
            │   ├── AEntity.java
            │   ├── AError.java
            │   ├── ARepository.java
            │   └── AService.java
            └── domainB/
                ├── BController.java
                ├── BDto.java
                ├── BEntity.java
                ├── BError.java
                ├── BRepository.java
                └── BService.java
```
</div>

You can have several levels of nested domains:

<div class="sourceCodeWithoutLabel">

```
spring-example-service/
└── src/
    └── java/
        └── com.silensoft.springexampleservice/
            ├── domainA/
            │   ├── domainA-1/
            │   │   ├── A1Controller.java
            │   │   └── ...
            │   └── domainA-2/
            │       ├── A2Controller.java
            │       └── ...
            └── domainB/
                └── BController.java

```
</div>

If you want, you can create subdirectories for technical details inside a domain directory. This is the recommended
approach if, otherwise, the domain directory would contain more than 5 to 7 files. Below is an example of the _salesitem_ domain:

<div class="sourceCodeWithoutLabel">

```
sales-item-service
└── src
    └── java
        └── com.silensoft.salesitemservice
            └── salesitem
                ├── dtos
                │   ├── SalesItemArg.java
                │   └── SalesItemResponse.java
                ├── entities
                │   └── SalesItem.java
                ├── errors
                │   └── SalesItemRelatedError.java
                │   └── SalesItemRelatedError2.java
                ├── repository
                │   └── SalesItemRepository.java
                ├── service
                │   ├── SalesItemService.java
                │   └── SalesItemServiceImpl.java
                └── SalesItemController.java
```
</div>

Below is the source code directory structure for the data exporter microservice designed in the previous
chapter. There are subdirectories for the four subdomains: input, internal message, transformer, and output. There is a subdirectory created for each common
nominator in the class names. It is effortless to navigate the directory
tree when locating a particular file. Also, the number of source code files in each directory is low.
You can grasp the contents of a directory with a glance. The problem with directories containing many files
is that it is not easy to find the wanted file. For this reason, a single directory should ideally have 2-4 files. The absolute
maximum is 5-7 files.

Note that below, a couple of directories are left unexpanded to shorten the example. It should be easy for the reader
to infer the contents of the unexpanded directories.

<div class="sourceCodeWithoutLabel">

```
src
├── common
├── input
│   ├── config
│   │   ├── parser
│   │   │   ├── json
│   │   │   │   ├── JsonInputConfigParser.cpp
│   │   │   │   └── JsonInputConfigParser.h
│   │   │   └── InputConfigParser.h
│   │   ├── reader
│   │   │   ├── localfilesystem
│   │   │   │   ├── LocalFileSystemInputConfigReader.cpp
│   │   │   │   └── LocalFileSystemInputConfigReader.h
│   │   │   └── InputConfigReader.h
│   │   ├── InputConfig.h
│   │   ├── InputConfigImpl.cpp
│   │   └── InputConfigImpl.h
│   │
│   └── message
│       ├── consumer
│       │   ├── kafka
│       │   │   ├── KafkaInputMessageConsumer.cpp
│       │   │   └── KafkaInputMessageConsumer.h
│       │   └── InputMessageConsumer.h
│       ├── decoder
│       │   ├── avrobinary
│       │   │   ├── AvroBinaryInputMessageDecoder.cpp
│       │   │   └── AvroBinaryInputMessageDecoder.h
│       │   └── InputMessageDecoder.h
│       ├── kafka
│       │   ├── KafkaInputMessage.cpp
│       │   └── KafkaInputMessage.h
│       │
│       └── InputMessage.h
├── internalmessage
    ├── field
│   ├── InternalMessage.h
│   ├── InternalMessageImpl.cpp
│   └── InternalMessageImpl.h
├── transformer
│   ├── config
│   │   ├── parser
│   │   ├── reader
│   │   ├── TransformerConfig.h
│   │   ├── TransformerConfigImpl.cpp
│   │   └── TransformerConfigImpl.h
│   ├── field
│   │   ├── copy
│   │   │   ├── CopyFieldTransformer.cpp
│   │   │   └── CopyFieldTransformer.h 
│   │   ├── expression
│   │   ├── filter
│   │   ├── typeconversion
│   │   ├── FieldTransformer.h
│   │   ├── FieldTransformers.h
│   │   ├── FieldTransformaresImpl.cpp
│   │   └── FieldTransformersImpl.h
│   └── message
│       ├── MessageTransformer.h
│       ├── MessageTransformerImpl.cpp
│       └── MessageTransformerImpl.h
└── output
    ├── config
    │   ├── parser
    │   ├── reader
    │   ├── OutputConfig.h
    │   ├── OutputConfigImpl.cpp
    │   └── OutputConfigImpl.h
    └── message
        ├── encoder
        │   ├── avrobinary
        │   └── OutputMessageEncoder.h
        ├── producer
        │   ├── pulsar
        │   └── OutputMessageProducer.h
        ├── OutputMessage.h
        ├── OutputMessageImpl.cpp
        └── OutputMessageImpl.h
```
</div>

Below is the Java version of the above directory structure:

<div class="sourceCodeWithoutLabel">

```
src
├── common
├── input
│   ├── config
│   │   ├── parser
│   │   │   ├── InputConfigParser.java
│   │   │   └── JsonInputConfigParser.java
│   │   ├── reader
│   │   │   ├── InputConfigReader.java
│   │   │   └── LocalFileSystemInputConfigReader.java
│   │   ├── InputConfig.java
│   │   └── InputConfigImpl.java
│   └── message
│       ├── consumer
│       │   ├── InputMessageConsumer.java
│       │   └── KafkaInputMessageConsumer.java
│       ├── decoder
│       │   ├── InputMessageDecoder.java
│       │   └── AvroBinaryInputMessageDecoder.java
│       ├── InputMessage.java
│       └── KafkaInputMessage.java
├── internalmessage
│   ├── field
│   ├── InternalMessage.java
│   └── InternalMessageImpl.java
├── transformer
│   ├── config
│   ├── field
│   │   ├── impl
│   │   │   ├── CopyFieldTransformer.java
│   │   │   ├── ExpressionFieldTransformer.java
│   │   │   ├── FilterFieldTransformer.java
│   │   │   └── TypeConversionFieldTransformer.java
│   │   ├── FieldTransformer.java
│   │   ├── FieldTransformers.java
│   │   └── FieldTransformersImpl.java
│   └── message
│       ├── MessageTransformer.java
│       └── MessageTransformerImpl.java
└── output
    ├── config
    └── message
```

</div>

Below is the source code directory structure for the anomaly detection microservice designed in the previous
chapter. The _anomaly_ directory is expanded. We can see that our implementation is using
JSON for various parsing activities and self-organizing maps (SOM) is used for anomaly detection. JSON and Kafka are used
to publish anomaly indicators outside the microservice. Adding
new concrete implementations to the below directory structure is straightforward. For example, if we wanted to add YAML support
for configuration files, we could create _yaml_ subdirectories where we could place YAML-specific implementation classes.

<div class="sourceCodeWithoutLabel">

```
src
├── anomaly
│   ├── detection
│   │   ├── configuration
│   │   │   ├── parser
│   │   │   │   ├── json
│   │   │   │   │   ├── JsonAnomalyDetectionConfigParser.cpp
│   │   │   │   │   └── JsonAnomalyDetectionConfigParser.h
│   │   │   │   └── AnomalyDetectionConfigParser.h          
│   │   │   ├── AnomalyDetectionConfig.h
│   │   │   ├── AnomalyDetectionConfigFactory.h
│   │   │   ├── AnomalyDetectionConfigFactoryImpl.h
│   │   │   ├── AnomalyDetectionConfigImpl.cpp
│   │   │   └── AnomalyDetectionConfigImpl.h      
│   │   ├── engine
│   │   │   ├── AnomalyDetectionEngine.h
│   │   │   ├── AnomalyDetectionEngineImpl.cpp
│   │   │   └── AnomalyDetectionEngineImpl.h
│   │   ├── rule
│   │   │   ├── parser
│   │   │   │   ├── json
│   │   │   │   │   ├── JsonAnomalyDetectionRuleParser.cpp
│   │   │   │   │   └── JsonAnomalyDetectionRuleParser.h
│   │   │   │   └── AnomalyDetectionRuleParser.h
│   │   │   ├── AnomalyDetectionRule.h
│   │   │   ├── AnomalyDetectionRuleFactory.h
│   │   │   ├── AnomalyDetectionRuleFactoryImpl.h
│   │   │   ├── AnomalyDetectionRuleImpl.cpp
│   │   │   └── AnomalyDetectionRuleImpl.h
│   │   ├── AnomalyDetector.h
│   │   ├── AnomalyDetectorImpl.cpp
│   │   └── AnomalyDetectorImpl.h
│   ├── indicator
│   │   ├── publisher
│   │   │   ├── kafka
│   │   │   │   ├── KafkaAnomalyIndicatorPublisher.cpp
│   │   │   │   └── KafkaAnomalyIndicatorPublisher.h
│   │   │   └── AnomalyIndicatorPublisher
│   │   ├── serializer
│   │   │   ├── json
│   │   │   │   ├── JsonAnomalyIndicatorSerializer.cpp
│   │   │   │   └── JsonAnomalyIndicatorSerializer.h
│   │   │   └── AnomalyIndicatorSerializer.h
│   │   ├── AnomalyIndicator.h
│   │   ├── AnomalyIndicatorFactory.h
│   │   ├── AnomalyIndicatorFactoryImpl.h
│   │   ├── AnomalyIndicatorImpl.cpp
│   │   └── AnomalyIndicatorImpl.h
│   └── model
│       ├── som
│       │   ├── SomAnomalyModel.cpp
│       │   ├── SomAnomalyModel.h
│       │   └── SomAnomalyModelFactory.h
│       ├── training
│       │   ├── engine
│       │   │   ├── AnomalyModelTrainingEngine.h
│       │   │   ├── AnomalyModelTrainingEngineImpl.cpp
│       │   │   └── AnomalyModelTrainingEngineImpl.h
│       │   ├── som
│       │   │   ├── SomAnomalyModelTrainer.cpp
│       │   │   └── SomAnomalyModelTrainer.h
│       │   └── AnomalyModelTrainer.h  
│       ├── AnomalyModel.h
│       └── AnomalyModelFactory.h
├── common
├── measurement
├── Application.h
├── Application.cpp
├── DependencyInjector.h
└── main.cpp
```

</div>

Let's have one more example with a _data-visualization-web-client_.

This web client's UI consists of the following pages, which all include a common header:

- Dashboards
- Data Explorer
- Alerts

The _Dashboards_ page contains a dashboard group selector, dashboard selector, and chart area to display the selected dashboard's charts. You can select the shown dashboard by first selecting
a dashboard group and then a dashboard from that group.

![Figure 5.1. Dashboards Page](images/05-01.png)

The _Data Explorer_ page contains selectors for choosing a data source, measure(s), and dimension(s). The page also contains a chart area to display charts. Using the selectors, a user can change the shown measure(s) and dimension(s) for the currently selected chart in the chart area.

![Figure 5.2. Data Explorer Page](images/05-02.png)

Based on the above design, the web client can be divided into the following subdomains:

- Common UI components
  - Chart Area
    - Chart
- Header
- Pages
  - Alerts
  - Dashboards
  - Data Explorer

The source code tree should look like the following:

<div class="sourceCodeWithoutLabel">

```
src
├── app
│   ├── common
│   │   └── chartarea
│   │       └── chart
│   ├── header
│   └── pages
│       ├── alerts
│       ├── dashboards
│       │   └── selectors
│       │       ├── dashboardgroup
│       │       └── dashboard
│       └── dataexplorer
│           └── selectors
│               ├── datasource
│               ├── dimension
│               └── measure
├── index.ts
└── store.ts
```
</div>

Below is an example of what a single subdomain directory can look like when using React, Redux and
SCSS modules:

<div class="sourceCodeWithoutLabel">

```
src
├── app
│   └── header
│       ├── model
│       │   ├── actions
│       │   │   ├── AbstractHeaderAction.ts
│       │   │   └── NavigateToPageAction.ts
│       │   ├── services 
│       │   └── state
│       │       ├── types
│       │       ├── HeaderState.ts
│       │       └── initialHeaderState.ts
│       ├── view
│       │    ├── navigation
│       │    │   ├── NavigationView.module.scss
│       │    │   └── NavigationView.tsx
│       │    ├── HeaderView.module.scss
│       │    └── HeaderView.tsx
│       └── headerController.ts
├── index.ts
└── store.ts
```

</div>

In the above example, we have created two directories for the technical details of the _header_ domain: model and view directories. The model directory
contains actions, services, and the state, and the view directory contains the view component, its possible subcomponents and
CSS definitions. The model's state directory can contain a subdirectory for types
used in the subdomain state. The state directory should always contain the type definition for the subdomain's state and the initial state.
The services directory contains a service or services that use backend services to control the backend model.

## Avoid Comments Principle

> Avoid comments in code. The only exception is when documenting the public API of a library.

Comments can be problematic. You cannot trust them 100% because they can be misleading, outdated, or downright wrong. You can only
trust the source code itself. Comments are often entirely unnecessary and only make the code more verbose.
The following sections describe several ways to avoid writing comments and still keep your code understandable.

### Name Things Properly

When you name things like a function poorly, you might end up attaching a comment to the function. To avoid writing comments, it is imperative to focus on naming things correctly. When following the _single responsibility principle_
and the _uniform naming principle_, it should be easier to name things correctly and avoid comments. Below is an example of
a function with a comment:

_MessageBuffer.h_
```
class MessageBuffer 
{
public:
  // Return false if buffer full,
  // true if message written to buffer
  bool write(const std::shared_ptr<Message>& message);
}
```

If we drop the comment, we will have the following code:

_MessageBuffer.h_
```
class MessageBuffer 
{
public:
  bool write(const std::shared_ptr<Message>& message);
}
```

Dropping the comment alone is not the best solution because some crucial information is now missing. What does that boolean return
value mean? It is not 100% clear. We can assume that returning `true` means that message was successfully written, but
nothing is communicated about returning `false`. We can only assume it is some error, but not sure what error.

In addition to removing the comment, we should give a better name for the function and rename it as follows:

_MessageBuffer.h_
```
class MessageBuffer 
{
public:
  bool writeIfBufferNotFull(
    const std::shared_ptr<Message>& message
  );
}
```

Now the purpose of the function is clear, and we can be sure what the boolean return value means. It
means whether the message was written to the buffer. Now we also know why the writing of a message can fail: the
buffer is full. This will give the function caller sufficient information about what to do next. It should
probably wait a while so that the buffer reader has enough time to read messages from the buffer
and free up some space.

Below is a real-life example from a book that I once read:

<div class="sourceCodeWithoutLabel">

```
public interface Mediator {
  // To register an employee
  void register(Person person);
  
  // To send a message from one employee to another employee
  void connectEmployees(Person fromPerson,
                        Person toPerson,
                        String msg);
  
  // To display currently registered members
  void displayDetail();
}
```
</div>

There are three functions in the above example, each of which has a problem.
The first function is registering a person, but the comment says it is registering an employee. So, there is a mismatch
between the comment and the code. In this case, I trust the code over the comment. The correction is to remove the comment
because it does not bring any value. It only causes confusion.

The second function says in the comment that it sends a message from one employee to another. The function name tells
about connecting employees, but the parameters are persons. I assume that a part of the
comment is correct: to send a message from someone to someone else. But once again, I trust the code
more over the comment and assume the message is sent from one person to another. We should remove the comment and rename the function.

In the third function, the comment adds information missing from the function name. The comment also
discusses members, as other parts of the code speak about employees and persons. There are three different
terms used: employee, person, and member. Just one term should be picked. Let's choose the term _person_ and use it systematically.

Below is the refactored version without the comments:

<div class="sourceCodeWithoutLabel">

```
public interface Mediator {
  void register(Person person);
  
  void send(String message, 
            Person sender,
            Person recipient);
  
  void displayDetailsOfRegisteredPersons();
}
```
</div>

### Single Return Of Named Value At The End Of Function

> A function should have a single return statement and return a named value at the end of the function. Then the code reader can infer the return
> value meaning by looking at the end of the function.

Consider the following example:

_Metrics.h_
```
class Metrics
{
public:
  // ...

  static uint32_t addCounter(
    CounterFamily counterFamily,
    const std::map<std::string, std::string>& labels
  );
  
  static void incrementCounter(uint32_t counterIndex,
                               size_t incrementAmount);  
                               
  // addGauge...
  // setGaugeValue...
}
```

What is the return value of the `addCounter` function? Someone might think a comment is needed to describe
the return value because it is unclear what `uint32_t` means. Instead of writing a comment, we can introduce a named value
(= variable/constant) to be returned from the function. The idea behind the named return value is that it communicates the semantics of the return
value without the need for a comment. In C++, you jump from the function declaration to the function definition to see
what the function returns. Below is the implementation for the `addCounter` function:

_Metrics.cpp_
```
uint32_t Metrics::addCounter(
  const CounterFamily counterFamily,
  const std::map<std::string, std::string>& labels)
{
  uint32_t counterIndex;
  
  // Perform adding a counter here and
  // set value for the 'counterIndex'
  
  return counterIndex;
}
```

In the above implementation, we have a single return of a named value at the end of the function. All we have to do is to look
at the end of the function and spot the return statement, which should tell us the meaning of the mysterious `uint32_t`
typed return value: It is a counter index. And we can spot that the `increaseCounter` function requires a `counterIndex` argument
and this establishes a connection between calling the `addCounter` function first, storing the returned counter index, and
later using that stored counter index in calls to the `increaseCounter` function.

### Return Type Aliasing

In the previous example, there was the mysterious return value of type `uint32_t` in the `addCounter` function. We learned how
introducing a named value returned at the end of the function helped to communicate the semantics of the return value. But there is
an even better way to communicate the semantics of a return value. Many languages like C++ and TypeScript offer type aliasing that
can be used to communicate the return value semantics. Below is an example where we introduce a `CounterIndex` type alias
for the `uint32_t` type:

_Metrics.h_
```
class Metrics
{
public:
  using CounterIndex = uint32_t;

  // ...

  static CounterIndex addCounter(
    CounterFamily counterFamily,
    const std::map<std::string, std::string>& labels
  );
  
  static void incrementCounter(CounterIndex counterIndex,
                               size_t incrementAmount);
}
```

And here is the same example in TypeScript:

_Metrics.ts_
```
export type CounterIndex = number;

export default class Metrics {
  // ...

 static addCounter(
    counterFamily: CounterFamily,
    labels: Record<string, string>
  ): CounterIndex;
   
  static incrementCounter(counterIndex: CounterIndex,
                          incrementAmount: number): void;
}
```

Some languages, like Java, don't have type aliases. Then you can introduce a wrapper class for the returned value. Here is the same example in Java:

_CounterIndex.java_
```
public class CounterIndex {
  private final int value;

  public CounterIndex(final int value) {
    this.value = value;
  }

  public int get() {
    return value;
  }
}
```

_Metrics.java_
```
public final class Metrics {
  // ...

  public static CounterIndex addCounter(
    final CounterFamily counterFamily,
    final Map<String, String> labels
  ) {
    // ...
  }

  public static void incrementCounter(
    CounterIndex counterIndex,
    double incrementAmount
  ) {
    // ...
  }
}
```

We can improve the above example. The `CounterIndex` class could be derived from a generic `Value` class:

<div class="sourceCodeWithoutLabel">

```
public class Value<T> {
  private final T value;

  public Value(final T value) {
    this.value = value;
  }

  public T get() {
    return value;
  }
}

public class CounterIndex extends Value<Integer> {
  // ...
}
```
</div>

We can improve the above metrics example a lot. First, we should avoid the primitive type obsession. We should not be returning an index
from the `addCounter` method, but we should rename the method as `createCounter` and return an instance of a `Counter` class from
the method. Then we should make the example more object-oriented by moving the `incrementCounter` method to the `Counter` class
and naming it just `increment`. Also, the name of the `Metrics` class should be changed to `MetricFactory`. And finally,
we should make the `MetricFactory` class a singleton instead of containing static methods.

### Extract Constant for Boolean Expression

By extracting a constant for a boolean expression, we can eliminate comments. Below is an example where a comment is written
below an if-statement and its boolean expression:

_MessageBuffer.cpp_
```
bool MessageBuffer::writeIfBufferNotFull(
  const std::shared_ptr<Message>& message
) {
  bool messageWasWritten{false};
  
  if (m_messages.size() < m_maxBufferSize)
  {
    // Buffer is not full
    m_messages.push_back(message);
    messageWasWritten = true;
  }
  
  return messageWasWritten;
}
```

By introducing a constant to be used in the "buffer is full" check, we can get rid of the "Buffer is not full" comment:

_MessageBuffer.cpp_
```
bool MessageBuffer::writeIfBufferNotFull(
  const std::shared_ptr<Message> message
) {
  bool messageWasWritten{false};
  
  const bool bufferIsNotFull =
    m_messages.size() < m_maxBufferSize;
  
  if (bufferIsNotFull)
  {
    m_messages.push_back(message);
    messageWasWritten = true;
  }
  
  return messageWasWritten;
}
```

### Extract Named Constant or Enumerated Type

If you encounter a _magic number_ in your code, you should introduce either a named constant or an enumerated type (enum) for that value. In the below example, we are returning two magic numbers, 0 and 1:

_main.cpp_
```
int main()
{
  Application application;
  
  if (application.run())
  {
    // Application was run successfully
    return 0;
  }

  // Exit code: failure
  return 1;
}
```

Let's introduce an enumerated type, `ExitCode,` and use it instead of magic numbers:

_main.cpp_
```
enum class ExitCode
{
  Success = 0,
  Failure = 1
};

int main()
{
  ExitCode exitCode;
  Application application;
  const bool appWasSuccessfullyRun = application.run();
  
  if (appWasSuccessfullyRun)
  {
    exitCode = ExitCode::Success;
  }
  else
  {
    exitCode = ExitCode::Failure;
  }

  return static_cast<int>(exitCode);
}
```

It is now easy to add more exit codes with descriptive names later if needed.

### Extract Function

If you are planning to write a comment above a piece of code, you should extract that piece of code to a new function. When you extract a well-named function, you don't need to write that comment. The name
of the newly extracted function serves as documentation. Below is an example with some commented code:

_MessageBuffer.cpp_
```
void MessageBuffer::writeFitting(
  std::deque<std::shared_ptr<Message>>& messages
) {
  if (m_messages.size() + messages.size() <= m_maxBufferSize)
  {
    // All messages fit in buffer
    m_messages.insert(m_messages.end(),
                      messages.begin(),
                      messages.end());
                      
    messages.clear();
  }
  else
  {
    // All messages do not fit, write only messages that fit
    const auto messagesEnd = messages.begin() +
                             m_maxBufferSize -
                             m_messages.size();
                             
    m_messages.insert(m_messages.end(),
                      messages.begin(),
                      messagesEnd);
                      
    messages.erase(messages.begin(), messagesEnd);
  }
}
```

Here is the same code with comments refactored out by extracting two new methods:

_MessageBuffer.cpp_
```
void MessageBuffer::writeFitting(
  std::deque<std::shared_ptr<Message>>& messages
) {
  const bool allMessagesFit = m_messages.size() +
                              messages.size() <= m_maxBufferSize;
                              
  if (allMessagesFit)
  {
    writeAll(messages)
  }
  else
  {
    writeOnlyFitting(messages);
  }
}

void MessageBuffer::writeAll(
  std::deque<std::shared_ptr<Message>>& messages
) {
  m_messages.insert(m_messages.end(),
                    messages.begin(),
                    messages.end());
                    
  messages.clear();
}

void MessageBuffer::writeOnlyFitting(
  std::deque<std::shared_ptr<Message>>& messages
) {
  const auto messageCountThatFit = m_maxBufferSize -
                                   m_messages.size();
                                   
  const auto messagesEnd = messages.begin() +
                           messageCountThatFit;
                           
  m_messages.insert(m_messages.end(),
                    messages.begin(),
                    messagesEnd);
                    
  messages.erase(messages.begin(), messagesEnd);
}
```

### Name Anonymous Function

Anonymous functions are common in functional programming, e.g., when using
algorithms like _forEach_, _map_, _filter_, and _reduce_. When an anonymous function is long or complex, you should give it a descriptive name and split it into multiple functions
if it is too long. This way, you can eliminate comments.

In the below TypeScript example, we have an anonymous function with a comment:

<div class="sourceCodeWithoutLabel">

```
// ...

fs.watchFile('/etc/config/LOG_LEVEL', () => {
  // Update new log level
  try {
    const newLogLevel = fs.readFileSync('/etc/config/LOG_LEVEL',
                                        'utf-8'}).trim();
    tryValidateLogLevel(newLogLevel);
    process.env.LOG_LEVEL = newLogLevel;
  } catch (error) {
    // ...
  }
});
```
</div>

We can refactor the above example so that the comment is removed and 
the anonymous function is given a name:

<div class="sourceCodeWithoutLabel">

```
function updateNewLogLevel() {
  try {
    const newLogLevel = fs.readFileSync('/etc/config/LOG_LEVEL',
                                        'utf-8'}).trim();
    tryValidateLogLevel(newLogLevel);
    process.env.LOG_LEVEL = newLogLevel;
  } catch (error) {
    // ...
  }
}

fs.watchFile('/etc/config/LOG_LEVEL', updateNewLogLevel);
```
</div>

### Avoiding Comments in Bash Shell Scripts

Many programmers, myself included, don't enjoy the mysterious syntax of Linux shell commands and scripts.
Even the syntax of the simplest expressions can be hard to understand and remember if you don't work
with scripts regularly. Of course, the best thing is to avoid writing complex Linux shell scripts and
use a proper programming language like Python instead. But sometimes, performing some actions
using a shell script is easier. Because the syntax and commands in shell scripts can be hard to understand, many developers tend to
solve the problem by adding comments to scripts.

Next, alternative ways to make scripts more understandable
without comments are presented. Let's consider the below example from one real-life script I have bumped into:

<div class="sourceCodeWithoutLabel">

```
create_network() {
  #create only if not existing yet
  if [[ -z "$(docker network ls | grep $DOCKER_NETWORK_NAME )" ]];
  then
    echo Creating $DOCKER_NETWORK_NAME
    docker network create $DOCKER_NETWORK_NAME
  else
    echo Network $DOCKER_NETWORK_NAME already exists
  fi
}
```
</div>

Below is the same example with the following changes:

- The comment was removed, and the earlier commented expression was moved to a well-named function
- The negation in the expression was removed, and the contents of the _then_ and _else_ branches were swapped
- Variable names were made camel case to enhance readability

<div class="sourceCodeWithoutLabel">

```
dockerNetworkExists() { [[ -n "$(docker network ls | grep $1 )" ]]; }

createDockerNetwork() {
  if dockerNetworkExists $networkName; then
    echo Docker network $networkName already exists
  else
    echo Creating Docker network $networkName
    docker network create $networkName
  fi
}
```
</div>

If your script accepts arguments, give the arguments proper names, for example:

<div class="sourceCodeWithoutLabel">

```
dataFilePathName=$1
schemaFilePathName=$2
```
</div>

The script reader does not have to remember what `$1` or `$2`means, and you don't have to insert
any comments to clarify the meaning of the arguments.

If you have a complex command in a Bash shell script, you should not attach a comment to it but extract a function
with a proper name to describe the command.

The below example contains a comment:

<div class="sourceCodeWithoutLabel">

```
# Update version in Helm Chart.yaml file
sed -i "s/^version:.*/version: $VERSION/g" helm/service/Chart.yaml
```
</div>

Here is the above example refactored to contain a function

<div class="sourceCodeWithoutLabel">

```
updateHelmChartVersionInChartYamlFile() {
  sed -i "s/^version:.*/version: $1/g" helm/service/Chart.yaml
}

updateHelmChartVersionInChartYamlFile $version
```
</div>

Here is another example:

<div class="sourceCodeWithoutLabel">

```
getFileLongestLineLength() {
  echo $(awk '{ if (length($0) > max) max = length($0) } END { print max }' $1)
}

configFileLongestLineLength = $(getFileLongestLineLength $configFilePathName)
```
</div>

## Function Single Return Principle

> Prefer a single return statement at the end of a function to clearly communicate the return value's meaning and make refactoring the function easier.

A single return statement with a named value at the end of a function clearly communicates the return value semantics
if the return value type does not directly communicate it. For example, if you return a value of a primitive
type like an integer or boolean from a function, it is not necessarily 100% clear what the return value means. But when you return a named value at the end of the
function, the name of the returned variable communicates the semantics.

You might think that being unable to return a value in the middle of a function would make
the function less readable because of lots of nested if-statements. This is possible, but one should remember that a function should be small. Aim to have a maximum of 5-9 lines of statements
in a single function. Following that rule, you never have _a hell of nested if-statements_ inside
a single function.

Having a single return statement at the end of a function makes refactoring the function easier. You can use automated
refactoring tools provided by your IDE. It is always harder to extract a new function from code containing
a return statement. The same is true for loops with a _break_ or _continue_ statement. It is easier to refactor code
inside a loop that does not contain a break or continue statement.

In some cases, returning a single value at the end of a function makes the code more straightforward and requires fewer lines of code.

Below is an example of a function with two return locations:

_TransformThread.cpp_
```
bool TransformThread::transform(
  const std::shared_ptr<InputMessage>& inputMessage
) {
  auto outputMessage = m_outputMessagePool->acquireMessage();
  bool messageIsFilteredIn;
  
  const bool messageWasTransformed = 
    m_messageTranformer->transform(inputMessage,
                                   outputMessage,
                                   messageIsFilteredIn);

  if (messageWasTransformed && messageIsFilteredIn)
  {
    m_outputMessages.push_back(outputMessage);
  }
  else
  {
    m_outputMessagePool->returnMessage(outputMessage);

    if (!messageWasTransformed)
    {
        return false;
    }
  }

  return true;
}
```

When analyzing the above function, we notice that it transforms an input message into an output message.
We can conclude that the function returns _true_ on successful message transformation. We can shorten the function by refactoring
it to contain only one return statement. After refactoring, it is 100% clear what the function return value means.

_TransformThread.cpp_
``` 
bool TransformThread::transforme(
  const std::shared_ptr<InputMessage>& inputMessage
) {
  auto outputMessage = m_outputMessagePool->acquireMessage();
  bool messageIsFilteredIn;
  
  const bool messageWasTransformed =
      m_messageTransformer->transform(inputMessage,
                                      outputMessage,
                                      messageIsFilteredIn);

  if (messageWasTransformed && messageIsFilteredIn)
  {
    m_outputMessages.push_back(outputMessage);
  }
  else
  {
    m_outputMessagePool->return(outputMessage);
  }

  return messageWasTransformed;
}
```

As an exception to this rule, you can have multiple return statements in a function when the function has optimal length and would become too long if it is refactored to contain a single return statement. Additionally, it is required that the semantic meaning of the return value is clear from the function name or the return type of the function. Below is an example of a function with multiple return statements. It is also clear
from the function name what the return value means. Also, the length of the function is optimal: seven statements. 

<div class="sourceCodeWithoutLabel">

```
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
```
</div>

If we refactored the above code to contain a single return statement, the code would become too long (10 statements) to fit in one function, as shown below. In this case, we should prefer the above code over the below code.

<div class="sourceCodeWithoutLabel">

```
private areEqual(
  iterator: MyIterator<T>,
  anotherIterator: MyIterator<T>
): boolean {
  let areEqual = true;
  
  while (iterator.hasNextElement()) {
    if (anotherIterator.hasNextElement()) {
      if (iterator.getNextElement() !== 
          anotherIterator.getNextElement()) {
       areEqual = false;
       break;
      }
    } else {
      areEqual = false;
      break;
    }
  }
  
  return areEqual;
}
```
</div>

As the second exception to this rule, you can use multiple return locations in a factory because you know
from the factory name what type of objects it creates. Below is an example factory with multiple return statements:

<div class="sourceCodeWithoutLabel">

```
enum class CarType 
{
  Audi,
  Bmw,
  MercedesBenz
};

class Car 
{
  // ...
};

class Audi : public Car 
{
  // ...
};

class Bmw : public Car 
{
  // ... 
};

class MercedesBenz : public Car 
{
  // ... 
};

class CarFactory 
{
public:
  std::shared_ptr<Car> createCar(const CarType carType) 
  {
    switch(carType) 
    {
      case CarType::Audi:
        return std::make_shared<Audi>();
      case CarType::Bmw:
        return std::make_shared<Bmw>();
      case CarType::MercedesBenz:
        return std::make_shared<MercedesBenz>();
      default:
        throw std::invalid_argument("Unknown car type");
    }
  }
};
```
</div>

## Prefer a Statically Typed Language for Production Code Principle

> Prefer a statically typed language when implementing production software. You can use an untyped language like Python for non-production code like integration, end-to-end and automated non-functional tests. And you can use Bash shell scripting for small scripts.

You can manage with a small software component without types, but when it grows bigger and more people are
working with it, the benefits of static typing become evident.

Let's analyze what potential problems using an untyped language might incur:

- Function arguments might be given in the wrong order
- Function argument might be given with the wrong type
- Not all function arguments are given (applicable in some languages)
- Function return value type might be misunderstood
- Forced to write public API comments to describe function signatures
- Type errors are not necessarily found in testing

### Function Arguments Might Be Given in Wrong Order

When using an untyped language, you can give arguments of the same type to a function in the wrong order. You won't get
a compilation error from this mistake. Modern IDEs can display inlay parameter hints for a function call. This is a feature you should consider enabling in your IDE.
Those parameter hints might reveal cases where arguments for a function are not given in the correct order.

### Function Argument Might Be Given with Wrong Type

When using an untyped language, you can give a function argument with the wrong type. For example,
a function requires a string representation of a number, but you provide a number. Properly naming function arguments can help. Instead of
naming a string argument, _amount_, the argument should be named as _amountString_ or _amountAsString_.

### Not All Function Arguments Are Given

In some languages, like JavaScript, you can give fewer arguments than expected to a function when you call it.
This results in having _undefined_ values for the arguments not given in the function call. You don't get an error from calling
a function with too few arguments.

### Function Return Value Type Might Be Misunderstood

Determining the function return value type can be difficult. It is not necessarily 100%
clear from the name of the function. For example, if you have a function named `getValue`, it is not 100% clear
what the return value type is. It might be apparent only if you know the context of the function well. As an improvement,
the function should be appropriately named, for example: `getValueAsString()`, if the returned value is always a string. If the return value type is unclear
from the function name, you must analyze the function's source code to determine the return value
type. That is unnecessary and error-prone manual work that can be avoided using a typed language.

### Forced to Write Public API Comments

When using an untyped language, you might be forced to document a public API using comments.
This is additional work that could be avoided by using static types. Writing API documentation with
comments is error-prone. You can accidentally write wrong information in the API documentation or
forget to update the documentation when you make changes to the API. Similarly, the
API documentation readers can make mistakes. They might not read the API documentation at all. Or they have
read it earlier but later misremember it.

### Type Errors Are Not Found in Testing

This is the biggest problem. You might think that if you have mistakes in your code related to having correct function arguments
with the correct types, testing will reveal those mistakes. This is typically a wrong assumption.
Unit testing won't find the issues because you mock other classes. You can only find
the issues in integration testing when you integrate the software component (i.e., test functions calling
other real functions instead of mocks). According to the testing pyramid, integration tests only cover a subset of the codebase,
less than unit tests. And depending on the integration testing code coverage, some function argument order
or argument/return value type correctness issues may be left untested and escape to production.

## Refactoring Principle

> You cannot write the perfect code on the first try, so you should always reserve some time for future refactoring.

You need to refactor even if you are writing code for a new software component. Refactoring is not related
to legacy codebases only. If you don't refactor, you let technical debt grow in the software. The main idea
behind refactoring is that no one can write the perfect code on the first try. Refactoring means that you
change code without changing the actual functionality. After refactoring, most of the tests should still
pass, the code is organized differently, and you have a better object-oriented design and improved naming of things.
Refactoring does not usually affect integration tests but can affect unit tests depending on the type and scale
of refactoring. Keep this in mind when estimating refactoring effort.

We don't necessarily reserve any or enough time for refactoring when we plan things. When we provide work estimates for epics, features, and user
stories, we should be conscious of the need to refactor and add some extra time to our initial work estimates
(which don't include refactoring). Refactoring is work that is not necessarily understood clearly by the management.
The management should support the need to refactor even if it does not bring clear added
value to an end user. But it brings value by not letting the codebase rot and removing technical debt. If you have
software with lots of accumulated technical debt, it is costly to develop new features and maintain the software. Also,
the quality of the software is lower, which can manifest in many bugs and lowered customer satisfaction.

Below is a list of the most common code smells and refactoring techniques to solve them:

| Code Smell                                 | Refactoring Solution                   |
|--------------------------------------------|----------------------------------------|
| Non-descriptive name                       | Rename                                 |
| Long method                                | Extract method                         |
| Complex expression                         | Extract constant                       |
| Long switch-case or if-then-else statement | Replace conditionals with polymorphism |
| Long parameter list                        | Introduce parameter object             |
| Shotgun surgery                            | Replace conditionals with polymorphism |
| Negated boolean condition                  | Invert If statement                    |

### Rename

This is probably the single most used refactoring technique. You often don't get the names right on the first try
and need to do renaming. Modern IDEs offer tools that help rename things in the code: interfaces, classes,
functions, and variables. The IDE's renaming functionality is always better than the plain old
search-and-replace method. If using the search-and-replace method, you can accidentally rename something that
is not wanted to be renamed or don't rename something that should have been renamed.

### Extract Method

This is probably the second most used refactoring technique. When you implement a public method of a class, the method
quickly grows in the number of code lines. A function should contain a maximum of 5-9 statements to keep it readable and understandable.
When a public method is too long, you should extract one or more private methods and call these private methods
from the public method. Every modern IDE has an _extract method_ refactoring tool that allows you to extract
private methods easily. Select the code lines you want to extract to a new method and press the IDE's shortcut key
for the _extract method_ functionality. Then give a descriptive name for the extracted method, and you are
done. In some cases, the refactoring is not automatic. For example, if the code to be extracted contains a _return_, _break_,
or _continue_ statement that affects the execution flow of the function (causing multiple return points). If you want to keep
your code refactorable, avoid using _break_, and _continue_ statements and have only a single return statement
at the end of the function. You can organize the arguments of the extracted method in better order
before completing the extraction in the IDE.

### Extract Constant

If you have a complex expression (boolean or numeric), assign the value of the expression to a constant.
The name of the constant conveys information about the expression. Below is an example where we make the if-statements read better
by extracting expressions to constants:

<div class="sourceCodeWithoutLabel">

```
// ...

if (dataSourceSelectorIsOpen &&
    measureSelectorIsOpen &&
    dimensionSelectorIsOpen
) {
  dataSourceSelectorContentElem.style.height =
    `${0.2 * availableHeight}px`;
    
  measureSelectorContentElem.style.height =
    `${0.4 * availableHeight}px`;
    
  dimensionSelectorContentElem.style.height =
    `${0.4 * availableHeight}px`;
} else if (!dataSourceSelectorIsOpen &&
           !measureSelectorIsOpen &&
           dimensionSelectorIsOpen
) {
    dimensionSelectorContentElem.style.height
      = `${availableHeight}px`;
}
```
</div>

Let's extract constants:

<div class="sourceCodeWithoutLabel">

```
// ...

const allSelectorsAreOpen = dataSourceSelectorIsOpen &&
                            measureSelectorIsOpen &&
                            dimensionSelectorIsOpen;
                            
const onlyDimensionSelectorIsOpen = 
    !dataSourceSelectorIsOpen && 
    !measureSelectorIsOpen &&
    dimensionSelectorIsOpen;

if (allSelectorsAreOpen) {
  dataSourceSelectorContentElem.style.height =
    `${0.2 * availableHeight}px`;
    
  measureSelectorContentElem.style.height =
    `${0.4 * availableHeight}px`;
    
  dimensionSelectorContentElem.style.height =
    `${0.4 * availableHeight}px`;  
} else if (onlyDimensionSelectorIsOpen) {
  dimensionSelectorContentElem.style.height =
    `${availableHeight}px`;
}
```
</div>

Below is an example in C++ where we return a boolean expression:

<div class="sourceCodeWithoutLabel">

```
bool AvroFieldSchema::equals(
  const std::shared_ptr<AvroFieldSchema>& otherFieldSchema
) const
{
  return m_type == otherFieldSchema->getType() &&
         m_name.substr(m_name.find_first_of('.') + 1U) ==
         otherFieldSchema->getName().substr(
          otherFieldSchema->getName().find_first_of('.') + 1U);
}
```

</div>

It can be challenging to understand what the boolean expression means.
We could improve the function by adding a comment: (We assume
that each field name has a root namespace that cannot contain a dot character)

<div class="sourceCodeWithoutLabel">

```
bool AvroFieldSchema::equals(
  const std::shared_ptr<AvroFieldSchema>& otherFieldSchema
) const
{
  // Field schemas are equal if field types are equal and
  // field names without the root namespace are equal
  return m_type == otherFieldSchema->getType() &&
         m_name.substr(m_name.find_first_of('.') + 1U) ==
         otherFieldSchema->getName().substr(
          otherFieldSchema->getName().find_first_of('.') + 1U);
}
```

</div>

But we should not write comments because comments are never 100% trustworthy. It is possible that a comment and the related code are not in synchrony: someone has changed the function without updating the comment or modified only the comment but
did not change the function.
Let's refactor the above example by removing the comment and extracting multiple constants.
The below function is longer than the original, but it is, of course, more readable. If you look
at the last two statements of the method, you can understand in what case two field schemas
are equal. It should be the compiler's job to make the below longer version of the function as performant as the original
function.

<div class="sourceCodeWithoutLabel">

```
bool AvroFieldSchema::equals(
  const std::shared_ptr<AvroFieldSchema>& otherFieldSchema
) const
{
  const auto fieldNameWithoutRootNamespace =
    m_name.substr(m_name.find_first_of('.') + 1U);

  const auto otherFieldName = otherFieldSchema->getName();

  const auto otherFieldNameWithoutRootNamespace =
    otherFieldName.substr(otherFieldName.find_first_of('.') + 1U);

  const bool fieldTypesAndNamesWithoutRootNsAreEqual = 
    m_type == otherFieldSchema->getType() &&
    fieldNameWithoutRootNamespace == otherFieldNameWithoutRootNamespace;

  return fieldTypesAndNamesWithoutRootNsAreEqual;
}
```

</div>

### Replace Conditionals with Polymorphism

Suppose you encounter a large switch-case statement or if/else-if structure in your code (not considering
code in factories). It means your software component does not have a proper object-oriented design. You should replace the conditionals with polymorphism. When you introduce proper OOD
in your software component, you move the functionality from a switch statement's case branches to different
classes that implement a particular interface. And similarly, you move the code from if and else-if statements
to different classes that implement a certain interface. This way, you can eliminate the switch-case and if/else-if statements
and replace them with a polymorphic method call.

Below is a TypeScript example of non-object-oriented design:

<div class="sourceCodeWithoutLabel">

```
function doSomethingWith(chart: Chart) {
  if (chart.getType() === 'column') {
    // do this
  } else if (chart.getType() === 'pie') {
    // do that
  } else if (chart.getType() === 'geographic-map') {
    // do a third thing
  }
}
```

</div>

Let's replace the above conditionals with polymorphism:

<div class="sourceCodeWithoutLabel">

```
interface Chart {
  doSomething(...): void;
}

class ColumnChart implements Chart {
  doSomething(...): void {
    // do this
  }
}

class PieChart implements Chart {
  doSomething(...): void {
    // do that
  }
}

class GeographicMapChart implements Chart {
  doSomething(...): void {
    // do a third thing
  }
}

function doSomethingWith(chart: Chart) {
  chart.doSomething();
}
```
</div>

Suppose you are implementing a data visualization application and have many places in your code where you check the chart type and need to introduce a new chart type.
It could mean you must add a new _case_ or _else-if_ statement in many places in the code. This approach is very error-prone and is called _shotgun surgery_
because you need to find all the places in the codebase where code needs to be modified. What you should do is conduct proper object-oriented design and introduce a new chart class
containing the new functionality instead of introducing that new functionality by modifying code in multiple places.

### Introduce Parameter Object

If you have more than 5-7 parameters for a function, you should introduce a parameter object to reduce
the number of parameters to keep the function signature more readable. Below is an example constructor
with too many parameters:

_KafkaConsumer.java_
```
public class KafkaConsumer {
  public KafkaConsumer(
    final List<String> brokers,
    final List<String> topics,
    final List<String> extraConfigEntries,
    final boolean tlsIsUsed,
    final boolean certShouldBeVerified,
    final String caFilePathName,
    final String certFilePathName,
    final String keyFilePathName)
  {
    // ...
  }
}
```

Let's group the Transport Layer Security (TLS) related parameters to a parameter class named `TlsOptions`:

_TlsOptions.java_
```
public class TlsOptions {
  public TlsOptions(
    final boolean tlsIsUsed,
    final boolean certShouldBeVerified,
    final String caFilePathName,
    final String certFilePathName,
    final String keyFilePathName
  ) {
    // ...
  }
}
```

Now we can modify the `KafkaConsumer` constructor to utilize the `TlsOptions` parameter class:

_KafkaConsumer.java_
```
public class KafkaConsumer {
  public KafkaConsumer(
    final List<String> brokers,
    final List<String> topics,
    final List<String> extraConfigEntries,
    final TlsOptions tlsOptions
  ) {
    // ...
  }
}
```

### Invert If Statement

This is a refactoring that a modern IDE can do for you.

Below is a Python example with a negated boolean expression in the if-statement condition.
Notice how difficult the boolean expression reads: "hostMountFolder _is not None_". It is a double-negative statement and thus difficult to read.

<div class="sourceCodeWithoutLabel">

```
def get_behave_test_folder(relative_test_folder = ""):
  host_mount_folder = os.environ.get("HOST_MOUNT_FOLDER")
  
  if host_mount_folder is not None:
    final_host_mount_folder = host_mount_folder
    if host_mount_folder.startswith("/mnt/c/"):
      final_host_mount_folder = host_mount_folder.replace("/mnt/c/", \
                                                          "/c/", 1)
                                                     
    behave_test_folder = final_host_mount_folder + "/" + \
                         relative_test_folder
  else:
    behave_test_folder = os.getcwd()

  return behave_test_folder
```
</div>

Let's refactor the above code so that the if and else statements are inverted:

<div class="sourceCodeWithoutLabel">

```
def get_behave_test_folder(relative_test_folder = ""):
  host_mount_folder = os.environ.get("HOST_MOUNT_FOLDER")
  
  if host_mount_folder is None:
    behave_test_folder = os.getcwd()
  else:
    final_host_mount_folder = host_mount_folder
    if host_mount_folder.startswith("/mnt/c/"):
      final_host_mount_folder = host_mount_folder.replace("/mnt/c/", \
                                                          "/c/", 1)
    behave_test_folder = final_host_mount_folder + "/" + \
                         relative_test_folder

  return behave_test_folder
```
</div>


Below is another example in C++:

<div class="sourceCodeWithoutLabel">

```
if (somePointer != nullptr) 
{
  // Do thing 1
}
else
{
  // Do thing 2
}
```
</div>

We should not have a negation in the if-statement's condition. Let's refactor the above example:

<div class="sourceCodeWithoutLabel">

```
if (somePointer == nullptr) 
{
  // Do thing 2
}
else
{
  // Do thing 1
}
```
</div>

## Static Code Analysis Principle

> Let the computer find bugs and issues in the code for you.

Static code analysis tools find bugs and design-related issues on your behalf. Use multiple static code analysis tools to get the full benefit. Different tools might detect
different issues. Using static code analysis tools frees people's time in code reviews to focus on things that automation cannot tackle.

Below is a list of some common static code analysis tools for different languages:

- Java
    - Jetbrains IntelliJ IDEA IDE inspections
    - SonarLint
    - SonarQube/SonarCloud
- C++
    - Jetbrains CLion IDE inspections
    - Clang-Tidy
    - MISRA C++ 2008 guidelines
    - CppCheck
    - SonarLint
    - SonarQube/SonarCloud
- TypeScript
    - Jetbrains WebStorm IDE inspections
    - ESLint (+ various plugins, like TypeScript plugin)
    - SonarLint
    - SonarQube/SonarCloud

Infrastructure and deployment code should be treated the same way as source code. Remember to run static code analysis
tools on your infrastructure and deployment code, too. Several tools are available for analyzing infrastructure and deployment code, like _Checkcov_, which can be used for analyzing Terraform, Kubernetes, and Helm code. Helm tool contains a linting command
to analyze Helm chart files, and _Hadolint_ is a tool for analyzing _Dockerfiles_ statically.

### Common Static Code Analysis Issues

&nbsp;

| Issue                                                                                        | Description/Solution                                                                                                                                                                                                                                |
|----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Chain of instance of checks                                                                  | This issue indicates a chain of conditionals in favor of object-oriented design. Use the _replace conditionals with polymorphism_ refactoring technique to solve this issue.                                                                        |
| Feature envy                                                                                 | Use the _don't ask, tell principle_ from the previous chapter to solve this issue.                                                                                                                                                                  |
| Use of concrete classes                                                                      | Use the _program against interfaces_ principle from the previous chapter to solve this issue.                                                                                                                                                       |
| Assignment to a function argument                                                            | Don't modify function arguments but introduce a new variable. You can avoid this issue in Java by declaring function parameters as _final_.                                                                                                         |
 | Commented-out code                                                                           | Remove the commented-out code. If you need that piece of code in the future, it is available in the version control system forever.                                                                                                                 |
| Const correctness                                                                            | Make variables and parameters const or final whenever possible to achieve immutability and avoid accidental modifications                                                                                                                           |
| Nested switch statement                                                                      | Use switch statements mainly only in factories. Do not nest them.                                                                                                                                                                                   |
 | Nested conditional expression                                                                | Conditional expression (?:) should not be nested because it greatly hinders the code readability.                                                                                                                                                   |
 | Overly complex boolean expression                                                            | Split the boolean expression into parts and introduce constants to store the parts and the final expression                                                                                                                                         |
 | Expression can be simplified                                                                 | This can be refactored automatically by the IDE.                                                                                                                                                                                                    |
 | Switch statement without default branch                                                      | Always introduce a default branch and throw an exception from there. Otherwise, when you are using a switch statement with an enum, you might encounter strange problems after adding a new enum value that is not handled by the switch statement. | 
| Law of Demeter                                                                               | The object knows too much. It is coupled to the dependencies of another object, which creates additional coupling and makes code harder to change.                                                                                                  |
 | Reuse of local variable                                                                      | Instead of reusing a variable for a different purpose, introduce a new variable. That new variable can be named appropriately to describe its purpose.                                                                                              |
| Scope of variable is too broad                                                               | Introduce a variable only just before it is needed.                                                                                                                                                                                                 |
 | Protected field                                                                              | Subclasses can modify the protected state of the superclass without the superclass being able to control that. This is an indication of breaking the encapsulation and should be avoided.                                                           |
 | Breaking the encapsulation: Return of modifiable/mutable field                               | Use the _don't leak modifiable internal state outside an object principle_ from the previous chapter to solve this issue.                                                                                                                           |
 | Breaking the encapsulation: Assignment from a method parameter to a modifiable/mutable field | Use the _don't assign from a method parameter to a modifiable field principle_ from the previous chapter to solve this issue.                                                                                                                       |
 | Non-constant public field                                                                    | Anyone can modify a public field. This breaks the encapsulation and should be avoided.                                                                                                                                                              |
 | Overly broad catch-block                                                                     | This can indicate a wrong design. Don't catch the language's base exception class if you should only catch your application's base error class, for example. Read more about handling exceptions in the next section.                               |
 
## Error/Exception Handling Principle

Many languages like C++, Java, and TypeScript have an exception-handling mechanism that can
handle errors and exceptional situations. First of all, I want to make a clear distinction between these two words:

> An _error_ is something that can happen, and one should be prepared for it. An _exception_ is something that _should_ never happen.

You define errors in your code and raise them in your functions. For example, if you try to write to
a file, you must be prepared for the error that the disk is full, or if you are reading a file, you must be prepared
for the error that the file does not exist (anymore).

Many errors are recoverable. You can delete files
from the disk to free up some space to write to a file. Or, in case a file is not found, you can give a "file not found" error to the user, who can then retry the operation using
a different file name, for example. Exceptions are something you don't usually define in your application, but the system
raises them in _exceptional situations_, like when a programming error is encountered.

An exception can be raised, for example, when memory is low, and memory
allocation cannot be performed, or when a programming error results in an array index out of bounds or
null pointer. When an exception is thrown, the program cannot continue executing
normally and might need to terminate. This is why many exceptions can be categorized as unrecoverable errors. In some cases,
it is possible to recover from exceptions. Suppose a web service encounters a null pointer exception while handling an HTTP request. In that case,
you can terminate the handling of the current request, return an error response to the client, and continue handling further
requests normally. It depends on the software component how it should handle exceptional situations.

Do not confuse errors here with Java errors (inherited from the `Error` class). They are fatal errors that
indicate a severe problem, a panic situation. As the Java documentation says, you should not catch these fatal
errors in your code. Using the word "Error" in the class name to indicate a fatal situation is a wrong design decision
made by the Java creators. A better name would have been a `FatalException`, for example.

Errors define situations where the execution of a function fails for some reason. Typical examples of errors are
a file not found error, an error in sending an HTTP request to a remote service, or failing to parse a configuration
file. Suppose a function can throw an error. Depending on the error, the function caller can decide how to handle the error. In case of transient errors, like
a failing network request, the function caller can wait a while and call the function again. Or, the function caller
can use a default value. For example, if a function tries to
load a configuration file that does not exist, it can use some default configuration instead. And in some cases,
the function caller cannot do anything but leave the error unhandled or catch the error but throw
another error at a higher level of abstraction. Suppose a function tries to load a configuration file, but the loading fails, and no
default configuration exists. In that case, the function cannot do anything but pass the error to its caller. Eventually,
this error bubbles up in the call stack, and the whole process is terminated due to the inability to
load the configuration. This is because the configuration is needed to run the application. Without configuration,
the application cannot do anything but exit.

When defining error classes, define a base error class for your software component. For example, for the data exporter
microservice, define a `DataExporterError` base error class. For each function that can throw, define a base error class at the same abstraction level as the function. That error class should extend the software component's base error class. For example, if you have a
`parse(configStr)` function in the `ConfigParser` class, define a base error class for the function with the name `ConfigParseError`.
If you have a `readFile` function, define a base error class with the name `FileReadError`. If you have a class where all methods can
throw an error, it might be better to define a base error class at the class level. For example, if you have a `UserService`
class with throwing methods, you can specify a `UserServiceError` class and throw an error of that class from the `UserService` class methods.

Below is an example of errors defined for the data exporter microservice:

<div class="sourceCodeWithoutLabel">

```
public class DataExporterError extends RuntimeException {
  public DataExporterError(final String message) {
    super(message);
  }
}

public class FileReadError extends DataExporterError {
  public FileReadError(final String message) {
    super(message);
  }
}

public class ConfigParseError extends DataExporterError {
  public ConfigParseError(final String message) {
    super(message);
  }
}
```
</div>

Following the previous rules makes it easy to catch errors in the code because you can infer the error class
name from the called method (or class) name. In the below example, we can infer the `FileReadError` error class name from the `readFile`
method name:

<div class="sourceCodeWithoutLabel">

```
try {
  final String fileContents = fileReader.readFile(...);
} catch (final FileReadError error) {
  // Handle error
}
```
</div>

You can also catch all user-defined errors using the software component's base error class in the catch
clause. The below two examples have the same effect.

<div class="sourceCodeWithoutLabel">

```
try {
  final String configFileContents = fileReader.readFile(...);
  return configParser.parse(configFileContents);
} catch (final FileReadError | ConfigParseError error) {
  // Handle error situation
}
```
</div>

<div class="sourceCodeWithoutLabel">

```
try {
  final String configFileContents = fileReader.readFile(...);
  return configParser.parse(configFileContents);
} catch (final DataExporterError error) {
  // Handle error situation
}
```
</div>

Don't catch the language's base exception class or some other too-generic exception class because that will catch, in addition
to all user-defined errors, exceptions, like null pointer exceptions, which is probably not what you want. So, do
not catch a too-generic exception class like this:

<div class="sourceCodeWithoutLabel">

```
try {
  final String configFileContents = fileReader.readFile(...);
  return configParser.parse(configFileContents);
} catch (final Exception exception) {
  // Do not use! Catches all exceptions
}
```
</div>

Also, do not catch the `Throwable` class in Java because it will also catch any fatal errors that are not meant to be caught:

<div class="sourceCodeWithoutLabel">

```
try {
  final String configFileContents = fileReader.readFile(...);
  return configParser.parse(configFileContents);
} catch (final Throwable throwable) {
  // Do not use! Catches everything including
  // all exceptions and fatal errors
}
```
</div>

Catch all exceptions only in special places in your code, like in the main function or the main loop, like the loop in a web service
processing HTTP requests or the main loop of a thread. Below is an example of correctly catching the language's base exception class in the main function.
When you catch an unrecoverable exception in the main function, log it and exit the process with an appropriate error code. When you catch an
unrecoverable error in a main loop, log it and continue the loop if possible.

<div class="sourceCodeWithoutLabel">

```
public static void main(final String[] args) {
  // ...

   try {
     dataExporter.run(...);
   } catch (final Exception exception) {
     logger.log(exception);
     System.exit(1);
   }
}
```
</div>

You can also make your software component throw exceptions if needed. In the below
example, we have created a base exception class for the data exporter microservice and derived one specific exception
from it:

<div class="sourceCodeWithoutLabel">

```
public class DataExporterException extends RuntimeException {
  public DataExporterException(final String message) {
    super(message);
  }
}

public class MySpecificException extends DataExporterException {
  public MySpecificException(final String message) {
    super(message);
  }
}
```
</div>

Using the above-described rules, you can make your code future-proof or forward-compatible so that adding new errors to be thrown from a function
in the future is possible. Let's say that you are using a `fetchConfig` function like this:

<div class="sourceCodeWithoutLabel">

```
try {
  final var configuration = configFetcher.fetchConfig(configUrl);
} catch (final ConfigFetchError error) {
  // Handle error
}
```
</div>

Your code should still work if a new type of error is thrown from the `fetchConfig` function. Let's say that the following new errors
could be thrown from the `fetchConfig` function:

- Malformed URL error
- Server not found error
- Connection timeout error

When classes for these new errors are implemented, they must extend the function's base error class, in this case, the `ConfigFetchError` class.
Below are the new error classes defined:

<div class="sourceCodeWithoutLabel">

```
public class MalformedConfigUrlError extends ConfigFetchError {
  public MalformedConfigUrlError(final String message) {
    super(message);
  }
}

public class ConfigServerNotFoundError extends ConfigFetchError {
  public ConfigServerNotFoundError(final String message) {
    super(message);
  }
}

public class ConfigFetchTimeoutError extends ConfigFetchError {
  public ConfigFetchTimeoutError(final String message) {
    super(message);
  }
}
```
</div>

You can later enhance your code and handle different errors thrown from the `fetchConfig`differently.
For example, you might want to handle a `ConfigFetchTimeoutError` so that the function will wait a while and then retry the
operation because the error can be transient:

<div class="sourceCodeWithoutLabel">

```
try {
  final var configuration = configFetcher.fetchConfig(configUrl);
} catch (final ConfigFetchTimeoutError error) {
  // Retry after a while
} catch (final MalformedConfigUrlError error) {
  // Inform caller that URL should be checked
} catch (final ConfigServerNotFoundError error) {
  // Inform caller that URL host/port cannot be reached
} catch (final ConfigFetchError error) {
  // Handle possible other error situations
  // This will catch any new exception that could be thrown
  // from the 'fetchConfig' function in the future
}
```
</div>

In the above examples, we handled thrown errors correctly, but you can easily forget to handle a thrown error.
This is because nothing in the function signature tells you whether the function can throw or not. The only way to find out
is to check the documentation (if available) or investigate the source code (if available). This is one of the biggest problems regarding error handling because you must know and remember that a function can
throw, and you must remember to catch and handle errors. You don't always want to handle an error immediately, but still, you must be aware that the error will bubble up in the call stack and should be
dealt with eventually somewhere in the code.

The solution to this problem is to make throwing errors more explicit:

> Use a 'try' prefix in the function name if the function can throw an error.

This is a straightforward rule. If a function can throw an error, name the function so that its name starts with `try`.
This makes it clear to every caller that the function can throw an error, and the caller should be prepared
for that. For the caller of the function, there are three alternatives to deal with a thrown error:

1) Catch the base error class of the called function (or class or software component) and handle the error, e.g., catch `DataFetchError` if you are calling a function named `tryFetchData`.
2) Catch the base error class of the called function (or class or software component) and throw a new error on a higher level of abstraction. Now you also have to name the calling function with a `try` prefix.
3) Don't catch errors. Let them propagate upwards in the call stack. Now you also have to name the calling function with a `try` prefix.

Here is an example of alternative 1:

<div class="sourceCodeWithoutLabel">

```
public class ConfigFetcher {
  public Configuration fetchConfig(final String configUrl) {
    try {
      final var configDataStr = dataFetcher.tryFetchData(configUrl);
      return configParser.tryParse(configDataStr);
    } catch (final DataFetchError | ConfigParseError error) {
      // You could also catch DataFetchError and 
      // ConfigParseError in different catch clauses
      // if their handling differs
      // You could also catch the base error class DataExporterError 
      // of the software component 
    }
  }
}
```
</div>

And here is an example of alternative 2:

<div class="sourceCodeWithoutLabel">

```
public class ConfigFetcher {
  public Configuration tryFetchConfig(final String configUrl) {
    try {
      final var configDataStr = dataFetcher.tryFetchData(configUrl); 
      return configParser.tryParse(configDataStr);
    } catch (final DataFetchError | ConfigParseError error) {
      // Error on higher level of abstraction is thrown
      // This function must be named with the 'try' prefix
      // to indicate that it can throw
      throw new ConfigFetchError(...);
    }
  }
}

public class DataExporter {
  public void initialize(...) {
    try {
      final var configuration = configFetcher.tryFetchConfig(...);
    } catch (final ConfigFetchError error) {
      // Handle error
    }
  }
}
```
</div>

And here is an example of alternative 3:

<div class="sourceCodeWithoutLabel">

```
public class ConfigFetcher {
  public Configuration tryFetchConfig(final String configUrl) {
    final var configDataStr = dataFetcher.tryFetchData(configUrl);
    return configParser.tryParse(configDataStr);
      
    // No try-catch, all thrown errors from both tryFetchData
    // and tryParseConfiguration function calls propagate
    // to the caller and 
    // this function must be named with the 'try' prefix
    // to indicate that it can throw
  }
}

public class DataExporter {
  public void initialize(...) {
    try {
      final var configuration = configFetcher.tryFetchConfig(...);
    } catch (final DataExporterError error) {
      // In this case you must catch the base error class of
      // the software component (DataExporterError), because
      // you don't know what errors tryFetchConfig can
      // throw, because no ConfigFetchError class
      // has been defined
    }
  }
}
```
</div>

As a side note, a linting rule that enforces the correct naming of throwing functions could be developed.
The rule should force the function name to have a _try_ prefix if the function throws or propagates errors. A function propagates errors
when it calls a throwing (try-prefixed) method outside a try-catch block.

You can also create a library that has try-prefixed functions that wrap throwing functions that don't follow the try-prefix rule:

_JsonParser.js_
```
export default class JsonParser {
  static tryParse(json, reviver) {
    return JSON.parse(json, reviver);
  }
}
```

When using a web framework, the framework usually provides an error-handling mechanism. The framework catches an error and maps it to an HTTP response with an HTTP status code indicating a failure. Typically
the default status code is 500 _Internal Server Error_. For example, when using Spring Boot, you can mark your custom error classes
with a `@ResponseStatus` annotation:

<div class="sourceCodeWithoutLabel">

```
@ResponseStatus(HttpStatus.BAD_REQUEST)
class MyError extends RuntimeException {
  // ...
}
```
</div>

There are also alternative ways to map errors to HTTP responses in the Spring framework.

When you utilize a web framework's error-handling mechanism,
there is no benefit in naming throwing functions with the try-prefix. You can opt out of the try-prefix rule.

It is usually a good practice to document the used error handling mechanism in the software component documentation.

### Handling Checked Exceptions in Java

You can use checked exceptions in Java when defining your software component's errors. Using checked exceptions helps you to remember to handle errors or let them propagate upwards in the call stack.

When using Java's checked exceptions, define the software component's base error class to extend the `Exception` class instead of the `RuntimeException` class. When a function throws a checked exception,
it is unnecessary to prefix the function name with the _try_ prefix. Below is an example of defining checked exceptions:

<div class="sourceCodeWithoutLabel">

```
public class DataExporterError extends Exception {
  public DataExporterError(final  message) {
    super(message);
  }
}

public class DataFetchError extends DataExporterError {
  public DataFetchError(final String message) {
    super(message);
  }
}

public class ConfigParseError extends DataExporterError {
  public ConfigParseError(final String message) {
    super(message);
  }
}

public class InitializationError extends DataExporterError {
  public InitializationError(final String message) {
    super(message);
  }
}

public class DataFetcher {
  public String fetchData(...) 
  throws DataFetchError {
    // ...
  }
}

public class ConfigParser {
  public Configuration parse(...) 
  throws ConfigParseError {
    // ...
  }
}

public class DataExporter {
  public void initialize(...) throws InitializationError {
    try {
      final var configDataStr = dataFetcher.fetchData(configUrl);
      final var configuration = configParser.parse(configDataStr);
       
      // ...
    } catch (final DataFetchError | ConfigParseError error) {
      throw new InitializationError(error);
    }
  }
}
```
</div>

Later, it is possible to modify the implementation of the `parse` function to throw other
errors that derive from the `ConfigParseError` class. This kind of change does not require
modifications to other parts of the codebase.

On higher levels of the software component code, you can also use the base error class of the software component in the
`throws` clause to propagate errors upwards in the call stack:

<div class="sourceCodeWithoutLabel">

```
public class DataExporter {
  public void initialize(...) throws DataExporterError {
    final var configDataStr = dataFetcher.fetchData(configUrl);
    final var configuration = configParser.parse(configDataStr);  
            
    // ...
  }
}
```
</div>

### Returning Errors

As an alternative to throwing errors, it is possible to
communicate erroneous behavior to the function caller using a return value. Using an exception-handling mechanism
provides some advantages over returning errors. When a function can return an error, you must always check
for the error right after the function call. This can cause the code to contain nested if-statements, which hinders code readability.
The exception-handling mechanism allows you to propagate an error
to a higher level in the call stack. You can also execute multiple function calls that can fail inside
a single `try` block and provide a single error handler in the `catch` block. Some languages do not provide an exception-handling mechanism meaning you must return errors from functions. In
languages like C++, you can optimize mission-critical code by returning error values or indicators instead of throwing exceptions.

#### Returning Failure Indicator

You can return a failure indicator from a failable function when the function does not need to return any additional value.
It is enough to return a failure indicator from the function when there is no need to return any specific error code or message.
This can be because there is only one reason the function can fail, or function callers are not interested in error details.
To return a failure indicator, return a boolean value from the function: _true_ means a successful operation, and _false_ indicates a failure:

<div class="sourceCodeWithoutLabel">

```
bool performTask(...) 
{
  bool taskWasPerformed;
  
  // Perform the task and set the value of 'taskWasPerformed' 
  
  return taskWasPerformed;
}
```

</div>

#### Returning an Optional Value

Suppose a function should return a value, but the function call can fail, and there is precisely one cause
why the function call can fail. In this case,
return an optional value from the function. In the below example, getting a value from the cache can only fail when
no value for a specific key is stored in the cache. We don't need to return any error code or message.

_Cache.java_
```
public interface Cache<K, V> {
  void add(K key, V value);
  Optional<V> get(K key);
}
```

#### Returning an Error Object

When you need to provide details about an error to a function caller, you can return an error object from the function:

_BackendError.ts_
```
export type BackendError = {
  statusCode: number;
  errorCode: number;
  message: string;
};
```

If a function does not return any value but can produce an error, you can return either an error object or
_null_ in languages that have _null_ defined as a distinct type and the language supports type unions (e.g., TypeScript):

_DataStore.ts_
```
export interface DataStore {
  updateEntity<T extends Entity>(...):
    Promise<BackendError | null>;
}
```

Alternatively, return an optional error. Below is an example in Java:

<div class="sourceCodeWithoutLabel">

```
import lombok.experimental.Value;

@Value
public class BackendError {
  int statusCode;
  int errorCode;
  String message;
}

public interface DataStore {
  <T extends Entity> Optional<BackendError> updateEntity(...);
}
```
</div>

Suppose a function needs to return a value or an error. In that case, you can use a 2-tuple (i.e., a pair) type, where
the first value in the tuple is the actual value or _null_ in case of an error and the second value
in the tuple is an error object or _null_ value in case of a successful operation. Below are examples
in TypeScript and Java. In the Java example, you, of course, need to return optionals instead of nulls.

_DataStore.ts_
```
export class DataStore {
  createEntity<T extends Entity>(...):
    Promise<[T, null] | [null, BackendError]>;
}
```

_DataStore.java_
```
import org.javatuples.Pair;

public interface DataStore {
  <T extends Entity> Pair<Optional<T>, Optional<BackendError>>
  createEntity(...);
}
```

The above Java example is cumbersome to use, and the type definition looks long.
We should use an `Either` type here, but Java does not have that. Either type contains one of two values, either
a left value or a right value. The left value is the value returned by the function when the operation is successful, and the right value
is an error. The `Either` type can be defined as follows:

_Either.java_
```
public class Either<L, R>
{
  private final Optional<L> maybeLeftValue;
  private final Optional<R> maybeRightValue;
  
  private Either(
    final Optional<L> maybeLeftValue,
    final Optional<R> maybeRightValue
  ) {
    this.maybeLeftValue = maybeLeftValue;
    this.maybeRightValue = maybeRightValue;
  }
  
  public static <L, R> Either<L, R> withLeft(
    final L value
  ) {
    return new Either<>(Optional.of(value), Optional.empty());
  }
  
  public static <L, R> Either<L, R> withRight(
    final R value
  ) {
    return new Either<>(Optional.empty(), Optional.of(value));
  }

  public boolean hasLeftValue() {
    return maybeLeftValue.isPresent();
  }

  public <T> Either<T, R> mapLeft(
    Function<? super L, ? extends T> mapper
  ) {
    return new Either<>(maybeLeftValue.map(mapper),
                        maybeRightValue);
  }

  public <T> Either<L, T> mapRight(
    Function<? super R, ? extends T> mapper)
  {
      return new Either<>(maybeLeftValue,
                          maybeRightValue.map(mapper));
  }
  
  public <T> T map(
    Function<? super L, ? extends T> leftValueMapper,
    Function<? super R, ? extends T> rightValueMapper)
  {
    return maybeLeftValue.<T>map(leftValueMapper)
      .orElseGet(() -> 
        maybeRightValue.map(rightValueMapper).get());
  }
  
  public void apply(
    Consumer<? super L> leftValueConsumer,
    Consumer<? super R> rightValueConsumer
  ) {
    maybeLeftValue.ifPresent(leftValueConsumer);
    maybeRightValue.ifPresent(rightValueConsumer);
  }
}
```

Now we can use the new `Either` type and rewrite the example as follows:

_DataStore.java_
```
public interface DataStore {
  <T extends Entity> Either<T, BackendError> createEntity(...);
}
```

#### Adapt to Wanted Error Handling Mechanism

You can adapt to a desired error-handling mechanism by creating an adapter method. For example, if a library has a throwing method,
you can create an adapter method returning an optional value or error object. Below is a `tryCreate`
factory method in a `VInt` class that can throw:

_VInt.ts_
```
class VInt {
  // ...

  private constructor(...) {
    // ...
  }

  // this will throw if invalid 'value' is given
  // that doesn't match the 'validationSpec'
  static tryCreate<VSpec extends string>(
    validationSpec: IntValidationSpec<VSpec>,
    value: number
  ): VInt<VSpec> | never {
    // constructor can throw
    return new VInt(validationSpec, value);
  }

  // ...
}
```

We can create a `VIntFactory` class with an adapter method for the `tryCreate` factory method in the `VInt` class.
The `VIntFactory` class offers a non-throwing `create` method:

_VIntFactory.ts_
```
class VIntFactory {
  static create<VSpec extends string>(
    validationSpec: IntValidationSpec<VSpec>,
    value: number
  ): VInt<VSpec> | null {
    try {
      return VInt.tryCreate(validationSpec, value);
    } catch {
      return null;
    }
  }
}
```

We can also create a method that does not throw but returns either a value or an error:

_VIntFactory.ts_
```
class VIntFactory {
  static createOrError<VSpec extends string>(
    validationSpec: IntValidationSpec<VSpec>,
    value: number
  ): [VInt<VSpec>, null] | [null, Error] {
    try {
      return [VInt.tryCreate(validationSpec, value), null];
    } catch (error) {
      return [null, error as Error];
    }
  }
}
```

We can also introduce a simplified version of the `Either` type for TypeScript:

_Either.ts_
```
export type Either<L, R> = [L, null] | [null, R];
```

Now we can rewrite the above example like this:

_VIntFactory.ts_
```
class VIntFactory {
  static createOrError<VSpec extends string>(
    validationSpec: IntValidationSpec<VSpec>,
    value: number
  ): Either<VInt<VSpec>, Error> {
    try {
      return [VInt.tryCreate(validationSpec, value), null];
    } catch (error) {
      return [null, error as Error];
    }
  }
}
```

#### Asynchronous Function Error Handling

Asynchronous functions are functions that usually can fail. They often execute I/O operations like file or
network I/O. For a failable asynchronous operation, you must remember to handle the failure case. For this reason, it is
suggested to name a failable asynchronous operation using the same _try_ prefix used in function names that can throw.
Below are two examples of handling an asynchronous operation failure in JavaScript/TypeScript:

<div class="sourceCodeWithoutLabel">

```
tryMakeHttpRequest(url).then((value) => {
  // success
}, (error) => {
  // Handle error
});
```
</div>

<div class="sourceCodeWithoutLabel">

```
tryMakeHttpRequest(url).then((value) => {
  // success
}).error((error) => {
  // Handle error
});
```
</div>

As you can see from the above examples, it is easy to forget to add the error handling.
It would be better if there was a `thenOrCatch` method in the `Promise` class that accepted the following kind of callback:

<div class="sourceCodeWithoutLabel">

```
tryMakeHttpRequest(url).thenOrCatch(([value, error]) => {
  // Now it is harder to forget to handle an error
  // Check 'error' before using the 'value'
});
```
</div>

You can make asynchronous function calls synchronous. In JavaScript/TypeScript, this can be done
using the `async` and `await` keywords. A failable asynchronous operation made synchronous can throw. Below is the same example as above made synchronous:

<div class="sourceCodeWithoutLabel">

```
async function fetchData() {
  try {
    await tryMakeHttpRequest(url);
  } catch {
    // Handle error
  }
}
```
</div>

#### Functional Exception Handling

The below `Failable<T>` class can be used in functional error handling. A `Failable<T>` object represents either
a value of type `T` or an instance of the `RuntimeException` class.

_Failable.java_
```
public class Failable<T> {
  private final Either<T, RuntimeException> valueOrError;

  private Failable(
    final Either<T, RuntimeException> valueOrError
  ) {
    this.valueOrError = valueOrError;
  }

  public static <T> Failable<T> withValue(
    final T value
  ) {
    return new Failable<>(Either.withLeft(value));
  }

  public static <T> Failable<T> withError(
    final RuntimeException error
  ) {
    return new Failable<>(Either.withRight(error));
  }

  public T orThrow(
    final Class<? extends RuntimeException> ErrorClass
  ) {
    return valueOrError.map(
      (value) -> value,
      (error) -> {
          try {
            throw (RuntimeException)ErrorClass
              .getConstructor(String.class)
              .newInstance(error.getMessage());
          } catch (InvocationTargetException |
                   InstantiationException |
                   IllegalAccessException |
                   IllegalArgumentException | 
                   NoSuchMethodException exception) {
            throw new RuntimeException(exception);
          }
      });
  }

  public T orElse(final T otherValue) {
    return valueOrError.map(value -> value,
                            error -> otherValue);
  }

  public <U> Failable<U> mapValue(
    final Function<? super T, ? extends U> mapper
  ) {
    return new Failable<>(valueOrError.mapLeft(mapper));
  }

  public Failable<T> mapError(
    final Function<? super RuntimeException,
                   ? extends RuntimeException> mapper
  ) {
    if (valueOrError.hasLeftValue()) {
      final var error = 
        new RuntimeException(mapper
          .apply(new RuntimeException(""))
          .getMessage());

      return Failable.withError(error);
    } else {
      return new Failable<>(valueOrError.mapRight(mapper));
    }
  }
}
```

In the below example, the `readConfig` method returns a `Failable<Configuration>`. The `tryInitialize` function either obtains an instance of
`Configuration` or throws an error of type `InitializationError`.

<div class="sourceCodeWithoutLabel">

```
public void tryInitialize() {
  final var configuration = configReader
    .readConfig(...)
    .orThrow(InitializationError.class);
}
```
</div>

The benefit of the above functional approach is that it is shorter than an entire try-catch block. The above functional approach is also as understandable as a try-catch block.
Remember that you should write the shortest, most understandable code. When a method returns a failable, you don't have to name the method
with the _try_ prefix because the method does not throw.

You can also use other methods of the `Failable` class. For example, a default value can be returned with the `orElse` method:

<div class="sourceCodeWithoutLabel">

```
public void initialize() {
  final var configuration = configReader
    .readConfig(...)
    .orElse(new DefaultConfiguration());
}
```
</div>

You can also transform multiple imperative failable statements into functional failable statements. For example, instead of writing:

<div class="sourceCodeWithoutLabel">

```
public void tryInitialize() {
  try {
    final var configDataStr = dataFetcher.tryFetchData(configUrl); 
    final var configuration = configParser.tryParse(configDataStr);
  } catch (final DataExporterError error) {
    throw new InitializationError(error.getMessage());
  }
}
```
</div>

You can write:

<div class="sourceCodeWithoutLabel">

```
public void tryInitialize() {
  try {
    final var configuration = dataFetcher
      .fetchData(configUrl)
      .mapValue(configParser::parse)
      .orThrow(InitializationError.class);
}
```
</div>

It is error-prone to use failable imperative code together with functional programming constructs.
Let's assume we have the below TypeScript code that reads and parses multiple configuration files to
a single configuration object:

<div class="sourceCodeWithoutLabel">

```
configFilePathNames
  .reduce((accumulatedConfig, configFilePathName) => {
    const configJson = fs.readFileSync(configFilePathName, 'utf-8');
    const configuration = JSON.parse(configJson);
    return { ...accumulatedConfig, ...configuration };
}, {});
```
</div>

In the above example, it is easy to forget to handle errors because the throwability of the `reduce` function
depends on the supplied callback function. We cannot use the try-prefix anywhere in the above example.
What we can do is the following:

<div class="sourceCodeWithoutLabel">

```
function tryReadConfig(
  accumulatedConfig: Record<string, unknown>,
  configFilePathName: string
) {
  const configJson = fs.readFileSync(configFilePathName, 'utf-8');
  const configuration = JSON.parse(configJson);
  return { ...accumulatedConfig, ...configuration };
}

export function getConfig(
  configFilePathNames: string[]
): Record<string, unknown> {
  try {
    return configFilePathNames.reduce(tryReadConfig, {});
  } catch (error) {
    // ...
  }
}
```
</div>

We have now added the try-prefix, but the code could read better.
A better alternative is to use a functional programming construct, `Failable<T>`, to return a failable configuration. The `Failable<T>` class implementation in
TypeScript is not presented here, but it can be implemented similarly
to Java. Below is an example of using the `Failable<T>` class:

<div class="sourceCodeWithoutLabel">

```
function accumulatedConfigOrError(
  accumulatedConfigOrError: Failable<Record<string, unknown>>,
  configFilePathName: string
): Failable<Record<string, unknown>> {
  try {
    const configJson = fs.readFileSync(configFilePathName, 'utf-8');
    const config = JSON.parse(configJson);
    
    return accumulatedConfigOrError.mapValue(accumulatedConfig =>
      ({ ...accumulatedConfig, ...config }));
  } catch (error: any) {
    return accumulatedConfigOrError.mapError(accumulatedError =>
      new Error(`${accumulatedError.message}\n${error.message}`)
    );
  }
}

export function getConfig(
  configFilePathNames: string[]
): Failable<Record<string, unknown>> {
  return configFilePathNames.reduce(
    accumulatedConfigOrError,
    Failable.withValue({})
  );
}
```
</div>

#### Stream Error Handling

Handling errors for a stream is also something that can be easily forgotten. Streams are usually used for I/O operations that can fail.
You should be prepared for error handling when using a stream. In JavaScript/TypeScript,
an error handler for a stream can be registered using the stream's `on` method in the following way: `stream.on('error', () => { ... })`.

Below is an example of using a stream:

<div class="sourceCodeWithoutLabel">

```
// ...

const writeStream = fs.createWriteStream(filePathName);
    
this.writeStream.on('error', (error) => {
   // Handle errors
});

writeStream.write(...);
// More writes...

writeStream.close();
```

</div>

How could we improve developer experience with streams, so that error handling is not forgotten?
One solution is to add an error handler callback parameter to the stream factory method. This callback will be called upon an error. If no
error handling is needed, a _null_ value could be given for the callback. This way, a developer creating a stream can't forget to
supply an error handler function.

## Don't Pass or Return Null Principle

This principle is for languages like Java and C++ that don't implement null values as separate types.
TypeScript implements nulls as distinct types when the _strictNullChecks_ configuration parameter is set to true,
and you should always set it to true. So, this principle does not apply to TypeScript.

The null value is the misguided invention of British computer scientist _Tony Hoare_ who coined his invention
of null references as a "billion-dollar mistake". The reason is quite evident because we all have done it: forgetting to handle a null value. And when we don't handle a null value, we pass it to other functions that never expect to be called with a null value. Eventually, this will lead
to a null value exception thrown somewhere in the code.

When you return a value from a function, never return a null value. You should return an optional value
instead. In the below example, we are returning an optional value for a key in a map because there can be no value associated with a particular key in the map.

<div class="sourceCodeWithoutLabel">

```
// BAD!
public class Map<K, V> {
  public V get(final K key) {
    if (...) {
      // ...
    } else {
      return null;
    }
  }
}


// GOOD!
public class Map<K, V> {
  public Optional<V> get(final K key) {
    // ...
  }
}
```
</div>

When you pass arguments to a function, never pass a null value. The called function usually never expects
to be called with null arguments. Suppose a function expects an argument that can be missing. In that case, the function can define a
default value for that argument (possible in C++ and JavaScript/TypeScript, but not in Java), or an overloaded
function can be defined where the optional argument is not present. A function can also be defined so that an argument
has an optional type, but you should prefer an optional parameter or an overloaded version of the function.

## Avoid Off-By-One Errors Principle

Off-by-one errors usually result from the fact that collections in programming languages are indexed with
zero-based indexes. Zero-based indexing is unnatural for human beings but excellent for computers. However, programming languages
should be designed with humans in mind. People never speak about getting the zeroth value of an array.
We speak of getting the first value in the array. As the null value was called a
billion-dollar mistake, I would call the zero-based indexing another billion-dollar mistake. Let's hope
that someday we get a programming language with one-based indexing! But then we must unlearn the zero-based indexing habit...and that's another problem.

Below are two examples of programming errors in JavaScript that are easy to make if you are not careful enough:

<div class="sourceCodeWithoutLabel">

```
for (let index = 0; index <= array.length; index++) {
  // ...
}

for (let index = 0; index < array.length - 1; index++) {
  // ...
}
```
</div>

In the first example, there should be '&lt;' instead of '&lt;=', and in the latter example, there should
be '&lt;=' instead of '&lt;'. Fortunately, the above mistakes can be avoided using modern programming language
constructs like Java's enhanced for-loop or C++'s range-based for-loop or functional programming.

Below are two examples of avoiding off-by-one errors in Java:

<div class="sourceCodeWithoutLabel">

```
for (final var value : values) {
  // ...
}

values.stream().forEach(value -> ...);
```

</div>

Some languages, like JavaScript, offer a nice way to access an array's last element(s). Instead of writing
`array[array.length - 1]`, you can write `array.at(-1)`. And similarly, `array[array.length - 2]` is the same as
`array.at(-2)`. You can think that a negative index is a one-based index starting from the end of an array.

Let's consider the description of JavaScript's `slice` method:

> The slice() method returns a shallow copy of a portion of an array into a new array object
> selected from start index to end index (end not included).

The problem here is the 'end not included' part. Many people, by default, think that if given a range,
it is inclusive, but in the case of the `slice` method, it is inclusive at the beginning and exclusive at the end:
`[start, end[`. This kind of function definition that is against first assumptions can easily cause off-by-one errors.
It would be better if the `slice` method by default works with an inclusive range `[start, end]`.

Additionally, unit tests are your friend when trying to spot off-by-one errors. So remember to write
unit tests for the edge cases, too.

## Be Critical When Googling Principle

> You should always analyze code taken from the web to see if it meets the criteria for production code.

We all have done it, and we have done it hundreds of times: googled for answers.
Usually, you find good resources by googling, but the problem often is that examples
in the googled results are not necessarily production quality. One specific thing missing in them is error
handling. If you copy and paste code from a website, it is possible that errors are not handled
appropriately. You should always analyze the copy-pasted code to see if error handling needs to be added.

When you provide answers for other people, try to make the code as production-like as possible.
In Stack Overflow, you find the most up-voted answer right below the question. If the answer is missing error handling,
you can comment on that and let the author improve their answer. You can also up-vote an
answer that seems the most production ready. Usually, the most up-voted answers are pretty old. For this reason, it is
useful to scroll down to see if a more modern solution fits your need better. And you can also up-vote that more modern solution so it will become ranked higher in the list of answers.

Regarding open source libraries, the first examples in their documentation can describe only the "happy path" usage scenario, and error handling is described only in later parts of the documentation.
This can cause problems if you copy-paste code from the "happy path" example and forget to add error handling.
For this reason, open-source library authors should give production-quality examples early in the documentation.

## Optimization Principle

> Avoid premature optimization. Premature optimization may hinder crafting a proper object-oriented design for a software component.
> Measure unoptimized performance first. Then decide if optimization is needed. Implement optimizations one by one and 
> measure the performance after each optimization round to determine if the optimization matters. You can then utilize
> gained knowledge in future projects only to make optimizations that give a significant enough performance boost. 
> Sometimes you can make performance optimization in an early phase of a project if you know that a particular optimization
> is needed (e.g., from previous experience) and the optimization can be implemented without negatively affecting the
> object-oriented design.

### Optimization Patterns

The following optimization patterns are described in this section:

- Optimize busy loops only pattern
- Remove unnecessary functionality pattern
- Copy memory in chunks pattern (C++)
- Object pool pattern
- Replace virtual methods with non-virtual methods pattern (C++)
- Inline methods pattern (C++)
- Use unique pointer pattern (C++)
- Share identical objects a.k.a flyweight pattern

#### Optimize Busy Loops Only Pattern

Optimizations should primarily target only the busy loop or loops in a software component. Busy loops are the loops in threads that
execute over and over again, possibly thousands or more iterations in a second. Performance optimization should not target
functionality that executes only once or a couple of times during the software component's lifetime, and running that
functionality does not take a long time. For example, an application can have configuration reading and parsing
functionality when it starts. This functionality takes a short time to execute. It is
not reasonable to optimize that functionality because it runs only once.
It does not matter if you can read and parse the configuration in 200 or 300 milliseconds, even if there is a 50% difference in performance.

Let's use the data exporter microservice as an example. Our data exporter microservice consists of input, transformer, and output parts. The input part reads messages from a data source. We cannot affect the message reading part if we use a 3rd party library for that purpose. Of course, if multiple 3rd party libraries
are available, it is possible to craft performance tests and evaluate which 3rd party library offers the best performance.
If there are several 3rd party libraries available for the same functionality, we tend to use the
most popular library or a library we know beforehand. If performance is an issue, we should evaluate different libraries and compare their performances.

The data exporter microservice has the following functionality in its busy loop: decode an input message to an internal message, perform
transformations, and encode an output message. Decoding an input message requires
decoding each field in the message. Let's say there are 5000 messages handled per second, and each message has 100 fields.
During one second, 50000 fields must be decoded. This reveals that the optimization of the decoding functionality
is crucial. The same applies to output message encoding. We at Nokia have implemented the decoding and encoding Avro binary fields ourselves. We were able to make them faster than
what was provided by a 3rd party library.

#### Remove Unnecessary Functionality Pattern

Removing unnecessary functionality is something that will boost performance. You should stop to think critically about your software component: Is my software component doing only the necessary things considering all circumstances?

Let's consider the data exporter's functionality. It is currently decoding an input message to an internal message.
This internal message is used when making various transformations to the data. Transformed data is encoded to a wanted output format. The contents of the final output message can be a small subset
of the original input message. This means that only a tiny part of the decoded message is used. In that case, it is unnecessary
to decode all the fields of an input message if, for example, only 10% of the fields are used in the transformations and
output messages. By removing unnecessary decoding, we can improve
the performance of the data exporter microservice.

#### Copy Memory in Chunks Pattern (C++)

If you have a contiguous memory chunk, copy it using
`memcpy`. Don't copy memory byte by byte in a for-loop. The implementation of the `memcpy` function is optimized by a C++ compiler to produce machine code that optimally copies various sizes of memory chunks.
Instead of copying a memory chunk byte by byte, it can, for example, copy memory as 64-bit values in a 64-bit operating system.

In the data exporter microservice, there is the possibility that the input message format and output message format
are the same, e.g., Avro binary. We can have a situation where an Avro record field can be copied as
such from an input message to an output message without any transformation. In that case, decoding that record field is unnecessary
functionality, and we can skip that. What we will do instead is copy a chunk of memory. An Avro record field can be relatively large, even 200 bytes consisting of 40 subfields. We can now skip the decoding
and encoding of those 40 subfields. We simply copy 200 bytes from the input message to the output message.

#### Object Pool Pattern

In garbage-collected languages like JavaScript and Java, the benefit of using an object pool is clear from the
garbage-collection point of view. In the object pool pattern, objects are created only once and then reused.
This will take pressure away from garbage collection. If we didn't use an object pool,
new objects could be created in a busy loop repeatedly, and soon after they were created, they
could be discarded. This would cause many objects to be made available for garbage collection in
a short period of time. Garbage collection takes processor time, and if the garbage collector has a lot of garbage to collect,
it can slow the application down for an unknown duration at unknown intervals.

#### Replace Virtual Methods with Non-Virtual Methods Pattern (C++)

If you are using a lot of calls to virtual functions in a busy loop, there will be some overhead
in checking which virtual method to call due to dynamic dispatch. In C++, this is done using virtual tables
(_vtables_) which are used to check which actual method will be called. The additional vtable check can negatively affect performance in busy loops if virtual methods are called frequently. For example, the data exporter microservice's busy can call an Avro binary decoding and encoding function 50000 times a second. We could optimize these calls
by implementing Avro binary decoding functions as non-virtual (if previously declared as virtual functions).
Non-virtual functions don't need to check the _vtable_, so the call to the function is direct.

#### Inline Methods Pattern (C++)

Suppose you have made the optimization of making a virtual method non-virtual. One more optimization could still be made if the method is small: inline the method. Inlining a method means that calls to the method are eliminated, and the code of the method is placed at the sites where the
calls to the method are made. So, the method does not need to be called at all when it has been inlined.
In the data exporter microservice, we made the Avro binary encoding and decoding functions non-virtual, and now we can make them
also inlined to speed up the microservice. However, a C++ compiler can decide whether an inline function is really inlined or
not. We cannot be 100% sure if the function is inlined. It's up to the compiler. When we define a function
as an inline function with the C++'s `inline` keyword, we are just giving a hint to the compiler that the function
should be inlined. Only non-virtual methods can be inlined. Virtual methods cannot be inlined because they require
checking the _vtable_ to decide which method should be called.

#### Use Unique Pointer Pattern (C++)

If you are using shared pointers, they need to keep the reference count to the shared pointer up to date. In a busy loop, if you use a shared pointer, say a hundred thousand times a second, it starts to show
a difference whether you use a shared pointer or a unique pointer (`std::unique_ptr`). A unique pointer has little to no overhead compared to
a raw pointer. For this reason, there is no need to use a raw pointer in modern C++. It would not bring much to the table performance-wise. And if you use a raw pointer, you must remember to release the allocated memory associated with the raw pointer by yourself. If you don't need
a pointed object to be shared by multiple other objects, you can optimize your code in busy loops by changing shared pointers
to unique pointers. Unique pointers always have only one owner, and multiple objects cannot share them.

#### Share Identical Objects a.k.a Flyweight Pattern

If your application has many objects with some identical properties, those parts of the
objects with identical properties are wasting memory. You should extract the
common properties to a new class and make the original objects reference a shared object of that
new class. Now your objects share a single common object, and possibly significantly less
memory is consumed. This design pattern is called the _flyweight pattern_ and was described in more detail
in the earlier chapter.
