# DevSecOps

DevOps describes practices that integrate software development (Dev) and software operations (Ops).
It aims to shorten the software development lifecycle through development parallelization and automation and provides
continuous delivery of high-quality software. DevSecOps enhances DevOps by adding security aspects to the software
lifecycle.

![Fig 11.1 DevSecOps Diagram](images/devsecops.png)

A software development organization is responsible for planning, designing, and implementing software deliverables. Software operations deploy software to IT infrastructure and platforms. They monitor the deployed software to ensure it runs without problems. Software operations also provide feedback to the
software development organization through bug reports and enhancement ideas.

## SecOps Lifecycle

The SecOps lifecycle is divided into the following phases:

- Threat modeling
    - To find out what kind of security features and tests are needed
    - Implementation of threat countermeasures and mitigation. This aspect was covered in more detail in the earlier _security principles_ chapter
- Scan
    - Static security analysis (also known as SAST = Static Application Security Testing)
    - Security testing (also known as DAST = Dynamic Application Security Testing)
    - Container vulnerability scanning
- Analyze
    - Analyze the results of the scanning phase, detect and remove false positives and prioritize corrections of vulnerabilities
- Remediate
    - Fix the found vulnerabilities according to prioritization
- Monitor
    - Define SecOps-related metrics and monitor them

## DevOps Lifecycle

The DevOps lifecycle is divided into the following phases:

- Plan
- Code
- Build
- Test
- Release
- Deploy
- Operate
- Monitor

Subsequent sections describe each of the phases in more detail.

### Plan

_Plan_ is the first phase in the DevOps lifecycle. In this phase, software features are planned, and
high-level architecture and UX are designed. This phase involves business (product
management) and software development organizations.

### Code

_Code_ is the software implementation phase. It consists of software components' design and implementation, writing unit tests,
integration tests, E2E tests, and other automated tests. This phase also includes all other coding needed to make the software deployable. Most of the work is done in this phase, so it should be streamlined as much as possible.

The key to shortening this phase is to parallelize everything to the maximum possible extent.
In the _Plan_ phase, the software was architecturally split into smaller pieces (microservices) that
different teams could develop in parallel. Regarding developing a single microservice, there should also be
as much parallelization as possible. This means that if a microservice can be split into multiple subdomains, the development
of these subdomains can be done very much in parallel. If we think about the data exporter microservice, we identified several subdomains: input, decoding, transformations, encoding, and output.
If you can parallelize the development of these five subdomains, you can significantly shorten the time needed to complete
the implementation of the microservice.

To shorten this phase even more, a team should have a dedicated test automation developer who can start developing automated tests in an early phase parallel to the implementation.

Providing high-quality software relies on high-quality design, implementation with little technical debt, and comprehensive functional and non-functional testing. All of these aspects were already handled in the earlier chapters.

### Build and Test

The _Build and Test_ phase should be automated and run as _continuous integration_ (CI) pipelines. Each software component
in a software system should have its own CI pipeline. A CI pipeline is run by a CI tool like _Jenkins_ or _Github Actions_.
A CI pipeline is defined using declarative code stored in the software component's source code repository. Every time a commit is made
to the main branch in the source code repository, it should trigger a CI pipeline run.

The CI pipeline for a software component should perform at least the following tasks:

- Checkout the latest source code from the source code repository
- Build the software
- Perform static code analysis. A tool like _SonarQube_/_SonarCloud_ can be used
    - Perform static application security testing (SAST).
- Execute unit tests
- Execute integration tests
- Perform dynamic application security testing (DAST). A tool like OWASP ZAP can be used
- Verify 3rd party license compliance and provide a bill of materials (BOM). A tool like _Fossa_ can be used

### Release

In the _Release_ phase, built and tested software is released automatically. After a software component's CI pipeline
is successfully executed, the software component can be automatically released. This is called _continuous delivery_ (CD).
Continuous delivery is often combined with the CI pipeline to create a CI/CD pipeline for a software component. Continuous delivery
means that the software component's artifacts are delivered to artifact repositories, like Artifactory, Docker Hub, or a Helm chart repository.

