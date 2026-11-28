---
layout: post
title: "2026-11-28 | Drupal 설치 프로그램 접근 우회와 침해 점검"
nav_title: "11.28 · Drupal 설치 프로그램 우회"
date: 2026-11-28
timeline_date: "2026-11-28"
categories: [security-scrap]
tags: [보안이슈, 웹보안, Drupal, 접근통제, 침해대응, CVE-2026-136716]
description: "실제 악용이 확인된 Drupal 설치 프로그램 취약점의 조건과 수정 버전, 패치 이후에도 계정·로그·설치 상태를 함께 조사해야 하는 이유를 정리했다."
published: true
---

Drupal 설치 프로그램의 접근통제 우회 취약점 **CVE-2026-136716**을 골랐다. 설치를 마친 운영 사이트라도 내부에 미완료 설치 상태가 남아 있으면 안전하지 않을 수 있다는 점과, 패치 이후에도 침해 흔적을 따로 확인해야 한다는 점이 눈에 들어왔다.

**대상일과 실제 조사·작성·업로드 날짜는 2026-11-28이다.** 선정한 X 게시물은 같은 날 05:03 KST로 조사 시점 기준 최근 24시간 안에 해당한다. 새 소식은 CISA의 실제 악용 목록 추가 알림이다. 공급사 공지는 11월 25일, CISA 목록의 추가일 표기는 11월 27일이며, 어느 날짜도 최초 공격 발생일로 단정하지 않았다.

