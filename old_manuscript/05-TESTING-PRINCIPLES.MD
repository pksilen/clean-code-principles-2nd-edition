# Testing Principles

Testing is traditionally divided into two categories: functional and non-functional testing.
This chapter will first describe the functional testing principles and then the non-functional testing
principles.

## Functional Testing Principles

Functional testing is divided into three phases:

- Unit testing
- Integration testing
- End-to-end (E2E) testing

Functional test phases can be described with the _testing pyramid_:

![Figure 5.1 Testing Pyramid](images/06-01.png)

The testing pyramid depicts the relative number of tests in each phase. Most tests are unit tests. The second most tests are
integration tests, and the fewest are E2E tests. Unit tests should cover the whole codebase of a software component.
Unit testing focuses on testing individual public functions as units (of code). Software component integration tests cover
the integration of the unit-tested functions to a complete working software component, including testing the interfaces
to external services. Examples of external services are a database, a message broker, and other microservices. E2E testing
focuses on testing the end-to-end functionality of a complete software system.

### Unit Testing Principle

> Unit tests should test the functionality of public functions as _isolated units_ with as high coverage as possible. The isolation means that dependencies (other classes/modules/services) are mocked.

Unit tests should be written for public functions only. Do not try to test private functions separately. They
should be tested indirectly when testing public functions. Below is a JavaScript example:

_parseConfig.js_
```
import { doSomething } from 'other-module';

function readFile(...) {
   // ...
}

export default function parseConfig(...) {
   // ...
   // readFile(...)
   // doSomething(...)
   // ...
}
```

In the above module, there is one public function, `parseConfig`, and one private function, `readFile`. In unit testing,
you should test the public `parseConfig` function in isolation and mock the `doSomething` function, which is imported from another module.
And you indirectly test the private `readFile` function when testing the public `parseConfig` function.

Below is the above example written in Java. You test the Java version in a similar way as the JavaScript version. You
write unit tests for the public `parseConfig` method only. Those tests will test the private `readFile` function indirectly.
You must supply a mock instance of the `OtherClass` class for the `ConfigParser` constructor.

<div class="sourceCodeWithoutLabel">

```
public class OtherClass {
   // ...
   
   public void doSomething(...) {
      // ...
   }
}

public class ConfigParser {
   private OtherClass otherClass;
   
   public ConfigParser(final OtherClass otherClass) {
      this.otherClass = otherClass
   }
   
   // ...
   
   public Configuration parseConfig(...) {
      // ...
      // readFile(...)
      // otherClass.doSomething(...)
      // ...
   }
   
   private String readFile(...) {
      // ...
   }
}
```

</div>

Unit tests should test all the functionality of a public function: happy path(s),
possible failure situations, and edge cases so that each code line of the function is covered by at least one unit test.

Below are some examples of edge cases listed:

- Are the last loop counter value correct? This test should detect possible off-by-one errors
- Test with an empty array
- Test with the smallest allowed value
- Test with the biggest allowed value
- Test with a negative value
- Test with a zero value
- Test with a very long string
- Test with an empty string
- Test with floating-point values having different precisions
- Test with floating-point values that are rounded differently
- Test with a very small floating-point value
- Test with a very large floating-point value

Unit tests should not test the functionality of dependencies. That is something to be tested
with integration tests. A unit test should test a function in isolation. If a function has one
or more dependencies on other functions defined in different classes (or modules), those
dependencies should be mocked. A _mock_ is something that mimics the behavior of a real object or function. Mocking
will be described in more detail later in this section.

Testing functions in isolation has two benefits. It makes tests faster. This is a real benefit because
you can have a lot of unit tests, and you run them often, so it is crucial that the execution time of
the unit tests is as short as possible. Another benefit is that you don't need to set up external
dependencies, like a database, a message broker, and other microservices, because you are mocking the functionality
of the dependencies.

#### Test-Driven Development (TDD)

Test-Driven Development (TDD) is a software development process in which software requirements are formulated as
test cases before the software is implemented. This is as opposed to the practice where software is
implemented first, and test cases are written only after that.

I have been in the industry for almost 30 years, and when I began coding, there were no automated tests or
test-driven development. Only starting from 2010 have I been writing automated unit tests. Due to this
background, TDD has been quite difficult for me because there is something I have grown accustomed to: Implement
the software first and then do the testing. If you have also learned it like that, switching to TDD can be quite hard.

The pure TDD cycle consists of the following steps:

1) Add a test for a specified functionality
2) Run all the tests (The just added test should fail because the functionality it is testing is not implemented yet)
3) Write the simplest possible code that makes the tests pass
4) Run all the tests. (They should pass now)
5) Refactor as needed (Existing tests should ensure that anything won't break)
6) Start again from the first step until all functionality is implemented, refactored, and tested

Let's continue with an example. Suppose there is the following user story in the backlog waiting to be implemented:

> Parse configuration properties from a configuration string to a configuration object. Configuration properties can be accessed from
> the configuration object.

Let's first write a test for the specified functionality:

_ConfigParserTests.java_
```
public class ConfigParserTests {
  private final ConfigParser configParser = new ConfigParserImpl();
  
  @Test
  public void testParse() {
    // GIVEN
    final var configStr = "propName1=value1\npropName2=value2";
    
    // WHEN
    final var configuration = configParser.parse(configStr);
    
    // THEN
    assertEquals(configuration.getPropertyValue("propName1"),
                 "value1");

    assertEquals(configuration.getPropertyValue("propName2"),
                 "value2");
  }
}
```

Now, if we run all the tests, we get a compilation error, which means that the test case we wrote won't pass yet. Next,
we shall write the simplest possible code to make the test case both compile and pass:

<div class="sourceCodeWithoutLabel">

```
public interface Configuration {
  String getPropertyValue(String propertyName);
}

public class ConfigurationImpl implements Configuration {
  private final Properties properties;

  public ConfigurationImpl(final Properties properties) {
    this.properties = properties;
  }

  public String getPropertyValue(final String propertyName) {
    return properties.getProperty(propertyName);
  }
}

public interface ConfigParser {
  Configuration parse(String configStr);
}

public class ConfigParserImpl implements ConfigParser {
  public Configuration parse(final String configStr) {
    final Properties properties = new Properties();
    
    // Load properties to 'properties' variable
    // from the 'configString'
    
    return new ConfigurationImpl(properties);
  }
}
```
</div>

We can now add new functionality. Let's say the `parse` function should throw an error if it cannot
parse the configuration string. We can now repeat the TDD cycle from the beginning by creating a failing test first:

<div class="sourceCodeWithoutLabel">

```
public class ConfigParserTests {
  // ...
  
  @Test
  public void testParse_whenParsingFails() {
    // GIVEN
    final var configStr = "invalid";
    
    try {
      // WHEN
      configParser.tryParse(configStr);
      fail();
    } catch (final ConfigParseError error) {
      // THEN error was successfully thrown
    }
  }
}
```
</div>

Next, we should refactor the implementation to make the second test pass:

<div class="sourceCodeWithoutLabel">

```
public interface ConfigParser {
  Configuration tryParse(String configStr);
}

public class ConfigParseError extends RuntimeException {
  public ConfigParseError(final String errorMessage,
                          final Throwable error) {
      super(errorMessage, error);
  }
}

public class ConfigParserImpl implements ConfigParser {
  public Configuration tryParse(final String configStr) {
    final Properties properties = new Properties();
    
    try {
      // Try load properties from the configStr
      
      return new ConfigurationImpl(properties);
    } catch (...) {
      throw new ConfigParseError(...);  
    }
  }
}
```
</div>

We also need to refactor the first unit test to call `tryParse` instead of `parse`. We can continue adding test cases for additional functionality.

For me, the above-described TDD cycle sounds a bit cumbersome. But, there are clear benefits in creating tests
beforehand. When tests are defined first, it is usually less likely that one forgets to test or implement something. This is because TDD better
forces you to think about the function specification: happy path(s), edge and failure cases.

If you don't practice TDD and do the implementation always first, it is more likely you might forget
an edge case or a particular failure scenario. When you don't practice
TDD, you go straight to the implementation, and you tend to think about the happy path(s) only and strive to get them working.
When you are focusing on getting the happy path(s) working, you don't think about the edge cases and failure scenarios much because you
are mentally so strongly focusing on the happy path(s). And if you forget to implement an edge case or failure scenario, you don't test it. You
can have 100% unit test coverage for a function, but a particular edge case or failure scenario is left
unimplemented and untested. This is what has happened to me, also. And it has happened more than once.

As an alternative to the above-described TDD cycle, you can start function implementation by first considering the functionality
the function should have. You can first think about the "happy path", which is the most common
scenario for the function. Create an empty test case that contains only a statement that makes the test
fail. You should put the `fail` call in the test case in order not to forget to implement
the test case. Below is an example test case:

<div class="sourceCodeWithoutLabel">

```
public class ConfigParserTests {
  // Tests the "happy path":
  // successful parsing of configuration
  @Test
  public void testParse() { 
    fail();
  }
}
```
</div>

Next, think of all the other scenarios for the function: other happy paths, edge, and failure cases.
And then create a failing test case for each of those scenarios, for example:

<div class="sourceCodeWithoutLabel">

