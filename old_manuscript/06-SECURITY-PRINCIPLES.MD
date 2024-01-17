# Security First Principle

> Shift security implementation to the left. Implement security-related features first, not last.

Suppose that security-related features are implemented only in a very late phase of a project. In that case, there is a greater
possibility of not finding time to implement them or forgetting to implement them. For that reason, security-related features should be implemented first, not last.
The threat modeling process described in the next section should be used to identify the potential threats and provide
a list of security features that need to be implemented as threat countermeasures.

## Threat Modelling

The threat modeling process enables you to identify, quantify, and address security risks associated with
an application. The threat modeling process is composed of three high-level steps:

-  Decompose application
-  Determine and rank threats
-  Determine countermeasures and mitigation

### Decompose Application

The application decomposition step is to gain knowledge of what parts the application is composed of, the external dependencies,
and how they are used. This step can be performed after the application architecture is designed. The results of this step are:

- Identify an attacker's entry points to the application
- Identify assets under threat. These assets are something that an attacker is interested in
- Identify trust levels, e.g., what users with different user roles can do

### Determine and Rank Threats

To determine possible threats, a threat categorization methodology should be used. The STRIDE method categorizes
threats to the following categories:

| Category | Description                                                                             |
|----------|-----------------------------------------------------------------------------------------|
| Spoofing | Attacker acting as another user without real authentication or using stolen credentials |
| Tampering | Attacker maliciously changing data                                                       | 
| Repudiation | Attacker being able to perform prohibited operations                                    |
| Information disclosure | Attacker gaining access to sensitive data                                               |
| Denial of service | Attacker trying to make the service unusable                                            |
| Elevation of privilege | Attacker gaining unwanted access rights                                                 |

The Application Security Frame (ASF) categorizes application security features into the following categories:

| Category        | Description                                                                            |
|-----------------|----------------------------------------------------------------------------------------|
| Audit & Logging | Logging user actions to detect, e.g., repudiation attacks                               |
| Authentication | Prohibit identity spoofing attacks                                                     |
| Authorization | Prohibit elevation of privilege attacks                                                |
| Configuration Management | Proper storage of secrets and configuring the system with the least privileges                 |
| Data protection in transit and rest | Using secure protocols like TLS, encrypting sensitive information like PII in databases |
| Data validation | Validate input data from users to prevent, e.g., injection and ReDoS attacks            |
| Exception management | Do not reveal implementation details in error messages to end-users                    |

When using either of the above-described threat categorization methodologies, threats in each category should be listed based
on the information about the decomposed application: what are the application entry points and assets that
need to be secured? After listing potential threats in each category, the threats should be ranked. There
are several ways to rank threats. The simplest way to rank threats is to put them in one of the three categories based on
the risk: high, medium, and low. As a basis for the ranking, you can use information about the threat's probability and
how big an adverse effect (impact) it has. The idea of ranking is to prioritize security features. Security features for high-risk threats should be implemented first.

### Determine Countermeasures and Mitigation

Determining countermeasures step should provide a list of user stories for the needed security
features. These security features should eliminate or at least mitigate the threats. If you have a threat that cannot be eliminated
or mitigated, you can accept the risk if the threat is categorized as a low-risk threat.
A low-risk threat is a threat with a low impact on the application, and the probability of the threat
realization is low. Suppose you have found a threat with a very high risk in your application, and you cannot eliminate
or mitigate that threat. In that case, you should eliminate the threat by completely removing the threat-related features from the application.

## Security Features

### Authentication and Authorization

When implementing user authentication and authorization for an application, use a 3rd party authorization service.
Don't try to build an authorization service by yourself. You can easily make mistakes. Also, it can be a security risk if your
application handles plaint-text user credentials. It is better to use a battle-tested solution that has the most significant bugs corrected and can store user credentials securely.
We use _Keycloak_ as an authorization service in the coming examples.

Also, try using established 3rd party libraries as much as possible instead of writing all authorization-related code yourself. It is also helpful to create a single frontend authentication/authorization library and
use that same library in multiple projects instead of constantly implementing authentication and authorization-related functionality from scratch in different projects.

#### OpenID Connect Authentication and Authorization in Frontend

Regarding frontend authorization, attention must be paid to the secure storage of authorization-related secrets
like _code verifier_ and _tokens_. Those must be stored in a secure location in the browser. Below is a list
of some insecure storing mechanisms:

- Cookies
  - Sent automatically, a CSRF threat
- Session/Local Storage
  - Easily stolen by malicious code (XSS threat)
