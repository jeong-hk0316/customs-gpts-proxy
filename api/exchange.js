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
    const baseUrl = 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo';
    
    // Decoding 키 사용 (+ 주의!)
    const serviceKey = '3VkSJ0Q0/cRKftezt4f/L899ZRVB7IBNc/r8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO+BOyzHxBaiRynSg==';
    
    const { searchDate = '20241216', imexTp = '2' } = req.query;
    
    // URL 직접 구성 (인코딩 주의)
    const apiUrl = `${baseUrl}?serviceKey=${encodeURIComponent(serviceKey)}&searchDate=${searchDate}&imexTp=${imexTp}&pageNo=1&numOfRows=100`;
    
    console.log('API Call:', apiUrl);
    
    // API 호출
    const response = await fetch(apiUrl);
    const xmlText = await response.text();
    
    console.log('Response:', xmlText.substring(0, 500));
    
    // 에러 체크
    if (xmlText.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
      return res.status(200).json({
        success: false,
        error: '서비스키 오류',
        message: '서비스키가 등록되지 않았습니다.'
      });
    }
    
    // XML 파싱
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
      
      if (item.currCd) {
        items.push(item);
      }
    }
    
    res.status(200).json({
      success: items.length > 0,
      data: items,
      count: items.length,
      date: searchDate,
      message: items.length === 0 ? '해당 날짜에 데이터가 없습니다.' : null
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: '환율 정보를 가져오는데 실패했습니다',
      details: error.message 
    });
  }
}