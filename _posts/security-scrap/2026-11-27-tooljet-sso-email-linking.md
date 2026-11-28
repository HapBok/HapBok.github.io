---
layout: post
title: "2026-11-27 | ToolJet SSO 이메일 계정 연결 취약점"
nav_title: "11.27 · ToolJet SSO 계정 탈취"
date: 2026-11-27
timeline_date: "2026-11-27"
categories: [security-scrap]
tags: [보안이슈, 인증, ToolJet, OAuth, SSO, CVE-2026-137536]
description: "검증되지 않은 이메일을 기존 계정에 연결하는 ToolJet 취약점의 조건을 살펴보고, 공급사와 CVE 알림의 수정 버전·심각도 차이를 남겼다."
published: true
---

ToolJet의 SSO 계정 연결 취약점 **CVE-2026-137536**을 정리했다. 로그인 제공자가 알려 준 이메일 주소가 같다는 이유만으로 기존 계정의 세션을 발급하면, 주소의 실제 소유자를 확인하는 과정이 빠질 수 있다.

**대상일과 블로그 표시일은 2026-11-27이며, 실제 조사·작성·업로드는 2026-11-28에 진행했다.** 아래 표의 기록일도 대상일이다. X 알림은 11월 27일 03:02 KST에 게시됐다. 이번에 새로 확인한 소식은 CVE 공개에 따른 알림이며, 공급사의 보안 공지는 이미 11월 9일 공개돼 있었다.