- Encrypted session/local storage
  - Easily stolen by malicious code because the encryption key is in plain text
- Global variable
  - Easily stolen by malicious code (XSS threat)

Storing secrets in closure variables is not inherently insecure, but secrets are lost on page refresh or new page.

Below is an example that uses a service worker
as a secure storage of secrets. The additional benefit of a service worker is that it does not allow
malicious 3rd party code to modify the service worker's `fetch` method so that it can, for example, steal access tokens.

It is easy for malicious code to change the global `fetch` function:

<div class="sourceCodeWithoutLabel">

```
fetch = () => console.log('hacked');
fetch() // prints 'hacked' to console
```
</div>

Below is a more realistic example:

<div class="sourceCodeWithoutLabel">

```
originalFetch = fetch;
fetch = (url, options) => {
  // Implement malicious attack here
  // For example: change some data in the request body

  // Then call original fetch implementation
  return originalFetch(url, options); 
}
```
</div>

Of course, one can ask: why is it possible to modify the built-in method on the global object
like that? Of course, it should not be possible, but unfortunately, it is.

Let's create a Vue.js application that performs authentication and authorization using the OpenID Connect protocol,
an extension of the OAuth2 protocol.

In the main module below, we set up the global `fetch` to always return an error and only allow our `tryMakeHttpRequest` function
to use the original global `fetch` method. Then we register a service worker. If the service worker has already been registered, it
is not registered again. Finally, we create the application (`App` component), activate the router, activate the Pinia middleware for state management, and mount the application
to a DOM node:

_main.ts_
```
import { setupFetch } from "@/tryMakeHttpRequest";
setupFetch();
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import router from "@/router";

if ("serviceWorker" in navigator) {
  await navigator.serviceWorker.register("/serviceWorker.js");
}

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount("#app");
```

Below is the definition of the `App` component. After mounting, it will check whether the user is already authorized.

If the user is authorized, his/hers authorization information
will be fetched from the service worker, and the user's first name will be updated in the authorization information store. The user will
be forwarded to the _Home_ page.

If the user is not authorized, authorization will be performed.

_App.vue_
```
<template>
  <HeaderView />
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import authorizationService from "@/authService";
import { useAuthInfoStore } from "@/stores/authInfoStore";
import HeaderView from "@/HeaderView.vue";
import tryMakeHttpRequest from "@/tryMakeHttpRequest";

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const response = await tryMakeHttpRequest("/authorizedUserInfo");
  const responseBody = await response.text();
  if (responseBody !== "") {
    const authorizedUserInfo = JSON.parse(responseBody);
    const { setFirstName } = useAuthInfoStore();
    setFirstName(authorizedUserInfo.firstName);
    router.push({ name: "home" });
  } else if (route.path !== '/auth') {
    authorizationService
      .tryAuthorize()
      .catch(() =>  router.push({ name: "auth-error" }));
  }
});
</script>
```

_authInfoStore.ts_
```
import { ref } from "vue";
import { defineStore } from "pinia";

export const useAuthInfoStore =
  defineStore("authInfoStore", () => {
    const firstName = ref('');

    function setFirstName(newFirstName: string) {
      firstName.value = newFirstName;
    }

    return { firstName, setFirstName };
  });
```

The header of the application displays the first name of the logged-in user and a button for logging the user out:

_HeaderView.vue_
```
<template>
  <span>{{authInfoStore.firstName}}</span>
  &nbsp;
  <button @click="logout">Logout</button>
</template>

<script setup>
import { useRouter } from "vue-router";
import authorizationService from "@/authService";
import { useAuthInfoStore } from "@/stores/authInfoStore";

const authInfoStore = useAuthInfoStore();
const router = useRouter();

function logout() {
  authorizationService
    .tryLogout()
    .catch(() => router.push({ name: "auth-error" }));
}
</script>
```

The `tryMakeHttpRequest` function is a wrapper around the browser's global `fetch` method. It will start an
authorization procedure if an HTTP request returns the HTTP status code 403 _Forbidden_.

_tryMakeHttpRequest.ts_
```
import authorizationService from "@/authService";

let originalFetch: typeof fetch;

export default function tryMakeHttpRequest(
  url: RequestInfo,
  options?: RequestInit
): Promise<Response> {
  return originalFetch(url, options).then(async (response) => {
    if (response.status === 403) {
      try {
        await authorizationService.tryAuthorize();
      } catch {
        // Handle auth error, return response with status 403
      }
    }

    return response;
  });
}

export function setupFetch() {
  originalFetch = fetch;
  // @ts-ignore
  // eslint-disable-next-line no-global-assign
  fetch = () =>
    Promise.reject(new Error('Global fetch not implemented'));
}
```

