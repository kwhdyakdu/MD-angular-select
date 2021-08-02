import { modamatchConfig } from '.'

export const addModaMatchButton = (shadowRoot: ShadowRoot, onClick: (e: MouseEvent) => any) => {
  const buttonContainer = document.createElement('div')
  buttonContainer.className = 'btn'

  const buttonElement = document.createElement('button')
  buttonElement.type = 'button'
  buttonElement.innerText = 'Virtual try on with Moda-match'
  buttonElement.addEventListener('click', (e) => onClick(e))
  buttonElement.style.backgroundColor = modamatchConfig.store.primaryColor

  buttonContainer.appendChild(buttonElement)
  shadowRoot.appendChild(buttonContainer)
}
