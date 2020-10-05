'use strict';
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                      return m[k];
                  },
              });
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, 'default', { enumerable: true, value: v });
          }
        : function (o, v) {
              o['default'] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const opentelemetry = __importStar(require('@opentelemetry/api'));
const grpc_1 = __importDefault(require('grpc'));
const core_1 = require('@opentelemetry/core');
const node_1 = require('@opentelemetry/node');
const exporter_zipkin_1 = require('@opentelemetry/exporter-zipkin');
const exporter_collector_1 = require('@opentelemetry/exporter-collector');
const opentelemetry_exporter_live_1 = require('@aspecto/opentelemetry-exporter-live');
const AspectoProcessor_1 = require('./AspectoProcessor');
const AspectoTelemetryResource_1 = require('./aspecto-resource/AspectoTelemetryResource');
const aspectoConfig_1 = __importDefault(require('./config/aspectoConfig'));
const ConfigService_1 = __importDefault(require('./config/ConfigService'));
const http_1 = require('./plugins-customizations/http');
const config_1 = require('./config');
const kafka_node_1 = require('./plugins-customizations/kafka-node');
const kafkajs_1 = require('./plugins-customizations/kafkajs');
const aws_sdk_1 = require('./plugins-customizations/aws-sdk');
const typeorm_1 = require('./plugins-customizations/typeorm');
const patch_logger_1 = require('./logging/patch-logger');
const print_live_message_1 = require('./logging/print-live-message');
const LabelNames_1 = require('./aspecto-resource/LabelNames');
const initWithRemoteConfig = async (aspectoPrivacyProcessor, options) => {
    var _a, _b;
    const auth = aspectoConfig_1.default.getToken(options);
    await ConfigService_1.default.init({ token: auth });
    const { privacyRules, otCollectorUrl, jaegerEndpoint } = await ConfigService_1.default.config;
    aspectoPrivacyProcessor.initPrivacyEngine(privacyRules);
    const serviceName = aspectoConfig_1.default.getPackageName(options);
    if (!options.isolate) {
        console.log('Not adding Jaeger!');
        // try {
        //     const aspectoJaegerEndpoint = config_1.getJaegerEndpoint((_a = options === null || options === void 0 ? void 0 : options.jaegerEndpoint) !== null && _a !== void 0 ? _a : jaegerEndpoint);
        //     const zipkinExporter = new exporter_zipkin_1.ZipkinExporter({
        //         url: aspectoJaegerEndpoint,
        //         serviceName,
        //     });
        //     aspectoPrivacyProcessor.addExporter(zipkinExporter);
        // }
        // catch (err) {
        //     console.log(`aspecto opentelemetry tracer: ${err}`);
        // }
        try {
            const aspectoOtEndpoint = config_1.getOtCollectorEndpoint(
                (_b = options === null || options === void 0 ? void 0 : options.otCollectorEndpoint) !== null && _b !== void 0
                    ? _b
                    : otCollectorUrl
            );
            const collectorExporter = new exporter_collector_1.CollectorExporter({
                url: aspectoOtEndpoint,
                credentials: grpc_1.default.credentials.createSsl(),
                serviceName,
            });
            aspectoPrivacyProcessor.addExporter(collectorExporter);
        } catch (err) {
            console.log(`aspecto opentelemetry tracer: ${err}`);
        }
    }
};
const addCustomZipkinExporter = (aspectoProcessor, options) => {
    if (!(options === null || options === void 0 ? void 0 : options.customZipkinEndpoint)) return;
    aspectoProcessor.addExporter(
        new exporter_zipkin_1.ZipkinExporter({
            url: options.customZipkinEndpoint,
            serviceName: aspectoConfig_1.default.getPackageName(options),
        })
    );
};
const addLiveExporter = (aspectoProcessor, resource, options) => {
    const liveExporter = new opentelemetry_exporter_live_1.LiveExporter({
        serviceName: aspectoConfig_1.default.getPackageName(options),
        instanceId: resource.labels[LabelNames_1.LabelNames.ID],
        port: options === null || options === void 0 ? void 0 : options.liveExporterPort,
        aspectoAuth: options === null || options === void 0 ? void 0 : options.aspectoAuth,
        isolate: options.isolate,
    });
    aspectoProcessor.addExporter(liveExporter);
    return liveExporter;
};
// verify that aspecto token is available, and print a friendly message (no stack trace) if it's missing
const verifyAspectoToken = (options) => {
    try {
        aspectoConfig_1.default.getToken(options);
        return true;
    } catch (err) {
        if (options.logger) options.logger.error(err.message);
        else console.warn(err.message);
        return false;
    }
};
exports.default = module.exports = (options = {}) => {
    try {
        if (!verifyAspectoToken(options)) return;
        const aspectoResource = AspectoTelemetryResource_1.AspectoTelemetryResource.createTelemetryAspectoResource(options);
        const provider = new node_1.NodeTracerProvider({
            logger:
                (options === null || options === void 0 ? void 0 : options.logger) &&
                (options === null || options === void 0 ? void 0 : options.writeSystemLogs)
                    ? options.logger
                    : new core_1.NoopLogger(),
            resource: aspectoResource,
            plugins: {
                mongoose: {
                    enabled: true,
                    path: '@wdalmut/opentelemetry-plugin-mongoose',
                    enhancedDatabaseReporting: true,
                },
                'aws-sdk': aws_sdk_1.aspectoAwsSdkPluginConfig,
                'kafka-node': kafka_node_1.aspectoKafkaNodePluginConfig,
                kafkajs: kafkajs_1.aspectoKafkaJsPluginConfig,
                express: {
                    enabled: true,
                    path: '@aspecto/opentelemetry-plugin-express',
                },
                typeorm: typeorm_1.aspectoTypeormPluginConfig,
                http: http_1.aspectoHttpPluginConfig,
                https: http_1.aspectoHttpsPluginConfig,
                ioredis: {
                    enabled: true,
                    path: '@opentelemetry/plugin-ioredis',
                },
                // disabled plugins
                dns: { enabled: false },
                mongodb: { enabled: false },
            },
        });
        const aspectoProcessor = new AspectoProcessor_1.AspectoProcessor();
        addCustomZipkinExporter(aspectoProcessor, options);
        const packageName = aspectoConfig_1.default.getPackageName(options);
        let liveExporter;
        if (options.local) {
            const aspectoAuth = aspectoConfig_1.default.getToken(options);
            liveExporter = addLiveExporter(
                aspectoProcessor,
                aspectoResource,
                Object.assign(Object.assign({}, options), { aspectoAuth })
            );
            if (options.logger && !options.isolate) patch_logger_1.patchLogger(options.logger, packageName, liveExporter);
            setTimeout(async () => {
                try {
                    const exporterInfo = await liveExporter.init();
                    const baseUrl = options.baseUrl || 'https://app.aspecto.io';
                    print_live_message_1.printLiveMessage({ baseUrl, exporterInfo });
                } catch (err) {
                    console.log(`Failed to initialize Aspecto live tracing. ${err}`);
                }
            });
        }
        initWithRemoteConfig(aspectoProcessor, options);
        provider.addSpanProcessor(aspectoProcessor);
        provider.register();
        return {
            tracer: opentelemetry.trace.getTracer(packageName),
            setLogger: (logger) =>
                liveExporter && !options.isolate ? patch_logger_1.patchLogger(logger, packageName, liveExporter) : {},
        };
    } catch (e) {
        console.log(`Failed to initialize Aspecto tracing. ${e}`);
    }
};
//# sourceMappingURL=index.js.map
