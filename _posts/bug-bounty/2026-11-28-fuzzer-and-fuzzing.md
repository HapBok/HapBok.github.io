---
layout: post
title: "퍼징은 어떻게 오류를 찾을까? 개념부터 AFL++·Jackalope 비교까지"
nav_title: "퍼징과 퍼저 비교"
date: 2026-11-28
timeline_date: "2026-11-28"
categories: [bug-bounty]
tags: [HSPACE, KNIGHTS-FRONTIER, Fuzzing, AFL++, Jackalope]
description: "퍼징의 반복 과정과 핵심 용어, 분류 기준과 오류 탐지 방식을 정리하고 AFL++와 Jackalope를 같은 기준으로 비교했다."
published: true
---

## 입력을 바꾸면 프로그램의 약점이 드러날까?

프로그램을 테스트할 때는 정상적인 입력과 예상 가능한 예외부터 떠올리기 쉽다. 하지만 이미지 파일의 길이 정보와 실제 데이터가 다르거나, 압축 파일의 일부가 손상되는 등 입력이 복잡해지면 사람이 생각해 낼 수 있는 경우에도 한계가 있다. 이런 입력을 프로그램이 안전하게 처리하는지 어떻게 확인할 수 있을까?

HSPACE KNIGHTS FRONTIER 미션 #19를 진행하며 **퍼징이 입력을 만들고 실행 결과를 이용하는 과정**을 먼저 살펴봤다. 이어 출제자가 제공한 AFL++와 Jackalope의 공식 문서를 같은 기준으로 읽고, 두 도구를 선택할 때 무엇을 비교해야 하는지 정리했다.

이 글은 공식 문서와 연구 자료를 바탕으로 한 개념 학습·도구 비교 기록이다. 도구 설치와 대상 프로그램 퍼징, 성능 측정은 수행하지 않았으며, 아래 예시는 원리를 설명하기 위한 것이다.

## 퍼징의 핵심은 입력과 실행 결과의 반복이다

**퍼징(Fuzzing)**은 자동으로 생성하거나 변형한 입력을 프로그램에 반복적으로 넣어 오류를 찾는 테스트 기법이다. 이 과정을 수행하는 도구를 **퍼저(Fuzzer)**라고 한다. 입력으로는 무작위 바이트뿐 아니라 기존 파일을 바꾼 데이터, 문법에 따라 생성한 데이터도 사용할 수 있다. [Google의 「Why fuzz?」][why-fuzz]는 퍼징의 목적을 보안·정확성·안정성 관점에서 설명한다.

| 목적 | 확인하려는 문제 |
| --- | --- |
| 보안 | 외부 입력이 잘못된 메모리 접근이나 다른 위험한 동작을 유발하는가? |
| 안정성 | 특정 입력에서 프로그램이 종료되거나 처리를 끝내지 못하는가? |
| 정확성 | 같은 규칙을 구현한 코드들이 동일한 입력에 대해 일관된 결과를 내는가? |

파일의 구조를 해석하는 파서, 압축 라이브러리, 네트워크 메시지 처리 코드처럼 외부 데이터를 다루는 부분을 떠올리면 이해하기 쉽다. 예를 들어 이미지 처리 프로그램에는 이미지의 크기와 색상 정보, 압축 데이터를 읽는 코드가 있다. 입력의 일부를 바꾸면서 이러한 코드가 어떤 처리를 수행하는지 관찰할 수 있다.

퍼저가 입력을 무조건 많이 넣기만 하는 것은 아니다. **커버리지 기반 퍼징**은 어떤 코드가 실행됐는지 관찰한 정보를 다음 탐색에 반영한다. AFL++ 문서도 입력을 변형한 뒤 대상에서 새로운 실행 경로를 거쳤는지 평가하는 과정을 설명한다. [AFL++ 상세 사용 문서][afl-depth]

```text
초기 입력 집합 준비
        ↓
입력 선택 → 입력 변형 → 대상 실행 → 실행 결과 관찰
   ↑                                  │
   └── 새로운 실행 정보를 얻은 입력 보관 ──┘

오류를 유발한 입력은 재현·분석을 위해 별도로 저장
```

