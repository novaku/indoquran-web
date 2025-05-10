import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all surah data to generate URLs
  const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/surat')
  const data = await res.json()
  const surahList = data.data || []
  
  // Base URLs
  const baseUrl = 'http://indoquran.web.id'
  const baseEntries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]
  
  // Generate entries for each surah
  const surahEntries = surahList.map((surah: any) => ({
    url: `${baseUrl}/surah/${surah.nomor}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))
  
  return [...baseEntries, ...surahEntries]
}
