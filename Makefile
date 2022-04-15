
# 初期化
.PHONY: init
init:
	bash init.sh

# ビルド
.PHONY: build
build:
	cd development && bash build.sh && cd ..

# 採点
.PHONY: scoring
scoring:
	cd scoring && bash evaluate.sh && cd ..

# apiテストを行う。
.PHONY: test
test:
	cd development && bash apiTestOnly.sh && cd ..

# データリストア、dbマイグレーションも行う
.PHONY: restore
restore:
	cd develompent && bash restoreOnly.sh && cd ..
