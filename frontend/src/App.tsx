import { useState } from 'react'
import './App.css'
import MarkdownRenderer from './MarkdownRenderer'

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showFullImage, setShowFullImage] = useState(false)
  const [tests, setTests] = useState({ content: '', status: '' })
  const [loading, setLoading] = useState(false)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setTests({ content: '', status: '' })
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async () => {
    if (!selectedImage) {
      alert('Por favor, selecione uma imagem primeiro')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', selectedImage)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok || !data.testsDescriptions) {
        setTests({
          content: data.error || 'Ocorreu um erro. Tente novamente!',
          status: 'error',
        })
      } else {
        setTests({
          content: data.testsDescriptions,
          status: data.status || 'success',
        })
      }
    } catch {
      setTests({
        content: 'Ocorreu um erro. Tente novamente!',
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Análise Inteligente de Interfaces 
          </h1>
          <p className="text-gray-600 text-lg">
            Envie uma imagem de uma interface (print da tela do site/app) e receba automaticamente
            uma análise de possíveis vulnerabilidades.
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white p-6 rounded-xl shadow-md">

          {/* Instruções */}
          <div className="mb-4 text-sm text-gray-500">
            1. Selecione uma imagem da tela ou sistema<br />
            2. Clique em <strong>Gerar análise</strong>
          </div>

          {/* Upload */}
          <div className="p-4 bg-gray-100 rounded flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1 text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />

            {/* Limpar */}
            <button
              onClick={handleClear}
              disabled={!selectedImage && !tests.status}
              className="p-2 text-red-600 hover:bg-red-50 rounded
                disabled:text-gray-400 disabled:cursor-not-allowed"
              title="Limpar"
            >
              🗑️
            </button>

            {/* Gerar */}
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded
                hover:bg-blue-700 disabled:bg-gray-400
                disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? 'Analisando...' : 'Gerar análise'}
            </button>
          </div>

          {/* Preview da imagem */}
          {imagePreview && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
                Imagem selecionada:
              </h3>
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  onClick={() => setShowFullImage(true)}
                  className="max-w-md max-h-96 object-contain rounded border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition-colors"
                  title="Clique para visualizar em tamanho maior"
                />
              </div>
            </div>
          )}

          {/* Modal para visualização em tela cheia */}
          {showFullImage && imagePreview && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowFullImage(false)}
            >
              <div className="relative max-w-7xl max-h-screen">
                <button
                  onClick={() => setShowFullImage(false)}
                  className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 font-bold text-xl"
                  title="Fechar"
                >
                  ✕
                </button>
                <img
                  src={imagePreview}
                  alt="Preview em tamanho maior"
                  className="max-w-full max-h-screen object-contain rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Resultado */}
          {tests.status && (
            <div
              className={`mt-6 p-5 rounded-lg ${
                tests.status === 'success'
                  ? 'bg-gray-50'
                  : 'bg-red-50 border-2 border-red-500'
              }`}
            >
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Resultado da análise
              </h2>
              <hr />
              <MarkdownRenderer content={tests.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
