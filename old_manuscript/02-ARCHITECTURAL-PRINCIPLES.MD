# Architectural Principles

This chapter describes architectural principles for designing clean, modern cloud-native software systems and applications.
Cloud-native software is built of loosely coupled scalable, resilient and observable services that can run
in public, private, or hybrid clouds. Cloud-native software utilizes technologies like containers (e.g., Docker),
microservices, serverless functions, and container orchestration (e.g., Kubernetes), and it can be automatically
deployed using declarative code.

This chapter discusses the following architectural principles and patterns:

- Single responsibility principle
- Uniform naming principle
- Encapsulation principle
- Service aggregation principle
- High cohesion, low coupling principle
- Library composition principle
- Avoid duplication principle
- Externalized service configuration principle
- Service substitution principle
- Autopilot microservices principle
  - Stateless microservices principle
  - Resilient microservices principle
  - Horizontally autoscaling microservices principle
  - Highly-available microservices principle
  - Observable services principle
- Inter-service communication patterns
- Domain-driven architectural design principle
- Software versioning principles
- Git Version control principle
- Architectural patterns
- Preferred technology stacks principle

## Software Hierarchy

A _software system_ consists of multiple computer programs and anything related to those programs
to make them operable, including but not limited to configuration, deployment code, and documentation. A software system
is divided into two parts: _the backend_ and  _the frontend_. Backend software runs on servers, and frontend software runs on client
devices like PCs, tablets, and phones. Backend software consists of _services_. Frontend software consist of _clients_ that use backend services
and _standalone applications_ that do not use any backend services. An example of a standalone application is a calculator or a simple text editor.

The term _application_ is often used to describe a single program designated for a specific purpose. In general, a software application is some software applied to solve a specific problem. From an end user's point of view, all clients are applications. But from a developer's
point of view, an application needs both a client and backend service(s) to be functional unless the application is a _standalone application_.
In this book, I will use the term application to designate a logical grouping of program(s) and related artifacts, like configuration, to form a functional piece of the
software system dedicated to a specific purpose. In my definition, a non-standalone application consists of one or more services and
possibly a client or clients to fulfill an end user's need. Let's say we have a software system for telecom network analytics. That system provides data
visualization functionality. We can call the data visualization part of the software system a data visualization application.
That application consists of, for example, a web client and two services, one for fetching data and one for configuration.
Suppose we also have a generic data ingester microservice in the system. That generic data ingester is not an
application without some configuration that makes it a specific service that we can call an application.
For example, the generic data ingester can have a configuration to ingest raw data from a radio network. The generic data ingester and
the configuration together form an application: a radio network data ingester.

![Fig 2.1 Software Hierarchy](images/02-01.png)

Computer programs and _libraries_ are _software components_. A _software component_ is something that can be individually
packaged, tested, and delivered. It consists of one or more classes, and a class consists of one or more functions (class methods).
(There are no traditional classes in purely functional languages, but software components consist only of functions.)
A computer program can also be composed of one or more libraries, and a library can be composed of other libraries.

![Fig 2.2 Software Components](images/02-01b.png)

## Single Responsibility Principle

> A software entity should have only single responsibility at its abstraction level.

A software system is at the highest level in the software hierarchy and should have a single dedicated purpose.  
For example, there can be an e-commerce or payroll software system. But there
should not be a software system that handles both e-commerce and payroll-related activities. If you were a
software vendor and had made an e-commerce software system, selling that to clients
wanting an e-commerce solution would be easy. But if you had made a software system that encompasses
both e-commerce and payroll functionality, it would be hard to sell that to customers wanting only an e-commerce solution
because they might already have a payroll software system and, of course, don't want another one.

Let's consider the application level in the software hierarchy. Suppose we have designed a software
system for telecom network analytics. This software system is divided into four different applications:
Radio network data ingestion, core network data ingestion, data aggregation, and data visualization. Each of these applications has a single dedicated purpose. Suppose we had coupled the data aggregation and visualization applications into a single
application. In that case, replacing the data visualization part with a 3rd party application could be difficult.
But when they are separate applications with a well-defined interface, it would be much easier to replace the data
visualization application with a 3rd party application, if needed.

A software component should also have a single dedicated purpose. A service
type of software component with a single responsibility is called a _microservice_. For example, one microservice could
be responsible for handling orders and another for handling sales items. Both of those microservices are responsible for one thing only.
We should not have a microservice responsible for both orders and sales items. That would be against the single responsibility
principle because order and sales item handling are two different functionalities at the same level of abstraction.

There are many advantages to microservices:

- Improved productivity
  - You can choose the best-suited programming language and technology stack
  - Microservices are easy to develop in parallel because there will be fewer merge conflicts
  - Developing a monolith can result in more frequent merge conflicts
- Improved resiliency and fault isolation
  - A fault in a single microservice does not bring other microservices down
  - A bug in a monolith can bring the whole monolith down
- Better scalability
  - Stateless microservices can be automatically horizontally scalable
  - Horizontal scaling of a monolith is complicated or impossible
- Better data security and compliance
  - Each microservice encapsulates its data, which can be accessed via a public API only
- Faster and easier upgrades
  - Upgrading only the changed microservice(s) is enough. No need to update the whole monolith every time
- Faster release cycle
  - Build the changed microservice only. No need to build the whole monolith when something changes
- Fewer dependencies
  - Lower probability for dependency conflicts
- Enables _open-closed architecture_, meaning architecture that is open for extension and closed for modification
  - New functionality not related to any existing microservice can be put into a new microservice instead of modifying the current codebase.

The main drawback of microservices is the complexity that a distributed architecture brings. Operating and monitoring
a microservice-based software system is complicated. Also, testing a distributed system is more challenging than testing a monolith.
Development teams should put focus on these areas by hiring DevOps and test automation specialists.

A library type of software component should also have a single responsibility. Like calling single-responsibility services microservices, we can
call a single-responsibility library a _microlibrary_. For example, there could be a library for
handling YAML-format content and another for handling XML-format content. We shouldn't try to bundle
the handling of both formats into a single library. If we did and needed only the YAML-related functionality, we would also always get the XML-related functionality. Our code
would always ship with the XML-related code, even if it is never used. This can introduce unnecessary code bloat. We would
also have to take any security patch for the library into use, even if the patch was only for the XML-related functionality we don't use.

## Uniform Naming Principle

> Name microservices with a _service_ or _api_ postfix, clients with a _client_ postfix, and libraries with a _library_ postfix.

When developing software, you should establish a naming convention for microservices, clients, and libraries.

The preferred naming convention for microservices is _&lt;service's purpose&gt;-service_. For example:
_data-aggregation-service_ or _email-sending-service_. Use the microservice name systematically in different places.
For example, use it as the Kubernetes Deployment name and the source code repository name (or directory name in case of a monorepo).
It is enough to name your microservices with the _service_ postfix instead of a _microservice_  postfix because each service
should be a microservice by default. So, there would not be any real benefit in naming microservices with the _microservice_ postfix.
That would just make the microservice name longer without any added value.

If you want to be more specific in naming microservices, you can name API microservices with an _api_ postfix instead of the more generic
_service_ postfix, for example, _sales-item-api_. In this book, I am not using the _api_ postfix but always use
the _service_ postfix only.

The preferred naming convention for clients is _&lt;client's purpose&gt;-&lt;client type&gt;-client_. For example:
_data-visualization-web-client_, _data-visualization-mobile-client_, _data-visualization-android-client_ or _data-visualization-ios-client_.

The preferred naming convention for libraries is _&lt;library's purpose&gt;-library_. For example: _common-utils-library_ or
_common-ui-components-library_.

When using these naming conventions, a clear distinction between a microservice, client, and
library-type software component can be made only by looking at the name. Also, it is easy to recognize if a source code repository contains a microservice, client, or library.

## Encapsulation Principle

> Microservice must encapsulate its internal state behind a public API. Anything behind the public API
> is considered private to the microservice and cannot be accessed directly by other microservices.

Microservices should define a public API that other microservices use for interfacing. Anything behind the public API is
private and inaccessible from other microservices.

While microservices should be made stateless (the _stateless services principle_ is discussed later in this chapter),
a stateless microservice needs a place to store its state outside the microservice. Typically, the state is stored
in a database. The database is the microservice's internal dependency and should be made private to
the microservice, meaning that no other microservice can directly access the database. Access to the
database happens indirectly using the microservice's public API.

It is discouraged to allow multiple microservices to share a single database because then there is no control how
each microservice will use the database, and what requirements each microservice has for the database.

Sometimes it is possible to share a _physical_ database with several microservices if each microservice
uses its own _logical_ database. This requires that a specific database user is created for each microservice. Each database user can access only
one logical database dedicated to a particular microservice. In this way, no microservice can directly access
another microservice's database. This approach can still pose some problems because the dimensioning requirements
of all microservices for the shared physical database must be considered. Also, the deployment responsibility
of the shared database must be decided. The shared database could be deployed as a platform or common service as part of the platform
or common services deployment, for example.

## Service Aggregation Principle

> Service on a higher level of abstraction aggregates services on a lower level of abstraction.

Service aggregation happens when one service on a higher level of abstraction aggregates services on a lower level 
of abstraction. 

![Fig 2.3 Architecture Without and With Service Aggregation](images/02-01c.png)

Let's have a service aggregation example with an e-commerce software system that allows people to sell second-hand products
online.

The problem domain of the e-commerce service consists of the following subdomains:

- User account domain
  - Create, modify, and delete a user account
  - View user account with sales items and orders
- Sales item domain
  - Add new sales items, modify, view, and delete sales items
- Shopping cart domain
  - Add/remove sales items to/from a shopping cart, empty a shopping cart
  - View shopping cart with sales item details
- Order domain
  - Placing orders
    - Ensure payment
    - Create order
    - Remove ordered items from the shopping cart
    - Mark ordered sales items sold
    - Send order confirmation by email
  - View orders with sales item details 
  - Update and delete orders

We should not implement all the subdomains in a single _ecommerce-service_ microservice because then we would not be
following the _single responsibility principle_. We should use service aggregation. We create a separate lower-level microservice
for each subdomain. Then we create a higher-level _ecommerce-service_ microservice that aggregates those lower-level microservices.

