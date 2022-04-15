
# ビルド
.PHONY: build
build:
	cd development && bash build.sh

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
