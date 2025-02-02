export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const API_BASE = 'https://api.anilibria.tv/v3'

  const response = await fetch(`${API_BASE}/title?id=${id}`, {
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Origin': 'https://anilibria.tv',
      'Referer': 'https://anilibria.tv/'
    }
  })
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: 'API Error'
    })
  }
  return response.json()
}) 