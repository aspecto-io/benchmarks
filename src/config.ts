import env from 'env-var';

const NODE_ENV = env.get('NODE_ENV').asString();
export const isDev = NODE_ENV === 'development';

export const PORT = env.get('PORT').default(4040).asPortNumber();
export const ASPECTO = env.get('ASPECTO').default('false').asBool();
export const OTEL = env.get('OTEL').default('false').asBool();
export const ZIPKIN = env.get('ZIPKIN').default('false').asBool();
