# Aspecto Benchmarks
A repo containing an example project to test Aspecto's benchmarks

 ## How to run locally?

 ### Prerequisites

 * Docker
 * Aspecto account [API key](https://app.aspecto.io/app/integration/api-key).
 * [Apache Bench](https://www.tutorialspoint.com/apache_bench/apache_bench_environment_setup.htm).  
 > Notice: latest macOS versions already has apache bench installed.  
 > To make sure you installed successfully run `ab -V` in the terminal.

### Steps 
 1. Clone this repo.
 2. Install dependencies with `yarn install`.
 3. Place your Aspecto [API key](https://app.aspecto.io/app/integration/api-key) in `aspecto.json` file.
 3. Build docker-compose with `docker-compose build`.
 4. Start docker-compose with `docker-compose up`.
 5. Run benchmark command: `yarn benchmark <requests (default: 1000)> <concurrency (default: 10)>`.  

 Make sure to relaunch your containers between every benchmark check, so you won't have any leftovers.

 ## Production Benchmarks

We have a Github Action CI running automatically on each new release of [@aspecto/opentelemetry](https://www.npmjs.com/package/@aspecto/opentelemetry).  
On every new release the CI creates an AWS EC2 instance running the same service twice - once without instrumentation (baseline) and one using aspecto.  
On each service we run benchmark tests.  
> Instrumentation benchmarks are using 10% sampling ratio (recommended).


The benchmark report is written in the CI output, and uploaded to the CI artifacts as well.  
[Check it out here!](https://github.com/aspecto-io/benchmarks/actions?query=workflow%3A%22Benchmark+Test+on+AWS%22).