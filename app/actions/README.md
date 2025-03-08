# 서버 액션 (Server Actions)

이 디렉토리에는 Next.js의 서버 액션(Server Actions)을 사용하여 구현된 서버 사이드 함수들이 포함되어 있습니다. 서버 액션은 클라이언트 컴포넌트에서 직접 호출할 수 있는 서버 사이드 함수로, API 라우트를 대체할 수 있습니다.

## 사용 방법

### 서버 컴포넌트에서 사용

서버 컴포넌트에서는 서버 액션을 직접 임포트하여 사용할 수 있습니다.

```tsx
// app/applications/page.tsx
import { getApplications } from '@/app/actions';

export default async function ApplicationsPage() {
  const applications = await getApplications();
  
  return (
    <div>
      <h1>대출 신청 목록</h1>
      <ul>
        {applications.map(app => (
          <li key={app.applicationId}>
            {app.name} - {app.appliedAt.toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 클라이언트 컴포넌트에서 사용

클라이언트 컴포넌트에서는 서버 액션을 임포트하여 폼 제출이나 이벤트 핸들러에서 사용할 수 있습니다.

```tsx
'use client';

import { createApplication } from '@/app/actions';
import { useState } from 'react';

export default function ApplicationForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createApplication({
        name,
        email,
        cellPhone,
        appliedAt: new Date()
      });
      
      alert('신청이 완료되었습니다!');
      // 폼 초기화 또는 리다이렉트 등의 작업 수행
    } catch (error) {
      console.error('신청 중 오류가 발생했습니다:', error);
      alert('신청 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">이름</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="cellPhone">휴대폰 번호</label>
        <input
          id="cellPhone"
          value={cellPhone}
          onChange={(e) => setCellPhone(e.target.value)}
          required
        />
      </div>
      
      <button type="submit">신청하기</button>
    </form>
  );
}
```

### 폼 액션으로 사용

서버 액션은 폼의 `action` 속성에 직접 바인딩할 수도 있습니다.

```tsx
'use client';

import { createCounsel } from '@/app/actions';

export default function CounselForm() {
  return (
    <form action={createCounsel}>
      <div>
        <label htmlFor="name">이름</label>
        <input id="name" name="name" required />
      </div>
      
      <div>
        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" required />
      </div>
      
      <div>
        <label htmlFor="cellPhone">휴대폰 번호</label>
        <input id="cellPhone" name="cellPhone" required />
      </div>
      
      <div>
        <label htmlFor="memo">상담 내용</label>
        <textarea id="memo" name="memo"></textarea>
      </div>
      
      <button type="submit">상담 신청하기</button>
    </form>
  );
}
```

## 사용 가능한 서버 액션

### 대출 신청 관련

- `createApplication`: 대출 신청서 생성
- `getApplications`: 모든 대출 신청서 조회
- `getApplicationById`: 특정 대출 신청서 조회
- `updateApplication`: 대출 신청서 업데이트
- `deleteApplication`: 대출 신청서 삭제

### 대출 신청 계약 관련

- `contractApplication`: 대출 신청서 계약 체결

### 대출 신청 파일 관련

- `uploadApplicationFile`: 대출 신청서 파일 업로드
- `downloadApplicationFile`: 대출 신청서 파일 다운로드
- `deleteApplicationFiles`: 대출 신청서 파일 삭제

### 대출 신청 약관 관련

- `acceptApplicationTerms`: 대출 신청서 약관 동의

### 상담 관련

- `createCounsel`: 상담 신청 생성
- `getCounsels`: 모든 상담 신청 조회
- `getCounselById`: 특정 상담 신청 조회
- `deleteCounsel`: 상담 신청 삭제

### 심사 관련

- `createJudgment`: 대출 심사 결과 생성
- `getJudgments`: 모든 대출 심사 결과 조회
- `getJudgmentById`: 특정 대출 심사 결과 조회
- `getJudgmentByApplicationId`: 특정 신청서의 대출 심사 결과 조회
- `deleteJudgment`: 대출 심사 결과 삭제

### 약관 관련

- `createTerms`: 약관 생성
- `getTerms`: 모든 약관 조회
- `getTermsById`: 특정 약관 조회
- `updateTerms`: 약관 업데이트
- `deleteTerms`: 약관 삭제 