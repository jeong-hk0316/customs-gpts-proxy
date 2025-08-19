// api/trade.js
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://chat.openai.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, openai-conversation-id, openai-ephemeral-user-id');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // 관세청 수출입실적 API
    const baseUrl = 'https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList';
    const serviceKey = '3VkSJ0Q0/cRKftezt4f/L899ZRVB7IBNc/r8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO/BOyzHxBaiRynSg==';
    
    // 클라이언트에서 받은 파라미터
    const { 
      strtYymm,  // 조회시작년월
      endYymm,   // 조회종료년월
      hsSgn,     // HS코드
      imexTp = '2'  // 수출입구분 (1:수출, 2:수입)
    } = req.query;
    
    // 필수 파라미터 체크
    if (!strtYymm || !endYymm || !hsSgn) {
      return res.status(400).json({
        error: '필수 파라미터가 누락되었습니다',
        required: ['strtYymm', 'endYymm', 'hsSgn']
      });
    }
    
    // API 호출 URL 구성
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      strtYymm: strtYymm,
      endYymm: endYymm,
      hsSgn: hsSgn,
      imexTp: imexTp,
      pageNo: '1',
      numOfRows: '1000',  // 충분한 데이터 가져오기
      type: 'json'
    });
    
    const apiUrl = `${baseUrl}?${params.toString()}`;
    
    // API 호출
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // 응답 반환
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: '수출입 실적을 가져오는데 실패했습니다',
      details: error.message 
    });
  }
}