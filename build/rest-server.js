"use strict";
// Shamelessly borrowed from https://mherman.org/blog/developing-a-restful-api-with-node-and-typescript/
// https://stackoverflow.com/questions/38802959/how-to-lock-on-object-which-shared-by-multiple-async-method-in-nodejs
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var logger = require("morgan");
var gdl90_client_1 = require("./gdl90-client");
var airports = require("./locations/airports");
var radar_client_1 = require("./radar-client");
var status_client_1 = require("./status-client");
var traffic_client_1 = require("./traffic-client");
var nexrad_1 = require("./weather/nexrad");
var text_products_1 = require("./weather/text-products");
/**
 * Service class that exposes the Traffic Client to the
 * rest of the world as a RESTful API.
 *
 * @class RestServer
 */
var RestServer = /** @class */ (function () {
    /**
     * Creates an instance of RestServer to serve up
     * the data collected from the WebSocket as a RESTful service.
     * @memberof RestServer
     */
    function RestServer() {
        this.express = express();
        this.middleware();
        this.routes();
        airports.loadAirports();
    }
    // Making the sockets static and then having static handlers is
    // a horrific side effect of TS/JS and the object model it uses.
    // The calls to the Socket get a "this" value that points
    // to the BASE EXPRESS INSTANCE, not the handler's instance.
    RestServer.GetStatusStatus = function (req) { return RestServer.status_client.getServiceStatus(req); };
    RestServer.GetStatusResponse = function (req) { return RestServer.status_client.getServiceResponse(req); };
    RestServer.GetRadarStatus = function (req) { return RestServer.radar_client.getServiceStatus(req); };
    RestServer.GetRadarResponse = function (req) { return RestServer.radar_client.getServiceResponse(req); };
    RestServer.GetGdl90Status = function (req) { return RestServer.gdl90_client.getServiceStatus(req); };
    RestServer.GetGdl90Response = function (req) { return RestServer.gdl90_client.getServiceResponse(req); };
    /**
     * Returns the information about the service.
     * Intended to be used for compatibility checks
     * and the diagnostics view.
     *
     * @private
     * @returns {*}
     * @memberof RestServer
     */
    RestServer.prototype.getServiceInfoResponseBody = function (req) {
        return {
            server: {
                name: "StratuxHud",
                version: "1.7.1"
            }
        };
    };
    /**
     * Performs a reset of the WebSocket + reconnect
     * and then returns a response body to indicate the success
     *
     * @private
     * @returns {*}
     * @memberof RestServer
     */
    RestServer.prototype.getServiceResetResponseBody = function (req) {
        traffic_client_1.TrafficClient.resetWebSocketClient();
        RestServer.radar_client.reset();
        RestServer.status_client.reset();
        RestServer.gdl90_client.reset();
        return {
            resetTime: new Date().toUTCString()
        };
    };
    // Configure Express middleware.
    RestServer.prototype.middleware = function () {
        this.express.use(logger("dev"));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    };
    /**
     * Create all of the routing from API endpoint to delegates
     *
     * @private
     * @memberof RestServer
     */
    RestServer.prototype.routes = function () {
        var _this = this;
        var router = express.Router();
        var mapping = {
            "/": this.getServiceInfoResponseBody,
            "/Service/Info": this.getServiceInfoResponseBody,
            "/Service/Reset": this.getServiceResetResponseBody,
            "/Service/Status": traffic_client_1.TrafficClient.getServiceStatusResponseBody,
            "/Traffic/Summary": traffic_client_1.TrafficClient.getTrafficOverviewResponseBody,
            "/Traffic/Full": traffic_client_1.TrafficClient.getTrafficFullResponseBody,
            "/Traffic/Reliable": traffic_client_1.TrafficClient.getTrafficReliableResponseBody,
            "/Traffic/:id": traffic_client_1.TrafficClient.getTrafficDetailsResponseBody,
            "/Status/Status": RestServer.GetStatusStatus,
            "/Status/Full": RestServer.GetStatusResponse,
            "/Radar/Status": RestServer.GetRadarStatus,
            "/Radar/Full": RestServer.GetRadarResponse,
            "/Gdl90/Status": RestServer.GetGdl90Status,
            "/Gdl90/Full": RestServer.GetGdl90Response,
            "/Weather/Reflectivity": nexrad_1.ReflectivityRadar.getReflectivity,
            "/Weather/TextReports": text_products_1.TextReports.getReports
        };
        Object.keys(mapping).forEach(function (key) {
            router.get(key, function (req, res, next) {
                res.json(mapping[key](req));
            });
        });
        // NOTE:
        // The "use root" appears to be required
        // for the Express routing to actually work.
        Object.keys(mapping).forEach(function (route) {
            _this.express.use(route, router);
        });
    };
    RestServer.status_client = new status_client_1.StatusClient();
    RestServer.radar_client = new radar_client_1.RadarClient();
    RestServer.gdl90_client = new gdl90_client_1.Gdl90Client();
    return RestServer;
}());
exports.default = new RestServer().express;
//# sourceMappingURL=rest-server.js.map