가령 두 입력이 모두 이미지의 첫 번째 검사에서 거부된다면, 입력 내용이 서로 다르더라도 실행한 코드는 비슷할 수 있다. 반면 한 입력이 그 검사를 통과해 새로운 처리 코드에 도달했다면 이후 탐색에 활용할 가치가 있다. 커버리지 기반 퍼저는 이런 실행 정보를 이용해 입력 집합을 발전시킨다. 실제로 무엇을 새로운 정보로 판단하는지는 도구와 계측 설정에 따라 달라진다.

## 시드에서 하네스까지, 각 구성 요소의 역할

퍼징 문서에는 입력 자체를 뜻하는 말과 입력을 실행하는 구성 요소를 뜻하는 말이 함께 나온다. 먼저 다음 용어를 구분했다. [Google 퍼징 용어집][glossary]

| 용어 | 의미 |
| --- | --- |
| 시드(Seed) | 변형할 테스트 입력의 출발점이 되는 입력 |
| 코퍼스(Corpus) | 테스트에 사용하는 입력들의 집합 |
| 시드 코퍼스(Seed corpus) | 퍼징을 시작하기 전에 준비한 초기 입력 집합 |
| 퍼징 대상(Target) | 테스트할 프로그램이나 함수. 문서에 따라 입력을 받는 진입 함수를 가리키기도 함 |
| 뮤테이터(Mutator) | 입력의 바이트 변경·삽입·삭제 등 변형을 담당하는 구성 요소 |
| 사전(Dictionary) | 파일 형식의 식별자나 키워드처럼 입력에 넣어 볼 의미 있는 토큰 목록 |
| 재현 입력(Reproducer) | 특정 오류를 다시 발생시키는 데 사용하는 입력 |

Google 용어집은 `Fuzzer`가 입력 생성기나 테스트 함수 등 여러 의미로 쓰인다고 설명한다. 이 글에서는 AFL++·Jackalope처럼 입력 탐색과 대상 실행을 관리하는 도구 전체를 퍼저라고 부른다.

### 하네스는 입력을 테스트할 기능에 연결한다

**하네스(Harness)**는 입력을 받아 테스트할 기능을 호출하고 필요한 초기화와 정리를 수행하는 연결 코드다. 라이브러리의 이미지 해석 함수를 테스트한다면, 입력 바이트와 길이를 해당 함수에 전달하는 코드가 그 역할을 할 수 있다. 프로그램 전체를 파일 입력으로 테스트하는 구성에서는 별도 하네스 작성이 필요하지 않을 수도 있다.

하네스가 입력을 받더라도 실제로 확인하려는 기능을 호출하지 못하면 테스트 범위가 좁아진다. 같은 프로세스에서 여러 입력을 처리할 때 이전 실행의 전역 상태나 자원이 남아 있다면, 다음 입력의 실행에도 영향을 줄 수 있다. [Google의 좋은 퍼징 대상 안내][good-target]가 강조하는 속도·결정성·상태 관리는 이런 문제와 연결된다. 여기서 결정성은 같은 조건과 입력에서 가능한 한 같은 동작을 보이는 성질이다.

### 커버리지와 계측은 무엇을 관찰했는지 알려 준다

**커버리지(Coverage)**는 실행한 함수·코드 영역이나 코드 사이의 이동 등을 나타내는 정보다. **계측(Instrumentation)**은 이 정보를 수집할 수 있도록 관찰용 코드를 추가하는 작업이다. 빌드할 때 적용하는 계측도 있고, 실행 파일이 동작하는 동안 적용하는 동적 계측도 있다. 따라서 소스 코드가 없어도 실행 정보를 수집할 수 있다. [퍼징 연구 자료의 계측 설명][survey]

커버리지가 넓다는 것은 더 많은 코드 영역을 실행했다는 의미다. 그 코드에서 가능한 모든 입력과 상태를 확인했다는 의미까지 포함하지는 않는다.

## 퍼징의 종류는 분류 기준부터 구분해야 한다

