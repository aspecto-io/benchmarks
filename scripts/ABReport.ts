interface Time {
    min: number;
    mean: number;
    sd: number;
    median: number;
    max: number;
}

export interface ABReport {
    server: {
        software: string;
        hostname: string;
        port: number;
    };
    document: {
        path: string;
        length: number;
    };
    test: {
        concurencyLevel: number;
        timeTaken: number;
        completeRequests: number;
        failedRequests: number;
        totalTransferred: number;
        htmlTransferred: number;
        requestsPerSecond: number;
        timePerRequest: number;
        timePerRequestAll: number;
        transferRate: number;
    };
    time: {
        connect: Time;
        processing: Time;
        waiting: Time;
        total: Time;
    };
}
