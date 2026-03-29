// Parse and validate data from JSON files
async function fetchJsonCandidate(url) {
  const requestUrl = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  const response = await fetch(requestUrl, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    return null;
  }

  const rawText = await response.text();
  const modifiedHeader = response.headers.get('last-modified');
  const modifiedAt = modifiedHeader ? Date.parse(modifiedHeader) : 0;

  return {
    url,
    modifiedAt: Number.isNaN(modifiedAt) ? 0 : modifiedAt,
    data: JSON.parse(rawText),
  };
}

export async function fetchData(url) {
  try {
    if (import.meta.env.DEV && url.startsWith('/data/')) {
      const distUrl = `/dist${url}`;
      const [publicResult, distResult] = await Promise.all([
        fetchJsonCandidate(url),
        fetchJsonCandidate(distUrl),
      ]);

      const candidates = [publicResult, distResult].filter(Boolean);
      if (candidates.length === 0) {
        throw new Error(`Failed to fetch ${url} and ${distUrl}`);
      }

      candidates.sort((a, b) => b.modifiedAt - a.modifiedAt);
      return candidates[0].data;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getGradeColor(grade) {
  const colors = {
    high: '#d1fae5',
    mid: '#fef3c7',
    low: '#fee2e2',
  };
  return colors[grade] || '#e5e7eb';
}

export function getGradeTextColor(grade) {
  const colors = {
    high: '#065f46',
    mid: '#92400e',
    low: '#991b1b',
  };
  return colors[grade] || '#374151';
}