We can define that our _ecommerce-service_ aggregates the following lower-level microservices:

- _user-account-service_
  - Create/Read/Update/Delete user accounts
- _sales-item-service_
  - Create/Read/Update/Delete sales items
- _shopping-cart-service_
  - View a shopping cart, add/remove sales items from a shopping cart or empty a shopping cart
- _order-service_
  - Create/Read/Update/Delete orders
- _email-notification-service_
  - Send email notifications

![Fig 2.4 Service Aggregation in E-Commerce Software System](images/02-01d.png)

Most of the microservices described above can be implemented as REST APIs because they mainly contain
basic CRUD (create, read, update and delete) operations for which a REST API is a good match. We will handle
API design in more detail in a later chapter. Let's implement the _sales-item-service_ as a REST API
using Java and Spring Boot. We will implement the `SalesItemController` class first. It
defines API endpoints for creating, getting, updating, and deleting sales items:

_SalesItemController.java_
```
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SalesItemController.API_ENDPOINT)
@Tag(
  name = "Sales item API", 
  description = "Manages sales items"
)
public class SalesItemController {
  public static final String API_ENDPOINT = "/sales-items";
  
  @Autowired
  private SalesItemService salesItemService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Creates new sales item")
  public final SalesItem createSalesItem(
    @RequestBody final SalesItemArg salesItemArg
  ) {
    return salesItemService.createSalesItem(salesItemArg);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  @Operation(summary = "Gets sales items")
  public final Iterable<SalesItem> getSalesItems() {
    return salesItemService.getSalesItems();
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(summary = "Gets sales item by id")
  public final SalesItem getSalesItemById(
    @PathVariable("id") final Long id
  ) {
    return salesItemService.getSalesItemById(id);
  }

  @GetMapping(params = "userAccountId")
  @ResponseStatus(HttpStatus.OK)
  @Operation(summary = "Gets sales items by user account id")
  public final Iterable<SalesItem> getSalesItemsByUserAccountId(
    @RequestParam("userAccountId") final Long userAccountId
  ) {
    return salesItemService
             .getSalesItemsByUserAccountId(userAccountId);
  }

  @PutMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Updates a sales item")
  public final void updateSalesItem(
    @PathVariable final Long id,
    @RequestBody final SalesItemArg salesItemArg
  ) {
    salesItemService.updateSalesItem(id, salesItemArg);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Deletes a sales item by id")
  public final void deleteSalesItemById(
    @PathVariable final Long id
  ) {
    salesItemService.deleteSalesItemById(id);
  }

  @DeleteMapping
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Deletes all sales items")
  public final void deleteSalesItems() {
    salesItemService.deleteSalesItems();
  }
}
```

As we can notice from the above code, the `SalesItemController` class delegates the actual work to an instance of a class that implements the
`SalesItemService` interface. This is an example of using the _bridge pattern_ which is
discussed, along with other design patterns, in the next chapter. In the bridge pattern, the controller is just an abstraction
of the service, and a class implementing the `SalesItemService` interface provides a concrete implementation. We can change the service implementation
without changing the controller or introduce a different controller, e.g., a GraphQL controller, using the same `SalesItemService` interface. Only by changing the used controller class could we change the API from a REST API to a GraphQL API. Below is the definition of the `SalesItemService` interface:

_SalesItemService.java_
```
public interface SalesItemService {
  SalesItem createSalesItem(SalesItemArg salesItemArg);
  SalesItem getSalesItemById(Long id);
  
  Iterable<SalesItem> getSalesItemsByUserAccountId(
   Long userAccountId
  );
  
  Iterable<SalesItem> getSalesItems();
  void updateSalesItem(Long id, SalesItemArg salesItemArg);
  void deleteSalesItemById(Long id);
  void deleteSalesItems();
}
```

The below `SalesItemServiceImpl` class implements the `SalesItemService` interface.
It will interact with a sales item repository to persist, fetch and delete data to/from a database.

_SalesItemServiceImpl.java_
```
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SalesItemServiceImpl implements SalesItemService {
  private static final String SALES_ITEM = "Sales item";
  
  @Autowired
  private SalesItemRepository salesItemRepository;

  @Override
  public final SalesItem createSalesItem(
    final SalesItemArg salesItemArg
  ) {
    final var salesItem = SalesItem.from(salesItemArg); 
    return salesItemRepository.save(salesItem);
  }

  @Override
  public final SalesItem getSalesItemById(final Long id) {
    return salesItemRepository.findById(id)
             .orElseThrow(() -> 
               new EntityNotFoundError(SALES_ITEM, id));
  }

  @Override
  public final Iterable<SalesItem> getSalesItemsByUserAccountId(
    final Long userAccountId
  ) {
    return salesItemRepository
             .findByUserAccountId(userAccountId);
  }

  @Override
  public final Iterable<SalesItem> getSalesItems() {
    return salesItemRepository.findAll();
  }

  @Override
  public final void updateSalesItem(
    final Long id,
    final SalesItemArg salesItemArg
  ) {
    if (salesItemRepository.existsById(id)) {
      final var salesItem =
        SalesItem.from(salesItemArg, id);
      
      salesItemRepository.save(salesItem);
    } else {
      throw new EntityNotFoundError(SALES_ITEM, id);
    }
  }

  @Override
  public final void deleteSalesItemById(final Long id) {
    if (salesItemRepository.existsById(id)) {
      salesItemRepository.deleteById(id);
    } 
  }

  @Override
  public final void deleteSalesItems() {
    salesItemRepository.deleteAll();
  }
}
```

_EntityNotFoundError.java_
```
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class EntityNotFoundError extends RuntimeException {
  EntityNotFoundError(final String entityType, final long id) {
    super(entityType + 
         " entity not found with id " +
         String.valueOf(id));
  }
}
```

The `SalesItemRepository` interface is defined below. Spring will create an instance of a class implementing that interface and
inject it into an instance of the `SalesItemServiceImpl` class. The `SalesItemRepository` interface extends
Spring's `CrudRepository` interface, which provides many database access methods by default. It provides the following
and more methods: `findAll`, `findById`, `save`, `existsById`, `deleteAll`, and `deleteById`. We need to add only one
method to the `SalesItemRepository` interface: `findByUserAccountId`.
Spring will automatically generate an implementation for the `findByUserAccountId` method because the method name follows certain conventions
of the [Spring Data](https://docs.spring.io/spring-data/jpa/docs/current/reference/html) framework. We just need to add
the method to the interface, and that's it. We don't have to provide an implementation for the method because Spring will do it for us.

_SalesItemRepository.java_
```
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesItemRepository extends 
                    CrudRepository<SalesItem, Long> 
{
  Iterable<SalesItem> findByUserAccountId(Long userAccountId);
}
```

Next, we define the `SalesItem` entity class, which contains properties like `name` and `price`. It also includes two methods to convert an instance of the `SalesItemArg` Data Transfer Object (DTO) class
to an instance of the `SalesItem` class. A DTO is an object that transfers data between a server and a client. I have used the
class name `SalesItemArg` instead of `SalesItemDto` to describe that a
`SalesItemArg` DTO  is an argument for an API endpoint. If some API endpoint returned a special sales item DTO instead of a sales item entity, I would name that DTO class `SalesItemResponse` instead of `SalesItemDto`.
The terms `Arg` and `Response` better describe the direction in which a DTO transfers data. You could also use the following DTO names: `InputSalesItem` and `OutputSalesItem` to describe an incoming and outgoing DTO (from the server's point of view).

_SalesItem.java_
```
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  private Long userAccountId;

  @NotNull
  private String name;
  
  @Min(value = 0, message = "Price must be greater than 0")
  @Max(
    value = Integer.MAX_VALUE, 
    message = "Price must be <= " + Integer.MAX_VALUE
  )
  private Integer price;
  
  static SalesItem from(final SalesItemArg salesItemArg) {
    return new ModelMapper()
                 .map(salesItemArg, SalesItem.class);
  }
  
  static SalesItem from(
    final SalesItemArg salesItemArg,
    final Long id
  ) {
    final var salesItem = 
      new ModelMapper().map(salesItemArg, SalesItem.class);
    
    salesItem.setId(id);
    return salesItem;
  }
}
```

The below `SalesItemArg` class contains the same properties as the `SalesItem` entity class, except the `id` property.
The `SalesItemArg` DTO class is used when creating a new sales item or updating an existing sales
item. When creating a new sales item, the `id` property should not be given by the client because the microservice will automatically generate
it (or the database will, actually, in this case).

_SalesItemArg.java_
```
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesItemArg {
  private Long userAccountId;
  private String name;
  private Integer price;
}
```

Below is defined how the _ecommerce-service_ will orchestrate the use of the aggregated lower-level microservices:

- User account domain
  - Delegates CRUD operations to _user-account-service_
  - Delegates to _sales-item-service_ to fetch information about user's sales items
  - Delegates to _order-service_ to fetch information about user's orders
- Sales item domain
  - Delegates CRUD operations to _sales-item-service_
- Shopping cart domain
  - Delegates read/add/remove/empty operations to _shopping-cart-service_
  - Delegates to _sales-item-service_ to fetch information about the sales items in the shopping cart
- Order domain
  - Ensures that payment is confirmed by the payment gateway
  - Delegates CRUD operations to _order-service_
  - Delegates to _shopping-cart-service_ to remove bought items from the shopping cart
  - Delegates to _sales-item-service_ for marking sales items bought
  - Delegates to _email-notification-service_ for sending order confirmation email
  - Delegates to _sales-item-service_ to fetch information about order's sales items

The _ecommerce-service_ is meant to be used by frontend clients, like a web client, for example. _Backend for Frontend_ (BFF) term is
often used to describe a microservice designed to provide an API for frontend clients. Compared to the BFF term, service aggregation is a generic term, and
there need not be a frontend involved. You can use service aggregation to create an aggregated microservice used by another microservice or microservices.
There can even be multiple levels of service aggregation if you have a large and complex software system.

Clients can have different needs regarding what information they want from an API. For example,
a mobile client might be limited to exposing only a subset of all information available from an API. In contrast, a web client
can fetch all information, or it can be customized what information a client retrieves from the API.

All of the above requirements are something that a GraphQL-based API can fulfill. For that reason, it would
be wise to implement the _ecommerce-service_ using GraphQL. I have chosen JavaScript, Node.js, and Express as
technologies to implement a single GraphQL query in the _ecommerce-service_. Below is the implementation of a
`user` query, which fetches data from three microservices. It fetches user account
information from the _user-account-service_, the user's sales items from the _sales-item-service_, and finally,
the user's orders from the _order-service_.

_server.js_
```
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema, GraphQLError } = require('graphql');
const axios = require('axios').default;

const schema = buildSchema(`
  type UserAccount {
    id: ID!,
    userName: String!
    # Define additional properties...
  }
  
  type SalesItem {
    id: ID!,
    name: String!
    # Define additional properties...
  }
  
  type Order {
    id: ID!,
    userId: ID!
    # Define additional properties...
  }
  
  type User {
    userAccount: UserAccount!
    salesItems: [SalesItem!]!
    orders: [Order!]!
  }
  
  type Query {
    user(id: ID!): User!
  }
`);

const {
  ORDER_SERVICE_URL,
  SALES_ITEM_SERVICE_URL,
  USER_ACCOUNT_SERVICE_URL  
} = process.env;

const rootValue = {
  user: async ({ id }) => {
    try {
      const [
        { data: userAccount },
        { data: salesItems },
        { data: orders }
      ] = await Promise.all([
        axios.get(`${USER_ACCOUNT_SERVICE_URL}/user-accounts/${id}`),
        axios.get(
          `${SALES_ITEM_SERVICE_URL}/sales-items?userAccountId=${id}`
        ),
        axios.get(`${ORDER_SERVICE_URL}/orders?userAccountId=${id}`)
      ]);
      
      return {
        userAccount,
        salesItems,
        orders
      };
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  },
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue,
  graphiql: true,
}));

app.listen(4000);
```

After you have started the above program with the `node server.js` command, you can access the GraphiQL endpoint with
a browser:

<div class="sourceCodeWithoutLabel">

```
http://localhost:4000/graphql
```

</div>

On the left-hand side pane, you can specify a GraphQL query. For example, to query the user identified with id 2:

<div class="sourceCodeWithoutLabel">

```
{
  user(id: 2) {  
    userAccount {
      id
      userName
    }
    salesItems {
      id
      name
    }
    orders {
      id
      userId
    }
  }
}
```

</div>

Because we haven't implemented the lower-level microservices, let's modify the part of the _server.js_ where lower level
microservices are accessed to
return dummy static results instead of accessing the real lower-level microservices:

<div class="sourceCodeWithoutLabel">

```
const [
        { data: userAccount },
        { data: salesItems },
        { data: orders }
      ] = await Promise.all([
        Promise.resolve({
          data: {
            id,
            userName: 'pksilen'
          }
        }),
        Promise.resolve({
          data: [
            {
              id: 1,
              name: 'sales item 1'
            }
          ]
        }),
        Promise.resolve({
          data: [
            {
              id: 1,
              userId: id
            }
          ]
        })
      ]);
```

</div>

If we now execute the previously specified query, we should see the following query result:

<div class="sourceCodeWithoutLabel">

```
{
  "data": {
    "user": {
      "userAccount": {
        "id": "2",
        "userName": "pksilen"
      },
      "salesItems": [
        {
          "id": "1",
          "name": "sales item 1"
        }
      ],
      "orders": [
        {
          "id": "1",
          "userId": "2"
        }
      ]
    }
  }
}
```

</div>

We can simulate a failure by modifying the _server.js_ to contain the following code:

<div class="sourceCodeWithoutLabel">

```
const [
        { data: userAccount },
        { data: salesItems },
        { data: orders }
      ] = await Promise.all([
        axios.get(`http://localhost:3000/user-accounts/${id}`),
        Promise.resolve({
          data: [
            {
              id: 1,
              name: 'sales item 1'
            }
          ]
        }),
        Promise.resolve({
          data: [
            {
              id: 1,
              userId: id
            }
          ]
        })
      ]);
