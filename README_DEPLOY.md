# ProxySG Trace Web Launcher v2

`https://etech-symantec.github.io/trace/`를 두 가지 사용 방식으로 나눕니다.

- **Trace 파일 분석**: 브라우저에서 기존 Trace 파일 업로드/붙여넣기 분석
- **ProxySG 직접 연결**: Windows Trace Editor를 실행해 Local Policy → Trace 정책 → LIVE Trace → 분석

## v2 핵심 변경

### Launcher 미설치 자동 처리
웹페이지의 `Trace Editor 실행` 버튼은 먼저 `http://127.0.0.1:58321/status`로 Launcher를 확인합니다.

1. Launcher가 있으면 `/run`으로 바로 Editor 실행
2. 상태 서비스가 없으면 `proxysg-trace://run`으로 한 번 복구 시도
3. 그래도 확인되지 않으면 **최초 설치 안내 모달을 자동 표시**
4. 동시에 `ProxySG_Trace_Launcher_Setup.exe` 다운로드 시작
5. 사용자가 Setup을 실행하면 설치 직후 최신 Editor까지 자동 실행

브라우저 보안상 다운로드된 EXE 자체를 웹페이지가 사용자 확인 없이 실행할 수는 없습니다.

## 최초 설치 모달에서 안내하는 내용

- 관리자 권한 불필요
- `%LOCALAPPDATA%\Etech\ProxySGTrace` 사용자 영역 설치
- 상태 서비스는 `127.0.0.1:58321`에만 바인딩
- Editor 다운로드 후 SHA-256 검증
- Launcher는 ProxySG ID/PW를 수집/전송하지 않음
- 상용 코드 서명이 없어 SmartScreen 경고가 나타날 수 있음

## Launcher v2 동작

설치 파일: `downloads/ProxySG_Trace_Launcher_Setup.exe`

설치 시 다음을 등록합니다.

- URL Protocol: `proxysg-trace://`
- Windows 사용자 시작프로그램(HKCU Run): `ProxySG_Trace_Launcher.exe /bridge`
- 로컬 상태/실행 API: `127.0.0.1:58321`

로컬 API는 외부 인터페이스에 바인딩하지 않으며, 웹 CORS는 `https://etech-symantec.github.io`와 로컬 테스트 origin만 허용합니다.

## GitHub Pages 배포 파일

저장소 `etech-symantec/trace`에 아래 파일을 올립니다.

```text
index.html
launcher-widget.js
downloads/
  ProxySG_Trace_Launcher_Setup.exe
  ProxySG_Trace_Launcher_Setup.exe.sha256
  ProxySG_Policy_Trace_Editor.exe
  ProxySG_Policy_Trace_Editor.exe.sha256
  version.json
```

## 배포

로컬 GitHub clone이 `C:\git\trace`라면:

```powershell
.\deploy_to_repo.ps1 -RepoPath "C:\git\trace"
```

바로 commit/push까지:

```powershell
.\deploy_to_repo.ps1 -RepoPath "C:\git\trace" -Push
```

## Editor 새 버전 갱신

```powershell
.\update_release.ps1 `
  -EditorExe "C:\Temp\ProxySG_Policy_Trace_Editor_v1.19.exe" `
  -Version "1.19"
```

이후 repository에 `downloads`를 push합니다.

## 제거

```powershell
& "$env:LOCALAPPDATA\Etech\ProxySGTrace\Launcher\ProxySG_Trace_Launcher.exe" /uninstall
```

URL Protocol과 사용자 시작프로그램 등록을 해제합니다.