```
public class ConfigParserTests {
  @Test
  public void testParse_whenParsingFails() {
    fail();
  }

  @Test
  public void testParse_whenMandatoryPropIsMissing() {
    fail();
  }

  @Test
  public void testParse_whenOptionalPropIsMissing() {
    fail();
  }

  @Test
  public void testParse_whenPropHasInvalidName() {
    fail();
  }

  @Test
  public void testParse_whenPropHasInvalidType() {
    fail();
  }
}
```
</div>

Now you have a high-level specification of the function in the form of scenarios. Next, you can continue with
the function implementation. After you have completed the function implementation, implement the test cases
one by one, and remove the `fail` calls.

The benefit of this approach is that you don't have to switch continuously between the implementation source
code file and the test source code file. In each phase, you can focus on one thing:

1) Function specification
   - Specify scenarios: What the function does, and what failures are possible? Are there edge cases?
   - Implement scenarios as failing unit test cases
2) Function implementation
3) Implementation of unit tests

#### Naming Conventions

When functions to be tested are in a class, a respectively named class for unit tests should be created.
For example, if there is a `ConfigParser` class, the respective class for unit tests should be
`ConfigParserTests`. This way, it is easy to locate the file containing unit tests for a particular
implementation class.

A test method name should start with a _test_ prefix, after which the name of the
tested method should come. For example, if the tested method is `parse`, the test method name should be `testParse`. There are usually several tests for a single function. All test method
names should begin with _test&lt;function-name&gt;_, but the test method name should also contain a description
of the scenario the test method tests, for example: `testParse_whenParsingFails`.

When using the Jest testing library with JavaScript or TypeScript, unit tests are organized and named in the following
manner:

<div class="sourceCodeWithoutLabel">

```
describe('<class-name>', () => {
  describe('<public-method-name>', () => {
    it('should do this...', () => {
      // ...
    });
    
    it('should do other thing when...', () => {
      // ...
    });
    
    // Other scenarios...
  });
});

// Example:

describe('ConfigParser', () => {
  describe('parse', () => {
    it('should parse config string successfully', () => {
      // ...
    });
    
    it('should throw an error if parsing fails', () => {
      // ...
    });
    
    // Other scenarios...
  });
});
```
</div>

#### Mocking

Let's have a small Spring Boot example of mocking dependencies in unit tests. We have a service class that
contains public functions for which we want to write unit tests:

_SalesItemServiceImpl.java_
```
@Service
public class SalesItemServiceImpl implements SalesItemService {
  @Autowired
  private SalesItemRepository salesItemRepository;
  
  @AutoWired
  private SalesItemFactory salesItemFactory;

  @Override
  public final SalesItem createSalesItem(
    final SalesItemArg salesItemArg
  ) {
    return salesItemRepository.save(
      salesItemFactory.createFrom(salesItemArg));
  }

  @Override
  public final Iterable<SalesItem> getSalesItems() {
    return salesItemRepository.findAll();
  }
}
```

In the Spring Boot project, we need to define the following dependency in the `build.gradle` file:

<div class="sourceCodeWithoutLabel">

```
dependencies {
  // Other dependencies ...
  testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```
</div>

Now, we can create unit tests using JUnit, and we can use Mockito for mocking. Looking at the above code, we can notice
that the `SalesItemServiceImpl` service depends on a `SalesItemRepository`. According to the unit testing principle, we should mock
that dependency. Similarly, we should also mock the `SalesItemConverter` dependency:

_SalesItemServiceTests.java_
```
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.refEq;

@SpringBootTest
class SalesItemServiceTests {
  private static final String SALES_ITEMS_NOT_EQUAL =
    "Sales items not equal";

  private final SalesItem testSalesItem = 
    new SalesItem(1L, 1L, "Test", 10);

  // Create mock implementation of
  // SalesItemRepository interface
  @Mock
  private SalesItemRepository salesItemRepositoryMock; 
  
  // Create mock implementation of
  // SalesItemFactory interface
  @Mock
  private SalesItemFactory salesItemFactoryMock;
  
  // Injects the above created mocks to salesItemService
  @InjectMocks
  private SalesItemService salesItemService =
    new SalesItemServiceImpl();

  @Test
  final void testCreateSalesItem() {
    // GIVEN
    final var salesItemArg = new SalesItemArg(1L, "Test", 10);
    
    // Instructs to return 'testSalesItem' when 
    // salesItemFactoryMock's createFrom
    // method is called with an argument that reference
    // equals 'salesItemArg'
    Mockito
      .when(salesItemFactoryMock.createFrom(refEq(salesItemArg)))
      .thenReturn(testSalesItem);

    // Instructs to return 'testSalesItem' when
    // salesItemRepositoryMock's 'save' method is called
    // with an argument that reference equals 'testSalesItem'
    Mockito
      .when(salesItemRepositoryMock
        .save(refEq(testSalesItem)))
      .thenReturn(testSalesItem);

    // WHEN
    final var createdSalesItem =
      salesItemService.createSalesItem(salesItemArg);

    // THEN
    assertEquals(createdSalesItem,
                 testSalesItem,
                 SALES_ITEMS_NOT_EQUAL);
  }

  @Test
  final void testGetSalesItems() {
    // GIVEN
    // Instructs to return a list of containing one sales item
    // 'salesItem' when salesItemRepository's 'findAll'
    // method is called
    Mockito
      .when(salesItemRepositoryMock.findAll())
      .thenReturn(List.of(testSalesItem));

    // WHEN
    final var foundSalesItems = salesItemService.getSalesItems();

    // THEN
     final var iterator = foundSalesItems.iterator();

     assertEquals(iterator.next(),
                  testSalesItem,
                  SALES_ITEMS_NOT_EQUAL);

     assertFalse(iterator.hasNext());
  }
}
```

Java has many testing frameworks and mocking libraries. Below is a small example from a JakartaEE
microservice that uses TestNG and JMockit libraries for unit testing and mocking, respectively. In the below example, we are testing
a couple of methods from a `ChartStore` class, which is responsible for handling the persistence of chart entities
using Java Persistence API (JPA).

_ChartStoreTests.java_

<code class="sourceCodeWithoutLabel">

```
import com.silensoft.conflated...DuplicateEntityError;
import mockit.Expectations;
import mockit.Injectable;
import mockit.Mocked;
import mockit.Tested;
import mockit.Verifications;
import org.testng.annotations.Test;

import javax.persistence.EntityExistsException;
import javax.persistence.EntityManager;

import java.util.Collections;
import java.util.List;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.fail;

public class ChartStoreTests {
  // chartStore will contain an instance
  // of ChartStoreImpl after @Tested
  // annotation is processed
  @Tested
  private ChartStore chartStore;

  // @Injectable annotation creates a mock instance
  // of EntityManager interface and then injects
  // it where needed
  // In this case, it will be injected to 'chartStore'
  @Injectable
  private EntityManager entityManager;

  // Create a mock instance of Chart
  // (does not inject anywhere)
  @Mocked
  private Chart chartMock;

  @Test
  void testCreate() {
    // WHEN
    chartStore.create(chartMock);

    // THEN
    // JMockit's verification block checks 
    // that below mock functions are called
    new Verifications() {{
      chartStore.getEntityManager().persist(chartMock);
      chartStore.getEntityManager().flush();
    }};
  }

  @Test
  void testCreate_whenChartAlreadyExists() {
    // GIVEN
    // JMockit's expectations block will define what mock methods
    // calls are expected and also can specify
    // the return value or result of the mock method call.
    // Below the 'persist' mock method call will throw
    // EntityExistsException
    new Expectations() {{
      chartStore.getEntityManager().persist(chartMock);
      result = new EntityExistsException();
    }};

    try {
      // WHEN
      chartStore.create(chartMock);
      fail("Expected exception, but it was not thrown");
    } catch (final DuplicateEntityError error) {
      // THEN successfully throws an error
    }
  }

  @Test
  void testGetChartById() {
    // GIVEN
    new Expectations() {{
      chartStore.getEntityManager().find(Chart.class, 1L);
      result = chartMock;
    }};

    // WHEN
    final var chart = chartStore.getById(1L);

    // THEN
    assertEquals(chart, chartMock);
  }
}
```

</code>

Let's have a unit testing example with JavaScript/TypeScript. We will write a unit test for the following
function using the Jest library:

_fetchTodos.ts_

<code class="sourceCodeWithoutLabel">

```
import store from '../../store/store';
import todoService from '../services/todoService';

export default async function fetchTodos(): Promise<void> {
  const { todosState } = store.getState();
  todosState.isFetching = true;
  try { 
    todosState.todos = await todoService.tryFetchTodos();
    todosState.fetchingHasFailed = false; 
  } catch(error) {
    todosState.fetchingHasFailed = true; 
  }
  todosState.isFetching = false;
}
```
</code>

Below is the unit test case for the happy path scenario:

_fetchTodos.test.ts_
```
import store from '../../store/store';
import todoService from '../services/todoService';
import fetchTodos from 'fetchTodos';
// ...

// Mock both 'store' and 'todoService' objects
jest.mock('../../store/store');
jest.mock('../services/todoService');

describe('fetchTodos', async () => {
  it('should fetch todos from todo service', async () => {
    // GIVEN
    const todosState = { todos: [] } as TodoState;
    store.getState.mockReturnValue({ todosState });
    
    const todos = [{
      id: 1,
      name: 'todo',
      isDone: false
    }];

    todoService.tryFetchTodos.mockResolvedValue(todos);
    
    // WHEN
    await fetchTodos();
    
    // THEN
    expect(todosState.isFetching).toBe(false);
    expect(todosState.fetchingHasFailed).toBe(false);
    expect(todosState.todos).toBe(todos);    
  });
});
```