```

</div>

Now, if we execute the query again, we will get the below error response because the server cannot connect to
a service at the local host on port 3000 because there is no service running at _localhost:3000_.

<div class="sourceCodeWithoutLabel">

```
{
  "errors": [
    {
      "message": "connect ECONNREFUSED 127.0.0.1:3000",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "user"
      ],
      "extensions": {}
    }
  ],
  "data": null
}
```

</div>

You can also query a user and specify the query to return only a subset of fields.
The below query does not return ids and does not return orders. The server-side GraphQL library automatically
includes only requested fields in the response. You, as a developer, do not have to do anything. You can, of course, optimize your microservice to fetch only the requested fields from the database if you desire.

<div class="sourceCodeWithoutLabel">

```
{
  user(id: 2) {
    userAccount {
      userName
    }
    salesItems {
      name
    }
  }
}
```

</div>

The result for the above query will be the following:

<div class="sourceCodeWithoutLabel">

```
{
  "data": {  
    "user": {
      "userAccount": {
        "userName": "pksilen"
      },
      "salesItems": [
        {
          "name": "sales item 1"
        }
      ]
    }
  } 
}
```

</div>

The above example lacks some features like authorization that is needed for production. Authorization
should check that a user can only execute the `user` query to fetch his/hers resources. The authorization should fail if
a user tries to execute the `user` query using someone else's id. Security is discussed more in the coming
_security principles_ chapter.

The `user` query in the previous example spanned over multiple lower-level microservices:
_user-account-service_, _sales-item-service_, and _order-service_. Because the query is not mutating anything, it can be executed without a distributed transaction. A distributed transaction is similar to a regular (database) transaction, with the difference that it spans multiple remote services.

The API endpoint for placing an order in the _ecommerce-service_ needs to create a new order using the _order-service_, mark purchased sales items as bought using the _sales-item-service_, empty the shopping cart using the _shopping-cart-service_,
and finally send order confirmation email using the _email-notification-service_. These actions need to be wrapped
inside a distributed transaction because we want to be able to roll back the transaction if any of these operations fail.
Guidance on how to implement a distributed transaction is given later in this chapter.

Service aggregation utilizes the _facade pattern_.
The facade pattern allows hiding individual lower-level microservices behind a facade (the higher-level microservice). The clients of the
software system access the system through the facade. They don't directly contact the individual lower-level
microservices behind the facade because it breaks the encapsulation of the lower-level microservices inside the higher-
level microservice. A client accessing the lower-level microservices directly creates unwanted coupling between the client
and the lower-level microservices, which makes changing the lower-level microservices hard without affecting the client.

Think about a post office counter as an example of a real-world facade. It serves as a facade for the post office and
when you need to receive a package, you communicate with that facade (the post office clerk at the counter).
You have a simple interface of just telling the package code, and the clerk will find the package from the correct shelf and bring it to you. If you hadn't that facade, it would mean that you would have to do lower-level work
by yourself. Instead of just telling the package code, you must walk to the shelves and try to find the proper
shelf where your package is located, make sure that you pick the correct package, and then carry the package by yourself. In addition to requiring more work, this approach is more error-prone. You can accidentally pick
someone else's package if you are not pedantic enough. And think about the case when you go to the post office next time and find out that all the shelves have been rearranged. This wouldn't be a problem if you used the facade.

Service aggregation, where a higher-level microservice delegates to lower-level microservices, also implements the _bridge pattern_.
A higher-level microservice provides only some high-level control and relies on the lower-level microservices to do the actual work.

Service aggregation allows using more _design patterns_ from the object-oriented design world. The most useful design
patterns in the context of service aggregation are:

- Decorator pattern
- Proxy pattern
- Adapter pattern

_Decorator pattern_ can be used to add functionality in a higher-level microservice for lower-level
microservices. One example is adding audit logging in a higher-level microservice. For example,
you can add audit logging to be performed for requests in the _ecommerce-service_. You don't need to implement
the audit logging separately in all the lower-level microservices.

_Proxy pattern_ can be used to control the access from a higher-level microservice to lower-level
microservices. Typical examples of the proxy pattern are authorization and caching. For example, you can add authorization and
caching to be performed for requests in the _ecommerce-service_. Only after successful authorization
will the requests be delivered to the lower-level microservices. And if a request's response is not
found in the cache, the request will be forwarded to the appropriate lower-level microservice. You don't
need to implement authorization and caching separately in all the lower-level microservices.

_Adapter pattern_ allows a higher-level microservice to adapt to different versions of the lower-level
microservices while maintaining the API towards clients unchanged.

## High Cohesion, Low Coupling Principle

> A software system should consist of services with high cohesion and low coupling.

Cohesion refers to the degree to which classes inside a service belong together. Coupling refers to
how many other services a service is interacting with.
When following the _single responsibility principle_, it is possible to implement services as microservices with
high cohesion. Service aggregation adds low coupling. Microservices and service aggregation together enable
high cohesion and low coupling, which is the target
of good architecture. If there were no service aggregation, lower-level microservices would need to communicate
with each other, creating high coupling in the architecture. Also, clients would be coupled with the lower-level microservices.
For example, in the e-commerce example, the _order-service_ would be coupled with
almost all the other microservices. And if the _sales-item-service_ API changed, in the worst case, there would be a change needed
in three other microservices. When using service aggregation, lower-level microservices are coupled only to the higher-level microservice.

![Fig 2.5 E-Commerce Software System With High Coupling](images/02-01e.png)

High cohesion and low coupling mean that the development of services can be highly parallelized.
In the e-commerce example, the five lower-level microservices don't have coupling with
each other. The development of each of those microservices can be isolated and assigned to a single team member or a group of
team members. The development of the lower-level microservices can proceed in parallel,
and the development of the higher-level microservice can start when the APIs of the lower-level microservices
become stable enough. The target is to design the lower-level microservices APIs early on to enable
the development of the higher-level microservice.

## Library Composition Principle

> Higher-level libraries should be composed of lower-level libraries.

Suppose you need a library for parsing configuration files (in particular syntax) in YAML or JSON format. In that case,
you can first create the needed YAML and JSON parsing libraries (or use existing ones). Then you can create
the configuration file parsing library, composed of the YAML and JSON parsing libraries. You would then have
three different libraries: one higher-level library and two lower-level libraries. Each library has a single
responsibility: one for parsing JSON, one for parsing YAML, and one for parsing configuration files with a specific syntax, either in JSON or YAML.
Software components can now use the higher-level library for parsing configuration files, and they need not be aware of
the JSON/YAML parsing libraries at all.

## Avoid Duplication Principle

> Avoid software duplication at the software system and service level. 

Duplication at the software system level happens when two or more software systems use the same services.
For example, two different software systems can both have a message broker,
API gateway, identity and access management (IAM) application, and log and metrics collection services. You could
continue this list even further. The goal of duplication-free architecture is to have only one deployment of these
services. Public cloud providers offer these services for your use. If you have a Kubernetes cluster, an alternative solution is to deploy your software systems in different Kubernetes
namespaces and deploy the common services to a shared Kubernetes namespace, which can be called the _platform_ or _common-services_, for example.

Duplication at the service level happens when two or more services have common functionality that could
be extracted to a separate new microservice. For example, consider a case where both a
_user-account-service_ and _order-service_ have the functionality to send notification messages by email to a user.
This email-sending functionality is duplicated in both microservices.
Duplication can be avoided by extracting the email-sending functionality to a separate new microservice.
The single responsibility of the microservices becomes more evident when the email-sending functionality is
extracted to its own microservice. One might think another alternative is extracting the common functionality to
a library. This is not a solution that is as good because microservices become dependent on the library. When
changes to the library are needed (e.g., security updates), you must change the library version in all the
microservices using the library and then test all the affected microservices.

When a company develops multiple software systems in several departments, the software development
typically happens in silos. The departments are not necessarily aware of what the other departments are doing. For example,
it might be possible that two departments have both developed a microservice for sending emails. There is now
software duplication that none is aware of. This is not an optimal situation. A software development company
should do something to enable collaboration between the departments and break the silos. One good way to share software is to
establish shared folders or organizations in the source code repository hosting service that the company uses.
For example, in GitHub, you could create an organization for sharing source code repositories for common libraries
and another for sharing common services. Each software development department has access to
those common organizations and can still develop its software inside its own GitHub organization. In this way,
the company can enforce proper access control for the source code of different departments, if needed. When a team
needs to develop something new, it can first consult the common source code repositories to find out if something is
already available that can be reused as such or extended.

## Externalized Service Configuration Principle

Service configuration means any data that varies between service deployments (different environments,
different customers, etc.).

> The configuration of a service should be externalized. It should be stored in the environment where the service is running, not in the source code. Externalized configuration makes the service adaptable to different environments and needs.

The following are typical places where externalized configuration can be stored when software is running in a Kubernetes cluster:

* Environment variables
* Kubernetes ConfigMaps
* Kubernetes Secrets

![Fig 2.6 Configuration Storage Options](images/02-02.png)

In the following sections, let's discuss these three configuration storage options.

### Environment Variables

Environment variables can be used to store configuration as simple key-value pairs. They are typically used to store
information like how to connect to dependent services, like a database or a message broker, or a microservice's logging level. Environment variables are available for the running process of a microservice,
which can access the environment variable values by their names (keys).

You should not hardcode the default values for environment variables in the source code. This is because the default values are
typically not for a production environment but for a development environment. Suppose you deploy a service to a production environment
and forget to set all the needed environment variables. In that case, your service will have some environment variables with default values
unsuitable for a production environment.

You can supply environment variables for a microservice in environment-specific _.env_ files. For example, you can have an _.env.dev_
file for storing environment variable values for a development environment and an _.env.ci_ file for storing environment
variable values used in the microservice's _continuous integration_ (CI) pipeline. The syntax of _.env_ files is straightforward. There is
one environment variable defined per line:

_.env.dev_
```
NODE_ENV=development
HTTP_SERVER_PORT=3001
LOG_LEVEL=INFO
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USER=
MONGODB_PASSWORD=
```

_.env.ci_
```
NODE_ENV=integration
HTTP_SERVER_PORT=3001
LOG_LEVEL=INFO
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USER=
MONGODB_PASSWORD=
```

When a software component is deployed to a Kubernetes cluster using Helm, environment variable values should be defined in the Helm chart's _values.yaml_ file:

_values.yaml_
```
nodeEnv: production
httpServer:
  port: 8080
