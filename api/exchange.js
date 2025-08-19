// api/exchange.js
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
    // 관세청 환율정보 API
    const baseUrl = 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo';
    const serviceKey = '3VkSJ0Q0/cRKftezt4f/L899ZRVB7IBNc/r8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO/BOyzHxBaiRynSg==';
    
    // 클라이언트에서 받은 파라미터
    const { searchDate, imexTp = '2' } = req.query;
    
    // API 호출 URL 구성
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      searchDate: searchDate || new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      imexTp: imexTp,
      pageNo: '1',
      numOfRows: '100',
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
      error: '환율 정보를 가져오는데 실패했습니다',
      details: error.message 
    });
  }
}