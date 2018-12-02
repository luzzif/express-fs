const { Router } = require("express");
const glob = require("glob");
const router = Router();
const path = require("path");
const escapeStringRegexp = require("escape-string-regexp");

let cleansingRegex = null;

const fsRouter = (appRoot, globString, options) => {
    const { verbose } = options || {};
    glob.sync(path.join(appRoot, globString), { absolute: true }).forEach(
        fsPath => {
            const { method, path, handler, middleware } = getRouteFromFsPath(
                fsPath,
                appRoot
            );
            if (!router[method]) {
                throw new Error(`invalid method ${method} for route ${path}`);
            }
            if (!handler) {
                throw new Error(
                    `undefined handler for route ${method}@${path}`
                );
            }
            router[method](path, middleware || [], handler);
            if (verbose) {
                console.log(`setup route ${method}@${path}`);
            }
        }
    );
    return router;
};

const getSanitizedFsPath = (fsPath, appRoot) => {
    return !fsPath
        ? ""
        : fsPath
              .replace(appRoot, "")
              .replace(/\.\/|^\/|\/$|\/index\.js|\.js/g, "");
};

const getRouteFromFsPath = (fsPath, appRoot) => {
    const sanitizedPath = getSanitizedFsPath(fsPath, appRoot);
    const { method, path } = getMethodAndPath(sanitizedPath);
    const route = require(fsPath);
    const { handler, middleware } = route;
    return {
        method,
        path,
        handler,
        middleware
    };
};

const getMethodAndPath = rawPath => {
    const lastSlashIndex = rawPath.lastIndexOf("/");
    if (lastSlashIndex < 0) {
        return {
            method: rawPath,
            path: "/"
        };
    } else {
        return {
            method: rawPath.substring(lastSlashIndex + 1),
            path: rawPath.substring(0, lastSlashIndex)
        };
    }
};

module.exports = {
    fsRouter,
    getRouteFromFsPath,
    getSanitizedFsPath,
    getMethodAndPath
};
