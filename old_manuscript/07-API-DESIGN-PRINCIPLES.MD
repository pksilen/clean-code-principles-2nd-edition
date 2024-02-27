# API Design Principles

This chapter presents design principles for both frontend facing and backend APIs. First, frontend-facing API design
is discussed, and then inter-microservice API design is covered.

## Frontend Facing API Design Principles

Most frontend facing APIs should be HTTP-based JSON-RPC, REST, or GraphQL APIs. Use GraphQL especially
when the API handles heavily nested resources, or clients want to decide what fields queries should return.
For subscription-based APIs, use Server-Sent Events (SSE) or GraphQL subscriptions, and for real-time bidirectional
communication, use WebSocket.

### JSON-RPC API Design Principle

> Design a JSON-RPC API to perform a single action (procedure) for an API endpoint.

As the name says, JSON-RPC APIs are for executing remote procedure calls. The remote procedure argument is a JSON object in the HTTP request body. And the remote procedure return value is a JSON object in the HTTP response body.
A client calls a remote procedure by issuing an HTTP POST request where it specifies the name of the procedure
in the URL path and gives the argument for the remote procedure call in the request body in JSON.

Below is an example request for a translation service's _translate_ procedure:

<div class="sourceCodeWithoutLabel">

```
POST /translation-service/translate
{
  "text": "Ich liebe dich"
  "fromLanguage": "German",
  "toLanguage": "English"
}
```
</div>

The API server shall respond with an HTTP status code and include the procedure's response in the HTTP
response body in JSON.

For the above request, you get the following response:

<div class="sourceCodeWithoutLabel">

```
HTTP/1.1 200 OK
{
  "translatedText": "I love you"
}
```
</div>

Let's have another example with a _web-page-search-service_:

<div class="sourceCodeWithoutLabel">

```
POST /web-page-search-service/search-web-pages
{
  "containingText": "Software design patterns"
}
```
</div>

<div class="sourceCodeWithoutLabel">

```
HTTP/1.1 200 OK
[
  {
    "url": "https://...",
    "title: "...",
    "date": "...",
    "contentExcerpt": "..."
  },
  ...
]
```
</div>

You can create a complete service using JSON-RPC instead of REST or GraphQL. Below are five remote procedures
defined for a _sales-item-service_. The benefit of using JSON-RPC instead of REST, GraphQL, or gRPC, is that you don't
have to learn any specific technology.

<div class="sourceCodeWithoutLabel">

```
POST /sales-item-service/createSalesItem
{
  "name": "Sample sales item",
  "price": 20
}

POST /sales-item-service/getSalesItems

POST /sales-item-service/getSalesItemById
{
  "id": 1
}

POST /sales-item-service/updateSalesItem
{
  "id": 1,
  "name": "Sample sales item name modified",
  "price": 30
}

POST /sales-item-service/deleteSalesItemById
{
  "id": 1
}

POST /sales-item-service/deleteSalesItems
```

</div>

You can easily create a controller for the above service. Below is an example of such a controller with one remote procedure defined:

_SalesItemController.java_
```
@RestController
public class SalesItemController {
  @Autowired
  private SalesItemService salesItemService;

  @PostMapping("/createSalesItem")
  @ResponseStatus(HttpStatus.CREATED)
  public final SalesItem createSalesItem(
    @RequestBody final SalesItemArg salesItemArg
  ) {
    return salesItemService.createSalesItem(salesItemArg);
  }
  
  // Rest of the methods ...
}
```

You can version your API by adding a version number to the URL path. In the below example, the
new API version 2 allows a new procedure argument `someNewParam` to be supplied for the `search-web-pages`
procedure.

<div class="sourceCodeWithoutLabel">

```
POST /web-page-search-service/v2/search-web-pages
{
  "containingText": "Software design patterns"
  "someNewParam": "..."
}
```
</div>

### REST API Design Principle

> Design a REST API for interaction with a resource (or resources) using CRUD (create, read, update, delete)
> operations.

Many APIs fall into the category of performing CRUD operations on resources. Let's create an example REST API called _sales-item-service_
for performing CRUD operations on sales items.

#### Creating a Resource

Creating a new resource using a REST API is done by sending an HTTP POST request to the API's resource endpoint.
The API's resource endpoint should be named according to resources it handles. The resource endpoint name should be a noun and always given in the plural form, for example, for the _sales-item-service_,
the resource endpoint should be _sales-items_, and for an _order-service_ handling orders, the resource endpoint should be called _orders_.

You give the resource to be created in the HTTP request body in JSON. To create a new sales item, you can issue the following request:

<div class="sourceCodeWithoutLabel">

```
POST /sales-item-service/sales-items
{
  "name": "Sample sales item",
  "price": 20
}
```
</div>

The server will respond with the HTTP status code 201 _Created_. The server can add fields to the resource upon
creation. Typically, the server will add an `id` property to the created resource, but it can add other
properties also. The server will respond with the created resource in the HTTP response body in JSON. Below is a
response to a sales item creation request. You can notice that the server added the `id` property to the resource.
Other properties that are usually added are the creation timestamp and the version of the resource (the version
of a newly created resource should be one).

<div class="sourceCodeWithoutLabel">

```
HTTP/1.1 201 Created
{
  "id": 1,
  "name": "Sample sales item",
  "price": 20
}
```
</div>

If the supplied resource to be created is somehow invalid, the server should respond with the HTTP status code 400 _Bad Request_
and explain the error in the response body. The response body should be in JSON format containing information about the
error, like the error code and message.

If the created resource is huge, there is no need to return the resource to the caller and waste network
bandwidth. You can return the added properties only. For example, if the server only adds the `id` property, it is
possible to return only the `id` in the response body:

<div class="sourceCodeWithoutLabel">

```
HTTP/1.1 201 Created
{
  "id": 1
}
```
</div>

The request sender can construct the created resource by merging the sent resource object with the received
resource object.

> Ensure that no duplicate resources are created.

When a client tries to create a new resource, the resource creation request may fail so that the
resource was created successfully created on the server, but the client did not receive a response on time, and the request failed due to
timeout. From the server's point of view, the request was successful, but from the client's point of view, it was indeterminate.
The client, of course, needs to re-issue the time-outed request, and if it succeeds,
the same resource is created twice on the server side, which is probably always unwanted.

Suppose a resource contains a unique property, like a user's email. In that case, it is impossible
to create a duplicate resource if the server is correctly implemented (= the unique property is marked as a unique column
in the database table definition). In many cases, such a unique field does not exist in the resource.
In those cases, the client can supply a universally unique identifier (UUID), named `creationUuid`, for example.
The role of the server is to check if a resource with the same `creationUuid` was already created and to fail the creation
of a duplicate resource. As an alternative to the UUID approach, the server can ask for  
verification from the client if the creation of two identical resources is intended in case the server
receives two identical resources from the same client during a short period of time.

#### Reading Resources

Reading resources with a REST API is done by sending an HTTP GET request to the API's resource endpoint.
To read all sales items, you can issue the following request:

<div class="sourceCodeWithoutLabel">

```
GET /sales-item-service/sales-items
```
</div>

The server will respond with the HTTP status code 200 _OK_. The server will respond with a JSON array of resources
in the response body or an empty array in case none is found. Below is an example response to a request to get the sales items:

<div class="sourceCodeWithoutLabel">

```
HTTP/1.1 200 OK
[
  {
    "id": 1,
    "name": "Sample sales item",
    "price": 20
  }
]
```
</div>

To read a single resource by its id, add the resource id to the request URL path as follows:

<div class="sourceCodeWithoutLabel">

```
GET /sales-item-service/sales-items/<id>
```
</div>

The following request can be issued to read the sales item identified with id 1:

<div class="sourceCodeWithoutLabel">

```
GET /sales-item-service/sales-items/1
```
</div>

The server responds with the HTTP status code 404 _Not Found_ if the requested resource is not found.

You can define parameters in the URL query string to filter what resources to read.
A query string is the last part of the URL and is separated from the URL path by a question mark (?) character.
A query string can contain one or more parameters separated by ampersand (&) characters.
Each query string parameter has the following format: `<query-parameter-name>=<query-parameter-value>`.
Below is an example request with two query parameters: _name-contains_ and _price-greater-than_.

<div class="sourceCodeWithoutLabel">

```
GET /sales-item-service/sales-items?name-contains=Sample&price-greater-than=10
```
</div>

The above request gets sales items whose name contains the string _Sample_ and whose price is greater
than 10.

To define a filter, you can specify a query parameter in the following format: `<fieldName>[-<condition>]=<value>`, for example:

