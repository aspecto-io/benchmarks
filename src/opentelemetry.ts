import { ZIPKIN } from './config';
import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@aspecto/opentelemetry-instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NoopLogger } from '@opentelemetry/api';

const addZipkinExporter = (provider: NodeTracerProvider) => {
    provider.addSpanProcessor(
        new BatchSpanProcessor(
            new ZipkinExporter({ url: 'https://jaeger-collector.aspecto.io:443/api/v2/spans', serviceName: 'benchmarks' })
        )
    );
};

export const initOtel = () => {
    const provider = new NodeTracerProvider({ logger: new NoopLogger() });
    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [
            new ExpressInstrumentation(),
            new HttpInstrumentation(),
            {
                plugins: {
                    // disabled plugins
                    dns: { enabled: false },
                    http: { enabled: false },
                    https: { enabled: false },
                    express: { enabled: false },
                    pg: { enabled: false },
                    'pg-pool': { enabled: false },
                },
            },
        ],
    });

    provider.addSpanProcessor(
        new BatchSpanProcessor(
            new CollectorTraceExporter({ url: 'opentelemetry-collector.aspecto.io:443', serviceName: 'benchmarks' })
        )
    );

    if (ZIPKIN) addZipkinExporter(provider);

    provider.register();
};
