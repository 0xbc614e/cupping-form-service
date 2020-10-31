## 설치

```sh
npm install
```

`.env` 파일을 만들고 아래 내용을 채운다.

```
HOST_URL=<DB 주소>
USER_ID=<DB 사용자 이름>
USER_PASSWORD=<DB 사용자 암호>
DATABASE_NAME=<사용할 DB 이름>

TABLE_FORM=<커핑폼 테이블 이름>
TABLE_USER=<사용자 테이블 이름>

TEST_HOST_URL=<DB 주소>
TEST_USER_ID=<DB 사용자 이름>
TEST_USER_PASSWORD=<DB 사용자 암호>
TEST_DATABASE_NAME=<사용할 DB 이름>
```

## 테스트

Mysql, MariaDB를 구동시키고:

```sh
npm test
```

## 컴파일

```sh
./compile.sh
```

그러면 `out` 폴더에 모듈 생성. 합칠 때는 이걸로 합쳐야 node.js로 구동할 때 문제가 생기지 않는다.
