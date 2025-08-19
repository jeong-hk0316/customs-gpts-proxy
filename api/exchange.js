// api/exchange.js (관세청 환율 API 프록시)
import { parseStringPromise } from "xml2js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const baseUrl =
      "https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo";

    // ✅ 인코딩된 API Key 그대로 사용
    const apiKey =
      "3VkSJ0Q0%2FcRKftezt4f%2FL899ZRVB7IBNc%2Fr8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO%2BBOyzHxBaiRynSg%3D%3D";

    // YYYYMM01 형식 권장
    const { searchDate = "20240801" } = req.query;

    const params = new URLSearchParams({
      ServiceKey: apiKey, // ✅ 반드시 대문자 S
      aplyBgnDt: searchDate, // 시작일자
      weekFxrtTpcd: "2", // 2 = 수입환율
      pageNo: "1",
      numOfRows: "100",
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log("Calling Exchange API:", apiUrl);

    const response = await fetch(apiUrl);
    const contentType = response.headers.get("content-type");

    let items = [];

    if (contentType && contentType.includes("application/json")) {
      // ✅ JSON 응답 처리
      const data = await response.json();
      items = data.response?.body?.items?.item || [];
      return res.status(200).json({
        success: data.response?.header?.resultCode === "00",
        data: items,
        raw: data,
      });
    } else {
      // ✅ XML 응답 처리
      const text = await response.text();
      const result = await parseStringPromise(text, { explicitArray: false });
      const header = result?.response?.header;
      const body = result?.response?.body;
      items = body?.items?.item || [];

      return res.status(200).json({
        success: header?.resultCode === "00",
        data: Array.isArray(items) ? items : [items],
        raw: result,
      });
    }
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error.message,
      message: "환율 API 호출 중 오류 발생",
    });
  }
}
