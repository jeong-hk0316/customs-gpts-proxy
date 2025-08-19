// api/exchange.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://chat.openai.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, openai-conversation-id, openai-ephemeral-user-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const baseUrl = 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo';
    const serviceKey = '3VkSJ0Q0/cRKftezt4f/L899ZRVB7IBNc/r8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO+BOyzHxBaiRynSg==';
    
    // 여러 날짜 시도
    const dates = [
      req.query.searchDate,
      '20241213',  // 금요일
      '20241212',  // 목요일
      '20241210',  // 화요일
      '20241209'   // 월요일
    ].filter(Boolean);
    
    let successData = null;
    let lastError = null;
    
    for (const searchDate of dates) {
      const apiUrl = `${baseUrl}?serviceKey=${encodeURIComponent(serviceKey)}&searchDate=${searchDate}&imexTp=${req.query.imexTp || '2'}&pageNo=1&numOfRows=100`;
      
      const response = await fetch(apiUrl);
      const xmlText = await response.text();
      
      // 디버깅: XML 응답 일부 반환
      console.log(`Date ${searchDate} response:`, xmlText.substring(0, 300));
      
      // 성공 응답 체크
      if (xmlText.includes('<resultCode>00</resultCode>')) {
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
        
        if (items.length > 0) {
          successData = {
            success: true,
            data: items,
            count: items.length,
            date: searchDate,
            message: `${searchDate} 날짜의 데이터를 가져왔습니다.`
          };
          break;
        }
      }
      
      // 에러 메시지 저장
      const errorMsg = (xmlText.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/) || [])[1];
      if (errorMsg) {
        lastError = errorMsg;
      }
    }
    
    // 성공 데이터가 있으면 반환
    if (successData) {
      return res.status(200).json(successData);
    }
    
    // 모든 날짜 실패 시 디버깅 정보 반환
    res.status(200).json({
      success: false,
      data: [],
      count: 0,
      message: '여러 날짜를 시도했지만 데이터가 없습니다.',
      triedDates: dates,
      lastError: lastError,
      debug: '관세청 API가 주말/공휴일 데이터를 제공하지 않을 수 있습니다.'
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: '환율 정보를 가져오는데 실패했습니다',
      details: error.message 
    });
  }
}
