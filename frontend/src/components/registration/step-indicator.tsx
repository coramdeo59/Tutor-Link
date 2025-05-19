import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

export function StepIndicator({ steps, currentStep }: { steps: { id: string; name: string }[]; currentStep: number }) {
  return (
    <nav aria-label="Progress" className="mb-10">
      <ol role="list" className="flex items-center">
        {steps.map((step, index) => (
          <li key={step.id} className={cn(index !== steps.length - 1 ? "flex-1" : "", "relative")}>
            {index < currentStep ? (
              <div className="group flex w-full flex-col items-center">
                <span className="flex h-10 items-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </span>
                </span>
                <span className="mt-2 text-sm font-medium text-amber-600">{step.name}</span>
              </div>
            ) : index === currentStep ? (
              <div className="flex w-full flex-col items-center">
                <span className="flex h-10 items-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-500 bg-white text-amber-600 font-medium">
                    {index + 1}
                  </span>
                </span>
                <span className="mt-2 text-sm font-medium text-amber-600">{step.name}</span>
              </div>
            ) : (
              <div className="group flex w-full flex-col items-center">
                <span className="flex h-10 items-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-500">
                    {index + 1}
                  </span>
                </span>
                <span className="mt-2 text-sm font-medium text-slate-500">{step.name}</span>
              </div>
            )}
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-0 top-5 -ml-px h-0.5 w-full",
                  index < currentStep ? "bg-amber-500" : "bg-slate-300",
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
