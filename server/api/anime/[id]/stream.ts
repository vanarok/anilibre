
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID не указан'
        })
    }

    const query = getQuery(event)
    const { episode, quality } = query

    if (episode && quality) {
        try {
            const data = await $fetch(`/api/anime/${id}`)
            const episodeData = data.player.list[episode as string]

            if (!episodeData) {
                throw createError({
                    statusCode: 404,
                    message: 'Эпизод не найден'
                })
            }
            const videoUrl = `https://${data.player.host}${episodeData.hls[quality as string]}`

            return proxyRequest(event, videoUrl, {
                headers: {
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Origin': 'https://anilibria.tv',
                    'Referer': 'https://anilibria.tv/'
                }
            })
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: 'Ошибка при получении видеопотока'
            })
        }
    }
})