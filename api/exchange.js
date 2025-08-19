// api/exchange.js
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://chat.openai.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, openai-conversation-id, openai-ephemeral-user-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // 관세청 환율정보 API
    const baseUrl = 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo';
    const serviceKey = '3VkSJ0Q0/cRKftezt4f/L899ZRVB7IBNc/r8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO/BOyzHxBaiRynSg==';
    
    const { searchDate, imexTp = '2' } = req.query;
    
    // URL 파라미터 구성 - XML로 받기
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      searchDate: searchDate || new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      imexTp: imexTp,
      pageNo: '1',
      numOfRows: '100'
      // type 파라미터 제거 (기본값이 XML)
    });
    
    const apiUrl = `${baseUrl}?${params.toString()}`;
    
    // API 호출
    const response = await fetch(apiUrl);
    const xmlText = await response.text();
    
    // 간단한 XML 파싱 (환율 데이터 추출)
    const items = [];
    const itemMatches = xmlText.matchAll(/<item>(.*?)<\/item>/gs);
    
    for (const match of itemMatches) {
      const itemXml = match[1];
      const item = {
        currCd: (itemXml.match(/<currCd>(.*?)<\/currCd>/) || [])[1],
        currNm: (itemXml.match(/<currNm>(.*?)<\/currNm>/) || [])[1],
        fxrt: (itemXml.match(/<fxrt>(.*?)<\/fxrt>/) || [])[1],
        imexTp: (itemXml.match(/<imexTp>(.*?)<\/imexTp>/) || [])[1]
      };
      items.push(item);
    }
    
    // JSON 형식으로 응답
    res.status(200).json({
      success: true,
      data: items,
      count: items.length
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: '환율 정보를 가져오는데 실패했습니다',
      details: error.message 
    });
  }
}