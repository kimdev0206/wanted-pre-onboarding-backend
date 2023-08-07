# 원티드 프리온보딩 백엔드 인턴십 - 선발 과제

- [원티드 프리온보딩 백엔드 인턴십 - 선발 과제](#원티드-프리온보딩-백엔드-인턴십---선발-과제)
  - [1. 지원자의 성명](#1-지원자의-성명)
  - [2. 애플리케이션의 실행 방법](#2-애플리케이션의-실행-방법)
  - [3. 데이터베이스 테이블 구조 (링크)](#3-데이터베이스-테이블-구조-링크)
  - [4. 구현한 API의 동작을 촬영한 데모 영상 (링크)](#4-구현한-api의-동작을-촬영한-데모-영상-링크)
  - [5. 구현 방법 및 이유에 대한 간략한 설명](#5-구현-방법-및-이유에-대한-간략한-설명)
  - [6. API 명세 (링크)](#6-api-명세-링크)
  - [(선택) 클라우드 환경에 배포 환경을 설계하고 애플리케이션을 배포한 경우](#선택-클라우드-환경에-배포-환경을-설계하고-애플리케이션을-배포한-경우)


## 1. 지원자의 성명

안녕하세요. 지원자 김용기 입니다.

<br></br>

## 2. 애플리케이션의 실행 방법

- **2-1. docker 엔진을 설치한 뒤, 실행해주세요.**  

  예로, 본 지원자는 개발 환경인 window에서 docker desktop을 설치하였고, 배포 환경인 amazone linux에서 다음과 같은 명령어를 실행하였습니다.

  ```bash
  sudo yum install docker -y
  sudo service docker start
  ```
- **2-2. 본 애플리케이션 docker 이미지를 다운받아주세요.**  

  ```bash  
  docker pull yongki150/wanted-pre-onboarding-backend
  ```

  또는 

  ```bash
  docker pull ghcr.io/yongki150/wanted-pre-onboarding-backend:latest
  ```

- **2-3. mysql 8.0.32 docker 이미지를 다운받아주세요.**  

  ```bash
  docker pull mysql:8.0.32
  ```

- **2-4. `docker-compose.yaml 파일`을 생성한뒤, `<>`에 누락된 개인정보를 기입해주세요.**

  ```yaml
  version: "3"
  services:
    db:
      image: mysql:8.0.32
      container_name: db
      ports:
        - 3306:3306
      environment:
        MYSQL_ROOT_PASSWORD: <YOUR PASSWORD>
        MYSQL_DATABASE: wanted_pre_onboarding
        TZ: Asia/Seoul
      volumes:
        - ./db/data:/var/lib/mysql
    app:
      image: yongki150/wanted-pre-onboarding-backend:latest
      container_name: app
      ports:
        - 80:3000
      environment:
        DB_HOST: db
        DB_USER: <YOUR USERNAME>
        DB_PASSWORD: <YOUR PASSWORD>
        JWT_SECRET: <YOUR JWT PRIVATE KEY>
        TZ: Asia/Seoul
      depends_on:
        - db
  ```
- **2-5. 테이블 생성 쿼리를 입력해주세요.**

  ```sql
  CREATE TABLE `user` (
    `user_seq` int NOT NULL AUTO_INCREMENT,
    `user_email` varchar(100) NOT NULL,
    `hashed_password` varchar(97) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    PRIMARY KEY (`user_seq`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  
  CREATE TABLE `post` (
    `post_seq` int NOT NULL AUTO_INCREMENT,
    `user_seq` int NOT NULL,
    `post_title` varchar(60) NOT NULL,
    `post_content` varchar(600) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`post_seq`),
    KEY `post_FK` (`user_seq`),
    CONSTRAINT `post_FK` FOREIGN KEY (`user_seq`) REFERENCES `user` (`user_seq`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  ```
  
- **2-6. docker 컨테이너를 실행해주세요.**

  ```bash
  docker-compose up -d
  ```

- **[2-7. 엔드포인트 호출 방법 (링크)](https://documenter.getpostman.com/view/11900791/2s9XxtzGEj)**

  링크를 확인해주세요. (6. API 명세와 링크가 동일합니다.)

<br></br>

## [3. 데이터베이스 테이블 구조 (링크)](https://www.erdcloud.com/p/4ouaNgGNEtBu4Zd7y)

링크를 확인해주세요.

<br></br>

## [4. 구현한 API의 동작을 촬영한 데모 영상 (링크)](https://drive.google.com/file/d/1V3JAChldc7oN3qzUrqXi9YtsAX-6ZVkA/view?usp=sharing)

링크를 확인해주세요.

<br></br>

## 5. 구현 방법 및 이유에 대한 간략한 설명

- **과제 1. 사용자 회원가입 엔드포인트**
  
  a. 사용자에서 이메일과 비밀번호를 입력하여 POST 요청을 보냅니다.
  - Postman 에서 API 테스트할 때, 이메일과 비밀번호를 환경변수 처리하기 용이해서 x-www-form-urlencoded 방식의 전송을 허용하였습니다.
    
  b. 서버에서는 사용자로부터 받은 이메일과 비밀번호를 검증합니다.

  - 비밀번호는 복호화할 경우가 없기 때문에 단방향 암호화를 사용하였습니다.
  
  - Node.js 환경에서 CPU 자원 점유를 줄이기 위해 메모리 하드 함수를 사용하였습니다.
  
  c. 이메일과 비밀번호가 유효한 경우, 새로운 사용자를 데이터베이스에 저장합니다.
  
  d. 회원가입이 성공적으로 완료되면, 서버는 새로운 사용자를 인증하고 JWT 토큰을 발급합니다.
  - 인증과 검증을 하나의 서버에서 수행하기 때문에 개인키 암호화 기법을 사용하였습니다.
    
  e. 사용자에게 JWT 토큰과 204 상태코드를 응답으로 전달합니다.
  - 사용자와 서버 간에 토큰이 JWT임을 인식하기 위해 Bearer 토큰과 함께 사용하였습니다.

- **과제 2. 사용자 로그인 엔드포인트**

  a. 사용자에서 이메일과 비밀번호를 입력하여 PATCH 요청을 보냅니다.
  - 로그인 요청은 이메일과 비밀번호의 수정 없이 토큰만 수정 됩니다. 자원의 일부분만 수정하였기 때문에 PATCH 메소드를 사용하였습니다.

  b. 서버에서는 사용자로부터 받은 이메일과 비밀번호를 검증합니다.
  
  c. 이메일과 비밀번호가 유효한 경우, 서버는 사용자를 인증하고 JWT 토큰을 발급합니다.
  
  d. 사용자에게 JWT 토큰과 200 상태코드를 응답으로 전달합니다.

- **과제 3. 새로운 게시글을 생성하는 엔드포인트**

  a. 사용자에서 게시글제목과 게시글내용을 입력하여 POST 요청을 보냅니다. 
  
  - 게시글작성자를 식별하기 위한 사용자일련번호를 토큰에서 확인합니다.

  b. 새로운 게시글을 데이터베이스에 저장합니다.

  c. 사용자에게 200 상태코드를 응답으로 전달합니다.

- **과제 4. 게시글 목록을 조회하는 엔드포인트**

  a. 사용자에서 페이징임계값과 페이지일련번호를 입력하여 GET 요청을 보냅니다. 

  b. 서버에서는 페이지일련번호를 검증합니다.

  - `(게시글총개수 / 페이징임계값) > 페이지일련번호` 

  c. 데이터베이스에서 몇 행부터 조회할지에 대한 값을 구합니다.

  - `(페이지일련번호 - 1) * 페이징임계값`

  d. 게시글 목록을 데이터베이스에서 조회합니다. 
  
  e. 사용자에게 게시글 목록과 200 상태코드를 응답으로 전달합니다.

- **과제 5. 특정 게시글을 조회하는 엔드포인트**
  
  a. 사용자에서 게시글일련번호를 URL Path로 입력하여 GET 요청을 보냅니다.

  - 게시글일련번호는 게시글의 식별자로 URL Path에 명시하는게 적절하다고 생각했습니다.

  b. 서버에서는 사용자로부터 받은 게시글일련번호를 검증합니다.

  c. 특정 게시글을 데이터베이스에서 조회합니다. 
  
  d. 사용자에게 게시글 목록과 200 상태코드를 응답으로 전달합니다.
  
- **과제 6. 특정 게시글을 수정하는 엔드포인트**

  a. 사용자에서 게시글일련번호를 URL Path로, 게시글을 Body로 입력하여 PUT 요청을 보냅니다.

  - 특정 게시글 자원의 전체가 수정될 수 있기 때문에 PUT 메소드를 사용하였습니다.

  b. 서버에서는 사용자로부터 받은 게시글일련번호와 사용자일련번호를 검증합니다.
  
  c. 특정 게시글을 데이터베이스에서 수정합니다.

  d. 사용자에게 게시글 수정이 있다면 201 상태코드를, 없다면 204 상태코드를 응답으로 전달합니다.
  
- **과제 7. 특정 게시글을 삭제하는 엔드포인트**

  a. 사용자에서 게시글일련번호를 URL Path로 입력하여 DELETE 요청을 보냅니다.

  b. 서버에서는 사용자로부터 받은 게시글일련번호와 사용자일련번호를 검증합니다.

  c. 특정 게시글을 데이터베이스에서 삭제합니다.

  d. 사용자에게 204 상태코드를 응답으로 전달합니다.

<br></br>

## [6. API 명세 (링크)](https://documenter.getpostman.com/view/11900791/2s9XxtzGEj)

링크를 확인해주세요.

<br></br>

## (선택) 클라우드 환경에 배포 환경을 설계하고 애플리케이션을 배포한 경우

- **배포된 API 주소**

  ec2-52-79-223-215.ap-northeast-2.compute.amazonaws.com

  > _선발 과제 평가가 마쳐진 현재, 인스턴스를 잠정적으로 중지하였습니다._

<br/>

- **설계한 AWS 환경 그림으로 첨부**
  
  ![프리온보딩 drawio](https://github.com/yongki150/wanted-pre-onboarding-backend/assets/53007747/5a253b6f-a40f-493d-91cb-332d296f86f0)
