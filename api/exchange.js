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

    // 관세청 환율 API 키 (Encoding Key)
    const apiKey = '여기에_네_Encoding_키_넣기';

    // YYYYMM01 형태 (월 초 기준 권장)
    const { searchDate = '20240801' } = req.query;

    const params = new URLSearchParams({
      ServiceKey: apiKey,      // ✅ 환율 API는 반드시 대문자 ServiceKey
      aplyBgnDt: searchDate,   // 적용 시작일자
      weekFxrtTpcd: '2',       // 2 = 수입환율
      pageNo: '1',
      numOfRows: '100',
      type: 'json'
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log('Calling Exchange API:', apiUrl);

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
      message: "환율 API 호출 중 오류 발생"
    });
  }
}