A CD pipeline should perform the following tasks:

- Perform static code analysis for the code that builds a container image (e.g., _Dockerfile_). A tool like _Hadolint_ can be used for _Dockerfiles_.
- Build a container image for the software component
- Publish the container image to a container registry (e.g., Docker Hub, Artifactory, or a registry provided by your cloud provider)
- Perform a container image vulnerability scan
    - Remember to enable container vulnerability scanning at regular intervals in your container registry, also
- Perform static code analysis for deployment code. Tools like Helm's _lint_ command, _Kubesec_ and _Checkov_ can be used
- Package and publish the deployment code (for example, package a Helm chart and publish it to a Helm chart repository)

#### Example Dockerfile

Below is an example _Dockerfile_ for a microservice written in TypeScript for Node.js.
The Dockerfile uses Docker's multi-stage feature. First (at the builder stage), it builds the source code, i.e., transpiles TypeScript
source code files to JavaScript source code files. Then (at the intermediate stage), it creates an intermediate image that copies
the built source code from the builder stage and installs only the production dependencies. The last stage (final) copies files
from the intermediate stage to a distroless Node.js base image. You should use a distroless base image to make the image size and the attack surface smaller. A distroless image does not contain any
Linux distribution inside it.

_Dockerfile_
```
# syntax=docker/dockerfile:1

FROM node:18 as builder
WORKDIR /microservice
COPY package*.json ./
RUN  npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:18 as intermediate
WORKDIR /microservice
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /microservice/build ./build

FROM gcr.io/distroless/nodejs:18 as final
WORKDIR /microservice
USER nonroot:nonroot
COPY --from=intermediate --chown=nonroot:nonroot /microservice ./
CMD ["build/main"]
```

#### Example Kubernetes Deployment

Below is an example Helm chart template for a Kubernetes Deployment. The template code is given in double braces.

_deployment.yaml_
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "microservice.fullname" . }}
  labels:
    {{- include "microservice.labels" . | nindent 4 }}
spec:
  {{- if ne .Values.nodeEnv "production" }}
  replicas: 1
  {{- end }}
  selector:
    matchLabels:
      {{- include "microservice.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.deployment.pod.annotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "microservice.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.deployment.pod.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "microservice.serviceAccountName" . }}
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.imageRegistry }}/{{ .Values.imageRepository }}:{{ .Values.imageTag }}"
          imagePullPolicy: {{ .Values.deployment.pod.container.imagePullPolicy }}
          securityContext:
            {{- toYaml .Values.deployment.pod.container.securityContext | nindent 12 }}
          {{- if .Values.httpServer.port }}
          ports:
            - name: http
              containerPort: {{ .Values.httpServer.port }}
              protocol: TCP
          {{- end }}
          env:
            - name: NODE_ENV
              value: {{ .Values.nodeEnv }}
            - name: ENCRYPTION_KEY
              valueFrom:
                secretKeyRef:
                  name: {{ include "microservice.fullname" . }}
                  key: encryptionKey
            - name: MICROSERVICE_NAME
              value: {{ include "microservice.fullname" . }}
            - name: MICROSERVICE_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: MICROSERVICE_INSTANCE_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
            - name: MYSQL_HOST
              value: {{ .Values.database.mySql.host }}
            - name: MYSQL_PORT
              value: "{{ .Values.database.mySql.port }}"
            - name: MYSQL_USER
              valueFrom:
                secretKeyRef:
                  name: {{ include "microservice.fullname" . }}
                  key: mySqlUser
            - name: MYSQL_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: {{ include "microservice.fullname" . }}
                  key: mySqlPassword
          livenessProbe:
            httpGet:
              path: /isMicroserviceAlive
              port: http
            failureThreshold: 3
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /isMicroserviceReady
              port: http
            failureThreshold: 3
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /isMicroserviceStarted
              port: http
            failureThreshold: {{ .Values.deployment.pod.container.startupProbe.failureThreshold }}
            periodSeconds: 10
          resources:
            {{- if eq .Values.nodeEnv "development" }}
            {{- toYaml .Values.deployment.pod.container.resources.development | nindent 12 }}
            {{- else if eq .Values.nodeEnv "integration"  }}
            {{- toYaml .Values.deployment.pod.container.resources.integration | nindent 12 }}
            {{- else }}
            {{- toYaml .Values.deployment.pod.container.resources.production | nindent 12 }}
            {{- end}}
      {{- with .Values.deployment.pod.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.deployment.pod.affinity }}
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchLabels:
                  app.kubernetes.io/name: {{ include "microservice.name" . }}
              topologyKey: "kubernetes.io/hostname"
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.deployment.pod.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

