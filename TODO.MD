This book does not solely promote microservices, but as said modular monolith can be a viable alternatively to a microservices
architecture. Even if you are creating a modular monolith, it is good to know microservice design principles so that you can build
the modular monolith such that you are able to extract it or part of it to microservices if needed in the future. For this reason, 
even if you are not building microservices, it is worth to know the basic design principles of them.

- in clean architecture, mention that writing component tests will be easy, because
fake input/output adapters can be used to integrate the business logic of the software component. Give
example with data exporter microservice
- Event storming: Event storming can be useful in situations where audit trail of events are wanted or needed. Data store used in Event storming
  would then act as an audit logging system. When you use event storming you also create events that could be used as such in various analytics
  and machine learning applications. Event storming can also help debugging a complex system compared to debugging a system where entities are
  modified. Of course those modifications could be logged, but that would mean that a specific low logging level should have been enabled but not all data should be written to logs
  due to security reasons. Drawback of event storming is recreating current state of entities from events in the event store. This can be a  performance bottleneck
  if needed to be done often and number of events is high. This can be mitigated by creating snapshot of entity states, e.g. after certain number
  of events created for a specific entity. Then the current state of an entity can be recreated by finding latest snapshot and replay events
  create after that snapshot. Another alternatively is to use partial materialized views and CQRS as described in next section.
- CQRS: Give a real-life example of a materialized view, order entities. The materialized view can only store a summaries of orders which
- can be visualized e.g. in UI and when details of a specific order entity are request the complete order aggragate is recrated from events
- in the event store. System using CQRS with a materialized view is usually having eventual consistency, so the value coming from the 
- materialized view may not contain the latest change(s) yet.

- 7 Fallacies of distributed computing:
  1. The network is reliable
     For this you don't have to prepare separately in every micorservice, but use a service mesh like Istio to handle
     issues raised from network unreliability.
  2. Latency is zero
     Latency can vary from time of the day etc. Usually when you deploy you software system to a single region of cloud
     The latency stays small and for many applications is on acceptable level. If you have a real-time application, you need to take this account, maybe measure it and see
     if it is acceptable.
  3. Bandwidth is infinite.
     Bandwidth inside a single cloud region is high. If you transfer high amount of data, you can measure if the bandwidth is
     enough through testing.
  4. The network is secure.
     Inside Attackers might be able to sniff the network traffic. Use service mesh to implement mTLS to secure the network.
  5. Network topology does not change
     Topology can change and produce suboptimal routes and cause bottlenecks.
  6. There is one administrator
     Having many admins can accidentally cause problems by making configuration changes.
  7. Transport cost is zero
     Even if the transport is not charged, it is baked in in other prices, like used infra and services. The more data
     you transport, more it can cost. Remember that when you use microserivces all data between microservices must be
     serialized and deserialized causing additional CPU consumption compared to a monolith where information can be changed
     in the memory.
  8. The network is homogenous
     Network has many parts. If the VMs are in same rack, the latency and bandwidth are higher compared to connections
     between VMs in two different availability zones.

Microservices benefits: high degree of organizational autonomy, self-directed fast-paced teams with minimal communication overhead with other teams. This can be achieved with a well-modularized
monolith, too. There things were planning with teams is needed, things that are visible to software users and administrators so that software feels harmonous:
UX/UI design, configurability, observability (including logging format, SLIs, metric dashboards, SLOs and alarms). But the things that are not visible to customer
the team can decide how to do it best, choose the programming language, framework, libraries, testing methods and tools.
The team independence can result in not being able to follow the DRY principle. There should be enough communication to avoid unnecessary duplicated effort.

Team Communication is a new section in Team Principles. Describe conway's law that organization communication structure resembles the
software architectural structure. If there is no clear organizational communication structure, the architecture can be a big ball of mud monolith.
Or if teams are siloed that can lead that non-communication can produce compatibility issues when two teams software need to work together.
A team suitable for a modular monolith or microservies architecture mainly communicates internally and on communicates the needed amount
with other team or teams to agree upon interfaces (context mapping) between bounded contexts.

Give Examples of context mapping styles using the mobile telecom analytics software system. The interface between radio and core networks
and the data ingester could be a partnership. Example of a shared kernel in banking software system, could be money kernel that consists of money
related operations like currency exchanges, implemented in a library. The interface between data ingester and data aggregator can be
Conformist or Supplier-Consumer. The interface between insights-visualizer-config and web-client can be partnership. The insighs-data-service could
be made generic and interface between it and web-client is open host service. Give example of a published language
when exporter has config file in JSON format, and another team builds configuration store and UI for defining the exporter configuration.
The context mapping is a Conformist to a published language (two styles combined).

Strategical DDD target is to divide a large business domain into several bounded context with their basic interfacing mechanish or 
communication/coordination pattern defined. A single team is responsible for a bounded context.

Strategical DDD event storming, mention that it is question about Big-picture event storming focusing on domain events
on timeline, but actors, commands and entities can be added if they make the design clearer. Also opportunities and problems
should listed so that they can later be addressed. At the end of the event storming session take several photos of designs and sticth
them together to a large single document for future reference.