export const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (res.ok) {
      return res.json()
    }
    throw await res.json()
  })
