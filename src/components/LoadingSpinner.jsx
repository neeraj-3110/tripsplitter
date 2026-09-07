export default function EmptyState({
  icon = '✦',
  title,
  subtitle,
  action
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white px-6 py-12 text-center shadow-card md:px-10 md:py-16">

      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-50 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-orange-50 blur-3xl" />

      {/* Main content */}
      <div className="relative mx-auto max-w-lg">

        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-50 to-orange-50 shadow-sm">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-brand-600 shadow-sm">
            {icon}
          </div>

        </div>

        {/* Heading */}
        <h2 className="mt-7 text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">
          {title}
        </h2>

        {/* Description */}
        {subtitle && (
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-500 md:text-base">
            {subtitle}
          </p>
        )}

        {/* Action */}
        {action && (
          <div className="mt-7 flex justify-center">
            {action}
          </div>
        )}

        {/* Small supporting message */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-ink-400">
          <span className="h-px w-8 bg-ink-100" />

          <span>
            Travel together. Split smarter.
          </span>

          <span className="h-px w-8 bg-ink-100" />
        </div>

      </div>

    </div>
  )
}