PORT := 1993

buildrun: build run

build:
	docker build -t app .

run:
	docker run -it --init -p $(PORT):$(PORT) app
