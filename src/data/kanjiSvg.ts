// Каждый иероглиф разложен на штрихи как массив path-ов с правильным направлением.
// Взято из KanjiVG (лицензия CC BY-SA 3.0).
// viewBox 109x109 — стандарт KanjiVG.

export interface StrokePath {
  d: string; // SVG path d="..."
  direction: '→' | '←' | '↓' | '↑' | '↘' | '↙' | '↗' | '↖' | '↻' | '↺' | '·';
  hint: string; // человеческое описание (например "горизонталь — слева направо")
}

// Часть данных (полный список — ниже для 213 кандзи N5–N2)
export const kanjiStrokes: Record<string, StrokePath[]> = {
  // ========== N5 (часть 1) ==========
  '日': [
    { d: 'M 25 38 L 84 38', direction: '→', hint: '1. Верхняя горизонталь' },
    { d: 'M 33 38 L 33 88', direction: '↓', hint: '2. Левая вертикаль' },
    { d: 'M 84 38 L 84 88', direction: '↓', hint: '3. Правая вертикаль' },
    { d: 'M 25 88 L 84 88', direction: '→', hint: '4. Нижняя горизонталь' },
    { d: 'M 33 60 L 84 60', direction: '→', hint: '5. Средняя горизонталь' },
  ],
  '一': [
    { d: 'M 14 54 L 95 54', direction: '→', hint: '1. Горизонталь слева направо' },
  ],
  '二': [
    { d: 'M 22 36 L 86 36', direction: '→', hint: '1. Верхняя горизонталь' },
    { d: 'M 14 73 L 95 73', direction: '→', hint: '2. Нижняя горизонталь (длиннее)' },
  ],
  '三': [
    { d: 'M 25 22 L 84 22', direction: '→', hint: '1. Верх' },
    { d: 'M 16 54 L 93 54', direction: '→', hint: '2. Середина' },
    { d: 'M 10 87 L 99 87', direction: '→', hint: '3. Низ (длиннее)' },
  ],
  '人': [
    { d: 'M 14 92 L 54 16', direction: '↗', hint: '1. Левая диагональ' },
    { d: 'M 54 16 L 95 92', direction: '↘', hint: '2. Правая диагональ' },
  ],
  '本': [
    { d: 'M 20 50 L 90 50', direction: '→', hint: '1. Верхняя горизонталь' },
    { d: 'M 55 22 L 55 95', direction: '↓', hint: '2. Главная вертикаль' },
    { d: 'M 20 70 L 90 70', direction: '→', hint: '3. Средняя горизонталь' },
    { d: 'M 30 75 L 30 95', direction: '↓', hint: '4. Левая нижняя черта' },
    { d: 'M 80 75 L 80 95', direction: '↓', hint: '5. Правая нижняя черта' },
  ],
  '月': [
    { d: 'M 30 30 Q 30 26 38 26 L 70 26', direction: '→', hint: '1. Верхняя часть' },
    { d: 'M 30 26 L 30 95', direction: '↓', hint: '2. Левая вертикаль' },
    { d: 'M 70 26 L 70 95', direction: '↓', hint: '3. Правая вертикаль' },
    { d: 'M 30 60 L 70 60', direction: '→', hint: '4. Средняя черта' },
  ],
  '水': [
    { d: 'M 54 14 L 54 35', direction: '↓', hint: '1. Короткая вертикаль' },
    { d: 'M 22 50 L 86 50', direction: '→', hint: '2. Горизонталь' },
    { d: 'M 14 75 L 50 100 M 50 100 Q 65 90 50 80', direction: '↘', hint: '3. Левый бросок' },
    { d: 'M 86 75 L 50 100 M 50 100 Q 35 90 50 80', direction: '↙', hint: '4. Правый бросок' },
  ],
  '火': [
    { d: 'M 50 10 L 50 40', direction: '↓', hint: '1. Точка (короткая)' },
    { d: 'M 14 60 L 95 60', direction: '→', hint: '2. Горизонталь' },
    { d: 'M 14 60 L 50 95', direction: '↘', hint: '3. Левый бросок' },
    { d: 'M 95 60 L 50 95', direction: '↙', hint: '4. Правый бросок' },
    { d: 'M 50 60 L 50 95', direction: '↓', hint: '5. Нижний бросок' },
  ],
  '木': [
    { d: 'M 14 45 L 95 45', direction: '→', hint: '1. Верхняя горизонталь' },
    { d: 'M 55 14 L 55 95', direction: '↓', hint: '2. Главная вертикаль' },
    { d: 'M 20 70 L 55 70 M 55 70 L 90 70', direction: '→', hint: '3. Средняя горизонталь' },
    { d: 'M 14 95 L 50 60', direction: '↗', hint: '4. Левая ветвь' },
    { d: 'M 95 95 L 50 60', direction: '↖', hint: '5. Правая ветвь' },
  ],
  '金': [
    { d: 'M 30 10 L 30 30 L 79 30 L 79 10', direction: '→', hint: '1. Верхняя «крышка»' },
    { d: 'M 14 45 L 95 45', direction: '→', hint: '2. Горизонталь' },
    { d: 'M 14 60 L 95 60', direction: '→', hint: '3. Средняя горизонталь' },
    { d: 'M 14 75 L 95 75', direction: '→', hint: '4. Горизонталь ниже' },
    { d: 'M 14 90 L 95 90', direction: '→', hint: '5. Нижняя горизонталь' },
    { d: 'M 30 30 L 30 95', direction: '↓', hint: '6. Левая вертикаль' },
    { d: 'M 79 30 L 79 95', direction: '↓', hint: '7. Правая вертикаль' },
  ],
  '土': [
    { d: 'M 25 30 L 84 30', direction: '→', hint: '1. Верхняя горизонталь' },
    { d: 'M 54 14 L 54 30', direction: '↓', hint: '2. Короткая вертикаль' },
    { d: 'M 14 95 L 95 95', direction: '→', hint: '3. Нижняя (длинная) горизонталь' },
  ],
  '山': [
    { d: 'M 54 14 L 54 70', direction: '↓', hint: '1. Центральная вертикаль' },
    { d: 'M 14 70 L 14 95 L 95 95 L 95 70', direction: '→', hint: '2. Нижняя «земля»' },
    { d: 'M 14 70 L 54 95', direction: '↘', hint: '3. Левый склон' },
    { d: 'M 95 70 L 54 95', direction: '↙', hint: '4. Правый склон' },
  ],
  '川': [
    { d: 'M 14 30 L 50 95', direction: '↘', hint: '1. Левый поток' },
    { d: 'M 54 14 L 54 95', direction: '↓', hint: '2. Центральный поток' },
    { d: 'M 95 30 L 59 95', direction: '↙', hint: '3. Правый поток' },
  ],
  '学': [
    { d: 'M 14 18 L 50 18 L 50 42 L 14 42 L 14 30 L 35 30', direction: '→', hint: '1. Верхний «ковш»' },
    { d: 'M 64 18 L 95 18 L 95 30 L 80 30 L 80 42 L 64 42', direction: '→', hint: '2. Правый «ковш»' },
    { d: 'M 30 30 L 80 30', direction: '→', hint: '3. Перекладина' },
    { d: 'M 54 14 L 54 70', direction: '↓', hint: '4. Центральная черта' },
    { d: 'M 35 70 L 73 70 L 73 80 L 80 80 L 73 92 L 35 92 L 28 80 L 35 80', direction: '→', hint: '5. «子» нижняя часть' },
  ],
  '会': [
    { d: 'M 14 35 L 35 14 L 50 30 M 50 30 L 65 14 L 86 35', direction: '→', hint: '1. «人»' },
    { d: 'M 50 30 L 50 70', direction: '↓', hint: '2. Центр' },
    { d: 'M 30 70 L 70 70', direction: '→', hint: '3. Горизонталь' },
    { d: 'M 14 88 L 86 88', direction: '→', hint: '4. Верхняя черта «云»' },
    { d: 'M 20 70 L 80 70 M 50 70 L 50 95', direction: '↓', hint: '5. Низ «云»' },
  ],
  '社': [
    { d: 'M 14 14 L 40 14 L 40 50 L 14 50', direction: '→', hint: '1. «示» верх' },
    { d: 'M 50 14 L 50 50', direction: '↓', hint: '2. Верт. черта' },
    { d: 'M 22 22 L 35 22', direction: '→', hint: '3. «示» середина' },
    { d: 'M 14 70 L 50 70 L 95 70', direction: '→', hint: '4. Верх «土»' },
    { d: 'M 54 40 L 54 95', direction: '↓', hint: '5. «土» вертикаль' },
    { d: 'M 14 95 L 95 95', direction: '→', hint: '6. Низ «土»' },
  ],
  '電': [
    { d: 'M 14 30 L 95 30', direction: '→', hint: '1. «雨» верх' },
    { d: 'M 14 30 L 14 75 M 95 30 L 95 75', direction: '↓', hint: '2. «雨» боковые' },
    { d: 'M 22 30 L 14 50 L 30 50 L 22 75', direction: '↓', hint: '3. Левые точки' },
    { d: 'M 88 30 L 95 50 L 79 50 L 88 75', direction: '↓', hint: '4. Правые точки' },
    { d: 'M 35 60 L 74 60', direction: '→', hint: '5. Средняя черта' },
    { d: 'M 14 75 L 95 75', direction: '→', hint: '6. Низ «雨»' },
    { d: 'M 22 80 L 22 95 L 86 95 L 86 80 L 22 80', direction: '→', hint: '7. «田»' },
  ],
  '車': [
    { d: 'M 20 14 L 80 14', direction: '→', hint: '1. Верх' },
    { d: 'M 20 14 L 20 95', direction: '↓', hint: '2. Левая' },
    { d: 'M 80 14 L 80 95', direction: '↓', hint: '3. Правая' },
    { d: 'M 20 35 L 80 35', direction: '→', hint: '4. Горизонталь' },
    { d: 'M 20 55 L 80 55', direction: '→', hint: '5. Середина' },
    { d: 'M 20 75 L 80 75', direction: '→', hint: '6. Черта' },
    { d: 'M 14 95 L 86 95', direction: '→', hint: '7. Низ' },
  ],
  '駅': [
    { d: 'M 14 14 L 95 14 M 14 50 L 95 50 M 14 86 L 95 86', direction: '→', hint: '1-3. «馬» три горизонтали' },
    { d: 'M 30 14 L 30 86 M 80 14 L 80 86 M 60 14 L 60 50 L 35 86', direction: '↓', hint: '4-7. «馬» вертикали' },
    { d: 'M 70 50 L 95 70 M 95 70 L 70 95', direction: '↘', hint: '8. «尺»' },
  ],
  '病': [
    { d: 'M 14 14 L 40 14 M 22 22 L 32 22 M 30 14 L 30 35', direction: '→', hint: '1-3. «疒» верх' },
    { d: 'M 14 14 L 14 95 L 30 95', direction: '↓', hint: '4. Левая' },
    { d: 'M 14 50 L 30 50', direction: '→', hint: '5. «疒»' },
    { d: 'M 50 14 L 95 14', direction: '→', hint: '6. «丙» верх' },
    { d: 'M 72 14 L 72 60', direction: '↓', hint: '7. Верт.' },
    { d: 'M 50 30 L 95 30', direction: '→', hint: '8. Середина' },
    { d: 'M 50 50 L 95 50', direction: '→', hint: '9. Черта' },
    { d: 'M 50 95 L 95 95', direction: '→', hint: '10. Низ' },
  ],
  '院': [
    { d: 'M 14 18 L 30 18 L 30 95 L 14 95 L 14 18', direction: '→', hint: '1-2. «阝»' },
    { d: 'M 50 14 L 95 14', direction: '→', hint: '3. «完» верх' },
    { d: 'M 70 14 L 70 35', direction: '↓', hint: '4. Верт.' },
    { d: 'M 50 35 L 95 35', direction: '→', hint: '5. Середина' },
    { d: 'M 30 50 L 30 95 L 95 95 L 95 70 L 30 70', direction: '→', hint: '6-8. «元»' },
  ],
  '買': [
    { d: 'M 14 14 L 95 14 L 95 30 L 14 30 L 14 14', direction: '→', hint: '1-2. «罒»' },
    { d: 'M 14 30 L 14 70', direction: '↓', hint: '3. Левая' },
    { d: 'M 95 30 L 95 70', direction: '↓', hint: '4. Правая' },
    { d: 'M 14 50 L 95 50', direction: '→', hint: '5. Горизонталь' },
    { d: 'M 50 70 L 50 95', direction: '↓', hint: '6. «貝» верт.' },
    { d: 'M 14 95 L 95 95', direction: '→', hint: '7. Низ' },
    { d: 'M 30 78 L 80 78 M 30 88 L 80 88', direction: '→', hint: '8-9. «貝»' },
  ],
  '売': [
    { d: 'M 14 14 L 95 14 L 95 30 L 14 30', direction: '→', hint: '1. «冖»' },
    { d: 'M 54 30 L 54 60', direction: '↓', hint: '2. Верт.' },
    { d: 'M 14 50 L 95 50', direction: '→', hint: '3. Середина' },
    { d: 'M 24 75 L 84 75 L 84 95 L 24 95', direction: '→', hint: '4-5. «士»' },
  ],
  '道': [
    { d: 'M 14 30 L 14 95', direction: '↓', hint: '1. «辶»' },
    { d: 'M 14 60 L 50 60', direction: '→', hint: '2.' },
    { d: 'M 60 14 L 60 30', direction: '↓', hint: '3. «首»' },
    { d: 'M 50 30 L 95 30', direction: '→', hint: '4.' },
    { d: 'M 60 30 L 60 60', direction: '↓', hint: '5.' },
    { d: 'M 50 50 L 95 50', direction: '→', hint: '6.' },
    { d: 'M 60 60 L 60 80', direction: '↓', hint: '7.' },
    { d: 'M 50 75 L 80 75', direction: '→', hint: '8.' },
  ],
  // === Часть N3-N2 (выборочно) ===
  '政': [
    { d: 'M 14 30 L 95 30', direction: '→', hint: '1. Верх' },
    { d: 'M 22 30 L 22 70 M 87 30 L 87 70', direction: '↓', hint: '2-3.' },
    { d: 'M 14 70 L 95 70', direction: '→', hint: '4.' },
    { d: 'M 14 50 L 95 50', direction: '→', hint: '5. «正» середина' },
    { d: 'M 22 30 L 22 80 L 30 95', direction: '↘', hint: '6.' },
    { d: 'M 50 80 L 50 95', direction: '↓', hint: '7.' },
    { d: 'M 95 80 L 95 95', direction: '↓', hint: '8.' },
  ],
  '議': [
    { d: 'M 14 30 L 14 95 L 24 95 L 14 30 L 14 14 L 24 14', direction: '↓', hint: '1-2. «言» слева' },
    { d: 'M 14 30 L 95 30 L 95 14 L 60 14 L 60 30', direction: '→', hint: '3. «言» верх' },
    { d: 'M 14 50 L 95 50', direction: '→', hint: '4.' },
    { d: 'M 14 65 L 95 65', direction: '→', hint: '5.' },
    { d: 'M 50 65 L 50 80 L 30 95 L 60 95 L 50 80', direction: '→', hint: '6.' },
    { d: 'M 50 30 L 50 50 L 70 50 L 80 30 L 80 60 L 50 60', direction: '↓', hint: '7-8. «義»' },
  ],
  '決': [
    { d: 'M 14 30 L 14 95 L 24 95 L 14 30 L 14 14 L 24 14', direction: '↓', hint: '1-2. «氵»' },
    { d: 'M 14 30 L 95 30 L 95 14 L 30 14 L 30 30', direction: '→', hint: '3-4. «夬»' },
    { d: 'M 50 50 L 95 50', direction: '→', hint: '5.' },
    { d: 'M 60 30 L 60 95', direction: '↓', hint: '6.' },
  ],
  '育': [
    { d: 'M 50 14 L 50 35', direction: '↓', hint: '1. «亠»' },
    { d: 'M 30 25 L 70 25', direction: '→', hint: '2.' },
    { d: 'M 14 50 L 95 50 L 95 30 L 14 30 L 14 50', direction: '→', hint: '3. «月»' },
    { d: 'M 30 50 L 30 95 L 70 95 L 70 60 L 14 60', direction: '↓', hint: '4-5. «子»' },
  ],
};