Below is the implementation of the service worker:

_serviceWorker.js_
```
const allowedOrigins = [
  "http://localhost:8080", // IAM in dev environment
  "http://localhost:3000", // API in dev environment
  "https://software-system-x.domain.com" // prod environment
];

const apiEndpointRegex = /\/api\//;
const tokenEndpointRegex = /\/openid-connect\/token$/;
const data = {};

// Listen to messages that contain data
// to be stored inside the service worker
addEventListener("message", (event) => {
  if (event.data) {
    data[event.data.key] = event.data.value;
  }
});

function respondWithUserInfo(event) {
  const response = 
    new Response(data.authorizedUserInfo
                   ? JSON.stringify(data.authorizedUserInfo)
                   : '');
  event.respondWith(response);
}

function respondWithIdToken(event) {
  const response = new Response(data.idToken 
                                  ? data.idToken
                                  : '');
  event.respondWith(response);
}

function respondWithTokenRequest(event) {
  let body = "grant_type=authorization_code";
  body += `&code=${data.code}`;
  body += `&client_id=app-x`;
  body += `&redirect_uri=${data.redirectUri}`;
  body += `&code_verifier=${data.codeVerifier}`;
  const tokenRequest = new Request(event.request, { body });
  
  // Verify that state received from the authorization
  // server is same as sent by this app earlier
  if (data.state === data.receivedState) {
    event.respondWith(fetch(tokenRequest));
  } else {
    // Handle error
  }
}

function respondWithApiRequest(event) {
  const headers = new Headers(event.request.headers);
      
  // Add Authorization header that contains the access token
  if (data.accessToken) {
    headers.append("Authorization",
                   `Bearer ${data.accessToken}`);
  }

  const authorizedRequest = new Request(event.request, {
    headers
  });

  event.respondWith(fetch(authorizedRequest));
}

function fetchHandler(event) {
  const requestUrl = new URL(event.request.url);

  if (event.request.url.endsWith('/authorizedUserInfo') &&
      !apiEndpointRegex.test(requestUrl.pathname)) {
    respondWithUserInfo(event);  
  } else if (event.request.url.endsWith('/idToken') &&
             !apiEndpointRegex.test(requestUrl.pathname)) {
    respondWithIdToken(event);
  } else if (allowedOrigins.includes(requestUrl.origin)) {
    if (tokenEndpointRegex.test(requestUrl.pathname)) {
      respondWithTokenRequest(event);
    } else if (apiEndpointRegex.test(requestUrl.pathname)) {
      respondWithApiRequest(event);
    }
  } else {
    event.respondWith(fetch(event.request));
  }
}

// Intercept all fetch requests and handle
// them with 'fetchHandler'
addEventListener("fetch", fetchHandler);
```

Authorization using the OAuth2 Authorization Code Flow is started with a browser redirect to a URL of the following kind:

<div class="sourceCodeWithoutLabel">

```
https://authorization-server.com/auth?response_type=code&client_id=CLIENT_ID&redirect_uri=https://example-app.com/cb&scope=photos&state=1234zyx...ghvx3&code_challenge=CODE_CHALLENGE&code_challenge_method=SHA256
```
</div>

The query parameters in the above URL are the following:

* response_type=code - Indicates that you expect to receive an authorization code
* client_id - The client id you used when you created the client on the authorization server
* redirect_uri - Indicates the URI to redirect the browser to after authorization is completed. You need to define this URI also in the authorization server.
* scope - One or more scope values indicating which parts of the user's account you wish to access. Scopes should be separated by URL-encoded space characters
* state - A random string generated by your application, which you'll verify later
* code_challenge - PKCE extension: URL-safe base64-encoded SHA256 hash of the code verifier. A code verifier is a random string secret you generate
* code_challenge_method=S256 - PKCE extension: indicates which hashing method is used (S256 means SHA256)

We need to use the PKCE extension as an additional security measure because we perform the Authorization Code Flow in the frontend instead of the backend.

If authorization is successful, the authorization server will redirect the browser to the above-given _redirect_uri_ with
_code_ and _state_ given as URL query parameters, for example:

<div class="sourceCodeWithoutLabel">

```
https://example-app.com/cb?code=AUTH_CODE_HERE&state=1234zyx...ghvx3
```
</div>

