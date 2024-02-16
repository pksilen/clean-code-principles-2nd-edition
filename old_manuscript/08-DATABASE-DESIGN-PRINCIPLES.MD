# Databases And Database Principles

This chapter presents principles for selecting and using databases. Principles are presented for the following database types:

- Relational databases
- Document databases
- Key-value databases
- Wide column databases
- Search engines

Relational databases are also called SQL databases because accessing a relational database happens via issuing SQL statements.
Databases of the other database types are called NoSQL databases because they either don't support SQL at all or they support
only a subset of SQL, possibly with some additions and modifications.

## Relational Databases

> Relational databases are multipurpose databases that suit many needs. Choose a relational database if you are not aware
> of all the needs you have for a database.

For example, if you don't know what kind of database queries you need now or will need in the future, you should
consider using a relational database that is well-suited for different kinds of queries.

### Structure of Relational Database

Data in a relational database is organized in the following hierarchy:

- Logical databases/schemas
  - Tables
    - Columns

A table consists of columns and rows. Data in a database is stored as rows in the tables. Each row has
a value for each column in the table. If a row does not have a value for a particular column, then a special `NULL` value
is used. You can specify if null values are allowed for a column or not.

A microservice should have a single logical database (or schema).
Some relational databases have one logical database (or schema) available by default, and in other databases,
you must create a logical database (or schema) by yourself.

### Use Object Relational Mapper (ORM) Principle

> Use an object-relational mapper (ORM) to avoid the need to write SQL and to avoid making your microservice potentially vulnerable to SQL injection attacks. Use an ORM to get the database rows automatically mapped to objects that can be serialized to JSON.

Many languages have ORM frameworks. Java has Java Persistence API (JPA, the most famous implementation of which is Hibernate),
JavaScript/TypeScript has TypeORM, and Python has the Django framework, for example.

An ORM uses entities as building blocks for the database schema. Each entity class in a microservice is reflected as a table in the database. Use the same name for an entity and the database table, except the table name should
be plural. Below is an example of a `SalesItem` entity class:

_SalesItem.java_
```
@Entity
public class SalesItem {
  private Long id;
  private String name;
  private Integer price;
}
```

Store `SalesItem` entities in a table named `salesitems`. In this book, I use
case-insensitive database identifiers and write all identifiers in lowercase. The case sensitivity of a database
depends on the database and the operating system it is running on. For example, MySQL is case-sensitive only on Linux
systems.

The properties of an entity map to columns of the entity table, meaning that the `salesitems` table has
the following columns:

- id
- name
- price



Each entity table must have a primary key defined. The primary key must be unique for each row in the table.
In the below example, we are using the `@Id` annotation to define the `id` column as the primary key containing
a unique value for each row. The `@GeneratedValue` annotation defines that the database should automatically generate
a value for the `id` column using the supplied strategy.

_SalesItem.java_
```
@Entity
@Table(name = "salesitems")
public class SalesItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;
  private Integer price;
}
```

ORM can create database tables according to entity specifications in code. Below is
an example SQL statement for PostgreSQL that an ORM generates to create a table for storing `SalesItem` entities:

<div class="sourceCodeWithoutLabel">

```
CREATE TABLE salesitems (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  price INTEGER,
  PRIMARY KEY (id)
);
```
</div>

Columns of a table can be specified as unique and not nullable. By default, a column is nullable and is not unique.
Below is an example where we define that the `name` column in the `salesitems` table cannot have null values, and values
must be unique. We don't want to store sales items with null names, and we want to store sales items
having unique names.

_SalesItem.java_
```
@Entity
@Table(name = "salesitems")
public class SalesItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
    
  @Column(unique=true, nullable=false)
  private String name;
    
  private Integer price;
}
```

When you have a `SalesItem` entity, you can persist it with an instance of JPA's `EntityManager`:

<div class="sourceCodeWithoutLabel">

```
entityManager.persist(salesItem);
```
</div>