- price=10
- price-not-equal=10
- price-less-than=10
- price-less-than-equal=10
- price-greater-than=10
- price-greater-than-equal=10
- name-starts-with=Sample
- name-ends-with=item
- name-contains=Sample
- createdTimestamp-before=2022-08-02T05:18:00Z
- createdTimestamp-after=2022-08-02T05:18:00Z
- images.url-starts-with=https

Remember that when implementing the server side and adding the above-given parameters to an SQL query,
you must use a parameterized SQL query to prevent SQL injection attacks because an attacker can
send malicious data in the query parameters.

Other actions like projection, sorting, and pagination for the queried resources can also be defined with
query parameters in the URL:

<div class="sourceCodeWithoutLabel">

```
GET /sales-item-service/sales-items?fields=id,name&sort-by=price:asc&offset=0&limit=100
```
</div>

The above request gets sales items sorted by price (ascending). The number of fetched sales items
is limited to 100. Sales items are fetched beginning from the offset 0, and the response only contains
fields _id_ and _name_ for each sales item.

The _fields_ parameter defines what resource fields (properties) are returned in the response. The wanted fields
are defined as a comma-separated list of field names. If you want to define sub-resource fields, those can be defined with
the dot notation, for example:

<div class="sourceCodeWithoutLabel">

```
fields=id,name,images.url
```
</div>

The _sort-by_ query parameter defines sorting using the following format `sort-by=<fieldName>:asc|desc,[<fieldName>:asc|desc]`.
For example:

<div class="sourceCodeWithoutLabel">

```
sort-by=price:asc,images.rank:asc
```
</div>

In the above example, the resources are returned sorted first by ascending price and secondarily by image's rank.

The _limit_ and _offset_ parameters are used for pagination. The _limit_ query parameter defines the maximum
number of resources that can be returned. The _offset_ query parameter specifies the offset from which resources are returned. You can also paginate sub-resources by giving the _offset_ and _limit_ in the form
of `<sub-resource>:<number>`. Below is an example of using pagination query parameters:

<div class="sourceCodeWithoutLabel">

```
offset=0&limit=50,images:5
```
</div>

The above query parameters define that the first page of 50 sales items is fetched, and each sales item contains
the first five images of the sales item. Instead of _offset_ and _limit_ parameters, you can use _page_ and _pageSize_ parameters.
The _page_ parameter defines the page number, and the _pageSize_ defines how many resources a page should contain.

Remember to validate user-supplied data to prevent SQL injection attacks when implementing the server side and adding data from query parameters to an SQL query. For example, field names in
the _fields_ query parameter should only contain characters allowed in an SQL column name. Similarly, the value of
the _sort-by_ parameter should only contain characters allowed in an SQL column name and words _asc_ and _desc_.
And finally, the values of the _offset_ and _limit_  (or _page_ and _pageSize_) parameters must be integers.
You should also validate the _limit/pageSize_ parameter against the maximum allowed value because you should not allow end-users
to fetch too many resources at a time.

Some HTTP servers log the URL of an HTTP GET request. For this reason, it is not recommended to put sensitive information in the URL. Sensitive information should be put into a request body. Also, browsers can have a limit for
the maximum length of an URL. If you have a query string that is thousands of characters
long, you should give parameters in the request body instead. You should not put a request body to an HTTP GET request.
What you should do is issue the request using the HTTP POST method instead, for example:

<div class="sourceCodeWithoutLabel">

```
POST /sales-item-service/sales-items
X-HTTP-Method-Override: GET
{
  "fields": ["name"],
  "sortBy": "price:asc",
  "limit": 100
}
```
</div>

The server can confuse the above request with a sales item creation request because the URL and the HTTP
method are identical to a resource creation request. For this reason, a custom HTTP request header
_X-HTTP-Method-Override_ has been added to the request. The server should read the custom header and treat the above
request as a GET request. The _X-HTTP-Method-Override_ header tells the server to override the request method
with the method supplied in the header.

#### Updating Resources

Updating a resource with a REST API is done by sending an HTTP PUT or PATCH request to the API's resource endpoint.
To update the sales item identified with id 1, you can issue the following request:

<div class="sourceCodeWithoutLabel">

```
PUT /sales-item-service/sales-items/1
{
  "name": "Sample sales item name modified",
  "price": 30
}
```
</div>

The server will respond without content:

<div class="sourceCodeWithoutLabel">

```
HTTP/1.1 204 No Content
```
</div>

The server will respond with the HTTP status code 404 _Not Found_ if the requested resource is not found.

If the supplied resource in the request
is invalid, the server should respond with the HTTP status code 400 _Bad Request_. The response body should contain an error object
in JSON.

HTTP PUT request will replace the existing resource with the supplied resource.
You can also modify an existing resource partially using the HTTP PATCH method:

<div class="sourceCodeWithoutLabel">

```
PATCH /sales-item-service/sales-items/1
{
  "price": 30
}
```
</div>

The above request only modifies the price property of the sales item identified with id 1.

You can do bulk updates by specifying a filter in the URL, for example:

<div class="sourceCodeWithoutLabel">

```
PATCH /sales-item-service/sales-items?price-less-than=10
{
  "price": 10
}
```
</div>

The above example will update the price property of each resource where the price is less than ten currently.
On the server side, the API endpoint could use the following parameterized SQL statement to implement
the update functionality:

<div class="sourceCodeWithoutLabel">

```
UPDATE salesitems SET price = :price WHERE price < :priceLessThan
```
</div>

The above SQL statement will only modify the price column, and other columns will remain intact.

> Use resource versioning when needed.

When you get a resource from the server and then try to update it, it is possible that
someone else has updated it after you got it and before you try to update it. Sometimes this can be ok
if you don't care about other clients' updates. But sometimes, you want to ensure no one else has updated
the resource before you update it. In that case, you should use resource versioning. In the resource versioning,
there is a version field in the resource, which is incremented by one during each update. If you get a resource
with version x and then try to update the resource giving back the same version x to the server, but someone
else has updated the resource to version x + 1, your update will fail because of the version mismatch (x != x + 1).
The server should respond with the HTTP status code 409 _Conflict_. After receiving the conflict response,
you can fetch the latest version of the resource from the server and, based on the resource's new state, decide
whether your update is still relevant or not.

The server should assign the resource version value to the HTTP response header _ETag_. A client can use the received ETag
value in a conditional HTTP GET request by assigning the received ETag value to the request header _If-None-Match_. Now the server
will return the requested resource only if it has a newer version. Otherwise, the server returns nothing with the HTTP status code 304 _Not Modified_.
This has the advantage of not needing to transfer an unmodified resource from the
server to the client. This can be especially beneficial when the resource is large or the connection between the server
and the client is slow.

#### Deleting Resources

Deleting a resource with a REST API is done by sending an HTTP DELETE request to the API's resource endpoint.
To delete the sales item identified with id 1, you can issue the following request:

<div class="sourceCodeWithoutLabel">

```
DELETE /sales-item-service/sales-items/1
```
</div>

The server will respond without content:

<div class="sourceCodeWithoutLabel">

```
HTTP/1.1 204 No Content
```
</div>

If the resource requested to be deleted has already been deleted, the API should still
respond with the HTTP status code 204 _No Content_, meaning a successful operation. It should not respond with the HTTP status code 404
_Not Found_.

To delete all sales items, you can issue the following request:

<div class="sourceCodeWithoutLabel">

```
DELETE /sales-item-service/sales-items
```
</div>

To delete sales items using a filter, you can issue the following kind of request:

<div class="sourceCodeWithoutLabel">

```
DELETE /sales-item-service/sales-items?price-less-than=10
```
</div>

On the server side, the API endpoint handler can use the following parameterized SQL query to implement the deleting functionality:

<div class="sourceCodeWithoutLabel">

```
DELETE FROM salesitems WHERE price < ?
```
</div>

#### Executing Non-CRUD Actions on Resources

Sometimes you need to perform non-CRUD actions on resources. In those cases, you can issue an HTTP POST request
and put the name of the action (a verb) after the resource name in the URL. The below example will perform a _deposit_
action on an account resource:

<div class="sourceCodeWithoutLabel">

```
POST /account-balance-service/accounts/12345678912/deposit
{
  "amountInCents": 2510
}
```
</div>

Similarly, you can perform a withdrawal action:

<div class="sourceCodeWithoutLabel">

```
POST /account-balance-service/accounts/12345678912/withdraw
{
  "amountInCents": 2510
}
```
</div>

#### Resource Composition

A resource can be composed of other resources. There are two ways to implement resource composition:
Nesting resources or linking resources. Let's have an example of nesting resources first. A sales item resource can contain one or more image resources. We don't want to return all images when a client requests a sales item because images can be
large and are not necessarily used by the client. What we could return is a set of small thumbnail images.
For a client to view the images of a sales item, we could implement an API endpoint for image resources.
To get images for a specific sales item, the following API call can be issued:

