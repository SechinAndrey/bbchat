# План: Фото-редактор в фотоотчётах

## Что делаем

1. Меняем поведение заполненных слотов — клик открывает просмотр/редактор, X — удаляет
2. Новый компонент `PhotoViewerEditorModal.vue` — fullscreen просмотр + встроенный редактор
3. Новый composable `usePhotoEditor.ts` — вся логика Fabric.js, изолированно

---

## Зависимости

Fabric.js ещё не установлен в проекте.

TODO: refactor - align install instructions with the repository package manager workflow and verify whether separate Fabric typings are actually required.

```bash
npm install fabric
npm install -D @types/fabric
```

> Версия: fabric@7.x (API совпадает с photo-editor.js из смежного проекта — там явно указан 7.x)

---

## Архитектура

```
src/features/photo-reports/
  modals/
    SurfaceCard.vue              ← изменить (X-кнопка, новое событие openPhoto)
    SurfacePhotoMapper.vue       ← изменить (обработка openPhoto, сохранение отредактированного)
    PhotoViewerEditorModal.vue   ← новый компонент
  composables/
    usePhotoEditor.ts            ← новый composable (Fabric.js логика)
```

---

## 1. `usePhotoEditor.ts` — composable с Fabric.js логикой

**Что делает:** инкапсулирует всю работу с Fabric.js. Не знает ничего о Vue-компонентах, модалках, слотах. Портируется в любой проект.

### Публичный интерфейс

```typescript
const {
  // Инициализация / очистка
  initCanvas, // (el: HTMLCanvasElement, imageUrl: string) => Promise<void>
  dispose, // () => void

  // Управление режимом
  setMode, // (mode: 'select' | 'blur' | 'mosaic') => void

  // Настройки кисти
  setBrushSize, // (size: number) => void
  setBrushShape, // (shape: 'circle' | 'square') => void

  // История
  undo, // () => void

  // Результат
  getResultBlob, // () => Promise<Blob>

  // Реактивное состояние для UI
  currentMode, // Ref<'select' | 'blur' | 'mosaic'>
  brushSize, // Ref<number>
  brushShape, // Ref<'circle' | 'square'>
  canUndo, // ComputedRef<boolean>
  isReady, // Ref<boolean>
} = usePhotoEditor();
```

### Логика (адаптация из photo-editor.js)

**Инициализация:**

- `fabric.Image.fromURL(imageUrl)` → устанавливаем как `canvas.backgroundImage`
- Создаём `canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)`
- Слушаем `path:created` для применения эффекта
- Touch events: Fabric обрабатывает автоматически через `enableTouchScroll`

**Blur / Mosaic (ключевая логика из photo-editor.js, строки 515–561):**

1. Нарисованный path → рендерим в `StaticCanvas` как маску
2. Загружаем оригинал, применяем `fabric.filters.Blur` или `fabric.filters.Pixelate`
3. Добавляем `fabric.filters.BlendImage({ image: maskImg, mode: 'mask' })`
4. Результат — новый слой поверх фона

**Undo:**

- Перед каждым применением эффекта: `undoStack.push(JSON.stringify(canvas.toJSON()))`
- `undo()`: pop → `canvas.loadFromJSON()` → `renderAll()`
- Лимит: 20 состояний

**getResultBlob:**

- `canvas.discardActiveObject()` → `canvas.renderAll()`
- `canvas.toDataURL({ format: 'jpeg', quality: 0.85 })`
- Конвертируем dataURL → Blob через fetch

---

## 2. `PhotoViewerEditorModal.vue` — новый компонент

**Внешне:** fullscreen, тёмный фон (как `SimpleMediaModal`). `SimpleMediaModal` остаётся нетронутым.

TODO: refactor - this plan assumes a standalone fullscreen modal instead of reusing the shared modal primitives and behavior from src/ui.

### Props / Emits

```typescript
props: {
  open: boolean
  imageUrl: string
  editable?: boolean   // показывать ли кнопку "Редагувати"
}

emits: {
  close: []
  saved: [blob: Blob]  // после сохранения в редакторе
}
```

### Состояния

```
viewing  →  (нажали "Редагувати")  →  editing
editing  →  (Зберегти)             →  emit('saved', blob) + close
editing  →  (Скасувати)            →  dispose canvas → viewing
```

### Layout в режиме `viewing`

```
[тёмный overlay на весь экран]
  [X кнопка — правый верхний угол]
  [img — центр, max 90vw/85vh, object-contain]
  [кнопка "Редагувати" — правый нижний угол, если editable]
```

### Layout в режиме `editing`

```
[тёмный overlay на весь экран]
  [X / Скасувати — правый верхний угол]
  [canvas — центр, такой же размер как img был]
  [тулбар снизу — поверх canvas]:
    [◎ Блюр] [▦ Мозаика]  |  Розмір: [----o----]  |  [⬤ Round] [■ Square]  |  [↶ Відмінити]  |  [Зберегти]
```

### Мобильный тулбар

На мобильном тулбар занимает всю ширину, иконки крупнее (min 44px touch target). Canvas занимает оставшуюся высоту после тулбара.

### Важные детали

- Canvas инициализируется только при переходе в `editing` (не при открытии модала)
- При переходе `editing → viewing` — `dispose()`, canvas уничтожается
- `Escape` закрывает модал только в режиме `viewing`; в `editing` → возвращает в `viewing`
- Кнопка "Зберегти" активна всегда в режиме editing (можно сохранить без изменений)

---

## 3. Изменения в `SurfaceCard.vue`

### Новое событие

```typescript
emits: {
  // ... существующие
  openPhoto: [boardId: number, slotType: PhotoSlotType, photoUrl: string]  // НОВОЕ
}
```

### Изменение клика на слот

**Было** (строка 233):

