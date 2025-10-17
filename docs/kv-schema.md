# KV Store Schema for Funnel Data

## Overview
The KV store (`FUNNEL_DATA`) stores all funnel analytics data, AI recommendations, and historical metrics.

## Key Structure

### Live Data
- **Key**: `funnel:live`
- **Value**: Current aggregated funnel data
- **TTL**: 12 hours
- **Structure**:
```json
{
  "date": "2025-01-01",
  "summary": {
    "totalVisitors": 1247,
    "totalConversions": 89,
    "totalRevenue": 17800,
    "overallConversionRate": 0.071,
    "testDuration": 7,
    "confidenceLevel": 95.2,
    "winner": "B",
    "improvement": "+34.2%"
  },
  "variants": {
    "A": {
      "visitors": 623,
      "conversions": 38,
      "conversionRate": 0.061,
      "revenue": 7600,
      "trafficAllocation": 49.9
    },
    "B": {
      "visitors": 624,
      "conversions": 51,
      "conversionRate": 0.082,
      "revenue": 10200,
      "trafficAllocation": 50.1
    }
  },
  "engagement": {
    "averageSessionDuration": 180,
    "bounceRate": 0.45,
    "rageClicks": 12,
    "scrollDepth": 0.72
  },
  "heatmap": {
    "ctaClicks": 45,
    "formInteractions": 28
  },
  "lastUpdated": "2025-01-01T12:00:00Z"
}
```

### Daily Historical Data
- **Key**: `funnel:daily:YYYY-MM-DD`
- **Value**: Daily aggregated data
- **TTL**: 30 days
- **Structure**: Same as live data but for specific date

### AI Recommendations
- **Key**: `funnel:ai_advice:latest`
- **Value**: Latest AI recommendations
- **TTL**: 7 days
- **Structure**:
```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "data": "{\"recommendations\":[{\"priority\":\"High\",\"suggestion\":\"Variant B's CTA is clearer—apply to A.\",\"rationale\":\"Higher conversion rate with stronger call to action.\"}]}",
  "processed": true
}
```

### Historical AI Advice
- **Key**: `funnel:ai_advice:{timestamp}`
- **Value**: Historical AI recommendations
- **TTL**: 7 days
- **Structure**: Same as latest advice

### Summary Data
- **Key**: `funnel:summary:YYYY-MM-DD`
- **Value**: Daily summary for trends
- **TTL**: 90 days
- **Structure**:
```json
{
  "date": "2025-01-01",
  "totalVisitors": 1247,
  "totalConversions": 89,
  "totalRevenue": 17800,
  "winner": "B",
  "confidence": 95.2
}
```

## Data Flow

1. **Cron Worker** (`cron-funnel-aggregate.js`) runs every 12 hours
2. Fetches data from GA4 and Clarity APIs
3. Processes and calculates metrics
4. Stores in `funnel:live` and `funnel:daily:{date}`
5. Generates AI recommendations via Claude API
6. Stores recommendations in `funnel:ai_advice:latest`

## API Endpoints

- **GET** `/api/funnel-metrics` - Serves live data and recommendations
- **POST** `/api/ai-advice` - Generates new AI recommendations
- **GET** `/admin/funnel-dashboard/` - Admin dashboard consuming the data

## Security

- All admin routes protected by Basic Auth
- No PII stored in KV
- AI recommendations exclude personal data
- All data aggregated and anonymized
