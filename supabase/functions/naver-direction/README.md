# Naver Direction API Proxy

This Edge Function proxies requests to Naver Direction API to avoid CORS errors in the browser/app.

## Usage

```typescript
const { data, error } = await supabase.functions.invoke('naver-direction', {
  body: { 
    start: '127.1523643,37.556947', // lng,lat
    goal: '126.9970257,37.536772'   // lng,lat
  },
})
```

## Environment Variables

Required secrets:
- `NAVER_CLIENT_ID`: Naver API Client ID
- `NAVER_CLIENT_SECRET`: Naver API Client Secret