In the above example, we used the `jest.mock` function to create mocked versions of the `store` and `todoService` modules.
Another way to handle mocking with Jest is using `jest.fn()`, which creates a mocked function. Let's assume that the `fetchTodos` function is changed so
that it takes a `store` and `todoService` as its arguments:

_fetchTodos.ts_
```
// ...

export default async function fetchTodos(
  store: Store,
  todoService: TodoService
): Promise<void> {
  // Same code here as in earlier example...
}
```

Now the mocking would look like the following:

_fetchTodos.test.ts_
```
import fetchTodos from 'fetchTodos';
// ...

const store = {
   getState: jest.fn()
};

const todoService = {
   tryFetchTodos: jest.fn();
}

describe('fetchTodos', async () => {
  it('should fetch todos from todo service', async () => {
    // GIVEN
    // Same code as in earlier example...
    
    // WHEN
    await fetchTodos(store as any, todoService as any);
    
    // THEN
    // Same code as in earlier example...
  });
});
```

Let's have an example with C++ and Google Test unit testing framework. In C++, you can define a mock class
by extending a pure virtual base class ("interface") and using Google Mock macros to define mocked methods.
Below is the definition of a `detectedAnomalies` method that we want to unit test:

_AnomalyDetectionEngine.h_
```
class AnomalyDetectionEngine
{
public:
  virtual ~AnomalyDetectionEngine() = default;
  
  virtual void detectAnomalies() = 0;
};
```

_AnomalyDetectionEngineImpl.h_
```
#include <memory>
#include "AnomalyDetectionEngine.h"
#include "Configuration.h"

class AnomalyDetectionEngineImpl :
  public AnomalyDetectionEngine
{
public:
  explicit AnomalyDetectionEngineImpl(
    std::shared_ptr<Configuration> configuration
  );

  void detectAnomalies() override;

private:
  void detectAnomalies(
    const std::shared_ptr<AnomalyDetectionRule>& anomalyDetectionRule
  );
  
  std::shared_ptr<Configuration> m_configuration;
};
```

_AnomalyDetectionEngineImpl.cpp_
```
#include <algorithm>
#include <execution>
#include "AnomalyDetectionEngineImpl.h"

AnomalyDetectionEngineImpl::AnomalyDetectionEngineImpl(
  std::shared_ptr<Configuration> configuration
) : m_configuration(std::move(configuration))
{}

void AnomalyDetectionEngineImpl::detectAnomalies()
{
  const auto anomalyDetectionRules =
    m_configuration->getAnomalyDetectionRules();

   std::for_each(std::execution::par,
                 anomalyDetectionRules->cbegin(),
                 anomalyDetectionRules->cend(),
                 [this](const auto& anomalyDetectionRule)
                 {
                   detectAnomalies(anomalyDetectionRule);
                 });
}

void AnomalyDetectionEngineImpl::detectAnomalies(
  const std::shared_ptr<AnomalyDetectionRule>& anomalyDetectionRule
)
{
  const auto anomalyIndicators = anomalyDetectionRule->detectAnomalies();
  
  std::ranges::for_each(*anomalyIndicators,
                        [](const auto& anomalyIndicator)
                        {
                          anomalyIndicator->publish();
                        });
}
```

Let's create a `Configuration` class and a `ConfigurationMock` class for mocks:

_Configuration.h_
```
#include <memory>
#include <vector>
#include "AnomalyDetectionRule.h"

class Configuration
{
public:
  virtual ~Configuration() = default;
   
  virtual std::shared_ptr<AnomalyDetectionRules>
  getAnomalyDetectionRules() const = 0;
};
```

_ConfigurationMock.h_
```
#include <gmock/gmock.h>
#include "Configuration.h"

class ConfigurationMock : public Configuration
{
public:
  MOCK_METHOD(std::shared_ptr<AnomalyDetectionRules>,
              getAnomalyDetectionRules, (), (const)
  );
};
```

Let's create an `AnomalyDetectionRule` class and a respective mock class, `AnomalyDetectionRuleMock`:

_AnomalyDetectionRule.h_
```
#include "AnomalyIndicator.h"

class AnomalyDetectionRule
{
public:
  virtual ~AnomalyDetectionRule() = default;

  virtual std::shared_ptr<AnomalyIndicators>
  detectAnomalies() = 0;
};

using AnomalyDetectionRules =
  std::vector<std::shared_ptr<AnomalyDetectionRule>>;
```

_AnomalyDetectionRuleMock.h_
```
#include <gmock/gmock.h>
#include "AnomalyDetectionRule.h"

class AnomalyDetectionRuleMock : public AnomalyDetectionRule
{
  public:
    MOCK_METHOD(std::shared_ptr<AnomalyIndicators>,
                detectAnomalies, ());
};
```

Let's create an `AnomalyIndicator` class and a mock class, `AnomalyIndicatorMock`:

_AnomalyIndicator.h_
```
#include <memory>
#include <vector>

class AnomalyIndicator
{
public:
  virtual ~AnomalyIndicator() = default;

  virtual void publish() = 0;
};

using AnomalyIndicators =
  std::vector<std::shared_ptr<AnomalyIndicator>>;
```

_AnomalyIndicatorMock.h_
```
#include <gmock/gmock.h>
#include "AnomalyIndicator.h"

class AnomalyIndicatorMock : public AnomalyIndicator
{
public:
  MOCK_METHOD(void, publish, ());
};
```

Let's create a unit test for the `detectAnomalies` method in the `AnomalyDetectionEngineImpl` class:

_AnomalyDetectionEngineImplTests.h_
```
#include <gtest/gtest.h>
#include "ConfigurationMock.h"
#include "AnomalyDetectionRuleMock.h"
#include "AnomalyIndicatorMock.h"

class AnomalyDetectionEngineImplTests : public testing::Test
{
protected:
  void SetUp() override {
    m_anomalyDetectionRules->push_back(m_anomalyDetectionRuleMock);
    m_anomalyIndicators->push_back(m_anomalyIndicatorMock);
  }

  std::shared_ptr<ConfigurationMock> m_configurationMock{
    std::make_shared<ConfigurationMock>()
  };

  std::shared_ptr<AnomalyDetectionRuleMock> m_anomalyDetectionRuleMock{
    std::make_shared<AnomalyDetectionRuleMock>()
  };

  std::shared_ptr<AnomalyDetectionRules> m_anomalyDetectionRules{
    std::make_shared<AnomalyDetectionRules>()
  };
  
  std::shared_ptr<AnomalyIndicatorMock> m_anomalyIndicatorMock{
    std::make_shared<AnomalyIndicatorMock>()
  };

  std::shared_ptr<AnomalyIndicators> m_anomalyIndicators{
    std::make_shared<AnomalyIndicators>()
  }
};
```

_AnomalyDetectionEngineImplTests.cpp_
```
#include "../src/AnomalyDetectionEngineImpl.h"
#include "AnomalyDetectionEngineImplTests.h"

using testing::Return;

TEST_F(AnomalyDetectionEngineImplTests, testDetectAnomalies)
{
  // GIVEN
  AnomalyDetectionEngineImpl anomalyDetectionEngine{m_configurationMock};

  // EXPECTATIONS
  EXPECT_CALL(*m_configurationMock, getAnomalyDetectionRules)
    .Times(1)
    .WillOnce(Return(m_anomalyDetectionRules));

  EXPECT_CALL(*m_anomalyDetectionRuleMock, detectAnomalies)
    .Times(1)
    .WillOnce(Return(m_anomalyIndicators));

  EXPECT_CALL(*m_anomalyIndicatorMock, publish).Times(1);

  // WHEN
  anomalyDetectionEngine.detectAnomalies();
}
```

The above example did not contain dependency injection, so let's have another example in C++ where
dependency injection is used. First, we define a generic base class for singletons:

_Singleton.h_
```
#include <memory>

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

Next, we implement a configuration parser that we will later unit test:

_ConfigParserImpl.h_
```
#include <memory>
#include "Configuration.h"

class ConfigParserImpl {
public:
  std::shared_ptr<Configuration> parse();
};
```

_ConfigParserImpl.cpp_
```
#include "AnomalyDetectionRulesParser.h"
#include "Configuration.h"
#include "ConfigFactory.h"
#include "ConfigParserImpl.h"
#include "MeasurementDataSourcesParser.h"

std::shared_ptr<Configuration>
ConfigParserImpl::parse(...)
{
  const auto measurementDataSources =
    MeasurementDataSourcesParser::getInstance()->parse(...);

  const auto anomalyDetectionRules =
    AnomalyDetectionRulesParser::getInstance()->parse(...);

  return ConfigFactory::getInstance()
    ->createConfig(anomalyDetectionRules);
}
```

Next, we define `MeasurementDataSource`, `MeasurementDataSourcesParser`, and
`MeasurementDataSourcesParserImpl` classes:

_MeasurementDataSource.h_
```
#include <memory>
#include <vector>