The values (indicated by `.Values.&lt;something&gt;`) in the above template come from a _values.yaml_ file.
Below is an example _values.yaml_ file to be used with the above Helm chart template.

_values.yaml_
```
imageRegistry: docker.io
imageRepository: pksilen2/backk-example-microservice
imageTag:
nodeEnv: production
auth:
  # Authorization Server Issuer URL
  # For example
  # http://keycloak.platform.svc.cluster.local:8080/auth/realms/<my-realm>
  issuerUrl:

  # JWT path where for user's roles,
  # for example 'realm_access.roles'
  jwtRolesClaimPath:
secrets:
  encryptionKey:
database:
  mySql:
    # For example:
    # my-microservice-mysql.default.svc.cluster.local or
    # cloud database host
    host:
    port: 3306
    user:
    password: &mySqlPassword ""
mysql:
  auth:
    rootPassword: *mySqlPassword
deployment:
  pod:
    annotations: {}
    imagePullSecrets: []
    container:
      imagePullPolicy: Always
      securityContext:
        privileged: false
        capabilities:
          drop:
            - ALL
        readOnlyRootFilesystem: true
        runAsNonRoot: true
        runAsUser: 65532
        runAsGroup: 65532
        allowPrivilegeEscalation: false
      env:
      startupProbe:
        failureThreshold: 30
      resources:
        development:
          limits:
            cpu: '1'
            memory: 768Mi
          requests:
            cpu: '1'
            memory: 384Mi
        integration:
          limits:
            cpu: '1'
            memory: 768Mi
          requests:
            cpu: '1'
            memory: 384Mi
        production:
          limits:
            cpu: 1
            memory: 768Mi
          requests:
            cpu: 1
            memory: 384Mi
    nodeSelector: {}
    tolerations: []
    affinity: {}
```

Especially notice the `deployment.pod.container.securityContext` object in the above file.
It is used to define the security context for a microservice container.

By default, the security context should be the following:

- Container should not be privileged
- All capabilities are dropped
- Container filesystem is read-only
- Only a non-root user is allowed to run inside the container
- Define the non-root user and group under which the container should run
- Disallow privilege escalation

You can remove things from the above list only if it is mandatory for a microservice.
For example, if a microservice must write to the filesystem for some valid reason,
then the filesystem should not be defined as read-only.

#### Example CI/CD Pipeline

Below is a GitHub Actions CI/CD workflow for a Node.js microservice. The declarative workflow is written
in YAML. The workflow file should be located in the microservice's source code repository in the _.github/workflows_ directory.
Steps in the workflow are described in more detail after the example.

<div class="sourceCodeWithoutLabel">