* code - The authorization code returned from the authorization server
* state - The same state value that you passed earlier

After the application is successfully authorized, tokens can be requested with the following kind of HTTP POST request:

<div class="sourceCodeWithoutLabel">

```
POST https://authorization-server.com/token
  
  grant_type=authorization_code&
  code=AUTH_CODE_HERE&
  redirect_uri=REDIRECT_URI&
  client_id=CLIENT_ID&
  code_verifier=CODE_VERIFIER
```
</div>

* grant_type=authorization_code - The grant type for this flow is _authorization_code_
* code=AUTH_CODE_HERE - This is the code you received when the browser was redirected back to your application from the authorization server.
* redirect_uri=REDIRECT_URI - Must be identical to the redirect URI provided earlier during authorization
* client_id=CLIENT_ID - The client id you used when you created the client on the authorization server
* code_verifier=CODE_VERIFIER - The random string secret you generated earlier

Below is the implementation of an `AuhtorizationService` class. It provides methods for authorization, getting
tokens and logout.

_AuthorizationService.ts_

<code class="sourceCodeWithoutLabel">

```
import pkceChallenge from "pkce-challenge";
import jwt_decode from "jwt-decode";
import tryMakeHttpRequest from "@/tryMakeHttpRequest";
import type { useAuthInfoStore } from "@/stores/authInfoStore";

interface AuthorizedUserInfo {
  readonly userName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

export default class AuthorizationService {
  constructor(
    private readonly oidcConfigurationEndpoint: string,
    private readonly clientId: string,
    private readonly authRedirectUrl: string,
    private readonly loginPageUrl: string
  ) {}

  // Try to authorize the user using the OpenID Connect
  // Authorization Code Flow
  async tryAuthorize(): Promise<void> {
    // Store the redirect URI in service worker
    navigator.serviceWorker?.controller?.postMessage({
      key: "redirectUri",
      value: this.authRedirectUrl
    });

    // Store the state secret in service worker
    const state = crypto.randomUUID();
    navigator.serviceWorker?.controller?.postMessage({
      key: "state",
      value: state,
    });

    // Generate a PKCE challenge and store
    // the code verifier in service worker
    const challenge = pkceChallenge(128);
    navigator.serviceWorker?.controller?.postMessage({
      key: "codeVerifier",
      value: challenge.code_verifier,
    });

    const authUrl = await this.tryCreateAuthUrl(state, challenge);

    // Redirect the browser to authorization server's
    // authorization URL
    location.href = authUrl;
  }

  // Try get access, refresh and ID token from
  // the authorization server's token endpoint
  async tryGetTokens(
    authInfoStore: ReturnType<typeof useAuthInfoStore>
  ): Promise<void> {
    const oidcConfiguration = await this.getOidcConfiguration();
    
    const response =
      await tryMakeHttpRequest(oidcConfiguration.token_endpoint, {
        method: "post",
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const tokens = await response.json();
    this.storeTokens(tokens);
    this.storeAuthorizedUserInfo(tokens.id_token, authInfoStore);
  }

  // Logout and redirect to login page
  async tryLogout(): Promise<void> {
    const oidcConfiguration = await this.getOidcConfiguration();
    
    // Clear authorized user info in service worker
    navigator.serviceWorker?.controller?.postMessage({
      key: "authorizedUserInfo",
      value: undefined
    });

    // Get ID token from service worker
    const response = await tryMakeHttpRequest("/idToken");
    const idToken = await response.text();

    // Redirect browser to authorization server's
    // logout endpoint
    if (idToken !== "") {
      location.href =
        oidcConfiguration.end_session_endpoint +
        `?post_logout_redirect_uri=${this.loginPageUrl}` +
        `&id_token_hint=${idToken}`;
    } else {
      location.href = oidcConfiguration.end_session_endpoint;
    }
  }

  private async getOidcConfiguration(): Promise<any> {
    const response =
      await tryMakeHttpRequest(this.oidcConfigurationEndpoint);
    
    return response.json();
  }
  
  private async tryCreateAuthUrl(
    state: string,
    challenge: ReturnType<typeof pkceChallenge>
  ) {
    const oidcConfiguration = await this.getOidcConfiguration();
    let authUrl = oidcConfiguration.authorization_endpoint;
    
    authUrl += "?response_type=code";
    authUrl += "&scope=openid+profile+email";
    authUrl += `&client_id=${this.clientId}`;
    authUrl += `&redirect_uri=${this.authRedirectUrl}`;
    authUrl += `&state=${state}`;
    authUrl += `&code_challenge=${challenge.code_challenge}`;
    authUrl += "&code_challenge_method=S256";
    
    return authUrl;
  }
  
  private storeTokens(tokens: any) {
    navigator.serviceWorker?.controller?.postMessage({
      key: "accessToken",
      value: tokens.access_token,
    });

    navigator.serviceWorker?.controller?.postMessage({
      key: "refreshToken",
      value: tokens.refresh_token,
    });

    navigator.serviceWorker?.controller?.postMessage({
      key: "idToken",
      value: tokens.id_token,
    });
  }
  
  private storeAuthorizedUserInfo(
    idToken: any,
    authInfoStore: ReturnType<typeof useAuthInfoStore>
    ) {
    const idTokenClaims: any = jwt_decode(idToken);

    const authorizedUserInfo = {
      userName: idTokenClaims.preferred_username,
      firstName: idTokenClaims.given_name,
      lastName: idTokenClaims.family_name,
      email: idTokenClaims.email,
    };

    navigator.serviceWorker?.controller?.postMessage({
      key: "authorizedUserInfo",
      value: authorizedUserInfo
    });

    authInfoStore.setFirstName(idTokenClaims.given_name);
  }
}
```

