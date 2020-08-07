PORT := 1993

buildrun:
	docker build -t app . && docker run -it --init -p $(PORT):$(PORT) app

run:
	docker run -it --init -p $(PORT):$(PORT) app
