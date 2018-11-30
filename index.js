const { Router } = require("express");
const glob = require("glob");
const router = Router();
const cleansingRegex = new RegExp(
    `(\\.\\/)+|(${require("app-root-path").path.replace(
        "/",
        "\\/"
    )})|(\\/index\\.js)|(\\.js)+`,
    "g"
);

const setupRoutes = (routesPath, options) => {
    glob.sync(routesPath, { absolute: true }).forEach(fsPath => {
        const { method, path, handler, middleware } = getRouteFromFsPath(
            fsPath
        );
        if (!router[method]) {
            throw new Error(`invalid method ${method} for route ${path}`);
        }
        if (!handler) {
            throw new Error(`undefined handler for route ${method}@${path}`);
        }
        router[method](path, middleware || [], handler);
        if (options && options.verbose) {
            console.log(`Setup route ${method}@${path}`);
        }
    });
};

const getRouteFromFsPath = fsPath => {
    const { method, path } = getMethodAndPath(getSanitizedFsPath(fsPath));
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
            path: rawPath.substring(0, lastSlashIndex) || "/"
        };
    }
};

const getSanitizedFsPath = fsPath => {
    if (!fsPath) {
        return "";
    }
    return fsPath.replace(cleansingRegex, "");
};

module.exports = {
    setupRoutes,
    getRouteFromFsPath,
    getMethodAndPath,
    getSanitizedFsPath
};