database:
  mongoDb:
    host: my-service-mongodb
    port: 27017
```

The values in the above _values.yaml_ file can be used to define environment variables in a Kubernetes _Deployment_ using
the following Helm chart template:

_deployment.yaml_
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
spec:
  template:
    spec:
      containers:
        - name: my-service
          env:
            - name: NODE_ENV
              value: {{ .Values.nodeEnv }}
            - name: HTTP_SERVER_PORT
              value: "{{ .Values.httpServer.port }}"
            - name: MONGODB_HOST
              value: {{ .Values.database.mongoDb.host }}
            - name: MONGODB_PORT
              value: {{ .Values.database.mongoDb.port }}
```

When Kubernetes starts a microservice pod, the following environment variables will be made available for the running container:

<div class="sourceCodeWithoutLabel">

```
NODE_ENV=production
HTTP_SERVER_PORT=8080
MONGODB_HOST=my-service-mongodb
MONGODB_PORT=27017
```
</div>

### Kubernetes ConfigMaps

A Kubernetes ConfigMap can store a configuration file or files in various formats, like JSON or YAML.
These files can be mounted to the filesystem of a microservice's running container. The container can then
read the configuration files from the mounted directory in its filesystem.

For example, you can have a ConfigMap for defining the logging level of a _my-service_ microservice:

_configmap.yaml_
```
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-service
data:
  LOG_LEVEL: INFO
```

The below Kubernetes Deployment descriptor defines that the content of the _my-service_ ConfigMap's key `LOG_LEVEL` will
be stored in a volume named `config-volume`, and the value of the `LOG_LEVEL` key will be stored
in a file named `LOG_LEVEL.` After mounting the `config-volume` to the `/etc/config` directory in a _my-service_ container,
it is possible to read the contents of the `/etc/config/LOG_LEVEL` file, which contains the text: INFO.

_deployment.yaml_
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
spec:
  template:
    spec:
      containers:
        - name: my-service
          volumeMounts:
            - name: config-volume
              mountPath: "/etc/config"
              readOnly: true
      volumes:
        - name: config-volume
          configMap:
            name: my-service
            items:
              - key: "LOG_LEVEL"
                path: "LOG_LEVEL"