퍼징의 종류를 조사하면서 구분할 기준은 두 가지였다. **대상 내부 정보를 얼마나 활용하는가**, 그리고 **입력을 어떻게 만드는가**다. 서로 다른 기준이므로 하나의 도구가 여러 설명에 동시에 해당할 수 있다.

### 블랙박스·그레이박스·화이트박스

다음 표는 퍼저가 이용하는 내부 정보와 분석 수준을 기준으로 정리한 것이다. 연구 자료에서도 이러한 분류의 경계가 항상 명확한 것은 아니라고 설명한다. [Fuzzing: Art, Science, and Engineering, §2.4][survey-taxonomy]

| 분류 | 활용하는 정보와 방식 | 고려할 점 |
| --- | --- | --- |
| 블랙박스(Black-box) | 내부 실행 정보를 들여다보지 않고 입출력과 종료 상태 등 외부 동작을 관찰 | 어느 내부 코드에 도달했는지 알기 어려움 |
| 그레이박스(Grey-box) | 커버리지처럼 일부 내부 실행 정보를 활용해 탐색 방향을 조정 | 비교적 가벼운 피드백을 이용하지만 프로그램의 전체 의미를 분석하지는 않음 |
| 화이트박스(White-box) | 내부 동작과 실행 조건을 분석해 입력을 생성. 심볼릭 실행 등이 대표적 | 조건 분석과 계산에 추가 비용이 발생할 수 있음 |

심볼릭 실행은 입력값을 기호로 두고, 어떤 분기로 진행하려면 입력이 어떤 조건을 만족해야 하는지 분석하는 방식이다. 단순히 소스 코드를 열어 볼 수 있다는 사실만으로 화이트박스 퍼징이 되는 것은 아니다.

Jackalope 문서의 **black-box binaries**도 구분해서 읽어야 한다. 해당 표현은 소스 코드 없이 다루는 바이너리를 가리키지만, Jackalope 자체는 계측으로 커버리지를 수집한다. 위 분류 기준을 적용하면 이 커버리지 기반 동작은 그레이박스 방식으로 설명할 수 있다. 이는 문서의 기능을 분류 기준에 대입한 해석이다. [Jackalope README][jackalope]

### 변이 기반·생성 기반

| 분류 | 입력을 만드는 방법 | 장점과 준비 사항 |
| --- | --- | --- |
| 변이 기반(Mutation-based) | 기존 입력의 일부를 바꾸거나 삽입·삭제 | 기존 샘플을 활용할 수 있지만 형식이 깨져 처리 초기에 거부될 수 있음 |
| 생성 기반(Generation-based) | 문법이나 모델에 따라 새 입력을 생성 | 구조를 만족하는 입력을 만들 수 있지만 문법·모델을 준비해야 함 |

이미지 파일을 바이트 단위로 바꾸면 파일 형식 검사에서 계속 거부될 수 있다. 이때 구조를 해석한 뒤 일부 값을 바꾸고 다시 파일로 만드는 **구조 인식 변이**를 고려할 수 있다. 변이와 생성은 함께 활용할 수 있는 접근이다. [Google의 구조 인식 퍼징 문서][structure-aware]

커버리지 기반이라는 설명은 여기에 피드백 활용 방식을 더한다. 예를 들어 도구를 **“변이 기반이면서 커버리지 피드백으로 탐색하는 퍼저”**라고 표현하면 입력 생성 방식과 탐색 방식을 함께 설명할 수 있다.

## 프로그램이 종료되지 않는 오류는 어떻게 찾을까?

입력을 만드는 능력과 실행 결과에서 문제를 알아보는 능력은 구분해야 한다. 퍼저가 잘못된 메모리 접근을 유발했더라도 프로그램이 겉으로 정상 종료한다면, 종료 상태만 확인하는 구성에서는 문제를 놓칠 수 있다. [Google 퍼징 입문 문서][intro-fuzzing]

