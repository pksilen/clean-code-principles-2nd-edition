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
