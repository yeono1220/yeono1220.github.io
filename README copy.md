# yeono1220.github.io

고연오의 포트폴리오 + 블로그. 순수 HTML/CSS/JS로 만들어졌고 빌드 과정 없이 그대로 GitHub Pages에 올릴 수 있습니다.

## 폴더 구조

```
.
├── index.html        # 메인(포트폴리오) 페이지
├── blog.html          # 블로그 목록 페이지
├── style.css          # 전체 공통 스타일
├── script.js          # 60년짜리 인생 시계 + 행성 그림
└── posts/
    ├── post-1.html
    ├── post-2.html
    └── post-3.html    # 예시 글 (내용은 자유롭게 수정/삭제하세요)
```

## 내용 수정하기

- 이름, 소개, 프로젝트: `index.html`의 `#about`, `#projects` 섹션
- 새 글 추가: `posts/` 폴더에 기존 파일을 복사해서 새 파일 만들고, `index.html`과 `blog.html`의 목록에 링크 추가
- 색상/폰트: `style.css` 맨 위 `:root` 변수만 바꾸면 전체 톤이 바뀝니다
- 인생 시계: 각 HTML의 `<body data-birth="...">`(생일)와 `data-span`(수명, 기본 60)

## GitHub Pages로 배포하기

1. GitHub에서 새 저장소(Repository)를 만듭니다. 이름은 반드시 `yeono1220.github.io` (본인 GitHub 아이디 + `.github.io`)로 지정하고, Public으로 설정합니다.
2. 이 폴더의 파일들을 그 저장소에 업로드합니다. 방법 중 하나를 고르세요.
   - **웹에서 바로 올리기**: 저장소 페이지 → `Add file` → `Upload files` → 이 폴더 안의 파일/폴더를 통째로 드래그
   - **git 사용**:
     ```bash
     git init
     git remote add origin https://github.com/yeono1220/yeono1220.github.io.git
     git add .
     git commit -m "첫 배포"
     git branch -M main
     git push -u origin main
     ```
3. 저장소의 `Settings` → `Pages`로 들어가서 Source가 `Deploy from a branch`, Branch가 `main` / `root`로 되어 있는지 확인합니다 (보통 자동으로 이렇게 잡힙니다).
4. 1~2분 정도 기다리면 `https://yeono1220.github.io` 에서 사이트가 보입니다.

이후에는 파일을 수정해서 같은 저장소에 다시 push(또는 업로드)하기만 하면 몇 분 안에 사이트에 반영됩니다.