</code>

Below is an example response you get when you execute the `tryMakeHttpRequest` function in the `tryGetTokens` method:

<div class="sourceCodeWithoutLabel">

```
{
  "access_token": "eyJz93a...k4laUWw",
  "id_token": "UFn43f...c5vvfGF",
  "refresh_token": "GEbRxBN...edjnXbL",
  "token_type": "Bearer",
  "expires_in": 3600
}
```
</div>

The `AuthorizationCallback` component is the component that will be rendered when the authorization
server redirects the browser back to the application after successful authorization. This component
stores the authorization code and the received state in the service worker and
initiates a request for tokens. After receiving tokens, it will route the application to the
home page. As an additional security measure, the token request will only be performed if the original _state_ and _received state_ are equal. 
This check is done in the service worker code.

_AuthorizationCallback.vue_
```
<template>
  <div></div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import authorizationService from "@/authService";
import { useAuthInfoStore } from "@/stores/authInfoStore";

const { query } = useRoute();
const router = useRouter();
const authInfoStore = useAuthInfoStore();

onMounted(async () => {
  // Store authorization code in service worker
  navigator.serviceWorker?.controller?.postMessage({
    key: "code",
    value: query.code,
  });
  
  // Store received state in service worker
  navigator.serviceWorker?.controller?.postMessage({
    key: "receivedState",
    value: query.state,
  });

  // Try fetch tokens 
  try {
    await authorizationService.tryGetTokens(authInfoStore);
    router.push({ name: "home" });
  } catch (error) {
    router.push({ name: "auth-error" });
  }
});
</script>
```

Other UI components the application uses are defined below:

_AuthorizationError.vue_
```
<template>
  <div>Error</div>
</template>
```

_LoginView.vue_
```
<template>
  <div>Login</div>
</template>
```

_HomeView.vue_
```
<template>
  <div>Home</div>
</template>
```

The application's router is the following:

_router.ts_
```
import { createRouter, createWebHistory } from "vue-router";
import AuthorizationCallback from "@/AuthorizationCallback.vue";
import AuthorizationError from "@/AuthorizationError.vue";
import HomeView from "@/HomeView.vue";
import LoginView from "@/LoginView.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
  },
  {
    path: "/auth",
    name: "auth",
    component: AuthorizationCallback,
  },
  {
    path: "/auth-error",
    name: "auth-error",
    component: AuthorizationError,
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

The below _authService_ module contains definitions of needed constants and creates an instance of the `AuthorizationService` class.
The below code contains values for a local development environment. In real life, these values should be taken from environment variables.
The below values work if you have a Keycloak service running at _localhost:8080_ and the Vue app
running at _localhost:5173_. You must create a client in the Keycloak with the name 'app-x'. Additionally, you
must define a valid redirect URI and add an allowed web origin. Lastly, you must configure
a valid post-logout redirect URI (see the below image). The default access token lifetime in Keycloak
is just one minute. You can increase that for testing purposes in the realm settings (the token tab)

![Fig 6.1 Keycloak Settings for the Client](images/Capture.PNG)

_authService.ts_
```
import AuthorizationService from "@/AuthorizationService";

const oidcConfigurationEndpoint =
  "http://localhost:8080/realms/master/.well-known/openid-configuration";

