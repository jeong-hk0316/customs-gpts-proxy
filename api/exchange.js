// api/exchange.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const baseUrl = 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo';
    
    // 인코딩된 키 사용
    const encodedKey = '3VkSJ0Q0%2FcRKftezt4f%2FL899ZRVB7IBNc%2Fr8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO%2BBOyzHxBaiRynSg%3D%3D';
    
    // 파라미터 설정 - 정확한 이름 사용
    const params = new URLSearchParams({
      ServiceKey: encodedKey,  // ServiceKey (대문자 S 주의!)
      searchDate: req.query.searchDate || '20241210',
      imexTp: req.query.imexTp || '2',
      pageNo: '1',
      numOfRows: '100',
      _type: 'json'  // JSON 응답 요청
    });
    
    const apiUrl = `${baseUrl}?${params.toString()}`;
    
    console.log('Calling:', apiUrl);
    
    const response = await fetch(apiUrl);
    const contentType = response.headers.get('content-type');
    
    // JSON 응답인 경우
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(200).json({
        success: true,
        data: data.response?.body?.items || [],
        raw: data
      });
    }
    
    // XML 응답인 경우
    const text = await response.text();
    
    // XML 파싱
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];
      const item = {
        currCd: (itemXml.match(/<currCd>(.*?)<\/currCd>/) || [,''])[1],
        currNm: (itemXml.match(/<currNm>(.*?)<\/currNm>/) || [,''])[1],
        fxrt: (itemXml.match(/<fxrt>(.*?)<\/fxrt>/) || [,''])[1],
        imexTp: (itemXml.match(/<imexTp>(.*?)<\/imexTp>/) || [,''])[1]
      };
      if (item.currCd) items.push(item);
    }
    
    return res.status(200).json({
      success: items.length > 0,
      data: items,
      count: items.length,
      date: req.query.searchDate || '20241210'
    });
    
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error.message,
      message: "API 호출 중 오류가 발생했습니다"
    });
  }
}
