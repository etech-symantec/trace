#!/usr/bin/env python3
"""
Trace Downloader
----------------
지정한 서버의 Policy Trace 엔드포인트에 0.5초 간격으로 접속하여
응답 내용을 trace_YYYYMMDD_HHMMSS.txt 파일로 저장합니다.
ID / PW 입력 후 Basic Auth 로 인증합니다.
"""

import html
import os
import requests
import time
import argparse
import sys
import getpass
import urllib3
from datetime import datetime

# SSL 인증서 경고 무시 (self-signed cert 환경 대응)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def build_url(ip: str, path: str) -> str:
    path = path.lstrip("/")
    return f"https://{ip}:8082/Policy/Trace/{path}"


def now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def fetch_trace(url: str, session: requests.Session, timeout: int) -> str | None:
    try:
        resp = session.get(url, verify=False, timeout=timeout)
        if resp.status_code == 401:
            print(f"[{now()}] 🔐 인증 실패 (401) — ID/PW 를 확인하세요.", flush=True)
            return None
        resp.raise_for_status()
        return html.unescape(resp.text)
    except requests.exceptions.ConnectionError:
        print(f"[{now()}] ❌ 연결 실패: {url}", flush=True)
    except requests.exceptions.Timeout:
        print(f"[{now()}] ⏱ 타임아웃", flush=True)
    except requests.exceptions.HTTPError as e:
        print(f"[{now()}] ⚠ HTTP 오류: {e}", flush=True)
    except Exception as e:
        print(f"[{now()}] ⚠ 오류: {e}", flush=True)
    return None


def run(ip: str, path: str, user_id: str, password: str,
        output: str, interval: float, timeout: int, skip_miss: bool):

    url = build_url(ip, path)
    print(f"\n🔗 접속 URL  : {url}")
    print(f"👤 사용자    : {user_id}")
    print(f"💾 저장 파일 : {output}")
    print(f"🔄 갱신 간격 : {interval}초")
    if skip_miss:
        print("💡 수집 종료(Ctrl+C) 시 'miss:' 라인이 자동 제거된 후 최종 저장됩니다.")
    print("Ctrl+C 로 종료합니다.\n")

    session = requests.Session()
    session.auth = (user_id, password)   # Basic Authentication

    written_count = 0  
    prev_all_lines = []  
    iteration = 0

    try:
        with open(output, "w", encoding="utf-8") as f:
            f.write(f"# Trace started at {now()}\n")
            f.write(f"# URL  : {url}\n")
            f.write(f"# User : {user_id}\n\n")

        while True:
            iteration += 1
            raw = fetch_trace(url, session, timeout)

            if raw is None:
                time.sleep(interval)
                continue

            all_lines = raw.splitlines()
            while all_lines and all_lines[-1].strip() == "":
                all_lines.pop()

            if all_lines == prev_all_lines:
                print(f"[{now()}] ➖ #{iteration:>5}  변경 없음", flush=True)
                time.sleep(interval)
                continue

            # 수집 중에는 필터링 없이 일단 모두 저장
            new_write_lines = all_lines[len(prev_all_lines):]

            if new_write_lines:
                with open(output, "a", encoding="utf-8") as f:
                    f.write("\n".join(new_write_lines) + "\n")
                written_count += len(new_write_lines)
                print(f"[{now()}] ✅ #{iteration:>5}  +{len(new_write_lines)}줄 추가 → {output}", flush=True)
            else:
                print(f"[{now()}] ➖ #{iteration:>5}  변경 없음", flush=True)

            prev_all_lines = all_lines
            time.sleep(interval)

    except KeyboardInterrupt:
        print(f"\n\n[{now()}] 수집을 종료합니다.")
        session.close()
        
        # [핵심 변경 사항] skip_miss가 True일 때만 일괄 제거 실행
        if skip_miss:
            print(f"[{now()}] 🧹 저장된 파일에서 'miss:' 라인을 일괄 제거하는 중입니다...")
            try:
                with open(output, "r", encoding="utf-8") as f:
                    final_lines = f.readlines()

                with open(output, "w", encoding="utf-8") as f:
                    for line in final_lines:
                        # 왼쪽 공백을 무시하고 miss: 로 시작하지 않는 줄만 다시 씁니다.
                        if not line.lstrip().startswith("miss:"):
                            f.write(line)
                print(f"[{now()}] ✅ 'miss:' 라인 제거 완료.")
            except Exception as e:
                print(f"[{now()}] ⚠ 파일 정리 중 오류 발생: {e}")

        print(f"[{now()}] 💾 최종 파일 저장 완료: {output}")
        sys.exit(0)


def main():
    parser = argparse.ArgumentParser(
        description="Policy Trace 엔드포인트를 주기적으로 폴링하여 파일에 저장합니다."
    )
    parser.add_argument("--ip",       help="서버 IP 주소")
    parser.add_argument("--path",     help="Trace 경로 (예: myPolicy)")
    parser.add_argument("--id",       help="로그인 ID")
    parser.add_argument("--pw",       help="로그인 PW (미입력 시 안전하게 프롬프트로 입력)")
    parser.add_argument("--output",   default=None, help="저장 파일명 (기본: 스크립트 폴더의 trace_YYYYMMDD_HHMMSS.txt)")
    parser.add_argument("--interval", default=0.5, type=float, help="갱신 간격(초) (기본: 0.5)")
    parser.add_argument("--timeout",  default=5,   type=int,   help="요청 타임아웃(초) (기본: 5)")

    args = parser.parse_args()

    # 저장 파일 경로: 스크립트와 같은 폴더로 고정 및 동적 파일명 생성 (trace_YYYYMMDD_HHMMSS.txt)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    default_filename = f"trace_{timestamp}.txt"
    output = args.output if args.output else os.path.join(script_dir, default_filename)

    # 대화형 입력 (인자 미제공 시)
    ip      = args.ip   or input("서버 IP 주소를 입력하세요 : ").strip()
    path    = args.path or input("Trace 이름을 입력하세요   : ").strip()
    user_id = args.id   or input("ID를 입력하세요           : ").strip()
    if args.pw:
        password = args.pw
    else:
        try:
            password = getpass.getpass("PW를 입력하세요           : ")
        except Exception:
            password = input("PW를 입력하세요 (표시됨)  : ").strip()

    # N을 명시적으로 입력하지 않으면 전부 True(Y)로 간주합니다.
    skip_ans = input("miss: 로 시작하는 줄을 캡처하지 않을까요? [Y/N] (기본 Y) : ").strip().upper()
    skip_miss = False if skip_ans == "N" else True

    while True:
        interval_str = input("갱신 간격을 입력하세요 (0.1~2.0초, 기본 0.5) : ").strip()
        if interval_str == "":
            interval = args.interval  # 기본값 0.5
            break
        try:
            interval = float(interval_str)
            if 0.1 <= interval <= 2.0:
                break
            print("  ⚠ 0.1 ~ 2.0 사이의 값을 입력해주세요.")
        except ValueError:
            print("  ⚠ 숫자를 입력해주세요.")

    if not ip or not path:
        print("❌ IP와 경로를 모두 입력해야 합니다.")
        sys.exit(1)
    if not user_id or not password:
        print("❌ ID와 PW를 모두 입력해야 합니다.")
        sys.exit(1)

    run(ip, path, user_id, password, output, interval, args.timeout, skip_miss)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n[오류] {e}")
    finally:
        input("\n종료하려면 Enter 를 누르세요...")