| 관찰 신호 | 알 수 있는 사실 | 추가로 확인할 내용 |
| --- | --- | --- |
| 크래시(Crash) | 대상이 비정상 종료함 | 원인, 재현 조건, 보안 영향 |
| 시간 초과(Timeout) | 설정한 시간 안에 실행을 마치지 못함 | 무한 루프인지, 원래 느린 처리인지, 제한이 적절한지 |
| Sanitizer 보고 | 활성화한 검사에서 실행 중 오류를 발견함 | 오류 유형, 위치, 검사·종료 설정 |
| 결과 불일치 | 비교 대상이나 기대한 성질과 결과가 다름 | 같은 규칙·설정으로 비교했는지, 어떤 결과가 올바른지 |

입력을 잘못된 형식이라고 판별하고 정상적으로 거부하는 동작은 그 자체로 오류가 아니다. 반대로 크래시 없이도 논리적인 문제가 존재할 수 있으므로, 무엇을 오류로 판단할지 기준을 마련해야 한다.

### Sanitizer는 실행 중 오류를 드러내는 검사 도구다

Sanitizer는 프로그램 실행 중 특정 종류의 오류를 탐지한다. 일반적으로 대상 빌드에 검사 옵션과 런타임을 추가해 사용한다.

| 도구 | 대표적인 탐지 대상 |
| --- | --- |
| [AddressSanitizer(ASan)][asan] | 버퍼 범위를 벗어난 접근, 해제된 메모리 사용 등 |
| [UndefinedBehaviorSanitizer(UBSan)][ubsan] | 부호 있는 정수 오버플로, 잘못된 시프트 등 정의되지 않은 동작 |
| [MemorySanitizer(MSan)][msan] | 초기화하지 않은 값의 사용 |

예를 들어 버퍼의 범위를 벗어난 접근이 일반 실행에서 즉시 종료를 일으키지 않더라도 ASan이 이를 감지할 수 있다. 퍼저는 입력을 탐색하고, Sanitizer는 실행 중 오류를 드러내는 역할을 담당한다.

다만 보고가 발생하면 항상 프로세스가 종료되는 것은 아니다. UBSan은 설정에 따라 오류를 출력한 뒤 실행을 계속할 수 있다. 종료 상태로 오류를 포착하는 퍼저와 연결할 때는 이러한 설정을 함께 확인해야 한다. [UBSan 사용 문서][ubsan]

### SanitizerCoverage는 오류 검사와 역할이 다르다

이름이 비슷한 **SanitizerCoverage**는 실행한 함수·코드 블록·코드 사이의 이동 등을 추적하는 계측 기능이다. ASan처럼 메모리 오류를 판별하는 역할과 구분해야 한다. 실행 정보 수집과 오류 검사는 함께 사용할 수 있지만, 각각 무엇을 관찰하는지는 다르다. [LLVM SanitizerCoverage 문서][sancov]

## AFL++와 Jackalope는 무엇을 제공할까?

### AFL++: 계측 방식과 탐색 기능을 조합하는 도구

AFL++는 기존 AFL을 확장한 퍼징 도구다. 소스 코드가 있는 대상은 `afl-cc` 계열 컴파일러로 계측하고, 초기 입력을 준비한 뒤 `afl-fuzz`로 탐색하는 흐름을 제공한다. 표준 입력이나 파일로 입력을 전달하며, 발견한 크래시와 멈춤 입력은 결과 디렉터리에 저장한다. [AFL++ README][afl]

문서를 읽을 때는 다음 기능의 역할을 중심으로 살펴봤다.

| 기능 | 하는 일 |
| --- | --- |
| LLVM·GCC 기반 계측 | 빌드할 때 실행 정보를 수집하도록 대상에 계측 적용 |
| QEMU·FRIDA 모드 | 소스 코드 없이 바이너리 실행 정보를 수집하는 경로 제공 |
| CmpLog | 비교 연산의 정보를 수집해 입력 탐색에 활용 |
| LAF 계열 기능 | 큰 비교를 더 작은 비교로 나누어 탐색을 도움 |
| Persistent mode | 한 프로세스에서 대상 기능을 반복 실행해 시작 비용을 줄임 |

모드에 따라 적용 가능한 기능과 아키텍처가 달라진다. [AFL++ 기능 표][afl-features]를 함께 확인해야 하는 이유다. 사용자 정의 변이는 C/C++ 라이브러리와 Python 모듈 등으로 추가할 수 있다. [Custom Mutators][afl-custom]

