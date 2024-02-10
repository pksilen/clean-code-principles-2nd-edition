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