```

In Kubernetes, editing of a ConfigMap is reflected in the respective mounted file. This means that you can listen to changes
in the `/etc/config/LOG_LEVEL` file. Below is shown how to do it in JavaScript:

<div class="sourceCodeWithoutLabel">

```
fs.watchFile('/etc/config/LOG_LEVEL', () => {
  try {
    const newLogLevel = fs.readFileSync(
      '/etc/config/LOG_LEVEL', 'utf-8'
    ).trim();
    
    // Check here that 'newLogLevel' contains a valid log level
    
    updateLogLevel(newLogLevel);
  } catch (error) {
    // Handle error
  }
});
```
</div>

### Kubernetes Secrets

Kubernetes Secrets are similar to ConfigMaps except that they are used to store sensitive information, like
passwords and encryption keys.

Below is an example of _values.yaml_ file and a Helm chart template for creating a Kubernetes Secret. The Secret will
contain two key-value pairs: the database username and password. The Secret's
data needs to be Base64-encoded. In the below example, the Base64 encoding is done using the Helm template function
`b64enc`.

_values.yaml_
```
database:
  mongoDb:
    host: my-service-mongodb
    port: 27017
    user: my-service-user
    password: Ak9(lKt41uF==%lLO&21mA#gL0!"Dps2
```

_secret.yaml_
```
apiVersion: v1
kind: Secret
metadata:
  name: my-service
type: Opaque
data:
  mongoDbUser: {{ .Values.database.mongoDb.user | b64enc }}
  mongoDbPassword: {{ .Values.database.mongoDb.password | b64enc }}
```

After being created, secrets can be mapped to environment variables in a Deployment descriptor for a microservice.
In the below example, we map the value of the secret key `mongoDbUser` from the `my-service` secret to an environment variable
named `MONGODB_USER` and the value of the secret key `mongoDbPassword` to an environment variable named `MONGODB_PASSWORD`.

_deployment.yaml_
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
spec:
  template:
    spec:
      containers:
        - name: my-service
          env:
            - name: MONGODB_USER
              valueFrom:
                secretKeyRef:
                  name: my-service
                  key: mongoDbUser
        
            - name: MONGODB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: my-service
                  key: mongoDbPassword
```

When a _my-service_ pod is started, the following environment variables are made available for the running container:

<div class="sourceCodeWithoutLabel">

```
MONGODB_USER=my-service-user
MONGODB_PASSWORD=Ak9(lKt41uF==%lLO&21mA#gL0!"Dps2
```
</div>

## Service Substitution Principle

> Make substituting a service's service dependency for another service easy by making the dependencies transparent. A transparent service is exposed to other services by defining a host and port. Use _externalized service configuration principle_ (e.g., environment variables) in your microservice to define the host and port (and possibly other needed parameters like a  database username/password) for a dependent service.

Let's have an example where a microservice depends on a MongoDB service. The MongoDB service should expose
itself by defining a host and port combination. For the microservice, you can specify the following environment variables for 
connecting to a _localhost_ MongoDB service:

_.env.dev_
```
MONGODB_HOST=localhost
MONGODB_PORT=27017
```

Suppose that in a Kubernetes-based production environment, you have a MongoDB service in the cluster accessible via a Kubernetes Service
named _my-service-mongodb_. In that case, you should have the environment variables for the MongoDB service
defined as follows:

<div class="sourceCodeWithoutLabel">

```
MONGODB_HOST=my-service-mongodb.default.svc.cluster.local
MONGODB_PORT=8080
```
</div>

Alternatively, a MongoDB service can run in the MongoDB Atlas cloud. Then the MongoDB service
could be connected to using the following kind of environment variable values:

<div class="sourceCodeWithoutLabel">

```
MONGODB_HOST=my-service.tjdze.mongodb.net
MONGODB_PORT=27017
```
</div>

As shown with the above examples, you can easily substitute a different MongoDB service depending on
your microservice's environment. If you want to use a different MongoDB service, you don't need
to modify the microservice's source code but only change the configuration.

## Inter-Service Communication Methods

Services communicate with each other using the following communication methods: synchronous, asynchronous, and shared data.

### Synchronous Communication Method

A synchronous communication method should be used when a service communicates with another service and wants an immediate response.
Synchronous communication can be implemented using protocols like HTTP or gRPC (which uses HTTP under the hood).

![Figure 2.7 Synchronous Communication Method](images/02-11.png)

In case of a failure when processing a request, the request processing microservice sends an error response to the requestor
microservice. The requestor microservice can cascade the error up in the synchronous request stack until
the initial request maker is reached. Often, that initial request maker is a client, like a web or mobile client. The initial request maker can then decide what to do. Usually, it will attempt to send
the request again after a while (we are assuming here that the error is a transient server error, not a client error,
like a bad request, for example)

### Asynchronous Communication Method

When a service wants to deliver a request to another service, but does not expect a response or at least not an
immediate response, then an asynchronous communication method should be used. Some communication between services
is asynchronous by nature. For example, a service might want to instruct an email notification service to email an end-user
or to send an audit log entry to an audit logging service. Both examples can be implemented
using an asynchronous communication method because no response for the operations is expected.

![Figure 2.8 Request-Only Asynchronous Communication Method](images/02-12.png)

![Figure 2.9 Request-Response Asynchronous Communication Method / Event Driven Architecture](images/02-13.png)

Asynchronous communication can be implemented using a message broker. Services can produce messages to the message broker
and consume messages from the message broker. There are several message broker implementations available like
Apache Kafka, RabbitMQ, Apache ActiveMQ and Redis. When a microservice produces a request to a message
broker's topic, the producing microservice must wait for an acknowledgment from the message broker indicating
that the request was successfully stored to multiple, or preferably all, replicas of the topic. Otherwise, there
is no 100% guarantee that the request was successfully delivered in some message broker failure scenarios.

When an asynchronous request is of type fire-and-forget (i.e., no response is expected), the request processing
microservice must ensure that the request will eventually get processed. If the request processing fails, the request
processing microservice must reattempt the processing after a while. If a termination signal is received,
the request processing microservice instance must produce the request back to the message broker and allow some other
instance of the microservice to fulfill the request. The rare possibility exists that the production of the request
back to the message broker fails. You could then try to save the request to a persistent volume, for instance, but
also that can fail. The likelihood of such a situation is very low.

Designing APIs for inter-service communication is described in more detail in the _API design principles_ chapter.

### Shared Data Communication Method

Sometimes communication between services can happen via shared data (e.g., using a shared database). This method is
useful with data-oriented services when storing the same data twice is not meaningful. Typically, one or more
microservices produce the shared data, and other microservice(s) consume that data. The interface between these microservices
is defined by the schema of the shared data, e.g., by the schemas of database tables. To secure the shared data, only the producing microservice(s) should have write access to the shared data, and the consuming microservice(s) should only have read access to the shared data.

![Figure 2.10 Shared Data Communication Method](images/02-14.png)

## Domain-Driven Architectural Design Principle

> Design architecture by conducting domain-driven design (DDD) starting from the top of the software hierarchy
> (software system) and ending at the service level.

I often compare software system architectural design to the architectural design of a house. The house represents a software
system. The facade of the house represents the external interfaces of the software system. The rooms in the house are the microservices
of the software system. Like a microservice, a single room usually has a dedicated purpose. The architectural design of a software system encompasses the definition of external interfaces, microservices, and their interfaces to other microservices.

The result of the architectural design phase is a ground plan for the software system. After the architectural design,
you have the facade designed, and all the rooms are specified: the purpose of each room and how rooms interface with other rooms.

Designing an individual microservice is no more architectural design it is like the interior design of a single room. The design of microservices
is handled using object-oriented design principles, presented in the next chapter.

Domain-driven design (DDD) is a software design approach where software is modeled to match a problem/business domain according to input from the domain experts. Usually, these experts come from the business and specifically from product management.
The idea of DDD is to transfer the domain knowledge from the domain experts to individual software developers so that
everyone participating in software development can share a common language that describes the domain. The idea of the common language
is that people can understand each other, and no multiple terms are used to describe a single thing. This common language is also called
the _ubiquitous language_.

The domain knowledge is transferred from product managers and architects to lead developers and product owners (POs)
in development teams. The team's lead developer and PO share the domain knowledge with the rest of the team. This
usually happens when the team processes epics and features and splits them into user stories in planning sessions.
A software development team can also have a dedicated domain expert or experts.

DDD starts from the top business/problem domain. The top domain is split into multiple subdomains on the
same abstraction level: one level lower than the top domain. A domain should be divided into subdomains so that there
is minimal overlap between subdomains. Subdomains will be interfacing with other subdomains using well-defined interfaces. Subdomains are also called _bounded contexts_, and technically they represent an application or a microservice.
For example, a banking software system can have a subdomain or bounded context for loan applications and another
for making payments.

### Design Example 1: Mobile Telecom Network Analytics Software System

Suppose an architecture team is assigned to design a mobile telecom network analytics software system.
The team starts by defining the problem domain of the software system in more detail. When thinking about
the system in more detail, they end up figuring out at least the following subdomains:

1) Ingesting raw data from various sources of the mobile telecom network
2) Transforming the ingested raw data into meaningful insights
3) Proper ways of presenting the insights to software system users

Let's pick up some keywords from the above definitions and formulate short names for the subdomains:

1) Ingesting raw data
2) Transforming raw data into insights
3) Presenting insights

![Figure 2.11 Subdomains](images/02-03.png)

Let's consider each of these three subdomains separately.

We know that a mobile telecom network is divided into core and radio networks. From that, we can conclude that
_Ingesting raw data_ domain can be divided into further subdomains: _Ingesting radio network raw data_ and
_Ingesting core network raw data_. We can turn these two subdomains into applications for our software system:
_Radio network data ingester_ and _Core network data ingester_.

The _Transforming raw data to insights_ domain should at least consist of an application aggregating
the received raw data to counters and key performance indicators (KPIs). We can call that application _Data aggregator_.

The _Presenting insights_ domain should contain a web application that can present insights in
various ways, like using dashboards containing charts presenting aggregated counters and calculated KPIs. We can call this application
_Insights visualizer_.

Now we have the following applications for the software system defined:

- Radio network data ingester
- Core network data ingester
- Data aggregator
- Insights visualizer

![Figure 2.12 Applications](images/02-04.png)

Next, we continue architectural design by splitting each application into one or more software components.
(services, clients, and libraries). When defining the software components, we must remember to follow the
_single responsibility principle_, _avoid duplication principle_ and _externalized service configuration principle_.

When considering the _Radio network data ingester_ and _Core network data ingester_ applications,
we can notice that we can implement them both using a single microservice, _data-ingester-service_, with
different configurations for radio and core network. This is because the protocol for ingesting the data
is the same for radio and core networks. The two networks differ in the schema of the ingested data. Using a
single configurable microservice, we can avoid code duplication by using externalized configuration.

The _Data aggregator_ application can be implemented using a single _data-aggregator-service_ microservice.
We can use externalized configuration to define what counters and KPIs the microservice should aggregate and calculate.

The _Insights visualizer_ application consists of three different software components:

- A web client
- A service for fetching aggregated and calculated data (counters and KPIs)
- A service for storing the dynamic configuration of the web client

The dynamic configuration service stores information about what insights to visualize and how in the web client.

 Microservices in the _Insights visualizer_ application are:

- insights-visualizer-web-client
- insights-visualizer-data-service
- insights-visualizer-configuration-service

Now we are ready with the microservice-level architectural design for the
software system.

![Figure 2.13 Microservices](images/02-05.png)

The last part of architectural design is to define the inter-service communication methods.
The _data-ingester-service_ needs to send raw data to _data-aggregator-service_. The sending of data is done using asynchronous fire-and-forget requests and is implemented using a message broker. The communication
between the _data-aggregator-service_ and the _insights-visualizer-data-service_ should use the
_shared data_ communication method because the _data-aggregator-service_ generates aggregated data that the
_insights-visualizer-data-service_ uses. The communication between the _insights-visualizer-web-client_ in the
frontend and the _insights-visualizer-data-service_ and _insights-visualizer-configuration-service_ in the backend
is synchronous communication that can be implemented using an HTTP-based JSON-RPC, REST, or GraphQL API.

![Figure 2.14 Inter-Microservice Communication](images/02-06.png)

Next, design continues in development teams.
Teams will specify the APIs between the microservices and conduct object-oriented design for the microservices.
API design is covered in a later chapter, and object-oriented design is covered in the next chapter.

### Design Example 2: Banking Software System

Let's design a partial banking software system. The banking software system should be able to handle customers'
loan applications and payments. The banking system problem domain can be divided into two subdomains or bounded contexts:

1) Loan applications
2) Making payments

In the loan applications domain, a customer can submit a loan application. The eligibility for the loan will be assessed,
and the bank can either accept the loan application and pay the loan or reject the loan application. In the making payments domain, a customer can make
payments. Making a payment will withdraw money from the customer's account. It is also a transaction that should be recorded.

![Figure 2.15 Banking Software System Bounded Contexts](images/02-08.png)

Let's add a feature that a payment can be made to a recipient in another bank:

![Figure 2.16 Banking Software System Bounded Contexts](images/02-09.png)

Let's add another feature: money can be transferred from external banks to a customer's account.

![Figure 2.17 Banking Software System Bounded Contexts](images/02-10.png)

As can be noticed from the above pictures, the architecture of the banking software system evolved when
new features were introduced. For example, two new subdomains (or bounded contexts) were created: money transfer and external money transfer.
There was not so much change in the microservices themselves, but how they are grouped logically to bounded contexts was altered.

