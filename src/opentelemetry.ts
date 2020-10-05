import { ZIPKIN } from './config';
import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const addZipkinExporter = (provider: NodeTracerProvider) => {
    provider.addSpanProcessor(
        new BatchSpanProcessor(
            new ZipkinExporter({ url: 'https://jaeger-collector.aspecto.io:443/api/v2/spans', serviceName: 'benchmarks' })
        )
    );
};

export const initOtel = () => {
    const provider = new NodeTracerProvider({
        plugins: {
            express: {
                enabled: true,
                path: '@opentelemetry/plugin-express',
            },
        },
    });

    provider.addSpanProcessor(
        new BatchSpanProcessor(
            new CollectorTraceExporter({ url: 'opentelemetry-collector.aspecto.io:443', serviceName: 'benchmarks' })
        )
    );

    if (ZIPKIN) addZipkinExporter(provider);

    provider.register();
};