class MeasurementDataSource {
  // ...
};

using MeasurementDataSources =
  std::vector<std::shared_ptr<MeasurementDataSource>>;
```

_MeasurementDataSourcesParser.h_
```
#include "Singleton.h"
#include "MeasurementDataSource.h"

class MeasurementDataSourcesParser :
  public Singleton<MeasurementDataSourcesParser>
{
public:
  virtual std::shared_ptr<MeasurementDataSources> parse(...) = 0;
};
```

_MeasurementDataSourcesParserImpl.h_
```
#include "MeasurementDataSourcesParser.h"

class MeasurementDataSourcesParserImpl :
  public MeasurementDataSourcesParser
{
public:
  std::shared_ptr<MeasurementDataSources> parse(...) override {
    // ...
  }
};
```

Next, we define `AnomalyDetectionRulesParser` and `AnomalyDetectionRulesParserImpl`
classes:

_AnomalyDetectionRulesParser.h_
```
#include "Singleton.h"
#include "AnomalyDetectionRule.h"

class AnomalyDetectionRulesParser :
  public Singleton<AnomalyDetectionRulesParser>
{
public:
  virtual std::shared_ptr<AnomalyDetectionRules> parse(...) = 0;
};
```

_AnomalyDetectionRulesParserImpl.h_
```
#include "AnomalyDetectionRulesParser.h"

class AnomalyDetectionRulesParserImpl :
  public AnomalyDetectionRulesParser
{
public:
  std::shared_ptr<AnomalyDetectionRules> parse(...) override {
   // ...
  }
};
```

Next, we define `ConfigFactory` and `ConfigFactoryImpl` classes:

_ConfigFactory.h_
```
#include "Singleton.h"
#include "Configuration.h"

class ConfigFactory :
  public Singleton<ConfigFactory>
{
public:
  virtual std::shared_ptr<Configuration>
  createConfig(
    const std::shared_ptr<AnomalyDetectionRules>& rules
  ) = 0;
};
```

_ConfigFactoryImpl.h_
```
#include "ConfigFactory.h"

class ConfigFactoryImpl : public ConfigFactory
{
public:
  std::shared_ptr<Configuration>
  createConfig(
    const std::shared_ptr<AnomalyDetectionRules>& rules
  ) override {
    // ...
  }
};
```

Then we define a dependency injector class:

_DependencyInjector.h_
```
#include "AnomalyDetectionRulesParserImpl.h"
#include "ConfigFactoryImpl.h"
#include "MeasurementDataSourcesParserImpl.h"

class DependencyInjector final
{
public:
  static void injectDependencies()
  {
    AnomalyDetectionRulesParser::setInstance(
      std::make_shared<AnomalyDetectionRulesParserImpl>()
    );

    ConfigFactory::setInstance(
      std::make_shared<ConfigFactoryImpl>()
    );

    MeasurementDataSourcesParser::setInstance(
      std::make_shared<MeasurementDataSourcesParserImpl>()
    );
  }
    
private:
  DependencyInjector() = default;
};
```

We inject dependencies upon application startup using the dependency injector:

_main.cpp_
```
#include "DependencyInjector.h"

int main()
{
  DependencyInjector::injectDependencies();
  
  // Initialize and start application...
}
```

Let's define a unit test class for the `ConfigParserImpl` class:

_ConfigParserImplTests.h_
```
#include "MockDependenciesInjectedTest.h"

class ConfigParserImplTests :
  public MockDependenciesInjectedTest
{};
```

All unit test classes should inherit from a base class that injects mock dependencies. When tests are completed,
the mock dependencies will be removed. The Google Test framework requires this removal because it only validates
expectations on a mock upon the mock object destruction.

_MockDependenciesInjectedTest.h_
```
#include <gtest/gtest.h>
#include "MockDependencyInjector.h"

class MockDependenciesInjectedTest :
  public testing::Test
{
protected:
  void SetUp() override
  {
    m_mockDependencyInjector.injectMockDependencies();
  }

  void TearDown() override
  {
    m_mockDependencyInjector.removeMockDependencies();
  }

  MockDependencyInjector m_mockDependencyInjector;
};
```

Below are all the mock classes defined:

_AnomalyDetectionRulesParserMock.h_
```
#include <gmock/gmock.h>
#include "AnomalyDetectionRulesParser.h"

class AnomalyDetectionRulesParserMock : 
  public AnomalyDetectionRulesParser
{
public:
  MOCK_METHOD(std::shared_ptr<AnomalyDetectionRules>, parse, (...));
};
```

_ConfigFactoryMock.h_
```
#include <gmock/gmock.h>
#include "ConfigFactory.h"

class ConfigFactoryMock : public ConfigFactory
{
public:
  MOCK_METHOD(
    std::shared_ptr<Configuration>,
    createConfig,
    (const std::shared_ptr<AnomalyDetectionRules>& rules)
  );
};
```

_MeasurementDataSourcesParserMock.h_
```
#include <gmock/gmock.h>
#include "MeasurementDataSourcesParser.h"

class MeasurementDataSourcesParserMock : 
  public MeasurementDataSourcesParser
{
public:
  MOCK_METHOD(std::shared_ptr<MeasurementDataSources>, parse, (...));
};
```

Below is the `MockDependencyInjector` class defined:

_MockDependencyInjector.h_
```
#include "AnomalyDetectionRulesParserMock.h"
#include "ConfigFactoryMock.h"
#include "MeasurementDataSourcesParserMock.h"

class MockDependencyInjector final
{
public:
  std::shared_ptr<AnomalyDetectionRulesParserMock> 
  m_anomalyDetectionRulesParserMock{
    std::make_shared<AnomalyDetectionRulesParserMock>()
  };

  std::shared_ptr<ConfigFactoryMock> m_configFactoryMock{
    std::make_shared<ConfigFactoryMock>()
  };

  std::shared_ptr<MeasurementDataSourcesParserMock>
  m_measurementDataSourcesParserMock{
    std::make_shared<MeasurementDataSourcesParserMock>()
  };

  void injectMockDependencies() const
  {
    AnomalyDetectionRulesParser::setInstance(
      m_anomalyDetectionRulesParserMock
    );

    ConfigFactory::setInstance(
      m_configFactoryMock
    );

    MeasurementDataSourcesParser::setInstance(
      m_measurementDataSourcesParserMock
    );
  }

  void removeMockDependencies() const {
    AnomalyDetectionRulesParser::setInstance({nullptr});
    ConfigFactory::setInstance({nullptr});
    MeasurementDataSourcesParser::setInstance({nullptr});
  }
};
```

Below is the unit test implementation that uses the mocks:

_ConfigParserImplTests.cpp_
```
#include "ConfigParserImplTests.h"
#include "ConfigParserImpl.h"

using testing::Eq;
using testing::Return;

TEST_F(ConfigParserImplTests, testParseConfig)
{
  // GIVEN
  ConfigParserImpl configParser;

  // EXPECTATIONS
  EXPECT_CALL(
    *m_mockDependencyInjector.m_anomalyDetectionRulesParserMock,
    parse
  ).Times(1)
   .WillOnce(Return(m_anomalyDetectionRules));

  EXPECT_CALL(
    *m_mockDependencyInjector.m_measurementDataSourcesParserMock,
    parse
  ).Times(1)
   .WillOnce(Return(m_measurementDataSources));

  EXPECT_CALL(
    *m_mockDependencyInjector.m_configFactoryMock,
    createConfig(Eq(m_anomalyDetectionRules))
  ).Times(1)
   .WillOnce(Return(m_configMock));

  // WHEN
  const auto configuration = configParser.parse();

  // THEN
  ASSERT_EQ(configuration, m_configMock);
}
```

You can also make sure that implementation class instances can be created only in the `DependencyInjector` class by declaring
implementation class constructors private and making the `DependencyInjector` class a friend of the implementation classes.
In this way, no one can accidentally create an instance of an implementation class. Instances of implementation classes should be created
by the dependency injector only. Below is a implementation class where the constructor is made private, and the dependency
injector is made a friend of the class:

AnomalyDetectionRulesParserImpl.h
```
#include "AnomalyDetectionRulesParser.h"

class AnomalyDetectionRulesParserImpl :
  public AnomalyDetectionRulesParser
{
  friend class DependencyInjector;

public:
  std::shared_ptr<AnomalyDetectionRules> parse() override;

private:
  AnomalyDetectionRulesParserImpl() = default;
};
```

#### UI Component Unit Testing

UI component unit testing differs from regular unit testing because you cannot necessarily test the functions of a
UI component in isolation if you have, for example, a React functional component. You must conduct UI component unit testing
by mounting the component to DOM and then perform tests by triggering events, for example. This way, you can test
the event handler functions of a UI component. The rendering part should also be tested. It can be tested by producing a snapshot of
the rendered component and storing that in version control. Further rendering tests should compare the
rendered result to the snapshot stored in the version control.

Below is an example of testing the rendering of a React component, `NumberInput`:

_NumberInput.test.js_
```
import renderer from 'react-test-renderer';
// ...