설치는 공식 Docker 이미지나 직접 빌드 방식을 이용할 수 있다. 다만 실행 운영체제와 계측 모드를 함께 봐야 한다. 예를 들어 macOS 설치 안내에는 QEMU 모드를 사용할 수 없고 FRIDA 모드는 사용할 수 있다고 구분되어 있다. [AFL++ 설치 문서][afl-install]

또한 바이너리 대상 문서에는 QEMU·FRIDA 모드와 Wine+QEMU 경로 등이 소개되어 있다. **AFL++에 소스 코드가 반드시 필요하다고 단정하면 이러한 사용 경로를 놓치게 된다.** [바이너리 대상 퍼징 문서][afl-binary]

### Jackalope: 바이너리 대상에 맞게 구성 요소를 바꾸는 도구

Jackalope는 바이너리를 대상으로 하는 커버리지 기반 퍼저다. 기본 계측에는 TinyInst를 사용하며 Windows·macOS·Linux·Android 지원을 명시한다. 문서에서 강조하는 설계 목표는 입력 변형·전달·계측을 대상에 맞게 바꾸기 쉽도록 하고, 병렬 실행을 지원하는 것이다. [Jackalope README][jackalope]

기본 입력 전달 방식은 파일과 공유 메모리다. 공유 메모리를 사용하면 대상 프로그램이 해당 메모리를 열어 입력을 읽을 수 있도록 준비해야 한다. 단순히 실행 옵션을 바꾸는 것만으로 모든 프로그램에 적용되는 기능은 아니다.

문법 파일을 이용한 입력 생성과 후속 변이도 지원한다. 따라서 Jackalope의 입력 생성 방식을 일반적인 바이트 변형만으로 설명할 수는 없다. [Grammar-based mutation][jack-grammar]

기본적인 빌드에는 Python 3, CMake, C/C++ 빌드 환경과 TinyInst 등이 필요하다. 실행 시에는 초기 입력과 결과 경로, 입력 전달 방식, 계측할 모듈 등을 정한다. 같은 장비의 여러 스레드로 실행하거나 서버·워커 구조로 여러 장비가 정보를 공유할 수 있다. [빌드·실행 안내][jackalope]

Linux에서는 소스 코드를 수정하고 빌드해 SanitizerCoverage를 사용하는 별도 모드도 제공한다. 이 경우 대상에 반복 실행 경계를 정의하고 커버리지 옵션을 적용해야 한다. 바이너리 기반 사용 경로와 구분해서 이해할 필요가 있다. [Sanitizer Coverage on Linux][jack-sancov]

## 같은 기준으로 두 퍼저를 비교하기

두 도구 모두 커버리지 피드백을 활용하며, 소스 코드 없이 실행 파일을 테스트할 수 있는 경로를 제공한다. 비교할 때는 소스 코드 보유 여부에 더해 **실행 환경, 계측 방식, 입력 연결과 확장 구조**를 살펴봐야 한다.

| 비교 기준 | AFL++ | Jackalope |
| --- | --- | --- |
| 주요 구성 방향 | 여러 계측 방식과 탐색 보조 기능을 통합 | 바이너리 대상과 구성 요소의 사용자 정의를 강조 |
| 대상 소스 코드 | 컴파일 시 계측에는 필요. 바이너리 모드는 없어도 가능 | 기본 바이너리 방식은 불필요. Linux SanitizerCoverage 모드는 필요 |
| 실행 환경 | Linux·macOS 등. 모드별 운영체제·아키텍처 제약 확인 필요 | Windows·macOS·Linux·Android 지원 명시 |
| 계측 | LLVM·GCC 기반 계측, QEMU·FRIDA 등 | 기본 TinyInst, Linux에서 SanitizerCoverage 선택 가능 |
| 입력 전달 | 표준 입력·파일, 최적화 구성에서 공유 메모리 등 | 파일·공유 메모리 |
| 입력 변형·확장 | 내장 전략과 사용자 정의 뮤테이터 | 기본 변이와 문법 기반 생성·변이, 구성 요소 교체 |
| 반복 실행 | Persistent mode 제공 | TinyInst 기반 persistent·loop 구성 제공 |
| 병렬 실행 | 여러 인스턴스 사이의 코퍼스 동기화 | 여러 스레드와 서버·워커 방식 |

