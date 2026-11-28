---
layout: post
title: "IDS와 IPS: 탐지 원리부터 배치와 운영까지"
nav_title: "IDS/IPS 동작 원리와 활용"
date: 2026-11-28
timeline_date: "2026-11-28"
categories: [blog-docs]
tags: [IDS, IPS, 네트워크보안, Suricata, KNIGHTS-FRONTIER]
description: "IDS와 IPS의 동작 원리, 유형과 탐지 기법, 장단점을 정리하고 Suricata 규칙 예시로 탐지와 차단의 차이를 살펴본다."
published: true
---

## 탐지한 다음에는 어떤 일이 일어날까

웹 서비스에 의심스러운 요청이 들어왔다고 가정해 보자. 보안 장비가 요청을 발견해 경고를 남기는 것과, 그 요청이 서버에 전달되지 못하도록 막는 것은 서로 다른 동작이다. 경고가 있어도 서버는 이미 요청을 처리했을 수 있고, 차단했더라도 그 판단이 잘못됐다면 정상 사용자가 서비스를 이용하지 못할 수 있다.

KNIGHTS FRONTIER 미션 #18에서는 IDS와 IPS의 동작 원리, 유형, 활용 방법, 장단점과 차이점을 학습하도록 요구한다. 이 글에서는 **무엇을 관찰하고, 어떤 근거로 판단하며, 판단한 뒤 무엇을 하는가**를 기준으로 내용을 정리했다.