describe('NumberInput') () => {
  // ...
  
  describe('render', () => {
    it('renders with buttons on left and right"', () => {
      const numberInputAsJson =
        renderer
          .create(<NumberInput buttonPlacement="leftAndRight"/>)
          .toJSON();

      expect(numberInputAsJson).toMatchSnapshot();
    });
    
    it('renders with buttons on right', () => {
      const numberInputAsJson =
        renderer
          .create(<NumberInput buttonPlacement="right"/>)
          .toJSON();
      
      expect(numberInputAsJson).toMatchSnapshot();
    });
  });
});
```

Below is an example unit test for the number input's decrement button's click event handler function,
`decrementValue`:

_NumberInput.test.js_
```
import { render, fireEvent, screen } from '@testing-library/react'
// ...

describe('NumberInput') () => {
  // ...
  
  describe('decrementValue', () => {
    it('should decrement value by given step amount', () => {
      render(<NumberInput value="3" stepAmount={2} />);
      fireEvent.click(screen.getByText('-'));
      const numberInputElement = screen.getByDisplayValue('1');
      expect(numberInputElement).toBeTruthy();
    });
  });
});   
```

In the above example, we used the _testing-library_, which has implementations for all the common UI
frameworks: React, Vue and Angular. It means you can use mostly the same testing API regardless
of your UI framework. There are tiny differences, basically only in the syntax of the `render` method.
If you had implemented some UI components and unit tests for them with React, and you would like to reimplement them with Vue, you don't need to reimplement all the unit tests. You only
need to modify them slightly (e.g., make changes to the `render` function calls). Otherwise, the existing
unit tests should work because the behavior of the UI component
did not change, only its internal implementation from React to Vue.

### Software Component Integration Testing Principle

> Integration testing aims to test that a software component works against actual dependencies and that its public methods correctly understand the purpose and signature of other public methods they are using.

In the software component integration testing, all public functions of a software component should be tested. Not all
functionality of the public functions should be tested because that has already been done in the unit testing phase. This is
why there are fewer integration tests than unit tests. The term _integration testing_ sometimes refers to the integration of a complete software system or a product. However, it should be used to describe software
component integration only. When testing a product or a software system, the term _E2E testing_ should be used to avoid
confusion and misunderstandings.

The best way to define integration tests is by using _behavior-driven development_ (BDD). BDD encourages teams to
use domain-driven design and concrete examples to formalize a shared understanding of how a software component
should behave. In BDD, behavioral specifications are the root of the integration tests. A team can create behavioral specifications
during the initial domain-driven design phase. This practice will shift the integration testing to the left, meaning that writing
the integration tests starts early and can proceed in parallel with the actual implementation.
One widely used and recommended way to write behavioral specifications is the _Gherkin_ language.

When using the Gherkin language, the behavior of a software component is described as features. There should be a separate file for each feature. These files have the  `.feature` extension. Each feature file
describes one feature and one or more scenarios for that feature. The first scenario should be
the so-called "happy path" scenario, and other possible scenarios should handle additional happy paths, failures, and edge cases
that need to be tested. Remember that you don't have to test every failure and edge case because those were already tested in
the unit testing phase.

Below is a simplified example of one feature in a _data-visualization-configuration-service_. The service
is a REST API. The feature is for creating a new chart. (In a real-life scenario, a chart contains more properties like
the chart's data source and what measure(s) and dimension(s) are shown in the chart, for example)

_createChart.feature_
```
Feature: Create chart
  Creates a new chart

  Scenario: Creates a new chart successfully
    Given chart layout id is "1"
    And chart type is "line"
    And X-axis categories shown count is 10
    And fetchedRowCount is 1000

    When I create a new chart

    Then I should get the chart given above 
         with response code 201 "Created"
```

The above example shows how the feature's name is given after the `Feature` keyword. You can add free-form text below the feature's name
to describe the feature in more detail. Next, a scenario is defined after the `Scenario` keyword.
First, the name of the scenario is given. Then comes the steps of the scenario. Each step is defined using
one of the following keywords: `Given`, `When`, `Then`, `And`, and `But`. A scenario should follow this pattern:

- Steps to describe initial context/setup (Given/And steps)
- Steps to describe an event (When step)
- Steps to describe the expected outcome for the event (Then/And steps)

We can add another scenario to the above example:

_createChart.feature_
```
Feature: Create chart
  Creates a new chart

  Scenario: Creates a new chart successfully
    Given chart layout id is "1"
    And chart type is "line"
    And X-axis categories shown count is 10
    And fetchedRowCount is 1000

    When I create a new chart

    Then I should get the chart given above 
         with status code 201 "Created"

  Scenario: Chart creation fails due to missing mandatory parameter
    When I create a new chart

    Then I should get a response with status code 400 "Bad Request"
    And response body should contain "is mandatory field" entry 
        for following fields
      | layoutId                  |
      | fetchedRowCount           |
      | xAxisCategoriesShownCount |
      | type                      |
```

Now we have one feature with two scenarios specified. Next, we shall implement the scenarios. Our
_data-visualization-configuration-service_ is implemented in Java, and we want to implement also the integration
tests in Java. [Cucumber](https://cucumber.io/docs/installation/) has BDD tools for various programming languages.
We will be using the [Cucumber-JVM](https://cucumber.io/docs/installation/java/) library.

We place integration test code into the source code repository's _src/test_ directory.
The feature files are in the _src/test/resources/features_ directory. Feature directories should be organized
into subdirectories in the same way source code is organized into subdirectories: using
domain-driven design and creating subdirectories for subdomains. We can put the above _createChart.feature_
file to the _src/test/resources/features/chart_ directory.

Next, we need to provide an implementation for each step in the scenarios. Let's start with the first scenario. We shall
create a file _TestContext.java_ for the test context and a _CreateChartStepDefs.java_ file for the step definitions:

_TestContext.java_
```
public class TestContext { 
  public io.restassured.response.Response response;
}
```

_CreateChartStepDefs.java_
```
import integrationtests.TestContext;
import com.silensoft.dataviz.configuration.service.chart.Chart;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.http.ContentType;
import io.restassured.mapper.ObjectMapperType;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;

public class CreateChartStepDefs {
  private static final String BASE_URL =
    "http://localhost:8080/data-visualization-configuration-service/";

  private final TestContext testContext;
  private final Chart chart = new Chart();
 
  public CreateChartStepDefs(final TestContext testContext) {
    this.testContext = testContext;
  }
 
  @Given("chart layout id is {string}")
  public void setChartLayoutId(final String layoutId) {
    chart.setLayoutId(layoutId);
  }

  @Given("chart type is {string}")
  public void setChartType(final String chartType) {
    chart.setType(chartType);
  }

  @Given("X-axis categories shown count is {int}")
  public void setXAxisCategoriesShownCount(
    final Integer xAxisCategoriesShownCount
  ) {
    chart
      .setxAxisCategoriesShownCount(xAxisCategoriesShownCount);
  }

  @Given("fetchedRowCount is {int}")
  public void setFetchedRowCount(final Integer fetchedRowCount) {
    chart.setFetchedRowCount(fetchedRowCount);
  }

  @When("I create a new chart")
  public void createNewChart() {
    testContext.response = given()
      .contentType("application/json")
      .body(chart, ObjectMapperType.GSON)
      .when()
      .post(Constants.BASE_URL + "charts");
  }

   @Then("I should get the chart given above with status code {int} {string}")
   public void iShouldGetTheChartGivenAbove(
     final int statusCode,
     final String statusCodeName
   ) {
     testContext.response.then()
       .assertThat()
       .statusCode(statusCode)
       .body("id", greaterThan(0))
       .body("layoutId", equalTo(chart.getLayoutId()))
       .body("type", equalTo(chart.getType()))
       .body("xAxisCategoriesShownCount",
             equalTo(chart.getXAxisCategoriesShownCount()))
       .body("fetchedRowCount", 
              equalTo(chart.getFetchedRowCount()));
 }
}
```

The above implementation contains a function for each step. Each function is annotated with an annotation
for a specific Gherkin keyword: `@Given`, `@When`, and `@Then`. Note that a step in a scenario
can be templated. For example, the step `Given chart layout id is "1"` is templated and defined in the function
`@Given("chart layout id is {string}")`  `public void setChartLayoutId(final String layoutId)`
where the actual layout id is given as a parameter to the function. You can use this templated step
in different scenarios that can give a different value for the layout id, for example:
`Given chart layout id is "8"`.

The `createNewChart` method uses [REST-assured](https://rest-assured.io/) for submitting an HTTP POST request
to the _data-visualization-configuration-service_. And the `iShouldGetTheChartGivenAbove` function takes
the HTTP POST response and validates the status code and the properties in the response body.

The second scenario is a common failure scenario where you create something with missing parameters. Because
this scenario is common (i.e., we can use the same steps in other features), we put the step definitions
in a file named _CommonStepDefs.java_ in the _common_ subdirectory of the _src/test/java/integrationtests_ directory.

Here are the step definitions:

_CommonStepDefs.java_
```
import integrationtests.TestContext;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;

import java.util.List;

import static org.hamcrest.Matchers.hasItems;

public class CommonStepDefs {
  private final TestContext testContext;

  public CommonStepDefs(final TestContext testContext) {
    this.testContext = testContext;
  }

  @Then("I should get a response with status code {int} {string}")
  public void iShouldGetAResponseWithResponseCode(
    final int statusCode,
    final String statusCodeName
  ) {
      testContext.response.then()
        .assertThat()
        .statusCode(statusCode);
  }

