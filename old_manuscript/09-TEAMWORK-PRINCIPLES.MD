# Teamwork Principles

This chapter presents teamwork principles. The following principles are described:

- Use an agile framework principle
- Define the done principle
- You write code for other people principle
- Avoid technical debt principle
- Software component documentation principle
- Code review principle
- Uniform code formatting principle
- Highly concurrent development principle
- Pair programming principle
- Well-defined development team roles principle

## Use Agile Framework Principle

> Using an agile framework can bring numerous benefits to an organization, including an increase in productivity, 
> improvements in quality, faster time-to-market, and better employee satisfaction.

The above statements come from [customer stories](https://scaledagile.com/insights-customer-stories/) of
some companies having adopted [Scaled Agile Framework (SAFe)](https://www.scaledagileframework.com/). 

An agile framework describes a standardized way of developing software, which is essential, especially in large
organizations. In today's work environments, people change jobs frequently, and teams tend to change often,
which can lead to a situation where there is no common understanding of the way of working unless a particular
agile framework is used. An agile framework establishes a clear division of responsibilities, and everyone can focus on what they do best.

In the _SAFe_, for example, during a program increment (PI) planning, development teams plan features for the
next PI (consisting of 4 iterations, two weeks per iteration, a total of 8 weeks). In the PI planning, teams split features
into user stories and see which features fit in the PI. Planned user stories will be assigned story points
(measured in person days, for example), and stories will be placed into iterations. This planning phase results in a plan
the team should follow in the PI. Junior SAFe practitioners can make mistakes like underestimating the work needed to complete a user story. But this is a self-correcting issue. When teams and individuals develop, they will better estimate the needed
work amount, and plans become more solid. Teams and developers learn that they must make all work visible. For example, reserve time
to learn new things, like a programming language or framework, and reserve time for refactoring.
It is very satisfying to keep the planned schedule and sometimes even complete work early.
This will make you feel like a true professional and is a boost to self-esteem.
 
## Define the Done Principle

> For user stories and features, define what _done_ means.

In the most optimal situation, development teams have a shared understanding of what is needed to declare
a _user story_ or _feature_ done. When having a common definition of done, each development team can ensure consistent results and quality.

When considering a user story, at least the following requirements for a done user story can be defined:

- Source code is committed to a source code repository
- Source code is reviewed
- Static code analysis is performed (No blocker/critical/major issues)
- Unit test coverage is at least X%
- CI/CD pipeline is passing
- No 3rd party software vulnerabilities

The product owner's (PO) role in a team is to accept a user story as done. Some of the above-mentioned
requirements can be automatically checked. For example, the static code analysis should be part of every CI/CD
pipeline and can also check the unit test coverage automatically. If static code analysis does not pass or
the unit test coverage is not acceptable, the CI/CD pipeline does not pass.

Some additional requirements for done-ness should be defined when considering a feature because features
can be delivered to customers. Below is a list of some requirements for a done feature:

- Architectural design documentation is updated
- Integration tests are added/updated
- End-to-end tests are added/updated if needed
- Non-functional testing is done
- User documentation is ready
- Threat modeling is done, and threat countermeasures (security features) are implemented

To complete all the needed done-ness requirements, development teams can use tooling that helps
them remember what needs to be done. For example, when creating a new user story in a tool like Jira,
an existing prototype story could be cloned (or a template used). The prototype or template story
should contain tasks that must be completed before a user story can be approved.

## You Write Code for Other People Principle

> You write code for other people and your future self.

Situations where you work alone with a piece of software are relatively rare. You cannot predict what
will happen in the future. There might be someone else responsible for the code you once wrote. And there are cases
when you work with some code for some time and then, maybe after several years, need to return to that code. For
these reasons, writing clean code that is easy to read and understand by others and
yourself in the future is essential. Remember that code is not written for a computer only but also for people.
People should be able to read and comprehend code easily. Remember that at its best, code reads like beautiful prose!

## Avoid Technical Debt Principle

The most common practices for avoiding technical debt are the following:

- The architecture team should design the high-level architecture (Each team should have a representative in the architecture team. Usually, it is the technical lead of the team)
- Development teams should perform object-oriented design first, and only after that proceed with implementation
- Conduct object-oriented design within the team with relevant senior and junior developers involved
- Don't take the newest 3rd party software immediately into use, instead use mature 3rd party software that has an established position in the market
- Design for easily replacing a 3rd party software component with another 3rd party component.
- Design for scalability (for future load)
- Design for extension: new functionality is placed in new classes instead of modifying existing classes
- Utilize a plugin architecture (possibility to create plugins to add new functionality later)
- Reserve time for refactoring

The top reasons for technical debt are the following:

- Using niche technologies or brand-new technologies that are immature
- Not making software scalable for future processing needs
- When it is not relatively easy to replace a 3rd party software component (E.g., using custom SQL syntax does not allow changing the database, not using the _adapter pattern_ with 3rd party libraries)
- Not reviewing the architecture
- Not doing any object-oriented design before starting coding
- Not engaging senior enough developers in the OOD phase
- Not understanding and using relevant design principles and patterns
  - Not programming against interfaces
  - Not easy to change a dependency (DI missing)
  - No facades
- Not reviewing code changes
- Not reserving time for refactoring
- Too small work effort estimates
- Time pressure from management
- Management does not understand the value of refactoring
- Postponing refactoring to a time point that never comes
- Forgetting to refactor (at least store the needed refactoring work items in a TODO.MD file in the source code repository)
- No unit tests, harder to refactor
- Duplicate code
- Not conducting the boy scout rule
- Laziness (using what comes first in mind or constantly trying to find the easiest and quickest way to do things)

## Software Component Documentation Principle

> Each software component needs to be documented. The main idea behind documenting is quickly onboarding new people to development work.

It is crucial that setting up a development environment for a software component is well-documented and as easy as possible.
Another important thing is to let people easily understand the problem domain the software component
tries to solve. Also, the object-oriented design of the software component should be documented.

Software component documentation should reside in the same source code repository where the source code is.
The recommended way is to use a README.MD file in the root directory of the source code repository for documentation
in Markdown format. You can split the documentation into multiple files and store additional
files in the _docs_ directory of the source code repository.

Below is an example table of contents that can be used when documenting a software component:

- Short description of the software component and its purpose
- Feature list
- OOD diagrams describing different subdomains and classes in each subdomain
  - Explanation of the design (if needed)
- API documentation (for libraries)
- Implementation-related documentation
  - Error handling mechanism
  - Special algorithms used
  - Performance considerations
- Instructions for setting up a development environment
  - The easiest way to set up a development environment is to use a development container,
    a concept supported by the Visual Studio Code editor. The benefit of using a development container is that
    you don't have to install development tools locally, and there is no risk of using the wrong versions of the development
    tools
- Instructions for building the software locally
- Instructions for running unit tests locally
- Instructions for running integration tests locally
- Instructions for deploying to a test environment
- Configuration
  - Environment variables
  - Configuration files
  - Secrets
    
## Code Review Principle

> In a code review, focus on issues a machine cannot find for you.

Before reviewing code, a static code analysis should be performed to find any issues a machine can find.
The actual code review should focus on issues that static code analyzers cannot find. You cannot review your own code.
At least one of the reviewers should be in a senior or lead role. Things to focus on in a code review are presented
in the subsequent sections.

### Focus on Object-Oriented Design 

Before starting coding, it is recommended to design the software: define subdomains, needed interfaces, and classes.
The product of this initial design phase should be committed to the source code repository and reviewed before
starting coding. In this way, it is easier to correct design flaws early. Fixing design flaws in a later phase might require significant effort or even a rewrite of the existing code. At least one senior developer should participate in the design.

If a design flaw or flaws are encountered in a review, but there is no time for an immediate fix. A refactoring
user story or stories should be added to the team's backlog.

### Focus on Proper and Uniform Naming

One thing that static code analysis tools can only partially do is ensure proper and uniform naming of things,
like classes, functions, and variables. Naming is where the focus should be put in a code review. Renaming
things is a very straightforward and fast refactoring task that can be performed automatically by modern IDEs.

### Don't Focus on Premature Optimization

Do not focus on optimization in regular code reviews. Optimization is usually performed on a need basis
after the code is ready and the performance is first measured. Focus on optimization-related issues only
when the commit you are reviewing is dedicated to optimizing something.

### Detect Possible Malicious Code

Code reviewers must verify that the committed code does not contain malicious code.

## Uniform Code Formatting Principle

> In a software development team, you must decide on common rules for formatting source code.

Consistent code formatting is vital because if team members have different source code formatting rules, one team member's small change
to a file can reformat the whole file using his/hers formatting rules, which can cause another developer to face a major merge conflict that
slows down the development process. Always agree on common source code formatting rules and preferably use a tool like
_Prettier_ to enforce the formatting rules. If no automatic formatting tool is available, you can create source code formatting rules for IDEs
used by team members and store those rules in the source code repository.

## Highly Concurrent Development Principle

> Each team member can work with some piece of code. No one should be waiting long for someone else's work to finish.

Concurrent development is enabled when different people modify different source code files. When
several people need to alter the same files, it can cause merge conflicts. These merge conflicts cause extra work because they often must be resolved
manually. This manual work can be slow, and it is error-prone. The best thing is to avoid merge conflicts as much as possible.
This can be achieved in the ways described in the following sections.

### Dedicated Microservices and Microlibraries

Microservices are small by nature, and it is possible to assign the responsibility of a microservice to a
single team member. This team member can proceed with the microservice with full velocity, and rest
assured that no one else is modifying the codebase. The same goes for libraries. You should
create small microlibraries (= libraries with a single responsibility) and assign the responsibility of developing
a microlibrary to a single person.

### Dedicated Domains

Sometimes it is impossible to assign a single microservice or library to a single developer. It could be
because the microservice or library is relatively large and it is not feasible
to split it into multiple microservices or libraries.
In those cases, the microservice or library should be divided into several
subdomains by conducting domain-driven design. Each source code directory reflects a different subdomain. It is then possible to assign
the responsibility of a single subdomain to a single person. The assignment of subdomains should not be fixed
but can and should change as time goes by. To distribute the knowledge of different domains,
it is advisable to rotate the responsibilities amongst the team members. Let's say you have a team of three
developers developing a data exporter microservice consisting of three subdomains: input, transformer, and output. The team can implement the microservice by assigning the responsibility of a single domain to a single developer. Now all developers can proceed highly independently and concurrently with the implementation. In the early phase,
they must define interfacing between the different subdomains.

In the future, when
new features are developed, team members can take responsibility for other domains to spread knowledge about the
microservice in the team.

### Follow Open-Closed Principle

Sometimes you might face a situation where a single subdomain is so large that you need multiple developers. This, of course,
should be a relatively rare case. When several developers modify source code
files belonging to the same subdomain (i.e., in the same directory), merge conflicts may arise. This is the
case, especially when existing source code files are modified. But when developers follow the _open-closed principle_, they should not change existing classes (source code files) but rather implement new functionality in
new classes (source code files). Using the _open-closed principle_ enables developers
to develop more concurrently because they primarily work with different source code files, making merge
conflicts rare or at least less frequent.

## Pair Programming Principle

> Pair programming helps produce better quality software with better design, less technical debt, better tests, and fewer bugs.

Pair programming is something some developers like, and other developers hate. So it is not a one-fits-all solution.
It is not take it or leave it, either. You can have a team where some developers program in pairs and others don't.
Also, people's opinions about pair programming can be prejudiced. Perhaps, they have never done pair programming, so how
do they know if they like it or not? It is also true that choosing the right partner to pair with can mean a lot.
Some pairs have better chemistry than other pairs.

Does pair programming just increase development costs? What benefits pair programming brings?

I see pair programming as valuable, especially in situations where a junior developer pairs with a more senior developer, and
in this way, the junior developer is onboarded much faster. He can "learn from the best". Pair programming can improve
software design because there is always at least two persons' view of the design. Bugs can be found easier and
usually in an earlier phase (four eyes compared to two eyes only). So, even if pair programming can
add some cost, it usually results in software with better quality: better design, less technical debt, better tests, and fewer bugs.

## Well-Defined Development Team Roles Principle

> A software development team should have a well-defined role for each team member.

A software development team does not function optimally if everyone is doing everything or if it is expected that
anyone can do anything. No one is a jack of all trades. A team achieves
the best results when it has specialists targeted for different tasks. Team members need to have focus areas they like
to work with and where they can excel. When you are a specialist in some area, you can complete tasks belonging to that area faster and
with better quality.

Below is a list of needed roles for a development team:

- Product owner (PO)
- Scrum master (SM)
- Software developer (junior/senior/lead)
- Test automation developer
- DevOps engineer
- UI designer (if the team develops UI software components)

Let's discuss each role's responsibilities in detail in the following sections.

### Product Owner

The product owner (PO) acts as an interface between the development team and the business, which usually means product management.
The PO is responsible for defining user stories and prioritizing the team backlog together with the team. The PO role is not
usually a full-time role.

### Scrum Master

A scrum master (SM) is a servant leader and a coach for the development team. The scrum master ensures that relevant agile practices and
the agile process are followed. They educate the team in agile practices. If the team has a line manager, the line
manager can serve as the scrum master, but any team member can be the scrum master.

### Software Developer

A software developer is responsible for designing, implementing, and testing software (including unit and, in most cases, integration testing). A software developer is usually focused on one or two
programming languages and a couple of technical frameworks. Typically, software developers are divided into the following
categories:

- Backend developers
- Frontend developers
- Full-stack developers
- Mobile developers
- Embedded developers

A backend developer develops microservices, like APIs, running in the backend. A frontend developer develops
web clients. Typically, a frontend developer uses JavaScript or TypeScript, React/Angular/Vue, HTML and CSS.
A full-stack developer is a combination of a backend and frontend developer capable of developing backend microservices and frontend
clients. A mobile developer develops software for mobile devices, like phones and tablets.

A team should have software developers at various seniority levels. Each team should have a lead developer
with the best experience in the used technologies and the domain. The lead developer typically belongs to the
virtual architectural team led by the system architect. There is no point in having a team with just junior developers
or just senior developers. The idea is to transfer skills and knowledge
from senior developers to junior developers. This also works the other way around. Junior developers can have knowledge of some of the latest technologies and practices that senior developers are missing. So overall, the best team is a team consisting of a good mix of both junior and senior developers.

### Test Automation Developer

A test automation developer is responsible for developing different kinds of automated tests. Typically, test automation
developers develop integration, E2E, and automated non-functional tests. A test automation developer must have good proficiency
in at least one programming language, like Python, that is used to develop automated tests. Test automation
developers must have a good command of BDD and some common testing frameworks, like Cucumber-JVM or Behave. Knowledge
of some testing tools, like Apache JMeter, is appreciated. Test automation developers can also develop internal testing tools, like interface simulators and data generators.
Test automation developers should form a virtual team to facilitate the development of E2E and automated non-functional tests.

### DevOps Engineer

A DevOps engineer acts as an interface between the software development team and the software operations. A DevOps engineer
usually creates CI/CD pipelines for microservices and crafts infrastructure and deployment-related code. DevOps engineers also
define alerting rules and metrics visualization dashboards that can be used when monitoring the software in production.
DevOps engineers help operations personnel to monitor software in production. They can help
troubleshoot problems that the technical support organization cannot solve. DevOps engineer knows the environment (=infrastructure and platform) where the software is deployed, meaning that basic knowledge of at least one cloud provider (AWS/Azure/Google Cloud, etc.) and perhaps Kubernetes is required.
DevOps engineers should form a virtual team to facilitate specifying DevOps-related practices and guidelines.

### UI Designer

A UI designer is responsible for designing the final UIs based on higher-level UX/UI designs/wireframes. The UI designer
will also conduct usability testing of the software.
