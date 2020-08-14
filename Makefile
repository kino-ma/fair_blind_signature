PORT := 1993

buildrun: build run

build:
	docker build -t app .

run:
	docker run -it -p $(PORT):$(PORT) app

bash:
	docker run -v fair_blind_signature:/app -u root -it app bash

.PHONY: buildrun build run