```
name: CI/CD workflow
on:
  workflow_dispatch: {}
  push:
    branches:
      - main
    tags-ignore:
      - '**'
jobs:
  build:
    runs-on: ubuntu-latest
    name: Build with Node version 18
    steps:
      - name: Checkout Git repo
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install NPM dependencies
        run: npm ci

      - name: Lint source code
        run: npm run lint

      - name: Run unit tests with coverage
        run: npm run test:coverage

      - name: Setup integration testing environment
        run: docker-compose --env-file .env.ci up --build -d

      - name: Run integration tests
        run: scripts/run-integration-tests-in-ci.sh

      - name: OWASP ZAP API scan
        uses: zaproxy/action-api-scan@v0.1.0
        with:
          target: generated/openapi/openApiPublicSpec.yaml
          fail_action: true
          cmd_options: -I -z "-config replacer.full_list(0).description=auth1
                              -config replacer.full_list(0).enabled=true
                              -config replacer.full_list(0).matchtype=REQ_HEADER 
                              -config replacer.full_list(0).matchstr=Authorization
                              -config replacer.full_list(0).regex=false
                              -config 'replacer.full_list(0).replacement=Bearer ZXlK...aGJHZ='"

      - name: Tear down integration testing environment
        run: docker-compose --env-file .env.ci down -v

      - name: Static code analysis with SonarCloud scan
        uses: sonarsource/sonarcloud-github-action@v1.6
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: 3rd party software license compliance analysis with FOSSA
        uses: fossas/fossa-action@v1
        with:
          api-key: ${{ secrets.FOSSA_API_KEY }}
          run-tests: false

      - name: Lint Dockerfile
        uses: hadolint/hadolint-action@v1.6.0

      - name: Log in to Docker registry
        uses: docker/login-action@v1
        with:
          registry: docker.io
          username: ${{ secrets.DOCKER_REGISTRY_USERNAME }}
          password: ${{ secrets.DOCKER_REGISTRY_PASSWORD }}

      - name: Extract latest Git tag
        uses: actions-ecosystem/action-get-latest-tag@v1
        id: extractLatestGitTag

      - name: Set up Docker Buildx
        id: setupBuildx
        uses: docker/setup-buildx-action@v1

      - name: Cache Docker layers
        uses: actions/cache@v2
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-buildx-

      - name: Extract metadata for building and pushing Docker image
        id: dockerImageMetadata
        uses: docker/metadata-action@v3
        with:
          images: ${{ secrets.DOCKER_REGISTRY_USERNAME }}/example-microservice
          tags: |
            type=semver,pattern={{version}},value=${{ steps.extractLatestGitTag.outputs.value }}

      - name: Build and push Docker image
        id: dockerImageBuildAndPush
        uses: docker/build-push-action@v2
        with:
          context: .
          builder: ${{ steps.setupBuildx.outputs.name }}
          push: true
          cache-from: type=local,src=/tmp/.buildx-cache
          cache-to: type=local,dest=/tmp/.buildx-cache
          tags: ${{ steps.dockerImageMetadata.outputs.tags }}
          labels: ${{ steps.dockerImageMetadata.outputs.labels }}

      - name: Docker image vulnerability scan with Anchore
        id: anchoreScan
        uses: anchore/scan-action@v3
        with:
          image: ${{ secrets.DOCKER_REGISTRY_USERNAME }}/example-microservice:latest
          fail-build: false
          severity-cutoff: high

      - name: Upload Anchore scan SARIF report
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: ${{ steps.anchoreScan.outputs.sarif }}

      - name: Install Helm
        uses: azure/setup-helm@v1
        with:
          version: v3.7.2

      - name: Extract microservice version from Git tag
        id: extractMicroserviceVersionFromGitTag
        run: |
          value="${{ steps.extractLatestGitTag.outputs.value }}"
          value=${value:1}
          echo "::set-output name=value::$value"

      - name: Update Helm chart versions in Chart.yaml
        run: |
          sed -i "s/^version:.*/version: ${{ steps.extractMicroserviceVersionFromGitTag.outputs.value }}/g" helm/example-microservice/Chart.yaml
          sed -i "s/^appVersion:.*/appVersion: ${{ steps.extractMicroserviceVersionFromGitTag.outputs.value }}/g" helm/example-microservice/Chart.yaml

      - name: Update Docker image tag in values.yaml
        run: |
          sed -i "s/^imageTag:.*/imageTag: {{ steps.extractMicroserviceVersionFromGitTag.outputs.value }}@${{ steps.dockerImageBuildAndPush.outputs.digest }}/g" helm/example-microservice/values.yaml

      - name: Lint Helm chart
        run: helm lint -f helm/values/values-minikube.yaml helm/example-microservice

      - name: Static code analysis for Helm chart with Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: helm/example-microservice
          quiet: false
          framework: helm
          soft_fail: false

      - name: Upload Checkov SARIF report
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: results.sarif
          category: checkov-iac-sca

      - name: Configure Git user
        run: |
          git config user.name "$GITHUB_ACTOR"
          git config user.email "$GITHUB_ACTOR@users.noreply.github.com"

      - name: Package and publish Helm chart
        uses: helm/chart-releaser-action@v1.2.1
        with:
          charts_dir: helm
        env:
          CR_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
```
</div>