const clientId = "app-x";
const redirectUrl = "http://127.0.0.1:5173/auth";
const loginPageUrl = "http://127.0.0.1:5173";

const authorizationService = new AuthorizationService(
  oidcConfigurationEndpoint,
  clientId,
  redirectUrl,
  loginPageUrl
);

export default authorizationService;
```

#### OAuth2 Authorization in Backend

Only let authorized users access resources. The best way not to forget to
implement authorization is to deny access to resources by default. You can require that an authorization annotation must be present in all controller methods. If an API endpoint does not require authorization, a special annotation like `@AllowAnyone` could be used. If a controller method is missing an authorization annotation, an exception can be thrown, for example. This way, you can never forget to add an authorization annotation to a controller method.

Broken access control is number one in the OWASP Top 10 for 2021. Especially remember to
disallow users to create, view, edit or delete resources belonging to someone else by providing someone else's unique identifier.

Below is a JWT-based authorizer class that can be used in a backend API service implemented with the Express framework:

_JwtAuthorizer.ts_
```
import _ from 'lodash';
import { decode, verify } from 'jsonwebtoken';
import { fetch } from 'fetch-h2';
import { Request } from 'express';
import jwks from 'jwks-rsa';
import throwException from './throwException';

export default class JwtAuthorizer implements
                       Authorizer {
  private readonly oidcConfigurationEndpoint: string;
  private readonly rolesClaimPath: string;
  private readonly getUserIdBySubjectUrl: string;
  private jwksClient: any;

  constructor() {
    this.oidcConfigurationEndpoint =
     process.env.OIDC_CONFIGURATION_ENDPOINT ??
      throwException('OIDC_CONFIGURATION_ENDPOINT is not defined');
      
    // With Keycloak you can use e.g., realm_access.roles
    this.rolesClaimPath = process.env.JWT_ROLES_CLAIM_PATH ??
      throwException('JWT_ROLES_CLAIM_PATH is not defined')
    
    // This is the URL where you can fetch the user id for a
    // specific 'sub' claim value in the access token
    this.getUserIdBySubjectUrl =
      process.env.GET_USER_ID_BY_SUBJECT_URL ??
      throwException('GET_USER_ID_BY_SUBJECT_URL is not defined');
  }
  
  async tryAuthorize(
    request: Request
  ): Promise<void> {
    await this.tryGetClaims(request.headers.authorization);
  }
  
  // Authorize a user for his/hers own resources only
  // Note! For some IAM systems other than Keycloak,
  // you might need to use 'uid'
  // claim instead of 'sub' to get really unique user id
  async tryAuthorizeForUserOwnResourcesOnly(
    userId: number,
    request: Request
  ): Promise<void> {
    const claims =
      await this.tryGetClaims(request.headers.authorization);

    const response =
      await fetch(this.getUserIdBySubjectUrl +
                  `?sub=${claims.sub}`);
    
    const userIdObject = await response.json();

    if (userId !== userIdObject.userId) {
      throw new Error('...');
    }
  }

  async tryAuthorizeIfUserHasOneOfRoles(
    allowedRoles: string[],
    request: Request):
  Promise<void> {
    const claims =
      await this.tryGetClaims(request.headers.authorization);

    const roles = _.get(claims, this.rolesClaimPath);

    const isAuthorized =
      allowedRoles.some((allowedRole) =>
        roles.includes(allowedRole));

    if (!isAuthorized) {
      throw new Error('...');
    }
  }

  private async tryGetClaims(
    authHeader: string | undefined
  ): Promise<any> {
    const response = await fetch(this.oidcConfigurationEndpoint);
    const oidcConfiguration = await response.json();

    if (!this.jwksClient) {
      this.jwksClient =
        jwks({ jwksUri: oidcConfiguration.jwks_uri });
    }

    const jwt = authHeader?.split('Bearer ').pop();
    const decodedJwt = decode(jwt ?? '', { complete: true });
    const kid = decodedJwt?.header?.kid;
    const signingKey = await this.jwksClient.getSigningKey(kid);
    return verify(jwt ?? '', signingKey.getPublicKey());
  }
}

export const authorizer = new JwtAuthorizer();
```

Below is an example API service that utilizes the above-defined `JwtAuthorizer`:

_app.ts_
```
import express, { Response, Request } from 'express';
import cors from 'cors';
import { authorizer } from './JwtAuthorizer';

const app = express();
app.use(express.json());
app.use(cors());

function sendAuthError(request: Request, response: Response) {
  if (request.headers.authorization) {
    response
      .status(403)
      .json({ error: 'Unauthorized' });
  } else {
    response
      .status(401)
      .json({ error: 'Unauthenticated' });
  }
}

