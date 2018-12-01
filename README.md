[![Coverage Status](https://coveralls.io/repos/github/luzzif/express-fs/badge.svg?branch=master)](https://coveralls.io/github/luzzif/express-fs?branch=master)
[![Build Status](https://travis-ci.com/luzzif/express-fs.svg?branch=master)](https://travis-ci.com/luzzif/express-fs)

# Express FS

Express FS bootstraps you `express`' app routing based on your project structure,
enforcing a neat project structure and removing the need for explicit
routing definition.

## Installing

```
npm install @luzzif/express-fs
```

## How to use

The library's basic concept block is the `fs-route`.

In Express FS a `fs-route` is a simple `Node` module which exports an handler and some
middleware (those are the same entities that you would normally define in `express`
in order to specify a route).

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

In order to make Express FS register one or more `fs-routes`, simply pass a glob to the 
`fsRouter` function, and pass the result to `express`' `use`.

Example:
```
// server.js

const express = require("express");
const { fsRouter } = require("@luzzif/express-fs");

const app = express().use(fsRouter(`${__dirname}/**/*.js`));
```

The snippet above registers all those `fs-routes` located under the project's root dir.

By leveraging this approach, Express FS completely eliminates the need for any routing
setup noide and enforces a clear, straight-forward project structure.