표는 [AFL++ 기능 안내][afl-features], [사용자 정의 변이][afl-custom], [병렬 실행 안내][afl-parallel]와 [Jackalope 실행·구조 설명][jackalope]을 공통 항목으로 재구성한 것이다.

### 장점과 제약을 사용 상황에 연결하기

AFL++는 여러 계측 경로와 비교 연산을 활용하는 기능을 조합할 수 있다는 점이 특징이다. 소스 코드를 빌드할 수 있는 대상을 준비하면서 탐색 기능을 단계적으로 적용하는 상황에 검토할 수 있다. 반면 기능이 많아도 선택한 모드에서 모두 쓸 수 있는 것은 아니므로 지원 범위를 확인해야 한다.

Jackalope는 입력 전달과 계측 등을 대상에 맞게 구성하는 방향을 강조한다. Windows·macOS 바이너리나 일반적인 입력 전달로 테스트하기 어려운 대상을 살펴볼 때 검토할 수 있다. 다만 기본 제공 변이 전략만으로 충분한지는 별개의 문제다. README도 대상에 맞는 사용자 정의 변이와 전략 작성을 권장한다. [Jackalope의 설계 목표와 제약][jackalope]

이러한 선택 방향은 문서의 기능에 근거한 해석이다. **어느 도구가 더 빠르거나 더 많은 버그를 찾는지 측정한 결과는 아니다.** 실제 비교에는 동일한 대상·환경·시간 예산과 코퍼스 등을 고려한 평가가 필요하다. Google 입문 문서는 도구마다 강점과 약점이 있다고 설명하며, 경험적 비교를 위한 관련 프로젝트로 FuzzBench를 소개한다. [Fuzzing Tools][intro-fuzzing]

## 발견한 입력을 취약점으로 판단하기까지

퍼징은 실행해 본 입력과 관찰한 결과 안에서 문제를 찾는다. 따라서 오류가 발견되지 않았다는 이유만으로 대상이 안전하다고 결론 내릴 수 없다. 하네스가 원하는 기능에 도달하지 못했거나, 입력이 초기 검사에서 계속 거부되거나, 필요한 오류 검사가 활성화되지 않았을 수도 있다.

오류를 발견한 뒤에도 확인할 일이 남는다. 같은 입력이 같은 조건에서 재현되는지 보고, 원인을 파악하기 쉽도록 입력을 줄이고, 여러 결과가 같은 원인에서 나온 것인지 구분해야 한다. 이후 실제 서비스의 입력 경로와 권한·자원에 어떤 영향을 주는지 분석해야 보안 취약점으로서의 범위를 설명할 수 있다. 연구 자료도 결과 분류, 재현 입력 최소화, 악용 가능성 판단을 후속 분석으로 다룬다. [퍼징 연구 자료의 Triage 설명][survey]

Jackalope의 크래시 재시도 기능처럼 도구가 재현 확인을 보조하기도 한다. 하지만 재현된 크래시 하나가 곧바로 임의 코드 실행을 뜻하지는 않는다. 비정상 종료의 원인과 공격자가 통제할 수 있는 조건을 별도로 확인해야 한다.

퍼징은 기능 요구사항을 확인하는 테스트와도 함께 사용해야 한다. 프로그램이 종료되지 않았더라도 계산 결과가 틀리거나 권한 검사가 잘못되었을 수 있기 때문이다. 원하는 성질을 검증하는 단언문이나 비교 기준이 있다면 이런 문제를 관찰하는 데 도움이 된다. [Google 퍼징 입문 문서][intro-fuzzing]

## 이번 정리에서 구분하게 된 것과 다음 확인

이번 조사에서는 도구 이름을 외우기보다 **입력을 만드는 과정, 실행 정보를 수집하는 과정, 오류를 판단하는 과정**을 나누어 이해하는 데 초점을 두었다. 같은 프로그램을 반복 실행하더라도 어떤 입력을 남기고 무엇을 오류로 판단하는지에 따라 테스트의 의미가 달라진다.

