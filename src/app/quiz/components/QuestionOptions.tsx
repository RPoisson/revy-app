//revy-quiz/quiz/components/QuestionOptions.tsx

"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { Question, Option } from "@/questions";
import type { QuizAnswers } from "@/app/quiz/lib/answersStore";

function qtyKey(optionId: string) {
  return `rooms_qty_${optionId}`;
}

const COUNTABLE_ROOM_IDS = new Set<string>([
  "guest_bath",
  "powder",
  "secondary_bath",
  "kids_bath",
  "nursery_bedroom",
  "child_bedroom",
  "teen_bedroom",
]);

const QTY_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7_plus", label: "7+" },
];

export default function QuestionOptions({
  question,
  selected,
  onSelect,
  answers,
  onAnswersChange,
}: {
  question: Question;
  selected: string[];
  onSelect: (q: Question, optionId: string) => void;
  answers: QuizAnswers;
  onAnswersChange?: React.Dispatch<React.SetStateAction<QuizAnswers>>;
}) {
  const isExterior = question.id === "home_exterior_style";

  const visibleOptions = useMemo(() => {
    return question.options.filter((opt) =>
      opt.showIf ? opt.showIf(answers) : true
    );
  }, [question.options, answers]);

  const isDisabled = (opt: Option) =>
    opt.disabledIf ? opt.disabledIf(answers) : false;

  const handleClick = (opt: Option) => {
    if (isDisabled(opt)) return;
    onSelect(question, opt.id);
  };

  // If a question has at least one image, force a consistent tile grid (except exterior uses its own grid).
  const hasImages = visibleOptions.some((opt) => !!opt.imageUrl);
  const useTileGrid = hasImages && !isExterior;

  /**
   * Layout:
   * - Exterior: small landscape tiles, 3-up
   * - All other image questions: consistent portrait tiles, 2-up mobile / 3-up desktop
   * - Text-only questions: stack (fallback)
   */
  const baseLayoutClasses = isExterior
    ? "grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3"
    : useTileGrid
      ? "grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3"
      : "flex flex-col gap-3 md:gap-4";

  // ──────────────────────────────────────────────────────────────
  // Special handling: Color Mood → split into Recommended vs Not best fit
  // ──────────────────────────────────────────────────────────────
  if (question.id === "color_mood") {
    const recommended = visibleOptions.filter((o) => !isDisabled(o));
    const notBestFit = visibleOptions.filter((o) => isDisabled(o));

    return (
      <div className="space-y-6">
        {/* Recommended */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-900">
            Recommended palettes
          </h3>
          <p className="text-sm text-black/70 leading-relaxed">
            These options are the strongest match for the home’s character and
            the overall direction of this project.
          </p>

          <div className={baseLayoutClasses}>
            {recommended.map((opt) => (
              <OptionTile
                key={opt.id}
                opt={opt}
                isExterior={false}
                isActive={selected.includes(opt.id)}
                disabled={false}
                onClick={() => handleClick(opt)}
                showReason={false}
                reason=""
                allowMultiple={question.allowMultiple}
                questionId={question.id}
                // ✅ counts not used here
                showQty={false}
                qtyValue=""
                onQtyChange={() => {}}
              />
            ))}
          </div>
        </div>

        {/* Not the best fit */}
        {notBestFit.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Not the best fit for this project
            </h3>
            <p className="text-sm text-black/70 leading-relaxed">
              These palettes can be beautiful, but they’re less likely to feel
              cohesive with the exterior character and the direction of this
              project.
            </p>

            <div className={baseLayoutClasses}>
              {notBestFit.map((opt) => (
                <OptionTile
                  key={opt.id}
                  opt={opt}
                  isExterior={false}
                  isActive={false}
                  disabled={true}
                  onClick={() => {}}
                  showReason={true}
                  reason={opt.disabledReason ? opt.disabledReason(answers) : ""}
                  allowMultiple={question.allowMultiple}
                  questionId={question.id}
                  // ✅ counts not used here
                  showQty={false}
                  qtyValue=""
                  onQtyChange={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Helpers for inline qty dropdowns (rooms only)
  const showInlineQty = question.id === "rooms" && !!onAnswersChange;

  const getQty = (optionId: string) => {
    const v = answers[qtyKey(optionId)]?.[0];
    return typeof v === "string" ? v : "";
  };

  const setQty = (optionId: string, value: string) => {
    if (!onAnswersChange) return;
    onAnswersChange((prev) => {
      const key = qtyKey(optionId);
      if (!value) {
        const { [key]: _, ...rest } = prev as any;
        return rest as QuizAnswers;
      }
      return { ...prev, [key]: [value] };
    });
  };

  // ──────────────────────────────────────────────────────────────
  // Default rendering for all other questions
  // ──────────────────────────────────────────────────────────────
  return (
    <div className={baseLayoutClasses}>
      {visibleOptions.map((opt: Option) => {
        const isActive = selected.includes(opt.id);
        const disabled = isDisabled(opt);

        const needsQty =
          showInlineQty && COUNTABLE_ROOM_IDS.has(opt.id) && isActive;

        return (
          <OptionTile
            key={opt.id}
            opt={opt}
            isExterior={isExterior}
            isActive={isActive}
            disabled={disabled}
            onClick={() => handleClick(opt)}
            showReason={disabled}
            reason={
              disabled && opt.disabledReason ? opt.disabledReason(answers) : ""
            }
            allowMultiple={question.allowMultiple}
            questionId={question.id}
            // ✅ inline qty dropdown support
            showQty={needsQty}
            qtyValue={needsQty ? getQty(opt.id) : ""}
            onQtyChange={(v) => setQty(opt.id, v)}
          />
        );
      })}
    </div>
  );
}

function OptionTile({
  opt,
  isExterior,
  isActive,
  disabled,
  onClick,
  showReason,
  reason,
  allowMultiple,
  questionId,
  showQty,
  qtyValue,
  onQtyChange,
}: {
  opt: Option;
  isExterior: boolean;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
  showReason: boolean;
  reason?: string;
  allowMultiple: boolean;
  questionId: string;

  // ✅ inline qty dropdown
  showQty: boolean;
  qtyValue: string;
  onQtyChange: (v: string) => void;
}) {
  // Aspect ratios:
  // - Exterior images are 1536x1024 => 3:2
  // - All other image questions: consistent portrait tiles (2:3)
  const aspectClass = isExterior ? "aspect-[3/2]" : opt.imageUrl ? "aspect-[2/3]" : "";

  return (
    <button
      type="button"
      key={opt.id}
      aria-disabled={disabled}
      onClick={onClick}
      className={[
        "relative overflow-hidden rounded-xl bg-white shadow-sm text-left transition",
        isActive ? "ring-2 ring-black" : "hover:shadow-md",
        disabled ? "opacity-60 cursor-not-allowed hover:shadow-sm" : "",
      ].join(" ")}
    >
      {opt.imageUrl && (
        <div className={`relative w-full ${aspectClass}`}>
          <Image
            src={opt.imageUrl}
            alt={opt.label}
            fill
            sizes={
              isExterior
                ? "(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 22vw"
                : "(max-width: 768px) 50vw, 33vw"
            }
            className={["object-cover", disabled ? "grayscale-[20%]" : ""].join(" ")}
            // Only prioritize the first question for perf.
            priority={isExterior}
          />
        </div>
      )}

      <div className={opt.imageUrl ? "p-2" : "p-3"}>
        {/* Label row + inline qty dropdown */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs md:text-sm font-[var(--font-playfair)] text-black">
            {opt.label}
          </p>

          {showQty ? (
            <select
              value={qtyValue}
              onChange={(e) => onQtyChange(e.target.value)}
              onClick={(e) => e.stopPropagation()} // prevent toggling when interacting with select
              className={[
                "shrink-0 rounded-lg border border-black/20 bg-white px-2 py-1",
                "text-[11px] md:text-xs text-black/80",
                "focus:outline-none focus:ring-2 focus:ring-black/20",
              ].join(" ")}
              aria-label={`Count for ${opt.label}`}
            >
              <option value="">Count…</option>
              {QTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {opt.subtitle && (
          <p className="mt-0.5 text-[11px] md:text-xs text-black/60">
            {opt.subtitle}
          </p>
        )}

        {showReason && reason && (
          <p className="mt-1 text-[11px] md:text-xs text-black/60 leading-relaxed">
            {reason}
          </p>
        )}

        {/* ✅ If qty dropdown is shown but empty, show a gentle hint */}
        {showQty && !qtyValue ? (
          <p className="mt-1 text-[11px] md:text-xs text-black/60">
            Select a count to continue.
          </p>
        ) : null}
      </div>

      {/* ✅ Removed: multi-select checkmark badge entirely (you said no checkmark) */}
    </button>
  );
}