JPA will generate the needed SQL statement on your behalf and execute it.
Below is an example SQL statement generated by the ORM to persist a sales item (Remember that the database autogenerates the `id` column).

<div class="sourceCodeWithoutLabel">

```
INSERT INTO salesitems (name, price)
VALUES ('Sample sales item', 10);
```
</div>

You can search for the created sales item in the database (assuming here that we have a `getId` getter defined):

<div class="sourceCodeWithoutLabel">

```
entityManager.find(SalesItem.class, salesItem.getId());
```
</div>

For the above operation, the ORM will generate the following SQL query:

<div class="sourceCodeWithoutLabel">

```
SELECT id, name, price FROM salesitems WHERE id = 1;
```
</div>

Then you can modify the entity and merge it with the entity manager to update the database:

<div class="sourceCodeWithoutLabel">

```
salesItem.setPrice(20);
entityManager.merge(salesItem);
```
</div>

Finally, you can delete the sales item with the entity manager:

<div class="sourceCodeWithoutLabel">

```
entityManager.remove(salesItem);
```
</div>

The ORM will execute the following SQL statement:

<div class="sourceCodeWithoutLabel">

```
DELETE FROM salesitems WHERE id = 1;
```
</div>

Suppose your microservice executes SQL queries that do not include the primary key column in the
query's WHERE clause. In that case, the database engine must perform a full table scan to find the wanted rows. Let's say
you want to query sales items, the price of which is less than 10. This can be achieved with
the below query:

<div class="sourceCodeWithoutLabel">

```
// final var price = ...

final TypedQuery<SalesItem> salesItemsQuery = entityManager
 .createQuery("SELECT s FROM salesitems s WHERE s.price < :price",
              SalesItem.class);

usersSalesItemsQuery.setParameter("price", price);

final List<SalesItem> salesItems = salesItemsQuery.getResultList();
```
</div>

The database engine must perform a full table scan to find all the sales items where the `price` column has
a value below the `price` variable's value. If the database is large, this can be slow. If you
perform the above query often, you should optimize those queries by creating an index. For the above
query to be fast, we must create an index for the `price` column using the `@Index` annotation inside the
`@Table` annotation:

_SalesItem.java_
```
@Entity
@Table(
  name = "salesitems",
  indexes = @Index(columnList = "price")
)
public class SalesItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
    
  @Column(unique=true, nullable=false)
  private String name;
    
  private Integer price;
}
```

### Entity/Table Relationships

Tables in a relational database can have relationships with other tables. There are three types of relationships:

- One-to-one
- One-to-many
- Many-to-many

#### One-To-One/Many Relationships

In this section, we focus on one-to-one and one-to-many relationships. In a one-to-one relationship, a single row in a table can
have a relationship with another row in another table. In a one-to-many relationship, a single row in a table can
have a relationship with multiple rows in another table.

Let's have an example with an _order-service_ that can store orders in a database. Each order consists of one
or more order items. An order item contains information about the bought sales item.

<div class="sourceCodeWithoutLabel">

```
@Entity
@Table(name = "orders")
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  // Other order fields ...

  @OneToMany(mappedBy="order")
  private List<OrderItem> orderItems;
}

@Entity
@Table(name = "orderitems")
public class OrderItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @OneToOne
  @JoinColumn(name = "salesitemid")
  private SalesItem salesItem;

  @ManyToOne
  @JoinColumn(name = "orderid", nullable = false)
  private Order order;
}
```
</div>

Orders are stored in the `orders` table, and order items
are stored in the `orderitems` table, which contains a join column named `orderid`. Using this join column, we can map a particular
order item to a specific order. Each order item maps to exactly one sales item. For this reason, the `orderitems` table
also contains a join column named `salesitemid`. Using this join column, we can map an order item to a sales item.

Below is the SQL statement generated by the ORM for creating the `orderitems` table. The one-to-one and one-to-many relationships
are reflected in the foreign key constraints:

- `fksalesitem`: a `salesitemid` column value in the `orderitems` table references an `id` column value in the `salesitems` table
- `fkorder`: an `orderid` column value in the `orderitems` table references an `id` column value in the `orders` table