특히 소스 코드가 없다는 사실과 블랙박스 방식이라는 분류를 구분하게 됐다. AFL++와 Jackalope 모두 바이너리 계측을 통해 내부 실행 정보를 얻는 경로가 있으므로, 파일을 확보한 형태만으로 퍼저의 동작을 설명할 수 없었다.

아직 확인하지 않은 부분은 실제 대상에 연결했을 때의 동작이다. 다음에는 직접 작성한 작은 파서를 대상으로 입력이 어디까지 전달되는지 확인하고, 오류를 유발한 입력을 재현해 원인 코드와 연결해 보려 한다. 그 과정에서 코퍼스와 검사 설정을 바꾸었을 때 무엇이 달라지는지 기록하면, 이번에 정리한 개념을 실행 결과로 설명할 수 있을 것이다.

## 참고 자료

문서 확인일: 2026년 11월 28일. Google의 `fuzzing` 저장소는 보관 처리된 학습 자료이므로, 설치와 지원 환경은 각 도구의 공식 문서도 함께 확인했다. [저장소 상태][google-fuzzing]

- [Google — Why fuzz?][why-fuzz]
- [Google — 퍼징 용어집][glossary]
- [Google — What makes a good fuzz target][good-target]
- [Google — Introduction to fuzzing][intro-fuzzing]
- [Google — Structure-Aware Fuzzing with libFuzzer][structure-aware]
- [Manès 외 — Fuzzing: Art, Science, and Engineering, arXiv v2][survey]
- [LLVM — AddressSanitizer][asan]
- [LLVM — UndefinedBehaviorSanitizer][ubsan]
- [LLVM — MemorySanitizer][msan]
- [LLVM — SanitizerCoverage][sancov]
- [AFL++ — README][afl]
- [AFL++ — 기능과 계측 방식][afl-features]
- [AFL++ — 설치 안내][afl-install]
- [AFL++ — 바이너리 대상 퍼징][afl-binary]
- [AFL++ — 사용자 정의 뮤테이터][afl-custom]
- [AFL++ — 상세 사용 과정과 병렬 실행][afl-depth]
- [Jackalope — README][jackalope]
- [Jackalope — 문법 기반 입력 생성·변이][jack-grammar]
- [Jackalope — Linux SanitizerCoverage 모드][jack-sancov]

[why-fuzz]: https://github.com/google/fuzzing/blob/master/docs/why-fuzz.md
[glossary]: https://github.com/google/fuzzing/blob/master/docs/glossary.md
[good-target]: https://github.com/google/fuzzing/blob/master/docs/good-fuzz-target.md
[intro-fuzzing]: https://github.com/google/fuzzing/blob/master/docs/intro-to-fuzzing.md
[structure-aware]: https://github.com/google/fuzzing/blob/master/docs/structure-aware-fuzzing.md
[survey]: https://arxiv.org/html/1812.00140v2
[survey-taxonomy]: https://arxiv.org/html/1812.00140v2#S2.SS4
[asan]: https://clang.llvm.org/docs/AddressSanitizer.html
[ubsan]: https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html
[msan]: https://clang.llvm.org/docs/MemorySanitizer.html
[sancov]: https://clang.llvm.org/docs/SanitizerCoverage.html
[afl]: https://github.com/AFLplusplus/AFLplusplus
[afl-features]: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/features.md
[afl-install]: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/INSTALL.md
[afl-binary]: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/fuzzing_binary-only_targets.md
[afl-custom]: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/custom_mutators.md
[afl-depth]: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/fuzzing_in_depth.md
[afl-parallel]: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/fuzzing_in_depth.md#c-using-multiple-cores
[jackalope]: https://github.com/googleprojectzero/Jackalope
[jack-grammar]: https://github.com/googleprojectzero/Jackalope/blob/main/mutators/grammar/README.md
[jack-sancov]: https://github.com/googleprojectzero/Jackalope/blob/main/README_sancov.md
[google-fuzzing]: https://github.com/google/fuzzing