  @And("response body should contain {string} entry for following fields")
  public void responseBodyShouldContainEntryForFollowingFields(
    final String entry,
    final List<String> fields
  ) {
    testContext.response.then()
      .assertThat()
      .body("", hasItems(fields
                           .stream()
                           .map(field -> field + ' ' + entry)
                           .toArray()));
  }
}
```

Cucumber is available in many other languages in addition to Java. It is available, for example, for JavaScript
([Cucumber.js](https://cucumber.io/docs/installation/javascript/)) and Python ([Behave](https://behave.readthedocs.io/en/stable/)). Integration tests can be written in a different language than the language used for implementation
and unit test code. For example, I am currently developing a microservice in C++. Our team has a
test automation developer working with integration tests using the Gherkin language for feature definitions
and Python and Behave for implementing the steps.

Some frameworks offer their way of creating integration tests. The Spring Boot framework offers
the `MockMvc` to test the web layer, like a REST API. Below is an example that uses the `MockMvc` for
testing a _sales-item-service_ REST API:

_SalesItemControllerTests.java_
```
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SalesItemControllerTests {
  private static final long SALES_ITEM_USER_ACCOUNT_ID = 1L;
  private static final String SALES_ITEM_NAME = "Test sales item";
  private static final int SALES_ITEM_PRICE = 10;
  private static final int UPDATED_SALES_ITEM_PRICE = 20;
  
  private static final String UPDATED_SALES_ITEM_NAME =
    "Updated test sales item";
  
  @Autowired
  private MockMvc mockMvc;
  
  @Test
  @Order(1)
  final void testCreateSalesItem() throws Exception {
    // GIVEN
    final var salesItemArg =
      new SalesItemArg(SALES_ITEM_USER_ACCOUNT_ID,
                       SALES_ITEM_NAME,
                       SALES_ITEM_PRICE);

    final var salesItemArgJson =
      new ObjectMapper().writeValueAsString(salesItemArg);

    // WHEN
    mockMvc
      .perform(post(SalesItemController.API_ENDPOINT)
                 .contentType(MediaType.APPLICATION_JSON)
                 .content(salesItemArgJson))
      .andDo(print())
      // THEN
      .andExpect(jsonPath("$.id").value(1))
      .andExpect(jsonPath("$.name").value(SALES_ITEM_NAME))
      .andExpect(jsonPath("$.price").value(SALES_ITEM_PRICE))
      .andExpect(status().isCreated());
  }
  
  @Test
  @Order(2)
  final void testGetSalesItems() throws Exception {
    // WHEN
    mockMvc
      .perform(get(SalesItemController.API_ENDPOINT))
      .andDo(print())
      // THEN
      .andExpect(jsonPath("$[0].id").value(1))
      .andExpect(jsonPath("$[0].name").value(SALES_ITEM_NAME))
      .andExpect(status().isOk());
  }
  
  @Test
  @Order(3)
  final void testGetSalesItemById() throws Exception {
    // WHEN
    mockMvc
      .perform(get(SalesItemController.API_ENDPOINT + "/1"))
      .andDo(print())
      // THEN
      .andExpect(jsonPath("$.name").value(SALES_ITEM_NAME))
      .andExpect(status().isOk());
  }
  
  @Test
  @Order(4)
  final void testGetSalesItemsByUserAccountId() throws Exception {
    // GIVEN
    final var url = SalesItemController.API_ENDPOINT +
                    "?userAccountId=" + SALES_ITEM_USER_ACCOUNT_ID;
    
    // WHEN
    mockMvc
      .perform(get(url))
      .andDo(print())
      // THEN
      .andExpect(jsonPath("$[0].name").value(SALES_ITEM_NAME))
      .andExpect(status().isOk());
  }
  
  @Test
  @Order(5)
  final void testUpdateSalesItem() throws Exception {
    // GIVEN
    final var salesItemArg =
      new SalesItemArg(SALES_ITEM_USER_ACCOUNT_ID,
                       UPDATED_SALES_ITEM_NAME,
                       UPDATED_SALES_ITEM_PRICE);

    final var salesItemArgJson =
      new ObjectMapper().writeValueAsString(salesItemArg);

    // WHEN
    mockMvc
      .perform(put(SalesItemController.API_ENDPOINT + "/1")
                 .contentType(MediaType.APPLICATION_JSON)
                 .content(salesItemArgJson))
      .andDo(print());

    // THEN
    mockMvc
      .perform(get(SalesItemController.API_ENDPOINT + "/1"))
      .andDo(print())
      .andExpect(jsonPath("$.name").value(UPDATED_SALES_ITEM_NAME))
      .andExpect(jsonPath("$.price").value(UPDATED_SALES_ITEM_PRICE))
      .andExpect(status().isOk());
  }
  
  @Test
  @Order(6)
  final void testDeleteSalesItemById() throws Exception {
    // WHEN
    mockMvc
      .perform(delete(SalesItemController.API_ENDPOINT + "/1"))
      .andDo(print());

    // THEN
    mockMvc
      .perform(get(SalesItemController.API_ENDPOINT + "/1"))
      .andDo(print())
      .andExpect(status().isNotFound());
  }
  
  @Test
  @Order(7)
  final void testDeleteSalesItems() throws Exception {
    // GIVEN
    final var salesItemArg =
      new SalesItemArg(SALES_ITEM_USER_ACCOUNT_ID,
                       SALES_ITEM_NAME,
                       SALES_ITEM_PRICE);

    final var salesItemArgJson =
      new ObjectMapper().writeValueAsString(salesItemArg);
    
    mockMvc
      .perform(post(SalesItemController.API_ENDPOINT)
                 .contentType(MediaType.APPLICATION_JSON)
                 .content(salesItemArgJson))
      .andDo(print());

    // WHEN
    mockMvc
      .perform(delete(SalesItemController.API_ENDPOINT))
      .andDo(print());

    // THEN
    mockMvc
      .perform(get(SalesItemController.API_ENDPOINT))
      .andDo(print())
      .andExpect(jsonPath("$").isEmpty())
      .andExpect(status().isOk());
  }
}
```

If you have an API microservice, one more alternative to implement integration tests is an API development platform like [Postman](https://www.postman.com/). Postman can be used to write integration tests using JavaScript.

Below is an example API request for creating a new sales item. You can define this in Postman as a new request:

<div class="sourceCodeWithoutLabel">

```
POST http://localhost:3000/sales-item-service/sales-items
{
  "name": "Test sales item",
  "price": 10,
}
```
</div>

Here is a Postman test case to validate the response to the above request:

<div class="sourceCodeWithoutLabel">

```
pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});

const salesItem = pm.response.json();
pm.collectionVariables.set("salesItemId", salesItem.id)

pm.test("Sales item name", function () {
  return pm.expect(salesItem.name).to.eql("Test sales item"); 
})

pm.test("Sales item price", function () {
  return pm.expect(salesItem.price).to.eql(10); 
})
```
</div>

In the above test case, the response status code is verified first, and then the `salesItem` object is parsed
from the response body. Value for the variable `salesItemId` is set. This variable will be used
in subsequent test cases. Finally, the values of the `name` and `price` properties are checked.

Next, a new API request could be created in Postman to retrieve the just created sales item:

<div class="sourceCodeWithoutLabel">

```
GET http://localhost:3000/sales-item-service/sales-items/{{salesItemId}}
```

</div>

We used the value stored in the `salesItemId` variable in the request URL. Variables can be used in the URL
and request body using the following notation: `{{<variable-name>}}`. Let's create a test case for
the above request:

<div class="sourceCodeWithoutLabel">

```
pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});

const salesItem = pm.response.json();

pm.test("Sales item name", function () {
  return pm.expect(salesItem.name).to.eql("Test sales item"); 
})

pm.test("Sales item price", function () {
  return pm.expect(salesItem.price).to.eql(10); 
})
```
</div>

API integration tests written in Postman can be utilized in a CI/CD pipeline. An easy way to do that is to export
a Postman collection to a file that contains all the API requests and related tests. A Postman collection
file is a JSON file. Postman offers a Node.js command-line utility called [Newman](https://learning.postman.com/docs/running-collections/using-newman-cli/installing-running-newman/). It can be used
to run API requests and related tests in an exported Postman collection file.

You can run integration tests in an exported Postman collection file with the below command in a CI/CD pipeline:

<div class="sourceCodeWithoutLabel">

```
newman run integration-tests/integrationTestsPostmanCollection.json
```
</div>

In the above example, we assume that a file named
_integrationTestsPostmanCollection.json_ has been exported to the _integration-tests_ directory in the source code repository.

#### UI Integration Testing

You can also use the Gherkin language when specifying UI features. For example, the _TestCafe_ UI testing tool can be
used with the _gherkin-testcafe_ tool to make TestCafe support the Gherkin syntax. Let's create a simple UI feature:

_greetUser.feature_
```
Feature: Greet user
  Entering user name and clicking submit button
  displays a greeting for the user
  
  Scenario: Greet user successfully
    Given there is "John Doe" entered in the input field
    When I press the submit button
    Then I am greeted with text "Hello, John Doe" 
```

Next, we can implement the above steps in JavaScript using the TestCafe testing API:

_GreetUserSteps.js_
```
// Imports...