1) Checkout the microservice's Git repository
2) Setup Node.js 18
3) Install NPM dependencies
4) Lint source code using the `npm run lint` command, which uses ESLint
5) Execute unit tests and report coverage
6) Set up an integration testing environment using Docker's `docker-compose up` command. After executing the command,
   the microservice is built, and all the dependencies in separate containers are started. These dependencies can include
   other microservices and, for example, a database and a message broker, like Apache Kafka
7) Execute integration tests. This script will first wait until all dependencies are up and ready. This waiting is done running a container using the _dokku/wait_ (https://hub.docker.com/r/dokku/wait) image.
8) Perform DAST with OWASP ZAP API scan. For the scan, we define the location of the OpenAPI 3.0 specification file against
   which the scan will be made. We also give command options to set a valid Authorization header for the HTTP requests made by the scan
9) Tear down the integration testing environment
10) Perform static code analysis using SonarCloud
11) Check 3rd party software license compliance using FOSSA
12) Lint Dockerfile
13) Log in to Docker Hub
14) Extract the latest Git tag for further use
15) Setup Docker Buildx and cache Docker layers
16) Extract metadata, like the tag and labels for building and pushing a Docker image
17) Build and push a Docker image
18) Perform a Docker image vulnerability scan with Anchore
19) Upload the Anchore scan report to the GitHub repository
20) Install Helm
21) Extract the microservice version from the Git tag (remove the 'v' letter before the version number)
22) Replace Helm chart versions in the Helm chart's _Chart.yaml_ file using the _sed_ command
23) Update the Docker image tag in the _values.yaml_ file
24) Lint the Helm chart and perform static code analysis for it
25) Upload the static code analysis report to the GitHub repository and perform git user configuration for the next step
26) Package the Helm chart and publish it to GitHub Pages

Some of the above steps are parallelizable, but a GitHub Actions workflow does not currently support parallel steps in
a job. In _Jenkins_, you can easily parallelize stages using a  _parallel_ block.

You could also execute the unit tests and linting when building a Docker image by adding the following steps to the _builder_
stage in the _Dockerfile_:

<div class="sourceCodeWithoutLabel">

```
RUN npm run lint
RUN npm run test:coverage
```

</div>

The problem with the above solution is that you don't get a clear indication of what failed in a build. You must examine the output of the
Docker build command to see if linting or unit tests failed. Also, you cannot use the SonarCloud GitHub Action anymore. You must implement
SonarCloud reporting in the _builder_ stage of the _Dockerfile_ (after completing the unit testing to report the unit test coverage to
SonarCloud).

### Deploy

In the _Deploy_ phase, released software is deployed automatically. After a successful CI/CD pipeline run, a software component can be automatically deployed. This is
called _continuous deployment_ (CD). Notice that both _continuous delivery_ and _continuous deployment_ are
abbreviated as CD. This can cause unfortunate misunderstandings. Continuous delivery is about releasing
software automatically, and continuous deployment is about automatically deploying released software to one or more environments. These environments include, for example, a CI/CD environment, staging environment(s)
and finally, production environment(s). There are different ways to automate software deployment. One modern
and popular way is to use GitOps, which uses a Git repository or repositories to define automatic
deployments to different environments using a declarative approach. GitOps can be configured to update an environment automatically when new software is released. This is typically done for the CI/CD environment,
which should always be kept up-to-date and contain the latest software component versions.

