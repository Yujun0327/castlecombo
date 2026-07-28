import { mount } from 'svelte'
import '@fontsource-variable/grenze-gotisch'
import '@fontsource/eb-garamond/400.css'
import '@fontsource/eb-garamond/400-italic.css'
import '@fontsource/eb-garamond/600.css'
import '@fontsource/eb-garamond/600-italic.css'
import '@fontsource/alegreya-sans-sc/500.css'
import '@fontsource/alegreya-sans-sc/700.css'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
