// api/trade.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const baseUrl = 'https://apis.data.go.kr/1220000/itemCountryTrade/getItemCountryTrade';
    const apiKey = '여기에_네_Encoding_키_넣기';

    const { strtYymm, endYymm, hsSgn, imexTp = '2', cntyCd = '' } = req.query;

    if (!strtYymm || !endYymm || !hsSgn) {
      return res.status(400).json({
        error: '필수 파라미터가 누락되었습니다',
        required: ['strtYymm', 'endYymm', 'hsSgn']
      });
    }

    const params = new URLSearchParams({
      serviceKey: apiKey,   // ✅ 수출입 API는 반드시 소문자 serviceKey
      strtYymm,
      endYymm,
      hsSgn,
      imexTp,
      cntyCd,               // 국가코드 (비우면 전체 국가)
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
