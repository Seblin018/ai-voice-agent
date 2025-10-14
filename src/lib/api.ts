export async function provisionPhoneNumber(businessId: string) {
  const response = await fetch('/api/provision-number', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_id: businessId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to provision number');
  }

  return response.json();
}

export async function toggleAgent(businessId: string, enabled: boolean) {
  const response = await fetch('/api/toggle-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_id: businessId, enabled }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle agent');
  }

  return response.json();
}