- **분야:** 웹 보안 · 접근통제 · 침해 대응
- **선정 이유:** 정상 운영 상태와 설치·초기화 권한 사이의 경계를 살펴보고 패치와 침해 조사를 구분하기 위해 선정했다.
- **한 줄 요약:** Drupal의 일부 비정상·미완료 설치 상태에서 외부에 노출된 설치 프로그램을 통해 사이트를 탈취할 수 있으며, 공급사와 CISA는 실제 악용을 확인했다.
- **X 출처:** CISA의 사이버보안 계정 `@CISACyber`, **2026-11-28 05:03 KST**, [개별 게시물](https://x.com/CISACyber/status/2126406492567781433). 프로필의 CISA 소속·공식 도메인 및 정부기관 배포 자료의 계정 표기를 대조했다. 한 게시물에 포함된 세 CVE 중 Drupal 한 건만 다룬다.
- **연결 원문:** CISA, [Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search=CVE-2026-136716), 해당 항목의 추가일 **2026-11-27**. KEV는 실제 악용 증거가 있는 취약점을 정리한 목록이다.
- **기술 원문:** Drupal Security Team, [SA-CORE-2026-019](https://www.drupal.org/sa-core-2026-019), **2026-11-25**.
- **대응 자료:** Drupal, [Checking whether your site was compromised through the installer](https://www.drupal.org/docs/administering-a-drupal-site/security-in-drupal/checking-whether-your-site-was-compromised-through-the-installer), **2026-11-26 업데이트**.

## 핵심 내용

- **원인과 조건:** 앞선 SA-CORE-2026-017 수정 이후에도 일부 비정상·미완료 설치 상태의 사이트는 설치 프로그램을 통한 탈취 위험이 남았다. 운영 화면만으로 이 상태를 알기 어렵고, 이미 침해된 사이트는 취약 상태에서 벗어나 보일 수도 있다. 설치 프로그램 접근을 이미 안전하게 차단했다면 취약하지 않다는 것이 공급사 설명이다. [공식 공지](https://www.drupal.org/sa-core-2026-019)
- **영향과 확인 수준:** 원격 비인증 공격자가 노출된 설치 흐름을 이용해 사이트를 탈취할 수 있다. 공급사는 실제 악용 중이라고 밝혔고 CISA도 KEV에 추가했다. 특정 피해 사이트 수, 최초 공격 시점, 랜섬웨어 사용 여부는 이 자료에서 확정하지 않았다. [CISA 항목](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search=CVE-2026-136716)
- **수정:** 지원 중인 분기에 따라 **10.6.23·11.3.23·11.4.14**로 업데이트하고 `update.php` 또는 데이터베이스 업데이트를 실행해야 한다. 설치 프로그램 접근 통제도 권고된다. 이전 수정 버전인 10.6.22·11.3.22·11.4.13만 적용한 것으로 이번 문제까지 해결됐다고 볼 수 없다. [수정 공지](https://www.drupal.org/sa-core-2026-019), [점검 안내](https://www.drupal.org/docs/administering-a-drupal-site/security-in-drupal/checking-whether-your-site-was-compromised-through-the-installer)

## 공격과 방어 관점

**공격자 관점에서는 일반 방문자가 설치·초기화 기능을 다시 실행할 수 있는지가 중요하다.** 설치 프로그램은 사이트의 계정과 설정을 만드는 강한 권한을 가진다. 운영 중인 사이트에서 그 기능이 잘못 열리면 기존 관리자 권한을 넘는 경로가 생길 수 있다. 이는 공개된 설치 흐름과 피해 설명을 바탕으로 정리한 해석이다.

**방어는 설치 프로그램 차단, 코드 업데이트와 DB 업데이트, 침해 조사로 이어진다.** Drupal 안내는 코드 수정이 공격 경로를 막고 DB 업데이트가 기록된 설치 상태를 복구한다고 구분한다. 이미 침해된 사이트에서는 패치를 적용해도 공격자가 만든 계정·파일·설정이 저절로 제거되지 않는다. [공식 대응 안내](https://www.drupal.org/docs/administering-a-drupal-site/security-in-drupal/checking-whether-your-site-was-compromised-through-the-installer)

조사할 항목은 설치 프로그램에 대한 웹 접근 기록, 사용자 1 계정의 이메일·변경 내역, 모르는 관리자 계정, 설치 시각과 상태다. 사용자 1은 Drupal의 특별한 관리자 계정이다. `install.php`에 대한 HTTP 200 응답만으로 침해를 확정할 수 없고, 설치 상태가 `done`이라고 안전을 증명할 수도 없다. 정상 설치 완료뿐 아니라 공격 완료나 DB 업데이트로도 상태가 바뀔 수 있기 때문이다. 로그와 계정 변경 내역을 함께 봐야 한다. [침해 흔적과 판정 한계](https://www.drupal.org/docs/administering-a-drupal-site/security-in-drupal/checking-whether-your-site-was-compromised-through-the-installer)

## 확인 상태

- **상태:** 취약점·수정 버전 공개, 공급사 실제 악용 확인, CISA KEV 등록 확인.
- **미확인:** 정확한 피해 규모와 공격자, 최초 공격 발생일, 이번 조사에서 별도로 검증한 공격 PoC. CISA의 랜섬웨어 사용 항목은 `Unknown`이다.
- **정리 범위:** X·CISA 목록·Drupal 공지와 대응 문서 열람. 취약 사이트를 탐색하거나 공격을 재현하지 않았다. CISA의 11월 30일 대응 기한을 FRONTIER 제출 기한이나 모든 조직에 적용되는 의무로 해석하지 않았다.

## 한 줄 기록

| 기록일 | 분야 | 이슈와 한 줄 요약 | X 게시물 | 원문 |
|---|---|---|---|---|
| 2026-11-28 | 웹 보안 · 침해 대응 | **Drupal 설치 프로그램 접근 우회(CVE-2026-136716):** 미완료 설치 상태에서 사이트 탈취가 가능해 수정·설치 경로 차단과 함께 침해 흔적을 점검해야 한다. | [CISA @CISACyber · 11/28](https://x.com/CISACyber/status/2126406492567781433) | [Drupal 공식 공지](https://www.drupal.org/sa-core-2026-019) |

심층 분석에서는 설치 상태를 바꾸는 코드와 DB 업데이트를 비교하고, 패치가 바꾼 상태값을 침해 증거로 잘못 해석하지 않는 방법을 살펴보고 싶다.