<div class="sourceCodeWithoutLabel">

```
CREATE TABLE orderitems (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  salesitemid BIGINT,
  orderid BIGINT,
  CONSTRAINT fksalesitem FOREIGN KEY (salesitemid)
    REFERENCES salesitems(id),
  CONSTRAINT fkorder FOREIGN KEY (orderid)
    REFERENCES orders(id)
);
```
</div>

The following SQL query is executed by the ORM to fetch the order with id 123 and its order items:

<div class="sourceCodeWithoutLabel">

```
SELECT o.id, s.name, ...
FROM orders o 
LEFT JOIN orderitems oi ON o.id = oi.orderid
LEFT JOIN salesitems s ON s.id = oi.salesitemid
WHERE o.id = 123;
```
</div>

#### Many-To-Many Relationships

In a many-to-many relationship, one entity has a relationship with many entities of another type, and those entities have
a relationship with many entities of the first entity type. For example, a student can attend many courses, and a course can have numerous students attending it.

Suppose we have a service that stores student and course entities in a database. Each student entity contains the courses the student has
attended. Similarly, each course entity contains a list of students that have attended the course. We have a many-to-many relationship where
one student can attend multiple courses, and multiple students can attend one course. This means an additional mapping table, `studentcourse,` must be created. This new table maps a particular student to a particular course. Below is the many-to-many relationship implemented with JPA:

<div class="sourceCodeWithoutLabel">

```
@Entity
@Table(name = "students")
class Student {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Other Student fields...

  @JoinTable(
    name = "studentcourse", 
    joinColumns = @JoinColumn(name = "studentid"), 
    inverseJoinColumns = @JoinColumn(name = "courseid")
  )
  @ManyToMany
  private List<Course> attendedCourses;
}

@Entity
@Table(name = "courses")
class Course {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Other Course fields...

  @ManyToMany(mappedBy = "attendedCourses")
  private List<Student> students;
}
```
</div>

The ORM creates the `students` and `courses` tables in addition to the `studentcourse` mapping table:

<div class="sourceCodeWithoutLabel">

```
CREATE TABLE studentcourse (
  studentid BIGINT,
  courseid BIGINT,
  CONSTRAINT fkstudent FOREIGN KEY (studentid)
    REFERENCES students(id),
  CONSTRAINT fkorder FOREIGN KEY (courseid)
    REFERENCES courses(id)
);
```
</div>

Below is an example SQL query that the ORM executes to fetch attended courses for the user identified with id 123:

<div class="sourceCodeWithoutLabel">

```
SELECT s.id, c.id, ...
FROM students s 
LEFT JOIN studentcourse sc ON s.id = sc.studentid
LEFT JOIN courses c ON c.id = sc.courseid
WHERE s.id = 123;
```
</div>

Below is an example SQL query that the ORM executes to fetch students for the course identified with id 123:

<div class="sourceCodeWithoutLabel">

```
SELECT c.id, s.id
FROM courses c
LEFT JOIN studentcourse sc ON c.id = sc.courseid
LEFT JOIN students s ON s.id = sc.studentid
WHERE c.id = 123;
```
</div>

In real-life scenarios, we don't necessarily have to or should implement many-to-many database relations inside a single microservice.
For example, the above service that handles students and courses is against the _single responsibility principle_. We should create a separate microservice for students and a separate microservice for courses. Then there won't be
many-to-many relationships between database tables in a single microservice.

### Use Parameterized SQL Statements Principle

> If you are not using an ORM for database access, use parameterized SQL statements to prevent potential SQL injection attacks.

Let's use Node.js and the _mysql_ NPM library for parameterized SQL examples. First, let's insert data to the `salesitems` table:

<div class="sourceCodeWithoutLabel">

```
// Create a connection...

connection.query(
  `INSERT INTO salesitems (name, price)
   VALUES (?, ?)`,
  ['Sample sales item', 10]
);
```
</div>

