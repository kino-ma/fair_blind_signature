PORT := 1993

build:
	docker build -t app .

run:
	docker run -it --init -p $(PORT):$(PORT) app

buildrun: build run
