import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, Code2, FileText, BookOpen, Wrench, ChevronLeft, ChevronRight, type LucideIcon, RotateCcw } from 'lucide-react';
import type { Course, Lesson, FinalQuiz, FinalTask, Difficulty } from '../data/types';
import { CodeBlock } from './CodeBlock';
import { InlineQuiz } from './InlineQuiz';
import { CodeEditor } from './CodeEditor';

interface LessonViewProps {
  lesson: Lesson;
  course: Course;
  onBack: () => void;
  onComplete: (score: number) => void;
  onReset: () => void;
}

type Phase = 'stages' | 'quiz' | 'tasks' | 'done';

const STAGE_TABS: { id: Phase; label: string; icon: LucideIcon }[] = [
  { id: 'stages', label: 'Этапы', icon: BookOpen },
  { id: 'quiz', label: 'Тест', icon: FileText },
  { id: 'tasks', label: 'Практика', icon: Wrench },
];

// ============================================================================
// LocalStorage: прогресс по этапам урока
// ============================================================================
// Формат: { [lessonId]: { [stageId]: { completed: boolean, score: number, attempts: number } } }
// Хранится per-user. Сервер хранит только итог (lesson completed + score).

const STORAGE_KEY = 'japan_stage_progress_v1';

function loadStageProgress(): Record<string, Record<string, { completed: boolean; score: number; attempts: number }>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStageProgress(p: Record<string, Record<string, { completed: boolean; score: number; attempts: number }>>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /<(b|strong|i|em|code)>(.*?)<\/\1>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tag = m[1].toLowerCase();
    const c = m[2];
    if (tag === 'b' || tag === 'strong')
      parts.push(
        <b key={k++} className="text-pink-200">
          {c}
        </b>,
      );
    else if (tag === 'i' || tag === 'em')
      parts.push(
        <i key={k++}>
          {c}
        </i>,
      );
    else if (tag === 'code')
      parts.push(
        <code key={k++} className="text-pink-300 bg-pink-400/10 px-1">
          {c}
        </code>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function LessonView({ lesson, course, onBack, onComplete, onReset }: LessonViewProps) {
  const [phase, setPhase] = useState<Phase>('stages');
  const [stageIdx, setStageIdx] = useState(0);
  const [stageProgress, setStageProgress] = useState<Record<string, { completed: boolean; score: number; attempts: number }>>(() => {
    const all = loadStageProgress();
    return all[lesson.id] ?? {};
  });
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizMistakes, setQuizMistakes] = useState(0);
  const [, setShowHintForStage] = useState<string | null>(null);

  // сбрасываем при смене урока
  useEffect(() => {
    setStageIdx(0);
    setQuizIdx(0);
    setQuizMistakes(0);
    setShowHintForStage(null);
    setPhase('stages');
    const all = loadStageProgress();
    setStageProgress(all[lesson.id] ?? {});
  }, [lesson.id]);

  const stage = lesson.stages[stageIdx];
  const total = lesson.stages.length;

  // Сохраняем прогресс по этапам
  const updateStageProgress = useCallback(
    (stageId: string, patch: Partial<{ completed: boolean; score: number; attempts: number }>) => {
      setStageProgress((prev) => {
        const cur = prev[stageId] ?? { completed: false, score: 0, attempts: 0 };
        const next = { ...cur, ...patch };
        const allProgress = loadStageProgress();
        allProgress[lesson.id] = { ...prev, [stageId]: next };
        saveStageProgress(allProgress);
        return { ...prev, [stageId]: next };
      });
    },
    [lesson.id],
  );

  // Переход к следующему этапу при правильном ответе на тест
  const onStageSuccess = useCallback(() => {
    if (stage) {
      updateStageProgress(stage.id, { completed: true, score: 100 });
    }
    setTimeout(() => {
      if (stageIdx + 1 < total) {
        setStageIdx((i) => i + 1);
        setShowHintForStage(null);
      } else {
        // Все этапы пройдены — переходим к финальному тесту
        setPhase('quiz');
      }
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id, stageIdx, total, updateStageProgress]);

  // Кнопка "Вперёд" — пользователь сам решает пройти этап
  const onStageNext = useCallback(() => {
    if (stage && !stageProgress[stage.id]?.completed) {
      // Помечаем как пройденное (пропуск теста, если он был)
      updateStageProgress(stage.id, { completed: true, score: stage.question || stage.codeTask ? 50 : 100 });
    }
    if (stageIdx + 1 < total) {
      setStageIdx((i) => i + 1);
      setShowHintForStage(null);
    } else {
      setPhase('quiz');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id, stageIdx, total, stageProgress, updateStageProgress]);

  const onStagePrev = useCallback(() => {
    if (stageIdx > 0) {
      setStageIdx((i) => i - 1);
      setShowHintForStage(null);
    }
  }, [stageIdx]);

  const onQuizSuccess = useCallback(() => {
    setTimeout(() => {
      if (quizIdx + 1 < lesson.finalQuiz.length) {
        setQuizIdx((i) => i + 1);
      } else {
        const totalQuestions = lesson.finalQuiz.length || 1;
        const correct = totalQuestions - quizMistakes;
        const score = Math.max(0, Math.round((correct / totalQuestions) * 100));
        onComplete(score);
        setPhase('tasks');
      }
    }, 600);
  }, [quizIdx, quizMistakes, lesson.finalQuiz.length, onComplete]);

  const completedStages = useMemo(
    () => Object.values(stageProgress).filter((s) => s.completed).length,
    [stageProgress],
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-pink-300 text-xs uppercase tracking-widest hover:text-pink-200"
      >
        ← К курсу
      </button>

      <div className="border-2 border-pink-400 p-4 bg-gradient-to-br from-pink-400/10 to-transparent">
        <div className="flex items-center gap-2 text-pink-300 text-xs uppercase tracking-widest flex-wrap">
          <span>{course.icon}</span>
          <span>{course.shortName}</span>
          <span className="ml-auto">{lesson.estimatedMinutes} мин</span>
        </div>
        <h2 className="text-2xl font-bold neon-text mt-1">{lesson.title}</h2>
        <p className="text-pink-100/80 text-sm mt-1">{lesson.shortDesc}</p>
        {phase === 'stages' && (
          <div className="mt-2 text-[10px] uppercase tracking-widest text-pink-300/70">
            Прогресс: {completedStages} / {total} этапов
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border border-pink-400/30">
        {STAGE_TABS.map((t) => {
          const Icon = t.icon;
          const active = phase === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setPhase(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-widest font-bold transition ${
                active ? 'bg-pink-400 text-black' : 'text-pink-300 hover:text-pink-200 hover:bg-pink-400/10'
              }`}
            >
              <Icon size={12} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {phase === 'stages' && stage && (
        <div className="space-y-3">
          <div className="border border-pink-400/30 p-4">
            <div className="flex items-center gap-2 text-pink-300 text-xs uppercase tracking-widest mb-2 flex-wrap">
              <span>
                Этап {stageIdx + 1} / {total}
              </span>
              <span className="ml-auto">{stage.title}</span>
              {stageProgress[stage.id]?.completed && (
                <span className="ml-2 text-emerald-300">✓</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-pink-100 mb-2">{stage.title}</h3>
            <div className="prose-lesson space-y-1">
              {stage.theory.split('\n').map((line, i) => {
                if (line.startsWith('•') || line.startsWith('-'))
                  return (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-pink-400 shrink-0">▸</span>
                      <span>{formatInline(line.replace(/^[•-]\s*/, ''))}</span>
                    </div>
                  );
                if (line.trim() === '') return <div key={i} className="h-1" />;
                return <p key={i} className="text-sm">{formatInline(line)}</p>;
              })}
            </div>
          </div>

          {stage.code && (
            <div className="border border-pink-400/30">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-pink-400/30 text-pink-300 text-xs uppercase tracking-widest">
                <Code2 size={12} /> Пример
              </div>
              <CodeBlock code={stage.code} language={stage.language ?? 'japanese'} />
            </div>
          )}

          {/* Тест/задание — отображаются пока не пройдены */}
          {stage.question && !stageProgress[stage.id]?.completed && (
            <InlineQuiz question={stage.question} onSuccess={onStageSuccess} />
          )}
          {stage.codeTask && !stageProgress[stage.id]?.completed && (
            <CodeEditor task={stage.codeTask} onSuccess={onStageSuccess} />
          )}

          {/* Сообщение об успехе, если тест пройден */}
          {stageProgress[stage.id]?.completed && (stage.question || stage.codeTask) && (
            <div className="border-2 border-emerald-500 bg-emerald-500/10 p-3 text-center text-emerald-200 text-sm uppercase tracking-widest font-bold">
              ✓ Этап пройден
              {stageProgress[stage.id]?.score !== undefined && stageProgress[stage.id]!.score < 100 && (
                <span className="ml-2 text-xs normal-case tracking-normal">
                  (баллов: {stageProgress[stage.id]?.score})
                </span>
              )}
            </div>
          )}

          {/* Навигация Вперёд/Назад — ГЛАВНАЯ КНОПКА */}
          <div className="flex items-center justify-between gap-2 border-t border-pink-400/30 pt-3">
            <button
              type="button"
              onClick={onStagePrev}
              disabled={stageIdx === 0}
              className="neon-btn-light flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Назад
            </button>
            <div className="text-[10px] uppercase tracking-widest text-pink-300/60 text-center">
              {stageIdx + 1} / {total}
            </div>
            <button
              type="button"
              onClick={onStageNext}
              className="neon-btn flex items-center gap-2"
            >
              {stageIdx + 1 < total ? (
                <>
                  Вперёд <ChevronRight size={14} />
                </>
              ) : (
                <>
                  К тесту <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>

          {/* Прогресс-бар */}
          <div className="flex gap-1">
            {lesson.stages.map((s, i) => {
              const isDone = !!stageProgress[s.id]?.completed;
              const isCurrent = i === stageIdx;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStageIdx(i)}
                  className={`flex-1 h-2 transition ${
                    isDone
                      ? 'bg-emerald-500'
                      : isCurrent
                        ? 'bg-pink-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`${i + 1}. ${s.title}${isDone ? ' ✓' : ''}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="space-y-3">
          {lesson.finalQuiz.length === 0 ? (
            <>
              <div className="border border-pink-400/30 p-4 text-center text-pink-300/70 text-sm">
                Финальный тест для этого урока пока не добавлен. Можно сразу перейти к практике.
              </div>
              <button
                type="button"
                onClick={() => setPhase('tasks')}
                className="neon-btn w-full"
              >
                Перейти к практике →
              </button>
            </>
          ) : (
            <>
              <QuizView
                question={lesson.finalQuiz[quizIdx]}
                idx={quizIdx}
                total={lesson.finalQuiz.length}
                onSuccess={onQuizSuccess}
                onMistake={() => setQuizMistakes((m) => m + 1)}
              />
              <div className="flex justify-between gap-2 border-t border-pink-400/30 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (quizIdx > 0) setQuizIdx((i) => i - 1);
                    else setPhase('stages');
                  }}
                  className="neon-btn-light flex items-center gap-2"
                >
                  <ChevronLeft size={14} /> Назад
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (quizIdx + 1 < lesson.finalQuiz.length) {
                      setQuizIdx((i) => i + 1);
                    } else {
                      const totalQ = lesson.finalQuiz.length || 1;
                      const correct = totalQ - quizMistakes;
                      const score = Math.max(0, Math.round((correct / totalQ) * 100));
                      onComplete(score);
                      setPhase('tasks');
                    }
                  }}
                  className="neon-btn flex items-center gap-2"
                >
                  Пропустить <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {phase === 'tasks' && (
        <div className="space-y-3">
          <div className="border border-pink-400/30 p-4">
            <h3 className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-1">▸ Практические задания</h3>
            <p className="text-pink-100/80 text-sm">
              Напиши от руки или в редакторе. Когда готов — завершай урок.
            </p>
          </div>
          {lesson.finalTasks.length === 0 ? (
            <div className="border border-pink-400/30 p-4 text-center text-pink-300/70 text-sm">
              Для этого урока практические задания пока не добавлены. Можно завершить.
            </div>
          ) : (
            lesson.finalTasks.map((t, i) => <TaskCard key={i} task={t} index={i} />)
          )}

          <div className="border-2 border-pink-400 p-4 bg-gradient-to-br from-pink-400/10 to-transparent text-center space-y-3">
            <p className="text-pink-200 text-sm">Готов завершить урок?</p>
            <div className="flex justify-center gap-2">
              <button type="button" onClick={() => onComplete(100)} className="neon-btn flex items-center gap-2">
                <Check size={14} /> Завершить
              </button>
              <button type="button" onClick={onReset} className="neon-btn-light flex items-center gap-2">
                <RotateCcw size={14} /> Сбросить прогресс
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPhase('stages')}
              className="text-pink-300/70 text-xs uppercase tracking-widest hover:text-pink-200"
            >
              ← Вернуться к этапам
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="border-2 border-emerald-500 bg-emerald-500/10 p-6 text-center space-y-2">
          <Check size={32} className="mx-auto text-emerald-300" />
          <h3 className="text-xl font-bold text-emerald-200">Урок завершён!</h3>
          <p className="text-emerald-100/80 text-sm">Прогресс сохранён на сервере.</p>
          <button type="button" onClick={onBack} className="neon-btn mt-2">
            Вернуться к урокам
          </button>
        </div>
      )}
    </div>
  );
}

function QuizView({
  question,
  idx,
  total,
  onSuccess,
  onMistake,
}: {
  question: FinalQuiz;
  idx: number;
  total: number;
  onSuccess: () => void;
  onMistake: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const handle = (i: number) => {
    if (done) return;
    setSelected(i);
    setDone(true);
    if (i === question.correct) {
      setTimeout(onSuccess, 700);
    } else {
      onMistake();
    }
  };
  return (
    <div className="border border-pink-400/30 p-4">
      <div className="text-pink-300 text-xs uppercase tracking-widest mb-2">
        Финальный тест: {idx + 1} / {total}
      </div>
      <p className="text-pink-100 text-sm font-semibold mb-3">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const correct = i === question.correct;
          let cls = 'border-pink-400/30 hover:border-pink-300 hover:bg-pink-400/5 text-pink-50';
          if (done && correct) cls = 'border-green-500 bg-green-500/20 text-green-200';
          else if (done && !correct) cls = 'border-pink-400/20 text-pink-100/50';
          return (
            <button
              key={i}
              type="button"
              onClick={() => handle(i)}
              disabled={done}
              className={`w-full text-left p-2.5 border ${cls} transition-all text-sm flex items-center gap-2`}
            >
              <span className="text-pink-300 font-bold w-5">{String.fromCharCode(65 + i)}.</span>
              <span className="flex-1">{opt}</span>
              {done && correct && <Check size={14} className="text-green-400" />}
            </button>
          );
        })}
      </div>
      {done && (
        <div
          className={`mt-3 border-l-4 pl-3 py-2 text-xs leading-relaxed ${
            selected === question.correct
              ? 'border-green-500 bg-green-500/10 text-green-200'
              : 'border-red-500 bg-red-500/10 text-red-200'
          }`}
        >
          {selected === question.correct ? '✓' : '✗'} {question.explanation}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, index }: { task: FinalTask; index: number }) {
  const [open, setOpen] = useState(false);
  const colors: Record<Difficulty, string> = {
    easy: 'border-green-500/60 text-green-300 bg-green-500/10',
    medium: 'border-yellow-500/60 text-yellow-300 bg-yellow-500/10',
    hard: 'border-red-500/60 text-red-300 bg-red-500/10',
  };
  const labels: Record<Difficulty, string> = {
    easy: 'ЛЁГКО',
    medium: 'СРЕДНЕ',
    hard: 'СЛОЖНО',
  };
  return (
    <div className={`border ${colors[task.difficulty]}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left p-3 flex items-center gap-2"
      >
        <span className="text-pink-300 font-bold w-6 shrink-0">{index + 1}.</span>
        <span className="flex-1 text-pink-100 text-sm font-semibold">{task.title}</span>
        <span className="text-[10px] uppercase tracking-widest">{labels[task.difficulty]}</span>
      </button>
      {open && (
        <div className="p-3 border-t border-pink-400/20 space-y-2">
          <p className="text-pink-100/80 text-sm whitespace-pre-line">{task.description}</p>
          {task.hints.length > 0 && (
            <div>
              <p className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-1">▸ Подсказки</p>
              <ol className="list-decimal pl-5 space-y-0.5 text-pink-100/70 text-sm">
                {task.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ol>
            </div>
          )}
          {task.solution && (
            <details>
              <summary className="text-pink-300 text-xs uppercase tracking-widest font-bold cursor-pointer">
                ▸ Решение
              </summary>
              <pre className="mt-2 p-2 bg-black/40 text-pink-100 text-xs whitespace-pre-wrap">{task.solution}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
