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
    
    // 날짜 처리 - 어제 날짜로 설정 (주말/공휴일 고려)
    const today = new Date();
    today.setDate(today.getDate() - 1); // 어제 날짜
    const defaultDate = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const { searchDate = defaultDate, imexTp = '2' } = req.query;
    
    // 디버깅용 로그
    console.log('Request Date:', searchDate);
    
    // URL 파라미터 구성
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      searchDate: searchDate,
      imexTp: imexTp,
      pageNo: '1',
      numOfRows: '100'
    });
    
    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log('API URL:', apiUrl);
    
    // API 호출
    const response = await fetch(apiUrl);
    const xmlText = await response.text();
    
    // 디버깅용 - XML 일부 출력
    console.log('XML Response (first 500 chars):', xmlText.substring(0, 500));
    
    // 에러 체크
    if (xmlText.includes('<returnAuthMsg>')) {
      const authMsg = (xmlText.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/) || [])[1];
      const reasonCode = (xmlText.match(/<returnReasonCode>(.*?)<\/returnReasonCode>/) || [])[1];
      
      return res.status(200).json({
        success: false,
        error: authMsg || '인증 오류',
        code: reasonCode,
        message: '날짜를 확인해주세요. 주말이나 공휴일은 데이터가 없을 수 있습니다.',
        requestedDate: searchDate
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
        imexTp: (itemXml.match(/<imexTp>(.*?)<\/imexTp>/) || [])[1],
        searchDate: searchDate
      };
      
      // 빈 값 체크
      if (item.currCd) {
        items.push(item);
      }
    }
    
    // 결과 반환
    res.status(200).json({
      success: items.length > 0,
      data: items,
      count: items.length,
      requestDate: searchDate,
      message: items.length === 0 ? '해당 날짜에 데이터가 없습니다. 평일 날짜로 다시 시도해보세요.' : null
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: '환율 정보를 가져오는데 실패했습니다',
      details: error.message 
    });
  }
}