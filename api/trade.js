// api/trade.js (국가별 실적 버전)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const baseUrl = 'https://apis.data.go.kr/1220000/itemCountryTrade/getItemCountryTrade';
    const apiKey = '3VkSJ0Q0%2FcRKftezt4f%2FL899ZRVB7IBNc%2Fr8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO%2BBOyzHxBaiRynSg%3D%3D';

    const { strtYymm, endYymm, hsSgn, imexTp = '2', cntyCd = '' } = req.query;

    if (!strtYymm || !endYymm || !hsSgn) {
      return res.status(400).json({
        error: '필수 파라미터가 누락되었습니다',
        required: ['strtYymm', 'endYymm', 'hsSgn']
      });
    }

    const params = new URLSearchParams({
      serviceKey: apiKey,
      strtYymm,
      endYymm,
      hsSgn,
      imexTp,
      cntyCd,           // 비워두면 전체 국가
      pageNo: '1',
      numOfRows: '1000',
      type: 'json'
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log('Calling Trade API:', apiUrl);

    const response = await fetch(apiUrl);
    const data = await response.json();

    return res.status(200).json({
      success: data.response?.header?.resultCode === '00',
      data: data.response?.body?.items?.item || [],
      raw: data
    });

  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error.message,
      message: "품목별·국가별 수출입실적 API 호출 중 오류 발생"
    });
  }
}