The question marks (?) are placeholders for parameters in a parameterized SQL query. The second argument to the `query`
method contains the parameter values. When a database engine receives a parameterized query, it will replace the placeholders in the query
with the supplied parameter values.

Next, we can update a row in the `salesitems` table. The below example changes the price of the sales item with id 123 to 20:

<div class="sourceCodeWithoutLabel">

```
connection.query('UPDATE salesitems SET price = ? WHERE id = ?',
                  [20, 123]);
```
</div>

Let's execute a SELECT statement to get sales items with their price over 20:

<div class="sourceCodeWithoutLabel">

```
connection.query(
  'SELECT id, name, price FROM salesitems WHERE price >= ?',
  [20]
);
```
</div>

In an SQL SELECT statement, you cannot use parameters everywhere. You can use them as value placeholders
in the WHERE clause. If you want to use user-supplied data in other parts of an SQL SELECT statement, you
need to use string concatenation. You should not concatenate user-supplied data without sanitation because that
would open up possibilities for SQL injection attacks. Let's say you allow the microservice client to specify a sorting column:

<div class="sourceCodeWithoutLabel">

```
const sortColumn = // Unvalidated data got from client
const sqlQuery =
  'SELECT id, name, price FROM salesitems ORDER BY ' +
  connection.escapeId(sortColumn);

connection.query(sqlQuery);
```
</div>

As shown above, you need to escape the `sortColumn` value so that it contains only valid characters
for a MySQL column name. If you need to get the sorting direction from the client, you should validate
that value to be either `ASC` or `DESC`. In the below example, we assume that a `validateSortDirection` function
exists:

<div class="sourceCodeWithoutLabel">

```
const sortColumn = // Unvalidated data got from client
const sortDirection = // Unvalidated data got from client

// throws if invalid sorting direction
const validatedSortDirection =
  validateSortDirection(sortDirection); 

const sqlQuery = `
  SELECT id, name, price
  FROM salesitems
  ORDER BY 
  ${connection.escapeId(sortColumn)}
  ${validatedSortDirection}
`;

connection.query(sqlQuery);
```
</div>

When you get values for a MySQL query's `LIMIT` clause from a client, you must validate that those values are
integers and in a valid range. Don't allow the client to supply random, very large values. In the example below, we assume
that two validation functions exist: `validateRowOffset` and `validateRowCount`. The validation functions will throw if
validation fails.

<div class="sourceCodeWithoutLabel">

```
const rowOffset = // Unvalidated data got from client
const rowCount = // Unvalidated data got from client

const validatedRowOffset = validateRowOffset(rowOffset);
const validatedRowCount = validateRowCount(rowCount);

const sqlQuery = `
  SELECT id, name, price
  FROM salesitems
  LIMIT ${validatedRowOffset}, ${validatedRowCount}
`;

connection.query(sqlQuery);
```
</div>

When you get a list of wanted column names from a client, you must validate that each of them is a valid column identifier:

<div class="sourceCodeWithoutLabel">

```
const columnNames = // Unvalidated data got from client

const escapedColumnNames =
  columnNames.map(columnName => connection.escapedId(columnName));

const sqlQuery =
  `SELECT ${escapedColumnNames.join(', ')} FROM salesitems`;

connection.query(sqlQuery);
```
</div>

### Normalization Rules

> Apply normalization rules to your database design.

Below are listed the three most basic normalization rules:

- First normal form (1NF)
- Second normal form (2NF)
- Third normal form (3NF)

A database relation is often described as "normalized" if it meets the first, second, and third normal forms.

#### First Normal Form (1NF)

The first normal form requires that at every intersection of a row and column, a single value exists and never a list of values.
When considering a sales item, the first normal form states that there cannot be two different price values in
the `price` column or more than one name for the sales item in the `name` column. If you need multiple names for a sales item, you
must establish a one-to-many relationship between a `SalesItem` entity and `SalesItemName` entities. What this means in practice
is that you remove the `name` property from the `SalesItem` entity class and create a new `SalesItemName` entity class used to
store sales items' names. Then you create a one-to-many mapping between a `SalesItem` entity and `SalesItemName` entities.

