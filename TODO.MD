- High coupling / cohesion image in downloads folder
- In high coupling/cohesion, mention best is zero coupling, but a microservice is coupled to 1 or 2
  other microservices. Sometimes there can be more coupling like 3 or 4 other microservices.In that case
  distributed transaction might be needed. It can be hard to implement a distributed transaction so that system
  in all cases remains in a consistent state regardless of any failure. If you need 100% consistency, like in a banking
  software system, you need to carefully consider if you should bring the coupled microservice into one microservice and
  thus getting rid of distributed transactions.
  
- Add Appendix A

Maybe Interesting read:
Interpreter pattern: https://www.youtube.com/watch?v=hmX2s3pe_qk