# Aspecto Benchmarks
A repo containing an example project to test Aspecto's benchmarks

## Prerequisites

* Install [Apache Bench](https://www.tutorialspoint.com/apache_bench/apache_bench_environment_setup.htm).  
 Notice latest macOS versions already has apache installed.  
 To make sure you installed successfully run `ab -V` in the terminal.
 * Docker
 * Aspecto account [API key](https://app.aspecto.io/app/integration/api-key).

 ## How to run?
 1. Clone this repo.
 2. Install dependencies with `yarn install`.
 3. Place your Aspecto [API key](https://app.aspecto.io/app/integration/api-key) in `aspecto.json` file.
 3. Build docker-compose with `docker-compose build`.
 4. Start docker-compose with `docker-compose up`.
 5. Run benchmark command: `yarn benchmark <requests (default: 1000)> <concurrency (default: 10)>`.  

 Make sure to relanch your containers between every benchmark check, so you won't have any leftovers.

 