<div class="sourceCodeWithoutLabel">

```
GET /sales-item-service/sales-items/<id>/images
```
</div>

You can also add a new image for a sales item:

<div class="sourceCodeWithoutLabel">

```
POST /sales-item-service/sales-items/<id>/images
```
</div>

Also, other CRUD operations could be made available:

<div class="sourceCodeWithoutLabel">

```
PUT /sales-item-service/sales-items/<salesItemId>/images/<imageId>
DELETE /sales-item-service/sales-items/<salesItemId>/images/<imageId>
```
</div>

The problem with this approach is that the _sales-item-service_ will grow in size and if you need to add more
nested resources in the future, the size will grow even more, making the microservice too complex and being
responsible for too many things.

A better alternative is to create a separate microservice for the nested resources. This will enable
utilizing the best-suited technologies to implement a microservice. Regarding the sales item images,
the _sales-item-image_service_ could employ a cloud object storage to store images, and the _sales-item-service_
could utilize a standard relational database for storing sales items.

When having a separate microservice for sales item images, you can get the images for a sales item by issuing
the following request:

<div class="sourceCodeWithoutLabel">

```
GET /sales-item-image-service/sales-item-images?salesItemId=<salesItemId>
```
</div>

You can notice that the _sales-item_service_ and _sales-item-image-service_ are now linked by the _salesItemId_.

#### HTTP Status Codes

Use the following HTTP status codes:

| HTTP Status Code       | When to Use                                                                                                                                                  |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 200 OK                 | Successful API operations with the GET method                                                                                                                |
 | 201 Created            | Successful API operations with the POST method                                                                                                               |
 | 204 No Content         | Successful API operations with the PUT, PATCH, or DELETE method                                                                                              |
 | 400 Bad Request        | Client error in API operations, e.g., invalid data supplied by the client                                                                                    |
 | 401 Unauthorized       | Client does not provide an authorization header in the request                                                                                               |
| 403 Forbidden          | Client provides an authorization header in the request, but the user is not authorized to perform the API operation                                          |
| 404 Not Found          | When requesting a non-existent resource with the GET, PUT, or PATCH method                                                                                   |
 | 405 Method Not Allowed | When a client tries to use the wrong method for an API endpoint                                                                                              |
 | 406 Not Acceptable     | When a client requests a response in a format that the server cannot produce, e.g., requests XML, but the server provides only JSON                          |
| 409 Conflict           | When a client is trying to update a resource that has been updated after the client got the resource                                                         |
 | 413 Payload Too Large  | When a client tries to supply a too large payload in a request. To prevent DoS attacks, do not accept arbitrarily large payloads from clients                | 
 | 429 Too Many Requests  | Configure rate limiting in your API gateway to send this status code when the request rate is exceeded                                                       |
| 500 Internal Server Error | When a server error occurs, for example, an exception is thrown                                                                                              |
| 503 Service Unavailable | Server's connections to dependent services fail. This indicates that clients should retry the request after a while because this issue is usually temporary. |

#### HATEOAS and HAL

Hypermedia as the Engine of Application State (HATEOAS) can be used to add hypermedia/metadata to a requested resource.
Hypertext Application Language (HAL) is a convention for defining hypermedia (metadata), such as links to external resources.
Below is an example response to a request that fetches the sales item with id 1234. The sales item is owned by the user with id 5678. The response provides a link to the fetched resource itself and
another link to fetch the user (account) that owns the sales item:

<div class="sourceCodeWithoutLabel">

```
{
  "_links": {
    "self": {
      "href": "https://.../sales-item-service/sales-items/1234"
    },
    "userAccount": {
      "href": "https://.../user-account-service/user-accounts/5678"
    }
  },
  "id": 1234,
  "name": "Sales item xyz"
  "userAccountId": 5678
}
```

</div>

When fetching a collection of sales items for page 3 using HAL, we can get the following kind of response:

<div class="sourceCodeWithoutLabel">

```
{
  "_links": {
    "self": {
      "href": "https://.../sales-items?page=3"
    },
    "first": {
      "href": "https://...sales-items"
    },
    "prev": {
      "href": "https://.../sales-items?page=2"
    },
    "next": {
      "href": "https://.../sales-items?page=4"
    },
  },
  "count": 25,
  "total": 1500,
  "_embedded": {
    "salesItems": [
      {
        "_links": {
           "self": {
             "href": "https://.../sales-items/123"
           }
        },
        "id": 123,
        "name": "Sales item 123"
      },
      {
        "_links": {
           "self": {
             "href": "https://.../sales-items/124"
           }
        },
        "id": 124,
        "name": "Sales item 124"
      },
      .
      .
      .
    ]
  }
}
```

</div>

#### Versioning

You can introduce a new version of an API using a versioning URL path segment. Below are example endpoints for API version 2:

<div class="sourceCodeWithoutLabel">

```
GET /sales-item-service/v2/sales-items
POST /sales-item-service/v2/sales-items
...
```
</div>
  
#### Documentation

If you need to document or provide interactive online documentation for a REST API, there are two ways:

1) First, create a specification for the API and then generate code from the specification
2) First, implement the API and then generate the API specification from the code