// 'Before' hook runs before the first step of each scenario.
// 't' is the TestCafe test controller object
Before('Navigate to application URL', async (t) => {
  // Navigate browser to application URL
  await t.navigateTo('...');
});

Given('there is {string} entered in the input field',
      async (t, [userName]) => {
  // Finds an HTML element with CSS id selector and
  // enters text to it 
  await t.typeText('#user-name', userName);
});

When('I press the submit button', async (t) => {
  // Finds an HTML element with CSS id selector and clicks it
  await t.click('#submit-button');
});

When('I am greeted with text {string}', async (t, [greeting]) => {
  // Finds an HTML element with CSS id selector
  // and compares its inner text
  await t.expect(Selector('#greeting').innerText).eql(greeting);
});
```

There is another similar tool to TestCafe, namely _Cypress_. You can also use Gherkin with Cypress with the
_cypress-cucumber-preprocessor_ package. Then you can write your UI integration tests like this:

_visitDuckDuckGoWebSite.feature_
```
Feature: Visit duckduckgo.com website

  Scenario: Visit duckduckgo.com website successfully
    When I visit duckduckgo.com
    Then I should see the search bar
```

_VisitDuckDuckGoWebSiteSteps.js_
```
import { When, Then } from 
  '@badeball/cypress-cucumber-preprocessor';

When("I visit duckduckgo.com", () => {
  cy.visit("https://www.duckduckgo.com");
});

Then("I should see the search bar", () => {
  cy.get("input").should(
    "have.attr",
    "placeholder",
    "Search the web without being tracked"
  );
});
```

#### Setting Up Integration Testing Environment

Before integration tests can be run, an integration testing environment must be set up. An integration testing
environment is where the tested microservice and all its dependencies are running. The easiest way to
set up an integration testing environment for a containerized microservice is to use _Docker Compose_, a simple container orchestration tool for a single host.

Let's create a _docker-compose.yml_ file for the _sales-item-service_, which has a MySQL database as a dependency.

_docker-compose.yml_
```
version: "3.8"

services:
  wait-for-services-ready:
    image: dokku/wait
  sales-item-service:
    restart: always
    build:
      context: .
    env_file: .env.ci
    ports:
      - "3000:3000"
    depends_on:
      - mysql
  mysql:
    image: mysql:8.0.22
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    cap_add:
      - SYS_NICE
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
```

In the above example, we first define a service _wait-for-services-ready_ which we will use later.
Next, we define our microservice, _sales-item-service_. We ask Docker Compose to build a container image
for the _sales-item-service_ using the _Dockerfile_ in the current directory. Then we define the environment for
the microservice to be read from an _.env.ci_ file. We expose port 3000 and tell that our microservice
depends on the _mysql_ service.

Next, we define the _mysql_ service. We tell what image to use, give a command-line parameter and
define the environment and expose a port.

Before we can run the integration tests, we must spin the integration testing environment up using
the `docker-compose up` command:

<div class="sourceCodeWithoutLabel">

```
docker-compose up --env-file .env.ci --build -d
```
</div>

We tell the `docker-compose` command to read environment variables from an _.env.ci_ file, which should contain
an environment variable named `MYSQL_PASSWORD`. We ask `docker-compose` to always build the _sales-item-service_ by specifying the
`--build` flag. The `-d` flag tells `docker-compose` to run in the background.

Before we can run the integration tests, we must wait until all services defined in the _docker-compose.yml_ are
up and running. We use the _wait-for-services-ready_ service provided by the
[dokku/wait](https://hub.docker.com/r/dokku/wait) image. We can wait for the services to be ready by issuing the following
command:

<div class="sourceCodeWithoutLabel">

```
docker-compose 
  --env-file .env.ci
  run wait-for-services-ready
  -c mysql:3306,sales-item-service:3000
  -t 600
```
</div>

The above command will finish after _mysql_ service's port 3306 and _sales-item-service's_ port 3000 can be
connected. After the above command is finished, you can run the integration tests. In the below example, we run the integration
tests using the _newman_ CLI tool:

<div class="sourceCodeWithoutLabel">

```
newman run integration-tests/integrationTestsPostmanCollection.json
```
</div>

After integration tests are completed, you can shut down the integration testing environment:

<div class="sourceCodeWithoutLabel">

```
docker-compose down
```
</div>

If you need other dependencies in your integration testing environment, you can add them to the _docker-compose.yml_
file. If you need to add other microservices with dependencies, you must also add transitive dependencies. For example,
if you needed to add another microservice that uses a PostgreSQL database, you would
need to add both the other microservice and PostgreSQL database to the _docker-compose.yml_ file.

Let's say the _sales-item-service_ depends on Apache Kafka 2.x
that depends on a Zookeeper service. The _sales-item-service's_ _docker-compose.yml_ looks
like the below after adding Kafka and Zookeeper:

<div class="sourceCodeWithoutLabel">

_docker-compose.yml_
```
version: "3.8"

services:
  wait-for-services-ready:
    image: dokku/wait
  sales-item-service:
    restart: always
    build:
      context: .
    env_file: .env.ci
    ports:
      - 3000:3000
    depends_on:
      - mysql
      - kafka
  mysql:
    image: mysql:8.0.22
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    cap_add:
      - SYS_NICE
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
  zookeeper:
    image: bitnami/zookeeper:3.7
    volumes:
      - "zookeeper_data:/bitnami"
    ports:
      - 2181:2181"
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes
  kafka:
    image: bitnami/kafka:2.8.1
    volumes:
      - "kafka_data:/bitnami"
    ports:
      - "9092:9092"
    environment:
      - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
      - ALLOW_PLAINTEXT_LISTENER=yes
    depends_on:
      - zookeeper

volumes:
  zookeeper_data:
    driver: local
  kafka_data:
    driver: local
```
</div>

### End-to-End (E2E) Testing Principle

> End-to-end (E2E) testing should test a complete software system (i.e., the integration of microservices) so that each 
> test case is end-to-end (from the software system's south-bound interface to the software system's north-bound interface).

As the name says, in E2E testing, test cases should be end-to-end. They should test that each microservice is deployed correctly
to the test environment and connected to its dependent services. The idea of E2E test cases
is not to test details of microservices' functionality because that has already been tested as part of unit and
software component integration testing.

Let's consider a telecom network analytics software system that consists of the following applications:

- Data ingestion
- Data correlation
- Data aggregation
- Data exporter
- Data visualization

![Figure 5.2 Telecom Network Analytics Software System](images/06-02.png)

The southbound interface of the software system is the data ingestion
application. The data visualization application provides a web client as a northbound interface.
Additionally, the data exporter application provides another northbound interface for the software system.

E2E tests are designed and implemented similarly to software component integration tests.
We are just integrating different things (microservices instead of functions). E2E testing should start with the specification of E2E features.
These features can be specified using the Gherkin language and put in _.feature_ files.

You can start specifying and implementing E2E tests right after the architectural design for the software system is completed. This way, you can shift the implementation of the E2E test to the left and speed up the development phase. You should not start specifying and implementing E2E only when the whole software system is implemented.

Our example software system should have at least two happy-path E2E features. One for testing the data flow from data ingestion
to data visualization and another feature to test the data flow from data ingestion to data export. Below is the specification
of the first E2E feature:

_dataVisualization.feature_
```
Feature: Visualize ingested, correlated and 
         aggregated data in web UI's dashboard's charts

  Scenario: Data ingested, correlated and aggregated is visualized
            successfully in web UI's dashboard's charts
    
    Given southbound interface simulator is configured
          to send input messages that contain data...
    And data ingester is configured to read the input messages
        from the southbound interface
    And data correlator is configured to correlate
        the input messages
    And data aggregator is configured to calculate 
        the following counters...
    And data visualization is configured with a dashboard containing
        the following charts viewing the following counters/KPIs...
    
    When southbound interface simulator sends the input messages
    And data aggregation period is waited
    And data content of each data visualization web UI's dasboard's
        chart is exported to a CSV file
    
    Then the CSV export file of the first chart should
         contain following values...
    And the CSV export file of the second chart should
         contain following values...
    .
    .
    .
    And the CSV export file of the last chart should
         contain following values...
```

And then, we can create the other feature that tests the E2E path from data ingestion to data export:

_dataExport.feature_
```
Feature: Export ingested, correlated and transformed data
         to Apache Pulsar

  Scenario: Data ingested, correlated and transformed is
            successfully exported to Apache Pulsar
    Given southbound interface simulator is configured to send
          input messages that contain data...
    And data ingester is configured to read the input messages
        from the southbound interface
    And data correlator is configured to correlate
       the input messages
    And data exporter is configured to export messages with
        the following transformations to Apache Pulsar...
    
    When southbound interface simulator sends the input messages
    And messages from Apache Pulsar are consumed
    
    Then first message from Apache Pulsar should have
         the following fields with following values...
    And second message from Apache Pulsar should have
        the following fields with following values...
    .
    .
    .
    And last message from Apache Pulsar should have
        the following fields with following values...
