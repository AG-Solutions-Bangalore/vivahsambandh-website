import { useState } from 'react'
import type { ContactFormData } from '../types'

export function useHome() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeStory, setActiveStory] = useState<number>(0)
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false)
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', message: '' })
      setFormSubmitted(false)
    }, 4000)
  }

  return {
    openFaq,
    toggleFaq,
    activeStory,
    setActiveStory,
    formData,
    formSubmitted,
    handleInputChange,
    handleFormSubmit,
  }
}