## Autopilot Microservices Principle

> Microservices should be architected to run on autopilot in their deployment environment.

An autopilot microservice means a microservice that runs in a deployment environment without human interaction, except
in abnormal situations when the microservice should generate an alert to indicate that human intervention is required.

Autopilot microservices principle requires that the following sub-principles are followed:

- Stateless microservices principle
- Resilient microservices principle
- Horizontally autoscaling microservices principle
- Highly-available microservices principle
- Observable microservices principle

These principles are discussed in more detail next.

### Stateless Microservices Principle

> Microservices should be stateless to enable resiliency, horizontal scalability, and high availability.

A microservice can be made stateless by storing its state outside itself.
The state can be stored in a data store that microservice instances share. Typically, the data store is a database or 
an in-memory cache (like Redis, for example).

### Resilient Microservices Principle

> Microservices should be resilient, i.e., quickly recover from failures automatically.

In a Kubernetes cluster, the resiliency of a microservice is handled by the Kubernetes control plane.
If a computing node where a microservice instance is located needs to be decommissioned, Kubernetes will create
a new instance of the microservice on another computing node and then evict the microservice from the node to be
decommissioned.

What needs to be done in a microservice is to make it listen to Linux termination signals, especially the _SIGTERM_ signal,
which is sent to a microservice instance to indicate that it should terminate. Upon receiving a SIGTERM signal,
the microservice instance should initiate a graceful shutdown. If the microservice instance does not shut down gracefully, Kubernetes
will eventually issue a _SIGKILL_ signal to terminate the microservice instance forcefully. The _SIGKILL_ signal is sent
after a termination grace period has elapsed. This period is, by default, 30 seconds, but it is configurable.

There are other reasons a microservice instance might be evicted from a computing node. One such reason is
that Kubernetes must assign (for some reason which can be related to CPU/memory requests, for instance) another microservice
to be run on that particular computing node, and your microservice won't fit there anymore and must be moved to
another computing node.

If a microservice pod crashes, Kubernetes will notice that and start a new pod so that there are always the wanted
number of microservice replicas (pods/instances) running. The replica count can be defined in the Kubernetes Deployment for the microservice.

But what if a microservice pod enters a deadlock and cannot serve requests? This situation can be remediated with the help of a
_liveness probe_. You should always specify a liveness probe for each microservice Deployment. Below is an example of a microservice
Deployment where an HTTP GET type liveness probe is defined:

_deployment.yaml_
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "microservice.fullname" . }}
spec:
  replicas: 1
  selector:
    matchLabels:
      {{- include "microservice.selectorLabels" . | nindent 6 }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.imageRegistry }}/{{ .Values.imageRepository }}:{{ .Values.imageTag }}"
          livenessProbe:
            httpGet:
              path: /isMicroserviceAlive
              port: 8080
            initialDelaySeconds: 30
            failureThreshold: 3
            periodSeconds: 3
```

Kubernetes will poll the `/isMicroserviceAlive` HTTP endpoints of the microservice instances every
three seconds (after the initial delay of 30 seconds reserved for the microservice instance startup). The HTTP endpoint should return the HTTP status code 200 _OK_. Suppose requests to that endpoint fail (e.g., due to a deadlock) three times in a row (defined by the `failureThreshold` property) for a particular microservice instance. In that case, the microservice instance is considered dead,
and Kubernetes will terminate the pod and launch a new pod automatically.

When upgrading a microservice to a newer version, the Kubernetes Deployment should be modified. A new container image
tag should be specified in the `image` property of the Deployment. This change will trigger an update procedure
for the Deployment. By default, Kubernetes performs a _rolling update_, which means your microservice can serve
requests during the update procedure without downtime.

Suppose you had defined one replica in the microservice Deployment (as above `replicas: 1`), and
performed a Deployment upgrade (change the image to a newer version). In that case, Kubernetes would create a new pod using
the new image tag, and only after the new pod is ready to serve requests will Kubernetes delete the pod running
the old version. So there is no downtime, and the microservice can serve requests during the upgrade procedure.

If your microservice deployment had more replicas, e.g., 10, by default, Kubernetes would terminate max 25% of
the running pods and start max 25% of the replica count new pods. The _rolling update_ means that updating pods
happens in chunks, 25% of the pods at a time. The percentage value is configurable.

### Horizontally Autoscaling Microservices Principle

> Microservices should automatically scale horizontally to be able to serve more requests.

Horizontal scaling means adding new instances or removing instances of a microservice. Horizontal scaling of a microservice
requires statelessness. Stateful services are usually implemented using sticky sessions so
that requests from a particular client go to the same service instance. The horizontal scaling of stateful services is complicated because a client's state is
stored on a single service instance. In the cloud-native world, we want to ensure even
load distribution between microservice instances and target a request to any available microservice instance for processing.

Initially, a microservice can have one instance only. When the microservice gets more load, one instance cannot
necessarily handle all the work. In that case, the microservice must be scaled horizontally (scaled out) by adding one
or more new instances. When several microservice instances are running, the state cannot be stored inside the instances anymore
because different client requests can be directed to different microservice instances. A stateless microservice must
store its state outside the microservice in an in-memory cache or a database shared by all the microservice instances.

Microservices can be scaled manually, but that is rarely desired. Manual scaling requires someone to constantly monitor
the software system and make the needed scaling actions manually. Microservices should scale horizontally
automatically. There are two requirements for a microservice to be horizontally auto-scalable:

* Microservice must be stateless
* There must be one or more metrics that define the scaling behavior

Typical metrics for horizontal autoscaling are CPU utilization and memory consumption. In many cases,
using the CPU utilization metric alone can be enough. It is also possible to use a custom or external metric. For example, the Kafka
consumer lag metric can indicate if the consumer lag is increasing and if a new microservice instance should be spawned to reduce the consumer lag.

In Kubernetes, you can specify horizontal autoscaling using the _HorizontalPodAutoscaler_ (HPA):

_hpa.yaml_
```
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: my-service
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-service
  minReplicas: 1
  maxReplicas: 99
  metrics:
    - type: Resource
      resource:
        name: cpu
        targetAverageUtilization: 75
    - type: Resource
      resource:
        name: memory
        targetAverageUtilization: 75
```

In the above example, the _my-service_ microservice is horizontally auto-scaled so that there is always at least
one instance of the microservice running. There can be a maximum of 99 instances of the microservice running. The microservice is
scaled out if CPU or memory utilization is over 75%, and it is scaled in (the number of microservice instances is reduced)
when both CPU and memory utilization falls below 75%.

### Highly-Available Microservices Principle

> Business-critical microservices must be highly-available.

If only one microservice instance runs in an environment, it does not make the microservice highly available. If something happens to that one instance, the microservice becomes temporarily unavailable until a
new instance has been started and is ready to serve requests. For this reason, you should run at least two or more instances for all business-critical microservices. You should also ensure that
these two instances don't run on the same computing node. The instances should run
in different availability zones of the cloud provider. Then a catastrophe in availability zone 1 won't necessarily affect
microservices running in availability zone 2.

You can ensure that no two microservice instances run on the same computing node by defining an anti-affinity rule in the
microservice Deployment:

_deployment.yaml_
```
.
.
.
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app.kubernetes.io/name: {{ include "microservice.name" . }}
        topologyKey: "kubernetes.io/hostname"
.
.
.
```

For a business-critical microservice, we need to modify the horizontal autoscaling example from the previous section:
The `minReplicas` property should be increased to 2:

_hpa.yaml_
```
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: my-service
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-service
  minReplicas: 2
  maxReplicas: 99
  .
  .
  .