#### Second Normal Form (2NF)

The second normal form requires that each non-key column entirely depends on the primary key. Let's assume that we have the following columns in an `orderitems` table:

- orderid (primary key)
- productid (primary key)
- orderstate

The `orderstate` column only depends on the `orderid` column, not the entire primary key. The `orderstate` column is in the wrong table.
It should, of course, be in the `orders` table.

#### Third Normal Form (3NF)

The third normal form requires that non-key columns are independent of each other.

Let's assume that we have the following columns in a `salesitems` table:

- id (primary key)
- name
- price
- category
- discount

Let's assume that the discount depends on the category. This table violates the third normal form because a non-key column, `discount`, depends on another non-key column, `category`. Column independence means that you can change any non-key column value without
affecting any other column. If you changed the category, the discount would need to be changed accordingly,
thus violating the third normal form rule.

The discount column should be moved to a new `categories` table with the following columns:

- id (primary key)
- name
- discount

Then we should update the `salesitems` table to contain the following columns:

- id (primary key)
- name
- price
- categoryid (a foreign key that references the `id` column in the `categories` table)

## Document Database Principle

> Use a document database in cases where complete documents (e.g., JSON objects) are typically stored and retrieved as a whole.

Document databases, like MongoDB, are useful for storing complete documents. A document is usually a JSON object containing
information in arrays and nested objects. Documents are stored as such, and a whole document will be fetched when queried.

Let's consider a microservice for sales items. Each sales item contains an id, name, price, image URLs, and user reviews.

Below is an example sales item as a JSON object:

<div class="sourceCodeWithoutLabel">

```
{
  "id": "507f191e810c19729de860ea",
  "category": "Power tools",
  "name": "Sample sales item",
  "price": 10,
  "imageUrls": ["https://url-to-image-1...",
                "https://url-to-image-2..."],
  "averageRatingInStars": 5,
  "reviews": [
     {
       "reviewerName": "John Doe",
       "date": "2022-09-01",
       "ratingInStars": 5, 
       "text": "Such a great product!"
     }
  ]
}
```
</div>

A document database usually has a size limit for a single document. Therefore, the above example does not store sales item images
directly inside the document but only URLs to the images. Actual images are stored in another data store more suitable for storing
images, like Amazon S3.

When creating a microservice for sales items, we can choose a document database because we usually store and access whole documents. When sales items are created, they are created as JSON objects of the above shape with the `reviews` array being empty.
When a sales item is fetched, the whole document is retrieved from the database. When a client
adds a review for a sales item, the sales item is fetched from the database. The new review is appended to the `reviews` array, a new average
rating is calculated, and finally, the document is persisted with the modifications.

Below is an example of inserting one sales item to a MongoDB collection named `salesItems`. MongoDB uses the term _collection_
instead of _table_. A MongoDB collection can store multiple documents.

<div class="sourceCodeWithoutLabel">

```
db.salesItems.insertOne({
  category: "Power tools",
  name: "Sample sales item",
  price: 10,
  images: ["https://url-to-image-1...",
             "https://url-to-image-2..."],
  averageRatingInStars: null,
  reviews: []
})
```
</div>

You can find sales items for the _Power tools_ category with the following query:

<div class="sourceCodeWithoutLabel">

```
db.salesItems.find({ category: "Power tools" })
```
</div>

If clients are usually querying sales items by category, it is wise to create an index for that field:

<div class="sourceCodeWithoutLabel">

```
// 1 means ascending index, -1 means descending index
db.salesItems.createIndex( { category: 1 } ) 
```
</div>

When a client wants to add a new review for a sales item, you first fetch the document for the sales item:

<div class="sourceCodeWithoutLabel">

```
db.salesItems.find({ _id: ObjectId("507f191e810c19729de860ea") })
```
</div>

Then you calculate a new value for the `averageRatingInStars` field using the existing ratings and the new rating
and add the new review to the `reviews` array and then update the document with the following command:

<div class="sourceCodeWithoutLabel">

```
db.salesItems.updateOne(
  { _id: ObjectId("507f191e810c19729de860ea")  },
  { averageRatingInStars: 5,
  $push: { reviews: {
    reviewerName: "John Doe",
    date: "2022-09-01",
    ratingInStars: 5,
    text: "Such a great product!"
  }}
)
```
</div>

Clients may want to retrieve sales items sorted descending by the average rating. For this reason, you might want
to change the indexing to be the following:

<div class="sourceCodeWithoutLabel">

```
db.salesItems.createIndex( { category: 1, averageStarCount: -1 } )
```
</div>

A client can issue, for example, a request to get the best-rated sales items in the _power tools_ category.
This request can be fulfilled with the following query that utilizes the above-created index:

<div class="sourceCodeWithoutLabel">

```
db.salesItems
  .find({ category: "Power tools" })
  .sort({ averageStarCount: -1 })
```
</div>

## Key-Value Database Principle

> Use a key-value database for fast real-time access to data stored by a key. Key-value stores usually store data in memory with a possibility for persistence.

A simple use case for a key-value database is to use it as a cache for a relational database. For example, a microservice can store SQL query results
from a relational database in the cache. _Redis_ is a popular open-source key-value store. Let's have an example with JavaScript and Redis
to cache an SQL query result. In the below example, we assume that the SQL query result is available as a JavaScript object:

<div class="sourceCodeWithoutLabel">

```
redisClient.set(sqlQueryStatement,
                JSON.stringify(sqlQueryResult));
```
</div>

The cached SQL query result can be fetched from Redis:

<div class="sourceCodeWithoutLabel">

```
const sqlQueryResultJson = redisClient.get(sqlQueryStatement);
```
</div>

With Redis, you can create key-value pairs that expire automatically after a specific time.
This is a useful feature if you are using the key-value database as a cache. You may want the cached items to expire after a while.

In addition to plain strings, Redis also supports other data structures. For example, you
can store a list, queue, or hash map for a key. If you store a queue in Redis, you can
use it as a simple single-consumer message broker. Below is an example of producing a
message to a topic in the message broker:

<div class="sourceCodeWithoutLabel">

```
// RPUSH command (= right push) pushes a new message
// to the end of the list identified by key _topic_.
redisClient.rpush(topic, message);
```
</div>

Below is an example of consuming a message from a topic in the message broker:

<div class="sourceCodeWithoutLabel">

```
// LPOP command (= left pop) pops a message from
// the beginning of the list identified by key _topic_
// The LPOP command removes the value from the list
const message = redisClient.lpop(topic);
```
</div>

## Wide-Column Database Principle

> Use a wide-column database when you know what queries you need to execute, and you want these queries to be fast.

Table structures of a wide-column database are optimized for specific queries.
With a wide-column database, storing duplicate data is okay to make the queries
faster. Wide-column databases also scale horizontally well.

In this section, we use Apache Cassandra as an example wide-column database. Cassandra is
a scalable multi-node database engine. In Cassandra, the data of a table is divided into
partitions according to the table's partition key. A partition key is composed of one or more
columns of the table. Each partition is stored on a single Cassandra node. You can think that Cassandra is a key-value store where the key is the partition key, and the value is another
"nested" table. The rows in the "nested" table are uniquely identified by clustering columns sorted by default in ascending order. The sort order can be changed to descending if wanted.

The partition key and the clustering columns form the table's primary key. The primary key uniquely
identifies a row. Let's have an example table that is used to store hotels near a particular point of interest (POI):

<div class="sourceCodeWithoutLabel">

```
CREATE TABLE hotels_by_poi (
  poi_name text,
  hotel_distance_in_meters_from_poi int,
  hotel_id uuid,
  hotel_name text,
  hotel_address text,
  PRIMARY KEY (poi_name, hotel_distance_in_metersfrom_poi, hotel_id)
);
```
</div>