GitOps can also be configured to deploy automatically and regularly to a staging environment. A staging environment
replicates a production environment. It is an environment where end-to-end functional and non-functional tests are
executed before the software is deployed to production. You can use multiple staging environments to speed up
the continuous deployment to production. It is vital that all needed testing is completed
before deploying to production. Testing can take a couple of days to validate the stability of the software.
If testing in a staging environment requires three days and you set up three staging environments, you can deploy to production every day.
On the other hand, if testing in a staging environment takes one week and you have only one staging environment, you can deploy to production only once a week (Assuming here that all tests execute successfully)
Deployment to a production environment can also be automated. Or it can be triggered manually after successfully completing all testing in a staging environment.

### Operate

_Operate_ is the phase when the software runs in production. In this phase, it needs to be
secured that software updates (like security patches) are timely deployed. Also, the production
environment's infrastructure and platform should be kept up-to-date and secure.

### Monitor

_Monitor_ is the phase when a deployed software system is monitored to detect any possible problems. Monitoring
should be automated as much as possible. It can be automated by defining rules for alerts triggered when the
software system operation requires human intervention. These alerts are typically based on various metrics collected
from the microservices, infrastructure, and platform. _Prometheus_ is a popular system for
collecting metrics, visualizing them, and triggering alerts.

The basic monitoring workflow follows the below path:

1) Monitor alerts
2) If an alert is triggered, investigate metrics in relevant dashboards
3) Check logs for errors in relevant services
4) Distributed tracing can help to visualize if and how requests
   between different microservices are failing

The following needs to be done to make monitoring possible and easy:

- Each service must log to the standard output
    - If your microservice is using a 3rd party library that logs to the standard output, choose a library that allows you to configure the logging format or request the log format configurability as an enhancement to the library
    - Choose a standardized log format and use it in all microservices, e.g., _Syslog_ format or [OpenTelemetry Logs Data Model](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md)
    - Collect logs from each microservice to a centralized location, like an ElasticSearch database
- Integrate microservices to a distributed tracing tool, like Jaeger
    - A distributed tracing tool collects information about network requests microservices make
- Define what metrics are needed to be collected from each microservice
    - Collect metrics that are needed to calculate the most important _service level indicators_ (SLIs):
        - Availability
        - Error rate
        - Latency
        - Throughput
    - Instrument your microservice with the necessary code to collect the metrics. This can be done using
      a metrics collection library, like Prometheus
