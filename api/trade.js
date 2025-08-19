// api/trade.js (국가별 품목별 실적)
import { parseStringPromise } from "xml2js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const baseUrl = "https://apis.data.go.kr/1220000/itemCountryTrade/getItemCountryTrade";
    const apiKey =
      "3VkSJ0Q0%2FcRKftezt4f%2FL899ZRVB7IBNc%2Fr8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO%2BBOyzHxBaiRynSg%3D%3D";

    const { strtYymm, endYymm, hsSgn, imexTp = "2", cntyCd = "" } = req.query;

    if (!strtYymm || !endYymm || !hsSgn) {
      return res.status(400).json({
        error: "필수 파라미터가 누락되었습니다",
        required: ["strtYymm", "endYymm", "hsSgn"],
      });
    }

    const params = new URLSearchParams({
      ServiceKey: apiKey, // ✅ 대문자 S
      strtYymm,
      endYymm,
      hsSgn,
      imexTp,
      cntyCd, // 국가코드 (비우면 전체 국가)
      pageNo: "1",
      numOfRows: "1000",
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log("Calling Trade API:", apiUrl);

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
      message: "품목별·국가별 수출입실적 API 호출 중 오류 발생",
    });
  }
}