In the above example, the primary key consists of three columns. The first column (`poi_name`) is always the partition key.
The partition key must be given in a query. Otherwise, the query will be slow because Cassandra must perform a full table
scan because it does not know which node data is located. When the partition key is given in a SELECT
statement's WHERE clause, Cassandra can find the appropriate node where the data for that particular
partition resides. The two other primary key columns, `hotel_distance_in_meters_from_poi` and `hotel_id` are the clustering columns.
They define the order and uniqueness of the rows in the "nested" table.

![Figure 8.1 hotels_by_poi Table](images/03-01.png)

The above figure shows that when you give a partition key value (`poi_name`) you have access to the
respective "nested" table where rows are ordered first by the `hotel_distance_in_meters_from_poi` (ascending)
and second by the `hotel_id` (ascending).

Now it is easy for a hotel room booking client to ask the server to execute a query to find hotels near a POI given
by a user. The following query will return the first 15 hotels nearest to _Piccadilly Circus_ POI:

<div class="sourceCodeWithoutLabel">

```
SELECT 
  hotel_distance_in_meters_from_poi,
  hotel_id,
  hotel_name,
  hotel_address
FROM hotels_by_poi
WHERE poi_name = 'Piccadilly Circus'
LIMIT 15
```
</div>

When a user selects a particular hotel from the result of the above query, the client can request the execution of
another query to fetch information about the selected hotel. The user wants to see
other POIs near the selected hotel. For that query, we should create another table:

<div class="sourceCodeWithoutLabel">

```
CREATE TABLE pois_by_hotel_id (
  hotel_id uuid,
  poi_distance_in_meters_from_hotel int,
  poi_id uuid,
  poi_name text,
  poi_address text,
  PRIMARY KEY (hotel_id, poi_distance_in_meters_from_hotel, poi_id)
);
```
</div>

Now a client can request the server to execute a query to fetch the nearest 20 POIs for a selected hotel.
(hotel with id c5a49cb0-8d98-47e3-8767-c30bc075e529):

<div class="sourceCodeWithoutLabel">

```
SELECT
  poi_distance_in_meters_from_hotel,
  poi_id,
  poi_name,
  poi_address
FROM pois_by_hotel_id 
WHERE hotel_id = c5a49cb0-8d98-47e3-8767-c30bc075e529
LIMIT 20
```
</div>

In a real-life scenario, a user wants to search for hotels near a particular POI for a selected period
of time. The server should respond with the nearest hotels having free rooms for the selected period. For that kind of query, we create an additional table for storing hotel room availability:

<div class="sourceCodeWithoutLabel">

```
CREATE TABLE availability_by_hotel_id (
  hotel_id uuid,
  accommodation_date date,
  available_room_count counter,
  PRIMARY KEY (hotel_id, accommodation_date)
);
``` 
</div>

The above table is updated whenever a room for a specific day is booked or a booking for a room
is canceled. The `available_room_count` column value is either decremented or incremented by one in the update procedure.

Let's say that the following query has been executed:

<div class="sourceCodeWithoutLabel">

```
SELECT
  hotel_distance_in_meters_from_poi,
  hotel_id,
  hotel_name,
  hotel_address
FROM hotels_by_poi 
WHERE poi_name = 'Piccadilly Circus'
LIMIT 30
```
</div>

Next, we should find hotels from the result of 30 hotels that have available rooms between the 1st of September
2022 and 3rd of September 2022. We cannot use joins in Cassandra, but we can execute the following
query where we specifically list the hotel ids returned by the above query:

<div class="sourceCodeWithoutLabel">

```
SELECT hotel_id, MIN(available_room_count)
FROM availability_by_hotel_id 
WHERE hotel_id IN (List the 30 hotel_ids here...) AND
      accommodation_date >= '2022-09-01' AND
      accommodation_date <= '2022-09-03'
GROUP BY hotel_id
LIMIT 15
```
</div>

As a result of the above query, we have a list of a maximum of 15 hotels for which the minimum available room count is listed.
We can return a list of those max 15 hotels where the minimum available room count is one or more to the user.

