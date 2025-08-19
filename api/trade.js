// api/trade.js
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://chat.openai.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, openai-conversation-id, openai-ephemeral-user-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // 관세청 수출입실적 API
    const baseUrl = 'https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList';
    const serviceKey = '3VkSJ0Q0/cRKftezt4f/L899ZRVB7IBNc/r8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO/BOyzHxBaiRynSg==';
    
    const { 
      strtYymm,
      endYymm,
      hsSgn,
      imexTp = '2'
    } = req.query;
    
    // 필수 파라미터 체크
    if (!strtYymm || !endYymm || !hsSgn) {
      return res.status(400).json({
        error: '필수 파라미터가 누락되었습니다',
        required: ['strtYymm', 'endYymm', 'hsSgn']
      });
    }
    
    // URL 파라미터 구성 - XML로 받기
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      strtYymm: strtYymm,
      endYymm: endYymm,
      hsSgn: hsSgn,
      imexTp: imexTp,
      pageNo: '1',
      numOfRows: '1000'
      // type 파라미터 제거 (기본값이 XML)
    });
    
    const apiUrl = `${baseUrl}?${params.toString()}`;
    
    // API 호출
    const response = await fetch(apiUrl);
    const xmlText = await response.text();
    
    // 간단한 XML 파싱
    const items = [];
    const itemMatches = xmlText.matchAll(/<item>(.*?)<\/item>/gs);
    
    for (const match of itemMatches) {
      const itemXml = match[1];
      const item = {
        year: (itemXml.match(/<year>(.*?)<\/year>/) || [])[1],
        hsSgn: (itemXml.match(/<hsSgn>(.*?)<\/hsSgn>/) || [])[1],
        ctryCd: (itemXml.match(/<ctryCd>(.*?)<\/ctryCd>/) || [])[1],
        ctryNm: (itemXml.match(/<ctryNm>(.*?)<\/ctryNm>/) || [])[1],
        expDlr: (itemXml.match(/<expDlr>(.*?)<\/expDlr>/) || [])[1],
        impDlr: (itemXml.match(/<impDlr>(.*?)<\/impDlr>/) || [])[1],
        balDlr: (itemXml.match(/<balDlr>(.*?)<\/balDlr>/) || [])[1]
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
      error: '수출입 실적을 가져오는데 실패했습니다',
      details: error.message 
    });
  }
}