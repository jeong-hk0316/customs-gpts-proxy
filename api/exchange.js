import { parseStringPromise } from "xml2js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const baseUrl = "https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo";
    const apiKey =
      "3VkSJ0Q0%2FcRKftezt4f%2FL899ZRVB7IBNc%2Fr8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO%2BBOyzHxBaiRynSg%3D%3D";

    const { searchDate = "20240801" } = req.query;

    const params = new URLSearchParams({
      serviceKey: apiKey, // 반드시 serviceKey (대소문자 주의)
      aplyBgnDt: searchDate,
      weekFxrtTpcd: "2",
      pageNo: "1",
      numOfRows: "100",
      _type: "json", // JSON 요청
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    const response = await fetch(apiUrl);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text); // JSON 응답일 경우
    } catch {
      data = await parseStringPromise(text, { explicitArray: false }); // XML 응답일 경우
    }

    return res.status(200).json({
      success: true,
      data: data?.response?.body?.items?.item || [],
      raw: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "환율 API 호출 중 오류 발생",
    });
  }
}