Tools like Swagger and Postman can generate both static and interactive documentation for your API based on the
API specification. You should specify APIs using the [OpenAPI specification](https://swagger.io/specification/).

When using the first alternative, you can specify your API using the OpenAPI specification language.
You can use tools like SwaggerHub or Postman to write the API spec. Swagger offers code-generation tools
for multiple languages. Code generators generate code based on the OpenAPI spec.

When using the second alternative, you can use a web framework-specific way to build the API spec from the API
implementation. For example, if you are using Spring Boot, you can use the _springdoc-openapi-ui_ library, and with Nest.js, you
can use the _@nestjs/swagger_ library.

#### Implementation Example

Let's implement the API endpoints for the _sales-item-service_ using Typescript and Nest.js and its `Controller` decorator:

{title: "SalesItemController.ts"}
```ts
import { 
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete 
} from '@nestjs/common';
// ...

@Controller('sales-items')
export class SalesItemController {
  constructor(private readonly salesItemService: SalesItemService) {}
  
  @Post()
  create(@Body() salesItemArg: SalesItemArg): Promise<SalesItem> {
    return this.salesItemService
      .createSalesItem(salesItemArg);
  }

 @Get()
  getSalesItems(
    @Query('userAccountId') userAccountId: string,
  ): Promise<SalesItem[]> {
    if (userAccountId) {
      return this.salesItemService.getSalesItemsByUserAccountId(
        parseInt(userAccountId, 10),
      );
    } else {
      return this.salesItemService.getSalesItems();
    }
  }

  @Get('/:id')
  getSalesItemById()(@Param('id') id: string): Promise<SalesItem> {
    return this.salesItemService
      .getSalesItemById(parseInt(id, 10));
  }

  @Put('/:id')
  @HttpCode(204)
  updateSalesItem(
    @Param('id') id: string,
    @Body() salesItemArg: SalesItemArg
  ):Promise<void> {
    return this.salesItemService
      .updateSalesItem(parseInt(id, 10), salesItemArg);
  }

  @Delete('/:id')
  @HttpCode(204)
  deleteSalesItemById(@Param('id') id: string): Promise<void> {
    return this.salesItemService
      .deleteSalesItemById(parseInt(id, 10));
  }
  
  @Delete()
  @HttpCode(204)
  deleteSalesItems(): Promise<void> {
    return this.salesItemService.deleteSalesItems();
  }
}
```

Next, we create the `SalesItemService` class, which will be injected into the controller by the Nest.js
framework. To make it an injectable dependency, we decorate the `SaleItemService` class with the `@Injectable` decorator. We list
the `SaleItemService` class in the application module's providers to allow an instance of the `SaleItemService` class to be
injected where needed, e.g., into an instance of the `SalesItemController` class.

_SalesItemService.ts_
```
import { Injectable } from '@nestjs/common';
// ...

@Injectable()
export class SalesItemService {
  // Implement service methods...
}
```

_AppModule.ts_
```
import { Module } from '@nestjs/common';
// ...

@Module({
  controllers: [SalesItemController],
  providers: [SalesItemService],
})
export class AppModule {}
```

Regarding errors, Nest.js instructs to throw an instance of its `HttpException` class or an instance of a `HttpException` subclass.
This is not the correct way to handle errors. Errors should not be tied to a specific
web framework. You should throw business errors from your business logic and use
your web framework's error mapping/handling/filtering functionality to map business errors to HTTP responses.
The best way to achieve this is to create a base error class that can store an HTTP status code, possibly
an error code, and, of course, the error message itself.

_ApiError.ts_
```
export class ApiError extends Error {
  getStatusCode(): number {
    return 500;
  }
  
  getErrorCode(): string {
   return "UNSPECIFIED";
  }
}
```

_EntityNotFoundError.ts_
```
export class EntityNotFoundError extends ApiError {
  constructor(entityType: string, id: number) {
    super(`${entityType} entity not found with id ${id}`);
  } 
  
  override getStatusCode(): number {
    return 404;
  }
}
```

### GraphQL API Design

> Divide API endpoints into queries and mutations. Compared to REST, REST GET requests are GraphQL queries, and REST POST/PUT/PATCH/DELETE requests are GraphQL mutations. With GraphQL, you can name your queries and mutations with descriptive names.

Let's create a GraphQL schema that defines needed types and API endpoints for the _sales-item-service_:

_schema.graphql_
```
type Image {
  id: ID!
  rank: Int!
  url: String!
}

type SalesItem {
  id: ID!
  createdAtTimestampInMillis: String!
  name: String!
  price: Float!
  images(
    sortByField: String = "rank",
    sortDirection: SortDirection = ASC,
    offset: Int = 0,
    limit: Int = 5
  ): [Image!]!
}

input InputImage {
  id: ID!
  rank: Int!
  url: String!
}

input NewSalesItem {
  name: String!
  price: Float!
  images: [InputImage!]!
}

input UpdatedSalesItem {
  name: String
  price: Float
  images: [InputImage!]
}

enum SortDirection {
  ASC,
  DESC
}

type IdResponse {
  id: ID!
}

type Query {
  salesItems(
    sortByField: String = "createdAtTimestamp",
    sortDirection: SortDirection = DESC,
    offset: Int = 0,
    limit: Int = 50
  ): [SalesItem!]!

  salesItem(id: ID!): SalesItem!

  salesItemsByFilters(
    nameContains: String,
    priceGreaterThan: Float
  ): [SalesItem!]!
}

type Mutation {
  createSalesItem(salesItem: NewSalesItem!): SalesItem!

  updateSalesItem(
    id: ID!,
    updatedSalesItem: UpdatedSalesItem
  ): IdResponse!

  deleteSalesItem(id: ID!): IdResponse!
}
```

In the above GraphQL schema, we define several types used in API requests and responses. A GraphQL `type` specifies
what properties the type has and the types of those properties. A type specified with the `input` keyword is an input-only type (input DTO type). GraphQL defines the following primitive (scalar) types: `Int` (32-bit), `Float`, `String`, `Boolean`, and `ID`.
You can define an array type with the notation: `[<Type>]`. By default, types are nullable.
If you want a non-nullable type, you must add an exclamation mark (!) after the type name. You can define an enumerated type
with the `enum` keyword. The `Query` and `Mutation` types are special GraphQL types used to define queries and mutations.
The above example defines three queries and four mutations that clients can execute. You can add
parameters for a type property. We have added parameters for all the queries (queries are properties of the `Query` type),
mutations (mutations are properties of the `Mutation` type), and the `images` property of the `SalesItem` type.

In the above example, I have named all the queries with names that describe the values they return, i.e., there are no
verbs in the query names. It is possible to name queries starting with a verb (like the mutations).
For example, you could add _get_ to the names of the above-defined queries if you wanted.

The Apollo server below implements some GraphQL type resolvers returning static responses.
After starting the server with the `node server.js` command, you can browse to _http://localhost:4000_ and
try to execute some of the implemented queries or mutations.

_server.js_
```
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = readFileSync('./schema.graphql',
                              { encoding: 'utf8' });

const resolvers = {
  Query: {
    salesItems: (_, { sortByField,
                      sortDirection,
                      offset,
                      limit }) =>   
    [{
        id: 1,
        createdAtTimestampInMillis: '12345678999877',
        name: 'sales item',
        price: 10.95
    }],
    salesItem: (_, { id }) => ({
      id,
      createdAtTimestampInMillis: '12345678999877',
      name: 'sales item',
      price: 10.95
    })
  },
  Mutation: {
    createSalesItem: (_, { newSalesItem }) => {
      return {
        id: 100,
        createdAtTimestampInMillis: Date.now().toString(),
        ...newSalesItem
      };
    },
    deleteSalesItem: (_, { id }) => {
      return {
        id
      };
    }
  },
  SalesItem: {
    images: (parent) => {
      return [{
        id: 1,
        rank: 1,
        url: 'url'
      }];
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

startStandaloneServer(server, {
  listen: { port: 4000 }
});
```

GraphQL error handling differs from REST API error handling. A GraphQL API does not provide different HTTP response status codes.
When an error happens while processing a GraphQL API request, the response body object will include an `errors` array. In your GraphQL type resolvers,
you should throw a `GraphQLError` object when a query or mutation fails. By supplying an 'extensions' object, you can
supply custom error properties when throwing a `GraphQLError` object. In the below example, we supply an `errorCode` property
in the `extensions` object.

<div class="sourceCodeWithoutLabel">

```
import { GraphQLError } from 'graphql';

throw new GraphQLError(message, {
  extensions: { errorCode: 'YOUR_ERROR_CODE' }
});
```
</div>

If you want, you can supply an HTTP status code in the `extensions` object, too:

<div class="sourceCodeWithoutLabel">

```
import { GraphQLError } from 'graphql';

throw new GraphQLError(message, {
  extensions: { 
    statusCode: 500,
    status: 'Internal Server Error',
    errorCode: 'YOUR_ERROR_CODE' 
  }
});
```
</div>

Remember to follow the _clean microservice design principle_ when implementing production code. Use controllers, services, repositories, DTOs, and entities. Below is an example of a GraphQL controller:

_GraphQlSalesItemController.js_
```
export default class GraphQlSalesItemController {
  salesItemService;
  salesItemImageService;
  
  // ...

  getSalesItems(...) {
    return this.salesItemService.getSalesItems(...);
  }

  getSalesItem({ id }) {
    return this.salesItemService.getSalesItem(id);
  }

  getSalesItemImages({ id }) {
    return this.salesItemImageService.getSalesItemImages(id);
  }

  createSalesItem({ newSalesItem }) {
    return this.salesItemService.createSalesItem(newSalesItem);
  }

  deleteSalesItem({ id }) {
    this.salesItemService.deleteSalesItem(id);
    return { id };
  }

  getResolvers() {
    return {
      Query: {
        salesItems: this.getSalesItems,
        salesItem: this.getSalesItem
      },
      Mutation: {
        createSalesItem: this.createSalesItem,
        deleteSalesItem: this.deleteSalesItem  
      },
      SalesItem: {
        images: this.getSalesItemImages
      }
    }
  }
}
```

You can use the above controller (and other possible controllers)
to bootstrap your GraphQL server:

_server.js_
```
import { merge } from 'lodash';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import GraphQlSalesItemController
  from './GraphQlSalesItemController.js';
// ...

const typeDefs = readFileSync('./schema.graphql',
                              { encoding: 'utf8' });

const resolvers = merge(
  {},
  [
    new GraphQlSalesItemController(),
    new GraphQlUserController(),
    new GraphQlOrderController()
  ].map(controller => controller.getResolvers())
);

const server = new ApolloServer({
  typeDefs,
  resolvers
});

startStandaloneServer(server, {
  listen: { port: 4000 }
});
```

In a GraphQL schema, you can add parameters for a primitive (scalar) property, also. That is useful for implementing conversions.

For example, we could define the `SalesItem` type with a parameterized `price` property:

<div class="sourceCodeWithoutLabel">

```
enum Currency {
  USD,
  GBP,
  EUR,
  JPY
}

type SalesItem {
  id: ID!
  createdAtTimestampInMillis: String!
  name: String!
  price(currency: Currency = USD): Float!
  images(
    sortByField: String = "rank",
    sortDirection: SortDirection = ASC,
    offset: Int = 0,
    limit: Int = 5
  ): [Image!]!
}
```
</div>

Now clients can supply a currency parameter for the `price` property in their queries to get the price in different currencies.
The default currency is _USD_ if no currency parameter is supplied.

Below are two example queries that a client could perform against the earlier defined GraphQL schema:

<div class="sourceCodeWithoutLabel">

```
{   
  # gets the name, price in euros and the first 5 images
  # for the sales item with id "1"
  salesItem(id: "1") {
    name
    price(currency: EUR)
    images
  }
  
  # gets the next 5 images for the sales item 1
  salesItem(id: "1") {
    images(offset: 5)
  }
}
```
</div>

In real life, consider limiting the fetching of resources only to the previous or the next page (or the next page only
if you are implementing infinite scrolling on the client side). Then, clients cannot fetch random pages. This prevents
attacks where a malicious user tries to fetch pages with huge page numbers (like 10,000, for example) which can
cause extra load for the server or, at the extreme, a denial of service.

Below is an example where clients can only query the first, next, or previous page. When a client requests the first page,
the page cursor can be empty, but when the client requests the previous or the next page, it must give the current page cursor
as a query parameter.

<div class="sourceCodeWithoutLabel">

```
type PageOfSalesItems {
  # Contains the page number encrypted and
  # encoded as a Base64 value.
  pageCursor: String!
  
  salesItems: [SalesItem!]!
}

enum Page {
  FIRST,
  NEXT,
  PREVIOUS
}

type Query {
  pageOfSalesItems(
    page: Page = FIRST,
    pageCursor: String = ""
  ): PageOfSalesItems!
}
```
</div>

In the above GraphQL examples, we did not implement user input validation. Validation is required in production code. You can manually add validation logic to each resolver function, and if input parameters are not valid, you
can throw a validation error from the resolver.

Then you can use the _type-graphql_
NPM library that allows you to write a GraphQL schema using TypeScript classes with decorator-based validation. Below is the `NewSalesItem` input type from the earlier GraphQL schema represented as a TypeScript class with validation decorators from the _class-validator_ library. When using the _type-graphql_ library, you don't have to write validation logic to each resolver function separately.
Validation is handled by the _class-validator_ library transparently, and your code will be cleaner. The _type-graphql_ library works
with most GraphQL server implementations, like _express-graphql_ or _apollo-server_.

_NewSalesItem.ts_
```
import { Field, InputType } from 'type-graphql';
import InputImage from './InputImage';

@InputType()
export default class InputSalesItem {
  @Field()
  name: string;

  @Field()
  price: number;

  @Field()
  images: InputImage[];
}
```

Instead of _type-graphql_, you can use the Nest.js web framework. It also allows you to define a GraphQL schema
using TypeScript classes and validation decorators. The above and below examples
are identical, except that some decorators are imported from a different library.

_NewSalesItem.ts_
```
import { Field, Int, InputType } from '@nestjs/graphql';
import InputImage from './InputImage';

@InputType()
export class InputSalesItem {
  @Field()
  name: string;

  @Field()
  price: number;
  
  images: InputImage[];
}
```

Both with _type-graphql_ and Nest.js, you don't specify a controller for GraphQL queries and mutations. You specify
resolver classes that are used to compose the final root resolver for the GraphQL API. Below is an example Nest.js
resolver:

_SalesItemResolver.ts_
```ts
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
// ...

@Resolver(of => SalesItem)
export class SalesItemResolver {
  constructor(
    private salesItemService: SalesItemService,
    private salesItemImageService: SalesItemImageService
  ) {}

  @Query(returns => SalesItem)
  async salesitem(@Args('id', { type: () => Int }) id: number) {
    return this.salesItemService.getSalesItem(id);
  }

  @ResolveField()
  async images(@Parent() salesItem: SalesItem) {
    return this.salesItemImageService
      .getSalesItemImages(salesItem.id);
  }
}
```

### Subscription-Based API Design 

> Design a subscription-based API when you want clients to be able to subscribe to small, incremental changes to large objects or when clients want to receive low-latency real-time updates.

#### Server-Sent Events (SSE)

Server-Sent Events (SSE) is a uni-directional push technology enabling a client to receive updates from a server via an
HTTP connection.

Let's showcase the SSE capabilities with a real-life example. The below example defines a _subscribe-to-loan-application-summaries_ API endpoint  
for clients to subscribe to loan application summaries. A client will show loan application summaries in a list view in its UI.
Whenever there is a new summary for a loan application available, the server will send a loan application summary event
to clients that will update their UIs by adding a new loan application summary.

_server.js_
```
import express from 'express';
import bodyParser from 'body-parser';
import loanApplicationSummariesSubscriptionHandler 
  from './loanApplicationSummariesSubscriptionHandler.js';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/subscribe-to-loan-application-summaries',
        loanApplicationSummariesSubscriptionHandler);
        
app.listen(3001);
```

_subscribers.js_
```
import { v4 as uuidv4 } from 'uuid';

export let subscribers = [];

export function addSubscriber(response) {
  const id = uuidv4();

  const subscriber = {
    id,
    response
  };

  subscribers.push(subscriber);
  return id;
}

export function removeSubscriber(id) {
  subscribers = subscribers.filter((subscriber) =>
    subscriber.id !== id);
}
```

_loanApplicationSummariesSubscriptionHandler.js_
```
import { 
  addSubscriber,
  removeSubscriber
} from './subscribers.js';

export default function
loanApplicationSummariesSubscriptionHandler(request, response) {
  // Response headers needed for SSE:
  // - Server sent events are identified with
  //   content type 'text/event-stream'
  // - The connection must be kept alive so that server
  //   can send continuously data to client
  // - Server sent events should not be cached
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
    // For dev environment you can add CORS header:
    'Access-Control-Allow-Origin': '*'
  };
  
  response.writeHead(200, headers);
  
  // Server sent event must be a string beginning with 'data: '
  // and ending with two newline characters
  // First event is empty
  const data = 'data: \n\n';
  response.write(data);
  const subscriberId = addSubscriber(response);
  request.on('close', () => removeSubscriber(subscriberId));
}
```

The below `publishLoanApplicationSummary` function is called whenever the server receives a new loan application summary.
The server can receive loan application summaries as messages consumed from a message broker's topic. (This message
consumption part is not implemented here, but there is another example later in this chapter demonstrating how messages
can be consumed from a Kafka topic.)

