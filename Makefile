
#  本番環境ビルド
.PHONY: build
build:
	docker-compose -f development/docker-compose.yaml build
	docker-compose -f development/docker-compose.yaml up -d

# 採点
.PHONY: scoring
scoring:
	cd scoring && bash evaluate.sh

# local apiテストを行う。
.PHONY: lapi
lapi:
	docker-compose -f ./local/docker-compose-local.yaml down --rmi all
	cd local; bash cpMysqlFile.sh
	docker-compose -f ./local/docker-compose-local.yaml build --no-cache
	docker-compose -f ./local/docker-compose-local.yaml up -d
	sleep 10
	cd local; bash localApiTestOnly.sh

# データリストア、dbマイグレーションも行う
.PHONY: restore
restore:
	cd develompent && bash restoreOnly.sh