- **분야:** 웹 보안 · OAuth SSO · 계정 탈취
- **선정 이유:** 외부 로그인 제공자의 정보와 애플리케이션 내부 계정을 연결하는 신뢰 경계를 이해하기 위해 선정했다.
- **한 줄 요약:** ToolJet이 검증되지 않은 이메일만으로 SSO 사용자를 기존 계정에 연결하면, 특정 조건을 만족하는 정상 발급 토큰으로 관리자까지 포함한 다른 사용자의 세션을 받을 수 있다.
- **X 출처:** `@cvedotnow`(cve.now, Sazabi 운영 자동 알림 계정), **2026-11-27 03:02 KST**, [개별 게시물](https://x.com/cvedotnow/status/2126013718123196424). CVE Program 공식 계정 `@CVEnew`와 다른 계정이며, 발견자·공급사의 직접 발표도 아니다.
- **연결 자료:** [cve.now 상세 페이지](https://cve.now/CVE-2026-137536). 브라우저에서는 인증서 오류로 본문을 읽지 못해 경고를 우회하지 않았고, 웹 조회 도구로 내용을 확인한 뒤 아래 원문과 대조했다.
- **원문 출처:** ToolJet 공식 저장소, *GHSA-7g4q-wmw6-7r36*, **2026-11-09 공개**, [공급사 보안 공지](https://github.com/ToolJet/ToolJet/security/advisories/GHSA-7g4q-wmw6-7r36). 제보자 표기는 `evilgensec`이다.
- **CVE 보완 자료:** VulnCheck, *ToolJet before 3.21.94-beta Account Takeover via SSO Email-Based Account Linking*, **2026-11-26 표기**, [CVE 공지](https://www.vulncheck.com/advisories/tooljet-before-3.21.94-beta-account-takeover-via-sso-email-based-account-linking). 실제 공격 발생일은 미확인이다.

## 핵심 내용

- **원인:** 공급사 공지에 따르면 Google·Git/GitHub SSO 흐름은 제공자가 알려 준 이메일로 기존 사용자를 찾고, 이메일 소유권을 나타내는 `email_verified` 등의 검증 신호를 확인하지 않는다. 제공자 내 사용자의 고유 식별자인 `sub`도 계정 연결 키로 저장·사용하지 않는다. [공급사 분석](https://github.com/ToolJet/ToolJet/security/advisories/GHSA-7g4q-wmw6-7r36)
- **조건과 영향:** SSO가 설정돼 있고 피해자의 기존 계정이 있어야 한다. Google 경로는 신뢰하는 발급자의 서명을 갖고 대상의 클라이언트 ID에 맞는 토큰이 필요하며, 피해자 이메일이 미검증 상태로 실리는 조건이 추가된다. 임의 문자열이나 위조 토큰만 보내면 된다는 뜻이 아니다. 성공하면 기존 관리자 계정도 탈취할 수 있다. [공급사 전제조건](https://github.com/ToolJet/ToolJet/security/advisories/GHSA-7g4q-wmw6-7r36)
- **자료 간 차이:** X는 수정 버전을 `3.21.94-beta`로 알리지만, 공급사 공지의 영향 버전은 `<3.21.94-beta`, 패치 버전은 `>=3.21.96-LTS`다. VulnCheck는 CVSS 4.0 **9.3**으로 평가하고, 공급사 분석은 조건부 OSS 경로를 CVSS 3.1 **6.5**로 설명한다. 서로 다른 점수 버전과 악용 가정이므로 한 숫자로 합치지 않았다. [공급사 공지](https://github.com/ToolJet/ToolJet/security/advisories/GHSA-7g4q-wmw6-7r36), [VulnCheck 평가](https://www.vulncheck.com/advisories/tooljet-before-3.21.94-beta-account-takeover-via-sso-email-based-account-linking)

## 공격과 방어 관점

**공격자 관점에서는 토큰 검증을 통과한 뒤의 계정 선택 로직이 중요하다.** 토큰이 진짜라는 사실이 그 안의 이메일 소유권까지 보장하지는 않는다. 애플리케이션이 이메일 일치만으로 기존 계정에 연결하면 외부 신원이 내부 권한으로 잘못 바뀐다. 이는 공개 분석을 바탕으로 내가 정리한 신뢰 경계다.

**대응 버전은 공급사가 패치 버전으로 명시한 3.21.96-LTS 이상을 기준으로 확인한다.** 중간 버전의 안전성을 X 알림만으로 확정하지 않는다. 공급사 분석은 제공자와 고유 식별자로 신원을 연결하고, 이메일 기반 연결 전 소유권을 검증하며, 기존 계정과 충돌할 때 자동 로그인 대신 인증된 계정 연결 절차를 요구하는 방향을 제시한다. 해당 내용은 공지의 개선 제안이며, 내가 패치 코드를 실행해 확인한 결과는 아니다. [공급사 공지](https://github.com/ToolJet/ToolJet/security/advisories/GHSA-7g4q-wmw6-7r36)

운영 점검에서는 구성된 SSO 제공자와 계정 연결 이력을 파악할 필요가 있다. 다만 공지에는 바로 적용할 전용 탐지 규칙이 없고, 비공개 Enterprise Edition의 추가 공격 가능성도 검증된 결과로 제시하지 않는다. 이 부분을 전체 제품에서 이미 입증된 공격으로 확대하지 않았다.

## 확인 상태

- **상태:** 취약점·CVE 공개, 공급사 공지의 재현 절차 공개, 수정 버전 표기 확인. 실행 가능한 공격 PoC 파일의 공개 여부와 실제 악용·피해는 이번에 확인하지 못했다.
- **남은 차이:** 공급사 GHSA의 CVE 항목에는 아직 번호가 없지만 VulnCheck CVE 공지가 해당 GHSA를 참조한다. 패치 버전·심각도 표기의 차이는 위와 같이 남겼다.
- **정리 범위:** X·연결 자료·공급사 및 CNA 공지를 읽었다. 토큰 발급 조건의 재현과 패치 전후 실행 검증은 수행하지 않았다.

## 한 줄 기록

| 기록일 | 분야 | 이슈와 한 줄 요약 | X 게시물 | 원문 |
|---|---|---|---|---|
| 2026-11-27 | 인증 · 웹 보안 | **ToolJet SSO 계정 탈취(CVE-2026-137536):** 이메일 소유권 검증 없이 기존 계정에 연결하는 문제로, 공급사 패치 버전 표기는 3.21.96-LTS 이상이다. | [자동 알림 @cvedotnow · 11/27](https://x.com/cvedotnow/status/2126013718123196424) | [ToolJet 공식 공지](https://github.com/ToolJet/ToolJet/security/advisories/GHSA-7g4q-wmw6-7r36) |

심층 분석에서는 서명·수신 대상 검증, 이메일 소유권 검증, 기존 계정 연결이 각각 어떤 사실을 보장하는지 분리해 살펴보고 싶다.
