export const addModaMatchButton = (onClick: (e: Event) => any) => {
  const buttonElements = document.getElementsByClassName('modamatch')

  for (const buttonElement of buttonElements) {
    buttonElement.addEventListener('click', (e) => onClick(e))
  }
}