```html
@click="!readonly && emit('slotClick', board.board_id, slotType)"
```

**Станет:**

```html
@click="!readonly && (slotAssignments[slotType] ? emit('openPhoto',
board.board_id, slotType, slotAssignments[slotType]!.photo_url) :
emit('slotClick', board.board_id, slotType))"
```

### X-кнопка: hover на десктопе, всегда видна на мобайл

Удаляем текущий hover-overlay (строки 253–266).  
Добавляем постоянную X-кнопку в угол:

```html
<!-- X кнопка удаления -->
<button
  v-if="slotAssignments[slotType] && !readonly"
  class="absolute top-1 right-1 z-10
         text-white drop-shadow
         md:opacity-0 md:group-hover:opacity-100
         opacity-100
         transition-opacity touch-manipulation
         p-0.5"
  @click.stop="emit('clearSlot', board.board_id, slotType)"
>
  <XCircleIcon class="w-5 h-5" />
</button>
```

> `touch-manipulation` — убирает 300ms задержку на мобильных  
> `p-0.5` + `w-5 h-5` = область 24px, достаточно для тапа (иконка + padding)

---

## 4. Изменения в `SurfacePhotoMapper.vue`

TODO: refactor - this plan keeps expanding SurfacePhotoMapper responsibilities instead of splitting editor-specific orchestration into smaller feature units.

### Новое состояние для редактора

```typescript
const editorOpen = ref(false);
const editorPhotoUrl = ref("");
const editorBoardId = ref<number>(0);
const editorSlotType = ref<PhotoSlotType>("near");
const editorEditable = ref(false);
```

### Обработчик openPhoto

```typescript
const handleOpenPhoto = (
  boardId: number,
  slotType: PhotoSlotType,
  photoUrl: string,
) => {
  editorBoardId.value = boardId;
  editorSlotType.value = slotType;
  editorPhotoUrl.value = photoUrl;
  editorEditable.value = !props.readonly;
  editorOpen.value = true;
};
```

### Обработчик сохранения отредактированного фото

```typescript
const handleEditorSaved = async (blob: Blob) => {
  const file = new File([blob], `edited_${Date.now()}.jpeg`, {
    type: "image/jpeg",
  });
  const url = URL.createObjectURL(file);

  // Добавляем в localPhotos — чтобы getChangedSlots() нашёл File для upload
  localPhotos.value = [
    ...localPhotos.value,
    {
      url,
      thumbnail: url,
      messageId: -(Date.now() + Math.floor(Math.random() * 1e6)),
      file,
    },
  ];

  // Обновляем assignment — modified-статус проставится автоматически через slotStatusMap
  const map = new Map(assignments.value);
  const key = assignmentKey(editorBoardId.value, editorSlotType.value);
  const existing = map.get(key);
  map.set(key, {
    type: existing?.type ?? editorSlotType.value,
    photo_url: url,
  });
  assignments.value = map;

  editorOpen.value = false;
};
```

### В template: добавить компонент и новое событие

```html
<!-- В SurfaceCard добавить @open-photo -->
<SurfaceCard ... @open-photo="handleOpenPhoto" />

<!-- Добавить компонент редактора -->
<PhotoViewerEditorModal
  :open="editorOpen"
  :image-url="editorPhotoUrl"
  :editable="editorEditable"
  @close="editorOpen = false"
  @saved="handleEditorSaved"
/>
```

---

## Порядок реализации

| #   | Шаг                                                                         | Файл           | Зависит от |
| --- | --------------------------------------------------------------------------- | -------------- | ---------- |
| 1   | Установить Fabric.js                                                        | `package.json` | —          |
| 2   | Написать `usePhotoEditor.ts`                                                | новый          | Fabric.js  |
| 3   | Написать `PhotoViewerEditorModal.vue` (режим `viewing` без редактора)       | новый          | —          |
| 4   | Добавить режим `editing` в `PhotoViewerEditorModal.vue`                     | новый          | шаг 2      |
| 5   | Изменить X-кнопку в `SurfaceCard.vue`                                       | существующий   | —          |
| 6   | Добавить событие `openPhoto` в `SurfaceCard.vue`                            | существующий   | —          |
| 7   | Добавить `handleOpenPhoto` + `handleEditorSaved` в `SurfacePhotoMapper.vue` | существующий   | шаги 3, 4  |
| 8   | Подключить `PhotoViewerEditorModal` в `SurfacePhotoMapper.vue`              | существующий   | шаг 7      |

---

## Риски и решения

| Риск                                                                          | Решение                                                                                           |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| CORS при загрузке фото с внешнего URL в Fabric                                | `fabric.Image.fromURL(url, { crossOrigin: 'anonymous' })` — уже используется в photo-editor.js    |
| Blob URL после редактирования не отзывается                                   | Отзывать в `onBeforeUnmount` SurfacePhotoMapper (уже есть паттерн с `localPhotos`)                |
| Canvas size на мобильном — изображение может быть огромным                    | Масштабировать canvas до `min(imageWidth, window.innerWidth * 0.95)` сохраняя aspect ratio        |
| Touch events на canvas — Fabric поддерживает, но может конфликтовать с scroll | Блокировать `touch-action: none` на canvas-элементе во время рисования                            |
| Fabric.js bundle size (+300KB)                                                | Lazy import: `const { Canvas } = await import('fabric')` — грузится только при открытии редактора |

---

## Что НЕ трогаем

- `SimpleMediaModal.vue` — остаётся без изменений
- `AssignPhotoReportModal.vue` — без изменений (event bus `photoreport:open-imgs-modal` остаётся для других превью)
- `PhotoSlotPicker.vue` — без изменений
- Вся логика `getChangedSlots()`, `slotStatusMap`, upload — без изменений
