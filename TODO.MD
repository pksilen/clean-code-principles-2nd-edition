

Tactical DDD: 

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