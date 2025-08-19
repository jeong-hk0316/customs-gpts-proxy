// api/trade.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const baseUrl = 'https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList';
    const encodedKey = '3VkSJ0Q0%2FcRKftezt4f%2FL899ZRVB7IBNc%2Fr8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO%2BBOyzHxBaiRynSg%3D%3D';
    
    const { strtYymm, endYymm, hsSgn, imexTp = '2' } = req.query;
    
    if (!strtYymm || !endYymm || !hsSgn) {
      return res.status(400).json({
        error: '필수 파라미터가 누락되었습니다',
        required: ['strtYymm', 'endYymm', 'hsSgn']
      });
    }
    
    const params = new URLSearchParams({
      ServiceKey: encodedKey,  // ServiceKey (대문자 S!)
      strtYymm: strtYymm,
      endYymm: endYymm,
      hsSgn: hsSgn,
      imexTp: imexTp,
      pageNo: '1',
      numOfRows: '1000',
      _type: 'json'
    });
    
    const apiUrl = `${baseUrl}?${params.toString()}`;
    const response = await fetch(apiUrl);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(200).json({
        success: true,
        data: data.response?.body?.items || [],
        raw: data
      });
    }
    
    const text = await response.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];
      const item = {
        year: (itemXml.match(/<year>(.*?)<\/year>/) || [,''])[1],
        hsSgn: (itemXml.match(/<hsSgn>(.*?)<\/hsSgn>/) || [,''])[1],
        ctryNm: (itemXml.match(/<ctryNm>(.*?)<\/ctryNm>/) || [,''])[1],
        impDlr: (itemXml.match(/<impDlr>(.*?)<\/impDlr>/) || [,''])[1],
        expDlr: (itemXml.match(/<expDlr>(.*?)<\/expDlr>/) || [,''])[1]
      };
      if (item.hsSgn) items.push(item);
    }
    
    return res.status(200).json({
      success: items.length > 0,
      data: items,
      count: items.length
    });
    
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error.message
    });
  }
}
