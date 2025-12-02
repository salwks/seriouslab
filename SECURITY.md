# Security Policy

## Implemented Security Measures

Serious Lab 웹사이트는 다음과 같은 보안 조치를 구현하고 있습니다:

### 1. Content Security Policy (CSP)
- **목적**: XSS(Cross-Site Scripting) 공격 방지
- **구현**: 메타 태그 및 HTTP 헤더를 통해 신뢰할 수 있는 리소스 출처만 허용
- **정책**:
  - `default-src 'self'`: 기본적으로 같은 출처만 허용
  - `script-src 'self' https://unpkg.com`: Three.js CDN 허용
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: 인라인 스타일 및 Google Fonts 허용
  - `font-src 'self' https://fonts.gstatic.com`: Google Fonts 허용
  - `upgrade-insecure-requests`: HTTP를 HTTPS로 자동 업그레이드

### 2. Security Headers
- **X-Frame-Options: DENY** - 클릭재킹(Clickjacking) 공격 방지
- **X-Content-Type-Options: nosniff** - MIME 타입 스니핑 방지
- **Referrer-Policy: strict-origin-when-cross-origin** - 리퍼러 정보 제어
- **Permissions-Policy** - 불필요한 브라우저 기능 비활성화 (위치정보, 마이크, 카메라)
- **Strict-Transport-Security (HSTS)** - HTTPS 강제 (호스팅 레벨)

### 3. HTTPS Enforcement
- 모든 외부 리소스는 HTTPS를 통해 로드됩니다
- `upgrade-insecure-requests` CSP 디렉티브로 HTTP 요청을 HTTPS로 자동 업그레이드

### 4. External Resource Integrity
- Three.js 및 기타 CDN 리소스는 CSP를 통해 출처가 제한됩니다
- Google Fonts는 `crossorigin` 속성을 사용하여 안전하게 로드됩니다

## 호스팅 서비스별 추가 설정

### GitHub Pages
GitHub Pages는 일부 보안 헤더를 자동으로 설정하지만, 추가 헤더 설정이 제한적입니다.
- HTML 메타 태그를 통한 CSP 및 보안 헤더가 적용됩니다
- HSTS는 GitHub Pages에서 자동으로 설정됩니다

### Netlify
`netlify.toml` 또는 `_headers` 파일을 사용하여 보안 헤더를 설정할 수 있습니다.
- 이 저장소에는 두 파일이 모두 포함되어 있습니다
- Netlify는 자동으로 이 파일들을 인식하고 헤더를 적용합니다

### Cloudflare Pages
`_headers` 파일을 사용하여 보안 헤더를 설정할 수 있습니다.
- Cloudflare Pages는 `_headers` 파일 형식을 지원합니다

### Vercel
`vercel.json` 파일에 헤더를 설정할 수 있습니다:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://unpkg.com; worker-src 'self' blob:; child-src 'self' blob:; upgrade-insecure-requests;"
        }
      ]
    }
  ]
}
```

## 보안 모니터링 및 검증

### 온라인 보안 검사 도구
정기적으로 다음 도구를 사용하여 보안 상태를 확인하세요:

1. **Mozilla Observatory**: https://observatory.mozilla.org/
   - 종합적인 보안 점수 및 권장사항 제공
   - 목표: A+ 등급

2. **Security Headers**: https://securityheaders.com/
   - HTTP 보안 헤더 검증
   - 목표: A 등급 이상

3. **SSL Labs**: https://www.ssllabs.com/ssltest/
   - SSL/TLS 설정 검증
   - 목표: A+ 등급

### 브라우저 개발자 도구
- **Console 탭**: CSP 위반 확인
- **Network 탭**: 보안 헤더 확인
- **Security 탭**: HTTPS 및 인증서 상태 확인

## 보안 취약점 보고

보안 취약점을 발견하신 경우:

1. **이메일**: master@serious-lab.com
2. **제목**: [SECURITY] 보안 취약점 보고
3. **포함 정보**:
   - 취약점 설명
   - 재현 방법
   - 영향 범위
   - 제안 해결 방법 (선택사항)

### 보고 시 주의사항
- 취약점을 공개적으로 공유하지 마세요
- 발견 후 즉시 보고해 주세요
- 책임감 있는 공개(Responsible Disclosure) 원칙을 따라주세요

## 보안 업데이트 정책

- **정기 검토**: 분기별 보안 설정 검토
- **의존성 업데이트**: Three.js 등 외부 라이브러리의 보안 업데이트 모니터링
- **CSP 정책 조정**: 새로운 기능 추가 시 CSP 정책 업데이트

## 추가 보안 권장사항

### 개발 환경
- 로컬 개발 시 HTTPS 사용 권장 (예: `mkcert`)
- 프로덕션 배포 전 보안 검사 도구 실행

### 콘텐츠 관리
- 사용자 입력을 받지 않는 정적 사이트이므로 XSS 위험이 낮음
- 외부 리소스 추가 시 CSP 정책 업데이트 필요

### 정기 점검 체크리스트
- [ ] Mozilla Observatory 점수 확인 (분기별)
- [ ] Security Headers 점수 확인 (분기별)
- [ ] Three.js 버전 업데이트 확인 (월별)
- [ ] CSP 위반 로그 확인 (필요시)
- [ ] HTTPS 인증서 만료일 확인 (호스팅 서비스에서 자동 갱신)

## 참고 자료

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Security Headers Best Practices](https://securityheaders.com/)

---

**최종 업데이트**: 2025-12-02  
**문의**: master@serious-lab.com
