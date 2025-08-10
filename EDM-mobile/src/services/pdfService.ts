import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { analyticsService } from './analyticsService';

export async function generateHealthReportPdf(userId: string, startDate: string, endDate: string) {
  const analytics = await analyticsService.getAnalytics(userId, startDate, endDate);

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; padding: 24px; color: #111827; }
        h1 { font-size: 24px; margin: 0 0 8px 0; }
        h2 { font-size: 18px; margin: 16px 0 8px 0; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .row { display: flex; justify-content: space-between; }
        .muted { color: #6b7280; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
      </style>
    </head>
    <body>
      <h1>Lotus Health Report</h1>
      <div class="muted">Range: ${startDate} → ${endDate}</div>

      <div class="card">
        <h2>Digestive Photos</h2>
        <div>Total photos: ${analytics.digestiveData.photosCount}</div>
      </div>

      <div class="card">
        <h2>Top Symptoms</h2>
        <table>
          <thead><tr><th>Symptom</th><th>Count</th></tr></thead>
          <tbody>
            ${analytics.symptomsData.slice(0, 10).map(s => `<tr><td>${s.name}</td><td>${s.count}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Symptoms vs Period</h2>
        <div class="row"><div>With period</div><div>${analytics.periodSymptomData.withPeriod.toFixed(1)}</div></div>
        <div class="row"><div>Without period</div><div>${analytics.periodSymptomData.withoutPeriod.toFixed(1)}</div></div>
        <div class="row"><div>Correlation</div><div>${analytics.periodSymptomData.correlation.toFixed(2)}</div></div>
      </div>

      <div class="muted" style="margin-top:24px">Lotus</div>
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
  return uri;
} 