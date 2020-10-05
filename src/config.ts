import env from 'env-var';

const NODE_ENV = env.get('NODE_ENV').asString();
export const isDev = NODE_ENV === 'development';

export const PORT = env.get('PORT').default(4040).asPortNumber();
export const INSTRUMENT = env.get('INSTRUMENT').asBool();
