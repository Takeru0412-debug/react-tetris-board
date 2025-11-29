import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/react-tetris-board/', // ← リポジトリ名をそのまま書く
})