If Cassandra's CQL language supported the `HAVING` clause, which it does not currently support,
we could have issued the following query to get what we wanted:

<div class="sourceCodeWithoutLabel">

```
SELECT hotel_id, MIN(available_room_count)
FROM availability_by_hotel_id 
WHERE hotel_id IN (List the 30 hotel_ids here...) AND
      accommodation_date >= '2022-09-01' AND
      accommodation_date <= '2022-09-03'
GROUP BY hotel_id
HAVING MIN(available_room_count) >= 1
LIMIT 15
```
</div>

A wide-column database is also useful in storing time-series data from IoT devices and sensors. Below is a table definition for storing measurement data in a telecom network analytics system:

<div class="sourceCodeWithoutLabel">

```
CREATE TABLE measurements (
  measure_name text,
  dimension_name text,
  aggregation_period text,
  measure_timestamp timestamp,
  measure_value double,
  dimension_value text,
  PRIMARY KEY ((measure_name, dimension_name, aggregation_period),
               measure_timestamp,
               measure_value,
               dimension_value)
) WITH CLUSTERING ORDER BY (
  measure_timestamp DESC,
  measure_value DESC
  dimension_value ASC
);
``` 
</div>

In the above table, we have defined a _compound partition key_ containing three columns: `measure_name`,
`dimension_name`, and `aggregation_period`. Columns for a compound partition key are given in parentheses.

Suppose we have implemented a client that visualizes measurements. In the client, a user can first choose what
counter/KPI (= measure name) to visualize, then select a dimension and aggregation period. Let's say that the user wants
to see _dropped_call_percentage_ for _cells_ calculated for a one-minute period at 2022-02-03 16:00. The following kind of
query can be executed:

<div class="sourceCodeWithoutLabel">

```
SELECT measure_value, dimension_value 
FROM measurements
WHERE measure_name = 'dropped_call_percentage' AND
      dimension_name = 'cell' AND
      aggregation_period = '1min' AND
      measureTimestamp = '2022-02-03T16:00+0000'
LIMIT 50;
```
</div>

The above query returns the top 50 cells where the dropped call percentage is highest for the given minute.

We can create another table to hold measurements for a selected dimension value, e.g., for a particular cell id. This table can be used to
drill down to a particular dimension and see measure values in the history.

<div class="sourceCodeWithoutLabel">

```
CREATE TABLE measurements_by_dimension (
  measure_name text,
  dimension_name text,
  aggregation_period text,
  dimension_value text,
  measure_timestamp timestamp,
  measure_value double,
  PRIMARY KEY ((measure_name,
                dimension_name,
                aggregation_period,
                dimension_value), measure_timestamp)
) WITH CLUSTERING ORDER BY (measureTimestamp DESC);
``` 
</div>

The below query will return dropped call percentage values for the last 30 minutes for the cell identified by
_cell id_ 3000:

<div class="sourceCodeWithoutLabel">

```
SELECT measure_value, measureTimestamp
FROM measurements_by_dimension
WHERE measure_name = 'dropped_call_percentage' AND
      dimension_name = 'cell' AND
      aggregation_period = '1min' AND
      dimension_value = '3000'
LIMIT 30;
```
</div>

## Search Engine Principle

> Use a search engine if you have free-form text data that users should be able to query.

A search engine (like Elasticsearch, for example) is useful for storing information like log entries collected
from microservices. You typically want to search the collected log data by the text in the log messages.

It is not necessary to use a search engine when you need to search for text data. Other databases, both document and relational,
have a special index type that can index free-form text data in a column. Considering the earlier example with MongoDB,
we might want a client to be able to search sales items by the text in the sales item's name. We don't need to store sales items in a search engine database. We can continue storing them in a document database
(MongoDB) and introduce a _text_ type index for the `name` field. That index can be created with
the following MongoDB command:

<div class="sourceCodeWithoutLabel">

```
db.salesItems.createIndex( { name: "text" } )
```
</div>