기본 개념과 분류는 NIST SP 800-94를 참고하고, 구체적인 규칙과 동작은 Suricata 공식 문서와 대조했다. NIST 문서는 2007년 자료이며, 2012년에 나온 개정 초안은 최종 발행되지 않고 폐기되었다. 따라서 개념을 이해하는 자료로 사용하고, 제품의 설정은 버전이 명시된 문서로 확인했다. 이 글의 Suricata 문서는 8.0.2 기준이다. [NIST 발행 정보](https://csrc.nist.gov/pubs/sp/800/94/final)

**이 글은 문헌 조사와 규칙 해석을 바탕으로 작성했다.** 아래의 요청·규칙·배치 예시는 설명을 위한 것이며, 실제 트래픽을 보내 탐지율이나 차단 성능을 측정한 결과는 아니다.

## IDS와 IPS의 역할부터 구분하기

**IDS(Intrusion Detection System, 침입 탐지 시스템)**는 네트워크나 시스템에서 의심스러운 활동을 찾아 기록하고 경고한다. **IPS(Intrusion Prevention System, 침입 방지 시스템)**는 탐지 결과와 정책에 따라 위협을 막는 조치까지 수행한다. 두 시스템 모두 위협을 판단하는 과정이 필요하다. 탐지·방지를 함께 다룰 때는 **IDPS(Intrusion Detection and Prevention Systems)**라는 표현도 사용한다. [IBM IDS 개요](https://www.ibm.com/think/topics/intrusion-detection-system), [NIST 발행 정보](https://csrc.nist.gov/pubs/sp/800/94/final)

네트워크 기반의 일반적인 구성을 단순하게 그리면 다음과 같다.

```text
수동 관찰 IDS
클라이언트 ── 스위치 ── 서버
                 └── 복제 트래픽 ── IDS ── 경고·분석

인라인 IPS
클라이언트 ── IPS ── 서버
               └── 정책에 따라 전달 또는 차단
```

IDS가 트래픽 복사본을 받는 구성에서는 원래 통신이 IDS를 통과하지 않는다. 스위치가 지정한 트래픽을 복제하는 SPAN 기능이나, 통신을 관찰 장비에 복제하는 네트워크 TAP을 활용할 수 있다. 반면 **인라인(inline)** IPS는 실제 통신 경로에서 패킷의 전달 여부에 관여한다. Suricata는 인라인 IPS 모드에서 차단 규칙을 적용하는 방식을 제공한다. [NIST SP 800-94 §4.2](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-94.pdf), [Suricata IPS Concept](https://docs.suricata.io/en/suricata-8.0.2/ips/ips-concept.html)

이 그림은 대표적인 네트워크 구성을 설명한다. 모든 IDS가 복사본만 사용하거나, 모든 IPS가 독립된 네트워크 장비인 것은 아니다. 호스트 내부에서 관찰·방지하는 방식도 있고 다른 보안 기능과 통합된 제품도 있다.

또한 IDS의 경고를 받은 다른 장비가 방화벽 정책을 변경하도록 연동할 수도 있다. 따라서 제품 이름만으로 판단하기보다 **실제 데이터 경로와 차단을 실행하는 주체**를 확인하는 편이 정확하다. [IBM IDS 개요](https://www.ibm.com/think/topics/intrusion-detection-system)

## 패킷을 받아 경고·차단하기까지

네트워크 IDS/IPS의 처리 과정을 이해하려면 개별 패킷과 애플리케이션의 요청을 구분할 필요가 있다.

### 패킷 하나가 요청 하나와 같지는 않다

TCP는 애플리케이션에 순서가 있는 바이트 스트림을 제공한다. 데이터를 세그먼트로 나누어 보내므로 HTTP 요청 하나가 여러 세그먼트에 걸칠 수 있고, 재전송이나 순서가 바뀐 도착도 고려해야 한다. [RFC 9293 §2.2](https://www.rfc-editor.org/rfc/rfc9293.html#section-2.2)

가령 검사하려는 문자열이 두 세그먼트에 나뉘어 있다면, 각각을 따로 검색하는 것만으로는 전체 문자열을 찾기 어렵다. **스트림 재조립**은 나뉜 데이터를 연결된 흐름으로 해석하는 데 필요하다. Suricata는 개별 TCP 패킷의 내용과 재조립된 스트림을 대상으로 하는 규칙을 구분하며, IDS·IPS 모드에 따라 검사 시점과 처리 방식도 달라진다. [Suricata Rules Format](https://docs.suricata.io/en/suricata-8.0.2/rules/intro.html), [IPS의 TCP 스트림 처리](https://docs.suricata.io/en/suricata-8.0.2/ips/ips-concept.html)

### 관찰·해석·판단·대응을 연결하기

HTTP 요청을 검사하는 상황은 다음 단계로 나누어 이해할 수 있다. 제품 내부 구현을 그대로 나열한 것이 아니라, 동작을 설명하기 위해 나눈 흐름이다.

| 단계 | 하는 일 | 확인할 질문 |
| --- | --- | --- |
| 관찰 | 지정한 인터페이스나 경로에서 데이터를 받는다. | 보호하려는 요청이 이 위치를 지나는가? |
| 해석 | 연결과 애플리케이션 프로토콜을 파악한다. | HTTP의 어느 필드를 검사하는가? |
| 판단 | 규칙이나 정상 활동의 기준과 비교한다. | 어떤 조건 때문에 의심하는가? |
| 대응 | 설정에 따라 경고하거나 차단한다. | 탐지 조건과 대응 동작이 어떻게 연결되는가? |
| 기록 | 이벤트를 남겨 조사에 활용한다. | 같은 연결의 다른 기록과 연결할 수 있는가? |

Suricata는 HTTP의 URI, 메서드, 헤더 등 특정 필드를 검사하는 기능을 제공한다. URI는 요청 대상 자원을 식별하는 표현으로, 아래 예시에서는 경로인 `/frontier-ids-test`가 해당한다. 통신 전체에서 문자열을 찾는 것과, HTTP URI라는 의미를 가진 필드 안에서 찾는 것은 검사 범위가 다르다. [Suricata HTTP Keywords](https://docs.suricata.io/en/suricata-8.0.2/rules/http-keywords.html)

기록도 판단 과정의 일부다. Suricata의 EVE JSON에는 시각, 출발지·목적지, 규칙 식별자 등이 남을 수 있고, `flow_id`로 같은 통신 흐름의 기록을 연결할 수 있다. 경고 이름만 읽는 것보다 어떤 연결에서 무엇이 관찰됐는지 확인하는 데 도움이 된다. [Suricata Eve JSON Format](https://docs.suricata.io/en/suricata-8.0.2/output/eve/eve-json-format.html)

## 어디에서 무엇을 관찰하는가

NIST SP 800-94는 관찰 대상과 배치 방식에 따라 IDPS를 네 가지로 구분한다. [NIST SP 800-94 §2.4](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-94.pdf)

| 유형 | 주로 관찰하는 정보 | 활용 방향과 고려할 점 |
| --- | --- | --- |
| 네트워크 기반 NIDS/NIPS | 네트워크 구간의 패킷·프로토콜 활동 | 여러 장비의 통신을 살피지만, 관찰 위치 밖의 활동에는 한계가 있다. |
| 호스트 기반 HIDS/HIPS | 개별 장비의 로그·파일·시스템 활동 | 장비 내부의 변화를 살피지만, 장비별 수집·관리 범위를 고려해야 한다. |
| 무선 기반 | 무선 프로토콜과 네트워크 활동 | 무선 환경의 의심스러운 활동을 살핀다. |
| 네트워크 행위 분석 NBA | 트래픽 흐름·양·패턴 | 평소와 다른 통신 양상을 살핀다. |

예를 들어 웹 서버로 들어오는 요청과 서버 안의 파일 변경은 서로 다른 관찰 대상이다. 전자는 네트워크에서, 후자는 해당 호스트에서 확인할 정보를 중심으로 조사하게 된다. 두 자료를 연결하면 요청 이후 실제 변화가 있었는지 검토할 수 있지만, 어느 한쪽의 경고만으로 다른 쪽의 결과까지 확정해서는 안 된다.

여기서 **네트워크 기반과 시그니처 기반은 서로 다른 분류 기준**이다. 전자는 어디서 무엇을 보는지, 후자는 어떤 근거로 의심하는지를 설명한다. 네트워크 기반 시스템도 여러 탐지 기법을 함께 사용할 수 있다.

## 어떤 근거로 위협을 판단하는가

탐지 기법은 크게 다음과 같이 정리할 수 있다. 실제 제품은 여러 방식을 결합할 수 있다. [NIST SP 800-94 §2.3](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-94.pdf)

| 기법 | 판단 근거 | 장점 | 한계 |
| --- | --- | --- | --- |
| 시그니처 기반 | 알려진 위협의 패턴과 비교 | 일치한 조건을 추적하기 쉽다. | 규칙이 포착하지 못하는 활동을 놓칠 수 있다. |
| 이상 행위 기반 | 정상 활동의 기준에서 벗어나는지 비교 | 알려진 패턴이 없는 활동의 징후도 살필 수 있다. | 정상적인 변화도 의심할 수 있어 기준 관리가 필요하다. |
| 상태 기반 프로토콜 분석 | 프로토콜 상태·순서·형식과 비교 | 앞뒤 통신의 맥락을 살핀다. | 자원 부담과 구현 차이가 있고, 프로토콜을 준수하는 공격도 있다. |

이 차이를 이해하기 위한 가상의 상황을 만들어 보았다. 평소 파일 다운로드가 드문 서버에서 갑자기 큰 전송이 발생했다면, ‘평소와 다르다’는 기준으로 조사할 수 있다. 하지만 예정된 백업일 수도 있으므로 전송량 증가만으로 공격이라고 결론 내릴 수는 없다.

반대로 특정 문자열을 찾는 규칙은 그 문자열이 어디에서 발견됐는지 설명하기 쉽다. 그래도 문자열이 등장한 업무 맥락과 실제 영향을 추가로 확인해야 한다. **판단 근거를 설명할 수 있다는 것과 그 판단이 항상 맞는다는 것은 다르다.**

상태 기반 분석에서의 ‘상태’는 앞선 통신을 기억하며 현재 동작을 해석한다는 뜻이다. 같은 명령이라도 이전 인증 단계가 끝났는지에 따라 의미가 달라질 수 있다. 이때 정상 기준이나 프로토콜 모델이 무엇을 허용하는지 확인해야 한다.

## Suricata 규칙으로 탐지와 차단을 구분하기

개념을 구체화하기 위해 Suricata의 규칙 구조를 살펴봤다. 규칙은 **동작(action), 헤더(header), 옵션(options)**으로 나눌 수 있다. 다음은 URI에 특정 표식을 포함한 요청을 찾도록 구성한 설명용 예시다. 실제로 실행하거나 문법 검사한 규칙은 아니다. [Suricata Rules Format](https://docs.suricata.io/en/suricata-8.0.2/rules/intro.html)

```text
alert http any any -> $HOME_NET any (msg:"FRONTIER HTTP marker"; flow:established,to_server; http.uri; content:"/frontier-ids-test"; sid:1000001; rev:1;)
```

| 부분 | 예시에서의 의미 |
| --- | --- |
| `alert` | 조건이 일치하면 경고를 생성한다. |
| `http` | HTTP 트래픽을 대상으로 한다. |
| `any any -> $HOME_NET any` | 출발지 주소·포트를 제한하지 않고 보호 대상 네트워크로 향하는 트래픽을 대상으로 한다. |
| `flow:established,to_server` | 연결 상태와 서버 방향을 조건에 포함한다. |
| `http.uri` | 이후의 내용 검사를 HTTP URI 필드에 적용한다. |
| `content` | URI에서 `/frontier-ids-test` 문자열을 찾는다. |
| `sid`, `rev` | 규칙의 식별자와 개정 번호다. |

`$HOME_NET`은 설정에서 보호 대상으로 정의하는 주소 범위다. 위의 `content`는 URI 전체가 정확히 그 경로인지 검사하는 조건이 아니라 **문자열 포함 여부**를 검사한다. 따라서 뒤에 다른 경로나 질의 문자열이 붙은 경우도 고려해야 한다. [Suricata Rules Format](https://docs.suricata.io/en/suricata-8.0.2/rules/intro.html), [HTTP URI 검사](https://docs.suricata.io/en/suricata-8.0.2/rules/http-keywords.html)

아래 요청은 예시 조건과의 관계를 설명하기 위해 작성했다. 해당 경로 자체에 공격 의미가 있는 것은 아니다.

```http
GET /frontier-ids-test HTTP/1.1
Host: example.test
```

여기서 구분할 것은 ‘표식을 발견했다’와 ‘요청을 막았다’다. `alert`는 경고 동작이므로, 다른 차단 조건이 없다면 이 규칙의 일치만으로 요청을 폐기하지 않는다. 차단하려면 인라인 경로와 IPS 모드 등 실행 구성을 갖추고 적절한 차단 정책을 적용해야 한다. [Suricata IPS Concept](https://docs.suricata.io/en/suricata-8.0.2/ips/ips-concept.html)

Suricata의 동작을 비교하면 다음과 같다.

| 동작 | 의미 |
| --- | --- |
| `alert` | 경고를 생성한다. |
| `drop` | IPS 모드에서 패킷을 폐기하고 경고를 생성한다. |
| `reject` | TCP RST 또는 ICMP 오류 등을 보내며, IPS 모드에서는 폐기도 수행한다. |

`reject`는 연결 종료 등을 상대에게 알리는 동작이 포함된다. 오류 알림과 원래 패킷의 전달 방지는 구분해야 하며, 수동 관찰 위치에서 뒤늦게 보낸 종료 패킷이 최초 요청의 전달까지 되돌리는 것은 아니다. 동작의 세부 조건은 실행 모드와 설정을 함께 확인해야 한다. [Suricata Rules Format](https://docs.suricata.io/en/suricata-8.0.2/rules/intro.html), [Suricata Action-order](https://docs.suricata.io/en/suricata-8.0.2/configuration/suricata-yaml.html#action-order)

이 예시에서 확인한 것은 규칙의 의미다. 실제 차단을 검증한다면 탐지 로그와 함께 클라이언트 응답, 서버 수신 기록도 대조해야 한다. 특정 표식을 찾는 규칙 하나로 일반적인 공격 탐지 성능을 평가할 수는 없다.

## IDS와 IPS의 장단점은 운영 영향으로 비교하기

다음 표는 일반적인 수동 관찰 네트워크 IDS와 인라인 IPS를 비교한 것이다. IDS의 가치는 경고 이후의 조사·대응에, IPS의 가치는 방지 조치와 서비스 영향까지 포함한 운영에 연결해 볼 수 있다. [IBM IDS 개요](https://www.ibm.com/think/topics/intrusion-detection-system), [Suricata IPS Concept](https://docs.suricata.io/en/suricata-8.0.2/ips/ips-concept.html)

| 기준 | 수동 관찰 IDS | 인라인 IPS |
| --- | --- | --- |
| 강점 | 직접 통신을 차단하지 않고 관찰·분석할 수 있다. | 조건에 맞는 트래픽의 전달을 직접 막을 수 있다. |
| 대응의 부담 | 경고를 분석하고 후속 조치를 연결해야 한다. | 차단 정책이 정상 서비스에 미치는 영향을 검토해야 한다. |
| 오탐의 영향 | 불필요한 경고와 조사 부담이 커질 수 있다. | 정상 요청이 차단되어 서비스에 영향을 줄 수 있다. |
| 성능·장애 고려 | 복제 누락이나 수집·처리 한계를 살펴야 한다. | 처리 지연과 통신 경로의 가용성도 살펴야 한다. |

**오탐(False Positive)**은 정상 활동을 위협으로 판단하는 것이고, **미탐(False Negative)**은 실제 위협을 놓치는 것이다. 오탐을 줄이려고 규칙을 지나치게 느슨하게 만들면 중요한 활동도 놓칠 수 있다. 반대로 의심 범위를 무조건 넓히면 분석 부담과 정상 통신의 차단 가능성이 커진다. [IBM IDS 개요](https://www.ibm.com/think/topics/intrusion-detection-system)

앞의 표식 규칙으로 정상 사용자의 요청을 차단한다고 가정하면 이 문제가 분명해진다. 규칙은 의도한 문자열을 정확히 찾았더라도, 그 문자열을 차단해야 한다는 정책 자체가 부적절할 수 있다. 운영에서는 **규칙의 일치 정확성과 차단 정책의 적절성**을 함께 봐야 한다.

## 실제 환경에서는 어떻게 활용할까

외부에 공개한 웹 서비스를 보호하는 상황을 가정해 활용 흐름을 정리했다. 실제 구축 사례가 아니라, 앞의 개념을 연결한 설계 예시다.

### 보호 대상과 관찰 위치를 정한다

먼저 공개 서비스, 정상 통신 방향, 중요한 기능을 파악한다. 인터넷에서 들어오는 요청과 서버 사이의 내부 통신은 지나가는 경로가 다를 수 있다. 확인하려는 트래픽이 검사 위치를 지나야 해당 관찰 결과로 판단할 수 있다.

Cisco의 운영 지침도 보호할 네트워크와 트래픽 범위를 먼저 정하고, 자산 정보와 실제 이벤트를 활용해 정책을 조정하는 과정을 설명한다. [Cisco Threat Protection Best Practices](https://secure.cisco.com/secure-firewall/docs/threat-protection-best-practices)

### 경고와 차단의 기준을 정한다

조사할 필요는 있지만 업무상 정상 사용 가능성도 있는 조건과, 근거가 명확해 즉시 차단할 조건을 나누어 검토한다. 대표적인 정상 트래픽과 이벤트를 살피고, 변경의 근거와 예외 범위를 기록한다. 예외를 추가할 때도 필요한 대상과 조건만 포함하는지 확인한다.

### 탐지 이후의 조사 절차를 연결한다

경고를 확인하면 규칙 이름뿐 아니라 시각, 통신 상대, 대상 서비스, 요청과 응답을 함께 살핀다. 서버나 애플리케이션의 기록을 대조해 실제 결과를 조사한다. 규칙 갱신 뒤에도 이벤트 양상과 서비스 영향을 다시 확인해야 한다. [Cisco 운영 지침](https://secure.cisco.com/secure-firewall/docs/threat-protection-best-practices)

Suricata 로그를 읽을 때는 개별 경고의 `action`이 패킷이나 흐름의 최종 처리 결과와 같지 않을 수 있다는 점도 주의해야 한다. 여러 규칙이 함께 일치할 수 있으므로, 제공되는 최종 `verdict` 정보와 관련 기록을 함께 해석해야 한다. [Eve JSON의 Action과 Verdict](https://docs.suricata.io/en/suricata-8.0.2/output/eve/eve-json-format.html#action-field)

## 탐지 결과를 해석할 때 남는 한계

### 암호화된 본문은 그대로 읽을 수 없다

HTTPS는 HTTP 통신을 암호화 프로토콜인 TLS로 보호한다. Suricata는 자체적으로 암호화된 트래픽을 복호화하지 않으므로 네트워크에서 HTTPS를 관찰한다고 평문 HTTP URI나 본문을 그대로 검사할 수 있는 것은 아니다. 앞의 HTTP 표식 규칙을 암호화된 요청에 그대로 적용해 같은 결과가 나온다고 가정하면 안 된다. [Suricata Encrypted traffic](https://docs.suricata.io/en/suricata-8.0.2/configuration/suricata-yaml.html#encrypted-traffic)

그렇다고 암호화된 통신에서 모든 관찰이 불가능한 것도 아니다. 관찰 가능한 연결 정보와 프로토콜 정보가 있고, 그 범위는 프로토콜과 설정에 따라 달라진다. 본문을 검사해야 한다면 복호화가 이루어지는 지점과 실제 검사 위치를 별도로 설계해야 한다.

### 자원 한계와 예외 처리를 함께 봐야 한다

Suricata IPS 문서는 파싱 오류나 내부 자원 한계 등 예외 상황에 대한 정책도 설명한다. 규칙에 맞는 패킷의 처리뿐 아니라 정상적으로 검사하지 못한 경우의 처리도 운영 판단에 포함된다. 장비가 멈추거나 처리 한계에 도달했을 때 통신을 허용할지 막을지는 가용성과 보호 요구에 영향을 준다. 단순히 ‘IPS를 설치했다’는 사실만으로 확인할 수 없는 부분이다. [Suricata IPS Exception Policies](https://docs.suricata.io/en/suricata-8.0.2/ips/ips-concept.html#exception-policies)

### 경고는 조사할 근거이며 침입 성공의 증명은 아니다

요청을 관찰한 것, 규칙이 일치한 것, 패킷을 차단한 것, 서버에서 피해가 발생한 것은 서로 다른 사실이다. 특히 요청을 겨냥한 규칙이라면 서버가 그 요청을 수락했는지, 취약한 기능까지 도달했는지, 실제 변화가 생겼는지는 추가 기록이 필요하다.

반대로 경고가 없었다고 안전하다고 단정할 수도 없다. 관찰 위치, 암호화, 규칙 범위, 데이터 수집과 처리 상태를 먼저 확인해야 한다. 따라서 탐지 결과를 설명할 때는 **무엇을 관찰했으며 어디까지 확인했는지**를 함께 남기는 것이 중요하다.

## 정리하며

IDS와 IPS를 비교하면서 중요하게 정리한 것은 탐지와 차단 사이의 판단 과정이다. 같은 규칙이 일치해도 배치와 정책에 따라 서비스에 미치는 영향이 달라지고, 규칙을 만족했다는 사실만으로 실제 침입 결과까지 설명할 수는 없다.

또한 유형과 탐지 기법을 구분하면 설명이 명확해진다. 네트워크 기반·호스트 기반은 관찰 대상을, 시그니처·이상 행위·상태 기반 분석은 판단 근거를 설명한다. 활용 방법은 이 둘에 보호 대상과 대응 절차를 연결하는 문제로 이해할 수 있다.

이번 글에서 확인한 범위는 공식 문서의 개념과 예시 규칙의 의미다. 실제 환경에서의 패킷 수신, 규칙 일치, 차단 결과와 성능은 검증하지 않았다. 후속 실습에서는 격리된 환경에서 같은 요청을 IDS와 IPS 구성에 보내고, 탐지 로그·클라이언트 응답·서버 수신 기록이 어떻게 연결되는지 확인해 보고 싶다.

## 참고 자료

- [NIST SP 800-94 발행 정보](https://csrc.nist.gov/pubs/sp/800/94/final): 발행 연도와 개정 초안 상태.
- [NIST SP 800-94 본문](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-94.pdf): §2.3 탐지 기법, §2.4 유형, §4.2 네트워크 배치.
- [IBM — What is an Intrusion Detection System?](https://www.ibm.com/think/topics/intrusion-detection-system): IDS의 역할과 IPS 비교.
- [RFC 9293 §2.2](https://www.rfc-editor.org/rfc/rfc9293.html#section-2.2): TCP 바이트 스트림과 전송.
- [Suricata 8.0.2 — IPS Concept](https://docs.suricata.io/en/suricata-8.0.2/ips/ips-concept.html): 인라인 검사와 예외 정책.
- [Suricata 8.0.2 — Rules Format](https://docs.suricata.io/en/suricata-8.0.2/rules/intro.html): 규칙 구조와 동작.
- [Suricata 8.0.2 — HTTP Keywords](https://docs.suricata.io/en/suricata-8.0.2/rules/http-keywords.html): HTTP 필드 검사.
- [Suricata 8.0.2 — Eve JSON Format](https://docs.suricata.io/en/suricata-8.0.2/output/eve/eve-json-format.html): 이벤트 연결, Action과 Verdict.
- [Suricata 8.0.2 — Suricata.yaml](https://docs.suricata.io/en/suricata-8.0.2/configuration/suricata-yaml.html): 규칙 동작과 암호화 트래픽 처리.
- [Cisco — Threat Protection Best Practices](https://secure.cisco.com/secure-firewall/docs/threat-protection-best-practices): 보호 범위와 운영·정책 조정.