_publishLoanApplicationSummary.js_
```
import { subscribers } from './subscribers.js';

export default function publishLoanApplicationSummary(
  loanApplicationSummary
) {
   // Send an event to each subscriber
   // Loan application summary data is converted to JSON
   // before sending the event
   // Server sent event must be a string beginning with 'data: '
   // and ending with two newline characters
   const data = JSON.stringify(loanApplicationSummary);
   subscribers.forEach(({ response }) =>
     response.write(`data: ${data}\n\n`));
}
```

Next, we can implement the web client and define the following React functional component:

_LoanApplicationSummaries.jsx_
```
import React, { useEffect, useState } from 'react';

export default function LoanApplicationSummaries() {
  const [ loanApplicationSummaries,
          setLoanApplicationSummaries ] = useState([]);

  // Define an effect to be executed on component mount
  useEffect(() => {
    // Create new event source
    // Hardcoded dev environment URL is used here for demonstration
    // purposes
    const eventSource =
      new EventSource('http://localhost:3001/subscribe-to-loan-application-summaries');
  
    // Listen to server sent events and add a new 
    // loan application summary to the head of
    // loanApplicationSummaries array
    eventSource.addEventListener('message', (messageEvent) => {
      try {
        const loanApplicationSummary =
          JSON.parse(messageEvent.data);
          
        if (loanApplicationSummary) {
          setLoanApplicationSummaries([loanApplicationSummary,
                                    ...loanApplicationSummaries]);
        }
      } catch {
        // Handle error
      }
    });
      
    
    eventSource.addEventListener('error', (errorEvent) => {
      // Handle error
    });
      
    // Close the event source on component unmount
    return function cleanup() { eventSource.close(); }
  }, [loanApplicationSummaries]);

  // Render loan application summary list items 
  const loanApplicationSummaryListItems =
    loanApplicationSummaries.map(({ ... }) =>
       (<li key={key here...}>render here...</li>)); 
  
  return (
    <ul>{loanApplicationSummaryListItems}</ul>
  );
}
```

#### GraphQL Subscriptions

Let's have an example of a GraphQL subscription. The below GraphQL schema defines one
subscription for a post's comments. It is not relevant what a post is. It can be a blog post or
social media post, for example. We want a client to be able to subscribe to a post's comments.

<div class="sourceCodeWithoutLabel">

```
type PostComment {
  id: ID!,
  text: String!  
}
  
type Subscription {
  postComment(postId: ID!): PostComment
}
```
</div>

On the client side, we can define a subscription named `postCommentText` that subscribes to
a post's comments and returns the text property of comments:

<div class="sourceCodeWithoutLabel">

```
import { gql } from '@apollo/client';

const POST_COMMENT_SUBSCRIPTION = gql`
  subscription postCommentText($postId: ID!) {
    postComment(postID: $postId) {
      text
    }
  }
`;
```
</div>

If a client executes the above query for a particular post (defined with the `postId` parameter), the following kind
of response can be expected:

<div class="sourceCodeWithoutLabel">

```
{
  "data": {
    "postComment": {
      "text": "Nice post!"
    }
  }
}
```
</div>