```

### Observable Microservices Principle

> It should be possible to detect any abnormal behavior in deployed microservices as soon as possible.
> Abnormal behavior should trigger an alert. The deployment environment should offer aids for troubleshooting abnormal behavior.

A modern cloud-native software system consists of multiple microservices running simultaneously. No one can manually check
the logs of tens or hundreds of microservice instances. The key to monitoring microservices is automation. Everything starts
with collecting relevant metrics from microservices and their execution environment. These metrics are used to
define automatic alerting of abnormal conditions. Metrics are also used to create monitoring and troubleshooting dashboards, which can be used to analyze the state of the software system and its microservices after an alert is triggered.

In addition to metrics, to enable drill-down to a problem's root cause, distributed tracing should be implemented
to log the communication between different microservices to troubleshoot inter-service communication
problems. Each microservice must also log at least all errors and warnings. These logs should be fed to
a centralized log collection system where querying the logs is made easy.

## Software Versioning Principles

In this section, the following principles related to software versioning will be presented:

- Use semantic versioning
- Avoid using 0.x versions
- Don't increase major versions
- Implement security patches and bug corrections to all major versions
- Avoid using non-LTS (Long Term Support) versions in production

### Use Semantic Versioning Principle

> Use semantic versioning for software components.

Semantic versioning means that given a version number in the format: `<MAJOR>.<MINOR>.<PATCH>`, increment the:

- _MAJOR_ value when you make incompatible API changes
- _MINOR_ value when you add functionality in a backward-compatible manner
- _PATCH_ value when you make backward-compatible bug fixes or security patches

### Avoid Using 0.x Versions Principle

> If you are using 3rd party components, avoid using 0.x versioned components.

In semantic versioning, major version zero (0.x.y) is for initial development. Anything can change at any time.
The public API should not be considered stable. Typically, software components with zero major versions are still in a proof of concept
phase, and anything can change. If you want or need to take a newer version into use, you must be prepared for changes, and sometimes these changes can be considerable, resulting in
a lot of refactoring.

### Don't Increase Major Version Principle

When making backward-incompatible public API changes, you need to increase the major version.
I advise not to make backward-incompatible changes, thus no major version increases.

If you need to make a backward-incompatible public API change, you should create a totally new software component with
a different name. For example, suppose you have a _common-ui-library_ and need to make backward-incompatible changes. In that case, it is recommended to add the new major version number to the library name and
publish a new library, _common-ui-library-2_. This protects developers from accidentally
using a more recent non-compatible version when changing the used library version number.
Library users don't necessarily know if a library uses semantic versioning properly or not.
This information is not usually told in the library documentation, but it is a good practice to
communicate that in the library documentation.

If a software component is using the _common-ui-library_, it can safely always take the latest version of the library
into use which contains all the needed bug fixes and security updates.

If you were using Node.js and NPM, this would be safe:

<div class="sourceCodeWithoutLabel">

```
npm install --save common-ui-library@latest
```
</div>

And when you are ready to migrate to the new major version of the library, you can uninstall the old version and install the new major version in the following way:

<div class="sourceCodeWithoutLabel">

```
npm uninstall common-ui-library
npm install --save common-ui-library-2
```
</div>

Consider when to create a new major version of a library. When you created the first library
version, you probably did not get everything right in the public API. That is normal. It is almost impossible
to create a perfect API the first time. Before releasing the second major version of the library, I suggest reviewing the new API with a team, collecting user feedback, and waiting long enough to get the API "close to perfect" the second time.
No one wants to use a library with frequent backward-incompatible major version changes.

### Implement Security Patches and Bug Corrections to All Major Versions Principle

If you have authored a library for others to use, do not force the users to take a new major version of
the library into use just because it contains some bug corrections or security patches that are not available
for the older major version(s). You should have
a comprehensive set of automated tests to ensure that a bug fix or security patch doesn't break anything. Thus, making a security patch or bug fix in multiple branches or source code repositories should be easy.

Requiring library users to upgrade to a new major version to get some security patch or a bug correction can create
a maintenance hell where the library users must refactor all software components using the library just
to get a security patch or bug correction.

### Avoid Using Non-LTS Versions in Production Principle

Some software is available as Long Term Support (LTS) and non-LTS versions. Always use only an LTS
version in production. You are guaranteed long-term support through bug corrections
and security patches. You can use a non-LTS version for proof of concept projects where you want to use some
new features unavailable in an LTS version. But you must remember that if the PoC
succeeds, you can't just throw it into production. You need to productize it first, i.e., replace the non-LTS software with LTS software.

## Git Version Control Principle

> Develop software in feature branches that are merged into the main branch. Use feature toggles when needed.

When you need to develop a new feature, it can be done using either of the following ways:

1) Using a feature branch
2) Using multiple feature branches and a feature toggle

### Feature Branch

The feature branch approach is enough for simple features encompassing a single program increment, team, and microservice.
A new feature is developed in a feature branch created from the main branch, and when the feature is ready, the feature branch
is merged back into the main branch, and the feature branch can be deleted if wanted. The feature branch should be merged using
a merge or pull request that triggers a CI pipeline run that must succeed before the merge/pull request can be completed. The merge or pull
request should also take care of the code review. There should also be a manual way to trigger a CI/CD pipeline run for a feature
branch so that developers can test an unfinished feature in a test environment during the development phase.

Below a sample workflow of creating and using a feature branch is depicted:

<div class="sourceCodeWithoutLabel">

```
git clone <repository-url>
git checkout main
git pull origin main

# Create and checkout a feature branch named "feature-id"
git checkout -b <feature-id>

# First commit
git commit -a -m "Commit message"

# More commits...

# Push feature branch 
git push origin <feature-id>

