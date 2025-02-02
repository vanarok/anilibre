import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = query.search as string
  
  try {
    const response = await fetch(`https://api.anilibria.tv/v3/title/search?search=${encodeURIComponent(search)}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error('API Error')
    }
    
    return data
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Ошибка при поиске аниме'
    })
  }
}) 