import { parseStringPromise } from 'xml2js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const baseUrl = 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo';
    const apiKey = '👉여기_네_API키👈';
    const { searchDate = '20240801' } = req.query;

    const params = new URLSearchParams({
      ServiceKey: apiKey,        // ✅ 환율 API는 대문자
      aplyBgnDt: searchDate,
      weekFxrtTpcd: '2',
      pageNo: '1',
      numOfRows: '100'
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
      message: "환율 API 호출 중 오류 발생"
    });
  }
}
