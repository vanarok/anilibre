import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = query.search as string

  if (!search?.trim()) {
    return { 
      status: true,
      data: { items: [] }
    }
  }

  try {
    const response = await fetch('https://www.anilibria.tv/public/api/index.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        query: 'search',
        search: search
      })
    })
    
    return await response.json()
  } catch (error) {
    console.error('Search error:', error)
    throw createError({
      statusCode: 500,
      message: 'Ошибка при поиске аниме'
    })
  }
}) 