app.get('/api/sales-items', () => {
  // No authorized needed
  // Send sales items
});

app.post('/api/messages', (request, response) => {
  authorizer.tryAuthorize(request)
    .then(() => {
      // Create a message
    }).catch(() => sendAuthError(request, response));
});

app.post('/api/orders', (request, response) => {
  authorizer
    .tryAuthorizeForUserOwnResourcesOnly(request.body.userId,
                                         request)
    .then(() => {
      // Create an order for the user,
      // user cannot create orders for other users
    }).catch(() => sendAuthError(request, response));
});

app.delete('/api/sales-items', (request, response) => {
  authorizer
    .tryAuthorizeIfUserHasOneOfRoles(['admin'], request)
    .then(() => {
      // Only admin user can delete all sales items
    }).catch(() => sendAuthError(request, response));
});

app.listen(3000);
```

Below is a simple example of implementing an OAuth2 resource server using Spring Boot. First, you need to add
the OAuth2 resource server dependency:

_build.gradle_
```
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
}
```

Next, you need to configure a JWT issuer URL. In the below example, we use a localhost Keycloak service.

_application.yml_
```
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/master/
```


Then you will configure which API endpoints need to be authorized with a valid JWT.
The below example requires requests to all API endpoints to contain a valid JWT.

_SecurityConfiguration.java_
```
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
public class SecurityConfiguration 
                extends WebSecurityConfigurerAdapter {
  @Override
  protected final void configure(
    final HttpSecurity httpSecurity
  ) throws Exception {
    httpSecurity.authorizeRequests()
      .antMatchers("/**")
      .authenticated()
      .and()
      .oauth2ResourceServer()
      .jwt();
  }
}
```

In a REST controller, you can inject the JWT using the `AuthenticationPrincipal` annotation to perform additional
authorization in the controller methods:

_SalesItemController.java_
```
@RestController
@RequestMapping(SalesItemController.API_ENDPOINT)
@Slf4j
public class SalesItemController {
  public static final String API_ENDPOINT = "/salesitems";

