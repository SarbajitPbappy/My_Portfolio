'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { iconMap } from '@/lib/icons'
import { contactSchema, sendContactMessage, type ContactFormData } from '@/lib/contactForm'
import { Reveal, Section } from './kit'

type ContactInfoItem = { icon: string; text: string; href: string; gradient: string; is_external: boolean }

const FIELDS: { name: keyof ContactFormData; label: string; type?: string; placeholder: string }[] = [
  { name: 'name', label: 'Name', placeholder: 'Your name' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@university.edu' },
  { name: 'subject', label: 'Subject', placeholder: "What's this about?" },
]

export default function ContactMV({ contactInfo }: { contactInfo: ContactInfoItem[] }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (data: ContactFormData) => {
    if (await sendContactMessage(data)) reset()
  }

  return (
    <Section id="contact" title="Contact" description="Let's collaborate on research or discuss opportunities">
      <Reveal depth>
        <div className="mv-cta grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h3 className="text-2xl font-semibold tracking-tight text-theme-text md:text-3xl">Open to research collaboration</h3>
            <p className="mt-3 max-w-[42ch] leading-relaxed text-theme-text-muted">
              Write about joint work, supervision, talks or positions. Email is the fastest way to reach me.
            </p>
            <ul className="mt-8 space-y-1">
              {contactInfo.map((info) => {
                const Icon = iconMap[info.icon] || iconMap.Mail
                return (
                  <li key={info.href}>
                    <a
                      href={info.href}
                      target={info.is_external ? '_blank' : undefined}
                      rel={info.is_external ? 'noopener noreferrer' : undefined}
                      className="mv-contact-row"
                    >
                      <span className="mv-glyph h-9 w-9">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 truncate">{info.text}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mv-form space-y-5 lg:col-span-7" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.slice(0, 2).map((f) => (
                <Field key={f.name} f={f} register={register} error={errors[f.name]?.message} />
              ))}
            </div>
            <Field f={FIELDS[2]} register={register} error={errors.subject?.message} />
            <div className="flex flex-col gap-2">
              <label htmlFor="mv-message" className="text-sm font-medium text-theme-text">
                Message
              </label>
              <textarea
                {...register('message')}
                id="mv-message"
                rows={5}
                placeholder="Tell me about your project or inquiry"
                className="mv-input resize-none"
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && <p className="text-sm text-red-400">{errors.message.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="mv-btn mv-btn-primary w-full sm:w-auto">
              <Send className="h-4 w-4" /> {isSubmitting ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </Reveal>
    </Section>
  )
}

function Field({
  f,
  register,
  error,
}: {
  f: (typeof FIELDS)[number]
  register: ReturnType<typeof useForm<ContactFormData>>['register']
  error?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`mv-${f.name}`} className="text-sm font-medium text-theme-text">
        {f.label}
      </label>
      <input
        {...register(f.name)}
        id={`mv-${f.name}`}
        type={f.type ?? 'text'}
        placeholder={f.placeholder}
        className="mv-input"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
