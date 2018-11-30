const { expect } = require("chai");
const glob = require("glob");
const express = require("express");
const {
    setupRoutes,
    getSanitizedFsPath,
    getRouteFromFsPath,
    getMethodAndPath
} = require(".");
const path = require("path");
const os = require("os");
const { createTree, destroyTree } = require("create-fs-tree");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const clearModule = require("clear-module");

const handler = () => "handler";
const middleware = () => "middleware";

describe("setup routes", () => {
    describe("get sanitized fs path", () => {
        it("should return an empty string if a falsy value is given", () => {
            expect(getSanitizedFsPath()).to.equal("");
            expect(getSanitizedFsPath(null)).to.equal("");
            expect(getSanitizedFsPath("")).to.equal("");
        });

        it("should drop any unneeded prefix", () => {
            const appRoot = require("app-root-path").path;
            expect(getSanitizedFsPath(`${appRoot}/api`)).to.equal(`/api`);
        });

        it("should drop the js extension, if present", () => {
            const appRoot = require("app-root-path").path;
            expect(getSanitizedFsPath(`${appRoot}/api/get.js`)).to.equal(
                `/api/get`
            );
        });
    });

    describe("get route from fs path", () => {
        let tmpDir;

        afterEach(() => {
            clearModule.all();
            destroyTree(tmpDir);
        });

        it("should evaluate a path that directly represents a method", () => {
            const appRoot = require("app-root-path").path;
            tmpDir = `${appRoot}/get`;
            createTree(tmpDir, {
                "index.js": `exports.handler = ${handler}; exports.middleware = ${middleware}`
            });
            const route = getRouteFromFsPath(tmpDir);
            expect(route.method).to.equal("get");
            expect(route.path).to.equal("/");
            expect(route.handler()).to.equal("handler");
            expect(route.middleware()).to.equal("middleware");
        });

        it("should evaluate a path that represents an actual route", () => {
            const appRoot = require("app-root-path").path;
            tmpDir = `${appRoot}/api`;
            createTree(tmpDir, {
                get: {
                    "index.js": `exports.handler = ${handler}; exports.middleware = ${middleware}`
                }
            });
            const route = getRouteFromFsPath(`${tmpDir}/get`);
            expect(route.method).to.equal("get");
            expect(route.path).to.equal("/api");
            expect(route.handler()).to.equal("handler");
            expect(route.middleware()).to.equal("middleware");
        });
    });

    describe("get method and path", () => {
        it("should correcly evaluate a direct method", () => {
            expect(getMethodAndPath("get")).to.deep.equal({
                method: "get",
                path: "/"
            });
        });

        it("should correcly evaluate an actual path and method", () => {
            expect(getMethodAndPath("api/get")).to.deep.equal({
                method: "get",
                path: "api"
            });
        });
    });

    describe("setup routes", () => {
        let tmpDir;

        const sandbox = sinon.createSandbox();
        const get = sandbox.spy();
        const Router = sandbox.spy(() => ({ get }));
        const expressFs = proxyquire(".", { express: { Router } });

        afterEach(() => {
            sandbox.resetHistory();
            clearModule.all();
            destroyTree(tmpDir);
        });

        it("should setup a correctly-provided route", () => {
            tmpDir = "get";
            createTree(tmpDir, {
                "index.js": `exports.handler = ${handler}; exports.middleware = ${middleware};`
            });
            expressFs.setupRoutes(`${tmpDir}/**/*.js`);
            expect(get.callCount).to.equal(1);
            const call = get.getCall(0);
            expect(call.args).to.have.length(3);
            expect(call.args[0]).to.equal("/");
            expect(call.args[1]()).to.equal("middleware");
            expect(call.args[2]()).to.equal("handler");
        });

        it("should fail if an invalid method is specified", () => {
            tmpDir = "foo";
            createTree(tmpDir, {
                "index.js": `exports.handler = ${handler}; exports.middleware = ${middleware};`
            });
            expect(setupRoutes.bind(null, `${tmpDir}/**/*.js`)).to.throw(
                "invalid method foo for route /"
            );
        });

        it("should fail if no handler method is specified", () => {
            tmpDir = "get";
            createTree(tmpDir, {
                "index.js": `exports.middleware = ${middleware};`
            });
            expect(setupRoutes.bind(null, `${tmpDir}/**/*.js`)).to.throw(
                "undefined handler for route get@/"
            );
        });

        it("should provide an empty middleware if none is specified", () => {
            tmpDir = "get";
            createTree(tmpDir, {
                "index.js": `exports.handler = ${handler};`
            });
            expressFs.setupRoutes(`${tmpDir}/**/*.js`);
            expect(get.callCount).to.equal(1);
            const call = get.getCall(0);
            expect(call.args).to.have.length(3);
            expect(call.args[0]).to.equal("/");
            expect(call.args[1]).to.deep.equal([]);
            expect(call.args[2]()).to.equal("handler");
        });

        it("should be verbose if specified", () => {
            tmpDir = "get";
            createTree(tmpDir, {
                "index.js": `exports.handler = ${handler};`
            });
            const spy = sandbox.spy(console, "log");
            setupRoutes(`${tmpDir}/**/*.js`, { verbose: true });
            expect(spy.callCount).to.equal(1);
            const call = spy.getCall(0);
            expect(call.args).to.have.length(1);
            expect(call.args[0]).to.equal(`Setup route get@/`);
        });
    });
});
