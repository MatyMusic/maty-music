// src/app/api/quote/route.ts
import puppeteer from "puppeteer";

export const runtime = "nodejs"; // לרוץ ב־Node (לא Edge)
export const dynamic = "force-dynamic"; // לאפשר ריצה דינמית בפונקציה

export async function POST(req: Request) {
  try {
    const { html } = await req.json(); // מצפה לקבל HTML ל־PDF (התאם לפי הצורך)

    const browser = await puppeteer.launch({
      // 🔧 כאן התיקון: אסור "new" בגרסאות 21+
      headless: true, // או "shell" אם תרצה (ראה אפשרות 2)
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html ?? "<html><body>Empty</body></html>", {
      waitUntil: "load",
    });

    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=quote.pdf",
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
