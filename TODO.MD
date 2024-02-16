

Tactical DDD: Domain services usually should not contain access to data repository or otherwise be side-effectful. Try to aim for
a functional and immutable domain services and objects and put side-effects to the outer application service layer. Application service
layer can have several variations, but a single application services implements a use case or a feature. In the simplest form, application
service is a transaction script when no domain services are needed. This is usually the case for simple CRUD-based APIs where the application
service method perform a CRUD operation like creating a new sales in sales-item-service or for example, a backlog item service
can have an update backlog item use case or feature where in the application service layer the app service methods first fetched the sprint
the backlog item is assigned from repository and then calls backlogItemFactory to tryCreate a new backlogitem with the specific
sprint object given also as a parameter in addition to the updated backLogItemDto. Factory can validate if the sprint is correct (now or in future, not a past one).
The factory can be implemented in various ways, using one of the factory patterns, e.g. a separate factory class or a factory method in the entity class.
Factory can create different variants of BackLog item entities if needed. For example, based on backlog item type parameter the factory can create different
backlog items, like TeamBacklogItem or ProductBacklogItem.

When backlog item
is created, it can persisted by giving it repository's update method. There needs no domain services be present.
When the model has domain services, the application services delegate to them for more complex operations. 

Database chapter: In repositories, create separate database entities if needed. Sometimes if business or domain entity and 
database entity are the same, you can use one entity, but many times they might differ. E.g. the entity id in database entity could
be numeric, a 64-bit integer, but business entity should have it string so that it can be used any clients, like JavaScript where numeric limits are
not 64-bit. If you change your database, you can have mixed format ids. If you want uniform unique ids, you need to generate them
in your software not by the database. This might be good approach for a security point of view to prevent IDOR. If you generate random UUIDs in you application,
and you have accidentally broken authorization (IDOR), it is not possible for an attacker to guess ids and try to access API using them. You can name DB entities with a Db-prefix, e.g. DbSalesItem. In the DbSalesItem class you need conversion methods from domain entity and 
to domain entity:

DbSalesItem.from(domainEntity);
DbSalesItem.from(salesItem);

salesItem = dbSalesItem.toDomainEntity();

You might want to create separate DB entity because you want to store some data in different type or format or you
don't store some data to database because it can be generated from other fields.