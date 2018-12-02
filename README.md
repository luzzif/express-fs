[![Coverage Status](https://coveralls.io/repos/github/luzzif/express-fs/badge.svg?branch=master)](https://coveralls.io/github/luzzif/express-fs?branch=master)
[![Build Status](https://travis-ci.com/luzzif/express-fs.svg?branch=master)](https://travis-ci.com/luzzif/express-fs)

# Express FS

Express FS bootstraps you `express`' app routing based on your source
code location, enforcing a neat project structure and removing the
need for explicit routing definition.

## Installing

```
npm install @luzzif/express-fs
```

## How to use

The library's basic concept block is the `fs-route`.

In Express FS a `fs-route` is a simple Node module which exports a handler and some
middleware functions (those are the same entities that you would normally define in
`express` in order to specify a route).

An example of an `fs-route` can be something like this:

```
// route.js

export const handler = (request, response, next) => next();
export const middleware = (request, response, next) => next();

// Alternatively, multiple middleware functions can be specified
// like this:
// export const middleware = [
//    (request, response, next) => next(),
//    (request, response, next) => next()
// ];
```

The other aspects of an `fs-route` aside for the implementation are the path and the
method: those are simply deducted by the location of the `fs-route` module.

The location should in fact reflect the wanted `fs-route`'s path, while the last part
of the location should indicate the wanted method.

Some examples to clarify the concept (the route is expressed in the format `<method>@<path>`):

-   `a/route/path/get/index.js` => `GET@/a/route/path`
-   `foo/bar/post.js` => `POST@/foo/bar`
-   `patch.js` => `PATCH@/`

In order to make Express FS register one or more `fs-routes`, simply pass the app's root
(typically `__dirname`) and the glob referencing those Node modules containing an `fs-route`
definition to the `fsRouter` function, and pass the result to `express`' `use`.

Example:

```
// server.js

const express = require("express");
const { fsRouter } = require("@luzzif/express-fs");

const app = express().use(fsRouter(__dirname, "api/**/*.js"));
```

The snippet above registers all those `fs-routes` located under the project's root
directory `api`.

By leveraging this approach, Express FS completely eliminates the need for any routing
setup and enforces a clear, straight-forward project structure.

## Donations

Please if you like my work consider donating something. Every offer helps me giving out the best software!

-   Bitcoin: `3JFXQE6mQibmrxoq3YHKqRUHAvmXxuY8r9`
-   Ethereum: `0x35E2acD3f46B13151BC941daa44785A38F3BD97A`

Thank you all <3
