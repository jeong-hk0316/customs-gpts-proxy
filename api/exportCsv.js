// api/exportCsv.js (CSV 다운로드 프록시)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const baseUrl =
      "https://apis.data.go.kr/1220000/itemCountryTrade/getItemCountryTradeCsv";

    // ✅ 인코딩된 API Key
    const apiKey =
      "3VkSJ0Q0%2FcRKftezt4f%2FL899ZRVB7IBNc%2Fr8fSqbf5yBFrjXoZP19XZXfceKbp9zwffD4hO%2BBOyzHxBaiRynSg%3D%3D";

    const { strtYymm, endYymm, hsSgn, imexTp = "2" } = req.query;

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
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log("Calling ExportCsv API:", apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    // ✅ CSV 데이터를 스트리밍 그대로 반환
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="export_${hsSgn}_${strtYymm}_${endYymm}.csv"`
    );

    const csv = await response.text();
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error.message,
      message: "CSV 다운로드 API 호출 중 오류 발생",
    });
  }
}