To be able to use GraphQL subscriptions, you must implement support for them both on the server and client side. For the server side,
you can find instructions for the _Apollo server_ here: [https://www.apollographql.com/docs/apollo-server/data/subscriptions/#enabling-subscriptions](https://www.apollographql.com/docs/apollo-server/data/subscriptions/#enabling-subscriptions).
And for the client side, you can find instructions for the _Apollo client_ here: [https://www.apollographql.com/docs/react/data/subscriptions/#setting-up-the-transport](https://www.apollographql.com/docs/react/data/subscriptions/#setting-up-the-transport)

After the server and client-side support for subscriptions are implemented, you can use the subscription in your React component:

_SubscribedPostCommentsView.jsx_
```
import { useState } from 'react';
import { gql, useSubscription } from '@apollo/client';

const POST_COMMENT_SUBSCRIPTION = gql`
  subscription subscribeToPostComment($postId: ID!) {
    postComment(postID: $postId) {
      id  
      text
    }
  }
`;

export default function SubscribedPostCommentsView({ postId }) {
  const [ postComments, setPostComments ] = useState([]);
  
  const { data } = useSubscription(POST_COMMENT_SUBSCRIPTION,
                                   { variables: { postId } });
  
  if (data?.postComment) {
    setPostComments([...postComments, data.postComment]);
  }
  
  const postCommentListItems = 
    postComments.map(( { id, text }) =>
      (<li key={id}>{text}</li>));
   
  return <ul>{postCommentListItems}</ul>;
}
```

#### WebSocket Example

Below is a chat messaging application consisting of a WebSocket server implemented with Node.js and the _ws_ NPM library, and a WebSocket client implemented with React. There can be multiple instances of the server
running. These instances are stateless except for storing WebSocket connections for locally connected clients. First, we list the source code files for the server side.

A new Kafka client is created using the _kafkajs_ NPM library:

_kafkaClient.js_
```
import { Kafka } from 'kafkajs';

const kafkaClient = new Kafka({
  clientId: 'app-y',
  brokers: [process.env.KAFKA_BROKER],
});

export default kafkaClient;
```

A new Redis client is created using the _ioredis_ NPM library:

_redisClient.js_
```
import Redis from 'ioredis';

const redisClient = new Redis({
  port: parseInt(process.env.REDIS_PORT, 10),
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME, 
  password: process.env.REDIS_PASSWORD
});

export default redisClient;
```

The below `KafkaMessageBrokerAdminClient` class is used to create topics in Kafka:

_KafkaMessageBrokerAdminClient.js_
```
export default class KafkaMessageBrokerAdminClient {
  kafkaAdminClient;
  
  constructor(kafkaClient) {
    this.kafkaAdminClient = kafkaClient.admin();
  }
  
  async create(topic) {
    try { 
      await this.kafkaAdminClient.connect();
     
      await this.kafkaAdminClient.createTopics({
        topics: [{ topic }]
      });
     
      await this.kafkaAdminClient.disconnect();
    } catch {
      // Handle error
    }
  }
}
```

Users of the chat messaging application are identified with phone numbers. On the server side, we store the WebSocket connection for each user in the `phoneNbrToWsConnectionMap`:

_phoneNbrToWsConnectionMap.js_
```
const phoneNbrToWsConnectionMap = new Map();
export default phoneNbrToWsConnectionMap;
```

The below `WebSocketChatMessagingServer` class handles the construction of a WebSocket server. The server accepts connections from clients. When it receives a chat message from a client, it will first parse and validate it. If the received chat message is a special online
indication message, the server will register a new user. For an actual chat message, the server will store
the message in persistent storage (using a separate _chat-message-service_ REST API, not implemented here). The server gets the recipient's server information from a Redis cache and sends the chat message to the recipient's WebSocket connection or produces the chat message to a Kafka topic where
another server instance can consume the chat message and send it to the recipient's WebSocket connection. The Redis cache stores
a hash map where the users' phone numbers are mapped to the server instance they are currently connected. A UUID identifies a server instance.

_WebSocketChatMessagingServer.js_
```
import { WebSocketServer } from 'ws';
import kafkaClient from './kafkaClient.js';
import redisClient from './redisClient.js';

import phoneNbrToWsConnectionMap
  from './phoneNbrToWsConnectionMap.js';

import KafkaMessageBrokerProducer
  from './KafkaMessageBrokerProducer.js';

export default class WebSocketChatMessagingServer {
  wsServer;
  serverUuid;
  messageBrokerProducer;
  wsConnectionToPhoneNbrMap = new Map();

  constructor(serverInstanceUuid) {
    this.serverUuid = serverUuid;
    
    this.messageBrokerProducer =
      new KafkaMessageBrokerProducer(kafkaClient);

    this.wsServer = new WebSocketServer({ port: 8080 });

    this.wsServer.on('connection', wsConnection => {
      wsConnection.on('message', async (chatMessageJson) => {
        const chatMessage = this.parse(chatMessageJson);

        if (chatMessage) {
          const messageIsOnlineIndicator =
            chatMessage.message === 'online' &&
            !chatMessage.recipientPhoneNbr;

          if (messageIsOnlineIndicator) {
            await this.handleOnlineIndication(
              wsConnection,
              chatMessage.senderPhoneNbr
            );
          } else {
            this.store(chatMessage);

            const recipientServerUuid =
              await this.getServerUuid(
                chatMessage.recipientPhoneNbr
              );
              
            this.send(chatMessage, recipientServerUuid);
          }
        }
      });

      wsConnection.on('close', () => {
        this.close(wsConnection);
      });
    });
  }

  closeServer() {
    this.wsServer.close();
    this.wsServer.clients.forEach(client => client.close());
    this.messageBrokerProducer.close();
  }

  parse(chatMessageJson) {
    return (() => {
      try {
        const chatMessage = JSON.parse(chatMessageJson);
        // Validate chatMessage properties here
        return chatMessage;
      } catch {
        return '';
      }
    })();
  }

  async handleOnlineIndication(
    wsConnection,
    senderPhoneNbr
  ) {
    phoneNbrToWsConnectionMap.set(
      senderPhoneNbr,
      wsConnection
    );

    this.wsConnectionToPhoneNbrMap.set(
      wsConnection,
      senderPhoneNbr
    );

    try {
      await redisClient.hset(
        'phoneNbrToServerUuidMap',
        senderPhoneNbr,
        this.serverUuid
      );
    } catch {
      // Handle error
    }
  }

  store(chatMessage) {
    fetch('http://.../chat-message-service/chat-messages',
      { method: 'post', 
        body: JSON.stringify(chatMessage)
      })
      .catch(() => {
        // Handle error
      });
  }

  async getServerUuid(phoneNbr) {
    try {
      return
        await redisClient.hget(
          'phoneNbrToServerUuidMap',
           phoneNbr
        );
    } catch {
      return undefined;
    }
  }

  send(chatMessage, serverUuid) {
    if (serverUuid === this.serverUuid) {
      // Recipient has active connection on
      // the same server instance as sender
      const recipientWsConnection =
        phoneNbrToWsConnectionMap
          .get(chatMessage.recipientPhoneNbr);

      recipientWsConnection?
        .send(JSON.stringify(chatMessage));

    } else if (serverUuid) {
      // Recipient has active connection on different
      // server instance compared to sender
      const serverTopic = serverUuid;
       
      this.messageBrokerProducer
        .produce(chatMessage, serverTopic);
    }
  }

  async close(wsConnection) {
    const phoneNbr =
      this.wsConnectionToPhoneNbrMap
        .get(wsConnection);

    phoneNbrToWsConnectionMap.delete(phoneNbr);
    this.wsConnectionToPhoneNbrMap.delete(wsConnection);
    
    try {
      await redisClient.hdel('phoneNbrToServerUuidMap',
                             phoneNbr);
    } catch {
      // Handle error
    }
  }
}
```

_KafkaMessageBrokerProducer.js_
```
export default class KafkaMessageBrokerProducer {
  kafkaProducer;

  constructor(kafkaClient) {
    this.kafkaProducer = kafkaClient.producer();
  }

  async produce(chatMessage, topic) {
    try {
      await this.kafkaProducer.connect();
      await this.kafkaProducer.send({
        topic,
        messages: [{ value: JSON.stringify(chatMessage) }],
      });
    } catch {
      // Handle error
    }
  }

  async close() {
    try {
      this.isTerminating = true;
      await this.kafkaProducer.disconnect();
    } catch {
    }
  }
}
```

The `KafkaMessageBrokerConsumer` class defines a Kafka consumer that consumes chat messages from
a particular Kafka topic and sends them to the recipient's WebSocket connection:

_KafkaMessageBrokerConsumer.js_
```
import phoneNbrToWsConnectionMap 
  from './phoneNbrToWsConnectionMap.js';

export default class KafkaMessageBrokerConsumer {
  kafkaConsumer;
  
  constructor(kafkaClient) {
    this.kafkaConsumer =
      kafkaClient.consumer({ groupId: 'app-y' });
  }
  
  async consumeChatMessages(topic) {
    await this.kafkaConsumer.connect();
    await this.kafkaConsumer.subscribe({ 
      topic,
      fromBeginning: true 
    });
    
    this.kafkaConsumer.run({
      eachMessage: async ({ message }) => {
        try {
          const chatMessage =
            JSON.parse(message.value.toString());
            
          const recipientWsConnection =
            phoneNbrToWsConnectionMap
              .get(chatMessage.recipientPhoneNbr);
            
          recipientWsConnection?
            .send(JSON.stringify(chatMessage));
        } catch {
          // Handle error
        }
      },
    });
  }
  
  async close() {
    try {
      await this.kafkaConsumer.disconnect();
    } catch 
    {}
  }
}
```

Finally, we put it all together in the index.js file:

_index.js_
```
import { v4 as uuidv4 } from 'uuid';
import kafkaClient from './kafkaClient.js';

import KafkaMessageBrokerAdminClient 
  from './KafkaMessageBrokerAdminClient.js';
    
import KafkaMessageBrokerConsumer
  from './KafkaMessageBrokerConsumer.js';
  
import WebSocketChatMessagingServer
  from './WebSocketChatMessagingServer.js';

// Generate a unique id for this particular server instance
const serverUuid = uuidv4(); 
const serverTopic = serverUuid;

// Create a Kafka topic for this particular microservice instance
await new KafkaMessageBrokerAdminClient(kafkaClient)
  .create(serverTopic); 

// Create the chat messaging service for 
// handling WebSocket connections
const chatMessagingServer =
  new WebSocketChatMessagingServer(serverUuid);

// Create and start a Kafka consumer to consume and send 
// chat messages for recipients that are connected to 
// this microservice instance
const messageBrokerConsumer =
  new KafkaMessageBrokerConsumer(kafkaClient);
  
messageBrokerConsumer.consumeChatMessages(serverTopic);

// Close the Web Socket server and Kafka consumer before exiting
function prepareExit() {
  chatMessagingServer.closeServer();
  messageBrokerConsumer.close();
}

// Handle signals and prepare for the process exit
process.once('SIGINT', prepareExit);
process.once('SIGQUIT', prepareExit);
process.once('SIGTERM', prepareExit);
```

For the web client, we have the below code. An instance of the `ChatMessagingService` class connects to
a chat messaging server via WebSocket. It listens to messages received from the server and dispatches an action upon
receiving a chat message. The class also offers a method for sending a chat message to the server.

_ChatMessagingService.js_
```
import store from "./store";

class ChatMessagingService {
  wsConnection;
  connectionIsOpen = false;
  lastChatMessage;

  constructor(dispatch, userPhoneNbr) {
    this.wsConnection = new WebSocket('ws://localhost:8080');

    this.wsConnection.addEventListener('open', () => {
      this.connectionIsOpen = true;

      const onlineMessage = {
        message: 'online',
        senderPhoneNbr: userPhoneNbr
      };

      this.wsConnection.send(JSON.stringify(onlineMessage));
    });

    this.wsConnection.addEventListener('error', () => {
      this.lastChatMessage = null;
    });

    this.wsConnection.addEventListener(
      'message',
      ({ data: chatMessageJson }) => {
        const chatMessage = JSON.parse(chatMessageJson);

        store.dispatch({
          type: 'receivedChatMessageAction',
          chatMessage
        });
      });

    this.wsConnection.addEventListener('close', () => {
      this.connectionIsOpen = false;
    });
  }

  send(chatMessage) {
    this.lastChatMessage = chatMessage;

    if (this.connectionIsOpen) {
        this.wsConnection.send(JSON.stringify(chatMessage));
    } else  {
      // Send message to REST API
    }
  }

  close() {
    this.connectionIsOpen = false;
    this.wsConnection.close();
  }
}

export let chatMessagingService;

export default function createChatMessagingService(
  userPhoneNbr
) {
  chatMessagingService =
    new ChatMessagingService(store.dispatch, userPhoneNbr);
    
  return chatMessagingService;
}
```

_index.jsx_
```
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'
import ChatApp from './ChatApp';
import store from './store'
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <ChatApp/>
  </Provider>
);
```

The chat application parses the user's and contact's phone numbers from the URL and then
renders a chat view between the user and the contact:

_ChatApp.jsx_
```
import React, { useEffect } from 'react';
import queryString from "query-string";
import ContactChatView from "./ContactChatView";
import createChatMessagingService from "./ChatMessagingService";

const { userPhoneNbr, contactPhoneNbr } =
  queryString.parse(window.location.search);

export default function ChatApp() {
  useEffect(() => {
    const chatMessagingService =
      createChatMessagingService(userPhoneNbr);

    return function cleanup() {
      chatMessagingService.close();
    }
  }, []);

  return (
    <div>
      User: {userPhoneNbr}
      <ContactChatView 
        userPhoneNbr={userPhoneNbr} 
        contactPhoneNbr={contactPhoneNbr}
      />
    </div>
  );
}
```

The `ContactChatView` component renders chat messages between a user and a contact:

_ContactChatView.jsx_
```
import React, { useEffect, useRef } from 'react';
import { connect } from "react-redux";
import store from './store';

function ContactChatView({ 
  userPhoneNbr,
  contactPhoneNbr,
  chatMessages,
  fetchLatestChatMessages
}) {
  const inputElement = useRef(null);
    
  useEffect(() => {
    fetchLatestChatMessages(userPhoneNbr, contactPhoneNbr);
  }, [contactPhoneNbr,
      fetchLatestChatMessages,
      userPhoneNbr]
  );
  
  function sendChatMessage() {
    if (inputElement?.current.value) {
      store.dispatch({
        type: 'sendChatMessageAction',
        chatMessage: {
          senderPhoneNbr: userPhoneNbr,
          recipientPhoneNbr: contactPhoneNbr,
          message: inputElement.current.value
        }
      });
    }
  }
    
  const chatMessageElements = chatMessages
    .map(({ message, senderPhoneNbr }, index) => {
      const messageIsReceived = 
        senderPhoneNbr === contactPhoneNbr;
        
      return (
        <li 
          key={index}
          className={messageIsReceived ? 'received' : 'sent'}>
            {message}
        </li>
      );  
    });
  
  return (
    <div className="contactChatView">
      Contact: {contactPhoneNbr}
      <ul>{chatMessageElements}</ul>
      <input ref={inputElement}/>
      <button onClick={sendChatMessage}>Send</button>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    chatMessages: state
  };
}

export default connect(mapStateToProps)(ContactChatView);
```

_store.js_
```
import { createStore } from 'redux';
import { chatMessagingService } from "./ChatMessagingService";

function chatMessagesReducer(state = [], { type, chatMessage }) {
  switch (type) {
    case 'receivedChatMessageAction':
      return state.concat([chatMessage]);
    case 'sendChatMessageAction':
      chatMessagingService.send(chatMessage);
      return state.concat([chatMessage]);
    default:
      return state;
  }
}

const store = createStore(chatMessagesReducer)
export default store;
```

_index.css_
```
.contactChatView {
  width: 420px;
}

.contactChatView ul {
  padding-inline-start: 0;
  list-style-type: none;
}

.contactChatView li {
  margin-top: 15px;
  width: fit-content;
  max-width: 180px;
  padding: 10px;
  border: 1px solid #888;
  border-radius: 20px;
}

.contactChatView li.received {
  margin-right: auto;
}

.contactChatView li.sent {
  margin-left: auto;
}
```

![Fig 7.1 Chat Messaging Application Views for Two Users](images/Capture1.PNG)

![Fig 7.2 Chat Messaging Application Views for Two Users](images/Capture2.PNG)

## Inter-Microservice API Design Principles

Inter-microservice APIs can be divided into two categories based on the type of communication: synchronous and asynchronous.
Synchronous communication should be used when an immediate response to an issued request is expected. Asynchronous
communication should be used when no response to a request is expected, or the response is not immediately required.

### Synchronous API Design Principle

> Use HTTP-based RPC, REST, or GraphQL APIs with JSON data encoding, preferably with HTTP/2 or HTTP/3 transport when requests
> and responses are not very large and do not contain much binary data. If you have large requests or responses or a lot of binary data,
> you are better off encoding the data in _Avro_ binary format  (Content-Type: avro/binary) instead of JSON or using a gRPC-based API.
> gRPC always encodes data in a binary format (Protocol Buffers).

##### gRPC-Based API Design Example

Let's have an example of a gRPC-based API. First, we must define the needed Protocol Buffers types.
They are defined in a file named with the extension _.proto_. The syntax of _proto_ files is pretty simple. We define
the service by listing the remote procedures. A remote procedure is defined with the following syntax:
`rpc <procedure-name> (<argument-type>) returns (<return-type>) {}`. A type is defined with the below syntax:

<div class="sourceCodeWithoutLabel">

```
message <type-name> {
  <field-type> <field-name> [= <field-index>];
  ...
}
```
</div>

_salesItemService.proto_
```
syntax = "proto3";

option java_multiple_files = true;
option java_package = "com.silensoft.salesitemservice";
option java_outer_classname = "SalesItemServiceProto";
option objc_class_prefix = "SIS";

package salesitemservice;

service SalesItemService {
  rpc createSalesItem (NewSalesItem) returns (SalesItem) {}
  rpc getSalesItems(Nothing) returns (SalesItems) {}
  rpc getSalesItem (Id) returns (SalesItem) {}
}

message Nothing {}

message NewSalesItem {
  string name = 1;
  float price = 2;
}

message SalesItem {
  uint64 id = 1;
  uint64 createdAtTimestampInMillis = 2;
  string name = 3;
  float price = 4;
}

message Id {
  uint64 id = 1;
}

message SalesItems {
  repeated SalesItem salesItem = 1;
}
```

Below is a partial implementation of the gRPC server. We have only implemented the `createSalesItem` procedure.

_SalesItemServiceServer.java_

<code class="sourceCodeWithoutLabel">

```
package com.silensoft.salesitemservice;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.StreamObserver;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import lombok.Log;
        
@Log
public class SalesItemServiceServer {
  private Optional<Server> maybeGrpcServer;

  private void start() throws IOException {
    maybeGrpcServer = Optional.of(ServerBuilder.forPort(50051)
      .addService(new SalesItemServiceImpl())
      .build());
    
    maybeGrpcServer.get().start();
    logger.info("Server started, listening on port: " + port);
    
    Runtime.getRuntime().addShutdownHook(new Thread() {
      @Override
      public void run() {
        try {
          stop();
        } catch (final InterruptedException exception) {
          exception.printStackTrace(System.err);
        }
          
        System.err.println("Server shut down");
      }
    });
  }

  private void stop() throws InterruptedException {
    maybeGrpcServer
      .ifPresent(grpcServer -> 
        grpcServer
          .shutdown()
          .awaitTermination(30, TimeUnit.SECONDS));
  }
  
  private void waitUntilTerminated() throws InterruptedException {
    maybeGrpcServer.ifPresent(Server::awaitTermination);
  }
  
  public static void main(
    final String[] args
  ) throws IOException, InterruptedException {
    final var server = new SalesItemServiceServer();
    server.start();
    server.waitUntilTerminated();
  }

  static class SalesItemServiceImpl 
                 extends SalesItemServiceGrpc.ImplBase {
    @Override
    public void createSalesItem(
      final NewSalesItem salesItem,
      final StreamObserver<SalesItem> responseObserver
    ) {
      // Set createdAtTimestamp value on salesItem to be now  
      // Insert sales item to database and return 'id'

      salesItem.id = id;
      responseObserver.onNext(salesItem);
      responseObserver.onCompleted();
    }
  }
}
```

Below is the gRPC client implementation for the above gRPC server:

_SalesItemServiceClient.java_
```
package com.silensoft.salesitemservice;

import io.grpc.Channel;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import lombok.Log;

@Log
public class SalesItemServiceClient {
  private final SalesItemServiceGrpc.SalesItemServiceBlockingStub salesItemService;
  
  public SalesItemServiceClient(final Channel channel) {
    salesItemService =
      SalesItemServiceGrpc.newBlockingStub(channel);
  }

  public SalesItem createSalesItem(final NewSalesItem salesItem) {
    try {
      return salesItemService.createSalesItem(salesItem);
    } catch (final StatusRuntimeException exception) {
       logger.log(Level.ERROR,
                  "CreateSalesItem failed: {0}",
                  exception.getStatus());
    }
  }
  
  public static void main(final String[] args) throws Exception {
    final var channel = ManagedChannelBuilder
                          .forTarget("localhost:50051")
                          .usePlaintext()
                          .build();
    
    try {
      SalesItemServiceClient client =
        new SalesItemServiceClient(channel);
        
      client.createSalesItem(...);
    } finally {
      channel.shutdownNow().awaitTermination(5, TimeUnit.SECONDS);
    }
  }
}
```

### Asynchronous API Design Principle

> Use asynchronous APIs when requests are request-only (fire-and-forget, i.e., no response is expected) or when the response 
> is not immediately expected.

#### Request-Only Asynchronous API Design

In request-only asynchronous APIs, the request sender does not expect a response. Such APIs are typically
implemented using a message broker. The request sender will send a JSON format request to a topic in the message broker,
where the request recipient consumes the request asynchronously.

Different API endpoints can be specified in a request using a `procedure` property,  for example. You can name the `procedure` property as you wish, e.g.
`action`, `operation`, `apiEndpoint` etc.
Parameters for the procedure can be supplied in a `parameters` property.
Below is an example request in JSON:

<div class="sourceCodeWithoutLabel">

```
{
  "procedure": "<procedure name>",
  "parameters": {
    "parameterName1": <parameter value>,
    "parameterName2": <parameter value>,
    // ...
  }
}
```
</div>

Let's have an example with an email-sending microservice that implements a request-only asynchronous API
and handles sending of emails. We start by defining a message broker topic for the microservice. The topic should
be named after the microservice, for example: _email-sending-service_

In the _email-sending-service_, we define the following request schema for an API endpoint that
sends an email:

<div class="sourceCodeWithoutLabel">

```
{
  "procedure": "sendEmailMessage",
  "parameters": {
    "fromEmailAddress": "...",
    "toEmailAddresses": ["...", "...", ...],
    "subject": "...",
    "message": "..."
  }
}
```
</div>

Below is an example request that some other microservice can produce to the _email-sending-service_ topic
in the message broker:

<div class="sourceCodeWithoutLabel">

```
{
  "procedure": "sendEmailMessage",
  "parameters": {
    "fromEmailAddress": "sender@domain.com",
    "toEmailAddresses": ["receiver@domain.com"],
    "subject": "Status update",
    "message": "Hi, Here is my status update ..."
  }
}
```
</div>

#### Request-Response Asynchronous API Design

A request-response asynchronous API microservice receives requests from other microservices and then produces
responses asynchronously. Request-response asynchronous APIs are typically implemented
using a message broker. The request sender will send a request to a topic where the request recipient consumes the request asynchronously and then produces a response or responses to a message broker topic or topics.
Each participating microservice should have a topic named after the microservice in the message broker.

The request format is the same as defined earlier, but
the response has a `response` property instead of the `parameters` property. Thus, responses have the following format:

<div class="sourceCodeWithoutLabel">

```
{
   "procedure": "<procedure name>",
   "response": {
     "propertyName1": <property value>,
     "propertyName2": <property value>,
     // ...
   }
}
```
</div>

Below is an example where a _loan-application-service_ requests a _loan-eligibility-assessment-service_
to assess loan eligibility. The _loan-application-service_ sends the following JSON-format request to
the message broker's _loan-eligibility-assessment-service_ topic:

<div class="sourceCodeWithoutLabel">

```
{
  "procedure": "assessLoanEligibility",
  "parameters": {
    "userId": 123456789012,
    "loanApplicationId": 5888482223,
    // Other parameters...
  }
}
```
</div>

The _loan-eligibility-assessment-service_ responds to the above request by sending the following JSON-format response to
the message broker's _loan-application-service_ topic:

<div class="sourceCodeWithoutLabel">

```
{
  "procedure": "assessLoanEligibility",
  "response": {
     "loanApplicationId": 5888482223,
     "isEligible": true,
     "amountInDollars": 10000,
     "interestRate": 9.75,
     "termInMonths": 120
  }
}
```
</div>

Below is an example response when the loan application is rejected:

<div class="sourceCodeWithoutLabel">

```
{
  "procedure": "assessLoanEligibility",
  "response": {
    "loanApplicationId": 5888482223,
    "isEligible": false
  }
}
```

</div>

Alternatively, request and response messages can be treated as events with some data. When we send events between
microservices, we have an _event-driven architecture_. Below are the earlier request and response messages written as events:

<div class="sourceCodeWithoutLabel">

```
{
  "event": "assessLoanEligibility",
  "data": {
    "userId": 123456789012,
    "loanApplicationId": 5888482223,
    // ...
  }
}
```
</div>

<div class="sourceCodeWithoutLabel">

```
{
  "event": "LoanApproved",
  "data": {
     "loanApplicationId": 5888482223,
     "isEligible": true,
     "amountInDollars": 10000,
     "interestRate": 9.75,
     "termInMonths": 120
  }
}
```

</div>

<div class="sourceCodeWithoutLabel">

```
{
  "procedure": "LoanRejected",
  "response": {
    "loanApplicationId": 5888482223,
    "isEligible": false
  }
}
```

</div>