- Define how to visualize metrics
    - Create a main dashboard for each microservice to present the SLIs. You must also present _service level objectives_ (SLOs).
      When all SLOs are met, the dashboard should show SLI values in green. If an SLO is not met, the corresponding SLI value should be shown in red.
      You can also use yellow and orange colors to indicate that an SLO is still met, but the SLI value is no more optimal. Create troubleshooting dashboards, if needed.
      Use a visualization tool that integrates with the metrics collection tool, like Grafana with Prometheus.
    - You can usually deploy metric dashboards as part of the microservice deployment. If you are using Kubernetes,
      Prometheus and Grafana, you can create Grafana dashboards as custom resources (CRs) when using the
      Grafana Operator (https://github.com/grafana-operator/grafana-operator)
- Define alerting rules
    - First, define the service level objectives (SLOs) and base the alerting rules on them
    - An example of an SLO: "service error rate must be less than x percent"
    - If an SLO cannot be met, an alert should be triggered
    - If you are using Kubernetes and Prometheus, you can define alerts using the Prometheus Operator and PrometheusRule CRs.

Software operations staff connects back to the software development side of the DevOps lifecycle in the following
ways:

- Ask for technical support
- File a bug report
- File an improvement idea

The first one will result in a solved case or bug report. The latter two will reach the _Plan_ phase of the
DevOps lifecycle. Bug reports usually enter the _Code_ phase immediately, depending on the fault severity.

#### Logging

Implement logging in software components using the following logging severities:

- (CRITICAL/FATAL)
- ERROR
- WARNING
- INFO
- DEBUG
- TRACE

I don't usually use the CRITICAL/FATAL severity at all. It is better to report all errors with the ERROR severity because
then it is easy to query logs for errors using a single keyword, for example:

<div class="sourceCodeWithoutLabel">

```
kubectl logs <pod-name> | grep ERROR
```

</div>

You can add information to the log message itself about the criticality/fatality of an error. When you log an error for which there is
a solution available, you should inform the user about the solution in the log message, e.g., provide a link to a troubleshooting guide
or give an error code that can be used to search the troubleshooting guide.

Do not log too much information using the INFO severity because the logs might be difficult to read when there is too much
noise. Consider carefully what should be logged with the INFO severity and what can be logged with the DEBUG severity instead.
The default logging level of a microservice should be WARNING or INFO.

Use the TRACE severity to log only tracing information, e.g., detailed information related to processing a single request, event, or message.

#### OpenTelemetry Log Data Model

This section describes the essence of the OpenTelemetry log data model version 1.12.0 (Please check
[https://github.com/open-telemetry/opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification) for possible updates).

A log entry is a JSON object containing the following properties:

| Field Name | Description                                                                                                            |
|------------|------------------------------------------------------------------------------------------------------------------------|
| Timestamp  | Time when the event occurred. Nanoseconds since Unix epoch                                                             |
 | TraceId | Request trace id                                                                                                       |
| SpanId | Request span id                                                                                                        |
 | SeverityText | The severity text (also known as log level)                                                                            |
| SeverityNumber | Numerical value of the severity                                                                                        | 
 | Body | The body of the log entry. You can include ISO 8601 timestamp and the severity/log level before the actual log message |
 | Resource | Describes the source of the log entry                                                                                  |
| Attributes | Additional information about the log event. This is a JSON object where custom attributes can be given                 |

Below is an example log entry according to the OpenTelemetry log data model.

<div class="sourceCodeWithoutLabel">

```
{
  "Timestamp": "1586960586000000000",
  "TraceId": "f4dbb3edd765f620",
  "SpanId": "43222c2d51a7abe3",
  "SeverityText": "ERROR",
  "SeverityNumber": 9,
  "Body": "20200415T072306-0700 ERROR Error message comes here",
  "Resource": {
    "service.namespace": "default",
    "service.name": "my-microservice",
    "service.version": "1.1.1",
    "service.instance.id": "my-microservice-34fggd-56faae"
  },
  "Attributes": {
    "http.status_code": 500,
    "http.url": "http://example.com",
    "myCustomAttributeKey": "myCustomAttributeValue"
  }
}
```
</div>

The above JSON-format log entries might be hard to read as plain text on the console, for example, when viewing a pod's logs with the `kubectl logs` command in a Kubernetes cluster. You can create a small script that extracts only the `Body` property value from each log entry.

#### PrometheusRule Example

_PrometheusRule_ custom resources (CRs) can be used to define rules for triggering alerts. In the below example, an _example-microservice-high-request-latency_ alert will be triggered with a major severity
when the median request latency in seconds is greater than one (request_latencies_in_seconds{quantile="0.5"} > 1).

<div class="sourceCodeWithoutLabel">

```
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: example-microservice-rules
spec:
  groups:
  - name: example-microservice-rules
    rules:
    - alert: example-microservice-high-request-latency
      expr: request_latencies_in_seconds{quantile="0.5"} > 1
      for: 10m 
      labels:
        application: example-microservice
        severity: major
        class: latency
      annotations:
        summary: "High request latency on {{ $labels.instance }}"
        description: "{{ $labels.instance }} has a median request latency above 1s (current value: {{ $value }}s)"
```
</div>
