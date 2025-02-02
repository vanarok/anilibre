export const useSearch = () => {
  const searchQuery = useState<string>('searchQuery', () => '')

  return {
    searchQuery
  }
} 