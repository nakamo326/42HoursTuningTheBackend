
# ビルド
.PHONY: build
build:
	cd development && bash build.sh

# 採点
.PHONY: scoring
scoring:
	cd scoring && bash evaluate.sh

# apiテストを行う。
.PHONY: test
test:
	cd development && bash apiTestOnly.sh

# データリストア、dbマイグレーションも行う
.PHONY: restore
restore:
	cd develompent && bash restoreOnly.sh
