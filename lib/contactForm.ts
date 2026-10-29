import * as z from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactFormData = z.infer<typeof contactSchema>

/** Posts the contact form and reports the outcome in a SweetAlert2 dialog. Resolves true on success. */
export async function sendContactMessage(data: ContactFormData): Promise<boolean> {
  // Loaded on demand so SweetAlert2 stays out of the initial page bundle.
  const { default: Swal } = await import('sweetalert2')
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()

    if (response.ok && result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: result.message || 'I will get back to you soon.',
        confirmButtonColor: '#0284c7',
        confirmButtonText: 'Great!',
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-lg px-6 py-2',
        },
      })
      return true
    }
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: result.message || 'Failed to send message. Please try again.',
      confirmButtonColor: '#dc2626',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg px-6 py-2',
      },
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred. Please try again later.',
      confirmButtonColor: '#dc2626',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg px-6 py-2',
      },
    })
  }
  return false
}