  @Autowired
  private SalesItemService salesItemService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public final SalesItem createSalesItem(
    @RequestBody final SalesItemArg salesItemArg,
    @AuthenticationPrincipal final Jwt jwt
  ) {
    log.info("Username: {}",
             jwt.getClaimAsString("preferred_username"));

    // You can now use the "jwt" object to get a claim about
    // user's roles and verify a needed role, for example.
    return salesItemService.createSalesItem(salesItemArg);
  }
}
```

### Password Policy

Implement a password policy requiring strong passwords and prefer passphrases over passwords. A passphrase is supposed to contain multiple words. Passphrases are harder to guess by attackers and easier to remember
by users than strong passwords. Allow passphrases to contain Unicode characters. This allows
users to create passphrases using their mother tongue.

You should require that passwords are strong and match the following criteria:

- At least 12 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- May not contain the username
- May not contain too many identical digits or letters, e.g., a password containing "111111",  "aaaaaa," or "1a1a1a1a1a" should be denied
- May not contain too many consecutive numbers or letters, e.g., a password containing "12345", "56789", "abcdef", or "klmno" should be denied
- May not contain too many adjacent letters in the keyboard, e.g., a password containing "qwerty" should be denied
- May not contain a black-listed word. Black-list all commonly used, easy-to-guess passwords.

### Cryptography

The following are the key security features to implement related to cryptography:

- Do not transmit data in clear text
  - You don't need to implement HTTPS in all the microservices because you can set up a service mesh and configure it to implement mTLS between services
- Do not store sensitive information like personally identifiable information (PII) in clear text
  - Encrypt sensitive data before storing it in a database and decrypt it upon fetching from the database
  - Remember to identify which data is classified as sensitive according to privacy laws, regulatory requirements, or business needs
  - Do not use legacy protocols such as FTP and SMTP for transporting sensitive data
  - Discard sensitive data as soon as possible or use tokenization (e.g., PCI DSS compliant) or even truncation
  - Do not cache sensitive data
- Do not use old/weak cryptographic algorithms. Use robust algorithms like SHA-256 or AES-256
- Do not allow using default passwords or encryption keys in a production environment
  - You can implement validation logic for passwords/encryption keys in microservices when the microservices run in production. If a microservice's passwords/encryption keys are not strong enough, the microservice should not run but exit with an error

### Denial-of-service (DoS) Prevention

DoS prevention should happen at least in the following ways:

- Establish request rate limiting for microservices. It can be done at the API gateway level or by the cloud provider
- Use Captcha to prevent non-human (robotic) users from performing potentially expensive operations like creating new
  resources or fetching large resources, like large files, for example

### SQL Injection Prevention

The following are the key features to implement to prevent SQL injection attacks:

- Use parameterized SQL statements. Do not concatenate user-supplied data directly to an SQL statement string
- Remember that you cannot use parameterization in all parts of an SQL statement. If you must put user-supplied data
  into an SQL statement without parameterization, sanitize/validate it first. For example, for `LIMIT`, you must validate
  that the user-supplied value is an integer and in a given range
- Migrate to use ORM (Object Relational Mapping)
- Use proper limiting on the number of fetched records within queries to prevent mass disclosure of records
- Verify the correct shape of the first query result row. Do not send the query result to the client if the shape of the data in the first row is wrong, e.g., it contains the wrong fields.

### Security Configuration

By default, the security context for containers should be the following:

- Container should not be privileged
- All capabilities are dropped
- Container filesystem is read-only
- Only a non-root user is allowed to run inside the container
- Define the non-root user and group under which the container should run
- Disallow privilege escalation

Implement the sending of security-related HTTP response headers in the API gateway:

- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age: ; includeSubDomains`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: frame-ancestors 'none'`
- `Content-Type: application/json`
- If caching is not specifically enabled and configured, the following header should be set: `Cache-Control: no-store`
- `Access-Control-Allow-Origin`: https://your_domain_here

### Automatic Vulnerability Scanning

Implement automatic vulnerability scanning in microservice CI/CD pipelines and
the container registry at regular intervals. All software components of the
software system should be scanned. Correct at least all critical and high vulnerabilities immediately.

### Integrity

Use only container images with tags that have an SHA digest. If an
attacker succeeds in publishing a malicious container image with the same tag, the SHA digest prevents from taking that malicious image into use. Ensure you use libraries and
dependencies from trusted sources, like NPM or Maven. You can also host internal mirrors
of repositories to avoid accidentally using any untrusted repository. Ensure a review process
exists for all code (source, deployment, infrastructure) and configuration changes so that no malicious code
can be introduced into your software system.

### Error Handling

Ensure that error messages in API responses do not contain sensitive information.
Do not add stack traces to error responses transmitted to clients in a production environment.

### Audit Logging

Auditable end-user-related events, such as logins, failed logins, unauthorized or invalid requests, and high-value transactions, should be logged and stored
in an external audit logging system. The audit logging system should automatically detect
suspicious action related to an end-user and alert about it.

### Input Validation

Always validate input from untrusted sources, like from an end-user. There are many ways to implement validation, and several libraries are available for that purpose. Let's assume you use ORM
and implement entities and data transfer objects. The best way to ensure proper validation is to require that each
entity/DTO property must have a validation annotation. If a property in an entity or DTO does not
require any validation, annotate that property with a special annotation, like `@AnyValue`, for example.

Remember to validate unvalidated data from all possible sources:

- Command line arguments
- Environment variables
- Standard input (stdin)
- File from the file system
- Data from a socket (network input)
- UI input

#### Validating Numbers

When validating numeric values, always validate that a value is in a specified range. For example, if you use an unvalidated number to check if a loop should end and that number is very large, it can cause a denial of service (DoS). If a number should be an integer, don't allow floating-point values.

#### Validating Strings

When validating a string, always validate the maximum length of the string first. Only after that perform additional
validation. Validating a long string using a regular expression can cause a regular expression denial of service (ReDoS).
You should avoid crafting your own regular expressions for validation purposes, instead use a ready-made library that contains battle-tested
code. Consider also using the [Google RE2 library](https://github.com/google/re2). It is safer than regular expression functionality
provided by many language runtimes, and your code will be less susceptible to ReDoS.

#### Validating Arrays

When validating an array, you can validate the size of the array not being too small or large, and you
can validate the uniqueness of values if needed. Also, remember to validate each value in the array
separately.

#### Validating Objects

Validate an object by validating each property of the object separately.
Remember to validate nested objects also.

#### Validation Library Example

Check _Appendix A_ for creating a TypeScript validation library using the _validated-types_ NPM library.
The validation library can validate JavaScript objects, e.g., parsed JSON/YAML-format configuration, environment variables (process.env object), and input DTOs. The validation library accepts an object schema and validates an object according to the given schema and
produces a strongly typed validated object.