# Other developers can now also use the feature branch
# because it is pushed to origin
```

</div>

When the feature is ready, you can create a pull or merge request from the feature branch to the main branch.

### Feature Toggle

A feature toggle is similar to a feature license. In the case of a feature license, the feature is available only when a user
has the respective license activated in their environment. A toggleable feature is available only when the feature toggle is
switched on. Feature toggles should be used for complex features spanning multiple program increments, microservices, or teams. Feature toggles
are part of the configuration of an environment. For example, feature toggles can be stored in a Kubernetes ConfigMap that any microservice can access. When using
a feature toggle, the toggle is initially switched off. Development of the feature happens in multiple feature
branches in different teams. Teams merge their part of the feature to the main branch. When all feature branches are
merged into the main branch, the feature toggle can be switched on to activate the feature.

## Architectural Patterns

### Event Sourcing Pattern

> Use event sourcing to capture state changes as a sequence of events.

Event sourcing ensures that all changes to the state of a service are stored as an ordered sequence of events.
Event sourcing makes it possible to query state changes. Also, the state change events act as an audit log. It is possible
to reconstruct past states and rewind the current state to some earlier state. Unlike CRUD actions on resources,
event sourcing utilizes only CR (create and read) actions. It is only possible to create new events and read events.
It is not possible to update an existing event or delete an event.

Let's have an example of using event sourcing to store orders in an e-commerce software system.
The _order-service_ should be able to store the following events:

- AbstractOrderEvent
  - Abstract base event for other concrete events containing timestamp and order id properties
- OrderCreatedEvent
  - Contains basic information about the order
- OrderPaymentEvent
  - Contains information about the order payment
- OrderModificationEvent
  - Contains information about modifications made by the customer to the order before packaging
- OrderPackagedEvent
  - Contains information about who collected and packaged the order
- OrderCanceledEvent
  - Describes that the customer has canceled the order and the order should not be shipped
- OrderShippedEvent
  - Contains information about the logistics partner and the tracking id of the order shipment
- OrderDeliveredEvent
  - Contains information about the pick-up point of the delivered order
- OrderShipmentReceivedEvent
  - Informs that the customer has received the shipment
- OrderReturnedEvent
  - Contains information about the returned order or order item(s)
- OrderReturnShippedEvent
  - Contains information about the logistics partner and the tracking id of the return shipment
- OrderReturnReceivedEvent
  - Contains information about who handled the order return and the status of returned items
- OrderReimbursedEvent
  - Contains information about the reimbursement for the returned order item(s) to the customer

### Command Query Responsibility Segregation (CQRS) Pattern

> Use the CQRS pattern if you want to use a different model for create/update (= command) operations compared to
> the model you want to use to query information.

Let's consider the previous _order-service_ example that used event sourcing. In the _order-service_, all the commands
are events. We want users to be able to query orders efficiently. We should have an additional
representation of an order in addition to events because it is inefficient to always generate the current
state of an order by replaying all the related events. For this reason, our architecture should utilize
the CQRS pattern and divide the _order-service_ into two different services: _order-command-service_ and _order-query-service_.

![Fig 2.14 Order Services using CQRS](images/02-07.png)

The _order-command-service_ is the same as the original _order-service_ that uses event sourcing, and the _order-query-service_ is
a new service. The _order-query-service_ has a database where it holds a materialized view of orders. The two
services are connected with a message broker. The _order-command-service_ sends events to a
topic in the message broker. The _order-query-service_ reads events from the topic and applies
changes to the materialized view. The materialized view is optimized to contain basic information about each order, including its current state, to be consumed by the e-commerce company staff and customers. Because customers query orders,
the materialized view should be indexed by the customer id column to enable fast retrieval. Suppose that, in some special case, a customer
needs more details about an order that is available in the materialized view. In that case, the _order-command-service_ can
be used to query the events of the order for additional information.
    
### Distributed Transaction Patterns

A distributed transaction is a transaction that spans multiple microservices. A distributed transaction
consists of one or more remote requests. Distributed transactions can be implemented using the _saga pattern_.
In the saga pattern, each request in a distributed transaction should have a respective compensating action defined.
If one request in the distributed transaction fails, compensating requests should be executed
for the already successfully executed requests. The idea of executing the compensating
requests is to bring the system back to the state where it was before the distributed transaction was started. So,
the rollback of a distributed transaction is done via executing the compensating actions.

A failed request in a distributed transaction must be conditionally compensated if we cannot be sure
whether the server successfully executed the request. This can happen when a request timeouts and
we don't receive a response to indicate the request status.

Also, executing a compensating request can fail. For this reason, a microservice must
persist compensating requests so they can be retried later until they all succeed. Persistence is needed
because the microservice instance can be terminated before it has completed all the compensating requests
successfully. Another microservice instance can continue the work left by the terminated microservice instance.

Some requests in a distributed transaction can be such that they cannot be compensated. One typical example
is sending an email. You can't get it unsent once it has been sent. There are at least two approaches to dealing with
requests that cannot be compensated. The first one is to delay the execution of the request so that it can be made
compensable. For example, an email-sending microservice can, instead of immediately sending an email, store the email
in a queue for later sending. Now email-sending microservice can accept a compensating request to remove the email
from the sending queue.

Another approach is to execute non-compensable requests in the latest possible phase of the distributed transaction. You can, for example, issue the email-sending request as the last request of
the distributed transaction. Then the likelihood of needing to compensate for the email sending is lower
than if the email was sent as the first request in the distributed transaction. You can also combine these
two approaches. Sometimes a request can be compensable even if you first think it is not. If we think about sending an email, it could be compensated by sending another email, where you state that
the earlier sent email should be disregarded for a specific reason.
    
#### Saga Orchestration Pattern

> Orchestrator or controller microservice orchestrates the execution of a distributed transaction.

Let's have an example of a distributed transaction using the saga orchestration pattern with an online banking
system where users can transfer money from their accounts. We have a higher-level microservice called
_money-transfer-service_, which is used to make money transfers. The banking system has also two lower-level microservices
called _account-balance-service_ and _account-transaction-service_. The _account-balance-service_ holds accounts'
balance information while the _account-transaction-service_ keeps track of all transactions on the accounts.
The _money-transfer-service_ acts as a saga orchestrator and utilizes both of the lower-level microservices to make
a money transfer to happen.

Let's consider a distributed transaction executed by the _money-transfer-service_ when a user makes a withdrawal
of $25,10:

1) The _money-transfer-service_ tries to withdraw the amount from the user's account by sending the following request to the _account_balance_service_:

<div class="sourceCodeWithoutLabel">

```
POST /account-balance-service/accounts/123456789012/withdraw
{
  "sagaUuid": "e8ab60b5-3053-46e7-b8da-87b1f46edf34", 
  "amountInCents": 2510
}
```

</div>

The `sagaUuid` is a universally unique identifier (UUID) generated by the saga orchestrator before the saga
begins. If there are not enough funds to withdraw the given amount, the request fails with the HTTP status code
400 _Bad Request_. If the request is successfully executed, the _account-balance-service_ should store the saga
UUID to a database table temporarily. This table should be cleaned up regularly by deleting old enough saga UUIDs.

2) The _money-transfer-service_ will create a new account transaction for the user's account by sending the following request to the _account-transaction-service_:

<div class="sourceCodeWithoutLabel">

```
POST /account-transaction-service/accounts/123456789012/transactions
{   
  "sagaUuid": "e8ab60b5-3053-46e7-b8da-87b1f46edf34", 
  // Additional transaction information here...
}
```

</div>

The above-described distributed transaction has two requests, each of which can fail. Let's consider
the scenario where the first request to the _account-balance-service_ fails. If the first request fails due to
a request timeout, we don't know if the request was successfully processed by the recipient microservice.
We don't know because we did not get the response and status code.
For that reason, we need to perform a compensating action by issuing the following compensating request:

<div class="sourceCodeWithoutLabel">

```
POST /account-balance-service/accounts/123456789012/undo-withdraw
{
  "sagaUuid": "e8ab60b5-3053-46e7-b8da-87b1f46edf34", 
  "amountInCents": 2510
}
```

</div>

The _account-balance-service_ will perform the `undo-withdraw` action only if a withdrawal with the given
saga UUID was earlier made and that withdrawal has not been undone yet. Upon successful undoing, the _account-balance-service_
will delete the row for the given saga UUID from the database table where the saga UUID was earlier temporarily stored. Further `undo-withdraw` actions with the same saga UUID will be no-op actions making the `undo-withdraw` action idempotent.

Next, let's consider the scenario where the first request succeeds and the second request fails. Now we have to
compensate for both requests. First, we compensate for the first request as described earlier. Then we will compensate
for the second request by deleting the account transaction identified with the `sagaUuid`:

<div class="sourceCodeWithoutLabel">

```
DELETE /account-transaction-service/accounts/123456789012/transactions?sagaUuid=e8ab60b5-3053-46e7-b8da-87b1f46edf34
```

</div>

If a compensating request fails, it must be repeated until it succeeds. Notice that the above
compensating requests are both idempotent, i.e., they can be executed multiple times with the same result. Idempotency is a requirement
for a compensating request because it can be possible that a compensating request fails after the compensation was
already performed. That compensation request failure will cause the compensating request to be attempted again. The distributed transaction manager
in the _money-transfer-service_ should ensure that a distributed transaction is successfully completed or roll-backed
by the instances of the _money-transfer-service_. You should implement a single distributed transaction manager library
per programming language or technology stack and use that in all microservices that need to orchestrate distributed transactions. Alternatively, use a 3rd party library.

Let's have another short example with the _ecommerce-service_ presented earlier in this chapter. The order-placing endpoint of the _ecommerce-service_ should
make the following requests in a distributed transaction:

1) Ensure payment
2) Create an order
3) Remove the ordered sales items from the shopping cart
4) Mark the ordered sales items sold
5) Enqueue an order confirmation email for sending

The respective compensating requests are the following:

1) Reimburse the payment
2) Delete the order using the saga UUID
3) Add the ordered sales items back to the shopping cart. (The shopping cart service must ensure that a sales item can be added only once to a shopping cart)
4) Mark the ordered sales items for sale
5) Dequeue the order confirmation email

#### Saga Choreography Pattern

> Microservices perform a distributed transaction in a choreography where a client microservice initiates a distributed transaction, and the last microservice involved completes the distributed transaction by sending a completion message to the client microservice.

The saga choreography pattern utilizes asynchronous communication between microservices. Involved microservices send
messages to each other in a choreography to achieve saga completion.

The saga choreography pattern has a couple of drawbacks:

- The execution of a distributed transaction is not centralized like in the saga orchestration pattern,
  and it can be hard to figure out how a distributed transaction is actually performed.

- It creates coupling between microservices, while microservices should be as loosely coupled as possible.

The saga choreography pattern works best in cases where the number of participating microservices is low. Then
the coupling between services is low, and it is easier to reason how a distributed transaction is performed.

Let's have the same money transfer example as earlier, but now using the saga choreography pattern
instead of the saga orchestration pattern.
    
1) The _money-transfer-service_ initiates the saga by sending the following event to the message broker's _account-balance-service_ topic:

<div class="sourceCodeWithoutLabel">

```
{
  "event": "Withdraw",
  "data": {
    "sagaUuid": "e8ab60b5-3053-46e7-b8da-87b1f46edf34", 
    "amountInCents": 2510,
    // Additional transaction information here...
  }
}
```

</div>

2) The _account-balance-service_ will consume the `Withdraw` event from the message broker, perform a withdrawal, and if successful, send the same event to the message broker's _account-transaction-service_ topic.

3) The _account-transaction-service_ will consume the `Withdraw` event from the message broker, persist an account transaction, and if successful, send the following event to the message broker's _money-transfer-service_ topic:

<div class="sourceCodeWithoutLabel">

```
{
  "event": "WithdrawComplete",
  "data": {
    "sagaUuid": "e8ab60b5-3053-46e7-b8da-87b1f46edf34"
  }
}
```   

</div>

If either step 2) or 3) fails, the _account-balance-service_ or _account-transaction-service_ will send the following event to message broker's
_money-transfer-service_ topic:

<div class="sourceCodeWithoutLabel">

```
{
  "event": "WithdrawFailure",
  "data": {
    "sagaUuid": "e8ab60b5-3053-46e7-b8da-87b1f46edf34"
  }
}
```

</div>

If the _money-transfer-service_ receives a `WithdrawFailure` event or does not receive a `WithdrawComplete` event during some
timeout period, the _money-transfer-service_ will initiate a distributed transaction rollback sequence by sending
the following event to the message broker's _account-balance-service_ topic:

<div class="sourceCodeWithoutLabel">

```
{
  "event": "WithdrawRollback",
  "data": {
    "sagaUuid": "e8ab60b5-3053-46e7-b8da-87b1f46edf34", 
    "amountInCents": 2510,
    // Additional transaction information here...
  }
}
```

</div>

Once the rollback in the _account-balance-service_ is done, the rollback event will be produced to the _account-transaction-service_ topic in the message broker. After the _account-transaction-service_ has successfully performed the rollback,
it sends a `WithdrawRollbackComplete` event to the _money-transfer-service_ topic.
Once the _money-transfer-service_ consumes that message, the withdrawal event is successfully rolled back.
Suppose the _money-transfer-service_ does not receive the `WithdrawRollbackComplete` event during some timeout period. In that case,
it will restart the rollback choreography by resending the `WithdrawRollback` event to the  _account-balance-service_.

## Preferred Technology Stacks Principle

> Define preferred technology stacks for different purposes.

The microservice architecture enables using the most suitable technology stack to develop each microservice. For example, some microservices require high performance and controlled memory allocation, and other microservices don't need such things.
You can choose the used technology stack based on the needs of a microservice. For a real-time data processing microservice,
you might pick C++ or Rust, and for a simple REST API, you might choose Node.js and Express, Java and Spring Boot, or Python and Django.

Even if the microservice architecture allows different teams and developers to decide what programming languages
and technologies to use when implementing a microservice, defining preferred technology
stacks for different purposes is still a good practice. Otherwise, you might find yourself in a situation where numerous
programming languages and technologies are used in a software system. Some programming languages and technologies
like Clojure, Scala, or Haskell can be relatively niche. When software developers in the organization come and go,
you might end up in situations where you don't have anyone who knows about some specific niche programming language
or technology. In the worst case, a microservice needs to be reimplemented from scratch using
some more mainstream technologies. For this reason, you should specify technology stacks that
teams should use. These technology stacks should contain as much as possible mainstream programming languages and technologies.

For example, an architecture team might decide the following:

- Web clients should be developed using TypeScript, React, and Redux
- Non-API backend services should be developed in C++ for performance reasons
- APIs should be developed with TypeScript, Node.js, and Nest.js or with Java and Spring Boot
- Integration tests should be implemented with Cucumber using the same language as is used for the implementation or, alternatively,
  with Python and Behave
- E2E tests should be implemented with Python and Behave
- Scripts should be implemented using Bash for small scripts and Python for larger scripts

The above technology stacks are mainstream. Recruiting talent
with needed knowledge and competencies should be effortless.

After you have defined the preferred technology stacks, you should create a utility or utilities that
can be used to kick-start a new project using a particular technology stack quickly. This utility or utilities should
generate the initial source code repository content for a new microservice, client, or library. The initial source code repository should contain at least the following items for a new microservice:

- Source code folder
- Unit test folder
- Integration test folder
- Build tools, like Gradle Wrapper for Java, for example
- Initial build definition file(s), like build.gradle for Java, CMakeLists.txt for C++ or package.json for Node.js
  - Initial dependencies defined in the build definition file
- .env file(s) to store environment variables for different environments (dev, CI)
- .gitignore
- README.MD template
- Linting rules (e.g., .eslintrc.json)
- Code formatting rules (e.g., .prettier.rc)
- Initial code for integration tests, e.g., docker-compose.yml file for spinning up an integration testing environment
- Infrastructure code for the chosen cloud provider, e.g., code to deploy a managed SQL database in the cloud
- Code (e.g., Dockerfile) for building the microservice container image
- Deployment code (e.g., a Helm chart)
- CI/CD pipeline definition code

The utility should ask the following questions from the developer before creating the initial source code
repository content for a microservice:

- What is the name of the microservice?
- To what cloud environment will microservice be deployed? (AWS, Azure, Google Cloud, etc.)
- What are the used inter-service communication methods? Based on the answer, the utility can add dependencies, e.g., a Kafka client dependency
- Should microservice have a database, and what database?
- What are the other dependent microservices?

Of course, decisions about the preferred technology stacks are not engraved in stone. They are not static.
As time passes, new technologies arise, and new programming languages gain popularity. At some point, a decision
could be made that a new technology stack should replace an existing preferred technology stack. Then
all new projects should use the new stack, and old software components will be gradually migrated to use the new technology
stack.

Many developers are keen on learning new things on a regular basis. They should be encouraged to work on hobby projects
with technologies of their choice, and they should be able to utilize new programming languages and frameworks in selected
new projects.
