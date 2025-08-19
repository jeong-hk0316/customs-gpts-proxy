import { parseStringPromise } from 'xml2js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const baseUrl = 'https://apis.data.go.kr/1220000/itemCountryTrade/getItemCountryTrade';
    const apiKey = '👉여기_네_API키👈';
    const { strtYymm, endYymm, hsSgn, imexTp = '2', cntyCd = '' } = req.query;

    if (!strtYymm || !endYymm || !hsSgn) {
      return res.status(400).json({
        error: '필수 파라미터가 누락되었습니다',
        required: ['strtYymm', 'endYymm', 'hsSgn']
      });
    }

    const params = new URLSearchParams({
      serviceKey: apiKey,    // ✅ 수출입 API는 소문자
      strtYymm,
      endYymm,
      hsSgn,
      imexTp,
      cntyCd,
      pageNo: '1',
      numOfRows: '1000'
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    const response = await fetch(apiUrl);
    const text = await response.text();

    // ✅ XML → JSON 변환
    const xmlData = await parseStringPromise(text, { explicitArray: false });

    return res.status(200).json({
      success: true,
      data: xmlData.response?.body?.items?.item || [],
      raw: xmlData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "품목별·국가별 수출입실적 API 호출 중 오류 발생"
    });
  }
}
