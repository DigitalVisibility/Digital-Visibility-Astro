import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, platform, url }) => {
  try {
    // Basic auth check
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Basic ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const credentials = atob(auth.substring(6)).split(':');
    const adminUser = platform?.env?.ADMIN_USER;
    const adminPass = platform?.env?.ADMIN_PASS;
    
    if (credentials[0] !== adminUser || credentials[1] !== adminPass) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const page = url.searchParams.get('page') || '/funnel/a/';
    const variant = url.searchParams.get('variant') || 'A';
    const period = url.searchParams.get('period') || '24h';
    const date = url.searchParams.get('date');

    // Calculate date range
    let startDate: string;
    let endDate: string;
    
    if (date) {
      // Specific date
      startDate = date;
      endDate = date;
    } else {
      // Period-based
      const now = new Date();
      endDate = now.toISOString().split('T')[0];
      
      if (period === '24h') {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        startDate = yesterday.toISOString().split('T')[0];
      } else if (period === '7d') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
      } else {
        // Default to 24h
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        startDate = yesterday.toISOString().split('T')[0];
      }
    }

    // Fetch heatmap data for the date range
    const heatmapData = await fetchHeatmapData(platform?.env, startDate, endDate, page, variant);
    
    return new Response(JSON.stringify(heatmapData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Heatmap API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

async function fetchHeatmapData(env: any, startDate: string, endDate: string, page: string, variant: string) {
  try {
    const points: Array<{ x: number; y: number; value: number }> = [];
    let max = 0;
    
    // Iterate through date range
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      try {
        // Try to get heatmap data for this date
        const heatmapKey = `funnel:heat:${dateStr}:${page}:${variant}`;
        const heatmapData = await env?.FUNNEL_DATA?.get(heatmapKey);
        
        if (heatmapData) {
          const dayPoints = JSON.parse(heatmapData);
          points.push(...dayPoints);
          
          // Update max value
          const dayMax = Math.max(...dayPoints.map((p: any) => p.value || 1));
          max = Math.max(max, dayMax);
        }
      } catch (error) {
        console.error(`Error fetching heatmap data for ${dateStr}:`, error);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // If no data found, return empty state
    if (points.length === 0) {
      return {
        points: [],
        max: 1,
        message: 'No heatmap data available for the specified period'
      };
    }
    
    // Normalize coordinates to percentage (0-100)
    const normalizedPoints = points.map(point => ({
      x: Math.round(point.x * 100),
      y: Math.round(point.y * 100),
      value: point.value || 1
    }));
    
    // Remove duplicates and aggregate overlapping points
    const aggregatedPoints = aggregateHeatmapPoints(normalizedPoints);
    
    return {
      points: aggregatedPoints,
      max: Math.max(max, 1),
      totalPoints: points.length,
      aggregatedPoints: aggregatedPoints.length,
      dateRange: { startDate, endDate },
      page,
      variant
    };
    
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return {
      points: [],
      max: 1,
      error: 'Failed to fetch heatmap data'
    };
  }
}

function aggregateHeatmapPoints(points: Array<{ x: number; y: number; value: number }>): Array<{ x: number; y: number; value: number }> {
  const grid: Map<string, number> = new Map();
  
  // Group points into a grid (5x5 pixel tolerance)
  points.forEach(point => {
    const gridX = Math.floor(point.x / 5) * 5;
    const gridY = Math.floor(point.y / 5) * 5;
    const key = `${gridX},${gridY}`;
    
    grid.set(key, (grid.get(key) || 0) + (point.value || 1));
  });
  
  // Convert back to point array
  return Array.from(grid.entries()).map(([key, value]) => {
    const [x, y] = key.split(',').map(Number);
    return { x, y, value };
  });
}