```

Next, E2E tests can be implemented. Any programming language and tool compatible with the Gherkin
syntax, like Behave with Python, can be used.

The software system we want to E2E test must reside in a production-like test environment.
Usually, E2E testing is done in both the CI and the staging environment(s). Before running the E2E tests, software needs
to be deployed to the test environment.

If we consider the first feature above, implementing the E2E test steps
can be done so that the steps in the `Given` part of the scenario are implemented using externalized configuration. If our software
system runs in a Kubernetes cluster, we can configure the microservices by creating
the needed ConfigMaps. The southbound interface simulator can be controlled by launching a Kubernetes Job
or, if the southbound interface simulator is a microservice with an API, commanding it via its API.
After waiting for all the ingested data to be aggregated and visualized, the E2E test can launch a test tool suited for web UI testing
(like TestCafe) to export chart data from the web UI to downloaded files. Then the E2E test compares the content
of those files with expected values.

You can run E2E tests in a CI environment after each commit to the main branch (i.e., after a microservice CI/CD
pipeline run is finished) to test that a new commit did not break any E2E tests. Alternatively, if the E2E tests are complex and
take a long time to execute, you can run the E2E tests in the CI environment on a schedule, like hourly.

You can run E2E tests in a staging environment using a separate pipeline in your CI/CD tool.

## Non-Functional Testing Principle

> In addition to multi-level functional testing, non-functional testing, as automated as possible,  should be performed for a software system.

The most important categories of non-functional testing are the following:

- Performance testing
- Data volume testing
- Stability testing
- Reliability testing
- Stress and scalability testing
- Security testing

### Performance Testing

The goal of performance testing is to verify the performance of a software system. This verification can be
done on different levels and in different ways, for example, by verifying each performance-critical microservice separately.

To measure the performance of a microservice, performance tests can be created to benchmark the busy loop or
loops in the microservice. If we take the data exporter microservice as an example, there is a busy loop that performs message decoding, transformation, and encoding.
We can create a performance test using a unit testing framework for this busy loop. The performance test
should execute the code in the busy loop for a certain number of rounds and verify that the execution
duration does not exceed a specified threshold value obtained on the first run of
the performance test. The performance test aims to verify that performance remains at the same
level as it has been. If the performance has worsened, the test won't pass. In this way, you cannot accidentally introduce changes that negatively affect the performance without noticing it.
This same performance test can also be used to measure the effects of optimizations. First, you write
code for the busy loop without optimizations, measure the performance, and use that measure as a reference point. After
that, you start introducing optimizations one by one and see if and how they affect performance.

The performance test's execution time threshold value must be separately specified for each
developer's computer. This can be achieved by having a different threshold value for each
computer hostname running the test.

You can also run the performance test in a CI/CD pipeline, but you must first measure the performance in that
pipeline and set the threshold value accordingly. Also, the computing instances running CI/CD pipelines must be
homogeneous. Otherwise, you will get different results on different CI/CD pipeline runs.

The above-described performance test was for a unit (one public function), but performance testing can also be done
on the software component level. This is useful if the software component has external dependencies whose performance
needs to be measured. In the telecom network analytics software system, we could introduce a performance test for the _data-ingester-service_
to measure how long it takes to process a certain number of messages, like one million. After executing that test, we have a performance measurement available for reference. When we try to optimize
the microservice, we can measure the performance of the optimized microservice and compare it to the reference value.
If we make a change known to worsen the performance, we have a reference value to which we can compare
the deteriorated performance and see if it is acceptable. And, of course, this reference value will prevent a developer
from accidentally making a change that negatively impacts the microservice's performance.

We can also measure end-to-end performance. In the telecom network analytics software system, we could measure the performance
from data ingestion to data export, for example.

### Data Volume Testing

The goal of data volume testing is to measure the performance of a database compared when the database is empty to
when the database has a sizeable amount of data stored in it. With data volume testing, we can measure the impact of data volume
on a software component's performance. Usually, an empty database has better performance than a database
containing a high amount of data. This, of course, depends on the database and how it scales with a large amount of data.

### Stability Testing

Stability testing aims to verify that a software system remains stable when running for an extended period
of time under load. This testing is also called load, endurance, or soak testing. The term "extended period" can be interpreted
differently depending on the software system. But this period should be many hours, preferably several
days, even up to one week. Stability testing aims to discover problems like sporadic bugs or memory leaks.
A sporadic bug is a bug that occurs only in certain conditions or at irregular intervals. A memory leak can be so small
that it requires the software component to run for tens of hours after it becomes visible. It is recommended that when running
the software system for a longer period, the induced load to the software system follows a natural pattern
(mimicking the production load), meaning that there are peaks and lows in the load.

Stability testing can be partly automated. The load to the system can be generated using tools created for that purpose,
like Apache JMeter, for example. Each software component can measure crash count, and those statistics can be analyzed
automatically or manually after the stability testing is completed. Analyzing memory leaks can be trickier, but crashes due
to out-of-memory should be registered, and situations where a software component is scaling out due to lack of memory.

### Reliability Testing

Reliability testing aims to verify that a software system runs reliably. The software system is reliable when
it is resilient to failures and recovers from failures automatically as fast as possible. Reliability testing is also called availability,
recovery, or resilience testing.

Reliability testing involves chaos engineering to induce various failures in the software system's
environment. It should also ensure that the software system stays available and can automatically recover from failures.

Suppose you have a software system deployed to a Kubernetes cluster. You can make stateless services highly available
by configuring them to run more than one pod. If one node goes down,
it will terminate one of the pods, but the service remains available and usable because
at least one other pod is still running on a different node. Also, after a short while, when Kubernetes notices that
one pod is missing, it will create a new pod on a new node, and
there will be the original number of pods running, and the recovery from the node down is successful.

Many parts of the reliability testing can be automated. You can use ready-made chaos engineering tools or create
your own tools. Use a tool to induce failures in the environment. Then verify that services remain either highly available or at least swiftly recover from failures.

Considering the telecom network analytics software system, we could introduce a test case where the message broker (e.g., Kafka) is shut down. Then we expect alerts triggered
after a while by the microservices that try to use the unavailable message broker. After the message broker is started, the alerts should
cancel automatically, and the microservices should continue normal operation.

### Stress and Scalability Testing

Stress testing aims to verify that a software system runs under high load. In stress testing, the
software system is exposed to a load higher than the system's usual load. The software system
should be designed as scalable, which means that the software system should also run under high load. Thus,  
stress testing should test the scalability of the software system and see that microservices scale out when needed.
At the end of stress testing, the load is returned back to the normal level, and scaling the microservices in can also be verified.

You can specify a HorizontalPodAutoscaler (HPA) for a Kubernetes Deployment. In the HPA manifest, you must specify the minimum
number of replicas. This should be at least two if you want to make your microservice highly
available. You also need to specify the maximum number of replicas so that your microservice does not consume too many
computing resources in some weird failure case. You can make the horizontal scaling (scaling in and out) happen
by specifying a target utilization rate for CPU and memory. Below is an example Helm chart template for defining a Kubernetes
HPA:

<div class="sourceCodeWithoutLabel">

```
{{- if eq .Values.nodeEnv "production" }}
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "microservice.fullname" . }}
  labels:
    {{- include "microservice.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "microservice.fullname" . }}
  minReplicas: {{ .Values.hpa.minReplicas }}
  maxReplicas: {{ .Values.hpa.maxReplicas }}
  metrics:
    {{- if .Values.hpa.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: cpu
        targetAverageUtilization: {{ .Values.hpa.targetCPUUtilizationPercentage }}
    {{- end }}
    {{- if .Values.hpa.targetMemoryUtilizationPercentage }}
    - type: Resource
      resource:
        name: memory
        targetAverageUtilization: {{ .Values.hpa.targetMemoryUtilizationPercentage }}
    {{- end }}
{{- end }}
```
</div>

It is also possible to specify the autoscaling to use an external metric. An external metric could be Kafka consumer lag, for instance.
If Kafka consumer lag grows too high, the HPA can scale the microservice out to have more processing power for the Kafka consumer group
and when the Kafka consumer lag decreases below a defined threshold, HPA can scale the microservice in to reduce the number of pods.

### Security Testing

The goal of security testing is to verify that a software system is secure and does not contain security vulnerabilities.
One part of security testing is performing vulnerability scans of the software artifacts. Typically, this means
scanning the microservice containers using an automatic vulnerability scanning tool. Another essential part of security
testing is penetration testing, which simulates attacks by a malicious party. Penetration testing can be performed
using an automated tool like OWASP ZAP or Burp Suite.

Penetration testing tools try to find security vulnerabilities in the following categories:

- Cross-site scripting
- SQL injection
- Path disclosure
- Denial of service
- Code execution
- Memory corruption
- Cross-site request forgery (CSRF)
- Information disclosure
- Local/remote file inclusion

A complete list of possible security vulnerabilities found by the OWASP ZAP tool can be found at https://www.zaproxy.org/docs/alerts/.

### Other Non-Functional Testing

Other non-functional testing is documentation testing and several UI-related non-functional testing, including
accessibility (A11Y) testing, visual testing, usability testing, and localization and internationalization (I18N) testing.

#### Visual Testing

I want to bring up visual testing here because it is important. _Backstop.js_ and _cypress-plugin-snapshots_ test web UI's HTML and CSS
using snapshot testing. Snapshots are screenshots taken of the web UI. Snapshots are compared to ensure that the visual look of the
application stays the same and there are no bugs introduced with HTML or CSS changes.

