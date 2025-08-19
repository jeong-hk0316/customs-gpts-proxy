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

    // 관세청 환율 API 인증키 (인코딩된 형태 그대로 사용해도 OK)
    const apiKey = '3VkSJ0Q0%2FcRKftezt4f%2FL899ZRVB7IBNc%2Fr8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO%2BBOyzHxBaiRynSg%3D%3D';

    // 날짜는 YYYYMM01 형태 권장 (월 초 기준)
    const { searchDate = '20240801' } = req.query;

    const params = new URLSearchParams({
      serviceKey: apiKey,      // ✅ 반드시 소문자 serviceKey
      aplyBgnDt: searchDate,   // 시작일자
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
