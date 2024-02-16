Give Examples of context mapping styles using the mobile telecom analytics software system. The interface between radio and core networks
and the data ingester could be a partnership. Example of a shared kernel in banking software system, could be money kernel that consists of money
related operations like currency exchanges, implemented in a library. The interface between data ingester and data aggregator can be
Conformist or Supplier-Consumer. The interface between insights-visualizer-config and web-client can be partnership. The insighs-data-service could
be made generic and interface between it and web-client is open host service. Give example of a published language
when exporter has config file in JSON format, and another team builds configuration store and UI for defining the exporter configuration.
The context mapping is a Conformist to a published language (two styles combined).

Strategical DDD event storming, mention that it is question about "Big-picture" event storming focusing on domain events
on timeline, but actors, commands and entities can be added if they make the design clearer. Also opportunities and problems
should listed so that they can later be addressed. Domain events can be triggered by various parties like users, admins, time schedule, external systems. At the end of the event storming session take several photos of designs and sticth
them together to a large single document for future reference. Mention that big picture event storming is gather people with
diverse responsibilities, including product management, architects, lead and senior developers, domain experts, UX designers.
There is other form of event storming called software design level event storming, introduced in the next chapter. For more about
strategical DDD, I suggest you consult books: Architecture Modernization and Strategic Monoliths and Microservices.
The domain events on timeline are not a single line of events but multiple, i.e. many things can happen at the same time. Things
can belong to same subdomain or different. Different lines of events can be used to represent failure scenarios or edge cases of a feature.
To distinguish between these, a sticky note can be added before multiple lines of events to describe are these event lines parallel or
do they represent different scenarios. Big picture event storming is chaotic exploration in the beginning. The structure for the events
is emergent. You should be able to move events on the whiteboard and add events to any positions organize the initial chaos to something
more systematic.

It does not matter, the main idea is to register everything that can happen in the software
system to be build. When you have a large and diverse group people participating in the event storming session, the better and more complete
representation of the software system to be built you get. The likelihood of forgetting major domain events is smaller. The abstraction level
of domain events should not be too high or too low. Events should describe a feature or use case an bounded context implements, but not
the implementation details. Event "order placed" might be on too high level because it is masking the following lower level
events: payment processed, shopping cart emptied, sales item inventory updated, order created, for example. On the other hand, events like
Button in order form pressed and order entity persisted in database are too low level events. These are events describe implementation details
and are not part of big-picture events storming, but can be part of software design level event storming which is part of tactical DDD.
The most experienced and technical oriented participant should guide the level of abstraction in the domain events.

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